const CACHE_NAME = 'shooting-game-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/game.js',
  '/create_audio.js',
  '/manifest.json'
];

// 서비스 워커 설치
self.addEventListener('install', (event) => {
  console.log('서비스 워커 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('캐시에 파일들 저장 중...');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('서비스 워커 설치 완료');
        return self.skipWaiting();
      })
  );
});

// 서비스 워커 활성화
self.addEventListener('activate', (event) => {
  console.log('서비스 워커 활성화 중...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('서비스 워커 활성화 완료');
      return self.clients.claim();
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // 캐시에서 찾으면 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없으면 네트워크에서 가져오기
        return fetch(event.request)
          .then((response) => {
            // 성공적인 응답만 캐시에 저장
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // 네트워크 실패 시 기본 페이지 반환
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// 백그라운드 동기화 (선택사항)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    console.log('백그라운드 동기화 실행');
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // 백그라운드에서 실행할 작업들
  return Promise.resolve();
} 