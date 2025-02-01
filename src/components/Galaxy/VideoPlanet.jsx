
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';

const VideoPlanet = ({ orbit, rotationSpeed, size, videoId }) => {
  const planetRef = useRef();
  const navigate = useNavigate();
  const angle = useRef(Math.random() * Math.PI * 2);

  useFrame(() => {
    angle.current += rotationSpeed;
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(angle.current) * orbit;
      planetRef.current.position.z = Math.sin(angle.current) * orbit;
      planetRef.current.rotation.y += 0.01;
    }
  });

  return (
    <mesh
      ref={planetRef}
      onClick={() => navigate(`/video/${videoId}`)}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color="blue" />
    </mesh>
  );
};

export default VideoPlanet;
