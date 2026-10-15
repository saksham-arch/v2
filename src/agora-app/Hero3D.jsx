// A sculpture in a lit museum niche. It mounts when the niche comes into view,
// redraws at a modest frame budget, rests completely for reduced motion and
// falls back to a painted image when WebGL is unavailable.
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer, OrbitControls } from '@react-three/drei'
import { Box3, Vector3 } from 'three'
import FrameBudget from '../ui/FrameBudget.jsx'
import SceneBoundary from '../ui/SceneBoundary.jsx'
import { disposeModel } from '../world/agora-models.js'

const reducedQuery = () => matchMedia('(prefers-reduced-motion: reduce)')

// Scale a model so its height is `height` and its base sits on y = 0.
function fitModel(root, height) {
  root.updateMatrixWorld(true)
  const box = new Box3().setFromObject(root)
  const size = box.getSize(new Vector3())
  if (!Number.isFinite(size.y) || size.y <= 0) return
  const k = height / Math.max(size.y, size.x * 0.62)
  root.scale.multiplyScalar(k)
  root.updateMatrixWorld(true)
  const b = new Box3().setFromObject(root)
  const c = b.getCenter(new Vector3())
  root.position.x -= c.x
  root.position.z -= c.z
  root.position.y -= b.min.y
}

function Model({ make, update, height, reduced, spin }) {
  const holder = useRef()
  const model = useMemo(() => {
    const m = make()
    fitModel(m.root, height)
    return m
  }, [make, height])
  useEffect(() => () => disposeModel(model.root), [model])
  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime
    model.animate?.(t)
    update?.(model, t)
    if (spin && !reduced && holder.current) holder.current.rotation.y = Math.sin(t * 0.25) * 0.35
  })
  return (
    <group ref={holder}>
      <primitive object={model.root} />
    </group>
  )
}

export default function Hero3D({
  make,
  update,
  children,
  height = 2.2,
  camera = [0, 1.35, 5.6],
  target = [0, 1.05, 0],
  label,
  fallback = '/art/wall.jpg',
  className = '',
  spin = true,
  turn = true,
}) {
  const box = useRef()
  const [seen, setSeen] = useState(false)
  const [active, setActive] = useState(false)
  const [reduced, setReduced] = useState(() => reducedQuery().matches)
  useEffect(() => {
    const q = reducedQuery()
    const change = () => setReduced(q.matches)
    q.addEventListener('change', change)
    const io = new IntersectionObserver(([e]) => {
      setActive(e.isIntersecting)
      if (e.isIntersecting) setSeen(true)
    }, { rootMargin: '160px' })
    io.observe(box.current)
    return () => {
      q.removeEventListener('change', change)
      io.disconnect()
    }
  }, [])
  const img = <img className="ag-niche-fallback" src={fallback} alt="" />
  return (
    <div ref={box} className={`ag-niche ${className}`} role="img" aria-label={label}>
      <SceneBoundary fallback={img}>
        {seen && (
          <Canvas frameloop="demand" dpr={[1, 1.5]} camera={{ position: camera, fov: 32, near: 0.1, far: 60 }} gl={{ antialias: true, powerPreference: 'default' }} onCreated={({ camera: c }) => c.lookAt(...target)}>
            <FrameBudget active={active} fps={reduced ? 2 : 30} />
            <ambientLight intensity={0.55} color="#ffe2c0" />
            <spotLight position={[1.5, 7, 4]} angle={0.42} penumbra={0.8} intensity={60} decay={2} color="#ffe6c8" />
            <directionalLight position={[-4, 3, 2]} intensity={1.2} color="#ffd9ad" />
            <directionalLight position={[4, 2, -3]} intensity={1.4} color="#c8602e" />
            <Environment resolution={128} frames={1}>
              <Lightformer form="rect" intensity={2.4} color="#ffe6cc" position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[6, 4, 1]} />
              <Lightformer form="rect" intensity={2.6} color="#ffffff" position={[-4, 2, 2]} rotation-y={Math.PI / 2} scale={[1, 4, 1]} />
              <Lightformer form="rect" intensity={1.3} color="#e8b06a" position={[4, 2, -1]} rotation-y={-Math.PI / 2} scale={[1, 4, 1]} />
            </Environment>
            <Suspense fallback={null}>
              {make && <Model make={make} update={update} height={height} reduced={reduced} spin={spin && !turn} />}
              {children}
            </Suspense>
            <ContactShadows position={[0, 0.002, 0]} scale={6} blur={2.4} opacity={0.6} far={2} resolution={256} frames={1} color="#000" />
            {turn && <OrbitControls enablePan={false} enableZoom={false} target={target} minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.55} autoRotate={!reduced && active} autoRotateSpeed={0.6} />}
          </Canvas>
        )}
      </SceneBoundary>
      {label && <span className="ag-niche-label" aria-hidden="true">{label}</span>}
    </div>
  )
}
