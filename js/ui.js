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
        
        // إضافة متغيرات للبحث
        this.searchContainer = null;
        this.searchInput = null;
        this.searchResults = null;
        this.searchTimeout = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupScrollHandler();
        this.addSearchFunctionality();
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
    
    // إضافة وظيفة البحث
    addSearchFunctionality() {
        if (!document.querySelector('.header-actions')) return;
        
        // إنشاء عنصر البحث
        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'search-container';
        this.searchContainer.innerHTML = `
            <div class="search-box">
                <i class="fas fa-search"></i>
                <input type="text" id="product-search" placeholder="ابحث عن منتج...">
                <button class="clear-search" id="clear-search" style="display:none;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="search-results" id="search-results"></div>
        `;
        
        document.querySelector('.header-actions').prepend(this.searchContainer);
        
        // الحصول على العناصر
        this.searchInput = document.getElementById('product-search');
        this.searchResults = document.getElementById('search-results');
        const clearBtn = document.getElementById('clear-search');
        
        if (!this.searchInput || !this.searchResults) return;
        
        // إعداد مستمعي الأحداث
        this.searchInput.addEventListener('input', (e) => {
            const term = e.target.value.trim();
            
            // عرض/إخفاء زر المسح
            if (clearBtn) {
                clearBtn.style.display = term ? 'block' : 'none';
            }
            
            // إلغاء البحث السابق
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            
            // البحث بعد تأخير
            if (term.length >= 2) {
                this.searchTimeout = setTimeout(() => {
                    this.performSearch(term);
                }, 300);
            } else {
                this.hideSearchResults();
            }
        });
        
        // مسح البحث
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.searchInput.value = '';
                clearBtn.style.display = 'none';
                this.hideSearchResults();
                this.searchInput.focus();
            });
        }
        
        // إغلاق النتائج عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!this.searchContainer.contains(e.target)) {
                this.hideSearchResults();
            }
        });
    }
    
    // تنفيذ البحث
    performSearch(term) {
        const results = window.productsManager?.searchProducts(term) || [];
        this.displaySearchResults(results);
    }
    
    // عرض نتائج البحث
    displaySearchResults(results) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <i class="fas fa-search"></i>
                    <span>لا توجد نتائج للبحث</span>
                </div>
            `;
        } else {
            this.searchResults.innerHTML = results.map(product => `
                <div class="search-result-item" data-id="${product.id}" data-category="${product.category}">
                    <div class="search-result-image">
                        ${product.image}
                    </div>
                    <div class="search-result-info">
                        <div class="search-result-name">${product.name}</div>
                        <div class="search-result-category">${product.categoryName}</div>
                        <div class="search-result-price">${product.price} ريال</div>
                    </div>
                </div>
            `).join('');
            
            // إضافة مستمعي الأحداث للنتائج
            this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', () => {
                    const id = item.dataset.id;
                    const category = item.dataset.category;
                    
                    // الانتقال للفئة المناسبة
                    window.productsManager?.switchCategory(category);
                    
                    // إخفاء نتائج البحث
                    this.hideSearchResults();
                    
                    // مسح حقل البحث
                    if (this.searchInput) {
                        this.searchInput.value = '';
                        const clearBtn = document.getElementById('clear-search');
                        if (clearBtn) clearBtn.style.display = 'none';
                    }
                    
                    // التمرير للمنتج
                    setTimeout(() => {
                        const productElement = document.querySelector(`.product-card [data-id="${id}"]`) ||
                                              document.querySelector(`.offer-card [data-id="${id}"]`);
                        if (productElement) {
                            productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // إضافة تأثير للمنتج
                            productElement.classList.add('pulse');
                            setTimeout(() => {
                                productElement.classList.remove('pulse');
                            }, 1000);
                        }
                    }, 500);
                });
            });
        }
        
        this.searchResults.classList.add('active');
    }
    
    // إخفاء نتائج البحث
    hideSearchResults() {
        if (this.searchResults) {
            this.searchResults.classList.remove('active');
        }
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
    
    // إظهار إشعار محسن
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
        if (this.notificationTimeout) {
            clearTimeout(this.notificationTimeout);
        }
        
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
                this.notificationTimeout = null;
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
                background: rgba(255, 255, 255, 0.9);
                padding: 20px;
                border-radius: var(--radius);
                box-shadow: var(--shadow-dark);
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
}

// تهيئة مدير واجهة المستخدم
window.uiManager = new UIManager();
