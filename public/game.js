// 휴지 슛! v4 - Next.js 호환 버전
// 자동 실행 없음: React에서 window.initTissueGame() 호출해야 함
'use strict';

const DW=640, DH=960;
const FR='assets/characters/tissue-otter/frames/normalized-320/';
const HOLES=[
  {x:130,y:430},{x:320,y:410},{x:510,y:430},
  {x:100,y:575},{x:320,y:560},{x:540,y:575},
  {x:140,y:720},{x:320,y:710},{x:500,y:720}
];
const NH=HOLES.length, MAX_P=8, MAX_HP=5;
const STORAGE_KEY='tissue-shoot-records';
const BASE_SPAWN_INTERVAL=1.2;
const BASE_AVAILABLE_TIME=1.5;
const FNAME=['01-idle-smile','02-nose-tickle-anticipation','03-snot-starts','04-snot-stretches',
  '05-peak-timing-target','06-perfect-hit-surprise','07-tissue-pop-into-nose',
  '08-relieved-sparkle-smile','09-wink','10-combo-happy-bounce','11-missed-timing-panic',
  '12-snot-covers-face','13-teary-sad','14-recovery-sniffle','15-left-peek','16-right-peek',
  '17-popup-from-hole','18-duck-down','19-clap','20-dizzy-wobble','21-big-inhale',
  '22-sneeze-windup','23-sneeze-release','24-game-over-pout'];

class Loader{
  constructor(){this.img=[];this.done=false;this.cb=null}
  load(cb){this.cb=cb;FNAME.forEach((n,i)=>{
    const m=new Image();
    m.onload=()=>{this.img[i]=m;if(i===FNAME.length-1){this.done=true;if(this.cb)this.cb()}};
    m.onerror=()=>{this.img[i]=null;if(i===FNAME.length-1){this.done=true;if(this.cb)this.cb()}};
    m.src=FR+n+'.png';
  })}
  get(i){return this.img[i]||null}
}

class Game{
  constructor(cv){
    this.cv=cv;this.c=cv.getContext('2d');
    this.ld=new Loader();
    this.state='LOBBY';
    this.players=[];this.curPlayer=0;
    this.score=0;this.combo=0;this.maxCombo=0;this.hp=MAX_HP;
    this.holes=[];for(let i=0;i<NH;i++)this.holes.push({idx:i,x:HOLES[i].x,y:HOLES[i].y,state:'hidden',timer:0,timeLeft:0,totalTime:1.5,scale:0,golden:false,judged:false,reset(){this.state='hidden';this.timer=0;this.timeLeft=0;this.scale=0;this.golden=false;this.judged=false},appear(t,g){this.state='appearing';this.timer=0;this.scale=.3;this.totalTime=t;this.timeLeft=t;this.golden=g;this.judged=false},update(dt,cb){if(this.state==='hidden')return;if(this.state==='appearing'){this.timer+=dt;this.scale=Math.min(1,this.scale+dt*5);if(this.timer>.25){this.state='ready';this.timer=0}return}if(this.state==='ready'){this.timer+=dt;this.timeLeft-=dt;if(this.timeLeft<=0&&!this.judged){this.judged=true;this.state='missing';if(cb)cb(this)}return}if(this.state==='perfect'||this.state==='missing'){this.timer+=dt;this.scale-=dt*3;if(this.scale<=0){this.state='hidden';this.scale=0}return}},onTap(){if(this.state!=='ready'||this.judged)return null;this.judged=true;this.state='perfect';return'perfect'}});
    this.spawnTimer=0;this.goldenTimer=0;this.time=0;
    this.particles=[];this.floats=[];
    this.cursorX=DW/2;this.cursorY=DH/2;this.cursorVis=false;
    this.turnScore=0;this.turnMaxCombo=0;
    this.resize();
    window.addEventListener('resize',()=>this.resize());
  }

  resize(){
    const d=window.devicePixelRatio||1;
    const vw=window.innerWidth,vh=window.innerHeight;
    const a=DW/DH;let cw,ch;
    if(vw/vh>a){ch=vh;cw=ch*a}else{cw=vw;ch=cw/a}
    this.cv.style.width=cw+'px';this.cv.style.height=ch+'px';
    this.cv.width=DW*d;this.cv.height=DH*d;
    this.c.setTransform(d,0,0,d,0,0);
    this.sc=cw/DW;
  }

  tap(tx,ty){
    if(this.state!=='PLAYING')return;
    for(const h of this.holes){
      if(h.state==='ready'&&!h.judged){
        if(Math.sqrt((tx-h.x)**2+(ty-h.y)**2)<100){
          const r=h.onTap();if(r){this.combo++;this.score+=100+this.combo*20;this.turnScore=this.score;if(this.combo>this.maxCombo)this.turnMaxCombo=this.combo;this.floats.push({x:h.x,y:h.y-60,text:this.combo>=3?'! x'+this.combo:'쏙! Perfect!',col:'#FFD54F',sz:32,life:1.5,update(dt){this.y-=80*dt;this.life-=dt},draw(c){if(this.life<=0)return;c.globalAlpha=Math.min(this.life*2,1);c.font='bold 32px Jua,sans-serif';c.textAlign='center';c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=4;c.strokeText(this.text,this.x,this.y);c.fillStyle=this.col;c.fillText(this.text,this.x,this.y);c.globalAlpha=1}});for(let i=0;i<15;i++)this.particles.push({x:h.x,y:h.y,vx:(Math.random()-.5)*300,vy:-150-Math.random()*200,life:1,sz:3+Math.random()*5,update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vy+=300*dt;this.life-=dt*1.5},draw(c){if(this.life<=0)return;c.globalAlpha=this.life;c.fillStyle='#4FC3F7';c.beginPath();c.arc(this.x,this.y,this.sz*this.life,0,Math.PI*2);c.fill();c.globalAlpha=1}})}
          return;
        }
      }
    }
  }

  onMiss(h){
    this.combo=0;this.hp--;
    this.floats.push({x:h.x,y:h.y-60,text:'Miss! 💧',col:'#FF5252',sz:30,life:1.5,update(dt){this.y-=80*dt;this.life-=dt},draw(c){if(this.life<=0)return;c.globalAlpha=Math.min(this.life*2,1);c.font='bold 30px Jua,sans-serif';c.textAlign='center';c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=4;c.strokeText(this.text,this.x,this.y);c.fillStyle=this.col;c.fillText(this.text,this.x,this.y);c.globalAlpha=1}});
    if(this.hp<=0){this.hp=0;if(this.players[this.curPlayer]){this.players[this.curPlayer].score=this.turnScore;this.players[this.curPlayer].maxCombo=this.turnMaxCombo}this.state='TURN_END'}
  }

  spawn(dt){
    if(this.state!=='PLAYING')return;
    this.spawnTimer+=dt;
    const dyn=Math.max(0.45,BASE_SPAWN_INTERVAL-this.combo*0.04);
    if(this.spawnTimer>=dyn){
      this.spawnTimer=0;
      const av=this.holes.filter(h=>h.state==='hidden');
      if(av.length===0)return;
      const h=av[Math.floor(Math.random()*av.length)];
      h.appear(BASE_AVAILABLE_TIME,false);
      if(this.combo>=8&&Math.random()<0.15){const av2=this.holes.filter(h2=>h2.state==='hidden'&&h2!==h);if(av2.length>0)av2[Math.floor(Math.random()*av2.length)].appear(BASE_AVAILABLE_TIME,false)}
    }
    this.goldenTimer+=dt;
    if(this.goldenTimer>=10){this.goldenTimer=0;const av=this.holes.filter(h=>h.state==='hidden');if(av.length>0)av[Math.floor(Math.random()*av.length)].appear(BASE_AVAILABLE_TIME,true)}
  }

  update(dt){
    this.time+=dt;
    if(this.state==='PLAYING'){this.spawn(dt);for(const h of this.holes)h.update(dt,h2=>this.onMiss(h2))}
    this.particles=this.particles.filter(p=>{p.update(dt);return p.life>0});
    this.floats=this.floats.filter(t=>{t.update(dt);return t.life>0});
  }

  draw(){
    const c=this.c;
    c.fillStyle='#B8DAF4';c.fillRect(0,0,DW,DH);
    c.fillStyle='#70B673';c.fillRect(0,DH*0.5,DW,DH*0.5);
    for(const h of this.holes){c.fillStyle='#5D9E60';c.beginPath();c.ellipse(h.x,h.y+60,50,16,0,0,Math.PI*2);c.fill();c.fillStyle='#3A2415';c.beginPath();c.ellipse(h.x,h.y+60,40,14,0,0,Math.PI*2);c.fill()}
    if(this.state==='PLAYING'){c.font='28px Jua';c.fillStyle='#FFE156';c.fillText('⭐ '+this.score,20,30);c.fillText('❤️'.repeat(this.hp),DW/2-60,30);if(this.combo>=2){c.fillStyle='#7BFFCB';c.fillText('x'+this.combo,DW-80,30)}}
    this.particles.forEach(p=>p.draw(c));
    this.floats.forEach(t=>t.draw(c));
  }

  start(){this.ld.start=()=>{this.lastTs=performance.now();const loop=(ts)=>{const dt=Math.min((ts-(this.lastTs||ts))/1000,.05);this.lastTs=ts;this.update(dt);this.draw();this.raf=requestAnimationFrame(loop)};requestAnimationFrame(loop)}}
}

function initGame(canvasEl){
  const cv=canvasEl||document.getElementById('gameCanvas');
  if(!cv)return;
  cv.style.cursor='none';
  const game=new Game(cv);
  let isComposing=false;
  const $=id=>document.getElementById(id);
  const input=$('nameInput'),addBtn=$('addBtn'),startBtn=$('startBtn'),clearBtn=$('clearBtn');
  const listEl=$('playerList'),turnBtn=$('turnNextBtn'),boardBtn=$('boardAgainBtn');
  
  let lastAddTime=0;
  const renderList=()=>{
    if(game.players.length===0){listEl.innerHTML='<div style="color:#999;text-align:center;padding:30px">👇 이름을 입력하고 +를 눌러보세요</div>'}
    else{listEl.innerHTML='';game.players.forEach((p,i)=>{const d=document.createElement('div');d.className='player-item';d.innerHTML='<span>'+p.name+'</span><button data-i="'+i+'">✕</button>';d.querySelector('button').onclick=()=>{game.players.splice(i,1);renderList()};listEl.appendChild(d)})}
    startBtn.disabled=game.players.length<1;addBtn.disabled=game.players.length>=MAX_P;
  };
  
  const addPlayer=()=>{const v=input.value.trim();if(!v||game.players.length>=MAX_P||game.players.some(p=>p.name===v))return;game.players.push({name:v,score:0,maxCombo:0});input.value='';renderList()};
  
  addBtn.addEventListener('click',addPlayer);
  input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!isComposing){e.preventDefault();addPlayer()}});
  input.addEventListener('compositionstart',()=>isComposing=true);
  input.addEventListener('compositionend',()=>isComposing=false);
  
  startBtn.addEventListener('click',()=>{if(game.players.length<1)return;game.curPlayer=0;game.state='PLAYING';game.score=0;game.combo=0;game.hp=MAX_HP;game.turnScore=0;game.turnMaxCombo=0;game.holes.forEach(h=>h.reset());$('lobby').classList.add('hidden')});
  
  clearBtn.addEventListener('click',()=>{game.players=[];renderList()});
  
  // 클릭/터치
  const gp=e=>{const r=cv.getBoundingClientRect();const cx=e.touches?e.touches[0].clientX:e.clientX;const cy=e.touches?e.touches[0].clientY:e.clientY;return{x:(cx-r.left)*(DW/r.width),y:(cy-r.top)*(DH/r.height)}};
  cv.addEventListener('mousedown',e=>{const p=gp(e);game.tap(p.x,p.y)});
  cv.addEventListener('touchstart',e=>{e.preventDefault();const p=gp(e);game.tap(p.x,p.y)},{passive:false});
  
  // 게임 루프 시작
  game.ld.load(()=>{const loop=(ts)=>{const dt=Math.min((ts-(game.lastTs||ts))/1000,.05);game.lastTs=ts;game.update(dt);game.draw();game.raf=requestAnimationFrame(loop)};requestAnimationFrame(loop)});
  renderList();
}

// window에만 노출 (자동 실행 금지)
if(typeof window!=='undefined'){window.initTissueGame=initGame}