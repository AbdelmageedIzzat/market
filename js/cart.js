// إدارة سلة المشتريات - محسّنة

class CartManager {
    constructor() {
        // فحص localStorage قبل الاستخدام
        this.initializeStorage();
        this.cart = this.loadCartSafely();
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        this.cartLastUpdated = localStorage.getItem('cart_last_updated');
        
        // إضافة تحقق من التاريخ (تنظيف السلة بعد 7 أيام)
        this.cleanOldCart();
        
        this.init();
    }
    
    // تهيئة localStorage بشكل آمن
    initializeStorage() {
        try {
            if (!localStorage) {
                console.warn('localStorage غير متوفر، سيتم استخدام sessionStorage');
                return;
            }
            
            // اختبار سعة التخزين
            const testKey = '__storage_test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
        } catch (e) {
            console.error('خطأ في تخزين localStorage:', e);
            window.uiManager?.showNotification('تحذير', 'تعذر حفظ بيانات السلة محلياً', 'warning');
        }
    }
    
    // تحميل السلة بشكل آمن
    loadCartSafely() {
        try {
            const cartData = localStorage.getItem('cart');
            if (!cartData) return [];
            
            const parsed = JSON.parse(cartData);
            
            // تحقق من صحة بيانات السلة
            if (!Array.isArray(parsed)) {
                console.error('بيانات السلة غير صالحة');
                return [];
            }
            
            // تصفية العناصر غير الصالحة
            return parsed.filter(item => this.validateCartItem(item));
            
        } catch (error) {
            console.error('خطأ في تحميل السلة:', error);
            return [];
        }
    }
    
    // التحقق من صحة عنصر السلة
    validateCartItem(item) {
        const requiredFields = ['id', 'name', 'price', 'quantity', 'category'];
        
        // التحقق من وجود الحقول المطلوبة
        for (const field of requiredFields) {
            if (!item.hasOwnProperty(field)) {
                console.warn(`عنصر سلة مفقود الحقل ${field}`, item);
                return false;
            }
        }
        
        // التحقق من أنواع البيانات
        if (typeof item.id !== 'string' || 
            typeof item.name !== 'string' ||
            typeof item.price !== 'number' ||
            typeof item.quantity !== 'number' ||
            typeof item.category !== 'string') {
            console.warn('أنواع بيانات عنصر السلة غير صالحة', item);
            return false;
        }
        
        // التحقق من القيم السلبية
        if (item.price < 0 || item.quantity < 1) {
            console.warn('قيم عنصر السلة غير صالحة', item);
            return false;
        }
        
        // تحديد حد أقصى للكمية (999)
        if (item.quantity > 999) {
            item.quantity = 999;
        }
        
        // تحديد حد أقصى للسعر
        const MAX_PRICE = 1000000; // مليون ريال
        if (item.price > MAX_PRICE) {
            console.warn('سعر المنتج يتجاوز الحد المسموح');
            return false;
        }
        
        // تطهير النصوص من HTML
        item.name = this.sanitizeText(item.name);
        item.category = this.sanitizeText(item.category);
        
        return true;
    }
    
    // تنظيف السلة القديمة (أكثر من 7 أيام)
    cleanOldCart() {
        if (!this.cartLastUpdated) return;
        
        const lastUpdated = new Date(this.cartLastUpdated);
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        if (lastUpdated < sevenDaysAgo && this.cart.length > 0) {
            const shouldClear = confirm('تم تخزين سلة المشتريات منذ أكثر من 7 أيام. هل تريد مسحها؟');
            if (shouldClear) {
                this.clearCart();
                window.uiManager?.showNotification('تم المسح', 'تم تنظيف سلة المشتريات القديمة', 'info');
            }
        }
    }
    
    // تطهير النص من HTML
    sanitizeText(text) {
        if (typeof text !== 'string') return text;
        
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');
    }
    
    init() {
        this.updateCartUI();
        this.setupCartShortcuts();
    }
    
    // إضافة اختصارات لوحة المفاتيح للسلة
    setupCartShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Enter لفتح السلة
            if (e.ctrlKey && e.key === 'Enter' && !e.target.matches('input, textarea')) {
                e.preventDefault();
                window.uiManager?.openCartSidebar();
            }
            
            // Esc لإغلاق السلة
            if (e.key === 'Escape' && document.getElementById('cart-sidebar')?.classList.contains('active')) {
                e.preventDefault();
                window.uiManager?.closeCartSidebar();
            }
        });
    }
    
    // إضافة منتج إلى السلة - محسّنة
    addToCart(productId, category = null) {
        // منع النقر المتكرر
        if (this.isAddingProduct) return;
        this.isAddingProduct = true;
        
        setTimeout(() => {
            this.isAddingProduct = false;
        }, 500);
        
        let product = null;
        
        // البحث عن المنتج
        if (!category) {
            const found = window.productsManager?.getProductById(productId);
            if (found) {
                product = found.product;
                category = found.category;
            }
        } else {
            const categoryProducts = window.productsManager?.products[category] || [];
            product = categoryProducts.find(p => p.id === productId);
        }
        
        if (!product) {
            console.error('المنتج غير موجود:', productId);
            window.uiManager?.showNotification('خطأ', 'المنتج غير موجود', 'error');
            return;
        }
        
        // التحقق من توفر المنتج
        if (product.stock !== undefined && product.stock <= 0) {
            window.uiManager?.showNotification('غير متوفر', 'هذا المنتج غير متوفر حالياً', 'warning');
            return;
        }
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        // التحقق من الحد الأقصى للكمية
        const maxQuantity = product.maxQuantity || 50;
        if (existingItem && existingItem.quantity >= maxQuantity) {
            window.uiManager?.showNotification('حد أقصى', `الحد الأقصى للكمية هو ${maxQuantity}`, 'warning');
            return;
        }
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: this.sanitizeText(product.name),
                price: parseFloat(product.price) || 0,
                quantity: 1,
                category: category || product.category,
                image: product.image,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId, category);
        
        // إضافة تأثير مرئي
        this.showAddToCartAnimation(productId);
        
        window.uiManager?.showNotification('تمت الإضافة بنجاح', 
            `تم إضافة ${product.name} إلى سلة المشتريات`, 
            'success');
    }
    
    // عرض تأثير الإضافة
    showAddToCartAnimation(productId) {
        const productCard = document.querySelector(`[data-id="${productId}"]`);
        if (productCard) {
            productCard.style.transform = 'scale(0.95)';
            setTimeout(() => {
                productCard.style.transform = 'scale(1)';
            }, 300);
        }
    }
    
    // تحديث كمية منتج - محسّنة
    updateCartItemQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            const product = window.productsManager?.getProductById(productId);
            const maxQuantity = product?.maxQuantity || 50;
            
            this.cart[itemIndex].quantity += change;
            
            // التحقق من الحد الأدنى
            if (this.cart[itemIndex].quantity < 1) {
                this.cart[itemIndex].quantity = 1;
                return;
            }
            
            // التحقق من الحد الأقصى
            if (this.cart[itemIndex].quantity > maxQuantity) {
                this.cart[itemIndex].quantity = maxQuantity;
                window.uiManager?.showNotification('حد أقصى', 
                    `الحد الأقصى للكمية هو ${maxQuantity}`, 
                    'warning');
            }
            
            // تحديث وقت التعديل
            this.cart[itemIndex].lastModified = new Date().toISOString();
            
            this.saveCart();
            this.updateCartItemInUI(productId);
            this.updateCartTotals();
            this.updateCartCount();
            
            // تحديث واجهة المنتج
            this.updateProductUI(productId);
        }
    }
    
    // عرض محتويات السلة - محسّنة
    renderCart() {
        if (!this.cartItemsContainer) return;
        
        this.cartItemsContainer.innerHTML = '';
        
        if (this.cart.length === 0) {
            this.cartItemsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-shopping-bag"></i>
                    <h3>سلة المشتريات فارغة</h3>
                    <p>لم تقم بإضافة أي منتجات بعد. ابدأ بالتسوق الآن!</p>
                    <button class="continue-shopping-btn" id="empty-cart-shop">
                        <i class="fas fa-store"></i>
                        ابدأ التسوق
                    </button>
                </div>
            `;
            
            // إضافة مستمع حدث للزر الجديد
            document.getElementById('empty-cart-shop')?.addEventListener('click', () => {
                window.uiManager?.closeCartSidebar();
                window.productsManager?.switchCategory('offers');
            });
            
            return;
        }
        
        // ترتيب المنتجات حسب وقت الإضافة (الأحدث أولاً)
        const sortedCart = [...this.cart].sort((a, b) => {
            const timeA = a.addedAt ? new Date(a.addedAt).getTime() : 0;
            const timeB = b.addedAt ? new Date(b.addedAt).getTime() : 0;
            return timeB - timeA;
        });
        
        sortedCart.forEach(item => {
            const categoryName = window.productsManager?.getCategoryName(item.category) || '';
            const itemTotal = item.price * item.quantity;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = item.id;
            cartItem.innerHTML = `
                <div class="cart-item-image" role="img" aria-label="${item.name}">
                    ${item.image}
                </div>
                <div class="cart-item-info">
                    <h4 class="cart-item-name" title="${item.name}">${item.name}</h4>
                    <div class="cart-item-category">
                        <i class="fas fa-tag"></i>
                        ${categoryName}
                    </div>
                    <div class="cart-item-price">${item.price.toFixed(2)} ريال</div>
                    
                    <!-- إظهار المخزون إذا كان محدوداً -->
                    ${window.productsManager?.getProductById(item.id)?.stock ? 
                        `<div class="cart-item-stock">
                            <i class="fas fa-box"></i>
                            متبقي ${window.productsManager.getProductById(item.id).stock} وحدة
                        </div>` : ''
                    }
                </div>
                <div class="cart-item-actions">
                    <div class="cart-item-quantity">
                        <button class="quantity-btn minus" data-id="${item.id}" 
                                aria-label="تقليل الكمية" ${item.quantity <= 1 ? 'disabled' : ''}>
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity" id="cart-quantity-${item.id}">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" 
                                aria-label="زيادة الكمية">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total" id="cart-total-${item.id}">
                        ${itemTotal.toFixed(2)} ريال
                    </div>
                    <button class="remove-item" data-id="${item.id}" 
                            aria-label="إزالة المنتج">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(cartItem);
        });
        
        // إضافة عنصر التوصية
        if (sortedCart.length > 0) {
            this.addRecommendationItem();
        }
        
        this.addCartEventListeners();
    }
    
    // إضافة منتج موصى به
    addRecommendationItem() {
        // الحصول على منتجات غير موجودة في السلة
        const allProducts = [];
        Object.values(window.productsManager?.products || {}).forEach(category => {
            category.forEach(product => {
                if (!this.cart.find(item => item.id === product.id)) {
                    allProducts.push(product);
                }
            });
        });
        
        if (allProducts.length > 0) {
            const randomProduct = allProducts[Math.floor(Math.random() * allProducts.length)];
            
            const recommendation = document.createElement('div');
            recommendation.className = 'cart-recommendation';
            recommendation.innerHTML = `
                <div class="recommendation-header">
                    <i class="fas fa-lightbulb"></i>
                    <span>قد يعجبك أيضاً</span>
                </div>
                <div class="recommendation-item">
                    <div class="recommendation-image">${randomProduct.image}</div>
                    <div class="recommendation-info">
                        <h5>${randomProduct.name}</h5>
                        <div class="recommendation-price">${randomProduct.price} ريال</div>
                    </div>
                    <button class="add-recommendation" data-id="${randomProduct.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
            
            this.cartItemsContainer.appendChild(recommendation);
            
            // إضافة مستمع حدث للتوصية
            recommendation.querySelector('.add-recommendation').addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.addToCart(id);
            });
        }
    }
    
    // حفظ السلة - محسّنة
    saveCart() {
        try {
            // التحقق من حجم البيانات
            const cartString = JSON.stringify(this.cart);
            if (cartString.length > 500000) { // 500KB كحد أقصى
                console.warn('حجم بيانات السلة كبير جداً');
                this.cart = this.cart.slice(0, 50); // الاحتفاظ بـ 50 منتج فقط
            }
            
            localStorage.setItem('cart', JSON.stringify(this.cart));
            localStorage.setItem('cart_last_updated', new Date().toISOString());
            
            // استخدام sessionStorage كنسخة احتياطية
            sessionStorage.setItem('cart_backup', JSON.stringify(this.cart));
            
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
            
            // استراتيجية بديلة: تخزين في IndexedDB إذا لزم الأمر
            this.saveToIndexedDB();
        }
    }
    
    // حفظ في IndexedDB (إذا كان متاحاً)
    async saveToIndexedDB() {
        if ('indexedDB' in window) {
            try {
                const db = await this.openIndexedDB();
                const tx = db.transaction('cart', 'readwrite');
                const store = tx.objectStore('cart');
                await store.put({ id: 'current', items: this.cart });
                console.log('تم حفظ السلة في IndexedDB');
            } catch (error) {
                console.error('خطأ في حفظ IndexedDB:', error);
            }
        }
    }
    
    // فتح قاعدة بيانات IndexedDB
    openIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('GlobalStoreDB', 1);
            
            request.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains('cart')) {
                    db.createObjectStore('cart', { keyPath: 'id' });
                }
            };
            
            request.onsuccess = (e) => resolve(e.target.result);
            request.onerror = (e) => reject(e.target.error);
        });
    }
    
    // الحصول على ملخص السلة
    getCartSummary() {
        const subtotal = this.getTotal();
        const itemsCount = this.getItemCount();
        
        // احتساب الخصومات إذا وجدت
        const discount = this.calculateDiscount();
        const shipping = this.calculateShipping();
        const total = subtotal - discount + shipping;
        
        return {
            subtotal,
            itemsCount,
            discount,
            shipping,
            total,
            items: this.cart.length
        };
    }
    
    // احتساب الخصومات
    calculateDiscount() {
        let totalDiscount = 0;
        
        this.cart.forEach(item => {
            const product = window.productsManager?.getProductById(item.id);
            if (product && product.discountPrice) {
                const originalPrice = product.oldPrice || product.price;
                const discountPerItem = (originalPrice - product.discountPrice) * item.quantity;
                totalDiscount += discountPerItem;
            }
        });
        
        return totalDiscount;
    }
    
    // احتساب تكاليف الشحن
    calculateShipping() {
        const subtotal = this.getTotal();
        
        // شحن مجاني للمشتريات فوق 500 ريال
        if (subtotal >= 500) {
            return 0;
        }
        
        // شحن ثابت 25 ريال
        return 25;
    }
}
