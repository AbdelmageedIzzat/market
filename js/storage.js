// نظام التخزين المحلي الذكي

class SmartStorage {
    constructor() {
        this.quota = 5 * 1024 * 1024; // 5MB
        this.stats = {
            totalSize: 0,
            itemsCount: 0,
            lastCleaned: null
        };
        
        this.init();
    }
    
    init() {
        this.calculateStats();
        this.setupCleanupSchedule();
        this.setupCompression();
        this.setupMonitoring();
        this.checkQuota();
    }
    
    calculateStats() {
        try {
            let totalSize = 0;
            let itemsCount = 0;
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                const value = localStorage.getItem(key);
                totalSize += key.length + (value ? value.length : 0);
                itemsCount++;
            }
            
            this.stats = {
                totalSize,
                itemsCount,
                lastCleaned: localStorage.getItem('last_storage_cleanup'),
                lastUpdated: new Date().toISOString()
            };
            
            return this.stats;
        } catch (error) {
            console.error('خطأ في حساب إحصائيات التخزين:', error);
            return this.stats;
        }
    }
    
    checkQuota() {
        const stats = this.calculateStats();
        const percentage = (stats.totalSize / this.quota) * 100;
        
        if (percentage > 80) {
            console.warn(`⚠️ مساحة التخزين ممتلئة بنسبة ${percentage.toFixed(1)}%`);
            this.cleanupOldData();
            this.compressData();
            
            if (percentage > 90) {
                this.showStorageWarning();
            }
        }
        
        return {
            used: stats.totalSize,
            quota: this.quota,
            percentage: parseFloat(percentage.toFixed(2)),
            items: stats.itemsCount
        };
    }
    
    showStorageWarning() {
        window.uiManager?.showNotification(
            'تحذير التخزين',
            'مساحة التخزين قاربت على الامتلاء. يتم تنظيف البيانات القديمة تلقائياً.',
            'warning'
        );
    }
    
    setupCleanupSchedule() {
        // تنظيف تلقائي كل ساعة
        setInterval(() => {
            this.cleanupOldData();
        }, 60 * 60 * 1000);
        
        // تنظيف عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.cleanupOldData();
        });
    }
    
    cleanupOldData() {
        const now = Date.now();
        const cleanupThreshold = 30 * 24 * 60 * 60 * 1000; // 30 يوم
        
        console.log('🧹 بدء تنظيف البيانات القديمة...');
        
        let cleanedCount = 0;
        
        try {
            // تنظيف الطلبات القديمة
            const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
            const recentOrders = orderHistory.filter(order => {
                const orderDate = new Date(order.date).getTime();
                return now - orderDate < cleanupThreshold;
            });
            
            if (recentOrders.length < orderHistory.length) {
                localStorage.setItem('orderHistory', JSON.stringify(recentOrders));
                cleanedCount += orderHistory.length - recentOrders.length;
            }
            
            // تنظيف سجل التصفح القديم
            const userBehavior = JSON.parse(localStorage.getItem('user_behavior') || '{}');
            
            if (userBehavior.viewed && Array.isArray(userBehavior.viewed)) {
                userBehavior.viewed = userBehavior.viewed.filter(view => 
                    now - view.timestamp < cleanupThreshold
                );
                localStorage.setItem('user_behavior', JSON.stringify(userBehavior));
            }
            
            if (userBehavior.addedToCart && Array.isArray(userBehavior.addedToCart)) {
                userBehavior.addedToCart = userBehavior.addedToCart.filter(item => 
                    now - item.timestamp < cleanupThreshold
                );
                localStorage.setItem('user_behavior', JSON.stringify(userBehavior));
            }
            
            // تنظيف النسخ الاحتياطية القديمة
            const backups = JSON.parse(localStorage.getItem('backups') || '[]');
            const recentBackups = backups.filter(backup => 
                now - new Date(backup.timestamp).getTime() < cleanupThreshold
            );
            
            if (recentBackups.length < backups.length) {
                localStorage.setItem('backups', JSON.stringify(recentBackups));
                cleanedCount += backups.length - recentBackups.length;
            }
            
            // تنظيف سجلات الخطأ القديمة
            const errorLog = JSON.parse(localStorage.getItem('error_log') || '[]');
            const recentErrors = errorLog.filter(error => 
                now - new Date(error.timestamp).getTime() < 7 * 24 * 60 * 60 * 1000 // 7 أيام
            );
            
            if (recentErrors.length < errorLog.length) {
                localStorage.setItem('error_log', JSON.stringify(recentErrors));
            }
            
            // تنظيف الإشعارات القديمة
            const notificationLog = JSON.parse(localStorage.getItem('notification_log') || '[]');
            const recentNotifications = notificationLog.filter(notification => 
                now - new Date(notification.receivedAt).getTime() < 7 * 24 * 60 * 60 * 1000 // 7 أيام
            );
            
            if (recentNotifications.length < notificationLog.length) {
                localStorage.setItem('notification_log', JSON.stringify(recentNotifications));
            }
            
            // تسجيل وقت التنظيف
            localStorage.setItem('last_storage_cleanup', new Date().toISOString());
            
            if (cleanedCount > 0) {
                console.log(`✅ تم تنظيف ${cleanedCount} عنصر قديم`);
            }
            
        } catch (error) {
            console.error('خطأ في تنظيف البيانات:', error);
        }
        
        return cleanedCount;
    }
    
    setupCompression() {
        // ضغط البيانات الكبيرة تلقائياً
        this.compressLargeData();
        
        // ضغط دوري كل 30 دقيقة
        setInterval(() => {
            this.compressLargeData();
        }, 30 * 60 * 1000);
    }
    
    compressLargeData() {
        console.log('🗜️ بدء ضغط البيانات الكبيرة...');
        
        try {
            // ضغط بيانات السلة
            this.compressCartData();
            
            // ضغط بيانات المنتجات
            this.compressProductsData();
            
            // ضغط بيانات المفضلة
            this.compressWishlistData();
            
        } catch (error) {
            console.error('خطأ في ضغط البيانات:', error);
        }
    }
    
    compressCartData() {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        if (cart.length === 0) return;
        
        // تحقق إذا كان حجم البيانات كبيراً
        const cartString = JSON.stringify(cart);
        if (cartString.length < 10000) return; // لا تضغط إذا كانت صغيرة
        
        const compressedCart = cart.map(item => ({
            id: item.id,
            q: item.quantity, // اختصار
            p: item.price,
            n: item.name.substring(0, 50) // تقليل طول الاسم
            // حذف الصور والبيانات غير الضرورية
        }));
        
        localStorage.setItem('cart', JSON.stringify(compressedCart));
        localStorage.setItem('cart_compressed', 'true');
        
        console.log('✅ تم ضغط بيانات السلة');
    }
    
    compressProductsData() {
        // هذه دالة للعرض فقط، في التطبيق الحقيقي سيتم التعامل مع المنتجات من الخادم
        const productsData = localStorage.getItem('products_data');
        if (!productsData) return;
        
        if (productsData.length > 50000) { // 50KB
            try {
                const parsed = JSON.parse(productsData);
                // تقليل حجم البيانات
                const compressed = this.compressJSON(parsed);
                localStorage.setItem('products_data_compressed', JSON.stringify(compressed));
                localStorage.removeItem('products_data');
                
                console.log('✅ تم ضغط بيانات المنتجات');
            } catch (error) {
                console.error('خطأ في ضغط بيانات المنتجات:', error);
            }
        }
    }
    
    compressWishlistData() {
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        if (wishlist.length === 0) return;
        
        const wishlistString = JSON.stringify(wishlist);
        if (wishlistString.length < 5000) return;
        
        const compressedWishlist = wishlist.map(item => ({
            id: item.id,
            n: item.name.substring(0, 30),
            p: item.price
            // حذف البيانات الزائدة
        }));
        
        localStorage.setItem('wishlist', JSON.stringify(compressedWishlist));
        localStorage.setItem('wishlist_compressed', 'true');
        
        console.log('✅ تم ضغط بيانات المفضلة');
    }
    
    compressJSON(data) {
        // دالة بسيطة لضغط JSON
        return JSON.parse(JSON.stringify(data, (key, value) => {
            if (key === 'image' || key === 'description' || key === 'details') {
                return undefined; // حذف الحقول الكبيرة
            }
            return value;
        }));
    }
    
    setupMonitoring() {
        // مراقبة استخدام التخزين
        setInterval(() => {
            this.checkQuota();
        }, 5 * 60 * 1000); // كل 5 دقائق
        
        // مراقبة عمليات الحفظ
        this.monitorSaveOperations();
    }
    
    monitorSaveOperations() {
        // مراقبة عمليات الحفظ في localStorage
        const originalSetItem = localStorage.setItem;
        
        localStorage.setItem = function(key, value) {
            try {
                originalSetItem.call(this, key, value);
                
                // تسجيل عملية الحفظ
                if (window.storageManager) {
                    window.storageManager.logSaveOperation(key, value);
                }
                
            } catch (error) {
                console.error(`خطأ في حفظ ${key}:`, error);
                
                // محاولة استراتيجية بديلة
                if (error.name === 'QuotaExceededError') {
                    window.storageManager?.handleQuotaExceeded();
                }
                
                throw error;
            }
        };
    }
    
    logSaveOperation(key, value) {
        const log = JSON.parse(localStorage.getItem('save_operations_log') || '[]');
        
        log.push({
            key,
            size: key.length + (value ? value.length : 0),
            timestamp: new Date().toISOString()
        });
        
        // الاحتفاظ بآخر 100 عملية فقط
        if (log.length > 100) {
            log.shift();
        }
        
        localStorage.setItem('save_operations_log', JSON.stringify(log));
    }
    
    handleQuotaExceeded() {
        console.error('💥 تجاوز سعة التخزين!');
        
        // محاولة تنظيف الطوارئ
        this.emergencyCleanup();
        
        // استخدام sessionStorage كبديل
        this.useSessionStorageFallback();
        
        // إعلام المستخدم
        window.uiManager?.showNotification(
            'مشكلة في التخزين',
            'مساحة التخزين ممتلئة. يتم استخدام حل بديل مؤقت.',
            'error'
        );
    }
    
    emergencyCleanup() {
        console.log('🚨 تنظيف طوارئ للبيانات...');
        
        try {
            // حذف البيانات المؤقتة أولاً
            const tempKeys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key.includes('temp_') || key.includes('cache_')) {
                    tempKeys.push(key);
                }
            }
            
            tempKeys.forEach(key => localStorage.removeItem(key));
            
            // حذف سجلات الخطأ القديمة
            localStorage.removeItem('error_log');
            
            // تقليل حجم السلة
            const cart = JSON.parse(localStorage.getItem('cart') || '[]');
            if (cart.length > 20) {
                localStorage.setItem('cart', JSON.stringify(cart.slice(-20)));
            }
            
            console.log('✅ تم التنظيف الطارئ');
            
        } catch (error) {
            console.error('خطأ في التنظيف الطارئ:', error);
        }
    }
    
    useSessionStorageFallback() {
        // نقل البيانات المهمة لـ sessionStorage
        const importantKeys = ['cart', 'wishlist', 'user_behavior'];
        
        importantKeys.forEach(key => {
            try {
                const data = localStorage.getItem(key);
                if (data) {
                    sessionStorage.setItem(key + '_fallback', data);
                }
            } catch (error) {
                console.error(`خطأ في نقل ${key}:`, error);
            }
        });
    }
    
    backupData() {
        console.log('💾 إنشاء نسخة احتياطية...');
        
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                data: {}
            };
            
            // نسخ البيانات المهمة
            const importantKeys = [
                'cart', 
                'wishlist', 
                'orderHistory', 
                'loyalty_data',
                'product_reviews',
                'user_behavior'
            ];
            
            importantKeys.forEach(key => {
                const data = localStorage.getItem(key);
                if (data) {
                    backup.data[key] = JSON.parse(data);
                }
            });
            
            // حفظ النسخة الاحتياطية
            const backups = JSON.parse(localStorage.getItem('backups') || '[]');
            backups.push(backup);
            
            // الاحتفاظ بآخر 5 نسخ فقط
            if (backups.length > 5) {
                backups.shift();
            }
            
            localStorage.setItem('backups', JSON.stringify(backups));
            
            console.log('✅ تم إنشاء نسخة احتياطية');
            
            return backup;
            
        } catch (error) {
            console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
            return null;
        }
    }
    
    restoreBackup(backupIndex = 0) {
        try {
            const backups = JSON.parse(localStorage.getItem('backups') || '[]');
            const backup = backups[backupIndex];
            
            if (!backup) {
                throw new Error('النسخة الاحتياطية غير موجودة');
            }
            
            // استعادة البيانات
            Object.entries(backup.data).forEach(([key, value]) => {
                localStorage.setItem(key, JSON.stringify(value));
            });
            
            console.log('✅ تم استعادة النسخة الاحتياطية');
            
            return true;
            
        } catch (error) {
            console.error('خطأ في استعادة النسخة الاحتياطية:', error);
            return false;
        }
    }
    
    exportData() {
        const data = {};
        
        // تصدير جميع البيانات
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            try {
                data[key] = JSON.parse(localStorage.getItem(key));
            } catch {
                data[key] = localStorage.getItem(key);
            }
        }
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `global-store-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('✅ تم تصدير البيانات');
    }
    
    importData(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // استيراد البيانات
                Object.entries(data).forEach(([key, value]) => {
                    if (typeof value === 'object') {
                        localStorage.setItem(key, JSON.stringify(value));
                    } else {
                        localStorage.setItem(key, value);
                    }
                });
                
                console.log('✅ تم استيراد البيانات');
                window.location.reload();
                
            } catch (error) {
                console.error('خطأ في استيراد البيانات:', error);
                window.uiManager?.showNotification(
                    'خطأ في الاستيراد',
                    'تعذر استيراد ملف النسخة الاحتياطية',
                    'error'
                );
            }
        };
        
        reader.readAsText(file);
    }
    
    clearAllData() {
        if (confirm('هل تريد حذف جميع البيانات المحلية؟ لا يمكن التراجع عن هذا الإجراء.')) {
            localStorage.clear();
            sessionStorage.clear();
            
            console.log('🧹 تم حذف جميع البيانات');
            window.location.reload();
        }
    }
    
    getStorageInfo() {
        const stats = this.calculateStats();
        const quotaInfo = this.checkQuota();
        
        return {
            ...stats,
            ...quotaInfo,
            backups: JSON.parse(localStorage.getItem('backups') || '[]').length,
            lastBackup: localStorage.getItem('last_storage_cleanup'),
            keys: Array.from({ length: localStorage.length }, (_, i) => localStorage.key(i))
        };
    }
}

// تهيئة نظام التخزين
window.storageManager = new SmartStorage();
