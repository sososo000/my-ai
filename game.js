/** 휴지 슛! 콧물 쏙! v4 - 기록 랭킹 시스템 */
const DW=640,DH=960,FR='assets/characters/tissue-otter/frames/normalized-320/';
const HOLES=[
  {x:130,y:430},{x:320,y:410},{x:510,y:430},
  {x:100,y:575},{x:320,y:560},{x:540,y:575},
  {x:140,y:720},{x:320,y:710},{x:500,y:720}
];
const NH=HOLES.length,MAX_P=8,MAX_HP=5;
const STORAGE_KEY='tissue-shoot-records';
// 속도 개선: 더 빠른 스폰, 더 짧은 타이밍
const BASE_SPAWN_INTERVAL=0.8; // 원래 1.2
const BASE_AVAILABLE_TIME=1.1;  // 원래 1.5
const FNAME=['01-idle-smile','02-nose-tickle-anticipation','03-snot-starts','04-snot-stretches',
  '05-peak-timing-target','06-perfect-hit-surprise','07-tissue-pop-into-nose',
  '08-relieved-sparkle-smile','09-wink','10-combo-happy-bounce','11-missed-timing-panic',
  '12-snot-covers-face','13-teary-sad','14-recovery-sniffle','15-left-peek','16-right-peek',
  '17-popup-from-hole','18-duck-down','19-clap','20-dizzy-wobble','21-big-inhale',
  '22-sneeze-windup','23-sneeze-release','24-game-over-pout'];

// 이미지 로더
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

// 파티클
class Particle{
  constructor(x,y,col){this.x=x;this.y=y;this.col=col;
    this.vx=(Math.random()-.5)*300;this.vy=-150-Math.random()*200;this.life=1;this.sz=3+Math.random()*5}
  update(dt){this.x+=this.vx*dt;this.y+=this.vy*dt;this.vy+=300*dt;this.life-=dt*1.5}
  draw(c){if(this.life<=0)return;c.globalAlpha=this.life;c.fillStyle=this.col;
    c.beginPath();c.arc(this.x,this.y,this.sz*this.life,0,Math.PI*2);c.fill();c.globalAlpha=1}
}

// 플로팅 텍스트
class FloatText{
  constructor(x,y,text,col,sz){this.x=x;this.y=y;this.text=text;this.col=col;this.sz=sz||28;this.life=1.5}
  update(dt){this.y-=80*dt;this.life-=dt}
  draw(c){if(this.life<=0)return;c.globalAlpha=Math.min(this.life*2,1);
    c.font=`bold ${this.sz}px "Segoe UI",sans-serif`;c.textAlign='center';
    c.strokeStyle='rgba(0,0,0,.7)';c.lineWidth=4;c.strokeText(this.text,this.x,this.y);
    c.fillStyle=this.col;c.fillText(this.text,this.x,this.y);c.globalAlpha=1}
}

// 구멍 슬롯
class Hole{
  constructor(idx){this.idx=idx;this.x=HOLES[idx].x;this.y=HOLES[idx].y;
    this.state='hidden';this.timer=0;this.timeLeft=0;this.totalTime=1.5;
    this.scale=0;this.golden=false;this.judged=false}
  reset(){this.state='hidden';this.timer=0;this.timeLeft=0;this.scale=0;this.golden=false;this.judged=false}
  appear(total,golden){
    this.state='appearing';this.timer=0;this.scale=.3;
    this.totalTime=total;this.timeLeft=total;this.golden=golden;this.judged=false}
  update(dt,onMiss){
    if(this.state==='hidden')return;
    if(this.state==='appearing'){
      this.timer+=dt;this.scale=Math.min(1,this.scale+dt*5);
      if(this.timer>.25){this.state='ready';this.timer=0}return}
    if(this.state==='ready'){
      this.timer+=dt;this.timeLeft-=dt;
      if(this.timeLeft<=0&&!this.judged){this.judged=true;this.state='missing';this.timer=0;if(onMiss)onMiss(this)}
      return}
    if(this.state==='perfect'||this.state==='missing'){
      this.timer+=dt;this.scale-=dt*3;
      if(this.scale<=0){this.state='hidden';this.scale=0}return}
  }
  onTap(){
    if(this.state!=='ready'||this.judged)return null;
    this.judged=true;this.state='perfect';this.timer=0;return'perfect'}
}

// 메인 게임
class Game{
  constructor(cv){
    this.cv=cv;this.c=cv.getContext('2d');
    this.ld=new Loader();
    this.state='LOBBY'; // LOBBY, PLAYING, TURN_END, BOARD
    this.players=[];this.curPlayer=0;
    this.score=0;this.combo=0;this.maxCombo=0;this.hp=MAX_HP;
    this.holes=[];for(let i=0;i<NH;i++)this.holes.push(new Hole(i));
    this.spawnTimer=0;this.spawnInterval=1.2;
    this.goldenTimer=0;this.goldenInterval=10;
    this.time=0;
    this.particles=[];this.floats=[];
    this.cursorX=DW/2;this.cursorY=DH/2;this.cursorVis=false;
    this.turnScore=0;this.turnMaxCombo=0;
    this.resize();
    window.addEventListener('resize',()=>this.resize());
    this.setupInput();
  }

  resize(){
    const d=window.devicePixelRatio||1;
    const vw=window.innerWidth,vh=window.innerHeight;
    const a=DW/DH;let cw,ch;
    if(vw/vh>a){ch=vh;cw=ch*a}else{cw=vw;ch=cw/a}
    this.cv.style.width=cw+'px';this.cv.style.height=ch+'px';
    this.cv.width=DW*d;this.cv.height=DH*d;
    this.c.setTransform(d,0,0,d,0,0);
    this.scale2=cw/DW;
  }

  setupInput(){
    const gp=e=>{const r=this.cv.getBoundingClientRect();
      const cx=e.touches?(e.touches[0]||e.changedTouches[0]).clientX:e.clientX;
      const cy=e.touches?(e.touches[0]||e.changedTouches[0]).clientY:e.clientY;
      return{x:(cx-r.left)/this.scale2,y:(cy-r.top)/this.scale2}};
    
    this.cv.addEventListener('mousemove',e=>{const p=gp(e);this.cursorX=p.x;this.cursorY=p.y;this.cursorVis=true});
    this.cv.addEventListener('mouseleave',()=>{this.cursorVis=false});
    this.cv.addEventListener('mousedown',e=>{const p=gp(e);this.cursorX=p.x;this.cursorY=p.y;this.cursorVis=true;this.tap(p.x,p.y)});
    this.cv.addEventListener('touchstart',e=>{e.preventDefault();const p=gp(e);this.cursorX=p.x;this.cursorY=p.y;this.cursorVis=true;this.tap(p.x,p.y)},{passive:false});
  }

  tap(tx,ty){
    if(this.state!=='PLAYING')return;
    for(const h of this.holes){
      if(h.state==='ready'&&!h.judged){
        const d=Math.sqrt((tx-h.x)**2+(ty-h.y)**2);
        if(d<100){
          const r=h.onTap();
          if(r)this.onPerfect(h);
          return;
        }
      }
    }
  }

  onPerfect(h){
    this.combo++;this.score+=100+this.combo*20;this.turnScore=this.score;
    if(this.combo>this.maxCombo)this.turnMaxCombo=this.combo;
    if(this.combo>this.maxCombo)this.maxCombo=this.combo;
    this.floats.push(new FloatText(h.x,h.y-60,this.combo>=3?'! x'+this.combo:'쏙! Perfect!','#FFD54F',32));
    this.floats.push(new FloatText(h.x+50,h.y-30,'+'+(100+this.combo*20),'#4FC3F7',22));
    for(let i=0;i<15;i++)this.particles.push(new Particle(h.x,h.y,'#4FC3F7'));
  }

  onMiss(h){
    this.combo=0;this.hp--;
    this.floats.push(new FloatText(h.x,h.y-60,'Miss! 💧','#FF5252',30));
    if(this.hp<=0){
      this.hp=0;
      this.players[this.curPlayer].score=this.turnScore;
      this.players[this.curPlayer].maxCombo=this.turnMaxCombo;
      this.state='TURN_END';
    }
  }

  spawn(dt){
    if(this.state!=='PLAYING')return;
    this.spawnTimer+=dt;
    // 속도가 점점 빨라짐 (콤보가 높을수록 스폰 빠름)
    const dynamicInterval = Math.max(0.45, BASE_SPAWN_INTERVAL - this.combo * 0.04);
    if(this.spawnTimer>=dynamicInterval){
      this.spawnTimer=0;
      const avail=this.holes.filter(h=>h.state==='hidden');
      if(avail.length===0)return;
      const h=avail[Math.floor(Math.random()*avail.length)];
      h.appear(BASE_AVAILABLE_TIME,false);
      // 가끔 2개 동시 스폰 (콤보 높을 때)
      if(this.combo >= 5 && Math.random() < 0.35){
        const avail2=this.holes.filter(h2=>h2.state==='hidden'&&h2!==h);
        if(avail2.length>0){
          const h2=avail2[Math.floor(Math.random()*avail2.length)];
          h2.appear(BASE_AVAILABLE_TIME,false);
        }
      }
    }
    this.goldenTimer+=dt;
    if(this.goldenTimer>=this.goldenInterval){
      this.goldenTimer=0;
      const avail=this.holes.filter(h=>h.state==='hidden');
      if(avail.length===0)return;
      const h=avail[Math.floor(Math.random()*avail.length)];
      h.appear(BASE_AVAILABLE_TIME,true);
    }
  }

  update(dt){
    this.time+=dt;
    if(this.state==='PLAYING'){
      this.spawn(dt);
      for(const h of this.holes)h.update(dt,h2=>this.onMiss(h2));
    }
    this.particles=this.particles.filter(p=>{p.update(dt);return p.life>0});
    this.floats=this.floats.filter(t=>{t.update(dt);return t.life>0});
  }

  drawTissueCursor(c, cx, cy){
    c.save();
    c.translate(cx, cy);
    // 살짝 기울여서 자연스러움
    c.rotate(-0.15);

    // === 아래: 꼬깔콘 (콘지) ===
    // 콘 본체 (노란색-갈색 꼬깔)
    const coneH = 32, coneW = 22;
    const coneGrad = c.createLinearGradient(-coneW/2, 0, coneW/2, coneH);
    coneGrad.addColorStop(0, '#F5D070');   // 밝은 노란
    coneGrad.addColorStop(0.5, '#D4A030'); // 중간 황금
    coneGrad.addColorStop(1, '#8B5E20');   // 진한 갈색 끝
    c.fillStyle = coneGrad;
    c.beginPath();
    c.moveTo(0, coneH + 4);            // 끝점 (아래 뾰족)
    c.lineTo(-coneW/2, -2);            // 좌상단
    c.quadraticCurveTo(0, -6, coneW/2, -2);
    c.lineTo(0, coneH + 4);
    c.closePath();
    c.fill();
    // 그릴 선
    c.strokeStyle = '#6B3F10';
    c.lineWidth = 1.2;
    c.stroke();
    // 와플 패턴 (콘 질감)
    c.strokeStyle = 'rgba(107,63,16,.35)';
    c.lineWidth = 0.8;
    for(let i = 1; i < 4; i++){
      const t = i/4;
      const y = -2 + (coneH+4 - (-2)) * t;
      const w = coneW/2 * (1-t*0.85);
      c.beginPath();
      c.moveTo(-w, y);
      c.lineTo(w, y);
      c.stroke();
    }
    for(let i = -2; i <= 2; i++){
      const x = i * 4;
      c.beginPath();
      c.moveTo(x, -2);
      c.lineTo(x*0.15, coneH+2);
      c.stroke();
    }

    // === 위: 돌돌 말린 휴지 토핑 ===
    // 휴지 베이스 (콘 꼭대기에 올린 크림처럼 둥글게)
    const tw = 18, th = 14;
    // 그림자
    c.fillStyle = 'rgba(0,0,0,.12)';
    c.beginPath();
    c.ellipse(1, -2, tw/2+2, 5, 0, 0, Math.PI*2);
    c.fill();
    // 크림처럼 둥근 흰 휴지 뭉치
    const tGrad = c.createRadialGradient(-2,-8,2, 0,-6,16);
    tGrad.addColorStop(0, '#FFFFFF');
    tGrad.addColorStop(0.6, '#F0F0F0');
    tGrad.addColorStop(1, '#D8D8D8');
    c.fillStyle = tGrad;
    c.beginPath();
    // 뭉게뭉게 크림 패턴
    c.moveTo(-tw/2, -2);
    c.quadraticCurveTo(-tw/2-2, -10, -6, -14);
    c.quadraticCurveTo(-3, -18, 0, -16);
    c.quadraticCurveTo(3, -18, 6, -14);
    c.quadraticCurveTo(tw/2+2, -10, tw/2, -2);
    c.quadraticCurveTo(tw/2-2, 2, 0, 2);
    c.quadraticCurveTo(-tw/2+2, 2, -tw/2, -2);
    c.closePath();
    c.fill();
    c.strokeStyle = '#B0B0B0';
    c.lineWidth = 1;
    c.stroke();

    // 휴지 말린 spirals (둥글게 말린 라인)
    c.strokeStyle = 'rgba(140,140,140,.55)';
    c.lineWidth = 1;
    c.beginPath();
    c.arc(-3, -9, 4, 0.3, Math.PI*1.6);
    c.stroke();
    c.beginPath();
    c.arc(4, -10, 3.5, -0.5, Math.PI*1.4);
    c.stroke();
    c.beginPath();
    c.arc(0, -6, 6, 0.2, Math.PI*1.3);
    c.stroke();

    // 반짝이 하이라이트
    c.fillStyle = 'rgba(255,255,255,.8)';
    c.beginPath();
    c.ellipse(-4, -14, 3, 1.5, -0.3, 0, Math.PI*2);
    c.fill();

    c.restore();
  }

  draw(){
    const c=this.c;
    // 배경 (LOBBY에서도 그림)
    const g=c.createLinearGradient(0,0,0,DH);
    g.addColorStop(0,'#87CEEB');g.addColorStop(.5,'#C8E6C9');g.addColorStop(1,'#66BB6A');
    c.fillStyle=g;c.fillRect(0,0,DW,DH);
    
    // 구름
    c.fillStyle='rgba(255,255,255,.6)';
    for(let i=0;i<5;i++){const x=(i*150+this.time*20)%900-50,y=40+i*30;
      c.beginPath();c.arc(x,y,25,0,Math.PI*2);c.arc(x+20,y-10,20,0,Math.PI*2);c.arc(x+40,y,22,0,Math.PI*2);c.fill()}

    // 구멍 그리기
    for(const h of this.holes){
      c.fillStyle='rgba(0,0,0,.2)';c.beginPath();c.ellipse(h.x,h.y+10,50,22,0,0,Math.PI*2);c.fill();
      c.fillStyle='#5D4037';c.beginPath();c.ellipse(h.x,h.y,50,22,0,0,Math.PI*2);c.fill();
      c.fillStyle='#3E2723';c.beginPath();c.ellipse(h.x,h.y+2,40,16,0,0,Math.PI*2);c.fill();
    }

    // 캐릭터 그리기
    for(const h of this.holes){
      if(h.state==='hidden')continue;
      const img=this.ld.get(h.judged?(h.state==='perfect'?5:10):(this.time*.05|h.mode||0));
      const cs=130*h.scale;
      if(h.state!=='hidden'){
        const fi=h.state==='appearing'?Math.min(h.timer*4,1):h.state==='perfect'?.7:h.state==='missing'?.5:1;
        // 캐릭터 프레임
        const fIdx=h.state==='perfect'?6:h.state==='missing'?11:0;
        const img=this.ld.get(fIdx);
        if(img&&img.complete&&img.naturalWidth){
          c.save();c.globalAlpha=fi;
          c.drawImage(img,h.x-cs/2,h.y-cs/2-20,cs,cs);
          c.restore();
        }
        // 타이머 링
        if(h.state==='ready'&&!h.judged){
          const ratio=h.timeLeft/h.totalTime;
          const urgent=ratio<.3;
          c.lineWidth=4;
          c.strokeStyle=urgent?'rgba(255,50,50,.8)':'rgba(255,255,255,.5)';
          c.beginPath();c.arc(h.x,h.y-10,65,0,Math.PI*2);c.stroke();
          c.strokeStyle=urgent?'#FF5252':h.golden?'#FFD700':'#69F0AE';
          c.lineWidth=6;c.lineCap='round';
          c.beginPath();c.arc(h.x,h.y-10,65,-Math.PI/2,-Math.PI/2+ratio*Math.PI*2);c.stroke();
          c.lineCap='butt';
          c.font='bold 20px sans-serif';c.textAlign='center';
          c.fillStyle=urgent?'#FF5252':'#FFEB3B';
          c.fillText('TAP! 🧻',h.x,h.y-85);
        }
      }
    }

    // 파티클
    this.particles.forEach(p=>p.draw(c));
    this.floats.forEach(t=>t.draw(c));

    // 커서: 꼬깔콘 + 돌돌 말린 휴지
    if(this.cursorVis){
      this.drawTissueCursor(c, this.cursorX, this.cursorY);
    }

    // HUD
    if(this.state==='PLAYING'){
      // 배경 바
      c.fillStyle='rgba(0,0,0,.3)';
      c.beginPath();c.moveTo(16,0);c.lineTo(DW-16,0);c.arcTo(DW,0,DW,16,16);c.lineTo(DW,66);c.lineTo(0,66);c.lineTo(0,16);c.arcTo(0,0,16,0,16);c.fill();
      
      // 점수
      c.font='bold 32px sans-serif';c.textAlign='left';c.textBaseline='middle';
      c.fillStyle='#FFD54F';c.fillText('⭐ '+this.score,20,33);
      
      // 콤보
      if(this.combo>=2){
        c.textAlign='right';c.font='bold 28px sans-serif';
        c.fillStyle=this.combo>=5?'#FFD700':'#69F0AE';
        c.fillText('🔥 x'+this.combo,DW-20,33);
      }
      
      // 하트
      c.textAlign='center';
      for(let i=0;i<MAX_HP;i++){
        c.fillText(i<this.hp?'❤️':'',DW/2-(MAX_HP-1)*15+i*30,33);
      }

      // 플레이어 이름
      c.textAlign='left';c.font='bold 16px sans-serif';c.fillStyle='#FFEB3B';
      c.fillText('현재: '+this.players[this.curPlayer].name,12,90);
    }
  }

  loop(ts){
    const dt=Math.min((ts-(this.lastTs||ts))/1000,.05);this.lastTs=ts;
    this.update(dt);this.draw();
    this.raf=requestAnimationFrame(t=>this.loop(t));
  }
  start(){this.lastTs=performance.now();this.loop(this.lastTs)}
}

// 초기화
window.addEventListener('load',()=>{
  const cv=document.getElementById('gameCanvas');
  if(!cv)return;
  cv.style.cursor='none';
  
  const game=new Game(cv);
  
  // UI 요소
  const $=id=>document.getElementById(id);
  const input=$('nameInput'),addBtn=$('addBtn'),startBtn=$('startBtn'),clearBtn=$('clearBtn');
  const listEl=$('playerList'),turnBtn=$('turnNextBtn'),boardBtn=$('boardAgainBtn');
  
  const renderList=()=>{
    if(game.players.length===0){
      listEl.innerHTML='<div style="color:#aaa;text-align:center;padding:30px;font-size:14px">👇 이름을 입력하고 + 버튼을 누르세요</div>';
    }else{
      listEl.innerHTML='';
      game.players.forEach((p,i)=>{
        const d=document.createElement('div');
        d.className='player-item'+(i===0&&game.players.length>1?' top':'');
        d.innerHTML='<span class="player-num">'+(i+1)+'</span><span class="player-name">'+p.name+'</span><button class="player-x" title="제거">✕</button>';
        d.querySelector('.player-x').addEventListener('click',()=>{game.players.splice(i,1);renderList();updateBtns()});
        listEl.appendChild(d);
      });
    }
    updateBtns();
  };
  
  // === 기록 랭킹 시스템 (localStorage) ===
  const loadRecords=()=>{
    try{
      const raw=localStorage.getItem(STORAGE_KEY);
      return raw?JSON.parse(raw):[];
    }catch(e){return []}
  };
  const saveRecords=(records)=>{
    try{localStorage.setItem(STORAGE_KEY,JSON.stringify(records))}catch(e){}
  };
  // 플레이어 기록 저장/업데이트: 기존 기록이 있으면 최고 점수 갱신
  const upsertRecord=(name,score,maxCombo)=>{
    const records=loadRecords();
    const existing=records.find(r=>r.name===name);
    if(existing){
      if(score>existing.bestScore)existing.bestScore=score;
      if(maxCombo>existing.bestCombo)existing.bestCombo=maxCombo;
      existing.plays=(existing.plays||0)+1;
      existing.lastPlayed=Date.now();
    }else{
      records.push({name,bestScore:score,bestCombo:maxCombo,plays:1,lastPlayed:Date.now()});
    }
    // 점수 내림차순 정렬
    records.sort((a,b)=>b.bestScore-a.bestScore);
    saveRecords(records);
    return records;
  };

  const updateBtns=()=>{
    startBtn.disabled=game.players.length<1; // 1명부터 시작 가능
    addBtn.disabled=game.players.length>=MAX_P;
  };
  
  const addPlayer=()=>{
    const v=input.value.trim();
    if(!v||game.players.length>=MAX_P)return;
    if(game.players.some(p=>p.name===v))return;
    game.players.push({name:v,score:0,maxCombo:0});
    input.value='';input.focus();
    renderList();
  };
  
  addBtn.addEventListener('click',e=>{e.preventDefault();addPlayer()});
  input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();addPlayer()}});
  clearBtn.addEventListener('click',()=>{game.players=[];game.curPlayer=0;renderList()});
  
  // 모든 플레이어 기록 저장 (턴 종료 시 호출)
  const saveCurrentPlayerRecord=()=>{
    const p=game.players[game.curPlayer];
    if(!p)return;
    upsertRecord(p.name, game.turnScore, game.turnMaxCombo);
  };

  startBtn.addEventListener('click',()=>{
    if(game.players.length<1)return;  // 1인 플레이 가능
    game.curPlayer=0;
    $('lobby').classList.add('hidden');
    $('turnOverlay').classList.add('hidden');
    $('boardOverlay').classList.add('hidden');
    game.state='PLAYING';
    game.score=0;game.combo=0;game.maxCombo=0;game.hp=MAX_HP;
    game.turnScore=0;game.turnMaxCombo=0;
    game.spawnTimer=0;game.goldenTimer=0;
    game.particles=[];game.floats=[];
    game.holes.forEach(h=>h.reset());
  });
  
  turnBtn.addEventListener('click',()=>{
    game.curPlayer++;
    if(game.curPlayer>=game.players.length){
      // 전부 끝 → 최종 누적 랭킹
      showBoard();
    }else{
      // 다음 플레이어로 진행
      $('turnOverlay').classList.add('hidden');
      game.state='PLAYING';
      game.score=0;game.combo=0;game.maxCombo=0;game.hp=MAX_HP;
      game.turnScore=0;game.turnMaxCombo=0;
      game.spawnTimer=0;game.goldenTimer=0;
      game.particles=[];game.floats=[];
      game.holes.forEach(h=>h.reset());
    }
  });
  
  boardBtn.addEventListener('click',()=>{
    $('boardOverlay').classList.add('hidden');
    $('lobby').classList.remove('hidden');
    game.players.forEach(p=>{p.score=0;p.maxCombo=0});
    game.curPlayer=0;game.state='LOBBY';
    renderList();
  });
  
  // 턴 종료 시: 기록 저장 → (다음 플레이어 있으면 턴 화면, 없으면 바로 최종 순위)
  const showBoard=()=>{
    $('turnOverlay').classList.add('hidden');
    const list=$('boardList');list.innerHTML='';
    // 최종 순위 = localStorage에 누적된 전체 기록 (최대 10명)
    const records=loadRecords().slice(0,10);
    if(records.length===0){
      list.innerHTML='<div style="color:#BFB8D6;text-align:center;padding:20px">아직 기록이 없어요!</div>';
    }else{
      const medals=['🥇','🥈','🥉'];
      records.forEach((r,i)=>{
        const d=document.createElement('div');
        d.className='board-row rank-'+(i+1);
        const rankLabel = i<3 ? medals[i] : (i+1)+'등';
        const comboText = r.bestCombo>0 ? ' · 🔥 x'+r.bestCombo : '';
        const playsText = r.plays>1 ? ' · '+r.plays+'판' : '';
        d.innerHTML='<span class="board-rank">'+rankLabel+'</span><span class="board-name">'+r.name+'</span><span class="board-score">⭐ '+r.bestScore+playsText+'</span>';
        list.appendChild(d);
      });
    }
    $('boardOverlay').classList.remove('hidden');
  };

  const origOnMiss=game.onMiss.bind(game);
  game.onMiss=function(h){
    origOnMiss(h);
    if(game.state==='TURN_END'){
      // 이번 플레이어 기록 저장
      saveCurrentPlayerRecord();

      const nextIdx=game.curPlayer+1;
      if(nextIdx<game.players.length){
        // 다음 플레이어 있으면 → 턴 전환 화면
        $('turnPrevName').textContent=game.players[game.curPlayer].name+'의 차례 끝!';
        $('turnPrevScore').textContent='⭐ '+game.turnScore;
        $('turnPrevCo').textContent='🔥 최대 콤보 '+game.turnMaxCombo;
        $('turnNextName').textContent=game.players[nextIdx].name;
        $('turnOrder').textContent='순서 '+(nextIdx+1)+'/'+game.players.length;
        $('turnOverlay').classList.remove('hidden');
        $('boardOverlay').classList.add('hidden');
      }else{
        // 전부 끝 → 바로 최종 랭킹 표시
        showBoard();
      }
    }
  };
  
  renderList();
  
  // 리소스 로딩 후 게임 루프 시작
  game.ld.load(()=>{game.start()});
});