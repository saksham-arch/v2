// Two more exhibits for the gallery, built from the agora sculpture library:
// a labour naka under its stoa, and the votive tools of all eight trades.
import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { nakaStoa, tradeTool, TRADE_TOOL_IDS, disposeModel } from './agora-models.js'

export function NakaExhibit({ reducedMotion = false }) {
  const model = useMemo(() => nakaStoa({ figures: 4 }), [])
  useEffect(() => () => disposeModel(model.root), [model])
  useFrame((s) => model.animate(reducedMotion ? 0 : s.clock.elapsedTime))
  return <group position={[0, -1.35, 0]} scale={1.05}><primitive object={model.root} /></group>
}

export function ToolRing({ reducedMotion = false }) {
  const ring = useRef()
  const tools = useMemo(() => TRADE_TOOL_IDS.map((id, i) => {
    const m = tradeTool(id)
    const holder = new Group()
    const a = (i / TRADE_TOOL_IDS.length) * Math.PI * 2
    holder.position.set(Math.sin(a) * 1.75, 0, Math.cos(a) * 1.75)
    holder.rotation.y = a
    holder.add(m.root)
    return { m, holder }
  }), [])
  useEffect(() => () => tools.forEach(({ m }) => disposeModel(m.root)), [tools])
  useFrame((s, dt) => {
    const t = reducedMotion ? 0 : s.clock.elapsedTime
    tools.forEach(({ m }) => m.animate(t))
    if (!reducedMotion && ring.current) ring.current.rotation.y += dt * 0.18
  })
  return (
    <group position={[0, -0.9, 0]}>
      <group ref={ring}>{tools.map(({ holder }, i) => <primitive key={i} object={holder} />)}</group>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.35, 2.45, 0.12, 64]} />
        <meshStandardMaterial color="#e7d6b7" roughness={0.7} />
      </mesh>
    </group>
  )
}
