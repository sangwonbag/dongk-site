import React, { useRef, Suspense } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

function PanoramaSphere({ url }) {
  const texture = useLoader(THREE.TextureLoader, url);
  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

export default function ApartmentScene({ autoRotate, onUserInteraction }) {
  const controlsRef = useRef();

  const handleStart = () => {
    if (onUserInteraction) onUserInteraction(true);
  };

  const handleEnd = () => {
    if (onUserInteraction) onUserInteraction(false);
  };

  return (
    <Canvas
      camera={{ position: [0, 0, 0.1], fov: 70 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={1.5} />
      <Suspense fallback={null}>
        <PanoramaSphere url="/images/panorama_bg.png" />
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enableZoom={true}
        enablePan={false}
        minDistance={0.1}
        maxDistance={10}
        minPolarAngle={Math.PI / 2.5} // Prevent looking directly at ceiling
        maxPolarAngle={Math.PI / 1.5} // Prevent looking directly at floor
        autoRotate={autoRotate}
        autoRotateSpeed={0.4}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </Canvas>
  );
}
