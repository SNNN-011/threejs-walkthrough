// ═══════════════════════════════════════
//  CONFIG
// ═══════════════════════════════════════
const G=30,JUMP=10,WALK=5.5,SPRINT=9,PH=1.7,PR=0.35,SENS=0.002,DAMP=10;
const MAX_GRENADES=3,GRENADE_SPEED=18,GRENADE_FUSE=2,GRENADE_RADIUS=8,GRENADE_DMG=120;
const DASH_SPEED=35,DASH_DUR=0.15,DASH_CD=2;
const COMBO_WINDOW=3;

// base weapons (upgrades modify effective values at use time)
const WEAPONS=[
  {name:'PISTOL',mag:12,res:Infinity,fr:0.22,rt:1.2,dmg:28,spread:0.013,auto:false,range:200,recoil:0.035,snd:'pistol'},
  {name:'M4',mag:30,res:Infinity,fr:0.08,rt:2.0,dmg:20,spread:0.028,auto:true,range:180,recoil:0.02,snd:'rifle'},
  {name:'SHOTGUN',mag:8,res:Infinity,fr:0.65,rt:2.5,dmg:14,spread:0.09,auto:false,range:45,pellets:8,recoil:0.1,snd:'shotgun'},
  {name:'SNIPER',mag:5,res:Infinity,fr:1.1,rt:3.0,dmg:100,spread:0.002,auto:false,range:500,recoil:0.08,snd:'sniper',scope:true},
];

// enemy types
const ETYPES={
  runner:{name:'Runner',color:0xff6600,hp:40,speed:5.5,dmg:6,range:2,scale:.8,score:60,atkcd:0.6},
  grunt:{name:'Grunt',color:0xcc2222,hp:80,speed:2.8,dmg:10,range:2.5,scale:1,score:100,atkcd:1.0},
  tank:{name:'Tank',color:0x6633cc,hp:250,speed:1.5,dmg:20,range:3,scale:1.4,score:250,atkcd:1.5},
  sniper:{name:'Enemy Sniper',color:0x228833,hp:50,speed:2,dmg:15,range:40,scale:1,score:150,atkcd:2,ranged:true},
  boss:{name:'BOSS',color:0xff0044,hp:1000,speed:2.5,dmg:30,range:8,scale:3,score:1000,atkcd:2.5},

};

// ═══════════════════════════════════════
//  UPGRADE SYSTEM
// ═══════════════════════════════════════
const upgradeState={dmg:0,fr:0,mag:0,rt:0,grenades:0};

const UPGRADE_DEFS=[
  {id:'dmg',icon:'⚔️',name:'DAMAGE BOOST',desc:'+15% weapon damage (all weapons)',max:5,apply:()=>upgradeState.dmg++},
  {id:'fr',icon:'⚡',name:'FIRE RATE',desc:'+12% fire rate (all weapons)',max:5,apply:()=>upgradeState.fr++},
  {id:'mag',icon:'📦',name:'MAGAZINE SIZE',desc:'+20% magazine capacity',max:5,apply:()=>upgradeState.mag++},
  {id:'rt',icon:'🔄',name:'RELOAD SPEED',desc:'+18% faster reload',max:5,apply:()=>upgradeState.rt++},
  {id:'grenades',icon:'💣',name:'EXTRA GRENADE',desc:'+1 max grenade capacity',max:3,apply:()=>{upgradeState.grenades++;MAX_GRENADES_ACTUAL+=1;}},
];

let MAX_GRENADES_ACTUAL=MAX_GRENADES;

function getEffectiveWeapon(idx){
  const w=WEAPONS[idx];
  const d=1+upgradeState.dmg*0.15;
  const f=1/(1+upgradeState.fr*0.12);
  const m=Math.round(w.mag*(1+upgradeState.mag*0.2));
  const r=w.rt/(1+upgradeState.rt*0.18);
  return {...w,dmg:Math.round(w.dmg*d),fr:w.fr*f,mag:m,rt:r};
}

function showUpgradePanel(){
  const panel=document.getElementById('upgrade-panel');
  const choices=document.getElementById('upgrade-choices');
  choices.innerHTML='';
  // exit pointer lock so upgrade cards can receive clicks
  if(document.pointerLockElement)document.exitPointerLock();
  panel.style.display='flex';

  // pick 3 random upgrades
  const available=UPGRADE_DEFS.filter(u=>upgradeState[u.id]<u.max);
  const shuffled=available.sort(()=>Math.random()-.5).slice(0,3);

  shuffled.forEach(u=>{
    const card=document.createElement('div');
    card.className='ucard electric-border';
    card.innerHTML=`<div class="uicon">${u.icon}</div><div class="uname">${u.name}</div><div class="udesc">${u.desc}</div><div class="ulevel">LV ${upgradeState[u.id]+1}/${u.max}</div>`;
    card.onclick=()=>{
      u.apply();
      panel.style.display='none';
      document.body.requestPointerLock();
    };
    choices.appendChild(card);
  });

  // if no upgrades available, skip
  if(shuffled.length===0){
    panel.style.display='none';
  }
}

