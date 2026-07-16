// ═══════════════════════════════════════
//  SKY — BLACKHOLE + STARFIELD + PLANETS + GALAXY
// ═══════════════════════════════════════
const BH_Y=120, BH_PARTS=800, STAR_PARTS=600;
const noFog=(m)=>{m.fog=false;return m;}; // exclude from FogExp2
const skyGroup=new THREE.Group(); // everything rotates together
scene.add(skyGroup);

// --- BLACKHOLE ---
const bhGroup=new THREE.Group();
bhGroup.position.set(30,BH_Y,-50);

// glow sprites (fake volumetric)
const glowTex=makeRadialTex(256,[[0,'#cc66ff',1],[.3,'#6622aa',.5],[1,'#000000',0]]);
const glow1=new THREE.Sprite(noFog(new THREE.SpriteMaterial({map:glowTex,color:0x9955ff,transparent:true,opacity:0.6,blending:THREE.AdditiveBlending,depthWrite:false})));
glow1.scale.set(50,50,1);bhGroup.add(glow1);
const glow2=new THREE.Sprite(noFog(new THREE.SpriteMaterial({map:glowTex,color:0xff4400,transparent:true,opacity:0.4,blending:THREE.AdditiveBlending,depthWrite:false})));
glow2.scale.set(30,30,1);bhGroup.add(glow2);

// accretion disk light
const bhLight=new THREE.PointLight(0x9944ff,3,200,2);
bhGroup.add(bhLight);

// event horizon ring (torus)
const ring=new THREE.Mesh(new THREE.TorusGeometry(10,1.5,8,48),noFog(new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:0.5})));
ring.rotation.x=Math.PI/2;bhGroup.add(ring);
const ring2=new THREE.Mesh(new THREE.TorusGeometry(16,0.8,8,64),noFog(new THREE.MeshBasicMaterial({color:0x8833cc,transparent:true,opacity:0.3})));
ring2.rotation.x=Math.PI/2*0.85;bhGroup.add(ring2);

// spiral particles
const bhPos=new Float32Array(BH_PARTS*3);
const bhCol=new Float32Array(BH_PARTS*3);
const bhSpiralData=[];
for(let i=0;i<BH_PARTS;i++){
  const r=8+Math.random()*25;
  const angle=Math.random()*Math.PI*2;
  const speed=0.15+Math.random()*0.5;
  const yOff=(Math.random()-0.5)*3;
  bhSpiralData.push({r,angle,speed,yOff});
  bhPos[i*3]=r*Math.cos(angle);bhPos[i*3+1]=yOff;bhPos[i*3+2]=r*Math.sin(angle);
  const t=Math.min(1,(r-8)/25);
  bhCol[i*3]=1-t*0.5;bhCol[i*3+1]=0.15*(1-t);bhCol[i*3+2]=t;
}
const bhBufGeo=new THREE.BufferGeometry();
bhBufGeo.setAttribute('position',new THREE.BufferAttribute(bhPos,3));
bhBufGeo.setAttribute('color',new THREE.BufferAttribute(bhCol,3));
const bhPts=new THREE.Points(bhBufGeo,noFog(new THREE.PointsMaterial({size:1.2,vertexColors:true,transparent:true,opacity:0.9,blending:THREE.AdditiveBlending,depthWrite:false})));
bhGroup.add(bhPts);
skyGroup.add(bhGroup);

function makeRadialTex(size,stops){
  const c=document.createElement('canvas');c.width=c.height=size;
  const ctx=c.getContext('2d');const g=ctx.createRadialGradient(size/2,size/2,0,size/2,size/2,size/2);
  stops.forEach(([pos,color,alpha])=>g.addColorStop(pos,color));
  ctx.fillStyle=g;ctx.fillRect(0,0,size,size);
  return new THREE.CanvasTexture(c);
}

function updateBlackhole(dt){
  bhGroup.rotation.y+=dt*0.06;
  const pos=bhPts.geometry.attributes.position.array;
  for(let i=0;i<BH_PARTS;i++){
    const d=bhSpiralData[i];
    d.angle+=d.speed*dt;
    d.r-=dt*0.4/(d.r-5);
    if(d.r<8)d.r=8+Math.random()*4;
    pos[i*3]=d.r*Math.cos(d.angle);
    pos[i*3+1]=d.yOff+Math.sin(d.angle*2)*0.5;
    pos[i*3+2]=d.r*Math.sin(d.angle);
  }
  bhPts.geometry.attributes.position.needsUpdate=true;
  bhLight.intensity=3+Math.sin(performance.now()/600)*1;
  glow1.material.opacity=0.5+Math.sin(performance.now()/900)*0.15;
  ring.rotation.z+=dt*0.12;
  ring2.rotation.z-=dt*0.08;
  skyGroup.rotation.y+=dt*0.003;
}

// --- STARFIELD (dome, upper hemisphere only) ---
const starPos=new Float32Array(STAR_PARTS*3);
const starSizes=new Float32Array(STAR_PARTS);
for(let i=0;i<STAR_PARTS;i++){
  const theta=Math.random()*Math.PI*2;
  const phi=Math.random()*Math.PI*0.55; // upper hemisphere
  const r=180+Math.random()*40;
  starPos[i*3]=r*Math.sin(phi)*Math.cos(theta);
  starPos[i*3+1]=r*Math.cos(phi)+20; // bias upward
  starPos[i*3+2]=r*Math.sin(phi)*Math.sin(theta);
  starSizes[i]=0.5+Math.random()*1.5;
}
const starBufGeo=new THREE.BufferGeometry();
starBufGeo.setAttribute('position',new THREE.BufferAttribute(starPos,3));
starBufGeo.setAttribute('size',new THREE.BufferAttribute(starSizes,1));
// ponitail: use simple size, not custom shader
const starMat=noFog(new THREE.PointsMaterial({color:0xffffff,size:1.5,transparent:true,opacity:0.8,blending:THREE.AdditiveBlending,depthWrite:false,sizeAttenuation:false}));
scene.add(new THREE.Points(starBufGeo,starMat));

// --- NEBULA / GALAXY SPRITES ---
const nebTex=makeRadialTex(256,[[0,'#ffffff',.6],[.2,'#aaccff',.3],[.6,'#442266',.1],[1,'#000000',0]]);
for(let i=0;i<4;i++){
  const s=new THREE.Sprite(noFog(new THREE.SpriteMaterial({map:nebTex,color:[0x6644cc,0x2266aa,0xcc4488,0x44aa66][i],transparent:true,opacity:0.15,blending:THREE.AdditiveBlending,depthWrite:false})));
  const sz=40+Math.random()*30;
  s.scale.set(sz,sz,1);
  const th=Math.random()*Math.PI*2;
  const r=140+Math.random()*30;
  s.position.set(r*Math.cos(th),80+Math.random()*40,r*Math.sin(th));
  scene.add(s);
}

// --- PLANETS ---
const planetDefs=[
  {r:3,color:0xcc6644,emissive:0x441100,pos:[80,95,-70]},
  {r:2,color:0x4488cc,emissive:0x112244,pos:[-90,70,60]},
  {r:1.5,color:0xaa8844,emissive:0x332200,pos:[50,110,80]},
];
planetDefs.forEach(p=>{
  const m=new THREE.Mesh(
    new THREE.SphereGeometry(p.r,12,12),
    noFog(new THREE.MeshStandardMaterial({color:p.color,emissive:p.emissive,emissiveIntensity:0.3,roughness:0.7}))
  );
  m.position.set(...p.pos);
  scene.add(m);
});

