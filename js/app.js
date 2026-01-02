[file name]: app.js
[file content begin]
// js/app.js - خفيف ويعمل مع products.js

console.log('🚀 app.js يبدأ...');

class SimpleApp {
    constructor() {
        this.init();
    }
    
    init() {
        console.log('🎯 SimpleApp يبدأ...');
        
        // انتظار تحميل productsManager
        this.waitForProductsManager();
    }
    
    waitForProductsManager() {
        const checkInterval = setInterval(() => {
            if (window.productsManager) {
                clearInterval(checkInterval);
                console.log('✅ productsManager جاهز');
                this.startApp();
            }
        }, 100);
        
        // مهلة 5 ثوان
        setTimeout(() => {
            clearInterval(checkInterval);
            if (!window.productsManager) {
                console.error('❌ productsManager غير موجود بعد 5 ثوان');
                this.showFallback();
            }
        }, 5000);
    }
    
    startApp() {
        console.log('🎪 بدء التطبيق...');
        
        // 1. عرض المنتجات إذا لم تكن معروضة
        if (window.productsManager && !document.querySelector('.offer-card')) {
            window.productsManager.showProducts();
        }
        
        // 2. Firebase في الخلفية
        this.initFirebaseBackground();
        
        // 3. تحديث السلة
        if (window.cartManager) {
            window.cartManager.updateCartUI();
        }
    }
    
    initFirebaseBackground() {
        if (!window.db) {
            console.log('ℹ️ Firebase غير متوفر');
            return;
        }
        
        setTimeout(async () => {
            try {
                console.log('🔥 فحص Firebase...');
                const snapshot = await window.db.collection('products').limit(1).get();
                console.log(`📊 Firebase: ${snapshot.size} منتج`);
            } catch (error) {
                console.log('⚠️ Firebase خطأ:', error.message);
            }
        }, 2000);
    }
    
    showFallback() {
        const offersSection = document.getElementById('offers');
        if (offersSection && !offersSection.innerHTML.includes('offer-card')) {
            offersSection.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <h2 style="color: #3A36E0;">Global Store</h2>
                    <p>متجرنا قيد التطوير...</p>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #3A36E0; color: white; border: none; border-radius: 8px;">
                        إعادة تحميل
                    </button>
                </div>
            `;
        }
    }
}

// بدء التطبيق عند جاهزية DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new SimpleApp();
    });
} else {
    new SimpleApp();
}

console.log('✅ app.js محمل');
[file content end]
