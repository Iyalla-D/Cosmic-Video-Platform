
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export default function StarField() {
  const points = useRef();
  
  const positions = useMemo(() => {
    const temp = [];
    for (let i = 0; i < 5000; i++) {
      temp.push(
        (Math.random() - 0.5) * 800, // x
        (Math.random() - 0.5) * 800, // y
        (Math.random() - 0.5) * 800  // z
      );
    }
    return new Float32Array(temp);
  }, []);

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={1.5}
        sizeAttenuation={true}
        color="white"
        transparent
        opacity={0.8}
      />
    </points>
  );
}
