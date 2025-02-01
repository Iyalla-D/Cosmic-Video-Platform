
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import VideoPlanet from './VideoPlanet';

const VideoSolarSystem = ({ position, category }) => {
  const groupRef = useRef();
  
  const planets = useMemo(() => {
    // This would come from your backend in reality
    return Array.from({ length: 5 }, (_, i) => ({
      id: `${category}-${i}`,
      orbit: (i + 2) * 2,
      rotationSpeed: 0.001 / (i + 1),
      size: 1 + Math.random() * 0.5
    }));
  }, [category]);

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.0005;
    }
  });

  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color={new THREE.Color(1, 1, 0)} emissive={new THREE.Color(1, 1, 0)} emissiveIntensity={0.5} />
      </mesh>
      
      <group ref={groupRef}>
        {planets.map((planet) => (
          <VideoPlanet
            key={planet.id}
            orbit={planet.orbit}
            rotationSpeed={planet.rotationSpeed}
            size={planet.size}
            videoId={planet.id}
          />
        ))}
      </group>

      <Text
        position={[0, 3, 0]}
        color="white"
        fontSize={1}
        anchorX="center"
        anchorY="middle"
      >
        {category}
      </Text>
    </group>
  );
};

export default VideoSolarSystem;
