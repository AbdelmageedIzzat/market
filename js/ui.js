// إدارة واجهة المستخدم

class UIManager {
    constructor() {
        this.notification = document.getElementById('notification');
        this.notificationTitle = document.getElementById('notification-title');
        this.notificationMessage = document.getElementById('notification-message');
        this.notificationClose = document.getElementById('notification-close');
        this.backToTop = document.getElementById('back-to-top');
        this.cartIcon = document.getElementById('cart-icon');
        this.cartSidebar = document.getElementById('cart-sidebar');
        this.closeCart = document.getElementById('close-cart');
        this.continueShopping = document.getElementById('continue-shopping');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.homeLogo = document.getElementById('home-logo');
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupScrollHandler();
        this.setupSecurityFeatures();
        
        console.log('UIManager: تم التهيئة');
    }
    
    setupEventListeners() {
        console.log('UIManager: بدء إعداد مستمعي الأحداث...');
        
        // زر العودة للأعلى
        if (this.backToTop) {
            this.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // فتح سلة المشتريات
        if (this.cartIcon) {
            console.log('UIManager: إعداد حدث النقر على cart-icon');
            
            this.cartIcon.addEventListener('click', (e) => {
                console.log('UIManager: تم النقر على cart-icon');
                e.stopPropagation();
                e.preventDefault();
                this.openCartSidebar();
            });
            
            // تأثير عند تحديث السلة
            this.cartIcon.addEventListener('animationend', () => {
                this.cartIcon.classList.remove('cart-pulse');
            });
        }
        
        // إغلاق سلة المشتريات
        if (this.closeCart) {
            this.closeCart.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeCartSidebar();
            });
        }
        
        // متابعة التسوق
        if (this.continueShopping) {
            this.continueShopping.addEventListener('click', (e) => {
                e.stopPropagation();
                this.closeCartSidebar();
            });
        }
        
        // زر إتمام الطلب
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                window.checkoutManager?.openCheckoutModal();
            });
        }
        
        // الشعار الرئيسي
        if (this.homeLogo) {
            this.homeLogo.addEventListener('click', (e) => {
                e.preventDefault();
                window.productsManager?.switchCategory('offers');
            });
        }
        
        // إغلاق الإشعار
        if (this.notificationClose) {
            this.notificationClose.addEventListener('click', () => {
                this.hideNotification();
            });
        }
        
        // إغلاق السلة عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (this.cartSidebar?.classList.contains('active') && 
                !this.cartSidebar.contains(e.target) && 
                !this.cartIcon.contains(e.target)) {
                this.closeCartSidebar();
            }
        });
        
        // إغلاق الإشعار تلقائياً
        this.notification?.addEventListener('click', (e) => {
            if (e.target === this.notification || e.target.closest('.notification-close')) {
                this.hideNotification();
            }
        });
    }
    
    setupScrollHandler() {
        window.addEventListener('scroll', () => {
            if (this.backToTop) {
                if (window.scrollY > 300) {
                    this.backToTop.classList.add('visible');
                } else {
                    this.backToTop.classList.remove('visible');
                }
            }
        });
    }
    
    // إعداد ميزات الأمان
    setupSecurityFeatures() {
        // عداد الأحرف للمدخلات
        const addressField = document.getElementById('delivery-address');
        const notesField = document.getElementById('order-notes');
        
        if (addressField) {
            addressField.addEventListener('input', (e) => {
                this.updateCharCounter(e.target, 'address-counter');
                this.checkInputSecurity(e.target);
            });
            
            // التهيئة الأولية
            this.updateCharCounter(addressField, 'address-counter');
        }
        
        if (notesField) {
            notesField.addEventListener('input', (e) => {
                this.updateCharCounter(e.target, 'notes-counter');
                this.checkInputSecurity(e.target);
            });
            
            // التهيئة الأولية
            this.updateCharCounter(notesField, 'notes-counter');
        }
        
        // التحقق من النموذج قبل الإرسال
        const checkoutForm = document.getElementById('checkout-form');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                if (!this.validateCheckoutForm()) {
                    e.preventDefault();
                }
            });
        }
    }
    
    // تحديث عداد الأحرف
    updateCharCounter(input, counterId) {
        const counter = document.getElementById(counterId);
        if (counter) {
            const length = input.value.length;
            const span = counter.querySelector('span');
            if (span) {
                span.textContent = length;
            }
            
            // تغيير اللون حسب الطول
            if (length > 400) {
                counter.style.color = 'var(--security-warning)';
            } else if (length > 450) {
                counter.style.color = 'var(--security-danger)';
            } else {
                counter.style.color = 'var(--text-light)';
            }
        }
    }
    
    // التحقق من أمان المدخلات
    checkInputSecurity(input) {
        const value = input.value;
        
        // إزالة الفئات القديمة
        input.classList.remove('secure', 'suspicious');
        
        if (value.length === 0) return;
        
        // فحص الروابط الخطرة
        const dangerousPatterns = [
            /javascript:/i,
            /data:/i,
            /<script/i,
            /eval\(/i,
            /document\./i,
            /window\./i,
            /\.js\b/i
        ];
        
        const hasDanger = dangerousPatterns.some(pattern => pattern.test(value));
        
        if (hasDanger) {
            input.classList.add('suspicious');
            this.showNotification('تحذير أمني', 
                'تم اكتشاف محتوى مشبوه في المدخلات', 'warning');
        } else if (value.length > 10 && !hasDanger) {
            input.classList.add('secure');
        }
    }
    
    // التحقق من نموذج الدفع
    validateCheckoutForm() {
        const addressField = document.getElementById('delivery-address');
        
        if (!addressField) return true;
        
        // التحقق من العنوان
        if (addressField.value.trim().length < 10) {
            this.showNotification('عنوان غير كافي', 
                'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)', 'warning');
            addressField.focus();
            return false;
        }
        
        return true;
    }
    
    // فتح سلة المشتريات
    openCartSidebar() {
        console.log('UIManager: فتح السلة');
        if (this.cartSidebar) {
            this.cartSidebar.classList.add('active');
            console.log('UIManager: تمت إضافة class active للسلة');
            
            // إضافة تأثير النبض للرمز
            if (this.cartIcon) {
                this.cartIcon.classList.add('cart-pulse');
            }
        }
    }
    
    // إغلاق سلة المشتريات
    closeCartSidebar() {
        console.log('UIManager: إغلاق السلة');
        if (this.cartSidebar) {
            this.cartSidebar.classList.remove('active');
        }
    }
    
    // إظهار إشعار
    showNotification(title, message, type = 'success') {
        console.log('UIManager: عرض إشعار:', title);
        
        if (!this.notification || !this.notificationTitle || !this.notificationMessage) {
            console.error('UIManager: عناصر الإشعار غير موجودة');
            return;
        }
        
        // إعداد الألوان حسب النوع
        let icon = 'fa-check-circle';
        let borderColor = 'var(--primary)';
        
        switch (type) {
            case 'success':
                icon = 'fa-check-circle';
                borderColor = 'var(--success)';
                break;
            case 'error':
                icon = 'fa-exclamation-circle';
                borderColor = 'var(--danger)';
                break;
            case 'warning':
                icon = 'fa-exclamation-triangle';
                borderColor = 'var(--warning)';
                break;
            case 'info':
                icon = 'fa-info-circle';
                borderColor = 'var(--info)';
                break;
        }
        
        // تحديث المحتوى
        this.notificationTitle.textContent = title;
        this.notificationMessage.textContent = message;
        this.notification.querySelector('.notification-icon').className = `fas ${icon} notification-icon`;
        this.notification.style.borderRightColor = borderColor;
        
        // إظهار الإشعار
        this.notification.classList.add('show');
        
        // إخفاء الإشعار تلقائياً بعد 2 ثانية (مختصر)
        this.notificationTimeout = setTimeout(() => {
            this.hideNotification();
        }, 2000);
    }
    
    // إخفاء الإشعار
    hideNotification() {
        if (this.notification) {
            this.notification.classList.remove('show');
            if (this.notificationTimeout) {
                clearTimeout(this.notificationTimeout);
            }
        }
    }
    
    // عرض إشعار السلة في الموبايل
    showCartNotificationMobile() {
        if (window.innerWidth > 768) return; // عرض في الموبايل فقط
        
        // إزالة أي إشعار سابق
        this.removeCartNotificationMobile();
        
        const cartItemCount = window.cartManager?.getItemCount() || 0;
        
        if (cartItemCount === 0) return;
        
        const notification = document.createElement('div');
        notification.className = 'cart-notification-mobile';
        notification.id = 'cart-notification-mobile';
        notification.innerHTML = `
            <div class="cart-notification-info">
                <i class="fas fa-shopping-bag"></i>
                <div>
                    <div style="font-weight: bold; font-size: 0.9rem;">${cartItemCount} منتج في السلة</div>
                    <div style="font-size: 0.8rem; opacity: 0.9;">انقر لعرض السلة</div>
                </div>
            </div>
            <div class="cart-notification-actions">
                <button class="cart-notification-btn view-cart">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="cart-notification-btn checkout-now">
                    <i class="fas fa-shopping-bag"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إظهار الإشعار بعد تأخير بسيط
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        // إضافة مستمعي الأحداث
        setTimeout(() => {
            // فتح السلة عند النقر على الإشعار
            notification.querySelector('.cart-notification-info').addEventListener('click', () => {
                this.openCartSidebar();
                this.removeCartNotificationMobile();
            });
            
            // فتح السلة عند النقر على زر العرض
            notification.querySelector('.view-cart').addEventListener('click', (e) => {
                e.stopPropagation();
                this.openCartSidebar();
                this.removeCartNotificationMobile();
            });
            
            // إتمام الطلب مباشرة
            notification.querySelector('.checkout-now').addEventListener('click', (e) => {
                e.stopPropagation();
                window.checkoutManager?.openCheckoutModal();
                this.removeCartNotificationMobile();
            });
            
            // إخفاء الإشعار بعد 5 ثوان
            setTimeout(() => {
                this.removeCartNotificationMobile();
            }, 5000);
        }, 50);
    }
    
    // إزالة إشعار السلة في الموبايل
    removeCartNotificationMobile() {
        const notification = document.getElementById('cart-notification-mobile');
        if (notification) {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }
    }
    
    // إضافة تأثير عند إضافة منتج
    addToCartAnimation(element) {
        if (!element) return;
        
        element.style.transform = 'scale(1.2)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }
    
    // تحميل مؤقت
    showLoader(show = true) {
        if (show) {
            const loader = document.createElement('div');
            loader.id = 'global-loader';
            loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            loader.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2rem;
                color: var(--primary);
                z-index: 9999;
            `;
            document.body.appendChild(loader);
        } else {
            const loader = document.getElementById('global-loader');
            if (loader) {
                loader.remove();
            }
        }
    }
    
    // تحديث واجهة المنتج بعد التعديل
    updateProductUI(productId, quantity) {
        const quantityElement = document.getElementById(`quantity-${productId}`);
        const addButton = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
        
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
        
        if (addButton) {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
            }
            
            // إضافة تأثير
            this.addToCartAnimation(addButton);
        }
    }
    
    // عرض رسالة ترحيب
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('مرحباً بك في Global Store!', 'تصفح عروضنا الحصرية وأضف ما تريد إلى سلة المشتريات', 'info');
        }, 1000);
    }
    
    // إضافة تأثير النبض للسلة
    pulseCartIcon() {
        if (this.cartIcon) {
            this.cartIcon.classList.add('cart-pulse');
            setTimeout(() => {
                this.cartIcon.classList.remove('cart-pulse');
            }, 1000);
        }
    }
}

// تهيئة مدير واجهة المستخدم
document.addEventListener('DOMContentLoaded', () => {
    window.uiManager = new UIManager();
});
