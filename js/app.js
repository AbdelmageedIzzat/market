// التطبيق الرئيسي

class App {
    constructor() {
        this.init();
    }
    
    async init() {
        console.log('بدء تشغيل التطبيق...');
        
        // معالجة الأخطاء العامة
        this.setupErrorHandling();
        
        // التحقق من العناصر المهمة
        this.checkEssentialElements();
        
        // تحميل البيانات
        await this.loadData();
        
        // تهيئة المكونات
        this.initComponents();
        
        // إظهار رسالة الترحيب
        setTimeout(() => {
            window.uiManager?.showWelcomeMessage();
        }, 500);
        
        console.log('التطبيق جاهز للاستخدام');
    }
    
    setupErrorHandling() {
        // معالجة أخطاء JavaScript
        window.addEventListener('error', (e) => {
            console.error('حدث خطأ:', e.message, 'في', e.filename, 'سطر', e.lineno);
            window.uiManager?.showNotification('خطأ في النظام', 'حدث خطأ غير متوقع. يرجى تحديث الصفحة.', 'error');
        });
        
        // معالجة الوعود المرفوضة
        window.addEventListener('unhandledrejection', (e) => {
            console.error('وعد مرفوض:', e.reason);
            window.uiManager?.showNotification('خطأ في النظام', 'حدث خطأ أثناء المعالجة.', 'error');
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
                console.error(`العنصر #${id} غير موجود في الصفحة!`);
            }
        });
        
        if (missingElements.length > 0) {
            console.warn('بعض العناصر المهمة مفقودة:', missingElements);
        }
    }
    
    async loadData() {
        try {
            window.uiManager?.showLoader(true);
            
            // تحميل المنتجات من ملف JSON إذا كان موجوداً
            const loaded = await window.productsManager?.loadProductsFromJSON();
            if (loaded) {
                console.log('تم تحميل البيانات من ملف JSON');
            }
            
            // تهيئة الفئات
            window.productsManager?.initCategories();
            
            // تهيئة طرق الدفع
            window.productsManager?.initPaymentMethods();
            
            // تهيئة نظام البحث
            if (window.searchManager) {
                console.log('تم تهيئة نظام البحث');
            }
            
            // عرض صفحة العروض
            window.productsManager?.renderOffers();
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            window.uiManager?.showNotification('خطأ في التحميل', 'حدث خطأ في تحميل البيانات. يرجى تحديث الصفحة.', 'error');
        } finally {
            window.uiManager?.showLoader(false);
        }
    }
    
    initComponents() {
        // تحديث واجهة السلة
        if (window.cartManager) {
            window.cartManager.updateCartUI();
        }
        
        // تهيئة واجهة المستخدم
        if (window.uiManager) {
            // تمت التهيئة في constructor
        }
        
        // تهيئة نظام الدفع
        if (window.checkoutManager) {
            // تمت التهيئة في constructor
        }
        
        // تهيئة نظام البحث
        if (window.searchManager) {
            // تمت التهيئة في constructor
        }
    }
}

// بدء تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    new App();
});

// تصدير فئة التطبيق للاستخدام العام
window.App = App;
