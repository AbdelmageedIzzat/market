// إدارة سلة المشتريات

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // تحسين الأداء: استخدام Map للوصول السريع
        this.cartMap = new Map();
        this.updateCartMap();
        
        // التحكم في تحديثات الواجهة
        this.isUpdating = false;
        this.updateQueue = [];
        
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        
        // حفظ تلقائي كل 30 ثانية
        this.autoSaveInterval = setInterval(() => {
            if (this.isCartDirty) {
                this.saveCart();
                this.isCartDirty = false;
            }
        }, 30000);
        
        this.init();
    }
    
    init() {
        this.updateCartUI();
    }
    
    // تحديث خريطة السلة للوصول السريع
    updateCartMap() {
        this.cartMap.clear();
        this.cart.forEach(item => {
            this.cartMap.set(item.id, item);
        });
    }
    
    // الحصول على عنصر من السلة (محسن)
    getCartItem(productId) {
        return this.cartMap.get(productId) || null;
    }
    
    // إضافة منتج إلى السلة
    addToCart(productId, category = null) {
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
        
        const existingItem = this.cartMap.get(productId);
        
        if (existingItem) {
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
        
        this.isCartDirty = true;
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId, category);
        window.uiManager?.showNotification('تمت الإضافة بنجاح', `تم إضافة ${product.name} إلى سلة المشتريات`);
    }
    
    // تحديث كمية منتج في السلة
    updateCartItemQuantity(productId, change) {
        const item = this.cartMap.get(productId);
        
        if (item) {
            item.quantity += change;
            
            if (item.quantity <= 0) {
                this.cart = this.cart.filter(item => item.id !== productId);
                this.cartMap.delete(productId);
                window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من سلة المشتريات');
            } else {
                // تحديث العنصر في السلة دون إغلاقها
                this.updateCartItemInUI(productId);
            }
            
            this.isCartDirty = true;
            this.saveCart();
            this.updateCartTotals();
            this.updateCartCount();
            
            // تحديث واجهة المنتج
            this.updateProductUI(productId);
        }
    }
    
    // إزالة منتج من السلة
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.cartMap.delete(productId);
            this.isCartDirty = true;
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
            window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من سلة المشتريات');
        }
    }
    
    // تحديث عنصر في السلة دون إعادة رسم الكل
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
            }
            
            if (totalElement) {
                const itemTotal = cartItem.price * cartItem.quantity;
                totalElement.textContent = `${itemTotal.toFixed(2)} ريال`;
            }
        }
    }
    
    // تحديث واجهة المنتج
    updateProductUI(productId, category = null) {
        const cartItem = this.getCartItem(productId);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        // تحديث واجهة المنتج في الصفحة
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
        }
    }
    
    // تحديث واجهة السلة
    updateCartUI() {
        this.renderCart();
        this.updateCartTotals();
        this.updateCartCount();
        this.updateCheckoutButton();
    }
    
    // عرض محتويات السلة
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
    
    // إضافة مستمعي الأحداث لعناصر السلة
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
    
    // تحديث إجماليات السلة
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
        
        if (this.cartTotal) {
            this.cartTotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
    }
    
    // تحديث عدد العناصر في السلة
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
    }
    
    // تحديث حالة زر إتمام الطلب
    updateCheckoutButton() {
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    // حفظ السلة في localStorage (محسن)
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
            this.isCartDirty = false;
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
            // استراتيجية بديلة
            sessionStorage.setItem('cart_fallback', JSON.stringify(this.cart));
        }
    }
    
    // دالة ضغط البيانات إذا لزم الأمر
    compressCart() {
        // تقليل حجم البيانات الزائدة
        this.cart.forEach(item => {
            delete item.image; // إزالة الصور إذا كانت كبيرة
        });
        this.updateCartMap();
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
        this.cartMap.clear();
        this.isCartDirty = true;
        this.saveCart();
        this.updateCartUI();
    }
    
    // الحصول على إجمالي السلة
    getTotal() {
        return this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }
    
    // الحصول على عدد المنتجات
    getItemCount() {
        return this.cart.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    // الحصول على جميع المنتجات
    getAllItems() {
        return [...this.cart];
    }
    
    // تنظيف الذاكرة عند التدمير
    destroy() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }
    }
}

// تهيئة مدير السلة
window.cartManager = new CartManager();
