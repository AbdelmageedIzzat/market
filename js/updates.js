// نظام التحديثات التلقائية

class AutoUpdater {
    constructor() {
        this.version = '1.0.0';
        this.lastUpdateCheck = null;
        this.updateAvailable = false;
        this.updateInfo = null;
        this.init();
    }
    
    init() {
        this.loadUpdateInfo();
        this.checkForUpdates();
        this.setupUpdateListener();
        this.setupAutoCheck();
        this.setupServiceWorker();
    }
    
    loadUpdateInfo() {
        try {
            this.lastUpdateCheck = localStorage.getItem('last_update_check');
            const updateInfo = localStorage.getItem('update_info');
            if (updateInfo) {
                this.updateInfo = JSON.parse(updateInfo);
                this.updateAvailable = this.updateInfo?.available || false;
            }
        } catch (error) {
            console.error('خطأ في تحميل معلومات التحديث:', error);
        }
    }
    
    checkForUpdates() {
        const now = Date.now();
        const lastCheck = this.lastUpdateCheck ? parseInt(this.lastUpdateCheck) : 0;
        
        // التحقق مرة كل 24 ساعة
        if (now - lastCheck > 24 * 60 * 60 * 1000) {
            console.log('🔍 التحقق من التحديثات...');
            
            // محاكاة التحقق من الخادم
            this.fetchLatestVersion().then(latestVersion => {
                if (this.isNewerVersion(latestVersion)) {
                    this.updateAvailable = true;
                    this.updateInfo = {
                        version: latestVersion,
                        available: true,
                        checkedAt: new Date().toISOString(),
                        changelog: this.getMockChangelog(latestVersion)
                    };
                    
                    this.saveUpdateInfo();
                    this.showUpdateNotification();
                } else {
                    this.updateAvailable = false;
                    this.updateInfo = {
                        version: this.version,
                        available: false,
                        checkedAt: new Date().toISOString()
                    };
                    
                    this.saveUpdateInfo();
                }
                
                localStorage.setItem('last_update_check', now.toString());
            });
        }
    }
    
    fetchLatestVersion() {
        // في تطبيق حقيقي، هنا سيتم الاتصال بالخادم
        // هذه محاكاة لإرجاع إصدار عشوائي
        return new Promise((resolve) => {
            setTimeout(() => {
                // 30% فرصة لإرجاع إصدار جديد
                if (Math.random() < 0.3) {
                    const patch = Math.floor(Math.random() * 10) + 1;
                    resolve(`1.0.${patch}`);
                } else {
                    resolve(this.version);
                }
            }, 1000);
        });
    }
    
    isNewerVersion(newVersion) {
        const currentParts = this.version.split('.').map(Number);
        const newParts = newVersion.split('.').map(Number);
        
        for (let i = 0; i < Math.max(currentParts.length, newParts.length); i++) {
            const currentPart = currentParts[i] || 0;
            const newPart = newParts[i] || 0;
            
            if (newPart > currentPart) return true;
            if (newPart < currentPart) return false;
        }
        
        return false;
    }
    
    getMockChangelog(version) {
        const changelogs = {
            '1.0.1': [
                'إصلاح مشكلة في سلة المشتريات',
                'تحسين أداء التحميل',
                'إضافة دعم للغة العربية بشكل كامل'
            ],
            '1.0.2': [
                'إضافة نظام المفضلة',
                'تحسين واجهة المستخدم',
                'إصلاح الأخطاء الطفيفة'
            ],
            '1.0.3': [
                'إضافة نظام الولاء',
                'تحسين تجربة الموبايل',
                'إضافة المزيد من المنتجات'
            ],
            '1.0.4': [
                'إضافة نظام التقييمات',
                'تحسين الأداء',
                'إضافة فلترة المنتجات'
            ],
            '1.0.5': [
                'إضافة نظام التوصيات',
                'تحسين الأمان',
                'إضافة خيارات دفع جديدة'
            ]
        };
        
        return changelogs[version] || [
            'تحسينات عامة',
            'إصلاح الأخطاء',
            'تحسين الأداء'
        ];
    }
    
    saveUpdateInfo() {
        try {
            localStorage.setItem('update_info', JSON.stringify(this.updateInfo));
        } catch (error) {
            console.error('خطأ في حفظ معلومات التحديث:', error);
        }
    }
    
    showUpdateNotification() {
        // التأكد من عدم إظهار الإشعار مؤخراً
        const lastNotification = localStorage.getItem('last_update_notification');
        if (lastNotification) {
            const lastNotificationTime = new Date(lastNotification).getTime();
            const oneDay = 24 * 60 * 60 * 1000;
            
            if (Date.now() - lastNotificationTime < oneDay) {
                return;
            }
        }
        
        // إظهار إشعار التحديث بعد 3 ثواني من التحميل
        setTimeout(() => {
            this.createUpdateNotification();
            localStorage.setItem('last_update_notification', new Date().toISOString());
        }, 3000);
    }
    
    createUpdateNotification() {
        const notification = document.createElement('div');
        notification.className = 'update-notification';
        notification.innerHTML = `
            <div class="update-content">
                <div class="update-icon">
                    <i class="fas fa-sync-alt"></i>
                </div>
                <div class="update-info">
                    <strong>تحديث جديد متاح!</strong>
                    <p>الإصدار ${this.updateInfo.version} من Global Store جاهز للتحميل</p>
                </div>
                <div class="update-actions">
                    <button class="update-now" id="update-now-btn">
                        تحديث الآن
                    </button>
                    <button class="update-later" id="update-later-btn">
                        لاحقاً
                    </button>
                    <button class="view-changes" id="view-changes-btn">
                        <i class="fas fa-list"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إضافة الأحداث
        notification.querySelector('#update-now-btn').addEventListener('click', () => {
            notification.remove();
            this.performUpdate();
        });
        
        notification.querySelector('#update-later-btn').addEventListener('click', () => {
            notification.remove();
        });
        
        notification.querySelector('#view-changes-btn').addEventListener('click', () => {
            this.showChangelog();
        });
        
        // إخفاء تلقائي بعد 30 ثانية
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 30000);
    }
    
    showChangelog() {
        const modal = document.createElement('div');
        modal.className = 'changelog-modal';
        modal.innerHTML = `
            <div class="changelog-content">
                <div class="changelog-header">
                    <h3><i class="fas fa-clipboard-list"></i> سجل التغييرات - الإصدار ${this.updateInfo.version}</h3>
                    <button class="close-changelog">&times;</button>
                </div>
                
                <div class="changelog-body">
                    <ul class="changelog-list">
                        ${this.updateInfo.changelog.map(change => `
                            <li><i class="fas fa-check"></i> ${change}</li>
                        `).join('')}
                    </ul>
                    
                    <div class="update-actions-modal">
                        <button class="update-now-modal" id="update-now-modal-btn">
                            <i class="fas fa-sync-alt"></i>
                            تحديث الآن
                        </button>
                        <button class="remind-later" id="remind-later-btn">
                            <i class="fas fa-clock"></i>
                            ذكرني لاحقاً
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الأحداث
        modal.querySelector('.close-changelog').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('#update-now-modal-btn').addEventListener('click', () => {
            modal.remove();
            this.performUpdate();
        });
        
        modal.querySelector('#remind-later-btn').addEventListener('click', () => {
            modal.remove();
            // تأجيل التذكير ليوم آخر
            localStorage.setItem('last_update_notification', new Date(Date.now() - 23 * 60 * 60 * 1000).toISOString());
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    performUpdate() {
        console.log('🔄 بدء عملية التحديث...');
        
        // عرض مؤشر التقدم
        this.showUpdateProgress();
        
        // محاكاة عملية التحديث
        setTimeout(() => {
            this.clearCache();
            
            // في تطبيق حقيقي، هنا سيتم تحميل الملفات الجديدة
            setTimeout(() => {
                this.loadNewVersion();
                
                // إخفاء مؤشر التقدم
                this.hideUpdateProgress();
                
                // عرض رسالة النجاح
                this.showUpdateComplete();
                
            }, 1000);
            
        }, 2000);
    }
    
    showUpdateProgress() {
        const progress = document.createElement('div');
        progress.id = 'update-progress';
        progress.className = 'update-progress';
        progress.innerHTML = `
            <div class="progress-content">
                <i class="fas fa-sync fa-spin"></i>
                <p>جاري التحديث...</p>
                <div class="progress-text">لا تغلق الصفحة</div>
                <div class="progress-bar">
                    <div class="progress-fill" id="update-progress-fill"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(progress);
        
        // محاكاة تقدم التحديث
        let progressPercent = 0;
        const progressInterval = setInterval(() => {
            progressPercent += Math.random() * 10;
            if (progressPercent >= 100) {
                progressPercent = 100;
                clearInterval(progressInterval);
            }
            
            const progressFill = document.getElementById('update-progress-fill');
            if (progressFill) {
                progressFill.style.width = `${progressPercent}%`;
            }
        }, 200);
    }
    
    hideUpdateProgress() {
        const progress = document.getElementById('update-progress');
        if (progress) {
            progress.remove();
        }
    }
    
    clearCache() {
        console.log('🧹 تنظيف الذاكرة المؤقتة...');
        
        // حذف cache التطبيق
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    caches.delete(cacheName);
                });
            });
        }
        
        // إعادة تعيين بعض البيانات
        localStorage.removeItem('app_cache');
        localStorage.removeItem('products_cache');
    }
    
    loadNewVersion() {
        console.log('🚀 تحميل الإصدار الجديد...');
        
        // تحديث رقم الإصدار
        this.version = this.updateInfo.version;
        localStorage.setItem('app_version', this.version);
        
        // تحديث معلومات التحديث
        this.updateAvailable = false;
        this.updateInfo.available = false;
        this.saveUpdateInfo();
        
        // إعادة تحميل التطبيق
        setTimeout(() => {
            window.location.reload();
        }, 500);
    }
    
    showUpdateComplete() {
        window.uiManager?.showNotification(
            '✅ تم التحديث بنجاح!',
            `تم تحديث التطبيق إلى الإصدار ${this.version}`,
            'success'
        );
    }
    
    setupUpdateListener() {
        // الاستماع لحدث التحديث من service worker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                console.log('🔄 تم تغيير Service Worker');
                this.showServiceWorkerUpdate();
            });
        }
    }
    
    setupServiceWorker() {
        if ('serviceWorker' in navigator) {
            // تسجيل Service Worker
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('✅ Service Worker مسجل:', registration);
                
                // التحقق من تحديثات Service Worker
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('🔄 اكتشاف تحديث لـ Service Worker');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed') {
                            this.showServiceWorkerUpdate();
                        }
                    });
                });
            }).catch(error => {
                console.error('❌ فشل تسجيل Service Worker:', error);
            });
        }
    }
    
    showServiceWorkerUpdate() {
        const notification = document.createElement('div');
        notification.className = 'sw-update-notification';
        notification.innerHTML = `
            <div class="sw-update-content">
                <i class="fas fa-sync-alt"></i>
                <div>
                    <strong>تحديث متاح</strong>
                    <p>يتوفر تحديث للتطبيق. يرجى إعادة التحميل.</p>
                </div>
                <button class="reload-app" id="reload-app-btn">
                    إعادة التحميل
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        notification.querySelector('#reload-app-btn').addEventListener('click', () => {
            window.location.reload();
        });
        
        // إخفاء تلقائي بعد 10 ثواني
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }
    
    setupAutoCheck() {
        // التحقق من التحديثات كل 6 ساعات
        setInterval(() => {
            this.checkForUpdates();
        }, 6 * 60 * 60 * 1000);
        
        // التحقق عند فتح الصفحة
        window.addEventListener('load', () => {
            setTimeout(() => {
                this.checkForUpdates();
            }, 10000);
        });
    }
    
    forceCheck() {
        console.log('🔍 إجراء فحص قسري للتحديثات...');
        localStorage.removeItem('last_update_check');
        this.checkForUpdates();
        
        window.uiManager?.showNotification(
            'جاري الفحص',
            'جاري التحقق من التحديثات...',
            'info'
        );
    }
    
    getUpdateInfo() {
        return {
            currentVersion: this.version,
            updateAvailable: this.updateAvailable,
            updateInfo: this.updateInfo,
            lastCheck: this.lastUpdateCheck
        };
    }
    
    skipVersion(version) {
        // تخطي إصدار معين
        const skippedVersions = JSON.parse(localStorage.getItem('skipped_versions') || '[]');
        skippedVersions.push(version);
        localStorage.setItem('skipped_versions', JSON.stringify(skippedVersions));
        
        this.updateAvailable = false;
        this.saveUpdateInfo();
        
        window.uiManager?.showNotification(
            'تم التخطي',
            `تم تخطي الإصدار ${version}`,
            'info'
        );
    }
}

// تهيئة نظام التحديثات
window.updatesManager = new AutoUpdater();
