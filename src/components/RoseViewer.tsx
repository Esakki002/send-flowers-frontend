import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment';

// Module-level shared cache: loads full-quality model once, reuses across views
let cachedModelPromise: Promise<THREE.Group> | null = null;

const getSharedMasterModel = (assetsBase: string, maxAnisotropy: number): Promise<THREE.Group> => {
  if (!cachedModelPromise) {
    cachedModelPromise = new Promise((resolve) => {
      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/gltf/');
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
              if (mat.map) mat.map.anisotropy = Math.min(maxAnisotropy, 4);
              if (mat.normalMap) mat.normalMap.anisotropy = Math.min(maxAnisotropy, 4);
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
  interactive?: boolean;
  cameraDistanceMultiplier?: number;
}> = ({
  className = 'w-full h-full',
  autoRotateSpeed = 0.25,
  loadingClassName = 'bg-[var(--soft-pink)]',
  interactive = false,
  cameraDistanceMultiplier = 2.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // ---------- Scene / camera / renderer ----------
    const scene = new THREE.Scene();
    const initialWidth = container.clientWidth || 320;
    const initialHeight = container.clientHeight || 320;
    const camera = new THREE.PerspectiveCamera(
      45,
      initialWidth / initialHeight,
      0.1,
      100
    );

    const elevation = THREE.MathUtils.degToRad(22);
    const targetY = 0.06;
    const placeCamera = (distance: number) => {
      camera.position.set(0, targetY + Math.sin(elevation) * distance, Math.cos(elevation) * distance);
      camera.lookAt(0, targetY, 0);
    };

    let modelRadius = 0.85;

    // Dynamically calculate camera distance so model fits across Mobile, Tablet & Laptop aspect ratios
    const updateCameraDistance = (aspect: number) => {
      const vFovRad = THREE.MathUtils.degToRad(camera.fov);
      const halfFovTan = Math.tan(vFovRad / 2);
      const distV = modelRadius / halfFovTan;
      // Account for slender vertical profile of the rose (width is ~62% of height)
      const distH = (modelRadius * 0.62) / (halfFovTan * Math.max(aspect, 0.1));
      const fitDistance = Math.max(distV, distH) * (cameraDistanceMultiplier || 0.88);
      placeCamera(fitDistance);
    };

    updateCameraDistance(initialWidth / initialHeight);

    // Full-quality renderer settings: pristine antialiasing, crisp pixel ratio
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(initialWidth, initialHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x231720, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.domElement.style.pointerEvents = interactive ? 'auto' : 'none';
    renderer.domElement.style.touchAction = interactive ? 'none' : 'pan-y';
    if (interactive) {
      renderer.domElement.style.cursor = 'grab';
    }
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

      modelRadius = new THREE.Box3()
        .setFromObject(model)
        .getBoundingSphere(new THREE.Sphere()).radius || 0.85;
      updateCameraDistance(camera.aspect);

      pivot.add(model);
      setLoading(false);
      // Immediately render at least one frame so it displays instantly on mobile
      renderer.render(scene, camera);
    });

    // ---------- Interactive Drag Rotation ----------
    let isDragging = false;
    let prevPointer = { x: 0, y: 0 };
    let dragVelocityX = 0;
    let dragVelocityY = 0;

    let onPointerDown: ((e: PointerEvent) => void) | null = null;
    let onPointerMove: ((e: PointerEvent) => void) | null = null;
    let onPointerUp: ((e: PointerEvent) => void) | null = null;

    if (interactive) {
      onPointerDown = (e: PointerEvent) => {
        isDragging = true;
        prevPointer = { x: e.clientX, y: e.clientY };
        dragVelocityX = 0;
        dragVelocityY = 0;
        renderer.domElement.style.cursor = 'grabbing';
        try {
          renderer.domElement.setPointerCapture(e.pointerId);
        } catch {}
      };

      onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - prevPointer.x;
        const deltaY = e.clientY - prevPointer.y;

        dragVelocityX = deltaX * 0.007;
        dragVelocityY = deltaY * 0.007;

        pivot.rotation.y += dragVelocityX;
        pivot.rotation.x = THREE.MathUtils.clamp(
          pivot.rotation.x + dragVelocityY,
          -0.85,
          0.85
        );

        prevPointer = { x: e.clientX, y: e.clientY };
        renderer.render(scene, camera);
      };

      onPointerUp = (e: PointerEvent) => {
        if (!isDragging) return;
        isDragging = false;
        renderer.domElement.style.cursor = 'grab';
        try {
          renderer.domElement.releasePointerCapture(e.pointerId);
        } catch {}
      };

      renderer.domElement.addEventListener('pointerdown', onPointerDown);
      renderer.domElement.addEventListener('pointermove', onPointerMove);
      renderer.domElement.addEventListener('pointerup', onPointerUp);
      renderer.domElement.addEventListener('pointercancel', onPointerUp);
    }

    // ---------- Render loop & IntersectionObserver ----------
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.2 : 1;
    const clock = new THREE.Clock();
    let raf = 0;
    let isRunning = false;
    let isIntersecting = true;

    const render = () => {
      if (!isRunning) return;
      raf = requestAnimationFrame(render);
      const delta = clock.getDelta();

      if (!isDragging) {
        if (Math.abs(dragVelocityX) > 0.0001) {
          pivot.rotation.y += dragVelocityX;
          dragVelocityX *= 0.93;
        } else {
          pivot.rotation.y += autoRotateSpeed * reduced * delta;
        }

        if (Math.abs(dragVelocityY) > 0.0001) {
          pivot.rotation.x = THREE.MathUtils.clamp(
            pivot.rotation.x + dragVelocityY,
            -0.85,
            0.85
          );
          dragVelocityY *= 0.93;
        }
      }

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

    // Start animation immediately on mount so mobile doesn't wait on IO
    startAnimation();

    // Off-screen pause: pauses WebGL rendering when scrolled out of view
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
        rootMargin: '150px 0px 150px 0px',
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

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      stopAnimation();
    };
    const handleContextRestored = () => {
      startAnimation();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

    // ---------- Resize ----------
    const ro = new ResizeObserver(() => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      updateCameraDistance(w / h);
      if (!isRunning) {
        renderer.render(scene, camera);
      }
    });
    ro.observe(container);

    // ---------- Cleanup ----------
    return () => {
      isDisposed = true;
      stopAnimation();
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      if (onPointerDown && onPointerMove && onPointerUp) {
        renderer.domElement.removeEventListener('pointerdown', onPointerDown);
        renderer.domElement.removeEventListener('pointermove', onPointerMove);
        renderer.domElement.removeEventListener('pointerup', onPointerUp);
        renderer.domElement.removeEventListener('pointercancel', onPointerUp);
      }
      pmrem.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [autoRotateSpeed, interactive, cameraDistanceMultiplier]);

  return (
    <div
      className={`relative ${interactive ? 'pointer-events-auto cursor-grab active:cursor-grabbing' : 'pointer-events-none'} select-none ${className}`}
      ref={containerRef}
      style={{ touchAction: interactive ? 'none' : 'pan-y' }}
    >
      {loading && (
        <div className={`absolute inset-0 flex items-center justify-center animate-pulse ${loadingClassName}`} />
      )}
    </div>
  );
};

export default RoseViewer;
