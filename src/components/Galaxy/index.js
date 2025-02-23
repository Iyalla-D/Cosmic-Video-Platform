// Galaxy.js
import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";

const PARAMS = {
  count: 100000,
  size: 0.01,
  radius: 8,
  branches: 8,
  spin: 1.2,
  randomness: 0.2,
  randomnessPower: 3,
  thickness: 2,
  insideColor: "#ff6030",
  outsideColor: "#391eb9",
};

function gaussianRandom(mean = 0, std = 1) {
  const u1 = Math.random();
  const u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * std + mean;
}

function generateSpiralPositions(count, arms, radius, thickness) {
  const positions = new Float32Array(count * 3);
  for(let i = 0; i < count; i++) {
    const i3 = i * 3;
    const branchAngle = (i % arms) * Math.PI * 2 / arms;
    const r = Math.sqrt(i / count) * radius;
    const spinAngle = r * PARAMS.spin;
    
    const randomX = Math.pow(Math.random(), PARAMS.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.randomness * r;
    const randomY = Math.pow(Math.random(), PARAMS.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.randomness * r;
    const randomZ = gaussianRandom(0, thickness);

    positions[i3] = Math.cos(branchAngle + spinAngle) * r + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * r + randomZ;
  }
  return positions;
}

export default function Galaxy() {
  const pointsRef = useRef();
  const orbitControlsRef = useRef();
  const { camera } = useThree();
  const hasUserInteracted = useRef(false);
  const navigate = useNavigate();

  // Galaxy generation
  const [positions, colors] = useMemo(() => {
    const positions = generateSpiralPositions(PARAMS.count, PARAMS.branches, PARAMS.radius, PARAMS.thickness);
    const colors = new Float32Array(PARAMS.count * 3);
    const colorInside = new THREE.Color(PARAMS.insideColor);
    const colorOutside = new THREE.Color(PARAMS.outsideColor);

    for (let i = 0; i < PARAMS.count; i++) {
      const i3 = i * 3;
      const radius = Math.sqrt(
        positions[i3] * positions[i3] + 
        positions[i3 + 2] * positions[i3 + 2]
      );
      
      const mixedColor = colorInside
        .clone()
        .lerp(colorOutside, radius / PARAMS.radius);
      colors[i3] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;
    }

    return [positions, colors];
  }, []);

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.0005; // Slow rotation
    }

    if (!hasUserInteracted.current) {
      camera.position.set(15, 8, 15);
      camera.lookAt(0, 0, 0);
    }
  });

  // Position for the clickable marker.
  // You can change these coordinates to place the marker where you prefer.
  const markerPosition = [5, 0, -5];

  return (
    <>
      <color attach="background" args={["#000"]} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />

      <Stars
        radius={300}
        depth={60}
        count={8000}
        factor={6}
        saturation={0}
        fade
      />
      <group>
        <Points ref={pointsRef} positions={positions} colors={colors}>
          <PointMaterial
            transparent
            size={PARAMS.size}
            sizeAttenuation={true}
            depthWrite={false}
            vertexColors
            blending={THREE.AdditiveBlending}
          />
        </Points>
      </group>

      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        onStart={() => (hasUserInteracted.current = true)}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN,
        }}
      />

      
    </>
  );
}
