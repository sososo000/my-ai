import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="home-page">
      {/* 방 배경 이미지 */}
      <img
        src="/assets/bg/otter-room.png"
        alt=""
        aria-hidden="true"
        className="home-bg-img"
      />
      {/* 배경 파티클 */}
      <div className="home-bg-deco" aria-hidden="true" />

      <div className="home-container">
        {/* 좌측: 타이틀 + 캐릭터 */}
        <div className="home-left">
          {/* 떠다니는 장식 */}
          <div className="deco-stars" aria-hidden="true">
            <span className="deco-star deco-star-1"></span>
            <span className="deco-star deco-star-2">✨</span>
            <span className="deco-star deco-star-3">🍃</span>
            <span className="deco-star deco-star-4"></span>
          </div>

          {/* 타이틀 뱃지 */}
          <div className="title-badge">
            <span className="title-badge-emoji">🧻</span>
            <h1 className="home-title">휴지 슛!</h1>
            <span className="title-badge-emoji">💦</span>
          </div>

          <p className="home-subtitle">
           꼬깔콘 휴지로 콧물을 !
            <br />
            타이밍 리듬 액션
          </p>

          {/* 캐릭터 스테이지 */}
          <div className="home-stage">
            {/* 무지개 링 */}
            <div className="stage-ring ring-1" />
            <div className="stage-ring ring-2" />
            {/* 바닥 그림자 */}
            <div className="otter-shadow" />
            {/* 수달 캐릭터 */}
            <div className="home-otter">
              <img
                src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png"
                alt="휴지 수달 캐릭터"
              />
            </div>
            {/* 소품 장식 */}
            <div className="stage-deco stage-deco-1"></div>
            <div className="stage-deco stage-deco-2">🍃</div>
            <div className="stage-deco stage-deco-3"></div>
          </div>
        </div>

        {/* 우측: 메뉴 패널 */}
        <div className="home-right">
          <div className="menu-panel">
            <div className="menu-panel-header">
              <span className="menu-panel-emoji">🎯</span>
              <span className="menu-panel-label">무엇을 할까요?</span>
            </div>

            <div className="menu-list">
              <Link href="/game" className="menu-item menu-game">
                <div className="menu-icon menu-icon-game">
                  <img
                    src="/assets/characters/tissue-otter/frames/cropped/06-perfect-hit-surprise.png"
                    alt="게임"
                    className="menu-icon-img"
                  />
                </div>
                <div className="menu-item-info">
                  <span className="menu-item-name">콧물 게임</span>
                  <span className="menu-item-desc">타이밍 리듬 액션!</span>
                </div>
                <div className="menu-item-arrow">›</div>
              </Link>

              <Link href="/chat" className="menu-item menu-chat">
                <div className="menu-icon menu-icon-chat">
                  <img
                    src="/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png"
                    alt="AI 친구"
                    className="menu-icon-img"
                  />
                </div>
                <div className="menu-item-info">
                  <span className="menu-item-name">AI 수달 친구</span>
                  <span className="menu-item-desc"> 뭐든 물어봐!</span>
                </div>
                <div className="menu-item-arrow">›</div>
              </Link>

              <Link href="/poop-game.html" className="menu-item menu-poop" target="_blank">
                <div className="menu-icon menu-icon-poop">
                  <img
                    src="/assets/characters/tissue-otter/frames/cropped/10-combo-happy-bounce.png"
                    alt="싸기 마스터"
                    className="menu-icon-img"
                  />
                </div>
                <div className="menu-item-info">
                  <span className="menu-item-name">똥싸기 마스터</span>
                  <span className="menu-item-desc">2인용 로컬 배틀!</span>
                </div>
                <div className="menu-item-arrow">›</div>
              </Link>
            </div>
          </div>

          <div className="home-hint">
            ✨ 하나를 골라볼까?
          </div>
        </div>
      </div>
    </main>
  );
}