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
            window.uiManager?.showNotification('سلة فارغة', 'يرجى إضافة منتجات إلى السلة أولاً');
            return;
        }
        
        // تعطيل الزر أثناء المعالجة
        const submitBtn = e.target.querySelector('.submit-order') || this.submitOrder;
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
        
        try {
            // جمع بيانات النموذج
            const address = document.getElementById('delivery-address')?.value.trim() || '';
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value || 'cash';
            const notes = document.getElementById('order-notes')?.value.trim() || '';
            
            // التحقق من العنوان
            if (!address) {
                window.uiManager?.showNotification('عنوان مطلوب', 'يرجى إدخال عنوان الاستلام');
                throw new Error('عنوان الاستلام مطلوب');
            }
            
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
            
            // فتح واتساب بعد تأخير قصير
            setTimeout(() => {
                this.openWhatsApp(message);
                window.uiManager?.showNotification('تم فتح واتساب', 'يرجى إرسال الرسالة إلى المتجر لتأكيد طلبك');
            }, 1000);
            
        } catch (error) {
            console.error('خطأ في إرسال الطلب:', error);
            window.uiManager?.showNotification('خطأ في الإرسال', error.message || 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.');
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
            address: address,
            payment: paymentMethod,
            notes: notes,
            cart: cartItems,
            total: total,
            date: new Date().toLocaleString('ar-SA')
        };
        
        localStorage.setItem('lastOrder', JSON.stringify(order));
        
        // حفظ تاريخ الطلب
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        orderHistory.push(order);
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