// ═══════════════════════════════════════
//  BULLET TIME
// ═══════════════════════════════════════
const BT_SLOW=0.3, BT_DUR=3, BT_CD=10;
let btActive=false,btTimer=0,btCDTimer=0,timeScale=1;

function activateBulletTime(){
  if(btCDTimer>0||btActive||!locked)return;
  btActive=true;btTimer=BT_DUR;
  timeScale=BT_SLOW;
  document.getElementById('bullettime-overlay').style.opacity='1';
  document.getElementById('bullettime-vignette').style.opacity='1';
  playSound('dash');
}

function deactivateBulletTime(){
  btActive=false;btCDTimer=BT_CD;
  timeScale=1;
  document.getElementById('bullettime-overlay').style.opacity='0';
  document.getElementById('bullettime-vignette').style.opacity='0';
}

// ═══════════════════════════════════════
//  DYNAMIC CROSSHAIR
// ═══════════════════════════════════════
let crosshairSpread=0;

function updateCrosshair(){
  const ch=document.getElementById('crosshair');
  const isSniper=WEAPONS[curW].scope&&scoped;
  if(isSniper){
    ch.style.opacity='0';
    return;
  }
  ch.style.opacity='1';
  const spread=Math.round(crosshairSpread);
  const t=ch.querySelector('.ch-t');t.style.top=(-16-spread)+'px';
  const b=ch.querySelector('.ch-b');b.style.bottom=(-16-spread)+'px';
  const l=ch.querySelector('.ch-l');l.style.left=(-16-spread)+'px';
  const r=ch.querySelector('.ch-r');r.style.right=(-16-spread)+'px';
}

// ═══════════════════════════════════════
//  DYNAMIC LIGHTING / TIME OF DAY
// ═══════════════════════════════════════
let dayTime=0; // 0-1 cycle
const DAY_SPEED=0.008; // cycles per wave approximately

function updateDayLighting(dt,waveNum){
  dayTime+=dt*DAY_SPEED;
  if(dayTime>1)dayTime-=1;

  // cycle: dawn(0) -> noon(0.25) -> dusk(0.5) -> night(0.75)
  const t=dayTime;
  let bgR,bgG,bgB,sunInt,ambInt,hemiInt;

  if(t<0.25){ // dawn to noon
    const p=t/0.25;
    bgR=0.06+0.04*p;bgG=0.06+0.06*p;bgB=0.14+0.04*p;
    sunInt=0.8+1.0*p;ambInt=0.8+0.6*p;hemiInt=0.5+0.3*p;
  } else if(t<0.5){ // noon to dusk
    const p=(t-0.25)/0.25;
    bgR=0.10-0.04*p+0.04*Math.sin(p*Math.PI);bgG=0.12-0.06*p;bgB=0.18-0.10*p;
    sunInt=1.8-0.6*p;ambInt=1.4-0.3*p;hemiInt=0.8-0.2*p;
  } else if(t<0.75){ // dusk to night
    const p=(t-0.5)/0.25;
    bgR=0.06-0.02*p;bgG=0.06-0.02*p;bgB=0.08-0.02*p;
    sunInt=1.2-0.6*p;ambInt=1.1-0.3*p;hemiInt=0.6-0.1*p;
  } else { // night to dawn
    const p=(t-0.75)/0.25;
    bgR=0.04+0.02*p;bgG=0.04+0.02*p;bgB=0.06+0.08*p;
    sunInt=0.6+0.4*p;ambInt=0.8+0.4*p;hemiInt=0.5+0.3*p;
  }

  // wave tint overlay
  const waveHue=(waveNum*0.07)%1;
  bgR+=Math.sin(waveHue*6.28)*0.015;
  bgG+=Math.sin(waveHue*6.28+2.09)*0.015;
  bgB+=Math.sin(waveHue*6.28+4.19)*0.015;

  scene.background.setRGB(Math.max(.08,bgR),Math.max(.08,bgG),Math.max(.12,bgB));
  scene.fog.color.copy(scene.background);
  sun.intensity=Math.max(0.1,sunInt);
  ambientLight.intensity=Math.max(0.1,ambInt);
  hemiLight.intensity=Math.max(0.05,hemiInt);
}

// ═══════════════════════════════════════
//  RENDERER / SCENE / CAMERA
// ═══════════════════════════════════════
const renderer=new THREE.WebGLRenderer({antialias:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=2.0;
document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();
scene.background=new THREE.Color(0x1a1a2e);
scene.fog=new THREE.FogExp2(0x1a1a2e,0.008);

const camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,500);
const weaponGroup=new THREE.Group();
camera.add(weaponGroup);
scene.add(camera);

// flashlight
const flashlight=new THREE.SpotLight(0xffffff,6,60,Math.PI/5,0.3,1);
flashlight.visible=false;
camera.add(flashlight);
flashlight.position.set(0,-0.1,0);
flashlight.target.position.set(0,-0.1,-1);
camera.add(flashlight.target);

// lights
const ambientLight=new THREE.AmbientLight(0x8888aa,1.2);
scene.add(ambientLight);
const sun=new THREE.DirectionalLight(0xffeedd,1.8);
sun.position.set(40,60,30);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);
const ss=60;sun.shadow.camera.left=-ss;sun.shadow.camera.right=ss;
sun.shadow.camera.top=ss;sun.shadow.camera.bottom=-ss;sun.shadow.camera.near=0.5;sun.shadow.camera.far=200;
sun.shadow.bias=-0.0003;scene.add(sun);
const hemiLight=new THREE.HemisphereLight(0x8899cc,0x444422,0.8);
scene.add(hemiLight);

