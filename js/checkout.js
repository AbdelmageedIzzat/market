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
        
        // إزالة خانة الموافقة على الشروط إذا كانت موجودة
        this.removeTermsCheckbox();
    }
    
    // إزالة خانة الموافقة على الشروط
    removeTermsCheckbox() {
        const termsAgreement = document.querySelector('.terms-agreement');
        if (termsAgreement) {
            termsAgreement.remove();
        }
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
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
            
            // إنشاء رسالة الطلب
            const message = this.createOrderMessage(address, paymentMethod, notes);
            console.log('رسالة الطلب جاهزة');
            
            // حفظ الطلب مؤقتاً
            this.saveOrderToLocalStorage(address, paymentMethod, notes);
            
            // إغلاق نافذة الدفع
            this.closeCheckoutModal();
            
            // إظهار نافذة التأكيد النهائية
            this.showFinalConfirmation(address, paymentMethod, notes, message);
            
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
    
    // عرض نافذة التأكيد النهائية
    showFinalConfirmation(address, paymentMethod, notes, message) {
        const cartItems = window.cartManager.getAllItems();
        const total = window.cartManager.getTotal();
        const paymentMethodName = this.getPaymentMethodName(paymentMethod);
        
        // إنشاء نافذة التأكيد النهائية
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'final-confirmation-modal';
        confirmationModal.id = 'final-confirmation-modal';
        
        confirmationModal.innerHTML = `
            <div class="final-confirmation-content">
                <div class="confirmation-header">
                    <h3><i class="fas fa-check-circle"></i> تأكيد الطلب النهائي</h3>
                </div>
                
                <div class="confirmation-body">
                    <div class="order-details-confirm">
                        <div class="order-detail-item">
                            <span>العنوان:</span>
                            <span>${address}</span>
                        </div>
                        <div class="order-detail-item">
                            <span>طريقة الدفع:</span>
                            <span>${paymentMethodName}</span>
                        </div>
                        <hr style="margin: 15px 0; border-color: var(--gray);">
                        
                        ${cartItems.map(item => `
                            <div class="order-detail-item">
                                <span>${item.name} × ${item.quantity}</span>
                                <span>${(item.price * item.quantity).toFixed(2)} ريال</span>
                            </div>
                        `).join('')}
                        
                        <hr style="margin: 15px 0; border-color: var(--gray);">
                        <div class="order-detail-item" style="font-weight: bold;">
                            <span>المجموع الكلي:</span>
                            <span>${total.toFixed(2)} ريال</span>
                        </div>
                        
                        ${notes ? `
                        <div class="order-detail-item">
                            <span>ملاحظات:</span>
                            <span>${notes}</span>
                        </div>
                        ` : ''}
                    </div>
                    
                    <div class="whatsapp-notice">
                        <i class="fab fa-whatsapp"></i>
                        <p>⚠️ الرجاء التأكد من صحة المعلومات قبل الإرسال</p>
                    </div>
                    
                    <div class="final-warning">
                        <p><strong>سيتم إرسال هذا الطلب عبر الواتساب إلى البائع للتجهيز</strong></p>
                        <p style="margin-top: 10px; font-size: 0.9rem;">يرجى التأكيد للمرة الأخيرة قبل الإرسال</p>
                    </div>
                </div>
                
                <div class="confirmation-footer">
                    <button class="send-whatsapp-btn" onclick="window.checkoutManager.sendToWhatsApp('${this.escapeString(message)}')">
                        <i class="fab fa-whatsapp"></i> تأكيد وإرسال بالواتساب
                    </button>
                    <button class="edit-order-btn" onclick="window.checkoutManager.editOrder()">
                        تعديل الطلب
                    </button>
                </div>
            </div>
        `;
        
        // إضافة النافذة إلى الصفحة
        document.body.appendChild(confirmationModal);
        
        // إظهار النافذة مع تأثير
        setTimeout(() => {
            confirmationModal.classList.add('active');
        }, 50);
        
        // منع التمرير عند فتح النافذة
        document.body.classList.add('modal-open');
    }
    
    // تهريب النص للتضمين
    escapeString(str) {
        return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
    }
    
    // تعديل الطلب
    editOrder() {
        const confirmationModal = document.getElementById('final-confirmation-modal');
        if (confirmationModal) {
            confirmationModal.classList.remove('active');
            setTimeout(() => {
                confirmationModal.remove();
                document.body.classList.remove('modal-open');
                
                // إعادة فتح نافذة الدفع
                this.openCheckoutModal();
            }, 300);
        }
    }
    
    // إرسال إلى واتساب
    sendToWhatsApp(message) {
        try {
            // فك التهريب
            const decodedMessage = message.replace(/\\'/g, "'").replace(/\\n/g, '\n');
            
            // رقم واتساب المتجر
            const whatsappNumber = "+249112703344";
            
            // تنظيف الرقم من الأحرف غير الرقمية
            const cleanNumber = whatsappNumber.replace(/\D/g, '');
            
            // ترميز الرسالة بشكل صحيح
            const encodedMessage = encodeURIComponent(decodedMessage);
            
            // رابط واتساب
            const whatsappURL = `https://wa.me/${cleanNumber}?text=${encodedMessage}`;
            
            console.log('رابط واتساب:', whatsappURL);
            
            // إغلاق نافذة التأكيد
            const confirmationModal = document.getElementById('final-confirmation-modal');
            if (confirmationModal) {
                confirmationModal.classList.remove('active');
                setTimeout(() => {
                    confirmationModal.remove();
                    document.body.classList.remove('modal-open');
                }, 300);
            }
            
            // إغلاق السلة
            document.getElementById('cart-sidebar')?.classList.remove('active');
            
            // إفراغ السلة
            window.cartManager.clearCart();
            
            // إعادة تعيين النموذج
            this.checkoutForm?.reset();
            
            // إظهار رسالة نجاح
            window.uiManager?.showNotification('نجاح', 'تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً.', 'success');
            
            // فتح واتساب في نافذة جديدة
            setTimeout(() => {
                window.open(whatsappURL, '_blank');
            }, 500);
            
        } catch (error) {
            console.error('خطأ في إرسال واتساب:', error);
            window.uiManager?.showNotification('خطأ', 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة مرة أخرى.', 'error');
        }
    }
    
    // إنشاء رسالة الطلب مع تنسيق محسن
    createOrderMessage(address, paymentMethod, notes) {
        const cartItems = window.cartManager.getAllItems();
        let total = 0;
        
        let message = `🛒 *طلب جديد - Global Store* 🛒\n`;
        message += `══════════════════\n\n`;
        
        message += `📋 *معلومات الطلب:*\n`;
        message += `📍 العنوان: ${address}\n`;
        message += `💳 طريقة الدفع: ${this.getPaymentMethodName(paymentMethod)}\n`;
        message += `📅 التاريخ: ${new Date().toLocaleString('ar-SA')}\n\n`;
        
        message += `🛍️ *المنتجات:*\n`;
        message += `══════════════════\n`;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `\n${index + 1}. ${item.name}\n`;
            message += `   الكمية: ${item.quantity}\n`;
            message += `   السعر: ${item.price.toFixed(2)} × ${item.quantity} = ${itemTotal.toFixed(2)} ريال\n`;
            message += `══════════════════\n`;
        });
        
        message += `\n💰 *الإجماليات:*\n`;
        message += `══════════════════\n`;
        message += `المجموع الكلي: ${total.toFixed(2)} ريال\n\n`;
        
        if (notes) {
            message += `📝 *ملاحظات العميل:*\n`;
            message += `${notes}\n\n`;
        }
        
        message += `شكراً لطلبكم من Global Store! 🚀\n`;
        message += `سيتم التواصل معكم قريباً لتأكيد الطلب.`;
        
        console.log('رسالة الطلب المحسنة:', message);
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
}

// تهيئة مدير الدفع
window.checkoutManager = new CheckoutManager();
