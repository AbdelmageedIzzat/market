// إدارة عملية الدفع - نسخة مصححة

class CheckoutManager {
    constructor() {
        this.checkoutModal = document.getElementById('checkout-modal');
        this.closeCheckout = document.getElementById('close-checkout');
        this.checkoutForm = document.getElementById('checkout-form');
        this.checkoutItemsContainer = document.getElementById('checkout-items');
        this.checkoutTotal = document.getElementById('checkout-total');
        this.submitOrder = document.getElementById('submit-order');
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        console.log('CheckoutManager: تم التهيئة');
    }
    
    setupEventListeners() {
        // إغلاق نافذة الدفع
        if (this.closeCheckout) {
            this.closeCheckout.addEventListener('click', () => {
                this.closeCheckoutModal();
            });
        }
        
        // إرسال النموذج
        if (this.checkoutForm) {
            this.checkoutForm.addEventListener('submit', (e) => {
                this.submitOrderForm(e);
            });
        }
        
        // إغلاق النافذة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.checkoutModal && this.checkoutModal.classList.contains('active') && 
                !this.checkoutModal.querySelector('.checkout-content').contains(e.target) &&
                !document.getElementById('checkout-btn')?.contains(e.target)) {
                this.closeCheckoutModal();
            }
        });
    }
    
    // فتح نافذة الدفع
    openCheckoutModal() {
        console.log('فتح نافذة الدفع');
        
        if (!window.cartManager || window.cartManager.getItemCount() === 0) {
            window.uiManager?.showNotification('السلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً');
            return;
        }
        
        this.setupCheckout();
        this.checkoutModal.classList.add('active');
        document.body.classList.add('modal-open');
    }
    
    // إغلاق نافذة الدفع
    closeCheckoutModal() {
        if (this.checkoutModal) {
            this.checkoutModal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }
    }
    
    // إعداد صفحة الدفع
    setupCheckout() {
        if (!this.checkoutItemsContainer || !this.checkoutTotal) {
            console.error('عناصر الدفع غير موجودة');
            return;
        }
        
        this.checkoutItemsContainer.innerHTML = '';
        
        const cartItems = window.cartManager.getAllItems();
        
        if (cartItems.length === 0) {
            this.checkoutItemsContainer.innerHTML = '<p style="text-align: center; color: var(--text-light);">لا توجد عناصر في السلة</p>';
            this.checkoutTotal.textContent = '0.00 ريال';
            return;
        }
        
        let total = 0;
        
        cartItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <div>
                    <strong>${item.name}</strong>
                    <div style="font-size: 0.85rem; color: var(--text-light);">
                        ${item.quantity} × ${item.price} ريال
                    </div>
                </div>
                <div>${itemTotal.toFixed(2)} ريال</div>
            `;
            
            this.checkoutItemsContainer.appendChild(checkoutItem);
        });
        
        this.checkoutTotal.textContent = total.toFixed(2) + ' ريال';
    }
    
    // إرسال الطلب
    async submitOrderForm(e) {
        e.preventDefault();
        console.log('بدء إرسال الطلب...');
        
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
            // جمع بيانات النموذج
            const address = document.getElementById('delivery-address')?.value.trim() || '';
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
            const notes = document.getElementById('order-notes')?.value.trim() || '';
            
            console.log('بيانات الطلب:', { address, paymentMethod, notes });
            
            // التحقق من العنوان
            if (!address) {
                window.uiManager?.showNotification('عنوان مطلوب', 'يرجى إدخال عنوان الاستلام');
                throw new Error('عنوان الاستلام مطلوب');
            }
            
            if (address.length < 10) {
                window.uiManager?.showNotification('عنوان غير كافي', 
                    'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)');
                throw new Error('العنوان قصير جداً');
            }
            
            // التحقق من الشروط
            const termsCheckbox = document.getElementById('terms-agree');
            if (termsCheckbox && !termsCheckbox.checked) {
                window.uiManager?.showNotification('موافقة مطلوبة', 
                    'يرجى الموافقة على الشروط والأحكام');
                throw new Error('الموافقة على الشروط مطلوبة');
            }
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            
            // إنشاء رسالة الطلب
            const message = this.createOrderMessage(address, paymentMethod, notes);
            console.log('رسالة الطلب جاهزة');
            
            // حفظ الطلب مؤقتاً
            this.saveOrderToLocalStorage(address, paymentMethod, notes);
            
            // إظهار رسالة تأكيد
            window.uiManager?.showNotification('جارٍ تحويلك إلى واتساب', 
                'سيتم فتح تطبيق واتساب لإرسال تفاصيل طلبك');
            
            // إغلاق النوافذ
            this.closeCheckoutModal();
            document.getElementById('cart-sidebar')?.classList.remove('active');
            
            // إفراغ السلة
            window.cartManager.clearCart();
            
            // إعادة تعيين النموذج
            this.checkoutForm.reset();
            
            // فتح واتساب بعد تأخير قصير
            setTimeout(() => {
                console.log('محاولة فتح واتساب...');
                this.openWhatsApp(message);
                window.uiManager?.showNotification('تم فتح واتساب', 
                    'يرجى إرسال الرسالة إلى المتجر لتأكيد طلبك');
            }, 1000);
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            window.uiManager?.showNotification('خطأ في الإرسال', 
                error.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
        } finally {
            // إعادة تمكين الزر
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // إنشاء رسالة الطلب
    createOrderMessage(address, paymentMethod, notes) {
        const cartItems = window.cartManager.getAllItems();
        let total = 0;
        
        let message = `🛒 *طلب جديد - Global Store* 🛒\n\n`;
        message += `📍 *عنوان الاستلام:* ${address}\n`;
        message += `💳 *طريقة الدفع:* ${this.getPaymentMethodName(paymentMethod)}\n\n`;
        message += `🛍️ *المنتجات:*\n`;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${index + 1}. ${item.name} (${item.quantity}) × ${item.price} = ${itemTotal.toFixed(2)} ريال\n`;
        });
        
        message += `\n💰 *المجموع الكلي:* ${total.toFixed(2)} ريال\n`;
        message += `📅 *التاريخ:* ${new Date().toLocaleString('ar-SA')}\n`;
        
        if (notes) {
            message += `\n📝 *ملاحظات:*\n${notes}\n`;
        }
        
        message += `\nشكراً لطلبكم من Global Store! 🚀`;
        
        console.log('رسالة الطلب:', message);
        return message;
    }
    
    // الحصول على اسم طريقة الدفع
    getPaymentMethodName(method) {
        const paymentMethods = window.productsManager?.paymentMethods || [
            { id: 'cash', name: 'كاش', description: 'الدفع عند الاستلام' },
            { id: 'bank', name: 'تطبيق بنك', description: 'التحويل عبر تطبيق البنك' },
            { id: 'fawry', name: 'تطبيق فوري', description: 'الدفع عبر تطبيق فوري' },
            { id: 'okash', name: 'تطبيق أوكاش', description: 'الدفع عبر تطبيق أوكاش' },
            { id: 'mycash', name: 'تطبيق ماي كاشي', description: 'الدفع عبر تطبيق ماي كاشي' }
        ];
        
        const paymentMethod = paymentMethods.find(m => m.id === method);
        return paymentMethod ? `${paymentMethod.name} (${paymentMethod.description})` : 'كاش عند الاستلام';
    }
    
    // حفظ الطلب في localStorage
    saveOrderToLocalStorage(address, paymentMethod, notes) {
        const cartItems = window.cartManager.getAllItems();
        const total = window.cartManager.getTotal();
        
        const order = {
            address: address,
            payment: paymentMethod,
            notes: notes,
            cart: cartItems,
            total: total,
            date: new Date().toLocaleString('ar-SA'),
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // حفظ في سجل الطلبات
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orderHistory.push(order);
        
        // الاحتفاظ بـ 50 طلب فقط
        if (orderHistory.length > 50) {
            orderHistory.shift();
        }
        
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
        
        console.log('تم حفظ الطلب في localStorage');
    }
    
    // فتح واتساب
    openWhatsApp(message) {
        try {
            // رقم واتساب المتجر
            const whatsappNumber = "+249112703344";
            
            // تنظيف الرقم من الأحرف غير الرقمية
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            
            // ترميز الرسالة بشكل صحيح
            const encodedMessage = encodeURIComponent(message);
            
            // رابط واتساب
            const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
            
            console.log('رابط واتساب:', whatsappURL);
            
            // فتح في نافذة جديدة
            window.open(whatsappURL, '_blank');
            
            // بديل: فتح في نفس النافذة
            // window.location.href = whatsappURL;
            
        } catch (error) {
            console.error('خطأ في فتح واتساب:', error);
            
            // بديل: نسخ الرسالة للتفريغ
            this.copyOrderToClipboard(message);
            
            window.uiManager?.showNotification('خطأ في فتح واتساب', 
                'تم نسخ الطلب. يمكنك لصقه في واتساب يدوياً', 'warning');
        }
    }
    
    // نسخ الطلب للحافظة (بديل)
    copyOrderToClipboard(message) {
        try {
            navigator.clipboard.writeText(message).then(() => {
                console.log('تم نسخ الطلب إلى الحافظة');
                
                // عرض تعليمات بديلة
                const alertMessage = `تم نسخ تفاصيل طلبك.\n\n` +
                                   `يمكنك الآن:\n` +
                                   `1. فتح واتساب\n` +
                                   `2. البحث عن الرقم: +249112703344\n` +
                                   `3. لصق الرسالة وإرسالها\n\n` +
                                   `الرسالة:\n${message}`;
                
                alert(alertMessage);
            });
        } catch (error) {
            console.error('خطأ في النسخ:', error);
            
            // عرض الرسالة مباشرة
            const textarea = document.createElement('textarea');
            textarea.value = message;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            
            alert(`تفاصيل طلبك:\n\n${message}\n\nيمكنك نسخها وإرسالها عبر واتساب.`);
        }
    }
}

// تهيئة مدير الدفع
window.checkoutManager = new CheckoutManager();
