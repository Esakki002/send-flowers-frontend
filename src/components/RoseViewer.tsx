import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';

/**
 * Non-interactive 3D rose viewer (auto-rotate only).
 * Props:
 *  - className?: CSS classes for the container (e.g., width/height).
 *  - autoRotateSpeed?: rotation speed in radians per second (default 0.25).
 */
const RoseViewer: React.FC<{ className?: string; autoRotateSpeed?: number; loadingClassName?: string }> = ({
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
      container.clientWidth / container.clientHeight,
      0.1,
      100,
    );

    // Camera tilt (re-applied once the model size is known)
    const elevation = THREE.MathUtils.degToRad(30); // try 10 to 35
    const placeCamera = (distance: number) => {
      camera.position.set(
        0,
        Math.sin(elevation) * distance,
        Math.cos(elevation) * distance,
      );
      camera.lookAt(0, 0, 0);
    };
    placeCamera(4); // default until the model loads

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xfff8f2, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    // Canvas ignores all pointer/touch input (no interaction, page scrolls normally)
    renderer.domElement.style.pointerEvents = 'none';
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

    // ---------- Textures (fallback if GLB materials have no maps) ----------
    const assetsBase = (import.meta.env.VITE_ASSETS_BASE_URL || '/models').replace(/\/+$/, '');
    const texLoader = new THREE.TextureLoader();
    texLoader.setCrossOrigin('anonymous');
    const prep = (url: string, srgb: boolean) => {
      const t = texLoader.load(url);
      t.flipY = false; // glTF UV convention
      t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
      t.anisotropy = renderer.capabilities.getMaxAnisotropy();
      return t;
    };
    const diffuse = prep(`${assetsBase}/Red_rose_diffuse.jpeg`, true);
    const normal = prep(`${assetsBase}/Red_rose_normal.png`, false);
    const occlusion = prep(`${assetsBase}/Red_rose_occlusion.png`, false);

    // ---------- Model loading ----------
    const draco = new DRACOLoader();
    // Or copy node_modules/three/examples/jsm/libs/draco to public/draco/ and use '/draco/'
    draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);

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
            if (!mat.map) mat.map = diffuse;
            if (!mat.normalMap) mat.normalMap = normal;
            if (!mat.aoMap) mat.aoMap = occlusion;
            mat.needsUpdate = true;
          });
        });

        // Scale first, THEN center using the new box
        const size = new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
        model.scale.setScalar(1.5 / Math.max(size.x, size.y, size.z));
        const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
        model.position.sub(center);

        const radius = new THREE.Box3()
          .setFromObject(model)
          .getBoundingSphere(new THREE.Sphere()).radius;
        placeCamera(radius * 2.5);

        pivot.add(model);
        setLoading(false);
      },
      undefined,
      (err) => {
        console.error('Error loading rose model:', err);
        pivot.add(
          new THREE.Mesh(
            new THREE.SphereGeometry(0.5, 32, 32),
            new THREE.MeshStandardMaterial({ color: 0xffc1b0 }),
          ),
        );
        setLoading(false);
      },
    );

    // ---------- Render loop ----------
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.2 : 1;
    const clock = new THREE.Clock();
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      pivot.rotation.y += autoRotateSpeed * reduced * clock.getDelta();
      renderer.render(scene, camera);
    };
    animate();

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
      cancelAnimationFrame(raf);
      ro.disconnect();
      draco.dispose();
      [diffuse, normal, occlusion].forEach((t) => t.dispose());
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotateSpeed]);

  return (
    <div className={`relative pointer-events-none select-none ${className}`} ref={containerRef}>
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center animate-pulse ${loadingClassName}`} />
      )}
    </div>
  );
};

export default RoseViewer;