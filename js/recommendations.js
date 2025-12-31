// نظام التوصيات الذكية

class RecommendationEngine {
    constructor() {
        this.userBehavior = this.loadUserBehavior();
        this.recommendations = [];
        this.section = null;
        this.init();
    }
    
    init() {
        this.createRecommendationsSection();
        this.setupBehaviorTracking();
        this.generateRecommendations();
        this.setupRefreshInterval();
    }
    
    loadUserBehavior() {
        try {
            return JSON.parse(localStorage.getItem('user_behavior')) || {
                viewed: [],
                purchased: [],
                searched: [],
                addedToCart: [],
                wishlist: [],
                lastUpdated: new Date().toISOString()
            };
        } catch (error) {
            console.error('خطأ في تحميل سلوك المستخدم:', error);
            return this.getDefaultBehavior();
        }
    }
    
    getDefaultBehavior() {
        return {
            viewed: [],
            purchased: [],
            searched: [],
            addedToCart: [],
            wishlist: [],
            lastUpdated: new Date().toISOString()
        };
    }
    
    saveUserBehavior() {
        try {
            this.userBehavior.lastUpdated = new Date().toISOString();
            localStorage.setItem('user_behavior', JSON.stringify(this.userBehavior));
        } catch (error) {
            console.error('خطأ في حفظ سلوك المستخدم:', error);
        }
    }
    
    createRecommendationsSection() {
        // البحث عن قسم التوصيات أو إنشائه
        this.section = document.getElementById('recommendations-section');
        if (!this.section) {
            this.section = document.createElement('section');
            this.section.id = 'recommendations-section';
            this.section.className = 'recommendations-section';
            
            // إضافة بعد أقسام الفئات
            const mainContent = document.querySelector('.main-content');
            if (mainContent) {
                mainContent.appendChild(this.section);
            }
        }
    }
    
    setupBehaviorTracking() {
        // تتبع مشاهدات المنتجات
        this.trackProductViews();
        
        // تتبع إضافات السلة
        this.trackCartAdditions();
        
        // تتبع عمليات الشراء
        this.trackPurchases();
        
        // تتبع البحث
        this.trackSearch();
        
        // تتبع المفضلة
        this.trackWishlist();
    }
    
    trackProductViews() {
        // مراقبة النقر على المنتجات
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card, .offer-card');
            if (productCard) {
                const addToCartBtn = productCard.querySelector('.add-to-cart-btn');
                if (addToCartBtn) {
                    const productId = addToCartBtn.dataset.id;
                    this.recordProductView(productId);
                }
            }
        });
    }
    
    recordProductView(productId) {
        // تسجيل مشاهدة المنتج
        const existingView = this.userBehavior.viewed.find(v => v.productId === productId);
        
        if (existingView) {
            existingView.timestamp = Date.now();
            existingView.count = (existingView.count || 1) + 1;
        } else {
            this.userBehavior.viewed.push({
                productId,
                timestamp: Date.now(),
                count: 1
            });
        }
        
        // الاحتفاظ بآخر 50 مشاهدة فقط
        if (this.userBehavior.viewed.length > 50) {
            this.userBehavior.viewed = this.userBehavior.viewed.slice(-50);
        }
        
        this.saveUserBehavior();
    }
    
    trackCartAdditions() {
        // مراقبة إضافة المنتجات للسلة
        const originalAddToCart = window.cartManager?.addToCart;
        if (originalAddToCart) {
            window.cartManager.addToCart = (...args) => {
                const result = originalAddToCart.apply(window.cartManager, args);
                const productId = args[0];
                this.recordCartAddition(productId);
                return result;
            };
        }
    }
    
    recordCartAddition(productId) {
        this.userBehavior.addedToCart.push({
            productId,
            timestamp: Date.now()
        });
        
        if (this.userBehavior.addedToCart.length > 100) {
            this.userBehavior.addedToCart = this.userBehavior.addedToCart.slice(-100);
        }
        
        this.saveUserBehavior();
    }
    
    trackPurchases() {
        // مراقبة عمليات الشراء
        const originalSubmitOrder = window.checkoutManager?.submitOrderForm;
        if (originalSubmitOrder) {
            window.checkoutManager.submitOrderForm = async (...args) => {
                const result = await originalSubmitOrder.apply(window.checkoutManager, args);
                
                // تسجيل المنتجات المشتراة
                const cartItems = window.cartManager?.getAllItems() || [];
                cartItems.forEach(item => {
                    this.recordPurchase(item.id, item.quantity);
                });
                
                return result;
            };
        }
    }
    
    recordPurchase(productId, quantity) {
        this.userBehavior.purchased.push({
            productId,
            quantity,
            timestamp: Date.now()
        });
        
        if (this.userBehavior.purchased.length > 50) {
            this.userBehavior.purchased = this.userBehavior.purchased.slice(-50);
        }
        
        this.saveUserBehavior();
    }
    
    trackSearch() {
        // مراقبة عمليات البحث
        const searchInput = document.getElementById('global-search') || 
                           document.getElementById('category-search');
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                const term = e.target.value.trim();
                if (term.length >= 2) {
                    this.recordSearch(term);
                }
            });
        }
    }
    
    recordSearch(term) {
        const existingSearch = this.userBehavior.searched.find(s => s.term === term);
        
        if (existingSearch) {
            existingSearch.timestamp = Date.now();
            existingSearch.count = (existingSearch.count || 1) + 1;
        } else {
            this.userBehavior.searched.push({
                term,
                timestamp: Date.now(),
                count: 1
            });
        }
        
        if (this.userBehavior.searched.length > 30) {
            this.userBehavior.searched = this.userBehavior.searched.slice(-30);
        }
        
        this.saveUserBehavior();
    }
    
    trackWishlist() {
        // مراقبة المفضلة
        if (window.wishlistManager) {
            const originalToggle = window.wishlistManager.toggleProduct;
            window.wishlistManager.toggleProduct = (...args) => {
                const result = originalToggle.apply(window.wishlistManager, args);
                const productId = args[0];
                
                if (window.wishlistManager.isInWishlist(productId)) {
                    this.recordWishlistAddition(productId);
                }
                
                return result;
            };
        }
    }
    
    recordWishlistAddition(productId) {
        this.userBehavior.wishlist.push({
            productId,
            timestamp: Date.now()
        });
        
        if (this.userBehavior.wishlist.length > 50) {
            this.userBehavior.wishlist = this.userBehavior.wishlist.slice(-50);
        }
        
        this.saveUserBehavior();
    }
    
    generateRecommendations() {
        const recommendations = new Set();
        
        // 1. توصيات بناءً على المشتريات السابقة
        const purchaseRecommendations = this.getPurchaseBasedRecommendations();
        purchaseRecommendations.forEach(rec => recommendations.add(rec.id));
        
        // 2. توصيات بناءً على المشاهدات
        const viewRecommendations = this.getViewBasedRecommendations();
        viewRecommendations.forEach(rec => recommendations.add(rec.id));
        
        // 3. توصيات بناءً على السلة الحالية
        const cartRecommendations = this.getCartBasedRecommendations();
        cartRecommendations.forEach(rec => recommendations.add(rec.id));
        
        // 4. توصيات بناءً على المفضلة
        const wishlistRecommendations = this.getWishlistBasedRecommendations();
        wishlistRecommendations.forEach(rec => recommendations.add(rec.id));
        
        // 5. توصيات شائعة (للحالات الجديدة)
        const popularRecommendations = this.getPopularRecommendations();
        popularRecommendations.forEach(rec => recommendations.add(rec.id));
        
        // تحويل إلى مصفوفة
        let recommendationIds = Array.from(recommendations);
        
        // خلط التوصيات
        recommendationIds = this.shuffleArray(recommendationIds);
        
        // أخذ 6 توصيات كحد أقصى
        recommendationIds = recommendationIds.slice(0, 6);
        
        // الحصول على بيانات المنتجات
        this.recommendations = recommendationIds
            .map(id => window.productsManager?.getProductById(id))
            .filter(product => product && product.stock > 0);
        
        // عرض التوصيات
        this.renderRecommendations();
    }
    
    getPurchaseBasedRecommendations() {
        if (this.userBehavior.purchased.length === 0) return [];
        
        const recentPurchases = this.userBehavior.purchased
            .slice(-3)
            .map(p => p.productId);
        
        const recommendations = [];
        recentPurchases.forEach(productId => {
            const similar = this.findSimilarProducts(productId);
            similar.forEach(product => recommendations.push(product));
        });
        
        return recommendations;
    }
    
    getViewBasedRecommendations() {
        if (this.userBehavior.viewed.length === 0) return [];
        
        const recentViews = this.userBehavior.viewed
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 5)
            .map(v => v.productId);
        
        const recommendations = [];
        recentViews.forEach(productId => {
            const similar = this.findSimilarProducts(productId);
            similar.forEach(product => recommendations.push(product));
        });
        
        return recommendations;
    }
    
    getCartBasedRecommendations() {
        if (!window.cartManager || window.cartManager.cart.length === 0) return [];
        
        const cartItems = window.cartManager.cart
            .slice(-3)
            .map(item => item.id);
        
        const recommendations = [];
        cartItems.forEach(productId => {
            const similar = this.findSimilarProducts(productId);
            similar.forEach(product => recommendations.push(product));
        });
        
        return recommendations;
    }
    
    getWishlistBasedRecommendations() {
        if (!window.wishlistManager || window.wishlistManager.wishlist.length === 0) return [];
        
        const wishlistItems = window.wishlistManager.wishlist
            .slice(-3)
            .map(item => item.id);
        
        const recommendations = [];
        wishlistItems.forEach(productId => {
            const similar = this.findSimilarProducts(productId);
            similar.forEach(product => recommendations.push(product));
        });
        
        return recommendations;
    }
    
    getPopularRecommendations() {
        // منتجات شائعة بناءً على جميع سلوكيات المستخدمين
        const allProducts = this.getAllProducts();
        
        // ترتيب حسب التقييم والمخزون
        return allProducts
            .filter(product => product.rating >= 4.0 && product.stock > 0)
            .sort((a, b) => b.rating - a.rating)
            .slice(0, 6);
    }
    
    findSimilarProducts(productId) {
        const product = window.productsManager?.getProductById(productId);
        if (!product) return [];
        
        const allProducts = this.getAllProducts();
        
        // تصفية المنتجات المتشابهة
        return allProducts
            .filter(p => 
                p.id !== productId && 
                (p.category === product.category || this.areCategoriesRelated(p.category, product.category)) &&
                p.stock > 0
            )
            .slice(0, 3);
    }
    
    areCategoriesRelated(cat1, cat2) {
        const relatedCategories = {
            'electronics': ['accessories', 'home'],
            'clothing': ['accessories'],
            'cosmetics': ['accessories'],
            'home': ['electronics', 'accessories'],
            'accessories': ['electronics', 'clothing', 'cosmetics']
        };
        
        return (relatedCategories[cat1] || []).includes(cat2) ||
               (relatedCategories[cat2] || []).includes(cat1);
    }
    
    getAllProducts() {
        const allProducts = [];
        const categories = window.productsManager?.products;
        
        if (categories) {
            Object.values(categories).forEach(categoryProducts => {
                allProducts.push(...categoryProducts);
            });
        }
        
        return allProducts;
    }
    
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    renderRecommendations() {
        if (!this.section || this.recommendations.length === 0) {
            if (this.section) {
                this.section.style.display = 'none';
            }
            return;
        }
        
        this.section.style.display = 'block';
        this.section.innerHTML = `
            <h3><i class="fas fa-lightbulb"></i> قد يعجبك أيضاً</h3>
            <div class="recommendations-grid">
                ${this.recommendations.map(product => {
                    const isInCart = window.cartManager?.getCartItem(product.id);
                    const isInWishlist = window.wishlistManager?.isInWishlist(product.id);
                    
                    return `
                        <div class="recommendation-card" data-id="${product.id}">
                            <div class="recommendation-image">
                                ${product.image}
                            </div>
                            <div class="recommendation-info">
                                <h4>${product.name}</h4>
                                <div class="recommendation-category">
                                    <i class="fas fa-tag"></i>
                                    ${window.productsManager?.getCategoryName(product.category) || ''}
                                </div>
                                <div class="recommendation-price">${product.price} ريال</div>
                                <div class="recommendation-rating">
                                    ${window.appHelpers.generateStars(product.rating || 0)}
                                    <span>${product.rating || 0}</span>
                                </div>
                                <div class="recommendation-actions">
                                    <button class="quick-add ${isInCart ? 'added' : ''}" 
                                            data-id="${product.id}">
                                        <i class="fas fa-${isInCart ? 'check' : 'cart-plus'}"></i>
                                    </button>
                                    <button class="recommendation-wishlist ${isInWishlist ? 'active' : ''}" 
                                            data-id="${product.id}">
                                        <i class="${isInWishlist ? 'fas' : 'far'} fa-heart"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        // إضافة مستمعي الأحداث
        this.addRecommendationEventListeners();
    }
    
    addRecommendationEventListeners() {
        // إضافة سريعة للسلة
        this.section.querySelectorAll('.quick-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                window.cartManager?.addToCart(productId);
                
                // تحديث الزر
                e.currentTarget.classList.add('added');
                e.currentTarget.innerHTML = '<i class="fas fa-check"></i>';
                
                // تأثير
                this.showAddAnimation(e.currentTarget);
            });
        });
        
        // إضافة للمفضلة
        this.section.querySelectorAll('.recommendation-wishlist').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                window.wishlistManager?.toggleProduct(productId);
                e.stopPropagation();
            });
        });
        
        // النقر على البطاقة
        this.section.querySelectorAll('.recommendation-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (!e.target.closest('.recommendation-actions')) {
                    const productId = card.dataset.id;
                    const product = window.productsManager?.getProductById(productId);
                    
                    if (product && product.category) {
                        // الانتقال للفئة
                        window.productsManager?.switchCategory(product.category);
                        
                        // تمييز المنتج
                        setTimeout(() => {
                            this.highlightProduct(productId);
                        }, 500);
                    }
                }
            });
        });
    }
    
    showAddAnimation(button) {
        button.classList.add('pulse');
        setTimeout(() => button.classList.remove('pulse'), 600);
    }
    
    highlightProduct(productId) {
        const productCard = document.querySelector(`.add-to-cart-btn[data-id="${productId}"]`)?.closest('.product-card, .offer-card');
        if (productCard) {
            productCard.classList.add('highlighted');
            setTimeout(() => productCard.classList.remove('highlighted'), 2000);
            
            // التمرير للعنصر
            productCard.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
    
    refreshRecommendations() {
        this.generateRecommendations();
    }
    
    setupRefreshInterval() {
        // تحديث التوصيات كل 5 دقائق
        setInterval(() => {
            this.refreshRecommendations();
        }, 5 * 60 * 1000);
        
        // تحديث عند تغيير الفئة
        document.addEventListener('categoryChanged', () => {
            setTimeout(() => {
                this.refreshRecommendations();
            }, 1000);
        });
    }
    
    // دالة للحصول على إحصائيات التوصيات
    getRecommendationStats() {
        return {
            totalRecommendations: this.recommendations.length,
            sources: {
                purchases: this.getPurchaseBasedRecommendations().length,
                views: this.getViewBasedRecommendations().length,
                cart: this.getCartBasedRecommendations().length,
                wishlist: this.getWishlistBasedRecommendations().length,
                popular: this.getPopularRecommendations().length
            },
            userBehavior: {
                totalViews: this.userBehavior.viewed.length,
                totalPurchases: this.userBehavior.purchased.length,
                totalSearches: this.userBehavior.searched.length,
                totalCartAdditions: this.userBehavior.addedToCart.length,
                totalWishlistItems: this.userBehavior.wishlist.length
            }
        };
    }
}

// تهيئة محرك التوصيات
window.recommendationsManager = new RecommendationEngine();

// إضافة حدث تغيير الفئة
document.addEventListener('DOMContentLoaded', () => {
    const originalSwitchCategory = window.productsManager?.switchCategory;
    if (originalSwitchCategory) {
        window.productsManager.switchCategory = function(...args) {
            const result = originalSwitchCategory.apply(this, args);
            
            // إرسال حدث تغيير الفئة
            const event = new CustomEvent('categoryChanged', {
                detail: { categoryId: args[0] }
            });
            document.dispatchEvent(event);
            
            return result;
        };
    }
});
