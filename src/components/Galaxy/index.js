
import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Points, PointMaterial} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Planet from './Planet'

// Configuration parameters for the galaxy
const GALAXY_CONFIG = {
  count: 100000,
  size: 0.01,
  radius: 8,
  branches: 8,
  spin: 1.2,
  randomness: 0.2,
  randomnessPower: 3,
  colors: {
    inside: '#ff6030',
    outside: '#391eb9'
  }
}

// Camera configuration
const CAMERA_CONFIG = {
  initialPosition: new THREE.Vector3(15, 8, 15)
}

export default function Galaxy({ searchTerm }) {
  // Refs
  const pointsRef = useRef()
  const orbitControlsRef = useRef()
  const hasUserInteracted = useRef(false)
  const originalCameraPos = useRef(CAMERA_CONFIG.initialPosition)

  // State
  const [zoomState, setZoomState] = useState('idle')
  const [searchTarget, setSearchTarget] = useState(null)
  const { camera } = useThree()

  // Generate galaxy geometry
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(GALAXY_CONFIG.count * 3)
    const colors = new Float32Array(GALAXY_CONFIG.count * 3)
    const colorInside = new THREE.Color(GALAXY_CONFIG.colors.inside)
    const colorOutside = new THREE.Color(GALAXY_CONFIG.colors.outside)

    for (let i = 0; i < GALAXY_CONFIG.count; i++) {
      const i3 = i * 3
      const branchAngle = ((i % GALAXY_CONFIG.branches) / GALAXY_CONFIG.branches) * Math.PI * 2
      const radius = Math.pow(Math.random(), GALAXY_CONFIG.randomnessPower) * GALAXY_CONFIG.radius
      const spin = radius * GALAXY_CONFIG.spin

      // Calculate random offsets
      const randomOffset = {
        x: Math.pow(Math.random(), GALAXY_CONFIG.randomnessPower) * (Math.random() < 0.5 ? -1 : 1),
        y: Math.pow(Math.random(), GALAXY_CONFIG.randomnessPower) * (Math.random() < 0.5 ? -1 : 1),
        z: Math.pow(Math.random(), GALAXY_CONFIG.randomnessPower) * (Math.random() < 0.5 ? -1 : 1)
      }

      // Set positions
      positions[i3] = Math.cos(branchAngle + spin) * radius + randomOffset.x * GALAXY_CONFIG.randomness * radius
      positions[i3 + 1] = randomOffset.y * GALAXY_CONFIG.randomness * radius
      positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomOffset.z * GALAXY_CONFIG.randomness * radius

      // Set colors
      const mixedColor = colorInside.clone().lerp(colorOutside, radius / GALAXY_CONFIG.radius)
      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    return [positions, colors]
  }, [])

  // Handle search term changes
  useEffect(() => {
    if (!searchTerm) return

    // Generate a random position in the galaxy
    const angle = Math.random() * Math.PI * 2
    const radius = Math.random() * GALAXY_CONFIG.radius * 0.8 + GALAXY_CONFIG.radius * 0.2
    const randomPosition = new THREE.Vector3(
      Math.cos(angle) * radius,
      (Math.random() - 0.5) * 2,
      Math.sin(angle) * radius
    )

    setSearchTarget({
      position: randomPosition,
      label: searchTerm
    })
    setZoomState('zooming-in')
    hasUserInteracted.current = true
  }, [searchTerm])

  // Animation frame updates
  useFrame((state, delta) => {
    // Galaxy rotation
    if (zoomState === 'idle' && pointsRef.current) {
      pointsRef.current.rotation.y += 0.0002
    }

    // Camera animations
    if (zoomState === 'zooming-in' && searchTarget) {
      const targetPosition = searchTarget.position.clone()
        .add(new THREE.Vector3(2, 1, 2).normalize().multiplyScalar(3))

      camera.position.lerp(targetPosition, delta * 1.5)
      camera.lookAt(searchTarget.position)
      
      if (camera.position.distanceTo(targetPosition) < 0.1) {
        setZoomState('zoomed')
      }
    }

    if (zoomState === 'zooming-out') {
      camera.position.lerp(originalCameraPos.current, delta * 1.5)
      camera.lookAt(new THREE.Vector3(0, 0, 0))
      
      if (camera.position.distanceTo(originalCameraPos.current) < 0.1) {
        setZoomState('idle')
        setSearchTarget(null)
      }
    }

    // Initial camera positioning
    if (!hasUserInteracted.current) {
      camera.position.lerp(originalCameraPos.current, delta)
      camera.lookAt(0, 0, 0)
    }
  })

  const handlePlanetComplete = () => {
    setZoomState('zooming-out')
  }

  return (
    <>
      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom 
          intensity={zoomState !== 'idle' ? 1.5 : 0.5} 
          kernelSize={3}
          luminanceThreshold={0.5}
        />
      </EffectComposer>

      {/* Scene setup */}
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      
      {/* Galaxy visualization */}
      {zoomState === 'idle' && (
        <>
          <Stars radius={300} depth={60} count={8000} factor={6} saturation={0} fade />
          <group>
            <Points ref={pointsRef} positions={positions} colors={colors}>
              <PointMaterial
                transparent
                size={GALAXY_CONFIG.size}
                sizeAttenuation={true}
                depthWrite={false}
                vertexColors
                blending={THREE.AdditiveBlending}
              />
            </Points>
          </group>
        </>
      )}
      
      {/* Search result planet */}
      {searchTarget && (
        <Planet
          label={searchTarget.label}
          position={searchTarget.position}
          onComplete={handlePlanetComplete}
        />
      )}

      {/* Controls */}
      <OrbitControls
        ref={orbitControlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={50}
        enabled={zoomState === 'idle'}
        onStart={() => hasUserInteracted.current = true}
        mouseButtons={{
          LEFT: THREE.MOUSE.ROTATE,
          MIDDLE: THREE.MOUSE.PAN,
          RIGHT: THREE.MOUSE.PAN
        }}
      />
    </>
  )
}
