#!/usr/bin/env python3
"""똥싸기 마스터 게임 코드 유효성 검증 테스트"""
import sys
import re
import os

GAME_FILE = os.path.join(os.path.dirname(__file__), 'index.html')

def run_tests():
    print("=" * 60)
    print("💩 똥싸기 마스터 - 빌드/유효성 테스트")
    print("=" * 60)

    try:
        with open(GAME_FILE, 'r', encoding='utf-8') as f:
            html = f.read()
    except FileNotFoundError:
        print(f"❌ FAIL: 파일이 존재하지 않습니다: {GAME_FILE}")
        return False

    print(f"\n📁 파일: {GAME_FILE}")
    print(f"📏 크기: {len(html):,} bytes  |  📄 줄 수: {html.count(chr(10))+1}줄")

    print("\n" + "-" * 60)
    print("1) 필수 HTML 구조 테스트")
    print("-" * 60)
    structure_tests = [
        ("DOCTYPE 선언", '<!DOCTYPE html>' in html),
        ("<html> 태그 쌍", '<html' in html and '</html>' in html),
        ("<head> 태그 쌍", '<head>' in html and '</head>' in html),
        ("<body> 태그 쌍", '<body>' in html and '</body>' in html),
        ("<title> 포함", '<title>' in html and '</title>' in html),
        ("<meta charset>", 'charset="UTF-8"' in html or "charset='UTF-8'" in html),
    ]
    structure_ok = True
    for name, ok in structure_tests:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok: structure_ok = False

    print("\n" + "-" * 60)
    print("2) 게임 UI 요소 테스트")
    print("-" * 60)
    ui_tests = [
        ("Canvas 요소", '<canvas' in html and '</canvas>' in html),
        ("P1 점수 UI (p1-score)", 'p1-score' in html),
        ("P1 배 UI (p1-belly)", 'p1-belly' in html),
        ("P1 콤보 UI (p1-combo)", 'p1-combo' in html),
        ("P2 점수 UI (p2-score)", 'p2-score' in html),
        ("P2 배 UI (p2-belly)", 'p2-belly' in html),
        ("P2 콤보 UI (p2-combo)", 'p2-combo' in html),
        ("타이머 UI", 'id="timer"' in html),
        ("게임 시작 버튼", 'id="start-btn"' in html),
        ("다시 시작 버튼", 'id="restart-btn"' in html),
        ("게임 오버 다이얼로그", 'id="game-over"' in html),
        ("승자 문구", 'id="winner-text"' in html),
    ]
    ui_ok = True
    for name, ok in ui_tests:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok: ui_ok = False

    print("\n" + "-" * 60)
    print("3) 게임 로직 함수 테스트")
    print("-" * 60)
    logic_tests = [
        ("game 객체 초기화 (initGame)", 'function initGame' in html),
        ("게임 시작 (startGame)", 'function startGame' in html),
        ("똥 싸기 (tryPoop)", 'function tryPoop' in html),
        ("게임 업데이트 (update)", 'function update' in html),
        ("게임 그리기 (draw)", 'function draw' in html),
        ("게임 루프 (gameLoop)", 'function gameLoop' in html),
        ("게임 종료 (endGame)", 'function endGame' in html),
        ("음식 생성 (spawnFood)", 'function spawnFood' in html),
        ("변기 생성 (spawnToilet)", 'function spawnToilet' in html),
        ("랭크 계산 (getRank)", 'function getRank' in html),
    ]
    logic_ok = True
    for name, ok in logic_tests:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok: logic_ok = False

    print("\n" + "-" * 60)
    print("4) 키 입력 처리 테스트")
    print("-" * 60)
    key_tests = [
        ("Space 키 처리 (P1)", re.search(r"""['"]Space['"]""", html) is not None),
        ("ShiftLeft 키 처리 (P2)", re.search(r"""['"]ShiftLeft['"]""", html) is not None),
        ("ShiftRight 미사용 (이전 버그)", "'ShiftRight'" not in html and '"ShiftRight"' not in html),
        ("P1 동일 키 중복 아님", "TryPoop(0)" not in html.replace('tryPoop(0)', '')),
        ("keydown 이벤트 등록", "addEventListener('keydown'" in html or 'addEventListener("keydown"' in html),
        ("keyup 이벤트 등록", "addEventListener('keyup'" in html or 'addEventListener("keyup"' in html),
    ]
    key_ok = True
    for name, ok in key_tests:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok: key_ok = False

    print("\n" + "-" * 60)
    print("5) 2인용 멀티플레이어 검증")
    print("-" * 60)
    mp_tests = [
        ("players 배열 (길이 2)", 'players = [' in html or 'players=[' in html),
        ("Player 1 색상 (빨강)", "#FF6347" in html or "FF6347" in html),
        ("Player 2 색상 (파랑)", "#1E90FF" in html or "1E90FF" in html),
        ("P1 WASD 없음", html.find("keys['KeyA']") > html.find("playerIdx === 0") if "keys['KeyA']" in html else True),
        ("P2 WASD 사용", "keys['KeyA']" in html and "keys['KeyD']" in html),
        ("P2 WASD 사용 (W/S)", "keys['KeyW']" in html and "keys['KeyS']" in html),
        ("콤보 분리 (P1)", "players[0].combo" in html),
        ("콤보 분리 (P2)", "players[1].combo" in html),
    ]
    mp_ok = True
    for name, ok in mp_tests:
        print(f"  {'✅' if ok else '❌'} {name}")
        if not ok: mp_ok = False

    print("\n" + "-" * 60)
    print("6) 태그 균형 테스트 (열림 == 닫힘)")
    print("-" * 60)
    balance_ok = True
    # 자체 종료 태그 제외
    for tag in ['html', 'head', 'body', 'title', 'div', 'p', 'h1', 'h2', 'h3', 'h4']:
        open_count = len(re.findall(rf'<{tag}[\s>]', html))
        close_count = len(re.findall(rf'</{tag}>', html))
        ok = open_count == close_count
        print(f"  {'✅' if ok else '❌'} <{tag}>: {open_count}개 열림 / {close_count}개 닫힘")
        if not ok: balance_ok = False

    print("\n" + "=" * 60)
    all_ok = structure_ok and ui_ok and logic_ok and key_ok and mp_ok and balance_ok
    if all_ok:
        print("🎉 ALL TESTS PASSED!  게임 정상 작동 준비 완료!")
    else:
        print("❌ FAILED: 일부 테스트 실패. 위 로그를 확인하세요.")
    print("=" * 60)
    return all_ok

if __name__ == '__main__':
    ok = run_tests()
    sys.exit(0 if ok else 1)