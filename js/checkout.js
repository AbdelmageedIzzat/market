// إدارة عملية الدفع

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
        this.addHelperText();
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
            if (this.checkoutModal.classList.contains('active') && 
                !this.checkoutModal.querySelector('.checkout-content').contains(e.target) &&
                !document.getElementById('checkout-btn').contains(e.target)) {
                this.closeCheckoutModal();
            }
        });
    }
    
    // إضافة نصوص مساعدة
    addHelperText() {
        const addressField = document.getElementById('delivery-address');
        if (addressField) {
            addressField.placeholder = 'مثال: حي الرياض، شارع الملك فهد، مبنى رقم ٥، شقة ٣٠١';
            
            // إضافة نص مساعد إذا لم يكن موجوداً
            const addressContainer = addressField.parentElement;
            if (addressContainer && !addressContainer.querySelector('.helper-text')) {
                const helperText = document.createElement('p');
                helperText.className = 'helper-text';
                helperText.style.cssText = `
                    margin-top: 8px;
                    color: var(--text-light);
                    font-size: 0.85rem;
                    line-height: 1.4;
                `;
                helperText.innerHTML = `
                    <i class="fas fa-info-circle"></i>
                    أدخل عنوانك بالتفصيل أو أرسل رابط الموقع من خرائط جوجل
                `;
                addressContainer.appendChild(helperText);
            }
        }
    }
    
    // فتح نافذة الدفع
    openCheckoutModal() {
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
        this.checkoutModal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }
    
    // إعداد صفحة الدفع
    setupCheckout() {
        if (!this.checkoutItemsContainer || !this.checkoutTotal) return;
        
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
    
    // التحقق من صحة النموذج (مرن)
    validateCheckoutForm(address, paymentMethod) {
        const errors = [];
        
        // العنوان: تقبل 3 أحرف على الأقل (مرن جداً)
        if (!address || address.trim().length < 3) {
            errors.push('يرجى إدخال عنوان الاستلام (3 أحرف على الأقل)');
        }
        
        // طرق الدفع: التأكد من الاختيار
        if (!paymentMethod) {
            errors.push('يرجى اختيار طريقة دفع');
        }
        
        return errors;
    }
    
    // إرسال الطلب (محسّن)
    async submitOrderForm(e) {
        e.preventDefault();
        
        if (!window.cartManager || window.cartManager.getItemCount() === 0) {
            window.uiManager?.showNotification('السلة فارغة', 'أضف منتجات للسلة أولاً', 'error');
            return;
        }
        
        // جمع بيانات النموذج
        const address = document.getElementById('delivery-address')?.value.trim() || '';
        const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
        const notes = document.getElementById('order-notes')?.value.trim() || '';
        
        // التحقق من صحة البيانات
        const validationErrors = this.validateCheckoutForm(address, paymentMethod);
        if (validationErrors.length > 0) {
            // عرض أول خطأ فقط
            window.uiManager?.showNotification('يرجى التصحيح', validationErrors[0], 'error');
            
            // إضافة تأثير لحقل العنوان إذا كان هناك خطأ فيه
            if (validationErrors[0].includes('عنوان')) {
                const addressField = document.getElementById('delivery-address');
                if (addressField) {
                    addressField.style.borderColor = 'var(--danger)';
                    addressField.focus();
                    
                    // إزالة التأثير بعد ثانيتين
                    setTimeout(() => {
                        addressField.style.borderColor = '';
                    }, 2000);
                }
            }
            return;
        }
        
        // تأكيد قبل الإرسال
        const confirmMessage = `هل تريد تأكيد الطلب وإرساله عبر واتساب؟
        
        المنتجات: ${window.cartManager.getItemCount()} منتج
        المبلغ: ${window.cartManager.getTotal().toFixed(2)} ريال
        العنوان: ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        // تعطيل الزر أثناء المعالجة
        const submitBtn = e.target.querySelector('.submit-order') || this.submitOrder;
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        
        try {
            // إنشاء رسالة الطلب
            const message = this.createOrderMessage(address, paymentMethod, notes);
            
            // حفظ الطلب مؤقتاً
            this.saveOrderToLocalStorage(address, paymentMethod, notes);
            
            // إظهار رسالة نجاح
            window.uiManager?.showNotification('تم إنشاء الطلب', 'جارٍ التحويل إلى واتساب...', 'success');
            
            // إغلاق النوافذ
            this.closeCheckoutModal();
            document.getElementById('cart-sidebar')?.classList.remove('active');
            
            // إفراغ السلة
            window.cartManager.clearCart();
            
            // إعادة تعيين النموذج
            this.checkoutForm.reset();
            
            // فتح واتساب بعد تأخير قصير
            setTimeout(() => {
                this.openWhatsApp(message);
                window.uiManager?.showNotification('تم فتح واتساب', 'أرسل الرسالة لتأكيد طلبك', 'info');
            }, 800);
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            window.uiManager?.showNotification('حدث خطأ', 'حاول مرة أخرى', 'error');
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
        
        let message = `🛒 *طلب جديد - Global Store* 🛒\n`;
        message += `═══════════════════════════\n\n`;
        message += `📋 *تفاصيل العميل:*\n`;
        message += `📍 *العنوان:* ${address}\n`;
        message += `💳 *طريقة الدفع:* ${this.getPaymentMethodName(paymentMethod)}\n`;
        message += `📅 *التاريخ:* ${new Date().toLocaleString('ar-SA')}\n\n`;
        
        message += `🛍️ *المنتجات:*\n`;
        message += `═══════════════════════════\n`;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `${index + 1}. ${item.name}\n`;
            message += `   الكمية: ${item.quantity}\n`;
            message += `   السعر: ${item.price} × ${item.quantity} = ${itemTotal.toFixed(2)} ريال\n`;
            message += `────────────────────\n`;
        });
        
        message += `\n💰 *الإجمالي:* ${total.toFixed(2)} ريال\n\n`;
        
        if (notes) {
            message += `📝 *ملاحظات إضافية:*\n`;
            message += `${notes}\n\n`;
        }
        
        message += `شكراً لطلبكم من Global Store! 🚀\n`;
        message += `الرجاء إرسال هذا الطلب لتأكيده.`;
        
        return message;
    }
    
    // الحصول على اسم طريقة الدفع
    getPaymentMethodName(method) {
        const paymentMethod = window.productsManager?.paymentMethods.find(m => m.id === method);
        return paymentMethod ? `${paymentMethod.name} (${paymentMethod.description})` : 'غير محدد';
    }
    
    // حفظ الطلب في localStorage
    saveOrderToLocalStorage(address, paymentMethod, notes) {
        const cartItems = window.cartManager.getAllItems();
        const total = window.cartManager.getTotal();
        
        const order = {
            id: 'order_' + Date.now(),
            address: address,
            payment: paymentMethod,
            notes: notes,
            cart: cartItems,
            total: total,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // حفظ تاريخ الطلب
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orderHistory.push(order);
        
        // الاحتفاظ بآخر 50 طلب فقط
        if (orderHistory.length > 50) {
            orderHistory.shift();
        }
        
        localStorage.setItem('orderHistory', JSON.stringify(orderHistory));
    }
    
    // فتح واتساب
    openWhatsApp(message) {
        const whatsappNumber = "+249112703344";
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        window.open(whatsappURL, '_blank');
    }
}

// تهيئة مدير الدفع
window.checkoutManager = new CheckoutManager();
