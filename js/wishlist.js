// نظام المفضلة (Wishlist)

class WishlistManager {
    constructor() {
        this.wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.wishlistMap = new Map(this.wishlist.map(item => [item.id, item]));
        this.wishlistIcon = null;
        this.wishlistCount = null;
        this.init();
    }
    
    init() {
        this.createWishlistIcon();
        this.setupEventListeners();
        this.updateWishlistUI();
        
        // تهيئة أيقونات المفضلة على المنتجات
        this.initProductWishlistButtons();
    }
    
    createWishlistIcon() {
        this.wishlistIcon = document.getElementById('wishlist-icon');
        if (!this.wishlistIcon) {
            this.wishlistIcon = document.createElement('div');
            this.wishlistIcon.id = 'wishlist-icon';
            this.wishlistIcon.className = 'wishlist-icon';
            this.wishlistIcon.innerHTML = `
                <i class="far fa-heart"></i>
                <span class="wishlist-count">${this.wishlist.length}</span>
            `;
            
            const headerActions = document.querySelector('.header-actions');
            if (headerActions) {
                headerActions.prepend(this.wishlistIcon);
            }
        }
        
        this.wishlistCount = this.wishlistIcon.querySelector('.wishlist-count');
    }
    
    setupEventListeners() {
        // حدث فتح نافذة المفضلة
        this.wishlistIcon.addEventListener('click', () => {
            this.showWishlistModal();
        });
        
        // حدث زر المفضلة في الفوتر
        document.getElementById('wishlist-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showWishlistModal();
        });
        
        // إغلاق النافذة عند النقر خارجها
        document.addEventListener('click', (e) => {
            const wishlistModal = document.getElementById('wishlist-modal');
            if (wishlistModal && 
                !wishlistModal.contains(e.target) && 
                !this.wishlistIcon.contains(e.target)) {
                this.closeWishlistModal();
            }
        });
    }
    
    initProductWishlistButtons() {
        // إضافة مستمعي الأحداث للمنتجات عند تحميلها
        const observer = new MutationObserver(() => {
            this.updateAllProductWishlistButtons();
        });
        
        observer.observe(document.body, { childList: true, subtree: true });
        
        // التهيئة الأولية
        this.updateAllProductWishlistButtons();
    }
    
    updateAllProductWishlistButtons() {
        document.querySelectorAll('.product-card, .offer-card').forEach(card => {
            const productId = card.querySelector('.add-to-cart-btn')?.dataset.id;
            if (productId) {
                this.addWishlistButtonToProduct(card, productId);
            }
        });
    }
    
    addWishlistButtonToProduct(card, productId) {
        let wishlistBtn = card.querySelector('.wishlist-btn');
        
        if (!wishlistBtn) {
            wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'wishlist-btn';
            wishlistBtn.dataset.id = productId;
            wishlistBtn.innerHTML = '<i class="far fa-heart"></i>';
            
            // وضع الزر في المكان المناسب
            const productActions = card.querySelector('.product-actions, .offer-actions');
            if (productActions) {
                productActions.appendChild(wishlistBtn);
            } else {
                card.style.position = 'relative';
                wishlistBtn.style.position = 'absolute';
                wishlistBtn.style.top = '15px';
                wishlistBtn.style.left = '15px';
                card.appendChild(wishlistBtn);
            }
            
            wishlistBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleProduct(productId);
            });
        }
        
        this.updateWishlistButton(wishlistBtn, productId);
    }
    
    updateWishlistButton(button, productId) {
        const isInWishlist = this.wishlistMap.has(productId);
        const icon = button.querySelector('i');
        
        if (isInWishlist) {
            button.classList.add('active');
            icon.className = 'fas fa-heart';
            icon.style.color = 'var(--secondary)';
        } else {
            button.classList.remove('active');
            icon.className = 'far fa-heart';
            icon.style.color = '';
        }
    }
    
    toggleProduct(productId) {
        const product = window.productsManager?.getProductById(productId);
        if (!product) return;
        
        const isInWishlist = this.wishlistMap.has(productId);
        
        if (isInWishlist) {
            this.removeFromWishlist(productId);
        } else {
            this.addToWishlist(productId, product);
        }
        
        // تحديث جميع أزرار المفضلة لهذا المنتج
        this.updateProductWishlistButtons(productId);
    }
    
    addToWishlist(productId, product) {
        if (this.wishlistMap.has(productId)) return;
        
        const wishlistItem = {
            id: productId,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            addedAt: new Date().toISOString()
        };
        
        this.wishlist.push(wishlistItem);
        this.wishlistMap.set(productId, wishlistItem);
        this.saveWishlist();
        
        // تحديث الواجهة
        this.updateWishlistUI();
        
        // إظهار إشعار
        window.uiManager?.showNotification(
            'تمت الإضافة للمفضلة',
            `${product.name} تمت إضافته لقائمة المفضلة`,
            'success'
        );
        
        // تأثير
        this.showWishlistAnimation(productId);
    }
    
    removeFromWishlist(productId) {
        if (!this.wishlistMap.has(productId)) return;
        
        const index = this.wishlist.findIndex(item => item.id === productId);
        if (index > -1) {
            this.wishlist.splice(index, 1);
            this.wishlistMap.delete(productId);
            this.saveWishlist();
            
            this.updateWishlistUI();
            
            window.uiManager?.showNotification(
                'تمت الإزالة من المفضلة',
                'تمت إزالة المنتج من قائمة المفضلة',
                'info'
            );
        }
    }
    
    showWishlistAnimation(productId) {
        // تأثير قلب على زر المفضلة
        const buttons = document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`);
        buttons.forEach(btn => {
            btn.classList.add('heartbeat');
            setTimeout(() => btn.classList.remove('heartbeat'), 1000);
        });
    }
    
    updateWishlistUI() {
        if (this.wishlistCount) {
            this.wishlistCount.textContent = this.wishlist.length;
        }
        
        // تحديث أيقونة الهيدر
        if (this.wishlist.length > 0) {
            this.wishlistIcon.classList.add('active');
        } else {
            this.wishlistIcon.classList.remove('active');
        }
    }
    
    updateProductWishlistButtons(productId) {
        document.querySelectorAll(`.wishlist-btn[data-id="${productId}"]`).forEach(btn => {
            this.updateWishlistButton(btn, productId);
        });
    }
    
    saveWishlist() {
        try {
            localStorage.setItem('wishlist', JSON.stringify(this.wishlist));
            localStorage.setItem('wishlist_updated', new Date().toISOString());
        } catch (error) {
            console.error('خطأ في حفظ المفضلة:', error);
        }
    }
    
    showWishlistModal() {
        // إنشاء النافذة إذا لم تكن موجودة
        let modal = document.getElementById('wishlist-modal');
        
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'wishlist-modal';
            modal.className = 'wishlist-modal';
            modal.style.display = 'none';
            document.body.appendChild(modal);
        }
        
        modal.style.display = 'flex';
        this.renderWishlistModal();
    }
    
    renderWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (!modal) return;
        
        modal.innerHTML = `
            <div class="wishlist-content">
                <div class="wishlist-header">
                    <h3><i class="fas fa-heart"></i> قائمة المفضلة</h3>
                    <button class="close-wishlist">&times;</button>
                </div>
                
                <div class="wishlist-body">
                    ${this.wishlist.length === 0 ? `
                        <div class="wishlist-empty">
                            <i class="far fa-heart"></i>
                            <h4>قائمة المفضلة فارغة</h4>
                            <p>أضف المنتجات التي تعجبك إلى قائمة المفضلة للرجوع إليها لاحقاً</p>
                            <button class="browse-products" id="browse-products-btn">
                                تصفح المنتجات
                            </button>
                        </div>
                    ` : `
                        <div class="wishlist-items">
                            ${this.wishlist.map(item => `
                                <div class="wishlist-item" data-id="${item.id}">
                                    <div class="wishlist-item-image">
                                        ${item.image}
                                    </div>
                                    <div class="wishlist-item-info">
                                        <h4 class="wishlist-item-name">${item.name}</h4>
                                        <div class="wishlist-item-category">
                                            <i class="fas fa-tag"></i>
                                            ${window.productsManager?.getCategoryName(item.category) || ''}
                                        </div>
                                        <div class="wishlist-item-price">${item.price} ريال</div>
                                    </div>
                                    <div class="wishlist-item-actions">
                                        <button class="add-to-cart-from-wishlist" data-id="${item.id}">
                                            <i class="fas fa-cart-plus"></i>
                                        </button>
                                        <button class="remove-from-wishlist" data-id="${item.id}">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
                
                ${this.wishlist.length > 0 ? `
                    <div class="wishlist-footer">
                        <button class="clear-wishlist" id="clear-wishlist-btn">
                            <i class="fas fa-trash"></i>
                            إفراغ المفضلة
                        </button>
                        <button class="close-wishlist-btn">
                            إغلاق
                        </button>
                    </div>
                ` : ''}
            </div>
        `;
        
        // إضافة الأحداث
        this.setupWishlistModalEvents();
    }
    
    setupWishlistModalEvents() {
        // زر الإغلاق
        document.querySelector('.close-wishlist')?.addEventListener('click', () => {
            this.closeWishlistModal();
        });
        
        document.querySelector('.close-wishlist-btn')?.addEventListener('click', () => {
            this.closeWishlistModal();
        });
        
        // زر تصفح المنتجات
        document.getElementById('browse-products-btn')?.addEventListener('click', () => {
            this.closeWishlistModal();
            window.productsManager?.switchCategory('offers');
        });
        
        // زر إفراغ المفضلة
        document.getElementById('clear-wishlist-btn')?.addEventListener('click', () => {
            if (confirm('هل أنت متأكد من إفراغ قائمة المفضلة؟')) {
                this.clearWishlist();
            }
        });
        
        // إضافة للسلة من المفضلة
        document.querySelectorAll('.add-to-cart-from-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                window.cartManager?.addToCart(productId);
                e.stopPropagation();
            });
        });
        
        // إزالة من المفضلة
        document.querySelectorAll('.remove-from-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                this.removeFromWishlist(productId);
                e.stopPropagation();
            });
        });
        
        // النقر على عنصر المفضلة
        document.querySelectorAll('.wishlist-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.wishlist-item-actions')) {
                    const productId = item.dataset.id;
                    this.closeWishlistModal();
                    
                    // الانتقال للفئة المناسبة
                    const product = this.wishlistMap.get(productId);
                    if (product && product.category) {
                        window.productsManager?.switchCategory(product.category);
                    }
                }
            });
        });
    }
    
    closeWishlistModal() {
        const modal = document.getElementById('wishlist-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }
    
    clearWishlist() {
        this.wishlist = [];
        this.wishlistMap.clear();
        this.saveWishlist();
        this.updateWishlistUI();
        this.updateAllProductWishlistButtons();
        this.closeWishlistModal();
        
        window.uiManager?.showNotification(
            'تم الإفراغ',
            'تم إفراغ قائمة المفضلة',
            'info'
        );
    }
    
    getWishlistItems() {
        return [...this.wishlist];
    }
    
    isInWishlist(productId) {
        return this.wishlistMap.has(productId);
    }
    
    // دالة لتصدير المفضلة
    exportWishlist() {
        const data = {
            wishlist: this.wishlist,
            exportedAt: new Date().toISOString(),
            totalItems: this.wishlist.length,
            totalValue: this.wishlist.reduce((sum, item) => sum + item.price, 0)
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `wishlist-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // دالة لاستيراد المفضلة
    importWishlist(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.wishlist && Array.isArray(data.wishlist)) {
                    // دمج مع المفضلة الحالية
                    data.wishlist.forEach(item => {
                        if (!this.wishlistMap.has(item.id)) {
                            this.wishlist.push(item);
                            this.wishlistMap.set(item.id, item);
                        }
                    });
                    
                    this.saveWishlist();
                    this.updateWishlistUI();
                    this.updateAllProductWishlistButtons();
                    
                    window.uiManager?.showNotification(
                        'تم الاستيراد',
                        `تم استيراد ${data.wishlist.length} منتج للمفضلة`,
                        'success'
                    );
                }
            } catch (error) {
                console.error('خطأ في استيراد المفضلة:', error);
                window.uiManager?.showNotification(
                    'خطأ في الاستيراد',
                    'تعذر استيراد ملف المفضلة',
                    'error'
                );
            }
        };
        
        reader.readAsText(file);
    }
}

// تهيئة مدير المفضلة
window.wishlistManager = new WishlistManager();
