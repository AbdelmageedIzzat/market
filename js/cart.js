// إدارة سلة المشتريات الذكية

class SmartCartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // تحسين الأداء: استخدام Map للوصول السريع
        this.cartMap = new Map();
        this.updateCartMap();
        
        // التحكم في تحديثات الواجهة
        this.isUpdating = false;
        this.updateQueue = [];
        
        // عناصر DOM
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.cartSuggestions = document.getElementById('cart-suggestions');
        
        // إحصائيات السلة
        this.stats = {
            totalItems: 0,
            totalValue: 0,
            averageItemPrice: 0,
            lastUpdated: localStorage.getItem('cart_last_updated') || null
        };
        
        // تعطيل الزر أثناء المعالجة
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        this.updateCartStats();
        this.updateCartUI();
        this.setupAutoSave();
        this.setupSmartFeatures();
        this.setupCartReminders();
    }
    
    setupSmartFeatures() {
        // اقتراحات أثناء التسوق
        this.setupCrossSell();
        
        // تذكير بالمنتجات المنسية
        this.setupAbandonedCartReminder();
        
        // عروض السلة
        this.setupCartOffers();
    }
    
    setupCrossSell() {
        // اقتراح منتجات مكملة بناءً على محتويات السلة
        this.crossSellProducts = [];
        this.updateCrossSell();
    }
    
    updateCrossSell() {
        if (this.cart.length === 0) {
            this.crossSellProducts = [];
            return;
        }
        
        // البحث عن منتجات مكملة
        const lastAdded = this.cart[this.cart.length - 1];
        const complements = this.findComplementaryProducts(lastAdded);
        
        this.crossSellProducts = complements.slice(0, 3); // 3 منتجات كحد أقصى
        
        // عرض الاقتراحات
        this.renderCrossSell();
    }
    
    findComplementaryProducts(product) {
        const productData = window.productsManager?.getProductById(product.id);
        if (!productData) return [];
        
        const complements = {
            'electronics': ['accessories', 'home'],
            'clothing': ['accessories'],
            'cosmetics': ['accessories', 'home'],
            'home': ['electronics', 'accessories'],
            'accessories': ['electronics', 'clothing']
        };
        
        const targetCategories = complements[productData.category] || [];
        let suggestedProducts = [];
        
        targetCategories.forEach(category => {
            const categoryProducts = window.productsManager?.products[category] || [];
            suggestedProducts.push(
                ...categoryProducts.slice(0, 2)
            );
        });
        
        // تصفية المنتجات الموجودة بالفعل في السلة
        return suggestedProducts.filter(p => 
            !this.cart.some(item => item.id === p.id)
        );
    }
    
    renderCrossSell() {
        if (!this.cartSuggestions || this.crossSellProducts.length === 0) {
            if (this.cartSuggestions) {
                this.cartSuggestions.style.display = 'none';
            }
            return;
        }
        
        this.cartSuggestions.style.display = 'block';
        this.cartSuggestions.innerHTML = `
            <h4><i class="fas fa-lightbulb"></i> قد تحتاج أيضاً</h4>
            <div class="suggestions-grid">
                ${this.crossSellProducts.map(product => `
                    <div class="suggestion-item" data-id="${product.id}">
                        <div class="suggestion-image">${product.image}</div>
                        <div class="suggestion-name">${product.name}</div>
                        <div class="suggestion-price">${product.price} ريال</div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        this.cartSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const productId = item.dataset.id;
                this.addToCart(productId);
            });
        });
    }
    
    setupAbandonedCartReminder() {
        // إذا كانت السلة تحتوي على منتجات ولم تتم العملية
        if (this.cart.length > 0) {
            const lastUpdated = localStorage.getItem('cart_last_updated');
            if (lastUpdated) {
                const hoursDiff = (Date.now() - new Date(lastUpdated).getTime()) / (1000 * 60 * 60);
                
                if (hoursDiff > 2 && hoursDiff < 24) {
                    // إظهار التذكير بعد 5 ثواني من تحميل الصفحة
                    setTimeout(() => {
                        this.showCartReminder();
                    }, 5000);
                }
            }
        }
    }
    
    showCartReminder() {
        // منع التكرار
        if (document.querySelector('.cart-reminder')) return;
        
        const reminder = document.createElement('div');
        reminder.className = 'cart-reminder';
        reminder.innerHTML = `
            <div class="reminder-content">
                <i class="fas fa-shopping-cart"></i>
                <div>
                    <strong>لديك منتجات في سلة التسوق</strong>
                    <p>لا تفوت فرصة إتمام الشراء! ${this.getItemCount()} منتج بانتظارك.</p>
                </div>
                <button class="view-cart-btn">عرض السلة</button>
                <button class="dismiss-reminder">&times;</button>
            </div>
        `;
        
        document.body.appendChild(reminder);
        
        // إضافة الأحداث
        reminder.querySelector('.view-cart-btn').addEventListener('click', () => {
            window.uiManager?.openCartSidebar();
            reminder.remove();
        });
        
        reminder.querySelector('.dismiss-reminder').addEventListener('click', () => {
            reminder.remove();
        });
        
        // إخفاء تلقائي بعد 30 ثانية
        setTimeout(() => {
            if (reminder.parentNode) {
                reminder.remove();
            }
        }, 30000);
    }
    
    setupCartOffers() {
        // التحقق من عروض السلة
        this.checkCartOffers();
    }
    
    checkCartOffers() {
        // محاكاة عروض على السلة
        const total = this.getTotal();
        
        // عرض تلقائي إذا تجاوز المجموع 500 ريال
        if (total >= 500 && !localStorage.getItem('cart_offer_shown')) {
            setTimeout(() => {
                this.showCartOffer();
                localStorage.setItem('cart_offer_shown', 'true');
            }, 3000);
        }
    }
    
    showCartOffer() {
        window.uiManager?.showNotification(
            'عرض خاص!',
            'مشترياتك تتجاوز 500 ريال، يمكنك الحصول على توصيل مجاني!',
            'info'
        );
    }
    
    updateCartMap() {
        this.cartMap.clear();
        this.cart.forEach(item => {
            this.cartMap.set(item.id, item);
        });
    }
    
    getCartItem(productId) {
        return this.cartMap.get(productId) || null;
    }
    
    addToCart(productId, category = null) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        try {
            let product = null;
            
            // البحث عن المنتج
            if (!category) {
                const found = window.productsManager?.getProductById(productId);
                if (found) {
                    product = found;
                    category = found.category;
                }
            } else {
                const categoryProducts = window.productsManager?.products[category] || [];
                product = categoryProducts.find(p => p.id === productId);
            }
            
            if (!product) {
                console.error('المنتج غير موجود:', productId);
                return;
            }
            
            // التحقق من المخزون
            if (product.stock <= 0) {
                window.uiManager?.showNotification(
                    'غير متوفر',
                    'هذا المنتج غير متوفر حالياً',
                    'warning'
                );
                return;
            }
            
            const existingItem = this.cartMap.get(productId);
            
            if (existingItem) {
                // التحقق من عدم تجاوز المخزون
                if (existingItem.quantity >= product.stock) {
                    window.uiManager?.showNotification(
                        'الحد الأقصى',
                        'تم الوصول للحد الأقصى من هذا المنتج في المخزون',
                        'warning'
                    );
                    return;
                }
                existingItem.quantity += 1;
            } else {
                const newItem = {
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    quantity: 1,
                    category: category || product.category,
                    image: product.image
                };
                this.cart.push(newItem);
                this.cartMap.set(productId, newItem);
            }
            
            // تحديث الإحصائيات
            this.updateCartStats();
            
            // حفظ السلة
            this.saveCart();
            
            // تحديث الواجهة
            this.updateCartUI();
            this.updateProductUI(productId, category);
            
            // تحديث الاقتراحات
            this.updateCrossSell();
            
            // إظهار الإشعار
            window.uiManager?.showNotification(
                'تمت الإضافة بنجاح', 
                `تم إضافة ${product.name} إلى سلة المشتريات`
            );
            
            // تتبع سلوك المستخدم
            this.trackUserBehavior('add_to_cart', productId);
            
        } catch (error) {
            console.error('خطأ في إضافة المنتج للسلة:', error);
            window.uiManager?.showNotification(
                'خطأ في الإضافة',
                'تعذر إضافة المنتج للسلة',
                'error'
            );
        } finally {
            this.isProcessing = false;
        }
    }
    
    trackUserBehavior(action, data) {
        const behavior = JSON.parse(localStorage.getItem('user_behavior') || '{}');
        
        if (!behavior.cartActions) behavior.cartActions = [];
        
        behavior.cartActions.push({
            action,
            productId: data,
            timestamp: Date.now()
        });
        
        // الاحتفاظ بآخر 100 إجراء فقط
        if (behavior.cartActions.length > 100) {
            behavior.cartActions = behavior.cartActions.slice(-100);
        }
        
        localStorage.setItem('user_behavior', JSON.stringify(behavior));
    }
    
    updateCartItemQuantity(productId, change) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        try {
            const item = this.cartMap.get(productId);
            
            if (item) {
                item.quantity += change;
                
                if (item.quantity <= 0) {
                    this.cart = this.cart.filter(item => item.id !== productId);
                    this.cartMap.delete(productId);
                    window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من سلة المشتريات');
                } else {
                    this.updateCartItemInUI(productId);
                }
                
                this.updateCartStats();
                this.saveCart();
                this.updateCartTotals();
                this.updateCartCount();
                this.updateProductUI(productId);
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    removeFromCart(productId) {
        if (this.isProcessing) return;
        this.isProcessing = true;
        
        try {
            const initialLength = this.cart.length;
            this.cart = this.cart.filter(item => item.id !== productId);
            
            if (this.cart.length < initialLength) {
                this.cartMap.delete(productId);
                this.updateCartStats();
                this.saveCart();
                this.updateCartUI();
                this.updateProductUI(productId);
                window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من سلة المشتريات');
            }
        } finally {
            this.isProcessing = false;
        }
    }
    
    updateCartItemInUI(productId) {
        const cartItem = this.cartMap.get(productId);
        if (!cartItem || !this.cartItemsContainer) return;
        
        // البحث عن العنصر في الواجهة وتحديثه فقط
        const cartItemElement = this.cartItemsContainer.querySelector(`.cart-item[data-id="${productId}"]`);
        if (cartItemElement) {
            const quantityElement = cartItemElement.querySelector('.quantity');
            const totalElement = cartItemElement.querySelector('.cart-item-total');
            
            if (quantityElement) {
                quantityElement.textContent = cartItem.quantity;
                quantityElement.classList.add('updating');
                setTimeout(() => quantityElement.classList.remove('updating'), 300);
            }
            
            if (totalElement) {
                const itemTotal = cartItem.price * cartItem.quantity;
                totalElement.textContent = `${itemTotal.toFixed(2)} ريال`;
                totalElement.classList.add('updating');
                setTimeout(() => totalElement.classList.remove('updating'), 300);
            }
        }
    }
    
    updateProductUI(productId, category = null) {
        const cartItem = this.getCartItem(productId);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        // تحديث واجهة المنتج في الصفحة
        const quantityElement = document.getElementById(`quantity-${productId}`);
        const addButton = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`);
        const quantityControl = document.querySelector(`.quantity-control[data-id="${productId}"]`);
        
        if (quantityElement) {
            quantityElement.textContent = quantity;
            quantityElement.classList.add('updating');
            setTimeout(() => quantityElement.classList.remove('updating'), 300);
        }
        
        if (addButton) {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                }
                
                // تأثير إضافة
                addButton.classList.add('pulse');
                setTimeout(() => addButton.classList.remove('pulse'), 600);
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
        }
    }
    
    updateCartUI() {
        this.renderCart();
        this.updateCartTotals();
        this.updateCartCount();
        this.updateCheckoutButton();
    }
    
    renderCart() {
        if (!this.cartItemsContainer) return;
        
        this.cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>سلة المشتريات فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات بعد. ابدأ بالتسوق الآن!</p>
                </div>
            `;
            return;
        }
        
        this.cart.forEach(item => {
            const categoryName = window.productsManager?.getCategoryName(item.category) || '';
            const itemTotal = item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            cartItem.innerHTML = `
                <div class="cart-item-image">
                    ${item.image}
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.name}</h4>
                    <div class="cart-item-category">
                        <i class="fas fa-tag"></i>
                        ${categoryName}
                    </div>
                    <div class="cart-item-price">${item.price} ريال</div>
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">${itemTotal.toFixed(2)} ريال</div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(cartItem);
        });
        
        // إضافة مستمعي الأحداث لعناصر السلة
        this.addCartEventListeners();
    }
    
    addCartEventListeners() {
        // أزرار زيادة الكمية في السلة
        this.cartItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.updateCartItemQuantity(id, 1);
            });
        });
        
        // أزرار تقليل الكمية في السلة
        this.cartItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.updateCartItemQuantity(id, -1);
            });
        });
        
        // أزرار إزالة المنتج من السلة
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.removeFromCart(id);
            });
        });
    }
    
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // تطبيق خصم الولاء إن وجد
        let loyaltyDiscount = 0;
        if (window.loyaltyManager && window.loyaltyManager.usePointsForOrder) {
            loyaltyDiscount = window.loyaltyManager.calculateDiscountFromPoints();
        }
        
        const total = subtotal - loyaltyDiscount;
        
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
        
        if (this.cartTotal) {
            this.cartTotal.textContent = total.toFixed(2) + ' ريال';
        }
        
        // تحديث عرض خصم الولاء
        this.updateLoyaltyDiscountDisplay(loyaltyDiscount);
    }
    
    updateLoyaltyDiscountDisplay(discount) {
        const discountRow = document.querySelector('.loyalty-discount');
        const discountAmount = document.getElementById('loyalty-discount');
        
        if (discount > 0) {
            if (discountRow) discountRow.style.display = 'flex';
            if (discountAmount) discountAmount.textContent = `-${discount.toFixed(2)} ريال`;
        } else {
            if (discountRow) discountRow.style.display = 'none';
        }
    }
    
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
    }
    
    updateCheckoutButton() {
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    updateCartStats() {
        this.stats.totalItems = this.getItemCount();
        this.stats.totalValue = this.getTotal();
        this.stats.averageItemPrice = this.stats.totalItems > 0 ? 
            this.stats.totalValue / this.stats.totalItems : 0;
        this.stats.lastUpdated = new Date().toISOString();
    }
    
    setupAutoSave() {
        // حفظ تلقائي كل 30 ثانية
        this.autoSaveInterval = setInterval(() => {
            if (this.isCartDirty) {
                this.saveCart();
                this.isCartDirty = false;
            }
        }, 30000);
        
        // حفظ عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            if (this.isCartDirty) {
                this.saveCart();
            }
        });
    }
    
    saveCart() {
        try {
            const cartString = JSON.stringify(this.cart);
            
            // التحقق من حجم البيانات
            if (cartString.length > 5000000) { // 5MB
                console.warn('حجم السلة كبير جداً، سيتم تقليصها');
                this.compressCart();
            }
            
            localStorage.setItem('cart', JSON.stringify(this.cart));
            localStorage.setItem('cart_last_updated', new Date().toISOString());
            localStorage.setItem('cart_stats', JSON.stringify(this.stats));
            
            this.isCartDirty = false;
            
            console.log('💾 تم حفظ السلة:', {
                items: this.cart.length,
                totalItems: this.stats.totalItems,
                totalValue: this.stats.totalValue
            });
            
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
            // استراتيجية بديلة
            this.saveCartFallback();
        }
    }
    
    saveCartFallback() {
        try {
            // محاولة الحفظ في sessionStorage
            sessionStorage.setItem('cart_fallback', JSON.stringify(this.cart));
            
            // تقليل حجم البيانات
            const compressedCart = this.cart.map(item => ({
                id: item.id,
                q: item.quantity
            }));
            
            localStorage.setItem('cart_compressed', JSON.stringify(compressedCart));
            
        } catch (error) {
            console.error('فشل الحفظ الاحتياطي:', error);
        }
    }
    
    compressCart() {
        // تقليل حجم البيانات الزائدة
        this.cart.forEach(item => {
            delete item.image; // إزالة الصور إذا كانت كبيرة
        });
        this.updateCartMap();
    }
    
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    getAllItems() {
        return [...this.cart];
    }
    
    clearCart() {
        this.cart = [];
        this.cartMap.clear();
        this.crossSellProducts = [];
        this.updateCartStats();
        this.saveCart();
        this.updateCartUI();
        this.updateCrossSell();
        
        // إعادة تعيين عرض العرض
        localStorage.removeItem('cart_offer_shown');
    }
    
    // دالة لحفظ السلة كمسودة
    saveCartDraft(name = 'مسودة السلة') {
        const draft = {
            name,
            items: [...this.cart],
            total: this.getTotal(),
            createdAt: new Date().toISOString()
        };
        
        const drafts = JSON.parse(localStorage.getItem('cart_drafts') || '[]');
        drafts.push(draft);
        
        // الاحتفاظ بآخر 10 مسودات فقط
        if (drafts.length > 10) {
            drafts.shift();
        }
        
        localStorage.setItem('cart_drafts', JSON.stringify(drafts));
        
        window.uiManager?.showNotification(
            'تم الحفظ',
            `تم حفظ السلة كـ "${name}"`,
            'success'
        );
        
        return draft;
    }
    
    loadCartDraft(draftIndex = 0) {
        const drafts = JSON.parse(localStorage.getItem('cart_drafts') || '[]');
        if (drafts[draftIndex]) {
            this.cart = drafts[draftIndex].items;
            this.updateCartMap();
            this.updateCartStats();
            this.saveCart();
            this.updateCartUI();
            
            window.uiManager?.showNotification(
                'تم التحميل',
                `تم تحميل "${drafts[draftIndex].name}"`,
                'success'
            );
            
            return true;
        }
        return false;
    }
    
    // تنظيف الذاكرة عند التدمير
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// تهيئة مدير السلة الذكية
window.cartManager = new SmartCartManager();
