
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import VideoPlanet from './VideoPlanet';

const MOCK_VIDEOS = {
  Sports: [
    { id: 'sports-1', title: 'Amazing Basketball Shots', views: 1000 },
    { id: 'sports-2', title: 'Soccer Highlights 2023', views: 2000 },
    { id: 'sports-3', title: 'Tennis Masters Final', views: 1500 },
  ],
  Gaming: [
    { id: 'gaming-1', title: 'Minecraft Build Battle', views: 3000 },
    { id: 'gaming-2', title: 'Fortnite Victory', views: 2500 },
    { id: 'gaming-3', title: 'League of Legends Pro Play', views: 4000 },
  ],
  Music: [
    { id: 'music-1', title: 'Summer Hits Mix', views: 5000 },
    { id: 'music-2', title: 'Rock Classics', views: 3500 },
    { id: 'music-3', title: 'Jazz Night', views: 2000 },
  ],
};

const VideoSolarSystem = ({ position, category }) => {
  const groupRef = useRef();
  
  const planets = useMemo(() => {
    const categoryVideos = MOCK_VIDEOS[category] || [];
    return categoryVideos.map((video, i) => ({
      id: video.id,
      orbit: (i + 2) * 1.5,  // Reduced orbit radius
      rotationSpeed: 0.001 / (i + 1),
      size: 0.2 + Math.random() * 0.1,  // Much smaller planets
      videoData: video
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
            videoData={planet.videoData}
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
