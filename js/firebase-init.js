// js/firebase-init.js
console.log('Firebase Init: جارٍ التحميل...');

try {
    // التحقق من وجود Firebase
    if (typeof firebase === 'undefined') {
        throw new Error('Firebase SDK غير محمّل');
    }
    
    // التحقق من وجود الإعدادات
    if (typeof firebaseConfig === 'undefined') {
        throw new Error('إعدادات Firebase غير موجودة');
    }
    
    console.log('Firebase Init: جارٍ التهيئة...');
    
    // تهيئة Firebase
    const app = firebase.initializeApp(firebaseConfig);
    
    // تهيئة الخدمات
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // تعيين المتغيرات العامة
    window.auth = auth;
    window.db = db;
    
    console.log('Firebase Init: تم التهيئة بنجاح');
    
    // إعداد مراقب حالة المصادقة
    auth.onAuthStateChanged((user) => {
        console.log('Firebase Auth: تغيير حالة المصادقة');
        if (user) {
            console.log('Firebase Auth: مستخدم مسجل:', user.email);
        } else {
            console.log('Firebase Auth: لا يوجد مستخدم مسجل');
        }
    });
    
    // اختبار الاتصال
    db.collection('products').limit(1).get()
        .then(() => {
            console.log('Firebase Firestore: الاتصال ناجح');
        })
        .catch(error => {
            console.warn('Firebase Firestore: خطأ في الاتصال:', error.message);
        });
        
} catch (error) {
    console.error('Firebase Init: خطأ في التهيئة:', error.message);
    
    // استخدام نسخة وهمية للبيانات المحلية
    window.db = null;
    window.auth = {
        onAuthStateChanged: (callback) => callback(null),
        signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase غير متاح')),
        createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase غير متاح')),
        signOut: () => Promise.resolve()
    };
    
    console.log('Firebase Init: تم استخدام البيانات المحلية');
}
