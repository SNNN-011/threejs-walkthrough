// ═══════════════════════════════════════
//  HUD
// ═══════════════════════════════════════
function updateHUD(){
  const w=getEffectiveWeapon(curW);
  const s=ws[curW];
  document.getElementById('weapon-name').textContent=w.name;
  document.getElementById('ammo-cur').textContent=s.ammo;
  document.getElementById('ammo-res').textContent=s.res===Infinity?'∞':s.res;
  document.getElementById('health-text').textContent=Math.max(0,Math.round(health));
  document.getElementById('health-fill').style.width=Math.max(0,health)+'%';
  document.getElementById('armor-text').textContent=Math.round(armor);
  document.getElementById('score-text').textContent=score;
  document.getElementById('kill-text').textContent=`${kills} KILLS · ${headshots} HS`;
  document.getElementById('grenade-count').textContent=grenadeCount;

  // combo
  const cd=document.getElementById('combo-display');
  if(combo>1){cd.style.opacity='1';cd.textContent=`x${comboMult} COMBO (${combo})`;}
  else cd.style.opacity='0';

  // ability cooldowns
  document.getElementById('cd-dash').style.height=(dashCDTimer/DASH_CD*100)+'%';
  document.getElementById('ab-dash').classList.toggle('ready',dashCDTimer<=0);
  document.getElementById('cd-grenade').style.height=(grenadeCDTimer/0.5*100)+'%';
  document.getElementById('ab-grenade').classList.toggle('ready',grenadeCDTimer<=0&&grenadeCount>0);
  document.getElementById('cd-bullettime').style.height=(btCDTimer/BT_CD*100)+'%';
  document.getElementById('ab-bullettime').classList.toggle('ready',btCDTimer<=0&&!btActive);

  // boss health bar
  if(currentBoss&&currentBoss.alive){
    const pct=Math.max(0,currentBoss.hp/currentBoss.maxHp*100);
    document.getElementById('boss-bar-fill').style.width=pct+'%';
    document.getElementById('boss-bar-hp').textContent=`${Math.round(currentBoss.hp)} / ${currentBoss.maxHp}`;
  }

  // upgrade levels display in weapon name
  if(upgradeState.dmg>0||upgradeState.fr>0||upgradeState.mag>0||upgradeState.rt>0){
    const upgrades=[];
    if(upgradeState.dmg)upgrades.push(`DMG+${upgradeState.dmg}`);
    if(upgradeState.fr)upgrades.push(`FR+${upgradeState.fr}`);
    if(upgradeState.mag)upgrades.push(`MAG+${upgradeState.mag}`);
    if(upgradeState.rt)upgrades.push(`RT+${upgradeState.rt}`);
    document.getElementById('weapon-name').textContent=w.name+' ['+upgrades.join(' ')+']';
  }
}

// ═══════════════════════════════════════
//  MINIMAP
// ═══════════════════════════════════════
const MM_SIZE=160,MM_SCALE=1.0;
const mmCanvas=document.getElementById('minimap');
const mmCtx=mmCanvas.getContext('2d');

function drawMinimap(){
  mmCtx.fillStyle='#0a0a18';
  mmCtx.fillRect(0,0,MM_SIZE,MM_SIZE);
  const cx=MM_SIZE/2,cy=MM_SIZE/2;
  const px=curPlayerPos.x,pz=curPlayerPos.z;

  // barrels
  barrels.forEach(b=>{
    if(!b.alive)return;
    const bx=cx+(b.x-px)*MM_SCALE,bz=cy+(b.z-pz)*MM_SCALE;
    if(bx<0||bx>MM_SIZE||bz<0||bz>MM_SIZE)return;
    mmCtx.fillStyle='#cc4400';mmCtx.fillRect(bx-2,bz-2,4,4);
  });

  // pickups
  pickups.forEach(p=>{
    if(!p.alive)return;
    const bx=cx+(p.mesh.position.x-px)*MM_SCALE,bz=cy+(p.mesh.position.z-pz)*MM_SCALE;
    if(bx<0||bx>MM_SIZE||bz<0||bz>MM_SIZE)return;
    mmCtx.fillStyle=p.type==='health'?'#44ff44':p.type==='armor'?'#4488ff':'#ffcc44';
    mmCtx.beginPath();mmCtx.arc(bx,bz,2,0,Math.PI*2);mmCtx.fill();
  });

  // enemies
  enemies.forEach(e=>{
    if(!e.alive)return;
    const ex=cx+(e.mesh.position.x-px)*MM_SCALE,ez=cy+(e.mesh.position.z-pz)*MM_SCALE;
    if(ex<0||ex>MM_SIZE||ez<0||ez>MM_SIZE)return;
    mmCtx.fillStyle=e.type==='tank'?'#8844cc':e.type==='sniper'?'#44cc44':e.type==='runner'?'#ff8800':e.type==='boss'?'#ff0066':'#ff3333';
    const r=e.type==='boss'?5:3;
    mmCtx.beginPath();mmCtx.arc(ex,ez,r,0,Math.PI*2);mmCtx.fill();
  });

  // player (center)
  mmCtx.fillStyle='#ffffff';
  mmCtx.beginPath();mmCtx.arc(cx,cy,3,0,Math.PI*2);mmCtx.fill();
  // direction indicator
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(camera.quaternion);
  mmCtx.strokeStyle='#ffffff';mmCtx.lineWidth=1.5;
  mmCtx.beginPath();mmCtx.moveTo(cx,cy);
  mmCtx.lineTo(cx+dir.x*12,cy+dir.z*12);mmCtx.stroke();

  // border
  mmCtx.strokeStyle='rgba(255,255,255,.08)';mmCtx.lineWidth=1;
  mmCtx.strokeRect(0,0,MM_SIZE,MM_SIZE);
}

