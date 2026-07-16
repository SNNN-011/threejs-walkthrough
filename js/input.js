// ═══════════════════════════════════════
//  INPUT
// ═══════════════════════════════════════
let mF=false,mB=false,mL=false,mR=false,canJump=false,sprinting=false;
const euler=new THREE.Euler(0,0,0,'YXZ');
let locked=false;

let dashCDTimer=0,isDashing=false,dashTimer=0,dashDir=new THREE.Vector3();
let grenadeCount=MAX_GRENADES_ACTUAL,grenadeCDTimer=0;
const grenades=[];

document.addEventListener('keydown',e=>{
  switch(e.code){
    case'KeyW':case'ArrowUp':mF=true;break;
    case'KeyS':case'ArrowDown':mB=true;break;
    case'KeyA':case'ArrowLeft':mL=true;break;
    case'KeyD':case'ArrowRight':mR=true;break;
    case'Space':if(canJump){velocity.y=JUMP;canJump=false;}break;
    case'ShiftLeft':case'ShiftRight':sprinting=true;break;
    case'Digit1':switchW(0);break;case'Digit2':switchW(1);break;
    case'Digit3':switchW(2);break;case'Digit4':switchW(3);break;
    case'KeyR':startReload();break;
    case'KeyF':flashlight.visible=!flashlight.visible;break;
    case'KeyG':throwGrenade();break;
    case'KeyE':startDash();break;
    case'KeyQ':activateBulletTime();break;
  }
});
document.addEventListener('keyup',e=>{
  switch(e.code){
    case'KeyW':case'ArrowUp':mF=false;break;case'KeyS':case'ArrowDown':mB=false;break;
    case'KeyA':case'ArrowLeft':mL=false;break;case'KeyD':case'ArrowRight':mR=false;break;
    case'ShiftLeft':case'ShiftRight':sprinting=false;break;
  }
});
document.addEventListener('mousedown',e=>{
  if(e.button===0)shooting=true;
  if(e.button===2&&WEAPONS[curW].scope)toggleScope(true);
});
document.addEventListener('mouseup',e=>{
  if(e.button===0)shooting=false;
  if(e.button===2&&scoped)toggleScope(false);
});
document.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('wheel',e=>switchW((curW+(e.deltaY>0?1:-1)+4)%4));

document.addEventListener('mousemove',e=>{
  if(!locked)return;
  euler.setFromQuaternion(camera.quaternion);
  euler.y-=e.movementX*SENS;
  euler.x-=e.movementY*SENS;
  euler.x=Math.max(-Math.PI/2+.01,Math.min(Math.PI/2-.01,euler.x));
  camera.quaternion.setFromEuler(euler);
});

// pointer lock — startGame is defined in standalone script above
// resume audio on pointer lock (first user gesture)
document.addEventListener('pointerlockchange',()=>{
  if(document.pointerLockElement&&audioCtx.state==='suspended')audioCtx.resume();
});
document.addEventListener('pointerlockchange',()=>{
  locked=!!document.pointerLockElement;
  document.getElementById('hud').style.display=locked?'block':'none';
  const upgradePanel=document.getElementById('upgrade-panel');
  if(!locked&&gameActive&&upgradePanel.style.display!=='flex')document.getElementById('menu').style.display='flex';
});
window.addEventListener('resize',()=>{
  camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);
});

// ═══════════════════════════════════════
//  DASH
// ═══════════════════════════════════════
function startDash(){
  if(dashCDTimer>0||isDashing||!locked)return;
  isDashing=true;dashTimer=DASH_DUR;dashCDTimer=DASH_CD;
  dashDir.set(0,0,0);
  const fwd=new THREE.Vector3();camera.getWorldDirection(fwd);fwd.y=0;fwd.normalize();
  const right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();
  if(mF)dashDir.add(fwd);if(mB)dashDir.sub(fwd);
  if(mR)dashDir.add(right);if(mL)dashDir.sub(right);
  if(dashDir.length()<.1)dashDir.copy(fwd);
  dashDir.normalize();
  playSound('dash');
}

// ═══════════════════════════════════════
//  GRENADES
// ═══════════════════════════════════════
function throwGrenade(){
  if(grenadeCount<=0||grenadeCDTimer>0||!locked)return;
  grenadeCount--;grenadeCDTimer=.5;

  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  const g=new THREE.Mesh(new THREE.SphereGeometry(.12,6,6),new THREE.MeshStandardMaterial({color:0x556633,roughness:.6}));
  g.position.copy(camera.position);
  scene.add(g);
  grenades.push({mesh:g,vel:dir.multiplyScalar(GRENADE_SPEED).add(new THREE.Vector3(0,5,0)),life:GRENADE_FUSE});
  updateHUD();
}

function explodeGrenade(pos){
  playSound('explosion');
  // visual
  const flash=new THREE.Mesh(new THREE.SphereGeometry(GRENADE_RADIUS,16,16),new THREE.MeshBasicMaterial({color:0xff8800,transparent:true,opacity:.6}));
  flash.position.copy(pos);scene.add(flash);

  // light
  const light=new THREE.PointLight(0xff6600,10,GRENADE_RADIUS*2);
  light.position.copy(pos);scene.add(light);

  // damage enemies
  for(const e of enemies){
    if(!e.alive)continue;
    const d=e.mesh.position.distanceTo(pos);
    if(d<GRENADE_RADIUS){
      const dmg=GRENADE_DMG*(1-d/GRENADE_RADIUS);
      e.hp-=dmg;
      if(e.hp<=0)killEnemy(e,'explosion');
    }
  }

  // damage barrels
  for(const b of barrels){
    if(!b.alive)continue;
    if(new THREE.Vector3(b.x,.6,b.z).distanceTo(pos)<GRENADE_RADIUS)explodeBarrel(b);
  }

  // damage destructible crates
  for(const c of destructibleCrates){
    if(!c.alive)continue;
    if(new THREE.Vector3(c.x,.75,c.z).distanceTo(pos)<GRENADE_RADIUS)hitDestructibleCrate(c);
  }

  // fade
  let opacity=.6;
  const fadeI=setInterval(()=>{
    opacity-=.04;
    flash.material.opacity=Math.max(0,opacity);
    light.intensity*=.85;
    if(opacity<=0){scene.remove(flash);scene.remove(light);clearInterval(fadeI);}
  },30);

  // screen shake
  screenShake(.3);
}

// ═══════════════════════════════════════
//  EXPLOSIVE BARRELS
// ═══════════════════════════════════════
function explodeBarrel(barrel){
  if(!barrel.alive)return;
  barrel.alive=false;
  scene.remove(barrel.mesh,barrel.stripe);
  playSound('explosion');

  const pos=new THREE.Vector3(barrel.x,.6,barrel.z);
  const flash=new THREE.Mesh(new THREE.SphereGeometry(6,12,12),new THREE.MeshBasicMaterial({color:0xff6600,transparent:true,opacity:.7}));
  flash.position.copy(pos);scene.add(flash);
  const light=new THREE.PointLight(0xff6600,8,15);light.position.copy(pos);scene.add(light);

  for(const e of enemies){
    if(!e.alive)continue;
    const d=e.mesh.position.distanceTo(pos);
    if(d<10){e.hp-=150*(1-d/10);if(e.hp<=0)killEnemy(e,'explosion');}
  }
  // chain barrels
  for(const b of barrels){if(b.alive&&new THREE.Vector3(b.x,.6,b.z).distanceTo(pos)<10)explodeBarrel(b);}
  // damage player
  if(camera.position.distanceTo(pos)<10)damagePlayer(20*(1-camera.position.distanceTo(pos)/10));

  let opacity=.7;
  const fi=setInterval(()=>{opacity-=.04;flash.material.opacity=Math.max(0,opacity);light.intensity*=.85;if(opacity<=0){scene.remove(flash);scene.remove(light);clearInterval(fi);}},30);
  screenShake(.4);
}

// ═══════════════════════════════════════
//  DESTRUCTIBLE CRATES
// ═══════════════════════════════════════
function hitDestructibleCrate(crate){
  if(!crate.alive)return;
  crate.hp--;
  // visual feedback - darken
  crate.mesh.material.color.lerp(new THREE.Color(0x221100),0.3);
  screenShake(.05);
  if(crate.hp<=0){
    crate.alive=false;
    scene.remove(crate.mesh,crate.stripe);
    // spawn debris particles
    for(let i=0;i<6;i++){
      const p=new THREE.Mesh(new THREE.BoxGeometry(.2,.2,.2),new THREE.MeshStandardMaterial({color:0x553311}));
      p.position.copy(crate.mesh.position);scene.add(p);
      shellCasings.push({mesh:p,vel:new THREE.Vector3((Math.random()-.5)*5,Math.random()*5+2,(Math.random()-.5)*5),life:1.5});
    }
    playSound('enemy_hit');
    // small chance to drop pickup
    if(Math.random()<0.4){
      const types=['health','ammo','armor'];
      const type=types[Math.floor(Math.random()*3)];
      const geo=type==='health'?new THREE.OctahedronGeometry(.3):type==='armor'?new THREE.BoxGeometry(.35,.35,.35):new THREE.CylinderGeometry(.2,.2,.35,6);
      const color=type==='health'?0x44ff44:type==='armor'?0x4488ff:0xffcc44;
      const m=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.3,roughness:.4}));
      m.position.copy(crate.mesh.position);m.position.y=.6;scene.add(m);
      pickups.push({mesh:m,type,alive:true,collected:false,baseY:.6});
    }
  }
}

