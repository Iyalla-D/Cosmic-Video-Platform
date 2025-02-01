import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

function Globe() {
  const meshRef = useRef();

  let isDragging = false;
  let previousMousePosition = { x: 0, y: 0 };

  useEffect(() => {
    const handleMouseDown = () => isDragging = true;
    const handleMouseUp = () => isDragging = false;
    const handleMouseMove = (event) => {
      if (isDragging && meshRef.current) {
        const deltaMove = {
          x: event.movementX,
          y: event.movementY
        };

        const rotationSpeed = 0.005;
        const globe = meshRef.current;
        globe.rotation.y += deltaMove.x * rotationSpeed;
        globe.rotation.x += deltaMove.y * rotationSpeed;
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[4, 16, 16]} />
      <meshStandardMaterial color="blue" wireframe/>
    </mesh>
  );
}

function App() {
  return (
    <Canvas>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <Globe />
    </Canvas>
  );
}

export default App;
