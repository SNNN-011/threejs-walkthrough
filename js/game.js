// ═══════════════════════════════════════
//  ENEMY AI
// ═══════════════════════════════════════
// LOS check: true if clear path from A to B
// build static LOS mesh list once after map loads
let losMeshes=null;
function buildLOSMeshes(){
  losMeshes=[];
  mapGroup.traverse(c=>{if(c.isMesh)losMeshes.push(c);});
}
function hasLOS(from,to){
  if(!losMeshes)buildLOSMeshes();
  const dir=new THREE.Vector3().subVectors(to,from);
  const dist=dir.length();
  if(dist<1)return true;
  dir.normalize();
  raycaster.set(from,dir);
  raycaster.far=dist;
  const hits=raycaster.intersectObjects(losMeshes);
  return hits.length===0||hits[0].distance>dist-0.5;
}

function updateEnemies(dt){
  const pp=camera.position;
  for(let i=enemies.length-1;i>=0;i--){
    const e=enemies[i];
    if(!e.alive){
      e.deathTimer-=dt;
      e.mesh.position.y-=dt*2;
      e.mesh.rotation.x+=dt*2;
      e.mesh.traverse(c=>{if(c.isMesh&&c.material){c.material.transparent=true;c.material.opacity=Math.max(0,e.deathTimer/1.5);}});
      if(e.deathTimer<=0){scene.remove(e.mesh);enemies.splice(i,1);}
      continue;
    }

    // track visibility — enemy must be visible for 0.5s before it can attack
    const eyeBase=e.mesh.position.clone();eyeBase.y=e.scale*1.7;
    if(hasLOS(eyeBase,pp)){
      e.losTimer=Math.min(e.losTimer+dt,2);
    } else {
      e.losTimer=Math.max(e.losTimer-dt*2,0);
    }
    const canAttack=e.losTimer>=0.5;

    const ep=e.mesh.position.clone();ep.y=1;
    const toP=new THREE.Vector3().subVectors(pp,ep);toP.y=0;
    const dist=toP.length();

    // boss shockwave attack
    if(e.type==='boss'){
      e.shockwaveTimer-=dt;
      if(e.shockwaveTimer<=0&&dist<25&&canAttack){
        e.shockwaveTimer=e.shockwaveCD;
        // shockwave AoE
        playSound('shockwave');
        screenShake(0.8);
        // visual shockwave ring
        const ring=new THREE.Mesh(new THREE.RingGeometry(0.5,1,32),new THREE.MeshBasicMaterial({color:0xff4400,transparent:true,opacity:.8,side:THREE.DoubleSide}));
        ring.position.copy(e.mesh.position);ring.position.y=0.5;ring.rotation.x=-Math.PI/2;scene.add(ring);
        const ringLight=new THREE.PointLight(0xff4400,8,20);ringLight.position.copy(e.mesh.position);ringLight.position.y=1;scene.add(ringLight);
        // expand ring
        let ringScale=1;
        const expandInterval=setInterval(()=>{
          ringScale+=0.8;
          ring.scale.setScalar(ringScale);
          ring.material.opacity=Math.max(0,0.8-ringScale*0.03);
          ringLight.intensity*=0.9;
          if(ringScale>25){scene.remove(ring,ringLight);clearInterval(expandInterval);}
        },16);
        // damage player if in range
        if(dist<20){
          const shockDmg=e.dmg*(1-dist/20);
          damagePlayer(shockDmg);
          // knockback
          const kb=toP.clone().normalize().multiplyScalar(-15);
          velocity.add(kb);
        }
      }
    }

    // face player
    e.mesh.lookAt(pp.x,e.mesh.position.y,pp.z);

    // walk animation
    if(e.speed>0){
      e.walkCycle+=dt*e.speed*2;
      if(e.legL){e.legL.rotation.x=Math.sin(e.walkCycle)*.5;e.legR.rotation.x=-Math.sin(e.walkCycle)*.5;}
      if(e.armL){e.armL.rotation.x=-Math.sin(e.walkCycle)*.3;e.armR.rotation.x=Math.sin(e.walkCycle)*.3;}
    }

    // update HP bar
    const hpPct=Math.max(0,e.hp/e.maxHp);
    e.hpBar.scale.x=hpPct;e.hpBar.position.x=(hpPct-1)*.4*e.scale;

    // move toward player when out of range
    if(dist>e.range&&e.speed>0&&!e.ranged&&e.losTimer>0.1){
      const moveDir=toP.clone().normalize().multiplyScalar(e.speed*dt);
      e.mesh.position.add(moveDir);
      e.mesh.position.y=0;
    }
    // ranged attack (sniper/boss) — must be visible
    if(e.ranged&&dist<e.range&&canAttack){
      e.shootTimer-=dt;
        if(e.shootTimer<=0){
          e.shootTimer=e.atkCD;
          playSound('enemy_shoot');
          damagePlayer(e.dmg);
          if(e.armR)e.armR.rotation.x=-1.2;
        }
    }

    // melee attack — must be visible
    if(dist<e.range&&!e.ranged&&canAttack){
      e.atkTimer-=dt;
      if(e.atkTimer<=0){
        e.atkTimer=e.atkCD;
          damagePlayer(e.dmg);
        if(e.armR)e.armR.rotation.x=-1.2;
        playSound('enemy_hit');
      }
    }

    // runner: lunge — only when visible
    if(e.type==='runner'&&dist<e.range*2&&dist>1.2&&canAttack){
      e.mesh.position.add(toP.clone().normalize().multiplyScalar(e.speed*dt*1.5));
    }

    // push enemy away if overlapping player (min dist = 1 unit)
    if(dist<1.0&&dist>0.01){
      const pushDir=toP.clone().normalize().multiplyScalar(-3*dt);
      e.mesh.position.add(pushDir);
      e.mesh.position.y=0;
    }
    // enemy wall collision + bounds check
    if(e.speed>0){
      const eCapsule=new Capsule(
        new THREE.Vector3(e.mesh.position.x,e.scale*.35,e.mesh.position.z),
        new THREE.Vector3(e.mesh.position.x,e.scale*1.7,e.mesh.position.z),
        e.scale*.3
      );
      const eResult=worldOctree.capsuleIntersect(eCapsule);
      if(eResult){
        const push=eResult.normal.clone().multiplyScalar(Math.min(eResult.depth,1));
        e.mesh.position.add(push);
      }
      // bounds clamp — keep inside map
      e.mesh.position.x=Math.max(-65,Math.min(65,e.mesh.position.x));
      e.mesh.position.z=Math.max(-65,Math.min(65,e.mesh.position.z));
      e.mesh.position.y=0;
    }
  }
}

function damagePlayer(dmg){
  if(armor>0){const ab=Math.min(armor,dmg*.6);armor-=ab;dmg-=ab;}
  health=Math.max(0,health-dmg);updateHUD();
  const flash=document.getElementById('dmg-flash');
  flash.style.background=`radial-gradient(ellipse at center,transparent 40%,rgba(255,0,0,${Math.min(.5,dmg/40)}) 100%)`;
  flash.style.opacity='1';setTimeout(()=>flash.style.opacity='0',200);
  screenShake(.1);
  if(health<=0)gameOver();
}

function gameOver(){
  gameActive=false;document.exitPointerLock();
  document.getElementById('gameover').style.display='flex';
  scrambleText(document.querySelector('#gameover h2'),'MISSION FAILED',500);
  document.getElementById('go-stats').textContent=
    `Score: ${score} · Wave: ${wave} · Kills: ${kills} · HS: ${headshots} · Best Combo: x${bestComboMult}`;
}

// ═══════════════════════════════════════
//  PICKUPS COLLECTION
// ═══════════════════════════════════════
function updatePickups(dt){
  const pp=camera.position;
  for(const p of pickups){
    if(!p.alive)continue;
    // bob & rotate
    p.mesh.rotation.y+=dt*2;
    p.mesh.position.y=p.baseY+Math.sin(performance.now()/1000*2+p.baseY)*.15;

    if(p.mesh.position.distanceTo(pp)<1.5){
      switch(p.type){
        case'health':if(health<100){health=Math.min(100,health+25);p.collected=true;}break;
        case'armor':if(armor<100){armor=Math.min(100,armor+30);p.collected=true;}break;
        case'ammo':{
          let refilled=false;
          for(let wi=0;wi<4;wi++){const sw=ws[wi],ww=getEffectiveWeapon(wi);
            if(sw.ammo<ww.mag){sw.ammo=ww.mag;refilled=true;break;}}
          if(refilled)p.collected=true;break;
        }
      }
      if(p.collected){
        p.alive=false;scene.remove(p.mesh);playSound('pickup');
      }
    }
  }
}

// ═══════════════════════════════════════
//  MAIN LOOP
// ═══════════════════════════════════════
const clock=new THREE.Clock();

function animate(){
  requestAnimationFrame(animate);
  const rawDt=Math.min(clock.getDelta(),.1);
  const dt=rawDt*timeScale;

  updatePlayer(dt);
  updateEnemies(dt);
  updatePickups(dt);
  updateIntermission(rawDt); // intermission counts in real time
  updateDayLighting(rawDt,wave);
  updateBlackhole(rawDt);

  // cooldowns (in real time)
  const s=ws[curW],w=getEffectiveWeapon(curW);
  s.cd=Math.max(0,s.cd-rawDt);
  dashCDTimer=Math.max(0,dashCDTimer-rawDt);
  grenadeCDTimer=Math.max(0,grenadeCDTimer-rawDt);
  comboTimer=Math.max(0,comboTimer-rawDt);
  if(comboTimer<=0&&combo>0){combo=0;comboMult=1;}

  // bullet time
  if(btActive){
    btTimer-=rawDt;
    if(btTimer<=0)deactivateBulletTime();
  }
  if(btCDTimer>0)btCDTimer=Math.max(0,btCDTimer-rawDt);

  // crosshair spread
  const isMoving=mF||mB||mL||mR;
  const targetSpread=isMoving?(sprinting?12:6):0;
  crosshairSpread+=(targetSpread-crosshairSpread)*rawDt*10;
  crosshairSpread=Math.max(0,crosshairSpread-rawDt*15);
  updateCrosshair();

  // shoot
  if(shooting&&locked&&!intermissionActive){
    if(w.auto)shoot();
    else if(s.cd<=0)shoot();
  }

  // reload
  if(s.reloading){
    s.rt-=rawDt;
    document.getElementById('reload-fill').style.width=((w.rt-s.rt)/w.rt*100)+'%';
    if(s.rt<=0){s.ammo=w.mag;s.reloading=false;document.getElementById('reload-bar').style.display='none';updateHUD();}
  }

  // muzzle flash fade
  flashTimer=Math.max(0,flashTimer-rawDt);
  muzzleObjs.forEach(m=>{if(flashTimer<=0){m.mesh.material.opacity*=.75;m.light.intensity*=.75;}});

  // weapon return
  const aw=weaponModels[curW];
  const tz=[-.38,-.42,-.42,-.48][curW],ty=[-.2,-.2,-.2,-.18][curW];
  aw.position.z+=(tz-aw.position.z)*rawDt*15;
  aw.position.y+=(ty-aw.position.y)*rawDt*15;

  // grenades physics
  for(let i=grenades.length-1;i>=0;i--){
    const gr=grenades[i];
    gr.life-=dt;
    gr.vel.y-=G*dt;
    gr.mesh.position.add(gr.vel.clone().multiplyScalar(dt));
    gr.mesh.rotation.x+=dt*5;gr.mesh.rotation.z+=dt*3;
    // bounce floor
    if(gr.mesh.position.y<.15){gr.mesh.position.y=.15;gr.vel.y*=-.4;gr.vel.x*=.8;gr.vel.z*=.8;}
    // wall collision
    const grCapsule=new Capsule(
      new THREE.Vector3(gr.mesh.position.x,gr.mesh.position.y-.1,gr.mesh.position.z),
      new THREE.Vector3(gr.mesh.position.x,gr.mesh.position.y+.1,gr.mesh.position.z),
      .12
    );
    const grResult=worldOctree.capsuleIntersect(grCapsule);
    if(grResult){
      gr.mesh.position.add(grResult.normal.clone().multiplyScalar(grResult.depth));
      gr.vel.reflect(grResult.normal).multiplyScalar(.5);
    }
    if(gr.life<=0){explodeGrenade(gr.mesh.position.clone());scene.remove(gr.mesh);grenades.splice(i,1);}
  }

  // shell casings / particles
  for(let i=shellCasings.length-1;i>=0;i--){
    const sc=shellCasings[i];
    sc.life-=rawDt;
    if(!sc.isLine){
      sc.vel.y-=G*rawDt*.5;
      sc.mesh.position.add(sc.vel.clone().multiplyScalar(rawDt));
      sc.mesh.material.opacity=Math.max(0,sc.life);
      sc.mesh.material.transparent=true;
    } else {
      sc.mesh.material.opacity=Math.max(0,sc.life/.06);
    }
    if(sc.life<=0){scene.remove(sc.mesh);shellCasings.splice(i,1);}
  }
  // cap particles to prevent frame drops
  while(shellCasings.length>200){scene.remove(shellCasings[0].mesh);shellCasings.shift();}

  // boss health bar glow pulse
  if(currentBoss&&currentBoss.alive){
    const pulse=0.7+Math.sin(performance.now()/200)*0.3;
    document.getElementById('boss-bar-wrap').style.borderColor=`rgba(255,${Math.round(34*pulse)},0,${pulse})`;
  }

  if(locked)drawMinimap();
  // throttle HUD to ~10Hz
  hudTimer-=rawDt;
  if(hudTimer<=0){updateHUD();hudTimer=0.1;}
  renderer.render(scene,camera);
}

const shellCasings=[];
const pCol=new Capsule(new THREE.Vector3(0,PR,5),new THREE.Vector3(0,PH,5),PR);

buildMap();
updateHUD();gameActive=true;spawnWave(1);animate();

</script>

<!-- ORIGINKIT-STYLE EFFECTS: Particles + Scramble Text -->
<script>
// === Menu Particle Background (Originkit-style) ===
(function(){
  const c=document.getElementById('menu-particles');
  if(!c)return;
  const ctx=c.getContext('2d');
  let W,H,particles=[];
  function resize(){W=c.width=window.innerWidth;H=c.height=window.innerHeight}
  resize();window.addEventListener('resize',resize);
  for(let i=0;i<60;i++){
    particles.push({x:Math.random()*W,y:Math.random()*H,
      vx:(Math.random()-.5)*.3,vy:(Math.random()-.5)*.3,
      r:Math.random()*1.5+.5,a:Math.random()*.4+.1,
      pulse:Math.random()*Math.PI*2});
  }
  function draw(){
    ctx.clearRect(0,0,W,H);
    const t=Date.now()*.001;
    for(const p of particles){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;
      if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      const alpha=p.a*(.6+.4*Math.sin(t*1.5+p.pulse));
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle='rgba(255,68,68,'+alpha+')';ctx.fill();
    }
    // connection lines
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
        const dist=Math.sqrt(dx*dx+dy*dy);
        if(dist<120){
          ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);
          ctx.lineTo(particles[j].x,particles[j].y);
          ctx.strokeStyle='rgba(255,68,68,'+(1-dist/120)*.12+')';
          ctx.lineWidth=.5;ctx.stroke();
        }
      }
    }
    if(document.getElementById('menu').style.display!=='none')requestAnimationFrame(draw);
  }
  draw();
})();

// === Scramble Text Effect (Originkit-style) ===
function scrambleText(el,targetText,duration){
  if(!el)return;
  const chars='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%';
  const steps=Math.floor(duration/30);
  let step=0;
  const origLen=targetText.length;
  el.classList.add('scrambling');
  const iv=setInterval(()=>{
    let out='';
    for(let i=0;i<origLen;i++){
      if(step>steps*(i/origLen)){
        out+=targetText[i]||'';
      }else{
        out+=chars[Math.floor(Math.random()*chars.length)];
      }
    }
    el.textContent=out;
    step++;
    if(step>steps){el.textContent=targetText;el.classList.remove('scrambling');clearInterval(iv);}
  },30);
}

// Apply scramble on wave change
const _origWaveText=document.getElementById('wave-text');
const _origScoreText=document.getElementById('score-text');
