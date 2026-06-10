import React, { useRef, Suspense, useEffect, useState } from "react";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html } from "@react-three/drei";
import * as THREE from "three";

// Definition of scenes, textures, and 3D portal hotspots
// eslint-disable-next-line react-refresh/only-export-components
export const SCENE_DATA = {
  entrance: {
    url: "/images/panorama_entrance.png",
    name: "현관 (입구)",
    hotspots: [
      { to: "living", position: [0, -0.8, -4], label: "거실로 이동" }
    ]
  },
  living: {
    url: "/images/panorama_living.png",
    name: "거실",
    hotspots: [
      { to: "entrance", position: [0.8, -0.8, 4], label: "현관으로 이동" },
      { to: "kitchen", position: [-4, -0.8, -1.2], label: "주방으로 이동" },
      { to: "bedroom", position: [3.2, -0.8, -2.8], label: "안방으로 이동" }
    ]
  },
  kitchen: {
    url: "/images/panorama_kitchen.png",
    name: "주방 / 식당",
    hotspots: [
      { to: "living", position: [4, -0.8, 1.6], label: "거실로 이동" }
    ]
  },
  bedroom: {
    url: "/images/panorama_bedroom.png",
    name: "안방",
    hotspots: [
      { to: "living", position: [-3.2, -0.8, 3.2], label: "거실로 이동" }
    ]
  }
};

function PanoramaSphere({ url }) {
  // Load texture dynamically based on the active scene URL
  const texture = useLoader(THREE.TextureLoader, url);
  
  // Set texture parameters to ensure high resolution & details
  useEffect(() => {
    if (texture) {
      // eslint-disable-next-line react-hooks/immutability
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = false;
    }
  }, [texture]);

  return (
    <mesh>
      <sphereGeometry args={[500, 60, 40]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

function Hotspot({ to, position, label, onClick }) {
  return (
    <group position={position}>
      <Html center distanceFactor={12}>
        <button 
          className="portal-hotspot" 
          onClick={(e) => {
            e.stopPropagation();
            onClick(to);
          }}
        >
          <div className="hotspot-circle">
            <div className="hotspot-pulse"></div>
          </div>
          <span className="hotspot-label">{label}</span>
        </button>
      </Html>
    </group>
  );
}

// Subcomponent inside Canvas to handle transition animations in R3F useFrame loop
function SceneAnimator({ transitionState, setTransitionState, onSceneChange, controlsRef, onUserInteraction }) {
  const { camera } = useThree();

  // Handle setting camera properties on transition state changes
  useEffect(() => {
    if (transitionState.direction === "intro") {
      // Start camera position set back along the Z-axis (towards entrance door) and wider FOV
      camera.position.set(0, -0.3, 3);
      // eslint-disable-next-line react-hooks/immutability
      camera.fov = 85;
      camera.updateProjectionMatrix();
    }
  }, [camera, transitionState.direction]);

  useFrame(() => {
    if (transitionState.direction === "intro") {
      // Lerp camera position back to the center offset
      camera.position.lerp(new THREE.Vector3(0, 0, 0.1), 0.04);
      // Lerp FOV back to normal wide-angle view
      // eslint-disable-next-line react-hooks/immutability
      camera.fov = THREE.MathUtils.lerp(camera.fov, 72, 0.04);
      camera.updateProjectionMatrix();
      
      // Complete intro when close enough
      if (camera.fov <= 72.5) {
        camera.fov = 72;
        camera.position.set(0, 0, 0.1);
        camera.updateProjectionMatrix();
        
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
        
        setTransitionState({
          to: null,
          direction: "idle",
          hotspotPos: null,
          from: null
        });
        
        // Let OrbitControls resume autoRotate
        if (onUserInteraction) onUserInteraction(false);
      }
    } else if (transitionState.direction === "zoom-in") {
      // 1. Move camera towards hotspot position
      const targetPos = transitionState.hotspotPos;
      camera.position.lerp(targetPos, 0.08);
      
      // 2. Zoom in by reducing FOV
      camera.fov = THREE.MathUtils.lerp(camera.fov, 25, 0.08);
      camera.updateProjectionMatrix();
      
      // Trigger scene switch when camera gets close enough / zoomed in
      if (camera.fov <= 28) {
        const nextScene = transitionState.to;
        const prevScene = transitionState.from;
        
        // Change the parent scene state
        onSceneChange(nextScene);
        
        // Find return hotspot in the next scene pointing back to prevScene
        const nextSceneData = SCENE_DATA[nextScene];
        const returnHs = nextSceneData?.hotspots.find(h => h.to === prevScene);
        
        let startPos = new THREE.Vector3(0, 0, 0.01);
        if (returnHs) {
          // Multiply return hotspot position by 0.7 to start the camera along the path from the doorway
          const hsPosVec = new THREE.Vector3(...returnHs.position);
          startPos.copy(hsPosVec).multiplyScalar(0.7);
        } else {
          // Fallback start position if no return hotspot found
          startPos.set(0, 0, 1.5); 
        }
        
        // Set camera position to startPos in the new scene
        camera.position.copy(startPos);
        camera.fov = 45; // Start slightly zoomed in, so it opens up to 72 (simulating moving forward)
        camera.updateProjectionMatrix();
        
        // Reset OrbitControls target
        if (controlsRef.current) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update();
        }
        
        // Start zoom-out (walk-forward) phase
        setTransitionState(prev => ({
          ...prev,
          direction: "zoom-out"
        }));
      }
    } else if (transitionState.direction === "zoom-out") {
      // Lerp camera position back to normal center offset
      camera.position.lerp(new THREE.Vector3(0, 0, 0.1), 0.08);
      
      // Lerp FOV back to normal wide-angle view
      camera.fov = THREE.MathUtils.lerp(camera.fov, 72, 0.08);
      camera.updateProjectionMatrix();
      
      // Complete transition
      if (camera.fov >= 71.5) {
        camera.fov = 72;
        camera.position.set(0, 0, 0.1);
        camera.updateProjectionMatrix();
        
        if (controlsRef.current) {
          controlsRef.current.reset();
        }
        
        setTransitionState({
          to: null,
          direction: "idle",
          hotspotPos: null,
          from: null
        });
        
        // Resume auto-rotation if applicable
        if (onUserInteraction) onUserInteraction(false);
      }
    }
  });

  return null;
}

export default function ApartmentScene({ currentScene, onSceneChange, autoRotate, onUserInteraction }) {
  const controlsRef = useRef();
  
  // Manage transition state locally
  const [transitionState, setTransitionState] = useState({
    to: null,
    direction: "intro", // Start with intro walk-in animation on mount!
    hotspotPos: null,
    from: null
  });

  const sceneInfo = SCENE_DATA[currentScene] || SCENE_DATA.entrance;

  const handleStart = () => {
    if (onUserInteraction) onUserInteraction(true);
  };

  const handleEnd = () => {
    if (onUserInteraction) onUserInteraction(false);
  };

  const handleHotspotClick = (to) => {
    if (transitionState.direction !== "idle") return; // Block double clicks

    // Find the hotspot in the active scene data to get its 3D position
    const hs = sceneInfo.hotspots.find(h => h.to === to);
    if (!hs) return;
    
    // Stop auto-rotation during transition
    if (onUserInteraction) onUserInteraction(true);
    
    setTransitionState({
      to,
      direction: "zoom-in",
      hotspotPos: new THREE.Vector3(...hs.position),
      from: currentScene
    });
  };

  // Reset controls target when currentScene changes from external source (like first load)
  useEffect(() => {
    if (controlsRef.current && transitionState.direction === "idle") {
      controlsRef.current.reset();
    }
  }, [currentScene]);

  return (
    <Canvas
      camera={{ position: [0, 0, 0.1], fov: 72 }}
      style={{ width: "100%", height: "100%" }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <ambientLight intensity={1.5} />
      
      <Suspense fallback={null}>
        <PanoramaSphere url={sceneInfo.url} />
      </Suspense>

      {/* Render 3D Portal Hotspots for the active scene */}
      {transitionState.direction === "idle" && sceneInfo.hotspots.map((hs, idx) => (
        <Hotspot 
          key={idx}
          to={hs.to}
          position={hs.position}
          label={hs.label}
          onClick={handleHotspotClick}
        />
      ))}

      {/* Transition Animator Subcomponent */}
      <SceneAnimator 
        transitionState={transitionState}
        setTransitionState={setTransitionState}
        onSceneChange={onSceneChange}
        controlsRef={controlsRef}
        onUserInteraction={onUserInteraction}
      />

      <OrbitControls
        ref={controlsRef}
        enabled={transitionState.direction === "idle"} // Disable controls during zoom transitions to prevent conflict
        enableZoom={transitionState.direction === "idle"}
        enablePan={false}
        minDistance={0.01}
        maxDistance={5}
        minPolarAngle={Math.PI / 2.6} // Prevent looking directly at ceiling
        maxPolarAngle={Math.PI / 1.45} // Prevent looking directly at floor
        autoRotate={autoRotate && transitionState.direction === "idle"}
        autoRotateSpeed={0.3}
        onStart={handleStart}
        onEnd={handleEnd}
      />
    </Canvas>
  );
}
