
import { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function useSmoothCamera(target, duration = 2) {
  const { camera } = useThree();
  const startPosition = useRef(new THREE.Vector3());
  const startTime = useRef(0);

  useFrame((state, delta) => {
    if(target) {
      if(startTime.current === 0) {
        startPosition.current.copy(camera.position);
        startTime.current = state.clock.elapsedTime;
      }

      const t = (state.clock.elapsedTime - startTime.current) / duration;
      camera.position.lerpVectors(
        startPosition.current,
        target.position.clone().add(new THREE.Vector3(0, 3, -5)),
        THREE.MathUtils.smoothstep(t, 0, 1)
      );

      camera.lookAt(target.position);
      
      if(t >= 1) {
        startTime.current = 0;
      }
    }
  });
}
