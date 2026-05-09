const CACHE_NAME = 'mhmty-v1';
const ASSETS_TO_CACHE = [
  '/taks/',
  '/taks/index.html',
  '/taks/style.css',
  '/taks/app.js',
  '/taks/manifest.json',
  '/taks/icon.png'
];

// تثبيت Service Worker وتخزين الملفات
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('تم فتح الكاش');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker وحذف الكاش القديم
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الكاش القديم:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية Network First مع تخزين احتياطي
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // إذا كان الطلب ناجحاً، نخزن نسخة في الكاش
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // إذا فشل الاتصال، نرجع من الكاش
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // إذا كان الطلب صفحة HTML نرجع الصفحة الرئيسية
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            return null;
          });
      })
  );
});