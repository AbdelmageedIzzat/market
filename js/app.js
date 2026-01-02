[file name]: app.js
[file content begin]
// js/app.js
class App {
    constructor() {
        console.log('🚀 بدء تشغيل التطبيق...');
        this.init();
    }
    
    async init() {
        try {
            // تهيئة المكونات أولاً
            this.initComponents();
            
            // معالجة الأخطاء العامة
            this.setupErrorHandling();
            
            // التحقق من العناصر المهمة
            this.checkEssentialElements();
            
            // محاولة تحميل Firebase (في الخلفية)
            this.initFirebaseInBackground();
            
            // بدء عرض المنتجات بعد تهيئة المكونات
            this.showProductsImmediately();
            
            console.log('✅ التطبيق جاهز للاستخدام');
            
        } catch (error) {
            console.error('❌ خطأ في التهيئة:', error);
            
            // مع ذلك، حاول عرض المنتجات
            setTimeout(() => this.showProductsImmediately(), 1000);
        }
    }
    
    // عرض المنتجات فوراً
    showProductsImmediately() {
        console.log('📦 عرض المنتجات فوراً...');
        
        // انتظار تحميل productsManager إذا لم يكن جاهزاً
        if (!window.productsManager) {
            console.log('⏳ انتظار تهيئة productsManager...');
            setTimeout(() => this.showProductsImmediately(), 100);
            return;
        }
        
        try {
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
        } catch (error) {
            console.error('❌ خطأ في عرض المنتجات:', error);
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
                        <h2 style="text-align: center; margin-bottom: 20px; color: #3A36E0;">
                            <i class="fas fa-tags"></i> العروض الحالية
                        </h2>
                        <div style="text-align: center; padding: 50px;">
                            <i class="fas fa-spinner fa-spin fa-3x" style="color: #3A36E0;"></i>
                            <p style="margin-top: 20px; color: #666;">جاري تحميل المنتجات...</p>
                            <button onclick="location.reload()" style="margin-top: 20px; padding: 12px 24px; background: #3A36E0; color: white; border: none; border-radius: 8px; font-weight: bold;">
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
        
        // تهيئة ProductsManager أولاً
        if (!window.productsManager && window.productsManagerInit) {
            console.log('📦 تهيئة ProductsManager');
            window.productsManagerInit();
        }
        
        // تهيئة CartManager
        if (!window.cartManager && window.CartManager) {
            console.log('🛒 تهيئة CartManager');
            window.cartManager = new CartManager();
        }
        
        // تهيئة UIManager
        if (!window.uiManager && window.UIManager) {
            console.log('🎨 تهيئة UIManager');
            window.uiManager = new UIManager();
        }
        
        // تهيئة CheckoutManager
        if (!window.checkoutManager && window.CheckoutManager) {
            console.log('💳 تهيئة CheckoutManager');
            window.checkoutManager = new CheckoutManager();
        }
        
        // تهيئة SearchManager
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
                if (window.productsManager.switchCategory) {
                    window.productsManager.switchCategory(activeCategory);
                }
                
                console.log('✅ تم تحديث المنتجات من Firebase (إن وجدت)');
            }
        } catch (error) {
            console.log('ℹ️ Firebase غير متاح أو به مشكلة، نستخدم البيانات المحلية');
        }
    }
}

// بدء تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM محمل بالكامل، بدء التطبيق...');
    
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
                        <h2 style="color: #3A36E0; margin-bottom: 20px;">Global Store</h2>
                        <p style="color: #666; margin-bottom: 30px;">متجر عالمي للتسوق الإلكتروني</p>
                        <button onclick="location.reload()" style="padding: 12px 24px; background: #3A36E0; color: white; border: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                            إعادة تحميل المتجر
                        </button>
                        <button onclick="window.debugStore()" style="padding: 12px 24px; background: #6A66FF; color: white; border: none; border-radius: 8px; font-weight: bold; margin: 5px;">
                            تصحيح الأخطاء
                        </button>
                    </div>
                `;
            }
        }
    }, 300);
});

// جعل التطبيق متاحاً للتصحيح
window.App = App;

// دالة مساعدة للتصحيح
window.debugStore = function() {
    console.log('=== تصحيح المتجر ===');
    console.log('productsManager:', window.productsManager ? '✅ موجود' : '❌ غير موجود');
    console.log('cartManager:', window.cartManager ? '✅ موجود' : '❌ غير موجود');
    console.log('uiManager:', window.uiManager ? '✅ موجود' : '❌ غير موجود');
    
    if (window.productsManager && window.productsManager.products) {
        const totalProducts = Object.values(window.productsManager.products).flat().length;
        console.log('عدد المنتجات:', totalProducts);
    } else {
        console.log('عدد المنتجات: غير معروف');
    }
    
    // فحص العناصر المهمة
    ['offers', 'categories', 'cart-icon'].forEach(id => {
        const el = document.getElementById(id);
        console.log(`${id}:`, el ? '✅ موجود' : '❌ غير موجود');
    });
    
    console.log('==================');
};
[file content end]
