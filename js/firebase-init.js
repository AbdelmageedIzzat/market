// js/firebase-init.js
[file content begin]
console.log('🔥 تهيئة Firebase...');

// دالة مبسطة لتهيئة Firebase
function initFirebase() {
    try {
        // التحقق من وجود Firebase SDK
        if (typeof firebase === 'undefined') {
            console.log('ℹ️ Firebase SDK غير محمّل، استخدام البيانات المحلية');
            return { success: false, message: 'Firebase غير محمل' };
        }
        
        // التحقق من وجود الإعدادات
        if (typeof firebaseConfig === 'undefined') {
            console.log('ℹ️ إعدادات Firebase غير موجودة، استخدام البيانات المحلية');
            return { success: false, message: 'إعدادات Firebase غير موجودة' };
        }
        
        console.log('✅ بدء تهيئة Firebase...');
        
        // تهيئة Firebase
        const app = firebase.initializeApp(firebaseConfig);
        
        // تهيئة الخدمات
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        console.log('✅ تم تهيئة Firebase بنجاح');
        
        // اختبار الاتصال البسيط
        setTimeout(() => {
            if (window.db) {
                window.db.collection('products').limit(1).get()
                    .then(snapshot => {
                        console.log(`✅ Firebase متصل، عدد المنتجات: ${snapshot.size}`);
                    })
                    .catch(error => {
                        console.log('⚠️ Firebase متصل ولكن قد تكون قاعدة البيانات فارغة');
                    });
            }
        }, 1000);
        
        return { success: true, message: 'تم تهيئة Firebase' };
        
    } catch (error) {
        console.log('❌ خطأ في تهيئة Firebase:', error.message);
        
        // استخدام نسخة وهمية
        window.db = null;
        window.auth = null;
        
        return { success: false, message: 'تم استخدام البيانات المحلية' };
    }
}

// البدء في الخلفية (لا تنتظر)
setTimeout(() => {
    initFirebase();
}, 500);

// جعل الدالة متاحة للاستخدام
window.initFirebase = initFirebase;

console.log('✅ firebase-init.js جاهز');
[file content end]
