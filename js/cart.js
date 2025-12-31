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
        
        this.crossSellProducts = complements.slice(0, 3); // 3 منتجات كحد
