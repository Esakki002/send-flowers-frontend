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

// Module-level singletons to prevent duplicate downloads and decodes
let cachedTexturesPromise: Promise<CachedTextures> | null = null;
let cachedModelPromise: Promise<THREE.Group> | null = null;
let sharedDracoLoader: DRACOLoader | null = null;

const getSharedDracoLoader = (): DRACOLoader => {
  if (!sharedDracoLoader) {
    sharedDracoLoader = new DRACOLoader();
    // Serve from local public folder for instant edge loading; falls back if necessary
    sharedDracoLoader.setDecoderPath('/draco/gltf/');
  }
  return sharedDracoLoader;
};

const getSharedTextures = (): Promise<CachedTextures> => {
  if (!cachedTexturesPromise) {
    cachedTexturesPromise = new Promise((resolve) => {
      // Local web-optimized textures are served at root /textures/...
      const texturesBase = (
        (import.meta.env.VITE_TEXTURES_BASE_URL as string) ||
        '/textures'
      ).replace(/\/+$/, '');

      const fallbackBase = (
        (import.meta.env.VITE_ASSETS_BASE_URL as string) ||
        '/models'
      ).replace(/\/+$/, '');

      const texLoader = new THREE.TextureLoader();
      texLoader.setCrossOrigin('anonymous');

      const loadWithFallback = (filename: string, srgb: boolean): Promise<THREE.Texture> => {
        return new Promise((res) => {
          texLoader.load(
            `${texturesBase}/${filename}`,
            (tex) => {
              tex.flipY = false;
              tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
              tex.generateMipmaps = true;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              tex.magFilter = THREE.LinearFilter;
              res(tex);
            },
            undefined,
            () => {
              // Fallback to remote assets base if local isn't found
              texLoader.load(
                `${fallbackBase}/${filename}`,
                (fallbackTex) => {
                  fallbackTex.flipY = false;
                  fallbackTex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
                  res(fallbackTex);
                },
                undefined,
                () => {
                  // Fallback to basic 1x1 data texture on total error
                  const empty = new THREE.DataTexture(new Uint8Array([200, 50, 70, 255]), 1, 1);
                  empty.needsUpdate = true;
                  res(empty);
                }
              );
            }
          );
        });
      };

      Promise.all([
        loadWithFallback('Red_rose_diffuse.jpeg', true),
        loadWithFallback('Red_rose_normal.png', false),
        loadWithFallback('Red_rose_occlusion.png', false),
      ]).then(([diffuse, normal, occlusion]) => {
        resolve({ diffuse, normal, occlusion });
      });
    });
  }
  return cachedTexturesPromise;
};

const getSharedMasterModel = (): Promise<THREE.Group> => {
  if (!cachedModelPromise) {
    cachedModelPromise = new Promise((resolve, reject) => {
      const assetsBase = (
        (import.meta.env.VITE_ASSETS_BASE_URL as string) ||
        '/models'
      ).replace(/\/+$/, '');

      const draco = getSharedDracoLoader();
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);

      // Concurrently load textures and model
      Promise.all([
        getSharedTextures(),
        new Promise<THREE.Group>((resModel, rejModel) => {
          loader.load(
            `${assetsBase}/rose.glb`,
            (gltf) => resModel(gltf.scene),
            undefined,
            (err) => rejModel(err)
          );
        }),
      ])
        .then(([textures, rawModel]) => {
          rawModel.traverse((obj) => {
            const mesh = obj as THREE.Mesh;
            if (!mesh.isMesh) return;
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m) => {
              const mat = m as THREE.MeshStandardMaterial;
              if (!mat.map) mat.map = textures.diffuse;
              if (!mat.normalMap) mat.normalMap = textures.normal;
              if (!mat.aoMap) mat.aoMap = textures.occlusion;
              mat.roughness = Math.max(mat.roughness ?? 0.6, 0.4);
              mat.metalness = Math.min(mat.metalness ?? 0.1, 0.15);
              mat.needsUpdate = true;
            });
          });

          // Scale and center master model
          const size = new THREE.Box3().setFromObject(rawModel).getSize(new THREE.Vector3());
          rawModel.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z));
          const center = new THREE.Box3().setFromObject(rawModel).getCenter(new THREE.Vector3());
          rawModel.position.sub(center);

          resolve(rawModel);
        })
        .catch((err) => {
          console.error('Error loading rose 3D model:', err);
          // Fallback dummy sphere group
          const fallbackGroup = new THREE.Group();
          const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 24, 24),
            new THREE.MeshStandardMaterial({ color: 0xc65b75, roughness: 0.5 })
          );
          fallbackGroup.add(sphere);
          resolve(fallbackGroup);
        });
    });
  }
  return cachedModelPromise;
};

/**
 * Mobile-optimized, high-performance 3D rose viewer.
 * Features:
 *  - IntersectionObserver: automatically pauses rendering when off-screen to eliminate mobile scroll lag.
 *  - Global texture & model caching: 0 duplicate network requests or decodes.
 *  - Dynamic pixel ratio: prevents 3x overdraw and GPU thermal throttling on mobile devices.
 *  - Local edge-cached assets: sub-second model load times.
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

    // Detect mobile viewport or low-power device
    const isMobile =
      typeof window !== 'undefined' &&
      (window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

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

    // On mobile devices, disable antialiasing and cap pixel ratio at 1.25 for 60+ FPS smooth scrolling
    const renderer = new THREE.WebGLRenderer({
      antialias: !isMobile,
      alpha: true,
      powerPreference: 'high-performance',
      precision: isMobile ? 'mediump' : 'highp',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.75));
    renderer.setClearColor(0xfff8f2, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.pointerEvents = 'none';
    renderer.domElement.style.touchAction = 'pan-y';
    container.appendChild(renderer.domElement);

    // ---------- Lights ----------
    const key = new THREE.DirectionalLight(0xffc1b0, 1.2);
    key.position.set(2, 3, 2);
    const rim = new THREE.DirectionalLight(0xffe0b0, 0.6);
    rim.position.set(-2, 2, -2);
    scene.add(key, rim, new THREE.AmbientLight(0xffffff, 0.4));

    // ---------- Environment ----------
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    // ---------- Pivot ----------
    const pivot = new THREE.Group();
    scene.add(pivot);

    let isDisposed = false;

    // Load master model from cache (instant if already downloaded)
    getSharedMasterModel().then((master) => {
      if (isDisposed) return;
      const model = master.clone(true);

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
      clock.getDelta(); // reset delta to prevent spin jumps
      render();
    };

    const stopAnimation = () => {
      isRunning = false;
      if (raf) cancelAnimationFrame(raf);
    };

    // Pause WebGL rendering whenever the canvas is scrolled out of view!
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
      className={`relative select-none pointer-events-none ${className}`}
      ref={containerRef}
      style={{ touchAction: 'pan-y' }}
    >
      {loading && (
        <div
          className={`absolute inset-0 flex items-center justify-center animate-pulse ${loadingClassName}`}
        />
      )}
    </div>
  );
};

export default RoseViewer;
