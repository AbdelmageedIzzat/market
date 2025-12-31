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
        this.setupSecurityFeatures(); // إضافة ميزات الأمان
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
            
            // تأثير عند تحديث السلة
            this.cartIcon.addEventListener('animationend', () => {
                this.cartIcon.classList.remove('cart-pulse');
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
        
        // إضافة مستمع للشروط والأحكام
        const termsCheckbox = document.getElementById('terms-agree');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', (e) => {
                this.updateCheckoutButtonState();
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
        
        // روابط الشروط والخصوصية
        const termsLink = document.querySelector('.terms-link');
        const privacyLink = document.querySelector('.privacy-link');
        
        if (termsLink) {
            termsLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showTermsModal();
            });
        }
        
        if (privacyLink) {
            privacyLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showPrivacyModal();
            });
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
            window.uiManager?.showNotification('تحذير أمني', 
                'تم اكتشاف محتوى مشبوه في المدخلات', 'warning');
        } else if (value.length > 10 && !hasDanger) {
            input.classList.add('secure');
        }
    }
    
    // التحقق من نموذج الدفع
    validateCheckoutForm() {
        const addressField = document.getElementById('delivery-address');
        const termsCheckbox = document.getElementById('terms-agree');
        
        if (!addressField || !termsCheckbox) return true;
        
        // التحقق من العنوان
        if (addressField.value.trim().length < 10) {
            this.showNotification('عنوان غير كافي', 
                'يرجى إدخال عنوان تفصيلي (10 أحرف على الأقل)', 'warning');
            addressField.focus();
            return false;
        }
        
        // التحقق من الموافقة على الشروط
        if (!termsCheckbox.checked) {
            this.showNotification('موافقة مطلوبة', 
                'يرجى الموافقة على الشروط والأحكام للمتابعة', 'warning');
            termsCheckbox.focus();
            return false;
        }
        
        return true;
    }
    
    // تحديث حالة زر الدفع
    updateCheckoutButtonState() {
        const termsCheckbox = document.getElementById('terms-agree');
        const submitOrder = document.getElementById('submit-order');
        
        if (termsCheckbox && submitOrder) {
            submitOrder.disabled = !termsCheckbox.checked;
        }
    }
    
    // عرض نافذة الشروط والأحكام
    showTermsModal() {
        const modalContent = `
            <div class="modal-overlay" id="terms-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-file-contract"></i> الشروط والأحكام</h3>
                        <button class="modal-close" onclick="window.uiManager.closeTermsModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="terms-content">
                            <h4>شروط وأحكام Global Store</h4>
                            <p>آخر تحديث: ${new Date().toLocaleDateString('ar-SA')}</p>
                            
                            <h5>1. القبول</h5>
                            <p>باستخدامك لموقع Global Store، فإنك توافق على الالتزام بهذه الشروط والأحكام.</p>
                            
                            <h5>2. المنتجات والأسعار</h5>
                            <p>جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة إن وجدت.</p>
                            
                            <h5>3. الطلبات والتسليم</h5>
                            <p>يتم تسليم الطلبات خلال 2-5 أيام عمل حسب الموقع.</p>
                            
                            <h5>4. الدفع</h5>
                            <p>نحن نقبل الدفع عند الاستلام والتحويل البنكي.</p>
                            
                            <h5>5. الاسترجاع والاستبدال</h5>
                            <p>يمكنك استرجاع المنتجات خلال 14 يوم من الاستلام.</p>
                            
                            <h5>6. الخصوصية</h5>
                            <p>نحن نحترم خصوصيتك ولا نشارك بياناتك مع أطراف ثالثة.</p>
                            
                            <div class="terms-agreement-check">
                                <input type="checkbox" id="terms-read">
                                <label for="terms-read">لقد قرأت وفهمت الشروط والأحكام</label>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="window.uiManager.closeTermsModal()">
                            <i class="fas fa-check"></i> فهمت
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النافذة إذا لم تكن موجودة
        if (!document.getElementById('terms-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalContent);
            
            // إضافة CSS للنافذة
            this.addModalStyles();
        }
        
        // إظهار النافذة
        document.getElementById('terms-modal').style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    // عرض نافذة سياسة الخصوصية
    showPrivacyModal() {
        const modalContent = `
            <div class="modal-overlay" id="privacy-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3><i class="fas fa-shield-alt"></i> سياسة الخصوصية</h3>
                        <button class="modal-close" onclick="window.uiManager.closePrivacyModal()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="privacy-content">
                            <h4>سياسة خصوصية Global Store</h4>
                            <p>نحن نحمي خصوصية مستخدمينا وبياناتهم الشخصية.</p>
                            
                            <h5>1. المعلومات التي نجمعها</h5>
                            <p>نقوم بجمع المعلومات الضرورية فقط لإتمام الطلبات.</p>
                            
                            <h5>2. استخدام المعلومات</h5>
                            <p>نستخدم معلوماتك فقط لتقديم الخدمة وتحسين تجربتك.</p>
                            
                            <h5>3. حماية المعلومات</h5>
                            <p>نستخدم تقنيات تشفير لحماية بياناتك الشخصية.</p>
                            
                            <h5>4. ملفات تعريف الارتباط</h5>
                            <p>نستخدم ملفات تعريف الارتباط لتحسين تجربة التصفح.</p>
                            
                            <h5>5. حقوقك</h5>
                            <p>يمكنك طلب حذف بياناتك الشخصية في أي وقت.</p>
                            
                            <div class="contact-info">
                                <p><i class="fas fa-envelope"></i> للاستفسارات: privacy@globalstore.com</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="modal-btn" onclick="window.uiManager.closePrivacyModal()">
                            <i class="fas fa-check"></i> فهمت
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // إضافة النافذة إذا لم تكن موجودة
        if (!document.getElementById('privacy-modal')) {
            document.body.insertAdjacentHTML('beforeend', modalContent);
        }
        
        // إظهار النافذة
        document.getElementById('privacy-modal').style.display = 'block';
        document.body.classList.add('modal-open');
    }
    
    // إغلاق نافذة الشروط
    closeTermsModal() {
        const modal = document.getElementById('terms-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // إغلاق نافذة الخصوصية
    closePrivacyModal() {
        const modal = document.getElementById('privacy-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.classList.remove('modal-open');
        }
    }
    
    // إضافة أنماط النوافذ
    addModalStyles() {
        if (!document.getElementById('modal-styles')) {
            const styles = `
            <style>
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(5px);
                    z-index: 1400;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }
                
                .modal-content {
                    background-color: white;
                    border-radius: var(--radius);
                    width: 100%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    box-shadow: var(--shadow-dark);
                    animation: modalFadeIn 0.3s ease;
                }
                
                @keyframes modalFadeIn {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .modal-header {
                    background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 100%);
                    color: white;
                    padding: 20px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    border-radius: var(--radius) var(--radius) 0 0;
                }
                
                .modal-header h3 {
                    font-size: var(--font-lg);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .modal-close {
                    background: rgba(255, 255, 255, 0.1);
                    border: none;
                    color: white;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: var(--transition);
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.2);
                    transform: rotate(90deg);
                }
                
                .modal-body {
                    padding: 25px;
                }
                
                .terms-content, .privacy-content {
                    line-height: 1.8;
                }
                
                .terms-content h4, .privacy-content h4 {
                    color: var(--primary);
                    margin-bottom: 10px;
                }
                
                .terms-content h5, .privacy-content h5 {
                    color: var(--dark);
                    margin: 20px 0 10px;
                    font-size: var(--font-base);
                }
                
                .terms-content p, .privacy-content p {
                    margin-bottom: 15px;
                    color: var(--text);
                }
                
                .terms-agreement-check {
                    margin-top: 25px;
                    padding: 15px;
                    background-color: var(--light);
                    border-radius: var(--radius-sm);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .contact-info {
                    margin-top: 25px;
                    padding: 15px;
                    background-color: var(--light);
                    border-radius: var(--radius-sm);
                }
                
                .contact-info p {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .modal-footer {
                    padding: 20px;
                    border-top: 1px solid var(--gray);
                    text-align: left;
                }
                
                .modal-btn {
                    background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: var(--radius-sm);
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    transition: var(--transition);
                }
                
                .modal-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 5px 15px rgba(58, 54, 224, 0.3);
                }
            </style>
            `;
            
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    // فتح سلة المشتريات
    openCartSidebar() {
        if (this.cartSidebar) {
            this.cartSidebar.classList.add('active');
            
            // إضافة تأثير النبض للرمز
            if (this.cartIcon) {
                this.cartIcon.classList.add('cart-pulse');
            }
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
            case 'security':
                icon = 'fa-shield-alt';
                borderColor = 'var(--security-success)';
                break;
        }
        
        // تحديث المحتوى
        this.notificationTitle.textContent = title;
        this.notificationMessage.textContent = message;
        this.notification.querySelector('.notification-icon').className = `fas ${icon} notification-icon`;
        this.notification.style.borderRightColor = borderColor;
        
        // إظهار الإشعار
        this.notification.classList.add('show');
        
        // إخفاء الإشعار تلقائياً بعد 2 ثانية (تم تصغير الوقت)
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
    
    // التحقق من اتصال الإنترنت
    checkInternetConnection() {
        if (!navigator.onLine) {
            this.showNotification('لا يوجد اتصال بالإنترنت', 
                'يرجى التحقق من اتصالك بالإنترنت', 'warning');
            return false;
        }
        return true;
    }
    
    // إظهار رسالة تأكيد قبل المسح
    confirmClearCart() {
        return confirm('هل أنت متأكد من رغبتك في إفراغ سلة المشتريات؟');
    }
}

// تهيئة مدير واجهة المستخدم
window.uiManager = new UIManager();
