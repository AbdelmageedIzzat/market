// js/app.js
[file content begin]
class App {
    constructor() {
        console.log('🚀 بدء تشغيل التطبيق...');
        this.init();
    }
    
    async init() {
        try {
            // بدء عرض المنتجات فوراً (لا تنتظر Firebase)
            this.showProductsImmediately();
            
            // معالجة الأخطاء العامة
            this.setupErrorHandling();
            
            // التحقق من العناصر المهمة
            this.checkEssentialElements();
            
            // تهيئة المكونات الأخرى
            this.initComponents();
            
            // محاولة تحميل Firebase (في الخلفية)
            this.initFirebaseInBackground();
            
            console.log('✅ التطبيق جاهز للاستخدام');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            
            // مع ذلك، حاول عرض المنتجات
            this.showProductsImmediately();
        }
    }
    
    // عرض المنتجات فوراً
    showProductsImmediately() {
        console.log('📦 عرض المنتجات فوراً...');
        
        if (window.productsManager) {
            // عرض المنتجات مباشرة من البيانات المحلية
            window.productsManager.startProducts();
            
            // تحديث واجهة السلة إذا كانت موجودة
            if (window.cartManager) {
                window.cartManager.updateCartUI();
            }
            
            // إظهار رسالة ترحيب
            setTimeout(() => {
                if (window.uiManager) {
                    window.uiManager.showNotification(
                        'مرحباً بك في Global Store!', 
                        'تصفح عروضنا الحصرية وأضف ما تريد إلى سلة المشتريات', 
                        'info'
                    );
                }
            }, 1000);
        } else {
            console.error('❌ productsManager غير متاح');
            
            // محاولة عرض المنتجات يدوياً
            this.showProductsManually();
        }
    }
    
    // عرض المنتجات يدوياً (إذا فشل productsManager)
    showProductsManually() {
        console.log('🛠️ عرض المنتجات يدوياً...');
        
        try {
            // عرض فئة العروض بشكل يدوي
            const offersSection = document.getElementById('offers');
            if (offersSection) {
                offersSection.innerHTML = `
                    <div class="offers-section">
                        <h2>العروض الحالية</h2>
                        <p>جاري تحميل المنتجات...</p>
                        <div style="text-align: center; padding: 50px;">
                            <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary);"></i>
                            <p style="margin-top: 20px;">يرجى الانتظار جاري تحميل المتجر</p>
                            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--primary); color: white; border: none; border-radius: 8px;">
                                إعادة تحميل الصفحة
                            </button>
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('❌ خطأ في العرض اليدوي:', error);
        }
    }
    
    setupErrorHandling() {
        // معالجة أخطاء JavaScript
        window.addEventListener('error', (e) => {
            console.error('حدث خطأ:', e.message);
        });
        
        // معالجة الوعود المرفوضة
        window.addEventListener('unhandledrejection', (e) => {
            console.error('وعد مرفوض:', e.reason);
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
                console.warn(`⚠️ العنصر #${id} غير موجود`);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('بعض العناصر المهمة مفقودة:', missingElements);
        }
    }
    
    initComponents() {
        console.log('⚙️ تهيئة المكونات...');
        
        // تهيئة CartManager إذا لم يكن موجوداً
        if (!window.cartManager && window.CartManager) {
            console.log('🛒 تهيئة CartManager');
            window.cartManager = new CartManager();
        }
        
        // تهيئة UIManager إذا لم يكن موجوداً
        if (!window.uiManager && window.UIManager) {
            console.log('🎨 تهيئة UIManager');
            window.uiManager = new UIManager();
        }
        
        // تهيئة CheckoutManager إذا لم يكن موجوداً
        if (!window.checkoutManager && window.CheckoutManager) {
            console.log('💳 تهيئة CheckoutManager');
            window.checkoutManager = new CheckoutManager();
        }
        
        // تهيئة SearchManager إذا لم يكن موجوداً
        if (!window.searchManager && window.SearchManager) {
            console.log('🔍 تهيئة SearchManager');
            window.searchManager = new SearchManager();
        }
    }
    
    async initFirebaseInBackground() {
        console.log('🔥 تهيئة Firebase في الخلفية...');
        
        try {
            // انتظار تحميل Firebase
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // إذا كان Firebase متاحاً، حاول تحميل المنتجات منه
            if (window.db && window.productsManager && window.productsManager.loadProductsFromJSON) {
                console.log('🔄 محاولة تحديث المنتجات من Firebase...');
                
                // تحميل من Firebase (قد يستبدل البيانات المحلية)
                await window.productsManager.loadProductsFromJSON();
                
                // تحديث العرض إذا نجح
                const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'offers';
                window.productsManager.switchCategory(activeCategory);
                
                console.log('✅ تم تحديث المنتجات من Firebase (إن وجدت)');
            }
        } catch (error) {
            console.log('ℹ️ Firebase غير متاح أو به مشكلة، نستخدم البيانات المحلية');
        }
    }
}

// بدء تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // تأخير بسيط للتأكد من تحميل المكتبات الأساسية
    setTimeout(() => {
        try {
            new App();
        } catch (error) {
            console.error('💥 خطأ فادح في بدء التطبيق:', error);
            
            // محاولة أخيرة لعرض شيء للمستخدم
            const offersSection = document.getElementById('offers');
            if (offersSection) {
                offersSection.innerHTML = `
                    <div style="text-align: center; padding: 50px;">
                        <h2>Global Store</h2>
                        <p>متجر عالمي للتسوق الإلكتروني</p>
                        <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3A36E0; color: white; border: none; border-radius: 8px;">
                            إعادة تحميل المتجر
                        </button>
                    </div>
                `;
            }
        }
    }, 100);
});

// جعل التطبيق متاحاً للتصحيح
window.App = App;

// دالة مساعدة للتصحيح
window.debugStore = function() {
    console.log('=== تصحيح المتجر ===');
    console.log('productsManager:', window.productsManager ? '✅ موجود' : '❌ غير موجود');
    console.log('cartManager:', window.cartManager ? '✅ موجود' : '❌ غير موجود');
    console.log('uiManager:', window.uiManager ? '✅ موجود' : '❌ غير موجود');
    console.log('عدد المنتجات:', window.productsManager ? Object.values(window.productsManager.products).flat().length : 'غير معروف');
    console.log('==================');
};
[file content end]
