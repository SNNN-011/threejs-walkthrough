// ═══════════════════════════════════════
//  WEAPON MODELS
// ═══════════════════════════════════════
const weaponModels=[];
const muzzleObjs=[];

function createWeapon(idx){
  const g=new THREE.Group();
  const metal=new THREE.MeshStandardMaterial({color:0x3a3f47,roughness:.3,metalness:.95});
  const darkMetal=new THREE.MeshStandardMaterial({color:0x1b1e24,roughness:.5,metalness:.85});
  const poly=new THREE.MeshStandardMaterial({color:0x14161a,roughness:.6,metalness:.3});
  const wood=new THREE.MeshStandardMaterial({color:0x5a3a22,roughness:.7,metalness:0});
  const gripMat=poly;
  const accent=new THREE.MeshStandardMaterial({color:0x4a5a8a,roughness:.4,metalness:.6});
  const lensMat=new THREE.MeshStandardMaterial({color:0x335588,roughness:.08,metalness:.95,emissive:0x112244,emissiveIntensity:.4});
  const lensRed=new THREE.MeshBasicMaterial({color:0xff2222});

  const cyl=(r1,r2,l,seg=10,m=darkMetal)=>new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,l,seg),m);
  const box=(w,h,d,m)=>new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);
  const sph=(r,m)=>new THREE.Mesh(new THREE.SphereGeometry(r,10,10),m);
  const circ=(r,m)=>new THREE.Mesh(new THREE.CircleGeometry(r,18),m);
  const torus=(r,tube,seg,m=darkMetal)=>new THREE.Mesh(new THREE.TorusGeometry(r,tube,8,seg),m);

  let mz=-.6,my=.01; // muzzle flash offset

  switch(idx){
    case 0:{ // pistol
      const slide=box(.05,.052,.22,metal);slide.position.set(0,.025,-.02);
      for(let i=0;i<5;i++){const s=box(.053,.007,.009,metal);s.position.set(0,.05,.035+i*.02);g.add(s);} // rear serrations
      const barrel=cyl(.015,.015,.14);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.025,-.13);
      const muzzleLip=cyl(.017,.015,.012,8,metal);muzzleLip.rotation.x=Math.PI/2;muzzleLip.position.set(0,.025,-.2);
      const frame=box(.044,.05,.13,poly);frame.position.set(0,-.025,.05);
      const trigGuard=torus(.02,.006,16,metal);trigGuard.position.set(0,-.045,.01);trigGuard.rotation.x=Math.PI/2;
      const trig=box(.008,.02,.012,metal);trig.position.set(0,-.05,.01);
      const trigPin=sph(.006,metal);trigPin.position.set(0,-.042,.022);
      const grip=box(.04,.13,.068,poly);grip.position.set(0,-.1,.07);grip.rotation.x=.22;
      const baseplate=box(.043,.025,.073,poly);baseplate.position.set(0,-.165,.072);baseplate.rotation.x=.22;
      const takedown=box(.01,.013,.013,metal);takedown.position.set(-.027,-.01,.055);
      const accRail=box(.018,.012,.04,metal);accRail.position.set(0,-.018,-.03);
      for(let i=0;i<3;i++){const s=box(.02,.006,.008,metal);s.position.set(0,-.012,-.04+i*.02);g.add(s);} // rail slots
      const sightF=box(.006,.014,.01,accent);sightF.position.set(0,.055,-.1);
      const sightR1=box(.006,.018,.008,accent);sightR1.position.set(-.006,.058,.07);
      const sightR2=box(.006,.018,.008,accent);sightR2.position.set(.006,.058,.07);
      const port=box(.006,.022,.05,darkMetal);port.position.set(.026,.026,.0); // ejection port
      g.add(slide,muzzleLip,frame,trigGuard,trig,trigPin,grip,baseplate,takedown,accRail,sightF,sightR1,sightR2,port);
      g.position.set(.21,-.16,-.34);
      mz=-.2;my=.025;
      break;
    }
    case 1:{ // M4
      const upper=box(.05,.05,.6,metal);upper.position.set(0,.02,-.1);
      for(let i=0;i<12;i++){const s=box(.03,.006,.01,metal);s.position.set(0,.058,-.34+i*.056);g.add(s);} // top rail slots
      const lower=box(.05,.055,.24,poly);lower.position.set(0,-.02,.16);
      const hg=box(.058,.058,.28,poly);hg.position.set(0,.015,-.4);
      for(let i=0;i<6;i++){const s=box(.052,.006,.01,metal);s.position.set(0,.046,-.52+i*.05);g.add(s);} // handguard rail slots
      const barrel=cyl(.012,.012,.28);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.02,-.6);
      const gasBlock=box(.024,.024,.03,darkMetal);gasBlock.position.set(0,.004,-.46);
      const fh=cyl(.02,.016,.05,8,metal);fh.rotation.x=Math.PI/2;fh.position.set(0,.02,-.72);
      const crush=cyl(.021,.021,.008,8,darkMetal);crush.rotation.x=Math.PI/2;crush.position.set(0,.02,-.69);
      const fsPost=box(.008,.035,.008,accent);fsPost.position.set(0,.05,-.58);
      const fsBase=box(.024,.014,.022,darkMetal);fsBase.position.set(0,.03,-.58);
      const rsAim=box(.008,.03,.008,accent);rsAim.position.set(0,.045,.04);
      const port=box(.02,.022,.06,darkMetal);port.position.set(.026,.026,-.02); // ejection port
      const ch=box(.018,.012,.012,metal);ch.position.set(.026,.05,-.4); // charging handle latch
      const grip=box(.036,.12,.05,poly);grip.position.set(0,-.11,.15);grip.rotation.x=.25;
      const tguard=torus(.02,.006,16,metal);tguard.position.set(0,-.06,.12);tguard.rotation.x=Math.PI/2;tguard.scale.set(1,.85,1);
      const trig=box(.008,.02,.014,metal);trig.position.set(0,-.06,.12);
      const trigPin=sph(.006,metal);trigPin.position.set(0,-.055,.135);
      const mag=box(.034,.17,.046,darkMetal);mag.position.set(0,-.12,-.02);mag.rotation.x=.13;
      const magBase=box(.037,.022,.05,darkMetal);magBase.position.set(0,-.205,-.045);magBase.rotation.x=.13;
      const tube=cyl(.017,.017,.13,8,poly);tube.rotation.x=Math.PI/2;tube.position.set(0,-.01,.34);
      const castle=torus(.021,.009,12,poly);castle.position.set(0,-.01,.405);castle.rotation.y=Math.PI/2;
      const stock=box(.04,.07,.12,poly);stock.position.set(0,-.02,.42);
      const sling=torus(.013,.004,10,metal);sling.position.set(-.022,-.05,.4);sling.rotation.x=Math.PI/2;
      const railTop=box(.02,.012,.48,metal);railTop.position.set(0,.05,-.1);
      const reddot=cyl(.02,.02,.028,12,poly);reddot.rotation.x=Math.PI/2;reddot.position.set(0,.065,-.18);
      const rdRing=torus(.022,.004,12,poly);rdRing.position.set(0,.065,-.18);rdRing.rotation.y=Math.PI/2;
      const rdlens=circ(.014,lensRed);rdlens.position.set(0,.065,-.195);rdlens.rotation.y=Math.PI/2;
      g.add(upper,lower,hg,barrel,gasBlock,fh,crush,fsPost,fsBase,rsAim,port,ch,grip,tguard,trig,trigPin,mag,magBase,tube,castle,stock,sling,railTop,reddot,rdRing,rdlens);
      g.position.set(.23,-.17,-.4);
      mz=-.74;my=.02;
      break;
    }
    case 2:{ // shotgun
      const recv=box(.06,.07,.26,metal);recv.position.set(0,.01,-.03);
      for(let i=0;i<6;i++){const s=box(.063,.008,.01,metal);s.position.set(0,.046,-.13+i*.032);g.add(s);} // receiver top serrations
      const b1=cyl(.016,.016,.48,10,metal);b1.rotation.x=Math.PI/2;b1.position.set(-.02,.025,-.42);
      const b2=cyl(.016,.016,.48,10,metal);b2.rotation.x=Math.PI/2;b2.position.set(.02,.025,-.42);
      const vent=box(.05,.012,.42,poly);vent.position.set(0,.052,-.42);
      const bead=sph(.01,accent);bead.position.set(0,.062,-.64);
      const midbead=sph(.006,accent);midbead.position.set(0,.05,-.3);
      const magTube=cyl(.014,.014,.4,8,metal);magTube.rotation.x=Math.PI/2;magTube.position.set(0,-.025,-.4);
      const tubeCap=cyl(.016,.016,.02,8,metal);tubeCap.rotation.x=Math.PI/2;tubeCap.position.set(0,-.025,-.61);
      const pump=box(.05,.045,.16,wood);pump.position.set(0,-.03,-.34);
      for(let i=0;i<4;i++){const r=box(.052,.006,.02,wood);r.position.set(0,-.046,-.4+i*.04);g.add(r);} // pump grip ridges
      const pa1=cyl(.008,.008,.12,6,metal);pa1.rotation.z=Math.PI/2;pa1.position.set(-.025,-.008,-.3);
      const pa2=cyl(.008,.008,.12,6,metal);pa2.rotation.z=Math.PI/2;pa2.position.set(.025,-.008,-.3);
      const tguard=torus(.018,.006,16,metal);tguard.position.set(0,-.045,.06);tguard.rotation.x=Math.PI/2;
      const trig=box(.008,.018,.012,metal);trig.position.set(0,-.05,.06);
      const safety=box(.013,.013,.013,new THREE.MeshStandardMaterial({color:0xcc2222,roughness:.5}));safety.position.set(-.032,-.02,.06);
      const stock=box(.05,.07,.24,wood);stock.position.set(0,-.01,.17);
      const stockCap=box(.05,.072,.02,wood);stockCap.position.set(0,-.01,.29);
      const grip=box(.04,.1,.05,wood);grip.position.set(0,-.09,.07);grip.rotation.x=.2;
      const sw1=torus(.011,.004,8,metal);sw1.position.set(-.03,-.03,.05);sw1.rotation.x=Math.PI/2;
      g.add(recv,b1,b2,vent,bead,midbead,magTube,tubeCap,pump,pa1,pa2,tguard,trig,safety,stock,stockCap,grip,sw1);
      g.position.set(.24,-.17,-.42);
      mz=-.64;my=.025;
      break;
    }
    case 3:{ // sniper
      const action=box(.05,.06,.4,metal);action.position.set(0,.01,-.1);
      const recvRing=torus(.028,.01,14,metal);recvRing.position.set(0,.01,-.28);recvRing.rotation.y=Math.PI/2;
      const barrel=cyl(.014,.014,.72,10,metal);barrel.rotation.x=Math.PI/2;barrel.position.set(0,.015,-.78);
      const brake=cyl(.024,.02,.1,8,metal);brake.rotation.x=Math.PI/2;brake.position.set(0,.015,-1.14);
      for(let i=0;i<2;i++){const p=box(.05,.012,.012,darkMetal);p.position.set(0,i?.031:-.001,-1.08);g.add(p);} // brake ports
      const stock=box(.05,.07,.4,wood);stock.position.set(0,-.01,.36);
      const cheek=box(.035,.05,.2,wood);cheek.position.set(0,.06,.28);
      const grip=box(.035,.12,.05,wood);grip.position.set(0,-.11,.18);grip.rotation.x=.25;
      const tguard=torus(.016,.005,14,metal);tguard.position.set(0,-.05,.12);tguard.rotation.x=Math.PI/2;
      const trig=box(.008,.018,.012,metal);trig.position.set(0,-.055,.12);
      const mag=box(.03,.09,.05,darkMetal);mag.position.set(0,-.1,-.04);
      const magBase=box(.032,.02,.052,darkMetal);magBase.position.set(0,-.145,-.05);
      const bolt=cyl(.008,.008,.06,6,metal);bolt.rotation.z=Math.PI/2;bolt.position.set(.045,.04,-.18);
      const boltKnob=sph(.015,metal);boltKnob.position.set(.08,.04,-.18);
      const boltShroud=box(.03,.05,.045,metal);boltShroud.position.set(.03,.04,-.2);
      const sTube=cyl(.024,.024,.3,14,metal);sTube.rotation.x=Math.PI/2;sTube.position.set(0,.09,-.26);
      const sun=cyl(.026,.026,.08,14,poly);sun.rotation.x=Math.PI/2;sun.position.set(0,.09,-.42);
      const lensF=circ(.022,lensMat);lensF.position.set(0,.09,-.47);lensF.rotation.y=-Math.PI/2;
      const lensR=circ(.022,lensMat);lensR.position.set(0,.09,-.1);lensR.rotation.y=Math.PI/2;
      const eyepiece=torus(.026,.006,14,poly);eyepiece.position.set(0,.09,-.11);eyepiece.rotation.y=Math.PI/2;
      const objRing=torus(.026,.006,14,poly);objRing.position.set(0,.09,-.41);objRing.rotation.y=Math.PI/2;
      const tElev=cyl(.012,.012,.02,10,metal);tElev.rotation.x=Math.PI/2;tElev.position.set(0,.115,-.26);
      const tWind=cyl(.012,.012,.02,10,metal);tWind.rotation.z=Math.PI/2;tWind.position.set(-.025,.09,-.26);
      const ring1=box(.014,.035,.014,metal);ring1.position.set(0,.065,-.34);
      const ring2=box(.014,.035,.014,metal);ring2.position.set(0,.065,-.18);
      const bipodL=cyl(.006,.006,.2,6,metal);bipodL.position.set(-.03,-.09,-.72);bipodL.rotation.x=.2;
      const bipodR=cyl(.006,.006,.2,6,metal);bipodR.position.set(.03,-.09,-.72);bipodR.rotation.x=.2;
      const footL=box(.022,.008,.012,metal);footL.position.set(-.045,-.18,-.72);footL.rotation.z=.32;
      const footR=box(.022,.008,.012,metal);footR.position.set(.045,-.18,-.72);footR.rotation.z=-.32;
      const sw=torus(.012,.004,10,metal);sw.position.set(-.025,-.04,.4);sw.rotation.x=Math.PI/2;
      g.add(action,recvRing,barrel,brake,stock,cheek,grip,tguard,trig,mag,magBase,bolt,boltKnob,boltShroud,sTube,sun,lensF,lensR,eyepiece,objRing,tElev,tWind,ring1,ring2,bipodL,bipodR,footL,footR,sw);
      g.position.set(.27,-.18,-.5);
      mz=-1.18;my=.015;
      break;
    }
  }

  // muzzle flash at barrel tip
  const flash=new THREE.Mesh(new THREE.SphereGeometry(.04,8,8),new THREE.MeshBasicMaterial({color:0xffaa00,transparent:true,opacity:0}));
  flash.position.set(0,my,mz);
  const flashLight=new THREE.PointLight(0xffaa00,0,5);
  flashLight.position.set(0,my,mz);
  g.add(flash,flashLight);
  muzzleObjs.push({mesh:flash,light:flashLight});
  return g;
}

for(let i=0;i<4;i++){const m=createWeapon(i);m.visible=i===0;weaponModels.push(m);weaponGroup.add(m);}

// ═══════════════════════════════════════
//  WEAPON STATE
// ═══════════════════════════════════════
let curW=0;
const ws=WEAPONS.map(w=>({ammo:w.mag,reloading:false,rt:0,cd:0}));
let shooting=false,scoped=false,baseFOV=75;

function switchW(i){
  if(i===curW||ws[curW].reloading)return;
  if(scoped)toggleScope(false);
  weaponModels[curW].visible=false;
  curW=i;
  weaponModels[i].visible=true;
  updateHUD();
  document.querySelectorAll('.ws').forEach((el,j)=>el.classList.toggle('active',j===i));
  playSound('reload');
}
function toggleScope(on){
  scoped=on;
  document.getElementById('scope-overlay').style.display=on?'block':'none';
  document.getElementById('crosshair').style.opacity=on?'0':'1';
  camera.fov=on?25:baseFOV;
  camera.updateProjectionMatrix();
}

