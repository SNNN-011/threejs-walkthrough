// ═══════════════════════════════════════
//  AUDIO ENGINE (procedural)
// ═══════════════════════════════════════
const audioCtx = new (window.AudioContext||window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.gain.value=0.3;
masterGain.connect(audioCtx.destination);

function playSound(type){
  if(audioCtx.state==='suspended')audioCtx.resume();
  const t=audioCtx.currentTime;
  const g=audioCtx.createGain();g.connect(masterGain);
  const o=audioCtx.createOscillator();
  const n=audioCtx.createBufferSource();

  switch(type){
    case'pistol':{
      o.type='sawtooth';o.frequency.setValueAtTime(180,t);o.frequency.exponentialRampToValueAtTime(40,t+.08);
      g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.01,t+.1);
      o.connect(g);o.start(t);o.stop(t+.1);
      const buf=audioCtx.createBuffer(1,4410,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/800);
      const s=audioCtx.createBufferSource();s.buffer=buf;
      const sg=audioCtx.createGain();sg.gain.value=.4;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
    case'rifle':{
      o.type='sawtooth';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(30,t+.06);
      g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.01,t+.07);
      o.connect(g);o.start(t);o.stop(t+.07);
      const buf=audioCtx.createBuffer(1,3000,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/500);
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.5;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
    case'shotgun':{
      o.type='sawtooth';o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(20,t+.15);
      g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(.01,t+.2);
      o.connect(g);o.start(t);o.stop(t+.2);
      const buf=audioCtx.createBuffer(1,8820,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/2000)*2;
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.6;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
    case'sniper':{
      o.type='square';o.frequency.setValueAtTime(300,t);o.frequency.exponentialRampToValueAtTime(25,t+.2);
      g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(.01,t+.25);
      o.connect(g);o.start(t);o.stop(t+.25);
      const buf=audioCtx.createBuffer(1,13230,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/3000)*2.5;
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.7;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
    case'hit':{
      o.type='sine';o.frequency.setValueAtTime(800,t);o.frequency.exponentialRampToValueAtTime(200,t+.06);
      g.gain.setValueAtTime(.15,t);g.gain.exponentialRampToValueAtTime(.01,t+.06);
      o.connect(g);o.start(t);o.stop(t+.06);
      break;
    }
    case'headshot':{
      o.type='sine';o.frequency.setValueAtTime(1200,t);o.frequency.exponentialRampToValueAtTime(400,t+.08);
      g.gain.setValueAtTime(.2,t);g.gain.exponentialRampToValueAtTime(.01,t+.08);
      o.connect(g);o.start(t);o.stop(t+.08);
      const o2=audioCtx.createOscillator();o2.type='sine';o2.frequency.value=600;
      const g2=audioCtx.createGain();g2.gain.setValueAtTime(.1,t+.02);g2.gain.exponentialRampToValueAtTime(.01,t+.08);
      o2.connect(g2);g2.connect(masterGain);o2.start(t+.02);o2.stop(t+.08);
      break;
    }
    case'grenade':{
      const buf=audioCtx.createBuffer(1,44100,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++){const e=Math.exp(-i/8000);d[i]=(Math.random()-.5)*e*(1+Math.sin(i/50)*.5);}
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.7;s.connect(sg);sg.connect(masterGain);s.start(t);
      o.type='sine';o.frequency.setValueAtTime(60,t);o.frequency.exponentialRampToValueAtTime(15,t+.8);
      g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.01,t+.8);
      o.connect(g);o.start(t);o.stop(t+.8);
      break;
    }
    case'reload':{
      o.type='square';o.frequency.setValueAtTime(600,t);o.frequency.setValueAtTime(800,t+.05);
      g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.01,t+.1);
      o.connect(g);o.start(t);o.stop(t+.1);
      break;
    }
    case'pickup':{
      o.type='sine';o.frequency.setValueAtTime(500,t);o.frequency.exponentialRampToValueAtTime(1000,t+.15);
      g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.01,t+.15);
      o.connect(g);o.start(t);o.stop(t+.15);
      break;
    }
    case'explosion':{
      const buf=audioCtx.createBuffer(1,44100,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/6000);
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.8;s.connect(sg);sg.connect(masterGain);s.start(t);
      o.type='sine';o.frequency.setValueAtTime(80,t);o.frequency.exponentialRampToValueAtTime(10,t+.6);
      g.gain.setValueAtTime(.6,t);g.gain.exponentialRampToValueAtTime(.01,t+.6);
      o.connect(g);o.start(t);o.stop(t+.6);
      break;
    }
    case'enemy_hit':{
      o.type='triangle';o.frequency.setValueAtTime(400,t);o.frequency.exponentialRampToValueAtTime(100,t+.05);
      g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.01,t+.05);
      o.connect(g);o.start(t);o.stop(t+.05);
      break;
    }
    case'enemy_shoot':{
      o.type='sawtooth';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(50,t+.06);
      g.gain.setValueAtTime(.12,t);g.gain.exponentialRampToValueAtTime(.01,t+.06);
      o.connect(g);o.start(t);o.stop(t+.06);
      break;
    }
    case'dash':{
      o.type='sine';o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(600,t+.1);
      g.gain.setValueAtTime(.1,t);g.gain.exponentialRampToValueAtTime(.01,t+.12);
      o.connect(g);o.start(t);o.stop(t+.12);
      break;
    }
    case'footstep':{
      const buf=audioCtx.createBuffer(1,2205,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/400)*.3;
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.06;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
    case'shockwave':{
      const buf=audioCtx.createBuffer(1,44100,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/10000)*Math.sin(i/100);
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.6;s.connect(sg);sg.connect(masterGain);s.start(t);
      o.type='sine';o.frequency.setValueAtTime(40,t);o.frequency.exponentialRampToValueAtTime(8,t+.5);
      g.gain.setValueAtTime(.4,t);g.gain.exponentialRampToValueAtTime(.01,t+.5);
      o.connect(g);o.start(t);o.stop(t+.5);
      break;
    }
    case'turret_shoot':{
      o.type='square';o.frequency.setValueAtTime(350,t);o.frequency.exponentialRampToValueAtTime(80,t+.1);
      g.gain.setValueAtTime(.25,t);g.gain.exponentialRampToValueAtTime(.01,t+.12);
      o.connect(g);o.start(t);o.stop(t+.12);
      const buf=audioCtx.createBuffer(1,4410,44100);const d=buf.getChannelData(0);
      for(let i=0;i<d.length;i++)d[i]=(Math.random()-.5)*Math.exp(-i/600);
      const s=audioCtx.createBufferSource();s.buffer=buf;const sg=audioCtx.createGain();sg.gain.value=.3;s.connect(sg);sg.connect(masterGain);s.start(t);
      break;
    }
  }
}

