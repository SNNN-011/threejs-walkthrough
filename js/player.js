// ═══════════════════════════════════════
//  PLAYER PHYSICS
// ═══════════════════════════════════════
const velocity=new THREE.Vector3();
const curPlayerPos=new THREE.Vector3();
let footstepTimer=0;

function updatePlayer(dt){
  if(!locked)return;

  const speed=isDashing?0:(sprinting?SPRINT:WALK);
  velocity.x-=velocity.x*DAMP*dt;
  velocity.z-=velocity.z*DAMP*dt;
  velocity.y-=G*dt;
  velocity.y=Math.max(velocity.y,-30); // cap fall speed

  // dash
  if(isDashing){
    dashTimer-=dt;
    velocity.x=dashDir.x*DASH_SPEED;
    velocity.z=dashDir.z*DASH_SPEED;
    if(dashTimer<=0)isDashing=false;
  }

  const fwd=new THREE.Vector3();camera.getWorldDirection(fwd);fwd.y=0;fwd.normalize();
  const right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize();

  if(!isDashing){
    if(mF)velocity.addScaledVector(fwd,speed*dt*DAMP);
    if(mB)velocity.addScaledVector(fwd,-speed*dt*DAMP);
    if(mR)velocity.addScaledVector(right,speed*dt*DAMP);
    if(mL)velocity.addScaledVector(right,-speed*dt*DAMP);
  }

  pCol.translate(velocity.clone().multiplyScalar(dt));
  const result=worldOctree.capsuleIntersect(pCol);
  if(result){
    pCol.translate(result.normal.multiplyScalar(result.depth));
    if(result.normal.y>.5){canJump=true;velocity.y=0;}
  }
  // ground clamp — if capsule bottom dips below floor, snap back
  const groundY=PR+0.01;
  if(pCol.start.y<groundY){
    const diff=groundY-pCol.start.y;
    pCol.start.y+=diff;
    pCol.end.y+=diff;
    canJump=true;
    if(velocity.y<0)velocity.y=0;
  }
  if(pCol.end.y<-50){pCol.start.set(0,PR,5);pCol.end.set(0,PH,5);velocity.set(0,0,0);}

  const head=pCol.end.clone();head.y-=.15;
  camera.position.copy(head);

  // screen shake
  if(screenShakeAmt>0){
    camera.position.x+=(Math.random()-.5)*screenShakeAmt*.5;
    camera.position.y+=(Math.random()-.5)*screenShakeAmt*.3;
    screenShakeAmt*=.85;
    if(screenShakeAmt<.005)screenShakeAmt=0;
  }

  // head bob
  const moving=(mF||mB||mL||mR)&&canJump&&!isDashing;
  if(moving){
    const bs=sprinting?12:8,ba=sprinting?.035:.022;
    camera.position.y+=Math.sin(performance.now()/1000*bs)*ba;
    camera.position.x+=Math.cos(performance.now()/1000*bs*.5)*ba*.5;
  }

  // footstep sound
  if(moving){
    footstepTimer-=dt;
    if(footstepTimer<=0){playSound('footstep');footstepTimer=sprinting?.28:.38;}
  } else footstepTimer=0;

  // FOV
  const targetFOV=sprinting&&!scoped?85:scoped?25:75;
  baseFOV+=(targetFOV-baseFOV)*dt*8;
  if(!scoped){camera.fov=baseFOV;camera.updateProjectionMatrix();}

  curPlayerPos.copy(camera.position);
}

