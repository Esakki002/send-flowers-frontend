import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';

interface CachedTextures {
  diffuse: THREE.Texture;
  normal: THREE.Texture;
  occlusion: THREE.Texture;
}

// Module-level shared cache: loads full-quality textures & model once, reuses across views
let cachedTexturesPromise: Promise<CachedTextures> | null = null;
let cachedModelPromise: Promise<THREE.Group> | null = null;

const getSharedTextures = (assetsBase: string, maxAnisotropy: number): Promise<CachedTextures> => {
  if (!cachedTexturesPromise) {
    cachedTexturesPromise = new Promise((resolve) => {
      const texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin('anonymous');

      const prep = (url: string, srgb: boolean) => {
        const t = texLoader.load(url);
        t.flipY = false;
        t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
        t.anisotropy = maxAnisotropy;
        return t;
      };

      const diffuse = prep(`${assetsBase}/Red_rose_diffuse.jpeg`, true);
      const normal = prep(`${assetsBase}/Red_rose_normal.png`, false);
      const occlusion = prep(`${assetsBase}/Red_rose_occlusion.png`, false);

      resolve({ diffuse, normal, occlusion });
    });
  }
  return cachedTexturesPromise;
};

const getSharedMasterModel = (assetsBase: string, maxAnisotropy: number): Promise<THREE.Group> => {
  if (!cachedModelPromise) {
    cachedModelPromise = new Promise((resolve) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      getSharedTextures(assetsBase, maxAnisotropy).then((textures) => {
        loader.load(
          `${assetsBase}/rose.glb`,
          (gltf) => {
            const model = gltf.scene;

            model.traverse((obj) => {
              const mesh = obj as THREE.Mesh;
              if (!mesh.isMesh) return;
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                const mat = m as THREE.MeshStandardMaterial;
                if (!mat.map) mat.map = textures.diffuse;
                if (!mat.normalMap) mat.normalMap = textures.normal;
                if (!mat.aoMap) mat.aoMap = textures.occlusion;
                mat.needsUpdate = true;
              });
            });

            // Scale first, THEN center using bounding box
            const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
            model.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z));
            const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
            model.position.sub(center);

            resolve(model);
          },
          undefined,
          (err) => {
            console.error('Error loading rose model:', err);
            const fallbackGroup = new THREE.Group();
            fallbackGroup.add(
              new THREE.Mesh(
                new THREE.SphereGeometry(0.5, 32, 32),
                new THREE.MeshStandardMaterial({ color: 0xffc1b0 })
              )
            );
            resolve(fallbackGroup);
          }
        );
      });
    });
  }
  return cachedModelPromise;
};

/**
 * 3D Rose Viewer.
 * Visual Quality: 100% full original fidelity (full-res textures, ACES tone mapping, antialiasing, RoomEnvironment).
 * Site Performance: Automatically pauses WebGL animation when off-screen to eliminate mobile scroll lag.
 */
const RoseViewer: React.FC<{
  className?: string;
  autoRotateSpeed?: number;
  loadingClassName?: string;
}> = ({
  className = 'w-full h-full',
  autoRotateSpeed = 0.25,
  loadingClassName = 'bg-[var(--soft-pink)]',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // ---------- Scene / camera / renderer ----------
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / (container.clientHeight || 1),
      0.1,
      100
    );

    const elevation = THREE.MathUtils.degToRad(30);
    const placeCamera = (distance: number) => {
      camera.position.set(0, Math.sin(elevation) * distance, Math.cos(elevation) * distance);
      camera.lookAt(0, 0, 0);
    };
    placeCamera(4);

    // Full-quality renderer settings: pristine antialiasing, crisp pixel ratio
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x231720, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    // ---------- Lights (stay fixed while the rose rotates) ----------
    const key = new THREE.DirectionalLight(0xffc1b0, 1.2);
    key.position.set(2, 3, 2);
    const rim = new THREE.DirectionalLight(0xffe0b0, 0.6);
    rim.position.set(-2, 2, -2);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.4));

    // ---------- Environment (needed for PBR materials) ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // ---------- Pivot: the rose is centered inside it, the pivot spins ----------
    const pivot = new THREE.Group();
    scene.add(pivot);

    const assetsBase = (import.meta.env.VITE_ASSETS_BASE_URL || '/models').replace(/\/+$/, '');
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

    let isDisposed = false;

    // Load full-quality model from cache
    getSharedMasterModel(assetsBase, maxAnisotropy).then((masterModel) => {
      if (isDisposed) return;
      const model = masterModel.clone(true);

      const radius = new THREE.Box3()
        .setFromObject(model)
        .getBoundingSphere(new THREE.Sphere()).radius;
      placeCamera(radius * 2.5);

      pivot.add(model);
      setLoading(false);
    });

    // ---------- Render loop & IntersectionObserver ----------
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.2 : 1;
    const clock = new THREE.Clock();
    let raf = 0;
    let isRunning = false;
    let isIntersecting = false;

    const render = () => {
      if (!isRunning) return;
      raf = requestAnimationFrame(render);
      pivot.rotation.y += autoRotateSpeed * reduced * clock.getDelta();
      renderer.render(scene, camera);
    };

    const startAnimation = () => {
      if (isRunning) return;
      isRunning = true;
      clock.getDelta();
      render();
    };

    const stopAnimation = () => {
      isRunning = false;
      if (raf) cancelAnimationFrame(raf);
    };

    // Off-screen pause: only renders when visible, leaving scroll 100% buttery smooth
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        isIntersecting = Boolean(entry && entry.isIntersecting);
        if (isIntersecting && !document.hidden) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      {
        root: null,
        rootMargin: '100px 0px 100px 0px',
        threshold: 0,
      }
    );
    io.observe(container);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else if (isIntersecting) {
        startAnimation();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // ---------- Resize ----------
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    });
    ro.observe(container);

    // ---------- Cleanup ----------
    return () => {
      isDisposed = true;
      stopAnimation();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotateSpeed]);

  return (
    <div
      className={`relative pointer-events-none select-none ${className}`}
      ref={containerRef}
      style={{ touchAction: 'pan-y' }}
    >
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center animate-pulse ${loadingClassName}`} />
      )}
    </div>
  );
};

export default RoseViewer;
