[file name]: products.js
[file content begin]
// js/products.js - يعمل فوراً عند التحميل

console.log('📦 products.js يبدأ التنفيذ...');

// ===== البيانات =====
const productsData = {
    offers: [
        { id: 'offer1', name: 'عرض خاص على ساعات اليد', price: 250, image: '⌚', description: 'خصم 29% لفترة محدودة' },
        { id: 'offer2', name: 'مجموعة مستحضرات تجميل', price: 180, image: '💄', description: 'مجموعة كاملة بخصم 28%' },
        { id: 'offer3', name: 'عرض الملابس الصيفية', price: 120, image: '👕', description: 'خصم كبير على الملابس الصيفية' }
    ],
    accessories: [
        { id: 'acc1', name: 'ساعة يد فاخرة', price: 350, image: '⌚', description: 'ساعة يد أنيقة بتصميم عصري' },
        { id: 'acc2', name: 'قلادة ذهبية', price: 420, image: '🔗', description: 'قلادة ذهبية عيار 18 قيراط' }
    ],
    cosmetics: [
        { id: 'cos1', name: 'أحمر شفاه مات', price: 75, image: '💄', description: 'أحمر شفاه مات طويل الأمد' }
    ],
    clothing: [
        { id: 'clo1', name: 'فستان سهرة', price: 450, image: '👗', description: 'فستان سهرة طويل بتصميم أنيق' }
    ],
    electronics: [
        { id: 'elec1', name: 'سماعات لاسلكية', price: 320, image: '🎧', description: 'سماعات بلوتوث لاسلكية' }
    ],
    home: [
        { id: 'home1', name: 'سجادة صوف', price: 420, image: '🧶', description: 'سجادة صوف طبيعي بتصميم شرقي' }
    ]
};

// ===== المنتجاتManager =====
window.productsManager = {
    products: productsData,
    
    // عرض المنتجات فوراً
    showProducts: function() {
        console.log('🎯 showProducts() مستدعى');
        
        const offersSection = document.getElementById('offers');
        if (!offersSection) {
            console.error('❌ offers section غير موجود');
            return;
        }
        
        // HTML للمنتجات
        offersSection.innerHTML = this.createProductsHTML();
        console.log('✅ المنتجات معروضة');
    },
    
    // إنشاء HTML
    createProductsHTML: function() {
        return `
            <div class="offers-section">
                <h2 class="offers-title">
                    <i class="fas fa-tags"></i>
                    عروضنا الحصرية
                </h2>
                
                <div class="offers-grid">
                    ${this.products.offers.map(product => `
                        <div class="offer-card">
                            <div class="offer-image">${product.image}</div>
                            <div class="offer-info">
                                <h3 class="offer-name">${product.name}</h3>
                                <p class="offer-description">${product.description}</p>
                                <div class="offer-price">
                                    <div class="new-price">${product.price} ريال</div>
                                </div>
                                <button class="add-to-cart-btn" onclick="addToCart('${product.id}')">
                                    <i class="fas fa-shopping-cart"></i> أضف للسلة
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // تبديل الفئة
    switchCategory: function(categoryId) {
        console.log('تبديل إلى:', categoryId);
        
        const section = document.getElementById(categoryId);
        if (!section) return;
        
        // إخفاء الكل
        document.querySelectorAll('.category-section').forEach(sec => {
            sec.style.display = 'none';
        });
        
        // إظهار المطلوب
        section.style.display = 'block';
        
        const products = this.products[categoryId] || [];
        section.innerHTML = `
            <div style="padding: 20px;">
                <h2>${categoryId}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; margin-top: 20px;">
                    ${products.map(p => `
                        <div style="background: white; padding: 15px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="font-size: 2rem; text-align: center;">${p.image}</div>
                            <h3 style="margin: 10px 0;">${p.name}</h3>
                            <p style="color: #666; font-size: 0.9rem;">${p.description}</p>
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px;">
                                <span style="color: #3A36E0; font-weight: bold;">${p.price} ريال</span>
                                <button onclick="addToCart('${p.id}')" style="background: #3A36E0; color: white; border: none; padding: 5px 10px; border-radius: 5px;">
                                    أضف
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    },
    
    // تحميل من Firebase
    loadProductsFromJSON: async function() {
        console.log('محاولة تحميل Firebase...');
        return false;
    }
};

// ===== دالة مساعدة =====
function addToCart(productId) {
    console.log('إضافة:', productId);
    if (window.cartManager) {
        window.cartManager.addToCart(productId);
    } else {
        alert('تمت الإضافة: ' + productId);
    }
}

// ===== التشغيل التلقائي =====
// تشغيل بعد تحميل DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProducts);
} else {
    initProducts();
}

function initProducts() {
    console.log('🚀 تهيئة المنتجات...');
    
    // انتظار بسيط لتحميل CSS
    setTimeout(() => {
        if (window.productsManager && window.productsManager.showProducts) {
            console.log('📊 عدد المنتجات:', Object.values(productsData).flat().length);
            window.productsManager.showProducts();
        }
    }, 100);
}

console.log('✅ products.js محمل');
[file content end]
