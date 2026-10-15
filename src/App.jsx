import { lazy, Suspense, useEffect, useState } from 'react'
import { I18nProvider, useI18n } from './i18n/index.jsx'
import SceneBoundary from './ui/SceneBoundary.jsx'
import { isAgoraRoute } from './agora-app/routes.js'
const World = lazy(() => import('./Story.jsx'))
const AgoraApp = lazy(() => import('./agora-app/index.jsx'))
import './tasks/integrated.css'
function Site(){
 const [route,setRoute]=useState(()=>location.hash)
 const agora=isAgoraRoute(route)
 const {lang,setLang}=useI18n()
 useEffect(()=>{const route=()=>setRoute(location.hash);window.addEventListener('hashchange',route);return()=>window.removeEventListener('hashchange',route)},[])
 // Moving between agora pages starts at the top; the story keeps its own scroll.
 useEffect(()=>{if(agora&&!route.startsWith('#naka/'))window.scrollTo(0,0)},[agora&&route.split('/')[0]])
 return <>{!agora&&<label className="site-language"><span className="sr-only">Language</span><select aria-label="Language" value={lang} onChange={e=>setLang(e.target.value)}><option value="en">EN</option><option value="hi">हिन्दी</option></select></label>}<Suspense fallback={<div className="world-loading">Ergon · Preparing the world…</div>}>
 {agora?<AgoraApp route={route}/>:<SceneBoundary fallback={<div className="world-loading"><p>The 3D scene could not start.</p><a href="#map">Find work in the agora →</a><button onClick={()=>location.reload()}>Retry the world</button></div>}><World/></SceneBoundary>}
 </Suspense></>
}
export default function App(){return <I18nProvider><Site/></I18nProvider>}
