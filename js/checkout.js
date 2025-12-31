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
    
    // إرسال الطلب
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
        
        // التحقق البسيط من العنوان
        if (!address || address.trim().length < 3) {
            window.uiManager?.showNotification('العنوان مطلوب', 'اكتب عنوان التوصيل', 'error');
            document.getElementById('delivery-address')?.focus();
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
            
            // إظهار رسالة تأكيد
            window.uiManager?.showNotification('جارٍ تحويلك إلى واتساب', 'سيتم فتح تطبيق واتساب لإرسال تفاصيل طلبك');
            
            // إغلاق النوافذ
            this.closeCheckoutModal();
            document.getElementById('cart-sidebar')?.classList.remove('active');
            
            // إفراغ السلة
            window.cartManager.clearCart();
            
            // إعادة تعيين النموذج
            this.checkoutForm.reset();
            
            // عرض خيار إرسال واتساب
            setTimeout(() => {
                this.showWhatsAppConfirmation(message);
            }, 500);
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            window.uiManager?.showNotification('خطأ في الإرسال', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
        } finally {
            // إعادة تمكين الزر
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
    
    // عرض تأكيد واتساب
    showWhatsAppConfirmation(message) {
        // إنشاء نافذة تأكيد
        const confirmDiv = document.createElement('div');
        confirmDiv.className = 'whatsapp-confirmation-modal';
        confirmDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            z-index: 1400;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        confirmDiv.innerHTML = `
            <div style="
                background: white;
                border-radius: var(--radius);
                padding: 25px;
                max-width: 500px;
                width: 100%;
                box-shadow: var(--shadow-dark);
            ">
                <h3 style="margin-bottom: 15px; color: var(--dark); display: flex; align-items: center; gap: 10px;">
                    <i class="fab fa-whatsapp" style="color: #25D366; font-size: var(--icon-lg);"></i>
                    إرسال الطلب عبر واتساب
                </h3>
                
                <p style="margin-bottom: 20px; color: var(--text); line-height: 1.6;">
                    تم حفظ طلبك بنجاح!<br>
                    هل تريد إرساله الآن إلى المتجر عبر واتساب؟
                </p>
                
                <div style="display: flex; gap: 15px; flex-wrap: wrap;">
                    <button id="send-whatsapp-btn" style="
                        flex: 1;
                        background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
                        color: white;
                        border: none;
                        padding: 15px;
                        border-radius: var(--radius-sm);
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        font-size: var(--font-base);
                        min-width: 150px;
                    ">
                        <i class="fab fa-whatsapp"></i>
                        نعم، أرسل الآن
                    </button>
                    
                    <button id="cancel-whatsapp-btn" style="
                        flex: 1;
                        background: var(--gray);
                        color: var(--text);
                        border: none;
                        padding: 15px;
                        border-radius: var(--radius-sm);
                        font-weight: bold;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        gap: 10px;
                        font-size: var(--font-base);
                        min-width: 150px;
                    ">
                        <i class="fas fa-times"></i>
                        إلغاء
                    </button>
                </div>
                
                <p style="margin-top: 15px; text-align: center; color: var(--text-light); font-size: 0.85rem;">
                    يمكنك إرسال الطلب لاحقاً من خلال صفحة الطلبات
                </p>
            </div>
        `;
        
        document.body.appendChild(confirmDiv);
        
        // زر إرسال واتساب
        document.getElementById('send-whatsapp-btn').addEventListener('click', () => {
            confirmDiv.remove();
            this.openWhatsApp(message);
        });
        
        // زر إلغاء
        document.getElementById('cancel-whatsapp-btn').addEventListener('click', () => {
            confirmDiv.remove();
            window.uiManager?.showNotification('تم حفظ الطلب', 'يمكنك إرساله لاحقاً عبر واتساب', 'info');
        });
        
        // إغلاق عند النقر خارج الصندوق
        confirmDiv.addEventListener('click', (e) => {
            if (e.target === confirmDiv) {
                confirmDiv.remove();
                window.uiManager?.showNotification('تم حفظ الطلب', 'يمكنك إرساله لاحقاً عبر واتساب', 'info');
            }
        });
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
    
    // فتح واتساب بطريقة آمنة
    openWhatsApp(message) {
        const whatsappNumber = "+249112703344";
        const encodedMessage = encodeURIComponent(message);
        const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
        
        // فتح في نافذة جديدة مع منع تأثير زر الرجوع
        const newWindow = window.open(whatsappURL, '_blank', 'noopener,noreferrer');
        
        if (newWindow) {
            newWindow.focus();
            window.uiManager?.showNotification('تم فتح واتساب', 'أرسل الرسالة لتأكيد طلبك', 'success');
        } else {
            // إذا حُظرت النوافذ المنبثقة، استخدم طريقة بديلة
            window.uiManager?.showNotification(
                'تم حفظ الطلب',
                'يمكنك إرساله يدوياً عبر واتساب',
                'info'
            );
            
            // عرض الرسالة للمستخدم ليتمكن من نسخها
            setTimeout(() => {
                if (confirm('هل تريد نسخ رسالة الطلب؟')) {
                    navigator.clipboard.writeText(message).then(() => {
                        window.uiManager?.showNotification('تم النسخ', 'الصق الرسالة في واتساب', 'success');
                    });
                }
            }, 1000);
        }
    }
}

// تهيئة مدير الدفع
window.checkoutManager = new CheckoutManager();
