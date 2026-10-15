import assert from 'node:assert/strict';
import * as THREE from 'three';
import * as agora from '../src/world/agora-models.js';

// No renderer or browser globals are needed by the sculpture helpers.
const models = [];
const add = (name, model, bounds, limit = 25000) => {
 assert.ok(model.root instanceof THREE.Group, `${name}: root must be a Group`);
 assert.equal(typeof model.animate, 'function', `${name}: missing animate`);
 models.push({ name, model, bounds, limit }); return model;
};
function inspect(entry) {
 const {name, model, bounds, limit} = entry;
 model.root.updateMatrixWorld(true);
 const box = new THREE.Box3().setFromObject(model.root);
 assert.ok(!box.isEmpty(), `${name}: empty bounds`);
 assert.ok([...box.min.toArray(), ...box.max.toArray()].every(Number.isFinite), `${name}: non-finite bounds`);
 assert.ok(box.min.y >= -.05, `${name}: below ground (${box.min.y})`);
 const size = box.getSize(new THREE.Vector3());
 size.toArray().forEach((value, i) => assert.ok(value <= bounds[i]*1.2, `${name}: axis ${i} size ${value} exceeds ${bounds[i]} + 20%`));
 let triangles = 0;
 model.root.traverse(o => {
  if (!o.isMesh) return;
  const geometry=o.geometry;
  triangles += (geometry.index ? geometry.index.count : geometry.attributes.position.count)/3 * (o.isInstancedMesh ? o.count : 1);
  const position=geometry.attributes.position;
  for(let i=0;i<position.count;i++) assert.ok(Number.isFinite(position.getX(i))&&Number.isFinite(position.getY(i))&&Number.isFinite(position.getZ(i)), `${name}: invalid vertex`);
 });
 assert.ok(triangles < limit, `${name}: ${triangles} triangles exceeds ${limit}`);
 return triangles;
}
try {
 assert.deepEqual(agora.TRADE_TOOL_IDS, ['mason','painter','electrician','plumber','carpenter','helper','housekeeping','loading']);
 for (const id of [...agora.TRADE_TOOL_IDS,'unknown']) add(`tradeTool(${id})`,agora.tradeTool(id),[1.2,1.2,1.2]);
 add('nakaStoa',agora.nakaStoa({figures:3}),[3,2.4,1.8],60000);
 const coins=add('coinStack',agora.coinStack(),[1.2,1.2,1.2]);
 for(const n of [0,99,-2,3.7,24]) {
  coins.setCount(n);
  assert.equal(coins.root.children.filter(c=>c.visible).length,Math.floor(Math.max(0,Math.min(n,24))),`coinStack: wrong visible count for ${n}`);
 }
 const paper=add('scroll',agora.scroll(),[1.2,1.2,1.2]);
 for(const k of [0,1,-1,2,.5]) {paper.setOpen(k);inspect(models.at(-1));}paper.setOpen(1);
 const steps=add('templeSteps',agora.templeSteps(),[2.4,1.4,1.2],60000);
 for(const i of [-1,4,99,0]) {steps.setLevel(i);steps.animate(0);steps.animate(12.3);}steps.setLevel(4);
 const shelf=add('amphoraShelf',agora.amphoraShelf(),[2.4,1.2,1.2],60000);
 shelf.setStates([]);shelf.animate(12.3);shelf.setStates(['empty','paid','unpaid','paid','unpaid','empty','paid']);
 const herald=add('herald',agora.herald(),[1.6,2.3,1.2],60000);assert.ok(herald.board instanceof THREE.Mesh);
 add('laurelCrown',agora.laurelCrown(),[1.2,1.2,1.2]);
 const seal=add('shieldSeal',agora.shieldSeal(),[1.2,1.2,1.2]);
 for(const tone of ['good','mid','bad','none']) {seal.setTone(tone);seal.animate(0);seal.animate(12.3);}seal.setTone('good');
 add('kouros',agora.kouros(),[1.2,1.9,1.2],60000);
 let total=0;
 for(const entry of models) {
  for(const t of [0,12.3]) {entry.model.animate(t);inspect(entry);}
  total+=inspect(entry);
 }
 // Disposing one instance must preserve shared buffers/materials in another.
 const first=agora.tradeTool('electrician'), second=agora.tradeTool('electrician');
 let sharedDisposed=false, ownedDisposed=false;
 const common=new Set();first.root.traverse(o=>{if(o.isMesh){common.add(o.geometry);common.add(o.material);}});
 second.root.traverse(o=>{if(o.isMesh)for(const r of [o.geometry,o.material])if(common.has(r))r.addEventListener('dispose',()=>{sharedDisposed=true;});});
 first.root.traverse(o=>{if(o.material?.emissive?.getHex()===0xffb64d)o.material.addEventListener('dispose',()=>{ownedDisposed=true;});});
 agora.disposeModel(first.root);assert.ok(!sharedDisposed,'disposeModel disposed shared resources');assert.ok(ownedDisposed,'disposeModel did not dispose owned material');
 agora.disposeModel(second.root);
 for(const {model} of models)agora.disposeModel(model.root);
 console.log(`Agora model checks passed: ${models.length} models, ${total} triangles total.`);
} catch(error) {
 console.error(`Agora model checks failed: ${error.message}`);process.exitCode=1;
}
