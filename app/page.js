'use client';

import Link from 'next/link';

const moments = [
  {
    title: '코가 간질!',
    copy: '수달이 훌쩍거리면 바로 준비.',
    image: '/assets/characters/tissue-otter/frames/cropped/02-nose-tickle-anticipation.png',
  },
  {
    title: '지금이야!',
    copy: '타이밍을 보고 휴지를 슛.',
    image: '/assets/characters/tissue-otter/frames/cropped/05-peak-timing-target.png',
  },
  {
    title: '쏙 들어갔다!',
    copy: '성공하면 반짝 점수와 콤보가 팡.',
    image: '/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png',
  },
];

const gameModes = [
  {
    name: '콧물 게임',
    text: '눈으로 보고 손으로 톡 치는 타이밍 놀이',
    image: '/assets/characters/tissue-otter/frames/cropped/06-perfect-hit-surprise.png',
    href: '/game',
  },
  {
    name: 'AI 수달 친구',
    text: '짧게 묻고 재미있게 대답하는 어린이 대화방',
    image: '/assets/characters/tissue-otter/frames/cropped/19-clap.png',
    href: '/chat',
  },
  {
    name: '2인용 배틀',
    text: '친구랑 번갈아 웃으며 겨루는 로컬 게임',
    image: '/assets/characters/tissue-otter/frames/cropped/10-combo-happy-bounce.png',
    href: '/poop-game.html',
  },
];

export default function LandingPage() {
  const goToGameHome = (event) => {
    event.preventDefault();
    window.location.assign('/game');
  };

  return (
    <main className="landing-page">
      <div className="landing-screen-overlay" aria-hidden="true" />
      <div className="floating-tissues" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>

      <section className="landing-hero" aria-label="휴지 슛 소개">
        <img className="landing-hero-bg" src="/assets/bg/otter-room.png" alt="" aria-hidden="true" />
        <div className="landing-hero-shade" aria-hidden="true" />

        <nav className="landing-nav" aria-label="주요 메뉴">
          <img src="/assets/title-logo.png" alt="휴지 슛!" className="landing-nav-logo" />
          <div className="landing-nav-actions">
            <Link
              href="/game"
              className="landing-nav-start"
              prefetch={false}
              onClick={goToGameHome}
            >
              게임 시작
            </Link>
            <Link href="/chat" className="landing-nav-link">
              수달 친구
            </Link>
          </div>
        </nav>

        <div className="landing-hero-content">
          <div className="landing-copy">
            <p className="landing-kicker">7살 손끝이 먼저 반응하는</p>
            <h1>콧물 나오기 전에<br />휴지를 쏴!</h1>
            <p className="landing-lead">
              보고, 기다리고, 딱 맞춰 누르는 초간단 타이밍 게임.
              귀여운 수달이 콤보마다 춤추고, 실패해도 다시 웃게 만들어요.
            </p>
            <div className="landing-hero-actions">
              <Link
                href="/game"
                className="landing-start-btn"
                aria-label="휴지 슛 게임 홈으로 이동하기"
                prefetch={false}
                onClick={goToGameHome}
              >
                <span className="start-btn-icon">▶</span>
                게임 시작
              </Link>
              <a href="#showtime" className="landing-sub-btn">
                구경하기
              </a>
            </div>
          </div>

          <div className="landing-stage" aria-label="휴지 슛 캐릭터 미리보기">
            <div className="landing-stage-burst" aria-hidden="true" />
            <img
              className="landing-logo-pop"
              src="/assets/title-logo.png"
              alt="휴지 슛!"
            />
            <img
              className="landing-otter-main"
              src="/assets/characters/tissue-otter/frames/cropped/06-perfect-hit-surprise.png"
              alt="휴지 슛 게임을 하는 티슈 수달"
            />
            <div className="landing-score-badge">콤보 팡!</div>
            <div className="landing-timing-pill">타이밍 100점</div>
          </div>
        </div>
      </section>

      <section id="showtime" className="landing-strip">
        <div className="strip-track">
          <span>간질간질</span>
          <span>기다려</span>
          <span>톡!</span>
          <span>콤보!</span>
          <span>다시 한 판!</span>
        </div>
      </section>

      <section className="landing-story">
        <div className="story-sticky">
          <p className="section-kicker">3초 안에 이해되는 놀이</p>
          <h2>작은 손도 바로 아는<br />슈퍼 간단 룰</h2>
        </div>
        <div className="moment-list">
          {moments.map((moment, index) => (
            <article className="moment-card reveal-card" key={moment.title}>
              <span className="moment-number">0{index + 1}</span>
              <img src={moment.image} alt="" aria-hidden="true" />
              <div>
                <h3>{moment.title}</h3>
                <p>{moment.copy}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-overlay-scene" aria-label="게임 몰입감 소개">
        <div className="overlay-phone">
          <img
            src="/assets/characters/tissue-otter/frames/cropped/12-snot-covers-face.png"
            alt="콧물이 얼굴에 묻은 수달"
          />
          <div className="overlay-flash">아차!</div>
        </div>
        <div className="overlay-copy reveal-card">
          <p className="section-kicker">실패도 재미있게</p>
          <h2>틀려도 울상 수달이<br />바로 다시 부른다</h2>
          <p>
            아이가 부담 없이 재도전하도록 성공, 실패, 회복 표정 에셋을 크게 보여줘요.
            화면 위로 지나가는 반투명 오버레이와 흔들림 모션이 한 판의 긴장감을 살립니다.
          </p>
        </div>
      </section>

      <section className="landing-modes">
        <div className="modes-heading reveal-card">
          <p className="section-kicker">놀 거리 가득</p>
          <h2>오늘은 뭐부터 할까?</h2>
        </div>
        <div className="mode-grid">
          {gameModes.map((mode) => (
            <Link
              className="landing-mode-card reveal-card"
              href={mode.href}
              key={mode.name}
              prefetch={false}
              onClick={mode.href === '/game' ? goToGameHome : undefined}
            >
              <img src={mode.image} alt="" aria-hidden="true" />
              <strong>{mode.name}</strong>
              <span>{mode.text}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="landing-final">
        <img
          src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png"
          alt="웃고 있는 티슈 수달"
          className="final-otter"
        />
        <div className="final-copy">
          <p className="section-kicker">지금 바로</p>
          <h2>수달 코를 구하러 출발!</h2>
          <Link
            href="/game"
            className="landing-start-btn final-btn"
            prefetch={false}
            onClick={goToGameHome}
          >
            <span className="start-btn-icon">▶</span>
            게임 시작
          </Link>
        </div>
      </section>
    </main>
  );
}
