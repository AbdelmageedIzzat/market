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
        this.addAnimationStyles();
    }
    
    setupEventListeners() {
        // زر العودة للأعلى
        if (this.backToTop) {
            this.backToTop.addEventListener('click', () => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            });
        }
        
        // فتح سلة المشتريات
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => {
                this.openCartSidebar();
            });
        }
        
        // إغلاق سلة المشتريات
        if (this.closeCart) {
            this.closeCart.addEventListener('click', () => {
                this.closeCartSidebar();
            });
        }
        
        // متابعة التسوق
        if (this.continueShopping) {
            this.continueShopping.addEventListener('click', () => {
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
    
    // إضافة أنماط CSS للحركات
    addAnimationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* تأثيرات الحركة */
            @keyframes vibrate {
                0%, 100% { transform: translateX(0) scale(1.1); }
                25% { transform: translateX(-2px) scale(1.1); }
                75% { transform: translateX(2px) scale(1.1); }
            }
            
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.1); }
                100% { transform: scale(1); }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-5px); }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
            
            /* تأثير عند إضافة منتج للسلة */
            .add-to-cart-animation {
                animation: pulse 0.5s ease, vibrate 0.3s ease;
            }
            
            /* تأثير عند تحديث الكمية */
            .quantity-update-animation {
                animation: bounce 0.3s ease;
            }
            
            /* تأثير عند حذف منتج */
            .item-removing-animation {
                animation: shake 0.3s ease;
            }
            
            /* تأثير للمنتجات الجديدة */
            .new-item-animation {
                animation: fadeInUp 0.6s ease;
            }
        `;
        document.head.appendChild(style);
    }
    
    // فتح سلة المشتريات
    openCartSidebar() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.add('active');
        }
    }
    
    // إغلاق سلة المشتريات
    closeCartSidebar() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.remove('active');
        }
    }
    
    // إظهار إشعار
    showNotification(title, message, type = 'success') {
        if (!this.notification || !this.notificationTitle || !this.notificationMessage) return;
        
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
        
        // إخفاء الإشعار تلقائياً بعد 2 ثانية
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
    
    // إضافة تأثير عند إضافة منتج للسلة - ✅ هذه الدالة المطلوبة
    addToCartAnimation(element) {
        if (!element) return;
        
        // إضافة تأثير النبض والاهتزاز
        element.classList.add('add-to-cart-animation');
        
        // إضافة تأثير تغيير اللون المؤقت
        const originalBackground = element.style.background;
        const originalColor = element.style.color;
        
        if (element.classList.contains('added')) {
            // إذا كان المنتج مضاف بالفعل (تحويل إلى إزالة)
            element.style.background = 'linear-gradient(135deg, var(--danger) 0%, #c53030 100%)';
            element.style.color = 'white';
        } else {
            // إذا كان إضافة جديدة
            element.style.background = 'linear-gradient(135deg, var(--success) 0%, #0DA67A 100%)';
            element.style.color = 'white';
        }
        
        // إضافة تأثير التوسع
        element.style.transform = 'scale(1.1)';
        element.style.boxShadow = '0 6px 20px rgba(58, 54, 224, 0.4)';
        
        // إزالة التأثيرات بعد انتهاء الوقت
        setTimeout(() => {
            element.classList.remove('add-to-cart-animation');
            element.style.background = originalBackground;
            element.style.color = originalColor;
            element.style.transform = '';
            element.style.boxShadow = '';
        }, 500);
    }
    
    // تأثير عند تحديث كمية منتج
    updateQuantityAnimation(element) {
        if (!element) return;
        
        element.classList.add('quantity-update-animation');
        
        setTimeout(() => {
            element.classList.remove('quantity-update-animation');
        }, 300);
    }
    
    // تأثير عند حذف منتج
    removeItemAnimation(element) {
        if (!element) return;
        
        element.classList.add('item-removing-animation');
        
        // تغيير اللون إلى الأحمر مؤقتاً
        const originalBackground = element.style.background;
        element.style.background = 'linear-gradient(135deg, var(--danger) 0%, #c53030 100%)';
        element.style.color = 'white';
        
        setTimeout(() => {
            element.classList.remove('item-removing-animation');
            element.style.background = originalBackground;
            element.style.color = '';
        }, 300);
    }
    
    // تأثير ظهور عنصر جديد
    newItemAnimation(element) {
        if (!element) return;
        
        element.classList.add('new-item-animation');
        element.style.opacity = '0';
        
        // تأثير الظهور التدريجي
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transition = 'opacity 0.6s ease';
        }, 10);
        
        setTimeout(() => {
            element.classList.remove('new-item-animation');
            element.style.transition = '';
        }, 600);
    }
    
    // تحميل مؤقت
    showLoader(show = true) {
        if (show) {
            // إضافة مؤقت إذا لزم الأمر
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
                background: rgba(255, 255, 255, 0.9);
                width: 80px;
                height: 80px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 5px 25px rgba(0, 0, 0, 0.15);
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
        const quantityControl = document.querySelector(`.quantity-control[data-id="${productId}"]`);
        
        if (quantityElement) {
            quantityElement.textContent = quantity;
            // إضافة تأثير على العدد
            this.updateQuantityAnimation(quantityElement);
        }
        
        if (addButton) {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                    // إضافة تأثير لعنصر التحكم بالكمية
                    this.newItemAnimation(quantityControl);
                }
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
            
            // إضافة تأثير للزر
            this.addToCartAnimation(addButton);
        }
    }
    
    // تأثير على زر السلة عند إضافة منتج
    animateCartIcon() {
        if (this.cartIcon) {
            // تأثير الاهتزاز
            this.cartIcon.style.animation = 'bounce 0.5s ease';
            
            // تأثير التوسع المؤقت
            this.cartIcon.style.transform = 'scale(1.2)';
            
            setTimeout(() => {
                this.cartIcon.style.animation = '';
                this.cartIcon.style.transform = '';
            }, 500);
        }
    }
    
    // عرض رسالة ترحيب
    showWelcomeMessage() {
        setTimeout(() => {
            this.showNotification('مرحباً بك في Global Store!', 'تصفح عروضنا الحصرية وأضف ما تريد إلى سلة المشتريات');
        }, 1000);
    }
}

// تهيئة مدير واجهة المستخدم
window.uiManager = new UIManager();
