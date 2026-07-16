// ═══════════════════════════════════════
//  MAP
// ═══════════════════════════════════════
const worldOctree=new Octree();
const barrels=[]; // explosive barrels {mesh,alive}
const pickups=[]; // {mesh,type,alive,collected}
const destructibleCrates=[]; // {mesh,hp,maxHp,alive}
const mapGroup=new THREE.Group();

function buildMap(){
  const floorMat=new THREE.MeshStandardMaterial({color:0x2a2a3e,roughness:.8});
  const floor=new THREE.Mesh(new THREE.BoxGeometry(140,2,140),floorMat);
  floor.position.y=-1;floor.receiveShadow=true;mapGroup.add(floor);
  mapGroup.add(new THREE.GridHelper(140,70,0x2a2a40,0x1a1a30)).position.y=.01;

  // walls
  const wallMat=new THREE.MeshStandardMaterial({color:0x2a2a4a,roughness:.8});
  const wh=7;
  [[140,wh,1,0,wh/2,70],[140,wh,1,0,wh/2,-70],[1,wh,140,70,wh/2,0],[1,wh,140,-70,wh/2,0]].forEach(([sx,sy,sz,px,py,pz])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),wallMat);
    m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
  });

  // inner walls / rooms
  const iwallMat=new THREE.MeshStandardMaterial({color:0x2a2a3e,roughness:.75});
  const iwalls=[
    [20,4,1,15,2,30],[20,4,1,-15,2,30],[1,4,15,25,2,37.5],[1,4,15,-25,2,37.5],
    [15,4,1,40,2,-20],[1,4,20,47.5,2,-30],[15,4,1,-40,2,-20],[1,4,20,-47.5,2,-30],
    [1,4,30,0,2,0],[30,4,1,0,2,15],
  ];
  iwalls.forEach(([sx,sy,sz,px,py,pz])=>{
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),iwallMat);
    m.position.set(px,py,pz);m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
  });

  // crates (static)
  const crateMat=new THREE.MeshStandardMaterial({color:0x443322,roughness:.85});
  const crateMat2=new THREE.MeshStandardMaterial({color:0x333344,roughness:.85});
  const cratePos=[
    [10,0,10],[10,0,-10],[-10,0,10],[-10,0,-10],[25,0,0],[-25,0,0],[0,0,25],[0,0,-25],
    [15,0,20],[-15,0,-20],[20,0,-15],[-20,0,15],[35,0,12],[35,0,-12],[-35,0,12],[-35,0,-12],
    [50,0,50],[-50,0,50],[50,0,-50],[-50,0,-50],[0,0,50],[0,0,-50],[50,0,0],[-50,0,0],
  ];
  cratePos.forEach((p,i)=>{
    const sx=1.5+Math.random()*2,sy=1+Math.random()*2.5,sz=1.5+Math.random()*2;
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),i%2?crateMat:crateMat2);
    m.position.set(p[0],sy/2,p[2]);m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
  });

  // pillars with lights
  const pillarMat=new THREE.MeshStandardMaterial({color:0x3a3a5a,roughness:.6});
  [[20,20],[-20,20],[20,-20],[-20,-20],[0,0]].forEach(([x,z])=>{
    const m=new THREE.Mesh(new THREE.CylinderGeometry(1.2,1.2,8,8),pillarMat);
    m.position.set(x,4,z);m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
    const light=new THREE.PointLight(0xff6666,4,30);
    light.position.set(x,7.5,z);mapGroup.add(light);
  });

  // ═══ NEW: CENTRAL ARENA STRUCTURE WITH ARCHES ═══
  const arenaMat=new THREE.MeshStandardMaterial({color:0x333355,roughness:.6,metalness:.2});
  // arena walls forming a rough octagon
  const arenaR=18,arenaH=6;
  for(let i=0;i<8;i++){
    const a1=(i/8)*Math.PI*2,a2=((i+1)/8)*Math.PI*2;
    const mx=(Math.cos(a1)+Math.cos(a2))*arenaR/2;
    const mz=(Math.sin(a1)+Math.sin(a2))*arenaR/2;
    const len=Math.sqrt(Math.pow(Math.cos(a2)-Math.cos(a1),2)+Math.pow(Math.sin(a2)-Math.sin(a1),2))*arenaR;
    const ang=Math.atan2(Math.sin(a2)-Math.sin(a1),Math.cos(a2)-Math.cos(a1));
    const m=new THREE.Mesh(new THREE.BoxGeometry(len,arenaH,1),arenaMat);
    m.position.set(mx,arenaH/2,mz);m.rotation.y=-ang;
    m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
  }
  // arches on 4 sides
  const archMat=new THREE.MeshStandardMaterial({color:0x444466,roughness:.5,metalness:.3});
  [[0,1],[0,-1],[1,0],[-1,0]].forEach(([dx,dz])=>{
    const ax=dx*arenaR,az=dz*arenaR;
    // pillars of arch
    const p1=new THREE.Mesh(new THREE.BoxGeometry(1,8,1),archMat);
    p1.position.set(ax-2*dx-2*dz,4,az-2*dz+2*dx);p1.castShadow=true;mapGroup.add(p1);
    const p2=new THREE.Mesh(new THREE.BoxGeometry(1,8,1),archMat);
    p2.position.set(ax+2*dx-2*dz,4,az+2*dz+2*dx);p2.castShadow=true;mapGroup.add(p2);
    // arch top
    const top=new THREE.Mesh(new THREE.BoxGeometry(5.5,1,1.5),archMat);
    top.position.set(ax-2*dz,8.5,az+2*dx);top.castShadow=true;mapGroup.add(top);
  });

  // ═══ NEW: PILLARS WITH PLATFORMS ═══
  const platMat=new THREE.MeshStandardMaterial({color:0x3a3a50,roughness:.55});
  [[40,0],[-40,0],[0,40],[0,-40],[35,35],[-35,35],[35,-35],[-35,-35]].forEach(([x,z])=>{
    // pillar
    const pil=new THREE.Mesh(new THREE.CylinderGeometry(1,1.2,5,8),pillarMat);
    pil.position.set(x,2.5,z);pil.castShadow=true;pil.receiveShadow=true;mapGroup.add(pil);
    // platform on top
    const plat=new THREE.Mesh(new THREE.CylinderGeometry(3,3,.3,12),platMat);
    plat.position.set(x,5.15,z);plat.castShadow=true;plat.receiveShadow=true;mapGroup.add(plat);
    // small light on platform
    const platLight=new THREE.PointLight(0x6699ff,3,25);
    platLight.position.set(x,5.8,z);mapGroup.add(platLight);
  });

  // ═══ NEW: DESTRUCTIBLE CRATES (3 hits) ═══
  const dCrateMat=new THREE.MeshStandardMaterial({color:0x664422,roughness:.8});
  const dCratePositions=[
    [8,0,30],[-8,0,30],[30,0,8],[30,0,-8],[-30,0,8],[-30,0,-8],
    [20,0,40],[-20,0,40],[40,0,20],[40,0,-20],[-40,0,20],[-40,0,-20],
    [12,0,-30],[-12,0,-30],[0,0,40],[0,0,-40],
  ];
  dCratePositions.forEach(([x,y,z])=>{
    const sx=1.8,sy=1.5,sz=1.8;
    const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),dCrateMat.clone());
    m.position.set(x,sy/2,z);m.castShadow=true;m.receiveShadow=true;mapGroup.add(m);
    // stripe
    const stripe=new THREE.Mesh(new THREE.BoxGeometry(sx+.02,.15,sz+.02),new THREE.MeshStandardMaterial({color:0x886633}));
    stripe.position.set(x,sy*.6,z);mapGroup.add(stripe);
    destructibleCrates.push({mesh:m,stripe,hp:3,maxHp:3,alive:true,x,y:0,z});
  });

  // ═══ NEW: COLORED ACCENT LIGHTS SCATTERED AROUND ═══
  const accentColors=[0xff2266,0x2266ff,0x22ff66,0xff8800,0x8822ff,0x22ffff,0xff22ff,0xffff22];
  for(let i=0;i<16;i++){
    const a=(i/16)*Math.PI*2;
    const r=50+Math.random()*10;
    const x=Math.cos(a)*r,z=Math.sin(a)*r;
    const light=new THREE.PointLight(accentColors[i%accentColors.length],3,40);
    light.position.set(x,2+Math.random()*3,z);mapGroup.add(light);
    // small orb marker
    const orb=new THREE.Mesh(new THREE.SphereGeometry(.15,6,6),new THREE.MeshBasicMaterial({color:accentColors[i%accentColors.length]}));
    orb.position.copy(light.position);mapGroup.add(orb);
  }

  scene.add(mapGroup);
  worldOctree.fromGraphNode(mapGroup);

  // barrels
  const barrelPositions=[[18,40],[-18,40],[40,18],[40,-18],[-40,18],[-40,-18],[18,-40],[-18,-40],[0,55],[0,-55],[55,0],[-55,0]];
  barrelPositions.forEach(([x,z])=>{
    const g=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CylinderGeometry(.3,.35,1.2,8),new THREE.MeshStandardMaterial({color:0x444444,roughness:.6,metalness:.4}));
    body.position.y=.6;body.castShadow=true;g.add(body);
    const stripe=new THREE.Mesh(new THREE.CylinderGeometry(.31,.36,.2,8),new THREE.MeshStandardMaterial({color:0xff4400,emissive:0x441100}));
    stripe.position.y=.9;g.add(stripe);
    g.position.set(x,0,z);scene.add(g);
    barrels.push({mesh:g,stripe,alive:true,x,z});
  });
}

// ═══════════════════════════════════════
//  PICKUPS SPAWN
// ═══════════════════════════════════════
function spawnPickups(){
  // remove old
  pickups.forEach(p=>{if(p.mesh.parent)scene.remove(p.mesh);});
  pickups.length=0;
  const types=['health','armor','ammo'];
  const spots=[[5,5],[-5,5],[5,-5],[-5,-5],[25,10],[-25,10],[10,25],[-10,25],[0,40],[0,-40],[40,0],[-40,0]];
  spots.forEach(([x,z],i)=>{
    const type=types[i%3];
    const geo=type==='health'?new THREE.OctahedronGeometry(.3):type==='armor'?new THREE.BoxGeometry(.35,.35,.35):new THREE.CylinderGeometry(.2,.2,.35,6);
    const color=type==='health'?0x44ff44:type==='armor'?0x4488ff:0xffcc44;
    const mat=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.3,roughness:.4});
    const m=new THREE.Mesh(geo,mat);
    m.position.set(x,.6,z);
    const pk={mesh:m,type,alive:false,collected:false,baseY:.6};
    pickups.push(pk);
    // delayed spawn — capture object directly (closure over index was broken)
    setTimeout(()=>{pk.alive=true;},1000+i*200);
  });
}

