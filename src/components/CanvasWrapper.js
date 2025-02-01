import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'

export default function CanvasWrapper({ children, camera }) {
  return (
    <div className="canvas-container">
      <Canvas camera={camera}>
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  )
}