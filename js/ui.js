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
        
        // تحسين تجربة الموبايل: إغلاق لوحة المفاتيح عند التمرير
        if ('ontouchstart' in window) {
            let inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            });
        }
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
        }
        
        if (addButton) {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                }
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
            
            // إضافة تأثير
            this.addToCartAnimation(addButton);
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
