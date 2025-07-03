# 🚀 우주 슈팅 게임 PWA

멋진 우주 슈팅 게임을 PWA(Progressive Web App)로 만든 프로젝트입니다. 모바일 앱처럼 설치하고 오프라인에서도 플레이할 수 있습니다!

## ✨ 주요 기능

### 🎮 게임 기능
- **다양한 적기 타입**: 기본, 빠른, 탱크, 보스, 스텔스, 카미카제, 레이저
- **레벨 시스템**: 점수에 따른 자동 레벨업
- **다양한 무기**: 일반, 연사, 산탄, 레이저, 폭탄
- **아이템 시스템**: 무기 강화, 생명 회복, 실드
- **음향 효과**: 멜로디가 있는 예쁜 사운드

### 📱 PWA 기능
- **앱 설치**: 홈 화면에 앱으로 설치 가능
- **오프라인 지원**: 인터넷 없이도 게임 플레이
- **클라우드 동기화**: 어디서든 로그인하여 데이터 접근
- **반응형 디자인**: 모바일, 태블릿, 데스크톱 모두 지원

### 🔐 사용자 시스템
- **계정 관리**: 사용자명과 비밀번호로 가입/로그인
- **데이터 저장**: 최고 점수, 게임 기록 저장
- **리더보드**: 전체 순위와 개인 기록 확인

## 🎯 게임 조작법

### 데스크톱
- **방향키**: 좌우 이동
- **스페이스바**: 발사
- **P**: 일시정지

### 모바일
- **터치 조작**: 화면 하단의 방향 버튼과 발사 버튼
- **제스처**: 스와이프로 이동

## 🚀 배포 방법

### 1. GitHub Pages (무료)
```bash
# 저장소 설정에서 GitHub Pages 활성화
# Settings > Pages > Source: Deploy from a branch > main
```

### 2. Netlify (추천)
```bash
# 1. netlify.com 접속
# 2. "New site from Git" 클릭
# 3. GitHub 저장소 연결
# 4. Deploy 클릭
```

### 3. Render.com
```bash
# 1. render.com 접속
# 2. "New +" > "Static Site" 선택
# 3. GitHub 저장소 연결
# 4. 설정 후 Deploy
```

### 4. Vercel
```bash
# 1. vercel.com 접속
# 2. "New Project" 클릭
# 3. GitHub 저장소 import
# 4. Deploy 클릭
```

## 📁 파일 구조

```
shooting-game-pwa/
├── index.html              # 메인 HTML 파일
├── style.css               # 스타일시트
├── game.js                 # 게임 로직
├── create_audio.js         # 오디오 생성기
├── cloud-storage.js        # 클라우드 스토리지
├── manifest.json           # PWA 매니페스트
├── sw.js                   # 서비스 워커
├── icons/                  # PWA 아이콘들
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
└── screenshots/            # 앱 스크린샷
    ├── gameplay.png
    └── mobile.png
```

## 🛠️ 개발 환경 설정

### 로컬에서 실행
```bash
# 1. 저장소 클론
git clone https://github.com/hulsfarmer/shooting-game-pwa.git

# 2. 디렉토리 이동
cd shooting-game-pwa

# 3. 로컬 서버 실행 (Python)
python -m http.server 8000

# 또는 Node.js
npx serve .

# 4. 브라우저에서 접속
# http://localhost:8000
```

### PWA 테스트
1. **Chrome DevTools** 열기 (F12)
2. **Application** 탭으로 이동
3. **Service Workers** 확인
4. **Manifest** 확인
5. **Lighthouse**로 PWA 점수 확인

## 🎨 커스터마이징

### 색상 변경
`style.css`에서 CSS 변수 수정:
```css
:root {
    --primary-color: #00ffff;
    --secondary-color: #0080ff;
    --background-color: #0c0c0c;
}
```

### 게임 난이도 조정
`game.js`에서 설정 변경:
```javascript
// 적기 생성 속도
this.enemySpawnRate = 60;

// 레벨업 점수 기준
const levelUpScore = 3000;
```

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Canvas API**: 게임 렌더링
- **Web Audio API**: 사운드 생성
- **Service Worker**: 오프라인 지원
- **LocalStorage**: 데이터 저장
- **PWA**: 앱 설치 및 네이티브 기능

## 📱 PWA 기능

### 설치 방법
1. **Chrome/Edge**: 주소창 옆 설치 아이콘 클릭
2. **Safari**: 공유 버튼 > "홈 화면에 추가"
3. **Android**: Chrome 메뉴 > "홈 화면에 추가"

### 오프라인 플레이
- 인터넷 연결 없이도 게임 실행
- 로컬 데이터로 게임 진행
- 네트워크 복구 시 자동 동기화

## 🤝 기여하기

1. **Fork** 저장소
2. **Feature branch** 생성 (`git checkout -b feature/AmazingFeature`)
3. **Commit** 변경사항 (`git commit -m 'Add some AmazingFeature'`)
4. **Push** 브랜치 (`git push origin feature/AmazingFeature`)
5. **Pull Request** 생성

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 🙏 감사의 말

- **Web Audio API**를 활용한 사운드 시스템
- **Canvas API**를 활용한 게임 렌더링
- **PWA** 기술을 활용한 앱 설치 기능

---

**즐거운 게임 되세요! 🎮✨** 