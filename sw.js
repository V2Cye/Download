
        // ===== Service Worker برای کش کردن offline.html =====
        const CACHE_NAME = 'v2c-cache-v1';
        const OFFLINE_URL = '/offline.html';

        // فایل‌هایی که باید کش شوند
        const urlsToCache = [
            '/',
            '/offline.html',
            'https://s34.picofile.com/file/8490997326/favicon.png',
            'https://s34.picofile.com/file/8490997350/GRouteTransparentBlack.png',
            'https://s34.picofile.com/file/8490999342/v2c_bg.png',
            'https://s34.picofile.com/file/8490997342/dad.png',
            'https://cdn.fontiran.com/fonts/iran-yekan/IRANYekanWeb.css',
            'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/Vazirmatn-font-face.css'
        ];

        // نصب Service Worker و کش کردن فایل‌ها
        self.addEventListener('install', (event) => {
            event.waitUntil(
                caches.open(CACHE_NAME)
                .then((cache) => {
                    console.log('📦 کش کردن فایل‌ها...');
                    return cache.addAll(urlsToCache);
                })
                .then(() => self.skipWaiting())
            );
        });

        // فعال‌سازی و پاک کردن کش‌های قدیمی
        self.addEventListener('activate', (event) => {
            event.waitUntil(
                caches.keys().then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            if (cacheName !== CACHE_NAME) {
                                console.log('🗑️ حذف کش قدیمی:', cacheName);
                                return caches.delete(cacheName);
                            }
                        })
                    );
                })
                .then(() => self.clients.claim())
            );
        });

        // پاسخ به درخواست‌ها
        self.addEventListener('fetch', (event) => {
            // اگر درخواست مربوط به ناوبری باشد و کاربر آفلاین باشد
            if (event.request.mode === 'navigate') {
                event.respondWith(
                    fetch(event.request)
                    .catch(() => {
                        // اگر خطا رخ داد (آفلاین)، صفحه آفلاین را نشان بده
                        return caches.match(OFFLINE_URL);
                    })
                );
                return;
            }

            // بقیه درخواست‌ها از کش پاسخ داده می‌شوند
            event.respondWith(
                caches.match(event.request)
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    return fetch(event.request);
                })
                .catch(() => {
                    // اگر فایل در کش نبود و نت‌نت قطع بود
                    return new Response('محتوا در دسترس نیست', {
                        status: 404,
                        statusText: 'Not Found'
                    });
                })
            );
        });
        