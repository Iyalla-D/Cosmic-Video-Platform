
import { useRef, useEffect } from 'react';
import { Text, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

const Planet = ({ label, position, onComplete }) => {
  const groupRef = useRef();
  const sphereRef = useRef();

  useEffect(() => {
    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <>
      <Stars radius={300} depth={60} count={10000} factor={7} saturation={0} fade />
      <group ref={groupRef} position={position}>
        <mesh ref={sphereRef}>
          <sphereGeometry args={[0.5, 32, 32]} />
          <meshStandardMaterial 
            color="gold" 
            metalness={0.8} 
            roughness={0.2}
            normalScale={new THREE.Vector2(0.15, 0.15)} 
          />
        </mesh>
        <Text
          position={[0, 1, 0]}
          color="white"
          fontSize={0.3}
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
        <OrbitControls 
          enableZoom
          enablePan
          enableRotate
          zoomSpeed={0.6}
          rotateSpeed={0.4}
          maxDistance={50}
          minDistance={1}
        />
      </group>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
    </>
  );
};

export default Planet;
