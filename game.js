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

    // === 뾰족한 삼각형 휴지 커서 ===
    // 구멍에 쏙 찌르는 뾰족 끝이 위쪽 (게임: 위에서 아래로 누르므로)
    const W = 26;    // 너비
    const H = 34;    // 높이

    // 그림자
    c.fillStyle = 'rgba(0,0,0,.18)';
    c.beginPath();
    c.ellipse(1, -H/2+10, 8, 4, 0, 0, Math.PI*2);
    c.fill();

    // --- 전체: 뾰족 삼각형 (아래 넓고 위 뾰족) ---
    // 3D 그라데이션
    const g = c.createLinearGradient(-W/2, -H/2, W/2, H/2);
    g.addColorStop(0, '#FFFFFF');
    g.addColorStop(0.5, '#F0F0F0');
    g.addColorStop(1, '#D0D0D0');
    c.fillStyle = g;

    // 족 끝 위, 넓게 아래
    c.beginPath();
    c.moveTo(1, -H/2);               // 뾰족 끝 (위)
    c.lineTo(W/2-4, -H/2+8);
    c.lineTo(W/2-4, H/2-2);
    c.quadraticCurveTo(0, H/2+4, -W/2+4, H/2-2); // 아래 둥글게
    c.lineTo(-W/2+4, -H/2+8);
    c.closePath();
    c.fill();

    // 테두리
    c.strokeStyle = '#A8A8A8';
    c.lineWidth = 1;
    c.stroke();

    // --- 접힌 휴지 라인 (휴지 질감) ---
    c.strokeStyle = 'rgba(160,160,160,.4)';
    c.lineWidth = 0.8;
    // 좌측 대각선
    c.beginPath();
    c.moveTo(-W/2+6, -H/2+4);
    c.lineTo(-2, H/2-2);
    c.stroke();
    // 우측 대각선
    c.beginPath();
    c.moveTo(W/2-6, -H/2+4);
    c.lineTo(2, H/2-2);
    c.stroke();
    // 가운데 세로 줄
    c.beginPath();
    c.moveTo(0, -H/2);
    c.lineTo(0, H/2-4);
    c.stroke();

    // --- 위쪽 가장자리 (두툼한 휴지 가장자리) ---
    c.fillStyle = '#EAEAEA';
    c.strokeStyle = '#C0C0C0';
    c.lineWidth = 0.8;
    c.beginPath();
    c.ellipse(0, -H/2, W/2-2, 4, 0, 0, Math.PI*2);
    c.fill();
    c.stroke();

    // --- 하이라이트 ---
    c.fillStyle = 'rgba(255,255,255,.85)';
    c.beginPath();
    c.ellipse(-4, -H/2+2, 5, 2, -0.15, 0, Math.PI*2);
    c.fill();

    c.restore();
  }

  draw(){
    const c=this.c;
    // 1. 하늘 배경 그라데이션
    const sky=c.createLinearGradient(0,0,0,DH*0.45);
    sky.addColorStop(0,'#B8DAF4');
    sky.addColorStop(0.7,'#D6EDF8');
    sky.addColorStop(1,'#E8F4E6');
    c.fillStyle=sky;
    c.fillRect(0,0,DW,DH);

    // 2. 구름 (흰색~연녹 그라데이션)
    for(let i=0;i<6;i++){
      const bx=(i*130+this.time*12)%960-50;
      const by=50+((i*47)%120);
      const cloudGrad=c.createRadialGradient(bx,by,10,bx+20,by+10,70);
      cloudGrad.addColorStop(0,'rgba(255,255,255,.95)');
      cloudGrad.addColorStop(0.7,'rgba(240,252,240,.7)');
      cloudGrad.addColorStop(1,'rgba(200,230,220,.3)');
      c.fillStyle=cloudGrad;
      c.beginPath();
      c.arc(bx,by,38,0,Math.PI*2);c.arc(bx+30,by-8,32,0,Math.PI*2);
      c.arc(bx+60,by+4,35,0,Math.PI*2);c.arc(bx+25,by+14,28,0,Math.PI*2);
      c.fill();
    }

    // 3. 배경 언덕 (3단)
    // 먼 언덕
    c.fillStyle='#A3D9A5';
    c.beginPath();c.moveTo(0,DH*0.42);
    c.bezierCurveTo(DW*0.3,DH*0.34,DW*0.7,DH*0.42,DW,DH*0.38);
    c.lineTo(DW,DH*0.5);c.lineTo(0,DH*0.5);c.closePath();c.fill();
    // 중간 언덕
    c.fillStyle='#8FCA91';
    c.beginPath();c.moveTo(0,DH*0.48);
    c.bezierCurveTo(DW*0.25,DH*0.40,DW*0.6,DH*0.50,DW,DH*0.44);
    c.lineTo(DW,DH*0.55);c.lineTo(0,DH*0.55);c.closePath();c.fill();
    // 가까운 언덕 (게임 필드)
    c.fillStyle='#78B879';
    c.beginPath();c.moveTo(0,DH*0.52);
    c.bezierCurveTo(DW*0.2,DH*0.46,DW*0.75,DH*0.54,DW,DH*0.48);
    c.lineTo(DW,DH);c.lineTo(0,DH);c.closePath();c.fill();

    // 4. 풀밭 필드 바닥 (밝은 초록)
    const field=c.createLinearGradient(0,DH*0.56,0,DH);
    field.addColorStop(0,'#70B673');
    field.addColorStop(0.5,'#6BAA6E');
    field.addColorStop(1,'#5D9E60');
    c.fillStyle=field;c.fillRect(0,DH*0.56,DW,DH*0.44);

    // 5. 구멍 그리기 (입체적)
    for(const h of this.holes){
      // 구멍 그림자 (아래)
      c.fillStyle='rgba(0,0,0,.12)';
      c.beginPath();c.ellipse(h.x+2,h.y+14,62,26,0,0,Math.PI*2);c.fill();
      // 구멍 외곽 (밝은 갈색 테두리링)
      const rimGrad=c.createLinearGradient(h.x,h.y-22,h.x,h.y+22);
      rimGrad.addColorStop(0,'#8B7355');
      rimGrad.addColorStop(0.5,'#7A6348');
      rimGrad.addColorStop(1,'#6B4F36');
      c.fillStyle=rimGrad;
      c.beginPath();c.ellipse(h.x,h.y,62,26,0,0,Math.PI*2);c.fill();
      // 구멍 안쪽 (어두운 갈색 심)
      const innerGrad=c.createRadialGradient(h.x,h.y+4,8,h.x,h.y,48);
      innerGrad.addColorStop(0,'#3A2415');
      innerGrad.addColorStop(0.7,'#2D1A0C');
      innerGrad.addColorStop(1,'#1F1008');
      c.fillStyle=innerGrad;
      c.beginPath();c.ellipse(h.x,h.y+4,48,20,0,0,Math.PI*2);c.fill();
      // 구멍 가장자리 하이라이트
      c.strokeStyle='rgba(139,115,85,.5)';c.lineWidth=1.5;
      c.beginPath();c.ellipse(h.x,h.y,60,24,0,0,Math.PI*2);c.stroke();
    }

    // 6. 캐릭터 그리기 (구멍 위에) - 시간에 따라 프래임 전환
    // 프래임 매핑:
    // appearing(17) → ready: 02(nose-tickle) → 03(snot-starts) → 04(stretches) → 05(peak)
    // perfect: 06(surprise) → 07(tissue-pop) → 08(relieved)
    // missing: 11(panic) → 12(snot-covers)
    const READY_FRAMES = [1, 2, 3, 4];  // 인덱스 (0-based: 02~05)
    for(const h of this.holes){
      if(h.state==='hidden')continue;
      const cs=140*h.scale;
      const fi=h.state==='appearing'?Math.min(h.timer*4,1):h.state==='perfect'?.7:h.state==='missing'?.5:1;
      let fIdx;
      if(h.state==='appearing'){
        fIdx=16; // popup-from-hole (0-based)
      }else if(h.state==='ready'&&!h.judged){
        // ready 상태: 시간에 따라 프래임 전환
        const ratio=h.timeLeft/h.totalTime;
        // ratio 1→0 으로 감소, 프래임을 0→3 으로 증가
        const phase = Math.min(3, Math.floor((1-ratio)*4));
        fIdx = READY_FRAMES[phase];
      }else if(h.state==='perfect'){
        fIdx = h.timer < 0.3 ? 6 : (h.timer < 0.6 ? 7 : 8);
      }else{ // missing
        fIdx = h.timer < 0.3 ? 11 : 12;
      }
      const img=this.ld.get(fIdx);
      if(img&&img.complete&&img.naturalWidth){
        c.save();c.globalAlpha=fi;
        // 구멍 중앙 위에 캐릭터 배치
        c.drawImage(img,h.x-cs/2,h.y-cs*0.65,cs,cs*0.9);
        c.restore();
      }

      // 콧물이 흘러내리는 비주얼 (ready 상태일 때)
      if(h.state==='ready'&&!h.judged){
        const ratio = h.timeLeft / h.totalTime;
        // 콧물 시작점 (캐릭터 코 위치 - 캐릭터 중심에서 약간 위)
        const snotStartX = h.x;
        const snotStartY = h.y - cs*0.65 + 30;
        // 콧물 끝 (시간이 지날수록 아래로 늘어남)
        const snotLen = 30 + (1-ratio) * 80;
        const snotEndY = snotStartY + snotLen;
        // 흔들리는 효과
        const wobble = Math.sin(this.time*8+h.idx)*3;
        
        // 물 흐름 (반투명 맑은 연두색)
        c.strokeStyle = h.golden ? 'rgba(255,220,80,.85)' : 'rgba(100,200,100,.8)';
        c.lineWidth = 5;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(snotStartX, snotStartY);
        c.quadraticCurveTo(snotStartX+wobble, (snotStartY+snotEndY)/2, snotStartX+wobble*0.5, snotEndY);
        c.stroke();
        
        // 콧물 끝 물방울
        c.fillStyle = h.golden ? 'rgba(255,230,100,.9)' : 'rgba(120,220,120,.9)';
        c.beginPath();
        c.ellipse(snotStartX+wobble*0.5, snotEndY+4, 5, 7, 0, 0, Math.PI*2);
        c.fill();
        
        // 콧물 하이라이트
        c.strokeStyle = 'rgba(255,255,255,.6)';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(snotStartX-2, snotStartY+5);
        c.lineTo(snotStartX-2+wobble*0.3, snotEndY-8);
        c.stroke();
      }

      // 타이머 링
      if(h.state==='ready'&&!h.judged){
        const ratio=h.timeLeft/h.totalTime;
        const urgent=ratio<.3;
        c.lineWidth=5;
        c.strokeStyle=urgent?'rgba(255,80,80,.6)':'rgba(255,255,255,.5)';
        c.beginPath();c.arc(h.x,h.y-50,72,0,Math.PI*2);c.stroke();
        c.strokeStyle=urgent?'#FF5252':h.golden?'#FFD700':'#69F0AE';
        c.lineWidth=7;c.lineCap='round';
        c.beginPath();c.arc(h.x,h.y-50,72,-Math.PI/2,-Math.PI/2+ratio*Math.PI*2);c.stroke();
        c.lineCap='butt';
        c.font='bold 22px Jua,sans-serif';c.textAlign='center';
        c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=3;c.strokeText('TAP! 🧻',h.x,h.y-90);
        c.fillStyle=urgent?'#FF5252':'#FFEB3B';
        c.fillText('TAP! ',h.x,h.y-90);
      }
    }

    // 8. 뾰족 휴지 커서
    if(this.cursorVis){
      this.drawTissueCursor(c, this.cursorX, this.cursorY);
    }

    // 9. 파티클, 플로팅 텍스트
    this.particles.forEach(p=>p.draw(c));
    this.floats.forEach(t=>t.draw(c));

    // 10. 하단 잔디 장식
    const grassY=DH*0.92;
    c.strokeStyle='#4A8C4C';c.lineWidth=2;
    for(let i=0;i<DW;i+=12){
      const h=8+Math.sin(i*0.3+this.time*2)*4;
      c.beginPath();c.moveTo(i,grassY);c.lineTo(i+2,grassY-h);c.stroke();
    }
    c.fillStyle='#5D9E60';
    c.fillRect(0,grassY,DW,DH-grassY);

    // 11. HUD (가장 위에 - 커서에 가려지지 않도록)
    if(this.state==='PLAYING'){
      // 상단 HUD 배경 (유리처럼)
      c.fillStyle='rgba(120,170,200,.45)';
      c.beginPath();c.moveTo(20,4);c.lineTo(DW-20,4);c.arcTo(DW-4,4,DW-4,20,16);
      c.lineTo(DW-4,86);c.lineTo(4,86);c.lineTo(4,20);c.arcTo(4,4,20,4,16);c.closePath();c.fill();
      c.fillStyle='rgba(255,255,255,.3)';
      c.beginPath();c.moveTo(20,4);c.lineTo(DW-20,4);c.arcTo(DW-4,4,DW-4,12,8);
      c.lineTo(DW-4,36);c.lineTo(4,36);c.lineTo(4,12);c.arcTo(4,4,20,4,8);c.closePath();c.fill();
      
      // 점수
      c.font='bold 28px Jua,sans-serif';c.textAlign='left';c.textBaseline='middle';
      c.fillStyle='#FFE156';c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=3;
      c.strokeText('⭐ '+this.score,24,22);
      c.fillText('⭐ '+this.score,24,22);
      
      // 콤보
      if(this.combo>=2){
        c.textAlign='right';c.font='bold 26px Jua,sans-serif';
        const comboCol=this.combo>=5?'#FFE156':'#7BFFCB';
        c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=3;
        c.strokeText(' x'+this.combo,DW-24,22);
        c.fillStyle=comboCol;c.fillText('🔥 x'+this.combo,DW-24,22);
      }
      
      // 하트 (채워진/비운)
      c.textAlign='center';c.font='26px sans-serif';
      for(let i=0;i<MAX_HP;i++){
        const hx=DW/2-(MAX_HP-1)*18+i*36;
        if(i<this.hp){
          c.fillText('❤️',hx,22);
        }else{
          c.fillStyle='rgba(0,0,0,.4)';
          c.fillText('🖤',hx,22);
        }
      }

      // 플레이어 이름
      c.textAlign='left';c.font='bold 14px Jua,sans-serif';c.fillStyle='#FFEB3B';
      c.strokeStyle='rgba(0,0,0,.5)';c.lineWidth=2;
      c.strokeText('🀄 '+this.players[this.curPlayer].name,12,74);
      c.fillText('🀄 '+this.players[this.curPlayer].name,12,74);
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