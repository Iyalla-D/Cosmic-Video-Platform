import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Points, PointMaterial} from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Planet from './Planet';

const PARAMS = {
  count: 100000,
  size: 0.01,
  radius: 8,
  branches: 8,
  spin: 1.2,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: '#ff6030',
  outsideColor: '#391eb9'
}

export default function Galaxy({ searchTerm }) {
  const pointsRef = useRef()
  const orbitControlsRef = useRef()
  const { camera } = useThree()
  const hasUserInteracted = useRef(false)
  const originalCameraPos = useRef(new THREE.Vector3(15, 8, 15))
  const [zoomState, setZoomState] = useState('idle')
  const [searchTarget, setSearchTarget] = useState(null)

  // Galaxy generation (moved to proper position)
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(PARAMS.count * 3)
    const colors = new Float32Array(PARAMS.count * 3)
    const colorInside = new THREE.Color(PARAMS.insideColor)
    const colorOutside = new THREE.Color(PARAMS.outsideColor)

    for (let i = 0; i < PARAMS.count; i++) {
      const i3 = i * 3
      const branchAngle = ((i % PARAMS.branches) / PARAMS.branches) * Math.PI * 2
      const radius = Math.pow(Math.random(), PARAMS.randomnessPower) * PARAMS.radius
      const spin = radius * PARAMS.spin

      const randomX = Math.pow(Math.random(), PARAMS.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.randomness * radius
      const randomY = Math.pow(Math.random(), PARAMS.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.randomness * radius
      const randomZ = Math.pow(Math.random(), PARAMS.randomnessPower) * (Math.random() < 0.5 ? -1 : 1) * PARAMS.randomness * radius

      positions[i3] = Math.cos(branchAngle + spin) * radius + randomX
      positions[i3 + 1] = randomY
      positions[i3 + 2] = Math.sin(branchAngle + spin) * radius + randomZ

      const mixedColor = colorInside.clone().lerp(colorOutside, radius / PARAMS.radius)
      colors[i3] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }

    return [positions, colors]
  }, [])

  useEffect(() => {
    if (searchTerm) {
      // Create position slightly outside galaxy for better visibility
      const randomPosition = new THREE.Vector3()
        .randomDirection()
        .multiplyScalar(PARAMS.radius * 0.8)
        .addScalar(PARAMS.radius * 0.2)

      setSearchTarget({
        position: randomPosition,
        label: searchTerm
      })
      setZoomState('zooming-in')
      hasUserInteracted.current = true
    }
  }, [searchTerm])

  useFrame((state, delta) => {
    // Handle galaxy rotation and camera movements in a single frame handler
    if (zoomState === 'idle') {
      pointsRef.current.rotation.y += 0.0005
    }

    // Handle camera animations
    if (zoomState === 'zooming-in' && searchTarget) {
      // Create offset position for better viewing angle
      const targetPosition = searchTarget.position.clone()
        .add(new THREE.Vector3(0, 1, -2).normalize().multiplyScalar(3))

      camera.position.lerp(targetPosition, delta * 2)
      camera.lookAt(searchTarget.position)
      
      if (camera.position.distanceTo(targetPosition) < 0.5) {
        setZoomState('zoomed')
      }
    }

    if (zoomState === 'zooming-out') {
      camera.position.lerp(originalCameraPos.current, delta * 2)
      camera.lookAt(0, 0, 0)
      
      if (camera.position.distanceTo(originalCameraPos.current) < 0.1) {
        setZoomState('idle')
        setSearchTarget(null)
      }
    }

    // Initial camera position handling
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
      <EffectComposer>
        <Bloom 
          intensity={zoomState !== 'idle' ? 1.5 : 0.5} 
          kernelSize={3}
          luminanceThreshold={0.5}
        />
      </EffectComposer>

      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.5} />
      
      {zoomState === 'idle' && (
        <>
          <Stars radius={300} depth={60} count={8000} factor={6} saturation={0} fade />
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
        </>
      )}
      
      {searchTarget && (
        <Planet
          label={searchTarget.label}
          position={searchTarget.position}
          onComplete={handlePlanetComplete}
        />
      )}

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