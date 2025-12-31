// إدارة سلة المشتريات - نسخة مختصرة

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        
        console.log('CartManager: تهيئة السلة، عدد المنتجات:', this.cart.length);
        this.init();
    }
    
    init() {
        this.updateCartUI();
        console.log('CartManager: تم التهيئة');
    }
    
    // إضافة منتج إلى السلة
    addToCart(productId, category = null) {
        console.log('محاولة إضافة منتج:', productId, 'فئة:', category);
        
        // البحث عن المنتج
        let product = null;
        let foundCategory = null;
        
        // البحث في جميع الفئات
        for (const [cat, products] of Object.entries(window.productsManager?.products || {})) {
            const found = products.find(p => p.id === productId);
            if (found) {
                product = found;
                foundCategory = cat;
                console.log('تم العثور على المنتج:', product.name);
                break;
            }
        }
        
        if (!product) {
            console.error('المنتج غير موجود:', productId);
            window.uiManager?.showNotification('خطأ', 'المنتج غير موجود', 'error');
            return;
        }
        
        // التحقق من المنتج في السلة
        const existingItemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (existingItemIndex !== -1) {
            this.cart[existingItemIndex].quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: foundCategory || category,
                image: product.image || '📦'
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId);
        
        window.uiManager?.showNotification('تمت الإضافة', 
            `تم إضافة ${product.name} إلى السلة`, 'success');
        
        if (window.uiManager) {
            window.uiManager.pulseCartIcon();
        }
        
        // إبقاء السلة مفتوحة
        this.keepCartOpen();
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
        if (!this.cartItemsContainer) {
            console.error('عنصر cart-items غير موجود');
            return;
        }
        
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
        
        let html = '';
        
        this.cart.forEach(item => {
            const categoryName = window.productsManager?.getCategoryName(item.category) || item.category;
            const itemTotal = item.price * item.quantity;
            
            html += `
                <div class="cart-item" data-id="${item.id}">
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
                </div>
            `;
        });
        
        this.cartItemsContainer.innerHTML = html;
        this.addCartEventListeners();
    }
    
    // إضافة مستمعي الأحداث
    addCartEventListeners() {
        // أزرار الزيادة
        this.cartItemsContainer.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateCartItemQuantity(id, 1);
            });
        });
        
        // أزرار النقصان
        this.cartItemsContainer.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.updateCartItemQuantity(id, -1);
            });
        });
        
        // أزرار الإزالة
        this.cartItemsContainer.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = e.target.closest('button').dataset.id;
                this.removeFromCart(id);
            });
        });
    }
    
    // تحديث كمية المنتج
    updateCartItemQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;
            
            if (this.cart[itemIndex].quantity <= 0) {
                this.cart.splice(itemIndex, 1);
                window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
            }
            
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
            
            // إبقاء السلة مفتوحة
            this.keepCartOpen();
        }
    }
    
    // إزالة منتج من السلة
    removeFromCart(productId) {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.id !== productId);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            this.updateCartUI();
            this.updateProductUI(productId);
            window.uiManager?.showNotification('تمت الإزالة', 'تمت إزالة المنتج من السلة');
            
            // إبقاء السلة مفتوحة
            this.keepCartOpen();
        }
    }
    
    // إبقاء السلة مفتوحة عند التعديل
    keepCartOpen() {
        if (window.uiManager) {
            window.uiManager.openCartSidebar();
        }
    }
    
    // تحديث واجهة المنتج
    updateProductUI(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        const quantity = cartItem ? cartItem.quantity : 0;
        
        // تحديث الكمية
        const quantityElement = document.getElementById(`quantity-${productId}`);
        if (quantityElement) {
            quantityElement.textContent = quantity;
        }
        
        // تحديث زر الإضافة
        const addButtons = document.querySelectorAll(`.add-to-cart-btn[data-id="${productId}"]`);
        addButtons.forEach(addButton => {
            if (quantity > 0) {
                addButton.classList.add('added');
                addButton.innerHTML = '<i class="fas fa-check"></i> مضاف';
                
                const quantityControl = addButton.closest('.product-actions')?.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'flex';
                }
            } else {
                addButton.classList.remove('added');
                addButton.innerHTML = '<i class="fas fa-shopping-cart"></i> أضف للسلة';
                
                const quantityControl = addButton.closest('.product-actions')?.querySelector('.quantity-control');
                if (quantityControl) {
                    quantityControl.style.display = 'none';
                }
            }
        });
    }
    
    // تحديث الإجماليات
    updateCartTotals() {
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        if (this.cartSubtotal) {
            this.cartSubtotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
        
        if (this.cartTotal) {
            this.cartTotal.textContent = subtotal.toFixed(2) + ' ريال';
        }
    }
    
    // تحديث العداد
    updateCartCount() {
        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        
        if (this.cartCount) {
            this.cartCount.textContent = totalItems;
        }
    }
    
    // تحديث زر الدفع
    updateCheckoutButton() {
        if (this.checkoutBtn) {
            this.checkoutBtn.disabled = this.cart.length === 0;
        }
    }
    
    // حفظ السلة
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
        }
    }
    
    // الحصول على منتج من السلة
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId) || null;
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
    }
    
    // الحصول على الإجمالي
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
}

// تهيئة مدير السلة
window.cartManager = new CartManager();
// إضافة هذا الكود في نهاية الدالة init() في cart.js
init() {
    this.updateCartUI();
    console.log('CartManager: تم التهيئة');
    
    // إضافة مستمع حدث يدوي لفتح السلة (كدعم إضافي)
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', () => {
            console.log('CartManager: تم النقر على السلة من cart.js');
            if (window.uiManager) {
                window.uiManager.openCartSidebar();
            }
        });
    }
}
