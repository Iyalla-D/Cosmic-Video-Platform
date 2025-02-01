import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import * as THREE from 'three';
import VideoSolarSystem from './VideoSolarSystem';

const GALAXY_CONFIG = {
  starsCount: 100000,
  starsSize: 0.01,
  radius: 20,
  categories: [
    { name: 'Sports', position: new THREE.Vector3(0, 0, 0) },
    { name: 'Music', position: new THREE.Vector3(30, 0, 0) },
    { name: 'Gaming', position: new THREE.Vector3(-30, 0, 0) },
    { name: 'Education', position: new THREE.Vector3(0, 0, 30) }
  ]
};

export default function Galaxy() {
  const pointsRef = useRef();
  const { camera } = useThree();

  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(GALAXY_CONFIG.starsCount * 3);
    const colors = new Float32Array(GALAXY_CONFIG.starsCount * 3);

    for (let i = 0; i < GALAXY_CONFIG.starsCount; i++) {
      const i3 = i * 3;
      const radius = Math.random() * GALAXY_CONFIG.radius;
      const angle = Math.random() * Math.PI * 2;

      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = (Math.random() - 0.5) * 2;
      positions[i3 + 2] = Math.sin(angle) * radius;

      colors[i3] = 1;
      colors[i3 + 1] = 1;
      colors[i3 + 2] = 1;
    }

    return [positions, colors];
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0001;
    }
  });

  camera.position.set(0, 20, 50);

  return (
    <>
      <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <group>
        <points ref={pointsRef}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={positions.length / 3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute
              attach="attributes-color"
              count={colors.length / 3}
              array={colors}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            size={GALAXY_CONFIG.starsSize}
            sizeAttenuation={true}
            vertexColors
            transparent
            opacity={0.8}
          />
        </points>

        {GALAXY_CONFIG.categories.map((category) => (
          <VideoSolarSystem
            key={category.name}
            position={category.position}
            category={category.name}
          />
        ))}
      </group>

      <OrbitControls 
        enableZoom
        enablePan
        enableRotate
        zoomSpeed={0.6}
        rotateSpeed={0.4}
        maxDistance={100}
        minDistance={5}
      />
    </>
  );
}