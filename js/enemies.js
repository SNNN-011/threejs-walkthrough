// ═══════════════════════════════════════
//  ENEMIES
// ═══════════════════════════════════════
const enemies=[];

function createEnemy(x,z,type){
  const cfg=ETYPES[type];
  const g=new THREE.Group();g.userData.type=type;

  const bodyMat=new THREE.MeshStandardMaterial({color:cfg.color,roughness:.6});
  const skinMat=new THREE.MeshStandardMaterial({color:0xddaa88,roughness:.7});
  const darkMat=new THREE.MeshStandardMaterial({color:0x222222,roughness:.5});

  const s=cfg.scale;
  const body=new THREE.Mesh(new THREE.BoxGeometry(.6*s,1.0*s,.4*s),bodyMat);body.position.y=1.1*s;body.castShadow=true;
  const head=new THREE.Mesh(new THREE.BoxGeometry(.4*s,.4*s,.4*s),skinMat);head.position.y=1.9*s;head.castShadow=true;

  // eyes — red for enemies, green for sniper
  const eyeColor=cfg.ranged?0x00ff44:0xff0000;
  const eyeMat=new THREE.MeshBasicMaterial({color:eyeColor});

  let eL,eR;
  eL=new THREE.Mesh(new THREE.BoxGeometry(.08*s,.06*s,.05*s),eyeMat);eL.position.set(-.1*s,1.95*s,.21*s);
  eR=new THREE.Mesh(new THREE.BoxGeometry(.08*s,.06*s,.05*s),eyeMat);eR.position.set(.1*s,1.95*s,.21*s);

  const armL=new THREE.Mesh(new THREE.BoxGeometry(.2*s,.8*s,.2*s),bodyMat);armL.position.set(-.5*s,1.1*s,0);armL.castShadow=true;
  const armR=new THREE.Mesh(new THREE.BoxGeometry(.2*s,.8*s,.2*s),bodyMat);armR.position.set(.5*s,1.1*s,0);armR.castShadow=true;
  const legL=new THREE.Mesh(new THREE.BoxGeometry(.22*s,.7*s,.25*s),darkMat);legL.position.set(-.15*s,.35*s,0);legL.castShadow=true;
  const legR=new THREE.Mesh(new THREE.BoxGeometry(.22*s,.7*s,.25*s),darkMat);legR.position.set(.15*s,.35*s,0);legR.castShadow=true;

  // tank: extra armor plates
  if(type==='tank'){
    const armor=new THREE.Mesh(new THREE.BoxGeometry(.8*s,1.2*s,.1*s),new THREE.MeshStandardMaterial({color:0x444466,roughness:.4,metalness:.6}));
    armor.position.set(0,1.1*s,.25*s);g.add(armor);
    const helmet=new THREE.Mesh(new THREE.BoxGeometry(.5*s,.25*s,.5*s),darkMat);helmet.position.set(0,2.15*s,0);g.add(helmet);
  }

  // boss: extra crown/horns and glow
  if(type==='boss'){
    const crown=new THREE.Mesh(new THREE.ConeGeometry(.3*s,.5*s,6),new THREE.MeshStandardMaterial({color:0xff4400,emissive:0xff2200,emissiveIntensity:.5}));
    crown.position.set(0,2.5*s,0);g.add(crown);
    // boss glow
    const glow=new THREE.PointLight(0xff0044,3,15);
    glow.position.set(0,1.5*s,0);g.add(glow);
    // bigger eyes
    eL.scale.set(1.5,1.5,1.5);eR.scale.set(1.5,1.5,1.5);
  }

  // sniper: weapon
  if(cfg.ranged){
    const gun=new THREE.Mesh(new THREE.BoxGeometry(.06,.06,.5),darkMat);
    gun.position.set(.5*s,1.1*s,.3*s);g.add(gun);
  }

  // HP bar
  const hpBg=new THREE.Mesh(new THREE.PlaneGeometry(.8*s,.06),new THREE.MeshBasicMaterial({color:0x220000}));
  hpBg.position.y=type==='boss'?2.8*s:2.4*s;
  const hpBar=new THREE.Mesh(new THREE.PlaneGeometry(.8*s,.06),new THREE.MeshBasicMaterial({color:type==='boss'?0xff8800:0xff3333}));
  hpBar.position.y=hpBg.position.y;hpBar.position.z=.001;

  // type indicator
  const indicator=new THREE.Mesh(new THREE.BoxGeometry(.15,.15,.15),new THREE.MeshBasicMaterial({color:eyeColor}));
  indicator.position.y=type==='boss'?3*s:2.6*s;

  g.add(body,head,eL);
  if(eR)g.add(eR);
  g.add(armL,armR,legL,legR);
  g.add(hpBg,hpBar,indicator);
  g.position.set(x,0,z);
  scene.add(g);

  return {
    mesh:g,type,hp:cfg.hp,maxHp:cfg.hp,    speed:cfg.speed*(type==='boss'?1:(.85+Math.random()*.3)),
    dmg:cfg.dmg,range:cfg.range,atkCD:cfg.atkcd||cfg.atkCD||1,atkTimer:0,
    alive:true,deathTimer:0,walkCycle:Math.random()*Math.PI*2,
    armL,armR,legL,legR,
    hpBar,hpBg,indicator,scale:s,
    ranged:cfg.ranged||false,shootTimer:0,losTimer:0,
    // boss specific
    shockwaveTimer:type==='boss'?5:0,shockwaveCD:5,
  };
}

function spawnWave(n){
  waveKills=0;waveShots=0;waveHits=0;
  const types=['runner','grunt','tank','sniper'];
  const count=4+n*2;
  const isBossWave=n%5===0;

  for(let i=0;i<count;i++){
    let type='grunt';
    const r=Math.random();
    if(n>=1&&r<.3)type='runner';
    if(n>=2&&r>.7&&r<.85)type='tank';
    if(n>=3&&r>.85)type='sniper';
    const angle=(i/count)*Math.PI*2+Math.random()*.5;
    const dist=35+Math.random()*25;
    enemies.push(createEnemy(Math.cos(angle)*dist,Math.sin(angle)*dist,type));
  }

  // boss every 5 waves
  if(isBossWave){
    const bossAngle=Math.random()*Math.PI*2;
    const bx=Math.cos(bossAngle)*30,bz=Math.sin(bossAngle)*30;
    const boss=createEnemy(bx,bz,'boss');
    enemies.push(boss);
    currentBoss=boss;
    document.getElementById('boss-bar-wrap').style.display='block';
  }

  scrambleText(document.getElementById('wave-text'),`WAVE ${n}`,400);
}

let currentBoss=null;

// ═══════════════════════════════════════
//  SHOOTING / RAYCASTING
// ═══════════════════════════════════════
const raycaster=new THREE.Raycaster();
let flashTimer=0,screenShakeAmt=0;

function shoot(){
  const baseW=WEAPONS[curW];
  const w=getEffectiveWeapon(curW);
  const s=ws[curW];
  // sync mag with effective mag
  if(s.ammo>w.mag) s.ammo=w.mag;
  if(s.reloading||s.cd>0||s.ammo<=0)return;
  s.ammo--;s.cd=w.fr;
  flashTimer=.04;
  playSound(w.snd);

  waveShots++;

  // crosshair spread on shoot
  crosshairSpread=Math.min(crosshairSpread+3,20);

  // muzzle flash
  const mf=muzzleObjs[curW];
  mf.mesh.material.opacity=1;mf.mesh.scale.setScalar(1+Math.random()*.5);mf.light.intensity=3;

  // shell casing
  spawnShellCasing();

  const pellets=w.pellets||1;
  for(let i=0;i<pellets;i++){
    const sp=w.spread*(sprinting?1.5:1)*(scoped?.3:1)*(1+crosshairSpread*0.01);
    const dir=new THREE.Vector3(0,0,-1);
    dir.x+=(Math.random()-.5)*sp;dir.y+=(Math.random()-.5)*sp;
    dir.applyQuaternion(camera.quaternion);dir.normalize();

    const origin=camera.position.clone();
    raycaster.set(origin,dir);raycaster.far=w.range;

    scene.updateMatrixWorld();
    let hitE=null,hitD=Infinity;
    for(const e of enemies){
      if(!e.alive)continue;
      const hits=raycaster.intersectObject(e.mesh,true);
      if(hits.length&&hits[0].distance<hitD){
        hitD=hits[0].distance;
        const hs=hits[0].point.y>e.mesh.position.y+e.scale*1.3;
        hitE={enemy:e,point:hits[0].point,hs};
      }
    }

    if(hitE){
      const dmg=hitE.hs?w.dmg*2:w.dmg;
      hitE.enemy.hp-=dmg;
      waveHits++;
      createImpact(hitE.point);
      showHitmarker(hitE.hs);
      showDmgNum(hitE.point,dmg,hitE.hs);
      createTracer(origin,dir,hitD);
      playSound(hitE.hs?'headshot':'hit');
      if(hitE.hs)headshots++;
      if(hitE.enemy.hp<=0&&hitE.enemy.alive)killEnemy(hitE.enemy,'bullet');
    } else {
      // check barrels
      let hitBarrel=false;
      for(const b of barrels){
        if(!b.alive)continue;
        const hits=raycaster.intersectObject(b.mesh);
        if(hits.length){explodeBarrel(b);createTracer(origin,dir,hits[0].distance);hitBarrel=true;break;}
      }
      // check destructible crates
      if(!hitBarrel){
        for(const c of destructibleCrates){
          if(!c.alive)continue;
          const hits=raycaster.intersectObject(c.mesh);
          if(hits.length){hitDestructibleCrate(c);createTracer(origin,dir,hits[0].distance);hitBarrel=true;break;}
        }
      }
      if(!hitBarrel){
        const dist=w.range;
        createTracer(origin,dir,dist);
      }
    }
  }

  // recoil
  euler.setFromQuaternion(camera.quaternion);
  euler.x+=w.recoil*(.8+Math.random()*.4);
  camera.quaternion.setFromEuler(euler);

  weaponModels[curW].position.z+=.06;
  screenShake(.05);
  updateHUD();
  if(s.ammo<=0)startReload();
}

function spawnShellCasing(){
  const geo=new THREE.CylinderGeometry(.01,.01,.03,4);
  const mat=new THREE.MeshStandardMaterial({color:0xccaa44,metalness:.8,roughness:.3});
  const shell=new THREE.Mesh(geo,mat);
  shell.position.copy(camera.position).add(new THREE.Vector3(.3,-.1,0).applyQuaternion(camera.quaternion));
  const vel=new THREE.Vector3((Math.random()-.5)*2+1,Math.random()*2+1,(Math.random()-.5));
  vel.applyQuaternion(camera.quaternion);
  scene.add(shell);
  shellCasings.push({mesh:shell,vel,life:1});
}

function createTracer(o,d,dist){
  const pts=[o,o.clone().add(d.clone().multiplyScalar(dist))];
  const geo=new THREE.BufferGeometry().setFromPoints(pts);
  const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffcc44,transparent:true,opacity:.7}));
  scene.add(line);
  shellCasings.push({mesh:line,vel:new THREE.Vector3(),life:.06,isLine:true});
}

function createImpact(pos){
  for(let i=0;i<4;i++){
    const m=new THREE.Mesh(new THREE.BoxGeometry(.04,.04,.04),new THREE.MeshBasicMaterial({color:0xffaa44}));
    m.position.copy(pos);scene.add(m);
    shellCasings.push({mesh:m,vel:new THREE.Vector3((Math.random()-.5)*3,Math.random()*3,(Math.random()-.5)*3),life:.35});
  }
}

function showHitmarker(hs){
  const el=document.getElementById('hitmarker');
  el.style.opacity='1';
  el.querySelectorAll('line').forEach(l=>l.setAttribute('stroke',hs?'#ff0000':'#ffffff'));
  setTimeout(()=>el.style.opacity='0',hs?120:60);
}

function showDmgNum(point,dmg,hs){
  const v=point.clone().project(camera);
  const x=(v.x*.5+.5)*innerWidth,y=(-v.y*.5+.5)*innerHeight;
  const el=document.createElement('div');
  el.className='dmg-num';el.textContent=dmg;
  el.style.cssText=`left:${x}px;top:${y}px;color:${hs?'#ff0000':'#ff4444'};font-size:${hs?'1.6rem':'1.2rem'}`;
  document.body.appendChild(el);
  setTimeout(()=>el.remove(),700);
}

function screenShake(amt){screenShakeAmt=Math.max(screenShakeAmt,amt);}

function startReload(){
  const s=ws[curW],w=getEffectiveWeapon(curW);
  if(s.reloading||s.ammo===w.mag)return;
  s.reloading=true;s.rt=w.rt;
  document.getElementById('reload-bar').style.display='block';
  playSound('reload');
}

// ═══════════════════════════════════════
//  KILL / COMBO / SCORE
// ═══════════════════════════════════════
let health=100,armor=100,score=0,kills=0,headshots=0,wave=1,gameActive=false;
let combo=0,comboTimer=0,comboMult=1,bestComboMult=1,hudTimer=0;
let waveKills=0,waveShots=0,waveHits=0;

function killEnemy(e,cause){
  e.alive=false;e.deathTimer=1.5;
  kills++;waveKills++;
  const cfg=ETYPES[e.type];
  const baseScore=cfg.score;
  combo++;comboTimer=COMBO_WINDOW;
  comboMult=Math.min(1+Math.floor(combo/3),5);
     bestComboMult=Math.max(bestComboMult,comboMult);
     score+=baseScore*comboMult;
  updateHUD();
  addKillfeed(e.type,cause);

  // boss killed - special reward
  if(e.type==='boss'){
    currentBoss=null;
    document.getElementById('boss-bar-wrap').style.display='none';
    health=100;armor=100;grenadeCount=MAX_GRENADES_ACTUAL;
    // refill all ammo
    ws.forEach((s,i)=>{s.ammo=getEffectiveWeapon(i).mag;s.reloading=false;});
    score+=5000;
    screenShake(1.0);
    // big flash
    const flash=document.getElementById('dmg-flash');
    flash.style.background='radial-gradient(ellipse at center,transparent 20%,rgba(255,200,0,0.4) 100%)';
    flash.style.opacity='1';setTimeout(()=>flash.style.opacity='0',500);
    addKillfeed('boss','boss_kill');
  }

  // check wave clear
  if(enemies.filter(en=>en.alive).length===0){
    showWaveIntermission();
  }
}

function addKillfeed(type,cause){
  const el=document.createElement('div');
  el.className='kf';
  const name=type==='boss_kill'?'BOSS REWARD':ETYPES[type]?.name||type;
  const icon=cause==='explosion'?'💥':cause==='boss_kill'?'🏆':'✕';
  el.innerHTML=`You <b>${icon}</b> ${name}`;
  const kf=document.getElementById('killfeed');kf.prepend(el);
  setTimeout(()=>{el.style.opacity='0';setTimeout(()=>el.remove(),500);},3000);
  while(kf.children.length>6)kf.lastChild.remove();
}

// ═══════════════════════════════════════
//  WAVE INTERMISSION
// ═══════════════════════════════════════
let intermissionActive=false,intermissionTimer=0;

function showWaveIntermission(){
  intermissionActive=true;
  intermissionTimer=5;
  const acc=waveShots>0?Math.round(waveHits/waveShots*100):0;
  document.getElementById('wi-stats').innerHTML=
    `Kills: <b>${waveKills}</b> · Accuracy: <b>${acc}%</b> · Score Earned: <b>${score}</b>`;
  document.getElementById('wi-next').textContent='Next wave in 5s...';
  document.getElementById('wave-intermission').style.display='flex';
  scrambleText(document.getElementById('wi-title'),'WAVE CLEAR',350);
}

function updateIntermission(dt){
  if(!intermissionActive)return;
  intermissionTimer-=dt;
  document.getElementById('wi-next').textContent=`Next wave in ${Math.ceil(intermissionTimer)}s...`;
  if(intermissionTimer<=0){
    intermissionActive=false;
    document.getElementById('wave-intermission').style.display='none';
    wave++;
    // respawn barrels & pickups
    barrels.forEach(b=>{if(!b.alive){b.alive=true;scene.add(b.mesh,b.stripe);}});
    // respawn destructible crates
    destructibleCrates.forEach(c=>{
      if(!c.alive){
        c.alive=true;c.hp=c.maxHp;
        c.mesh.material.color.set(0x664422);
        scene.add(c.mesh,c.stripe);
      }
    });
    spawnPickups();
    spawnWave(wave);
    // show upgrade panel after boss waves or every 2 waves
    if(wave%2===0||wave%5===1){
      setTimeout(()=>showUpgradePanel(),500);
    }
  }
}

