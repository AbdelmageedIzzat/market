// js/app.js - التحديث الكامل
class App {
    constructor() {
        console.log('App: بدء تشغيل التطبيق...');
        this.init();
    }
    
    async init() {
        try {
            // معالجة الأخطاء العامة
            this.setupErrorHandling();
            
            // التحقق من العناصر المهمة
            this.checkEssentialElements();
            
            // انتظار تهيئة Firebase
            await this.waitForFirebase();
            
            // تحميل البيانات
            await this.loadData();
            
            // تهيئة المكونات
            this.initComponents();
            
            // إظهار رسالة الترحيب
            this.showWelcomeMessage();
            
            console.log('App: التطبيق جاهز للاستخدام');
            
        } catch (error) {
            console.error('App: خطأ في التهيئة:', error);
            window.uiManager?.showNotification('خطأ في النظام', 'حدث خطأ في بدء التشغيل. يرجى تحديث الصفحة.', 'error');
        }
    }
    
    async waitForFirebase() {
        console.log('App: انتظار تهيئة Firebase...');
        
        // انتظار قليل للتأكد من تحميل جميع الملفات
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // إذا كان هناك دالة initFirebase، استدعها
        if (typeof window.initFirebase === 'function') {
            await window.initFirebase();
        }
        
        console.log('App: اكتمال تهيئة Firebase');
    }
    
    setupErrorHandling() {
        // معالجة أخطاء JavaScript
        window.addEventListener('error', (e) => {
            console.error('حدث خطأ:', e.message, 'في', e.filename, 'سطر', e.lineno);
            
            // عرض إشعار للمستخدم إذا كانت الواجهة جاهزة
            setTimeout(() => {
                window.uiManager?.showNotification('خطأ في النظام', 'حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
            }, 100);
        });
        
        // معالجة الوعود المرفوضة
        window.addEventListener('unhandledrejection', (e) => {
            console.error('وعد مرفوض:', e.reason);
            
            // عرض إشعار للمستخدم إذا كانت الواجهة جاهزة
            setTimeout(() => {
                window.uiManager?.showNotification('خطأ في النظام', 'حدث خطأ أثناء المعالجة.', 'error');
            }, 100);
        });
        
        // حماية من الأخطاء أثناء تحميل الصفحة
        window.addEventListener('load', () => {
            console.log('App: تم تحميل الصفحة بالكامل');
        });
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
                console.error(`App: العنصر #${id} غير موجود في الصفحة!`);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('App: بعض العناصر المهمة مفقودة:', missingElements);
            
            // محاولة إصلاح بعض العناصر الشائعة
            this.tryFixMissingElements();
        }
    }
    
    tryFixMissingElements() {
        console.log('App: محاولة إصلاح العناصر المفقودة...');
        
        // محاولة إنشاء العناصر المفقودة ديناميكياً
        if (!document.getElementById('categories')) {
            console.log('App: إنشاء عنصر الفئات ديناميكياً');
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                const categoriesDiv = document.createElement('div');
                categoriesDiv.id = 'categories';
                mainContent.appendChild(categoriesDiv);
            }
        }
    }
    
    async loadData() {
        try {
            // عرض مؤشر تحميل
            if (window.uiManager) {
                window.uiManager.showLoader(true);
            }
            
            // انتظار قليل للتأكد من تهيئة productsManager
            await new Promise(resolve => setTimeout(resolve, 300));
            
            // تحميل المنتجات
            if (window.productsManager && window.productsManager.loadProductsFromJSON) {
                const loaded = await window.productsManager.loadProductsFromJSON();
                console.log('App: نتيجة تحميل المنتجات:', loaded ? 'نجاح' : 'فشل');
                
                if (loaded) {
                    // تهيئة الفئات
                    if (window.productsManager.initCategories) {
                        window.productsManager.initCategories();
                    }
                    
                    // تهيئة طرق الدفع
                    if (window.productsManager.initPaymentMethods) {
                        window.productsManager.initPaymentMethods();
                    }
                    
                    // عرض صفحة العروض
                    if (window.productsManager.renderOffers) {
                        window.productsManager.renderOffers();
                    }
                }
            } else {
                console.error('App: productsManager غير متاح');
                throw new Error('نظام المنتجات غير متاح');
            }
            
        } catch (error) {
            console.error('App: خطأ في تحميل البيانات:', error);
            
            // محاولة عرض المنتجات بشكل يدوي
            this.tryManualLoad();
            
            window.uiManager?.showNotification('تحميل جزئي', 'تم تحميل البيانات الأساسية فقط', 'warning');
        } finally {
            // إخفاء مؤشر التحميل
            if (window.uiManager) {
                setTimeout(() => {
                    window.uiManager.showLoader(false);
                }, 300);
            }
        }
    }
    
    tryManualLoad() {
        console.log('App: محاولة تحميل يدوي للبيانات...');
        
        try {
            // محاولة تهيئة الفئات يدوياً
            const categoriesContainer = document.getElementById('categories');
            if (categoriesContainer && window.categories) {
                categoriesContainer.innerHTML = window.categories.map(cat => `
                    <button class="category-btn ${cat.id === 'offers' ? 'active' : ''}" 
                            data-category="${cat.id}">
                        <i class="fas fa-${cat.icon}"></i>
                        ${cat.name}
                    </button>
                `).join('');
            }
            
            // محاولة عرض منتجات العرض
            const offersSection = document.getElementById('offers');
            if (offersSection && backupProducts.offers) {
                offersSection.innerHTML = `
                    <div class="offers-section">
                        <h2>العروض المتاحة</h2>
                        <div class="offers-grid">
                            ${backupProducts.offers.map(offer => `
                                <div class="offer-card">
                                    <div class="offer-image">${offer.image}</div>
                                    <h3>${offer.name}</h3>
                                    <p>${offer.price} ريال</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            }
        } catch (manualError) {
            console.error('App: خطأ في التحميل اليدوي:', manualError);
        }
    }
    
    initComponents() {
        console.log('App: تهيئة المكونات...');
        
        // تهيئة السلة
        if (!window.cartManager) {
            console.log('App: تهيئة CartManager يدوياً');
            window.cartManager = {
                cart: JSON.parse(localStorage.getItem('cart')) || [],
                updateCartUI: function() {
                    const count = this.cart.reduce((sum, item) => sum + item.quantity, 0);
                    const cartCount = document.getElementById('cart-count');
                    if (cartCount) cartCount.textContent = count;
                },
                getItemCount: function() {
                    return this.cart.reduce((sum, item) => sum + item.quantity, 0);
                }
            };
            window.cartManager.updateCartUI();
        }
        
        // تهيئة نظام الدفع
        if (!window.checkoutManager && window.CheckoutManager) {
            console.log('App: تهيئة CheckoutManager');
            window.checkoutManager = new CheckoutManager();
        }
        
        // تهيئة نظام البحث
        if (!window.searchManager && window.SearchManager) {
            console.log('App: تهيئة SearchManager');
            window.searchManager = new SearchManager();
        }
        
        // تهيئة واجهة المستخدم
        if (!window.uiManager && window.UIManager) {
            console.log('App: تهيئة UIManager');
            window.uiManager = new UIManager();
        }
    }
    
    showWelcomeMessage() {
        setTimeout(() => {
            if (window.uiManager && window.uiManager.showNotification) {
                window.uiManager.showNotification(
                    'مرحباً بك في Global Store!', 
                    'تصفح عروضنا الحصرية وأضف ما تريد إلى سلة المشتريات', 
                    'info'
                );
            }
        }, 1000);
    }
    
    // دالة مساعدة للتحميل الآمن
    safeLoadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.body.appendChild(script);
        });
    }
}

// بدء تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط للتأكد من تحميل جميع الموارد
    setTimeout(() => {
        try {
            new App();
        } catch (error) {
            console.error('خطأ فادح في بدء التطبيق:', error);
            alert('حدث خطأ في تحميل التطبيق. يرجى تحديث الصفحة.');
        }
    }, 100);
});

// تصدير فئة التطبيق للاستخدام العام
window.App = App;

// دالة للمساعدة في التصحيح
window.debugApp = function() {
    console.log('=== حالة التطبيق ===');
    console.log('productsManager:', !!window.productsManager);
    console.log('cartManager:', !!window.cartManager);
    console.log('uiManager:', !!window.uiManager);
    console.log('db:', !!window.db);
    console.log('auth:', !!window.auth);
    console.log('localStorage cart:', localStorage.getItem('cart'));
    console.log('==================');
};
