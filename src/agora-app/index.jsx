// The agora router: one lazy chunk per page, all inside the shared shell.
import { lazy, Suspense } from 'react'
import Shell from './Shell.jsx'
import SceneBoundary from '../ui/SceneBoundary.jsx'

const Work = lazy(() => import('./pages/Work.jsx'))
const Naka = lazy(() => import('./pages/Naka.jsx'))
const Passport = lazy(() => import('./pages/Passport.jsx'))
const Scales = lazy(() => import('./pages/Scales.jsx'))
const Athena = lazy(() => import('./pages/Athena.jsx'))
const PostWork = lazy(() => import('./pages/Market.jsx').then((m) => ({ default: m.PostWork })))
const BookWork = lazy(() => import('./pages/Market.jsx').then((m) => ({ default: m.BookWork })))
const Profiles = lazy(() => import('./pages/Market.jsx').then((m) => ({ default: m.Profiles })))

export { isAgoraRoute } from './routes.js'

function Page({ route }) {
  if (route === '#map') return <Work />
  if (route.startsWith('#naka/')) return <Naka id={route.slice(6)} />
  if (route.startsWith('#passport')) return <Passport section={route.split('/')[1]} />
  if (route.startsWith('#scales')) return <Scales section={route.split('/')[1]} />
  if (route.startsWith('#athena')) return <Athena section={route.split('/')[1]} />
  if (route === '#post-work') return <PostWork />
  if (route.startsWith('#book-work/')) return <BookWork id={route.slice('#book-work/'.length)} />
  return <Profiles />
}

export default function AgoraApp({ route }) {
  const full = route === '#map'
  return (
    <Shell route={route} full={full}>
      <SceneBoundary fallback={<div className="ag-tablet" style={{ margin: 40 }}><p>Something went wrong on this page. <button className="ag-link" onClick={() => location.reload()}>Reload</button></p></div>}>
        <Suspense fallback={<div className="ag-loading" aria-busy="true"><span className="ag-coin slip lg" /></div>}>
          <Page route={route} key={route.split('/')[0]} />
        </Suspense>
      </SceneBoundary>
    </Shell>
  )
}
