// إدارة سلة المشتريات

class CartManager {
    constructor() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cartItemsContainer = document.getElementById('cart-items');
        this.cartSubtotal = document.getElementById('cart-subtotal');
        this.cartTotal = document.getElementById('cart-total');
        this.cartCount = document.getElementById('cart-count');
        this.checkoutBtn = document.getElementById('checkout-btn');
        
        // تنظيف أي منتجات بكمية 0 عند التهيئة
        this.cleanZeroQuantityItems();
        this.init();
    }
    
    init() {
        this.updateCartUI();
    }
    
    // تنظيف المنتجات بكمية 0
    cleanZeroQuantityItems() {
        const initialLength = this.cart.length;
        this.cart = this.cart.filter(item => item.quantity > 0);
        
        if (this.cart.length < initialLength) {
            this.saveCart();
            console.log('تم تنظيف المنتجات بكمية 0 من السلة');
        }
    }
    
    // الحصول على عنصر من السلة
    getCartItem(productId) {
        return this.cart.find(item => item.id === productId) || null;
    }
    
    // إضافة منتج إلى السلة
    addToCart(productId, category = null) {
        let product = null;
        
        // البحث عن المنتج
        if (!category) {
            const found = window.productsManager?.getProductById(productId);
            if (found) {
                product = found;
                category = product.category;
            }
        } else {
            const categoryProducts = window.productsManager?.products[category] || [];
            product = categoryProducts.find(p => p.id === productId);
        }
        
        if (!product) {
            console.error('المنتج غير موجود:', productId);
            return;
        }
        
        const existingItem = this.cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                category: category || product.category,
                image: product.image
            });
        }
        
        this.saveCart();
        this.updateCartUI();
        this.updateProductUI(productId, category);
        window.uiManager?.showNotification('تمت الإضافة بنجاح', `تم إضافة ${product.name} إلى سلة المشتريات`);
    }
    
    // تحديث كمية منتج في السلة
    updateCartItemQuantity(productId, change) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            this.cart[itemIndex].quantity += change;
            
            // إذا أصبحت الكمية 0 أو أقل، احذف المنتج تماماً
            if (this.cart[itemIndex].quantity <= 0) {
                // حفظ اسم المنتج للإشعار
                const productName = this.cart[itemIndex].name;
                
                // إزالة المنتج من المصفوفة
                this.cart.splice(itemIndex, 1);
                
                // إزالة العنصر من واجهة السلة
                this.removeCartItemFromUI(productId);
                
                // إشعار للمستخدم
                window.uiManager?.showNotification('تمت الإزالة', `تمت إزالة ${productName} من سلة المشتريات`);
                
                // إذا أصبحت السلة فارغة، أعد رسمها بالكامل
                if (this.cart.length === 0) {
                    setTimeout(() => {
                        this.renderCart();
                        this.updateCartTotals();
                        this.updateCartCount();
                        this.updateCheckoutButton();
                    }, 300);
                }
            } else {
                // تحديث العنصر في السلة فقط
                this.updateCartItemInUI(productId);
            }
            
            this.saveCart();
            
            // تحديث الإجماليات إذا لم يتم إعادة الرسم الكامل
            if (this.cart.length > 0) {
                this.updateCartTotals();
                this.updateCartCount();
                this.updateCheckoutButton();
            }
            
            // تحديث واجهة المنتج في المتجر
            this.updateProductUI(productId);
        }
    }
    
    // إزالة منتج من السلة
    removeFromCart(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        
        if (itemIndex !== -1) {
            // حفظ اسم المنتج للإشعار
            const productName = this.cart[itemIndex].name;
            
            // إزالة المنتج من المصفوفة
            this.cart.splice(itemIndex, 1);
            
            // إزالة العنصر من واجهة السلة
            this.removeCartItemFromUI(productId);
            
            // حفظ التغييرات
            this.saveCart();
            
            // إذا أصبحت السلة فارغة، أعد رسمها
            if (this.cart.length === 0) {
                setTimeout(() => {
                    this.renderCart();
                    this.updateCartTotals();
                    this.updateCartCount();
                    this.updateCheckoutButton();
                }, 300);
            } else {
                // تحديث الإجماليات فقط
                this.updateCartTotals();
                this.updateCartCount();
                this.updateCheckoutButton();
            }
            
            // تحديث واجهة المنتج في المتجر
            this.updateProductUI(productId);
            
            // إشعار للمستخدم
            window.uiManager?.showNotification('تمت الإزالة', `تمت إزالة ${productName} من سلة المشتريات`);
        }
    }
    
    // إزالة العنصر من واجهة السلة مع تأثير
    removeCartItemFromUI(productId) {
        const cartItemElement = this.cartItemsContainer?.querySelector(`.cart-item[data-id="${productId}"]`);
        
        if (cartItemElement) {
            // إضافة تأثير اختفاء
            cartItemElement.classList.add('removing');
            
            // إزالة العنصر بعد انتهاء التأثير
            setTimeout(() => {
                if (cartItemElement.parentNode) {
                    cartItemElement.remove();
                }
            }, 300);
        }
    }
    
    // تحديث عنصر في واجهة السلة
    updateCartItemInUI(productId) {
        const cartItem = this.cart.find(item => item.id === productId);
        if (!cartItem || !this.cartItemsContainer) return;
        
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
            
            // إضافة تأثير تحديث
            cartItemElement.classList.add('updating');
            setTimeout(() => {
                cartItemElement.classList.remove('updating');
            }, 300);
        }
    }
    
    // تحديث واجهة المنتج في المتجر
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
            
            // إضافة تأثير
            window.uiManager?.addToCartAnimation(addButton);
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
                        <button class="quantity-btn minus" data-id="${item.id}" title="تقليل الكمية">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="quantity-btn plus" data-id="${item.id}" title="زيادة الكمية">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <div class="cart-item-total">${itemTotal.toFixed(2)} ريال</div>
                    <button class="remove-item" data-id="${item.id}" title="إزالة المنتج">
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
        this.cartItemsContainer?.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.updateCartItemQuantity(id, 1);
            });
        });
        
        // أزرار تقليل الكمية في السلة
        this.cartItemsContainer?.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.dataset.id;
                this.updateCartItemQuantity(id, -1);
            });
        });
        
        // أزرار إزالة المنتج من السلة
        this.cartItemsContainer?.querySelectorAll('.remove-item').forEach(btn => {
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
    
    // حفظ السلة في localStorage
    saveCart() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.cart));
            localStorage.setItem('cart_last_updated', new Date().toISOString());
        } catch (error) {
            console.error('خطأ في حفظ السلة:', error);
            // استراتيجية بديلة
            sessionStorage.setItem('cart_fallback', JSON.stringify(this.cart));
        }
    }
    
    // إفراغ السلة
    clearCart() {
        this.cart = [];
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
}

// تهيئة مدير السلة
window.cartManager = new CartManager();
