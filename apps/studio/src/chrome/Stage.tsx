import { Component as ReactComponent, useEffect, useRef, type ReactNode } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Grid, OrbitControls, Sky } from '@react-three/drei';
import * as THREE from 'three';
import { Model, selectElement, type ModelStore } from '@declit/core';

class DesignBoundary extends ReactComponent<
  { onError(message: string): void; children?: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    this.props.onError(error instanceof Error ? error.message : String(error));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Frames the whole building whenever the example changes (not on every edit).
 * Walks the scene for the design's meshes, skips the ground plane, and moves
 * the camera + orbit target to fit the bounds.
 */
function FitCamera({ fitKey, designKey }: { fitKey: string; designKey: number }) {
  const camera = useThree((s) => s.camera);
  const controls = useThree((s) => s.controls) as { target: THREE.Vector3; update(): void } | null;
  const scene = useThree((s) => s.scene);
  const lastFit = useRef<string | null>(null);

  useEffect(() => {
    if (lastFit.current === fitKey) return; // already framed this example
    const raf = requestAnimationFrame(() => {
      const box = new THREE.Box3();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (!mesh.isMesh || !mesh.geometry) return;
        mesh.geometry.computeBoundingBox();
        const bb = mesh.geometry.boundingBox;
        if (!bb) return;
        const size = bb.getSize(new THREE.Vector3());
        if (size.x > 60 || size.z > 60) return; // skip the ground plane
        box.expandByObject(mesh);
      });
      if (box.isEmpty()) return;
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      const radius = Math.max(size.x, size.y, size.z, 4);
      const d = radius * 1.15 + 4;
      camera.position.set(center.x + d, center.y + d * 0.75, center.z + d);
      camera.near = 0.1;
      camera.far = d * 8;
      camera.updateProjectionMatrix();
      if (controls) {
        controls.target.copy(center);
        controls.update();
      } else {
        camera.lookAt(center);
      }
      lastFit.current = fitKey;
    });
    return () => cancelAnimationFrame(raf);
    // re-run as the design mounts (designKey) until we've framed this fitKey
  }, [fitKey, designKey, camera, controls, scene]);

  return null;
}

export interface StageProps {
  store: ModelStore;
  /** bump to reset the error boundary after a successful recompile */
  designKey: number;
  /** identity of the current example; framing recomputes when it changes */
  fitKey: string;
  onRuntimeError(message: string): void;
  children?: ReactNode;
}

/** The given scene: sky, lights, ground, grid, camera and the model scope. */
export function Stage({ store, designKey, fitKey, onRuntimeError, children }: StageProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [22, 16, 22], fov: 42 }}
      dpr={[1, 2]}
      gl={{ logarithmicDepthBuffer: true }}
      onPointerMissed={() => selectElement(null)}
      onCreated={(state) => {
        (window as unknown as Record<string, unknown>).__declitScene = state.scene;
      }}
    >
      <Sky sunPosition={[100, 60, 40]} turbidity={4} />
      <ambientLight intensity={0.45} />
      <hemisphereLight args={['#dfeaf5', '#cbbfa8', 0.5]} />
      <directionalLight
        position={[30, 44, 20]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
        shadow-camera-near={1}
        shadow-camera-far={140}
        shadow-bias={-0.0002}
      />
      <mesh receiveShadow position={[6, -0.03, 6]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[400, 400]} />
        <meshStandardMaterial color="#dee3e7" roughness={1} />
      </mesh>
      <Grid
        position={[6, -0.01, 6]}
        args={[400, 400]}
        cellSize={1}
        sectionSize={5}
        cellColor="#c3c9d2"
        sectionColor="#a8b0bd"
        fadeDistance={120}
        infiniteGrid
      />
      <Model store={store}>
        <DesignBoundary key={designKey} onError={onRuntimeError}>
          {children}
        </DesignBoundary>
      </Model>
      <FitCamera fitKey={fitKey} designKey={designKey} />
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2 - 0.02}
        minDistance={2}
        maxDistance={220}
      />
    </Canvas>
  );
}
