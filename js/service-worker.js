// Service Worker لـ Global Store
const CACHE_NAME = 'global-store-v1.0.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/variables.css',
  '/css/main.css',
  '/css/responsive.css',
  '/css/animations.css',
  '/js/app.js',
  '/js/products.js',
  '/js/cart.js',
  '/js/checkout.js',
  '/js/ui.js',
  '/manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// تثبيت Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('تم فتح الذاكرة المؤقتة');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// تفعيل Service Worker
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('حذف الذاكرة المؤقتة القديمة:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// اعتراض الطلبات
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إرجاع الملف من الذاكرة المؤقتة إذا كان موجوداً
        if (response) {
          return response;
        }
        
        // استخراج الطلب الأصلي
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(response => {
          // التحقق من صحة الرد
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // نسخ الرد
          const responseToCache = response.clone();
          
          // تخزين الملف الجديد في الذاكرة المؤقتة
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});

// استلام الرسائل
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
