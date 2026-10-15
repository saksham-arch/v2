import * as THREE from 'three';
import { materials, mesh, ellipsoid, box, cyl, tube, ring, laurel, hermes } from './myth-models.js';

// Original agora sculptures. Metres; stationary plinths meet the ground.
const shared = new Set(Object.values(materials));
const terracotta = new THREE.MeshPhysicalMaterial({ color: 0xc65b2b, roughness: .3, clearcoat: .7 });
const blackSlip = new THREE.MeshPhysicalMaterial({ color: 0x17120f, roughness: .22, clearcoat: 1 });
const sand = new THREE.MeshStandardMaterial({ color: 0xcbb485, roughness: 1 });
const glass = new THREE.MeshPhysicalMaterial({ color: 0xffeed0, transmission: .95, thickness: .06, roughness: .08, transparent: true, opacity: .8 });
const cube = new THREE.BoxGeometry(1, 1, 1);
const cylinder = new THREE.CylinderGeometry(1, 1, 1, 24);
const probe = ellipsoid(null, [0,0,0], [1,1,1]);
const smallProbe = ellipsoid(null, [0,0,0], [1,1,1], materials.marble, false);
for (const resource of [terracotta, blackSlip, sand, glass, cube, cylinder, probe.geometry, smallProbe.geometry]) shared.add(resource);
const group = parent => { const g = new THREE.Group(); parent?.add(g); return g; };
function block(p, pos, size, mat = materials.marble) { const m = mesh(cube, mat, p, pos); m.scale.set(...size); return m; }
function drum(p, pos, r, h, mat = materials.bronze) { const m = mesh(cylinder, mat, p, pos); m.scale.set(r,h,r); return m; }
function ball(p, pos, size, mat = materials.marble) { return ellipsoid(p,pos,size,mat,false); }
function rod(p, a, b, r = .025, mat = materials.bronze) {
 const v = new THREE.Vector3(...a), end = new THREE.Vector3(...b), d = end.sub(v);
 const m = drum(p, v.addScaledVector(d,.5).toArray(),r,d.length(),mat);
 m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize()); return m;
}
function plinth(root, w = .9, d = .7) { block(root,[0,.045,0],[w,.09,d]); }
function idle(root, part) { return {root, animate(t) { part.rotation.y = Math.sin(t*.35)*.045; }}; }
const clamp = (n, lo, hi) => Math.max(lo,Math.min(hi,Number.isFinite(n)?n:lo));
export const TRADE_TOOL_IDS = ['mason','painter','electrician','plumber','carpenter','helper','housekeeping','loading'];

// Familiar working tools, cast as small votive bronzes.
export function tradeTool(tradeId) {
 const root=group(), g=group(root); plinth(root); g.position.y=.09;
 const id=TRADE_TOOL_IDS.includes(tradeId)?tradeId:'mason'; let filament;
 if(id==='mason') {
  block(g,[0,.07,0],[.56,.14,.28],terracotta); block(g,[.06,.21,0],[.56,.14,.28],terracotta);
  const shape=new THREE.Shape(); shape.moveTo(-.18,0);shape.lineTo(.18,0);shape.lineTo(0,.4);shape.closePath();
  const blade=mesh(new THREE.ExtrudeGeometry(shape,{depth:.025,bevelEnabled:false}),materials.bronze,g,[0,.3,-.08]);blade.rotation.x=-Math.PI/2;
  rod(g,[0,.33,-.08],[0,.48,-.2]); rod(g,[0,.48,-.2],[0,.48,-.4],.045);
 } else if(id==='painter') {
  cyl(g,[.16,.2,0],.22,.19,.4,materials.bronze,32); const lip=ring(g,[.16,.405,0],.22,.018);lip.rotation.x=Math.PI/2;
  drum(g,[.16,.39,0],.194,.012,terracotta); ball(g,[.16,.31,.204],[.05,.13,.023],terracotta);
  rod(g,[-.29,.02,0],[-.1,.7,0],.033); tube(g,[[-.1,.7,0],[-.05,.82,0],[.16,.82,0],[.16,.94,0]],.018);
  const roller=drum(g,[.02,.94,0],.095,.42,materials.cloth);roller.rotation.z=Math.PI/2;
 } else if(id==='electrician') {
  rod(g,[-.23,.05,0],[-.23,.52,0],.045,blackSlip);rod(g,[-.23,.52,0],[-.23,.88,0],.018);block(g,[-.23,.89,0],[.045,.065,.014],materials.bronze);
  drum(g,[.18,.16,0],.105,.3);ball(g,[.18,.52,0],[.22,.28,.22],glass);
  filament=materials.gold.clone();filament.emissive.setHex(0xffb64d);
  tube(g,[[.1,.35,0],[.1,.5,0],[.15,.56,0],[.2,.48,0],[.26,.56,0],[.26,.35,0]],.012,filament);
 } else if(id==='plumber') {
  rod(g,[-.25,.12,0],[.14,.66,0],.055);block(g,[.16,.68,0],[.32,.12,.14],materials.bronze);block(g,[.28,.8,0],[.09,.25,.14],materials.bronze);
  block(g,[.08,.82,0],[.3,.07,.14],materials.bronze);rod(g,[-.1,.75,0],[.32,.75,0],.065,materials.dark);
  tube(g,[[.32,.75,0],[.4,.75,0],[.43,.64,0],[.43,.45,0]],.065,materials.dark);
  drum(g,[-.01,.55,0],.075,.1,materials.gold);
 } else if(id==='carpenter') {
  block(g,[0,.05,0],[.76,.1,.42],materials.bark);block(g,[.12,.15,0],[.42,.12,.22],materials.bronze);ball(g,[.12,.25,0],[.1,.09,.065],materials.bark);
  rod(g,[-.29,.12,.14],[.12,.65,.14],.035,materials.bark);block(g,[.13,.67,.14],[.3,.12,.14],materials.bronze);
  for(const z of [.09,.19])tube(g,[[.01,.68,z],[-.12,.7,z],[-.21,.6,z]],.026);
 } else if(id==='helper') {
  const points=[[0,0],[.12,0],[.28,.05],[.39,.16],[.4,.18],[.36,.18],[.26,.08],[0,.04]].map(p=>new THREE.Vector2(...p));
  mesh(new THREE.LatheGeometry(points,32),materials.bronze,g,[0,.02,0]);ball(g,[0,.11,0],[.3,.12,.28],sand);
  block(g,[.08,.22,0],[.26,.1,.13],terracotta);block(g,[-.09,.21,.08],[.23,.1,.12],terracotta);
 } else if(id==='housekeeping') {
  cyl(g,[.15,.2,0],.22,.16,.4,materials.bronze,28); const lip=ring(g,[.15,.4,0],.22,.018);lip.rotation.x=Math.PI/2;
  tube(g,[[-.06,.34,0],[-.04,.6,0],[.34,.6,0],[.36,.34,0]],.018);
  rod(g,[-.27,.22,.16],[-.08,.99,.16],.024,materials.bark);
  for(let i=0;i<13;i++)rod(g,[-.27,.25,.16],[-.42+i*.024,.015,.16+(i%3)*.02],.012,materials.cloth);
  rod(g,[-.34,.19,.16],[-.23,.19,.16],.018,materials.gold);
 } else {
  block(g,[0,.23,0],[.62,.46,.46],materials.bark);
  for(const x of [-.3,.3])for(const z of [-.23,.23])block(g,[x,.23,z],[.04,.47,.04],materials.bronze);
  for(const y of [.1,.22,.34])block(g,[0,y,.235],[.61,.012,.01],materials.dark);
  ball(g,[0,.64,0],[.25,.23,.2],materials.cloth); ball(g,[.04,.87,0],[.09,.07,.08],materials.cloth);
  const tie=ring(g,[.04,.83,0],.075,.012,materials.bark);tie.rotation.x=Math.PI/2;
 }
 return {root,animate(t){g.rotation.y=Math.sin(t*.35)*.035;if(filament)filament.emissiveIntensity=.6+.25*Math.sin(t*1.2);}};
}

function doric(p,x,z,h) {
 const g=group(p);g.position.set(x,0,z);drum(g,[0,.06,0],.14,.12,materials.marble);
 cyl(g,[0,h/2,0],.085,.11,h-.12,materials.marble,24);block(g,[0,h-.025,0],[.29,.09,.29]);
 for(let i=0;i<12;i++){const a=i*Math.PI/6;rod(g,[Math.cos(a)*.097,.15,Math.sin(a)*.097],[Math.cos(a)*.078,h-.13,Math.sin(a)*.078],.009,materials.pale);}
 return g;
}
function roof(p,w,y,d,rise) {
 const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,rise);s.closePath();
 mesh(new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),terracotta,p,[0,y,-d/2]);
}
// A roadside hiring shelter translated into a modest Doric stoa (3 × 1.8 × 2.4).
export function nakaStoa({figures=3}={}) {
 const root=group();block(root,[0,.06,0],[3,.12,1.8]);block(root,[0,.16,0],[2.85,.08,1.65]);
 const building=group(root);building.position.y=.2;
 for(const x of [-1.2,-.4,.4,1.2])doric(building,x,.58,1.8);
 block(building,[0,1.83,0],[2.9,.18,1.65]);
 for(let i=0;i<24;i++){const x=-1.35+i*.115;block(building,[x,1.84,.838],[.08,.02,.012],materials.bronze);block(building,[x-.03,1.87,.838],[.02,.08,.012],materials.bronze);}
 roof(building,3,1.95,1.8,.25);
 const people=[], n=Math.floor(clamp(figures,0,8));
 for(let i=0;i<n;i++){
  const worker=group(building);worker.position.set((i-(n-1)/2)*Math.min(.72,2/Math.max(1,n-1)),0,-.22);
  const torso=ball(worker,[0,.63,0],[.15,.24,.1]);const head=group(worker);head.position.y=.96;ball(head,[0,0,0],[.11,.14,.1]);
  for(const side of [-1,1]){rod(worker,[side*.07,.43,0],[side*.08,.05,.02],.05,materials.marble);rod(worker,[side*.16,.78,0],[side*.19,.42,0],.035,materials.marble);}
  const tool=tradeTool(TRADE_TOOL_IDS[i%8]);tool.root.scale.setScalar(.35);tool.root.position.set(.18,0,.2);worker.add(tool.root);people.push({torso,head});
 }
 block(building,[1.23,.38,-.48],[.22,.76,.09]);block(building,[1.23,.66,-.425],[.15,.018,.01],materials.gold);
 return {root,animate(t){for(let i=0;i<people.length;i++){people[i].torso.scale.y=.24*(1+Math.sin(t*.8+i)*.009);people[i].head.rotation.y=Math.sin(t*.4+i)*.06;}}};
}

const coinRim = new THREE.TorusGeometry(.198,.008,4,24);
const coinRelief = new THREE.SphereGeometry(1,8,6);
shared.add(coinRim); shared.add(coinRelief);
function stamp(p,pos,size,mat) { const m=mesh(coinRelief,mat,p,pos);m.scale.set(...size);return m; }
// Drachmae with a raised owl stamp; hidden coins retain their stack positions.
export function coinStack(max=24) {
 const root=group(), coins=[], count=Math.floor(clamp(max,1,128));let visible=count;
 for(let i=0;i<count;i++){
  const c=group(root);c.position.y=.018+i*.035;drum(c,[0,0,0],.22,.032,materials.gold);
  const rim=mesh(coinRim,materials.gold,c,[0,.018,0]);rim.rotation.x=Math.PI/2;
  stamp(c,[0,.022,0],[.07,.009,.1],materials.gold);
  for(const s of [-1,1]){stamp(c,[s*.045,.028,-.055],[.037,.01,.035],materials.bronze);stamp(c,[s*.045,.038,-.055],[.015,.006,.015],materials.gold);}
  coins.push(c);
 }
 return {root,setCount(n){visible=Math.floor(clamp(n,0,count));for(let i=0;i<count;i++)coins[i].visible=i<visible;},animate(t){for(let i=0;i<count;i++)coins[i].rotation.y=i===visible-1?t*.12:0;}};
}

// A papyrus sheet unfurls between upright wooden rollers (0.9 m open).
export function scroll() {
 const root=group();plinth(root,.98,.3);const g=group(root);g.position.y=.54;
 const sheet=block(g,[0,0,0],[1,.66,.018],materials.cloth), rollers=[];
 for(const s of [-1,1]){const r=group(g);drum(r,[0,0,0],.055,.76,materials.bark);for(const y of [-.4,.4])ball(r,[0,y,0],[.075,.045,.075],materials.gold);rollers.push(r);}
 const ink=group(sheet);for(let i=0;i<7;i++)block(ink,[0,.23-i*.075,.55],[.66-(i%3)*.08,.008,.1],materials.limestone);
 let openness=1;
 return {root,setOpen(k){openness=clamp(k,0,1);const width=.025+openness*.875;sheet.scale.x=width;rollers[0].position.x=-width/2;rollers[1].position.x=width/2;},animate(t){sheet.rotation.y=Math.sin(t*.7)*.018*openness;}};
}

// A grievance ladder, each tread independently lit (up to 2.4 m wide).
export function templeSteps(levels=5) {
 const root=group(), steps=[], n=Math.floor(clamp(levels,1,12)), width=2.4/n;let active=-1;
 for(let i=0;i<n;i++){const mat=materials.marble.clone();mat.emissive.setHex(0xd9a43e);mat.emissiveIntensity=0;steps.push(block(root,[-1.2+width*(i+.5),(i+1)*.085,0],[width,(i+1)*.17,.8],mat));}
 const top=group(root);top.position.set(1.2-width/2,n*.17,0);top.scale.setScalar(Math.min(1,width/.42));
 for(const x of [-.15,-.05,.05,.15]){const c=doric(top,x,.19,.32);c.scale.x=c.scale.z=.26;}
 block(top,[0,.34,0],[.42,.05,.45]);roof(top,.46,.365,.47,.12);
 return {root,setLevel(i){active=Number.isInteger(i)&&i>=0&&i<n?i:-1;for(let j=0;j<n;j++){steps[j].material.color.setHex(j===active?0xd9af61:0xe7d6b7);steps[j].material.emissiveIntensity=j===active?.16:0;}},animate(t){if(active>=0)steps[active].material.emissiveIntensity=.16+.06*Math.sin(t*.9);}};
}

const amphoraGeometry=new THREE.LatheGeometry([[0,0],[.07,0],[.06,.06],[.13,.17],[.12,.27],[.055,.34],[.05,.4],[.075,.42],[.06,.425],[.035,.4],[.038,.34],[.1,.26],[.105,.17],[.04,.06],[0,.025]].map(p=>new THREE.Vector2(...p)),28);
shared.add(amphoraGeometry);
// Glazed amphorae carry a black-figure band and independent payment colours.
export function amphoraShelf(count=7) {
 const root=group(), n=Math.floor(clamp(count,1,12)), vases=[], states=[];const spacing=2.1/n;
 plinth(root,2.4,.5);block(root,[0,.15,0],[2.3,.12,.43]);
 for(let i=0;i<n;i++){
  const g=group(root);g.position.set((i-(n-1)/2)*spacing,.21,0);g.scale.setScalar(Math.min(1,spacing/.29));
  const mat=terracotta.clone(), bandMat=blackSlip.clone();mesh(amphoraGeometry,mat,g);
  for(const s of [-1,1])tube(g,[[s*.055,.37,0],[s*.18,.34,0],[s*.17,.23,0],[s*.11,.2,0]],.015,mat);
  cyl(g,[0,.23,0],.129,.13,.06,bandMat,28);
  for(const s of [-1,1]){ball(g,[s*.045,.236,.132],[.012,.024,.005],mat);rod(g,[s*.045,.24,.134],[s*.065,.21,.134],.006,mat);}
  vases.push({mat,bandMat});
 }
 const api={root,setStates(next){for(let i=0;i<n;i++){const state=next?.[i];states[i]=state==='paid'||state==='unpaid'?state:'empty';const {mat,bandMat}=vases[i];mat.color.setHex(states[i]==='paid'?0xc65b2b:states[i]==='unpaid'?0x8f2a1c:0xd8c5a2);mat.clearcoat=states[i]==='empty'?0:.85;mat.roughness=states[i]==='empty'?.9:.28;mat.emissive.setHex(0xc65b2b);mat.emissiveIntensity=0;bandMat.color.setHex(states[i]==='paid'?0xd9af61:0x17120f);bandMat.metalness=states[i]==='paid'?.8:0;}},animate(t){for(let i=0;i<n;i++)vases[i].mat.emissiveIntensity=states[i]==='empty'?0:.025+.025*Math.sin(t*.9-i*.7);}};
 api.setStates([]);return api;
}

// Hermes presents a framed stele; the front mesh accepts a future notice texture.
export function herald() {
 const f=hermes(), root=group();
 // The small herald needs fewer segments along the staff's curved serpents.
 f.staff.traverse(o=>{if(o.geometry?.type==='TubeGeometry'&&o.geometry.parameters.tubularSegments>100){const old=o.geometry,p=old.parameters;o.geometry=new THREE.TubeGeometry(p.path,64,p.radius,p.radialSegments,p.closed);old.dispose();}});
 root.add(f.root);f.root.scale.setScalar(.88);f.root.position.set(-.1,.08,0);plinth(root,1.25,.8);
 f.scroll.visible=false;
 const frame=group(f.torso);frame.position.set(0,.1,.49);
 const board=box(frame,[0,0,0],[.72,.59,.035],materials.marble);
 for(const x of [-.38,.38])box(frame,[x,0,0],[.035,.66,.07],materials.gold);
 for(const y of [-.31,.31])box(frame,[0,y,0],[.79,.035,.07],materials.gold);
 f.leftArm.joint.rotation.x=-1.1;f.rightArm.joint.rotation.x=-1.1;
 return {root,board,animate(t){f.animate(t);}};
}

// An upright victory wreath, turning gently above its marble disc.
export function laurelCrown() {
 const root=group();drum(root,[0,.04,0],.32,.08,materials.marble);const g=group(root);g.position.y=.6;laurel(g,.44);return idle(root,g);
}

// A hoplite trust seal with a raised geometric meander around its boss.
export function shieldSeal() {
 const root=group();plinth(root,.65,.35);const g=group(root);g.position.y=.62;
 const mat=materials.marble.clone(), face=drum(g,[0,0,0],.5,.065,mat);face.rotation.x=Math.PI/2;
 ring(g,[0,0,.04],.5,.035,materials.bronze);ring(g,[0,0,.05],.36,.012);ball(g,[0,0,.06],[.13,.13,.07],materials.gold);
 for(let i=0;i<20;i++){const a=i*Math.PI/10, m=block(g,[Math.cos(a)*.4,Math.sin(a)*.4,.052],[.055,.022,.018],materials.gold);m.rotation.z=a;const b=block(g,[Math.cos(a)*.425,Math.sin(a)*.425,.052],[.02,.055,.018],materials.gold);b.rotation.z=a;}
 return {root,setTone(tone){mat.color.setHex(({good:0x496556,mid:0xd9a43e,bad:0x8f2a1c,none:0xe7d6b7})[tone]??0xe7d6b7);},animate(t){g.rotation.y=Math.sin(t*.4)*.065;g.rotation.z=Math.sin(t*.3)*.018;}};
}

// Archaic symmetry, a forward left foot and bead-like braided hair (1.9 m).
export function kouros() {
 const root=group();plinth(root,.65,.52);const torso=group(root);torso.position.y=1.14;
 ball(torso,[0,.12,0],[.23,.31,.13]);ball(torso,[0,.34,0],[.27,.12,.15]);drum(torso,[0,.49,0],.07,.13,materials.marble);
 ball(torso,[0,.67,0],[.14,.19,.135]);ball(torso,[0,.65,.132],[.025,.055,.036]);
 for(const s of [-1,1]){
  const z=s===-1?.12:0;rod(root,[s*.12,1.04,0],[s*.12,.57,z*.5],.085,materials.marble);rod(root,[s*.12,.57,z*.5],[s*.12,.18,z],.06,materials.marble);ball(root,[s*.12,.15,z+.055],[.075,.06,.15]);
  rod(torso,[s*.25,.34,0],[s*.29,-.02,0],.06,materials.marble);rod(torso,[s*.29,-.02,0],[s*.29,-.35,.015],.045,materials.marble);ball(torso,[s*.29,-.39,.02],[.05,.065,.045]);
  for(let row=0;row<6;row++)for(let braid=0;braid<3;braid++)ball(torso,[s*(.105+braid*.022),.8-row*.052,-.075+braid*.045],[.024,.032,.027],materials.pale);
  ball(torso,[s*.055,.7,.119],[.035,.009,.012],materials.limestone);
 }
 return {root,animate(t){torso.scale.y=1+Math.sin(t*.7)*.002;}};
}

// Imported sphere buffers and palette materials belong to the shared library.
export function disposeModel(root) {
 const disposed=new Set();root.traverse(o=>{for(const resource of [o.geometry,...(Array.isArray(o.material)?o.material:[o.material])])if(resource&&!shared.has(resource)&&!disposed.has(resource)){resource.dispose();disposed.add(resource);}});
}
