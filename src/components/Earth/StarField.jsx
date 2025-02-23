
import { useRef, useMemo } from 'react';
import * as THREE from 'three';

export default function StarField() {
  const points = useRef();
  const positions = useMemo(() => 
    Array(5000).fill().map(() => [
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000,
      (Math.random() - 0.5) * 1000
    ]), []);

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length}
          array={new Float32Array(positions.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.5} 
        color="white" 
        transparent 
        opacity={0.8}
      />
    </points>
  );
}
