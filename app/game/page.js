'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

const ROOM_THEMES = [
  { id: 'default', name: '기본 방', emoji: '🏠', bg: '/assets/bg/otter-room.png' },
  { id: 'ocean', name: '바닷속 방', emoji: '🌊', bg: '/assets/bg/ocean-room.png' },
  { id: 'space', name: '우주선 방', emoji: '🚀', bg: '/assets/bg/space-room.png' },
];

export default function GameHomePage() {
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [perfectCount, setPerfectCount] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showOtterCeremony, setShowOtterCeremony] = useState(false);
  const [showThemePopup, setShowThemePopup] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [showThemeEffect, setShowThemeEffect] = useState(false);
  const [otterJump, setOtterJump] = useState(false);
  const perfectTarget = 5;
  const ceremonyShownRef = useRef(false);

  // 퍼펙트 5번 달성 시 세레머니 트리거 (한 번만)
  useEffect(() => {
    if (perfectCount >= perfectTarget && !ceremonyShownRef.current) {
      ceremonyShownRef.current = true;
      setShowCelebration(true);
      setShowOtterCeremony(true);
    }
  }, [perfectCount]);

  // 세레머니 표시 후 4초 후 자동 닫기
  useEffect(() => {
    if (showCelebration) {
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setShowOtterCeremony(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showCelebration]);

  // 테마 이펙트 자동 닫기
  useEffect(() => {
    if (showThemeEffect) {
      const timer = setTimeout(() => {
        setShowThemeEffect(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showThemeEffect]);

  // 테스트용: 퍼펙트 카운트 증가 함수
  const handlePerfectSuccess = () => {
    if (perfectCount < perfectTarget) {
      setPerfectCount(prev => prev + 1);
    }
  };

  // 방 테마 변경 핸들러
  const handleThemeChange = () => {
    setOtterJump(true);
    setTimeout(() => {
      setOtterJump(false);
      setShowThemePopup(true);
    }, 400);
  };

  // 테마 적용 핸들러
  const handleApplyTheme = (themeId) => {
    setCurrentTheme(themeId);
    setShowThemePopup(false);
    setShowThemeEffect(true);
  };

  const currentThemeData = ROOM_THEMES.find(t => t.id === currentTheme) || ROOM_THEMES[0];

  return (
    <main className="home-page">
      <img
        src={currentThemeData.bg}
        alt=""
        aria-hidden="true"
        className="home-bg-img"
      />

      <Link className="landing-return-btn" href="/">
        랜딩으로
      </Link>

      <button className="settings-btn" aria-label="설정">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
        <span>설정</span>
      </button>

      <div className="home-center">
        <div className="title-cloud">
          <img src="/assets/title-logo.png" alt="휴지 슛!" className="title-logo-img" />
        </div>

        <div className="center-stage">
          <div className="center-shadow" />
          <div className={`center-otter ${otterJump ? 'otter-jump' : ''}`}>
            {/* 말풍선 */}
            <div className="otter-speech-bubble">
              <span>오른쪽에서 모드를 골라봐! 🦦</span>
            </div>
            <img
              src="/assets/characters/tissue-otter/frames/cropped/01-idle-smile.png"
              alt="수달 캐릭터"
            />
          </div>
        </div>

        <div className="center-buttons">
          <button className="btn-bottom-pill" onClick={() => {}}>
            <span className="btn-pill-emoji"></span>
            <span>아이템 모음</span>
          </button>
          <button className="btn-bottom-pill" onClick={handleThemeChange}>
            <span className="btn-pill-emoji">🖼️</span>
            <span>방 테마 변경</span>
          </button>
        </div>

        {showModeSelect && (
          <div className="mode-select-overlay" onClick={() => setShowModeSelect(false)}>
            <div className="mode-select-card" onClick={(event) => event.stopPropagation()}>
              <h3>게임 모드를 선택하세요!</h3>
              <div className="mode-select-list">
                <Link href="/play" className="mode-option mode-opt-game">
                  <img src="/assets/characters/tissue-otter/frames/cropped/02-nose-tickle-anticipation.png" alt="콧물 게임" />
                  <div>
                    <strong>물 게임</strong>
                    <span>타이밍 리듬 액션!</span>
                  </div>
                </Link>
                <Link href="/chat" className="mode-option mode-opt-chat">
                  <img src="/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png" alt="AI 수달 친구" />
                  <div>
                    <strong>AI 수달 친구</strong>
                    <span>퀴즈 풀어봐!</span>
                  </div>
                </Link>
                <Link href="/poop-game.html" className="mode-option mode-opt-poop">
                  <img src="/assets/characters/tissue-otter/frames/cropped/10-combo-happy-bounce.png" alt="2인용 배틀" />
                  <div>
                    <strong>2인용 배틀</strong>
                    <span>친구랑 로컬 배틀!</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="home-right-panel">
        {/* 퍼펙트 미션 카드 */}
        <div className="mission-card perfect-mission-card">
          <div className="mission-header">
            <span className="mission-star">✨</span>
            <span className="mission-title">퍼펙트 "!" {perfectTarget}번 성공하기!</span>
          </div>
          <div className="mission-body">
            <div className={`mission-icon perfect-mission-icon ${perfectCount >= perfectTarget ? 'mission-complete' : ''}`}>
              {perfectCount >= perfectTarget ? (
                <span className="sparkle-tissue-icon">
                  <span className="tissue-emoji">🧻</span>
                  <span className="sparkle-star star-1">⭐</span>
                  <span className="sparkle-star star-2">✨</span>
                  <span className="sparkle-star star-3">💫</span>
                </span>
              ) : (
                <img 
                  src="/assets/characters/tissue-otter/frames/cropped/09-wink.png" 
                  alt="수달이 윙크" 
                  className="wink-otter-icon"
                />
              )}
            </div>
            <div className="mission-info">
              <span className="mission-desc">
                퍼펙트 <strong>{perfectCount}</strong>/{perfectTarget} 성공!
              </span>
              <div className="mission-bar">
                <div
                  className="mission-bar-fill perfect-bar-fill"
                  style={{ width: `${(perfectCount / perfectTarget) * 100}%` }}
                />
              </div>
              <button 
                className="test-perfect-btn" 
                onClick={handlePerfectSuccess}
                disabled={perfectCount >= perfectTarget}
              >
                퍼펙트 성공! (테스트)
              </button>
            </div>
          </div>
        </div>

        <div className="game-mode-panel">
          <h2 className="game-mode-title">게임 모드</h2>
          <div className="game-mode-list">
            <Link href="/play" className="mode-item mode-item-game">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/02-nose-tickle-anticipation.png"
                  alt="콧물 게임"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">콧물 게임</span>
                <span className="mode-item-desc">타이밍 리듬 액션!</span>
              </div>
            </Link>

            <Link href="/chat" className="mode-item mode-item-chat">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/08-relieved-sparkle-smile.png"
                  alt="AI 수달"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">AI 수달 친구</span>
                <span className="mode-item-desc">퀴즈 풀어봐!</span>
              </div>
            </Link>

            <Link href="/poop-game.html" className="mode-item mode-item-poop">
              <div className="mode-item-icon">
                <img
                  src="/assets/characters/tissue-otter/frames/cropped/24-game-over-pout.png"
                  alt="2인용 배틀"
                  className="mode-item-img"
                />
              </div>
              <div className="mode-item-info">
                <span className="mode-item-name">2인용 배틀</span>
                <span className="mode-item-desc">친구랑 로컬 배틀!</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* 방 테마 변경 팝업 (스티커북 슬라이드) */}
      {showThemePopup && (
        <div className="theme-popup-overlay" onClick={() => setShowThemePopup(false)}>
          <div className="theme-popup-card" onClick={(e) => e.stopPropagation()}>
            <div className="theme-popup-header">
              <span className="theme-popup-emoji">🎨</span>
              <h3>방 테마를 골라봐!</h3>
              <button className="theme-popup-close" onClick={() => setShowThemePopup(false)}>✕</button>
            </div>
            <div className="theme-popup-list">
              {ROOM_THEMES.map(theme => (
                <button
                  key={theme.id}
                  className={`theme-option ${currentTheme === theme.id ? 'theme-option-active' : ''}`}
                  onClick={() => handleApplyTheme(theme.id)}
                >
                  <span className="theme-option-emoji">{theme.emoji}</span>
                  <span className="theme-option-name">{theme.name}</span>
                  {currentTheme === theme.id && <span className="theme-option-check">✅</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 테마 적용 이펙트 (반짝반짝 무지개 먼지) */}
      {showThemeEffect && (
        <div className="theme-effect-overlay">
          <div className="theme-effect-particles">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className="theme-particle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 0.5}s`,
                  animationDuration: `${1 + Math.random() * 1}s`,
                }}
              >
                {['✨', '⭐', '💫', '🌟', '🎨'][Math.floor(Math.random() * 5)]}
              </span>
            ))}
          </div>
          <div className="theme-effect-text">
            <span>🎨 방이 바뀌었어! ✨</span>
          </div>
        </div>
      )}

      {/* 퍼펙트 미션 달성 세레머니 오버레이 */}
      {showCelebration && (
        <div className="celebration-overlay">
          <div className="fireworks-container">
            <div className="firework firework-1">🎆</div>
            <div className="firework firework-2">🎇</div>
            <div className="firework firework-3">✨</div>
            <div className="firework firework-4">💫</div>
            <div className="firework firework-5">⭐</div>
            <div className="firework firework-6">🎉</div>
            <div className="firework firework-7"></div>
            <div className="firework firework-8">💥</div>
          </div>

          <div className="otter-ceremony">
            <div className="ceremony-otter">
              <img 
                src="/assets/characters/tissue-otter/frames/cropped/10-combo-happy-bounce.png" 
                alt="수달이 기뻐하며 배를 두드리는 모습" 
                className="ceremony-otter-img"
              />
            </div>
            <div className="ceremony-text">
              <span className="ceremony-title">🎉 퍼펙트 달성! 🎉</span>
              <span className="ceremony-subtitle">대박! 수달이가 기뻐하고 있어요!</span>
            </div>
            <div className="shell-fireworks">
              <span className="shell shell-1">🐚</span>
              <span className="shell shell-2">🦪</span>
              <span className="shell shell-3">🐚</span>
              <span className="shell shell-4">🦪</span>
              <span className="shell shell-5"></span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}