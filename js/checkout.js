// إدارة عملية الدفع - مع تعزيز الأمان

class CheckoutManager {
    constructor() {
        this.checkoutModal = document.getElementById('checkout-modal');
        this.closeCheckout = document.getElementById('close-checkout');
        this.checkoutForm = document.getElementById('checkout-form');
        this.checkoutItemsContainer = document.getElementById('checkout-items');
        this.checkoutTotal = document.getElementById('checkout-total');
        this.submitOrder = document.getElementById('submit-order');
        
        // قوائم تصفية للمدخلات
        this.phoneRegex = /^\+?[\d\s\-\(\)]{8,20}$/;
        this.addressMinLength = 10;
        this.maxNotesLength = 500;
        
        this.init();
    }
    
    async submitOrderForm(e) {
        e.preventDefault();
        
        if (!window.cartManager || window.cartManager.getItemCount() === 0) {
            window.uiManager?.showNotification('سلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً');
            return;
        }
        
        // تعطيل الزر أثناء المعالجة
        const submitBtn = e.target.querySelector('.submit-order') || this.submitOrder;
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التحقق...';
        
        try {
            // جمع بيانات النموذج مع التطهير
            const address = this.sanitizeInput(document.getElementById('delivery-address')?.value.trim() || '');
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
            const notes = this.sanitizeInput(document.getElementById('order-notes')?.value.trim() || '');
            
            // === فلاتر أمنية متقدمة ===
            
            // 1. التحقق من العنوان
            if (!address) {
                window.uiManager?.showNotification('عنوان مطلوب', 'يرجى إدخال عنوان الاستلام');
                throw new Error('عنوان الاستلام مطلوب');
            }
            
            if (address.length < this.addressMinLength) {
                window.uiManager?.showNotification('عنوان غير كافي', 
                    `يرجى إدخال عنوان تفصيلي (${this.addressMinLength} أحرف على الأقل)`);
                throw new Error('العنوان قصير جداً');
            }
            
            // 2. التحقق من الروابط الخطيرة
            if (this.containsDangerousLinks(address) || this.containsDangerousLinks(notes)) {
                window.uiManager?.showNotification('رابط غير مسموح', 'لا يُسمح بإدراج روابط خارجية');
                throw new Error('رابط غير مسموح');
            }
            
            // 3. التحقق من البريد الإلكتروني إذا وجد
            const emailMatch = address.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) {
                if (!this.validateEmail(emailMatch[0])) {
                    window.uiManager?.showNotification('بريد إلكتروني غير صالح', 'يرجى إدخال بريد إلكتروني صحيح');
                    throw new Error('بريد إلكتروني غير صالح');
                }
            }
            
            // 4. التحقق من طول الملاحظات
            if (notes.length > this.maxNotesLength) {
                window.uiManager?.showNotification('ملاحظات طويلة', 
                    `الحد الأقصى للملاحظات هو ${this.maxNotesLength} حرف`);
                throw new Error('ملاحظات طويلة جداً');
            }
            
            // 5. التحقق من المحتوى غير المرغوب
            if (this.containsInappropriateContent(address) || this.containsInappropriateContent(notes)) {
                window.uiManager?.showNotification('محتوى غير لائق', 'يرجى إدخال محتوى مناسب');
                throw new Error('محتوى غير لائق');
            }
            
            // 6. التحقق من الأرقام الهاتفية
            const phoneNumbers = this.extractPhoneNumbers(address + ' ' + notes);
            if (phoneNumbers.length > 2) {
                window.uiManager?.showNotification('أرقام كثيرة', 'لا يُسمح بإدخال أكثر من رقمين هاتف');
                throw new Error('أرقام هاتف كثيرة');
            }
            
            // 7. التحقق من عنوان IP للعميل (لمنع الإساءة)
            const clientIp = await this.getClientIP();
            if (!await this.checkClientSafety(clientIp)) {
                window.uiManager?.showNotification('طلب مشبوه', 
                    'تم رفض الطلب لأسباب أمنية. يرجى المحاولة لاحقاً');
                throw new Error('طلب مشبوه');
            }
            
            // 8. التحقق من معدل الطلبات
            if (!this.checkRateLimit()) {
                window.uiManager?.showNotification('طلبات كثيرة', 
                    'لقد قمت بالعديد من الطلبات مؤخراً. يرجى الانتظار قليلاً');
                throw new Error('معدل طلبات مرتفع');
            }
            
            // 9. التحقق من القيمة الإجمالية (منع الاحتيال)
            const total = window.cartManager.getTotal();
            if (total > 10000) { // حد 10,000 ريال
                window.uiManager?.showNotification('طلب كبير', 
                    'للطلبات الكبيرة، يرجى التواصل مع خدمة العملاء');
                throw new Error('طلب كبير جداً');
            }
            
            // 10. التحقق من توفر المنتجات
            if (!this.checkStockAvailability()) {
                window.uiManager?.showNotification('منتج غير متوفر', 
                    'بعض المنتجات في سلة مشترياتك لم تعد متوفرة');
                throw new Error('منتج غير متوفر');
            }
            
            // إذا مرت جميع الفحوصات الأمنية، أكمل العملية
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            
            // إنشاء رسالة الطلب
            const message = this.createOrderMessage(address, paymentMethod, notes);
            
            // حفظ الطلب مع التشفير
            this.saveOrderToLocalStorage(address, paymentMethod, notes);
            
            // إظهار رسالة تأكيد
            window.uiManager?.showNotification('جارٍ تحويلك إلى واتساب', 
                'سيتم فتح تطبيق واتساب لإرسال تفاصيل طلبك');
            
            // إغلاق النوافذ
            this.closeCheckoutModal();
            document.getElementById('cart-sidebar')?.classList.remove('active');
            
            // تسجيل الطلب في النظام
            await this.logOrderToServer({
                address: address,
                payment: paymentMethod,
                notes: notes.substring(0, 200), // تخزين جزء فقط
                itemsCount: window.cartManager.getItemCount(),
                total: total,
                clientIp: clientIp,
                timestamp: new Date().toISOString()
            });
            
            // إفراغ السلة
            window.cartManager.clearCart();
            
            // إعادة تعيين النموذج
            this.checkoutForm.reset();
            
            // فتح واتساب بعد تأخير قصير
            setTimeout(() => {
                this.openWhatsApp(message);
                window.uiManager?.showNotification('تم فتح واتساب', 
                    'يرجى إرسال الرسالة إلى المتجر لتأكيد طلبك');
            }, 1000);
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            window.uiManager?.showNotification('خطأ في الإرسال', 
                error.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
            
            // تسجيل الخطأ
            this.logError(error);
        } finally {
            // إعادة تمكين الزر
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // === فلاتر أمنية ===
    
    // تطهير المدخلات
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        
        // إزالة علامات HTML
        input = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // إزالة الأحرف الخاصة الخطيرة
        input = input.replace(/[<>"'`;\\/]/g, '');
        
        // تقليم المسافات الزائدة
        input = input.replace(/\s+/g, ' ').trim();
        
        return input;
    }
    
    // التحقق من الروابط الخطرة
    containsDangerousLinks(text) {
        const dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /vbscript:/i,
            /onload=/i,
            /onerror=/i,
            /onclick=/i,
            /<script/i,
            /<\/script>/i,
            /eval\(/i,
            /document\./i,
            /window\./i,
            /\.js\b/i
        ];
        
        return dangerousPatterns.some(pattern => pattern.test(text));
    }
    
    // التحقق من البريد الإلكتروني
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }
    
    // التحقق من المحتوى غير المرغوب
    containsInappropriateContent(text) {
        const inappropriateWords = [
            'سب', 'شتم', 'قذف', 'تهديد', 'إرهاب', 
            'مخدرات', 'سلاح', 'احتيال', 'نصب'
        ];
        
        const lowerText = text.toLowerCase();
        return inappropriateWords.some(word => lowerText.includes(word));
    }
    
    // استخراج أرقام الهواتف
    extractPhoneNumbers(text) {
        const phoneRegex = /(\+?\d[\d\s\-\(\)]{7,20})/g;
        const matches = text.match(phoneRegex) || [];
        
        // تصفية الأرقام الصحيحة
        return matches.filter(num => this.phoneRegex.test(num));
    }
    
    // الحصول على IP العميل
    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            console.warn('تعذر الحصول على IP العميل:', error);
            return 'unknown';
        }
    }
    
    // التحقق من سلامة العميل
    async checkClientSafety(ip) {
        // يمكن إضافة فحص IP ضد قوائم سوداء هنا
        // هذا مثال بسيط
        const blacklistedIPs = JSON.parse(localStorage.getItem('blacklisted_ips') || '[]');
        
        if (blacklistedIPs.includes(ip)) {
            return false;
        }
        
        // يمكن إضافة المزيد من الفحوصات هنا
        return true;
    }
    
    // التحقق من معدل الطلبات
    checkRateLimit() {
        const now = Date.now();
        const oneHourAgo = now - (60 * 60 * 1000);
        
        // الحصول على سجل الطلبات
        const orderHistory = JSON.parse(localStorage.getItem('order_history') || '[]');
        
        // تصفية الطلبات في الساعة الأخيرة
        const recentOrders = orderHistory.filter(order => 
            order.timestamp && new Date(order.timestamp).getTime() > oneHourAgo
        );
        
        // حد أقصى: 5 طلبات في الساعة
        if (recentOrders.length >= 5) {
            return false;
        }
        
        return true;
    }
    
    // التحقق من توفر المخزون
    checkStockAvailability() {
        const cartItems = window.cartManager.getAllItems();
        
        for (const item of cartItems) {
            const product = window.productsManager?.getProductById(item.id);
            
            if (product && product.stock !== undefined && product.stock < item.quantity) {
                return false;
            }
        }
        
        return true;
    }
    
    // حفظ الطلب مع التشفير البسيط
    saveOrderToLocalStorage(address, paymentMethod, notes) {
        const cartItems = window.cartManager.getAllItems();
        const total = window.cartManager.getTotal();
        
        const order = {
            id: this.generateOrderId(),
            address: this.encryptData(address.substring(0, 100)), // تشفير الجزء المهم
            payment: paymentMethod,
            notes: notes.substring(0, 200), // تخزين جزء فقط
            cart: cartItems.map(item => ({
                id: item.id,
                name: item.name.substring(0, 50),
                price: item.price,
                quantity: item.quantity
            })),
            total: total,
            date: new Date().toLocaleString('ar-SA'),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // حفظ في localStorage
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // حفظ في سجل الطلبات (مع حد أقصى 50 طلب)
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orderHistory.unshift(order);
        
        // الاحتفاظ بـ 50 طلب فقط
        if (orderHistory.length > 50) {
            orderHistory.pop();
        }
        
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
        // تحديث عدد الطلبات للمستخدم
        this.updateUserOrderStats();
    }
    
    // توليد معرف طلب فريد
    generateOrderId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `ORD-${timestamp}-${random}`.toUpperCase();
    }
    
    // تشفير بسيط للبيانات الحساسة
    encryptData(data) {
        // هذا تشفير بسيط للعرض فقط
        // في تطبيق حقيقي، استخدم مكتبة تشفير مثل CryptoJS
        try {
            return btoa(encodeURIComponent(data));
        } catch {
            return data;
        }
    }
    
    // فك التشفير
    decryptData(encrypted) {
        try {
            return decodeURIComponent(atob(encrypted));
        } catch {
            return encrypted;
        }
    }
    
    // تحديث إحصائيات المستخدم
    updateUserOrderStats() {
        const stats = JSON.parse(localStorage.getItem('user_order_stats') || '{}');
        
        stats.totalOrders = (stats.totalOrders || 0) + 1;
        stats.lastOrderDate = new Date().toISOString();
        
        localStorage.setItem('user_order_stats', JSON.stringify(stats));
    }
    
    // تسجيل الطلب في الخادم (محاكاة)
    async logOrderToServer(orderData) {
        try {
            // في تطبيق حقيقي، هذا سيكون طلب AJAX إلى الخادم
            console.log('تسجيل الطلب في الخادم:', orderData);
            
            // محاكاة تأخير الشبكة
            await new Promise(resolve => setTimeout(resolve, 500));
            
            return { success: true };
        } catch (error) {
            console.error('خطأ في تسجيل الطلب:', error);
            return { success: false };
        }
    }
    
    // تسجيل الأخطاء
    logError(error) {
        const errors = JSON.parse(localStorage.getItem('checkout_errors') || '[]');
        
        errors.push({
            message: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent
        });
        
        // الاحتفاظ بـ 100 خطأ فقط
        if (errors.length > 100) {
            errors.shift();
        }
        
        localStorage.setItem('checkout_errors', JSON.stringify(errors));
    }
}
