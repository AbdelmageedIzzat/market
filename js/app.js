// التطبيق الرئيسي

class App {
    constructor() {
        this.managers = {};
        this.init();
    }
    
    async init() {
        console.log('🚀 بدء تشغيل التطبيق...');
        
        // التحقق من دعم المتصفح
        this.checkBrowserSupport();
        
        // معالجة الأخطاء العامة
        this.setupErrorHandling();
        
        // التحقق من العناصر المهمة
        this.checkEssentialElements();
        
        // تحميل البيانات مع تحسين الأداء
        try {
            await this.loadData();
        } catch (error) {
            console.error('خطأ في التحميل الرئيسي:', error);
            await this.loadFallbackData();
        }
        
        // تهيئة جميع المديرين
        await this.initManagers();
        
        // إظهار رسالة الترحيب
        setTimeout(() => {
            window.uiManager?.showWelcomeMessage();
        }, 500);
        
        // بدء التحديثات التلقائية
        this.startAutoUpdates();
        
        console.log('✅ التطبيق جاهز للاستخدام');
    }
    
    checkBrowserSupport() {
        // التحقق من دعم localStorage
        if (!('localStorage' in window)) {
            alert('المتصفح لا يدعم التخزين المحلي. بعض الميزات قد لا تعمل.');
        }
        
        // التحقق من دعم Service Workers
        if ('serviceWorker' in navigator) {
            this.registerServiceWorker();
        }
    }
    
    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker مسجل:', registration);
        } catch (error) {
            console.error('فشل تسجيل Service Worker:', error);
        }
    }
    
    setupErrorHandling() {
        // معالجة أخطاء JavaScript محسنة
        window.addEventListener('error', (e) => {
            console.error('حدث خطأ:', {
                message: e.message,
                file: e.filename,
                line: e.lineno,
                column: e.colno,
                error: e.error
            });
            
            window.uiManager?.showNotification(
                'خطأ في النظام', 
                'حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 
                'error'
            );
            
            // إرسال تقرير الخطأ
            this.reportError(e);
        });
        
        // معالجة الوعود المرفوضة
        window.addEventListener('unhandledrejection', (e) => {
            console.error('وعد مرفوض:', e.reason);
            window.uiManager?.showNotification(
                'خطأ في المعالجة', 
                'حدث خطأ أثناء تنفيذ العملية.', 
                'error'
            );
        });
    }
    
    reportError(error) {
        // إرسال تقرير الخطأ للخادم
        const errorData = {
            message: error.message,
            stack: error.stack,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        };
        
        // حفظ الخطأ محلياً
        const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
        errorLog.push(errorData);
        if (errorLog.length > 100) errorLog.shift();
        localStorage.setItem('error_log', JSON.stringify(errorLog));
    }
    
    checkEssentialElements() {
        const importantElements = [
            'categories', 'cart-icon', 'cart-count', 'cart-sidebar',
            'checkout-btn', 'checkout-modal', 'checkout-form'
        ];
        
        const missingElements = [];
        
        importantElements.forEach(id => {
            const element = document.getElementById(id);
            if (!element) {
                missingElements.push(id);
                console.error(`العنصر #${id} غير موجود في الصفحة!`);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('بعض العناصر المهمة مفقودة:', missingElements);
            window.uiManager?.showNotification(
                'تحذير النظام',
                'بعض العناصر المهمة مفقودة. قد لا تعمل بعض الميزات.',
                'warning'
            );
        }
    }
    
    async loadData() {
        try {
            window.uiManager?.showLoader(true);
            
            // تحميل المنتجات من ملف JSON
            const loaded = await window.productsManager?.loadProductsFromJSON();
            if (loaded) {
                console.log('تم تحميل البيانات من ملف JSON');
            }
            
            // تحميل بيانات المستخدم
            await this.loadUserData();
            
            // تهيئة الفئات
            window.productsManager?.initCategories();
            
            // تهيئة طرق الدفع
            window.productsManager?.initPaymentMethods();
            
            // عرض صفحة العروض
            window.productsManager?.renderOffers();
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            throw error;
        } finally {
            window.uiManager?.showLoader(false);
        }
    }
    
    async loadUserData() {
        try {
            // تحميل بيانات المفضلة
            if (window.wishlistManager) {
                window.wishlistManager.loadWishlist();
            }
            
            // تحميل بيانات الولاء
            if (window.loyaltyManager) {
                window.loyaltyManager.loadPoints();
            }
            
            // تحميل بيانات التقييمات
            if (window.reviewsManager) {
                window.reviewsManager.loadReviews();
            }
            
        } catch (error) {
            console.error('خطأ في تحميل بيانات المستخدم:', error);
        }
    }
    
    async loadFallbackData() {
        console.log('استخدام البيانات المحلية الاحتياطية');
        try {
            window.productsManager?.initCategories();
            window.productsManager?.initPaymentMethods();
            window.productsManager?.renderOffers();
            
            window.uiManager?.showNotification(
                'تحميل البيانات',
                'تم تحميل البيانات المحلية بنجاح',
                'info'
            );
        } catch (error) {
            console.error('خطأ في تحميل البيانات الاحتياطية:', error);
            window.uiManager?.showNotification(
                'خطأ في التحميل',
                'تعذر تحميل البيانات. يرجى تحديث الصفحة.',
                'error'
            );
        }
    }
    
    async initManagers() {
        const managers = [
            'productsManager',
            'cartManager',
            'checkoutManager',
            'uiManager',
            'wishlistManager',
            'filterManager',
            'recommendationsManager',
            'loyaltyManager',
            'reviewsManager',
            'alertsManager',
            'dashboardManager',
            'themeManager',
            'storageManager',
            'updatesManager'
        ];
        
        for (const managerName of managers) {
            if (window[managerName]) {
                this.managers[managerName] = window[managerName];
                console.log(`✅ تم تهيئة ${managerName}`);
            }
        }
        
        // إعداد التنبيهات التلقائية
        this.setupAutoAlerts();
        
        // بدء مراقبة التخزين
        this.startStorageMonitoring();
    }
    
    setupAutoAlerts() {
        // التحقق من التنبيهات كل دقيقة
        setInterval(() => {
            if (window.alertsManager) {
                window.alertsManager.checkAlerts();
            }
        }, 60000);
        
        // التحقق من تذكير السلة
        setInterval(() => {
            if (window.cartManager) {
                window.cartManager.setupAbandonedCartReminder();
            }
        }, 300000); // كل 5 دقائق
    }
    
    startStorageMonitoring() {
        if (window.storageManager) {
            // فحص مساحة التخزين كل 30 ثانية
            setInterval(() => {
                const quotaInfo = window.storageManager.checkQuota();
                if (quotaInfo && quotaInfo.percentage > 80) {
                    window.uiManager?.showNotification(
                        'تحذير التخزين',
                        'مساحة التخزين قاربت على الامتلاء. يتم تنظيف البيانات القديمة تلقائياً.',
                        'warning'
                    );
                }
            }, 30000);
        }
    }
    
    startAutoUpdates() {
        if (window.updatesManager) {
            // التحقق من التحديثات بعد 30 ثانية من التحميل
            setTimeout(() => {
                window.updatesManager.checkForUpdates();
            }, 30000);
            
            // التحقق من التحديثات كل 6 ساعات
            setInterval(() => {
                window.updatesManager.checkForUpdates();
            }, 6 * 60 * 60 * 1000);
        }
    }
    
    // دالة لتحديث واجهة التطبيق
    async refreshApp() {
        console.log('🔄 تحديث التطبيق...');
        window.uiManager?.showLoader(true);
        
        try {
            // تحديث البيانات
            await this.loadData();
            
            // تحديث الواجهات
            this.refreshUIs();
            
            console.log('✅ تم تحديث التطبيق بنجاح');
            window.uiManager?.showNotification('تم التحديث', 'تم تحديث التطبيق بنجاح', 'success');
            
        } catch (error) {
            console.error('خطأ في تحديث التطبيق:', error);
            window.uiManager?.showNotification('خطأ في التحديث', 'تعذر تحديث التطبيق', 'error');
        } finally {
            window.uiManager?.showLoader(false);
        }
    }
    
    refreshUIs() {
        // تحديث جميع الواجهات
        if (window.cartManager) window.cartManager.updateCartUI();
        if (window.wishlistManager) window.wishlistManager.updateWishlistUI();
        if (window.productsManager) window.productsManager.renderOffers();
        if (window.recommendationsManager) window.recommendationsManager.refreshRecommendations();
        if (window.dashboardManager) window.dashboardManager.refreshDashboard();
    }
    
    // دالة لإعادة تعيين التطبيق
    resetApp() {
        if (confirm('هل تريد إعادة تعيين التطبيق؟ سيتم حذف جميع البيانات المحلية.')) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    }
    
    // دالة لعرض معلومات التطبيق
    showAppInfo() {
        const info = {
            version: '1.0.0',
            features: [
                'نظام المفضلة',
                'نظام الولاء',
                'التوصيات الذكية',
                'نظام التنبيهات',
                'لوحة التحكم',
                'السمات المخصصة',
                'التحديثات التلقائية'
            ],
            storage: {
                used: JSON.stringify(localStorage).length,
                items: Object.keys(localStorage).length
            }
        };
        
        console.log('ℹ️ معلومات التطبيق:', info);
        return info;
    }
}

// تصدير دالة المساعدة
window.appHelpers = {
    formatPrice: (price) => {
        return new Intl.NumberFormat('ar-SA', {
            style: 'currency',
            currency: 'SAR'
        }).format(price);
    },
    
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('ar-SA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    calculateDiscount: (original, current) => {
        const discount = ((original - current) / original) * 100;
        return Math.round(discount);
    },
    
    generateStars: (rating) => {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            if (i <= Math.floor(rating)) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === Math.ceil(rating) && !Number.isInteger(rating)) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
};

// بدء تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // إعداد نسخة التطبيق في الصفحة
    document.getElementById('app-version').textContent = 'الإصدار 1.0.0';
    
    // تهيئة التطبيق
    window.app = new App();
    
    // إضافة حدث لإعادة التحميل
    window.addEventListener('beforeunload', () => {
        // حفظ آخر حالة قبل الخروج
        if (window.cartManager) {
            window.cartManager.saveCart();
        }
    });
    
    // إضافة زر إعادة تعيين في وضع التطوير
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const resetBtn = document.createElement('button');
        resetBtn.textContent = 'إعادة تعيين';
        resetBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;padding:10px;background:#ff4444;color:white;border:none;border-radius:5px;cursor:pointer;';
        resetBtn.addEventListener('click', () => {
            if (window.app) window.app.resetApp();
        });
        document.body.appendChild(resetBtn);
    }
});

// تصدير فئة التطبيق للاستخدام العام
window.App = App;
