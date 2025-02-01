import { useRef, useEffect } from 'react';
import { Text } from '@react-three/drei';

const Planet = ({ label, position, onComplete }) => {
  const groupRef = useRef();

  useEffect(() => {
    // Trigger completion callback after animation
    const timeout = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  return (
    <group ref={groupRef} position={position}>
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial color="gold" metalness={0.8} roughness={0.2} />
      </mesh>
      <Text
        position={[0, 0.5, 0]}
        color="white"
        fontSize={0.3}
        anchorX="center"
        anchorY="middle"
      >
        {label}
      </Text>
    </group>
  );
};

export default Planet;