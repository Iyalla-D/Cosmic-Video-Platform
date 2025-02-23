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
  insideColor: "#ff6030",
  outsideColor: "#391eb9",
};

export default function Galaxy() {
  const pointsRef = useRef();
  const orbitControlsRef = useRef();
  const { camera } = useThree();
  const hasUserInteracted = useRef(false);
  const navigate = useNavigate();

  // Galaxy generation
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(PARAMS.count * 3);
    const colors = new Float32Array(PARAMS.count * 3);
    const colorInside = new THREE.Color(PARAMS.insideColor);
    const colorOutside = new THREE.Color(PARAMS.outsideColor);

    for (let i = 0; i < PARAMS.count; i++) {
      const i3 = i * 3;
      const branchAngle =
        ((i % PARAMS.branches) / PARAMS.branches) * Math.PI * 2;
      const radius =
        Math.pow(Math.random(), PARAMS.randomnessPower) * PARAMS.radius;
      const spin = radius * PARAMS.spin;

      const randomX =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? -1 : 1) *
        PARAMS.randomness *
        radius;
      const randomY =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? -1 : 1) *
        PARAMS.randomness *
        radius;
      const randomZ =
        Math.pow(Math.random(), PARAMS.randomnessPower) *
        (Math.random() < 0.5 ? -1 : 1) *
        PARAMS.randomness *
        radius;

      positions[i3] = Math.cos(branchAngle + spin) * radius + randomX;
      positions[i3 + 1] = randomY;
      positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ;

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

      {/* Clickable Marker */}
      <mesh
        position={markerPosition}
        onClick={() => {
          // Optionally, you can perform a camera transition here before navigation.
          navigate("/solarsystem");
        }}
        // Change the cursor on hover
        onPointerOver={(e) => (document.body.style.cursor = "pointer")}
        onPointerOut={(e) => (document.body.style.cursor = "auto")}
      >
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="red"
          emissive="red"
          emissiveIntensity={0.7}
        />
      </mesh>
    </>
  );
}
