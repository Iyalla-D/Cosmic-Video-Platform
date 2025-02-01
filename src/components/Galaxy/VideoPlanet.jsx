
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useNavigate } from 'react-router-dom';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const VideoPlanet = ({ orbit, rotationSpeed, size, videoId, videoData }) => {
  const planetRef = useRef();
  const navigate = useNavigate();
  const angle = useRef(Math.random() * Math.PI * 2);

  // Create texture for video thumbnail
  const texture = new THREE.TextureLoader().load(
    `https://picsum.photos/200/200?random=${videoId}`,
    undefined,
    undefined,
    (error) => console.error('Error loading texture:', error)
  );

  useFrame(() => {
    angle.current += rotationSpeed;
    if (planetRef.current) {
      planetRef.current.position.x = Math.cos(angle.current) * orbit;
      planetRef.current.position.z = Math.sin(angle.current) * orbit;
      planetRef.current.rotation.y += 0.01;
    }
  });

  return (
    <group>
      <mesh
        ref={planetRef}
        onClick={() => navigate(`/video/${videoId}`)}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer';
          e.object.scale.multiplyScalar(1.5);
        }}
        onPointerOut={(e) => {
          document.body.style.cursor = 'default';
          e.object.scale.divideScalar(1.5);
        }}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      <Html position={[0, size + 0.5, 0]}>
        <div style={{ 
          color: 'white', 
          backgroundColor: 'rgba(0,0,0,0.5)',
          padding: '5px',
          borderRadius: '3px',
          whiteSpace: 'nowrap'
        }}>
          {videoData.title}
        </div>
      </Html>
    </group>
  );
};

export default VideoPlanet;
