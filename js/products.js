// بيانات الفئات والمنتجات

// بيانات الفئات
const categories = [
    { id: 'offers', name: 'العروض والخصومات', icon: 'tags', color: '#FF6B8B' },
    { id: 'accessories', name: 'الإكسسوارات', icon: 'gem', color: '#FF6B8B' },
    { id: 'cosmetics', name: 'مستحضرات التجميل', icon: 'palette', color: '#FF9EB3' },
    { id: 'clothing', name: 'الملابس', icon: 'tshirt', color: '#00D4AA' },
    { id: 'electronics', name: 'الإلكترونيات', icon: 'laptop', color: '#3A36E0' },
    { id: 'home', name: 'أدوات منزلية', icon: 'home', color: '#6A66FF' }
];

// بيانات المنتجات (يمكن استبدالها ببيانات من ملف JSON)
const products = {
    offers: [
        {
            id: 'offer1',
            name: 'عرض خاص على ساعات اليد',
            price: 250,
            oldPrice: 350,
            discount: 29,
            image: '⌚',
            description: 'خصم 29% على جميع ساعات اليد الفاخرة - عرض لفترة محدودة',
            badge: 'خصم 29%',
            timeLeft: 'ينتهي خلال 3 أيام',
            category: 'offers',
            stock: 15,
            rating: 4.5
        },
        {
            id: 'offer2',
            name: 'مجموعة مستحضرات تجميل',
            price: 180,
            oldPrice: 250,
            discount: 28,
            image: '💄',
            description: 'مجموعة كاملة من مستحضرات التجميل بخصم 28%',
            badge: 'خصم 28%',
            timeLeft: 'ينتهي خلال 5 أيام',
            category: 'offers',
            stock: 8,
            rating: 4.2
        },
        {
            id: 'offer3',
            name: 'عرض الملابس الصيفية',
            price: 120,
            oldPrice: 180,
            discount: 33,
            image: '👕',
            description: 'خصم كبير على الملابس الصيفية بمناسبة الصيف',
            badge: 'خصم 33%',
            timeLeft: 'ينتهي خلال 2 أيام',
            category: 'offers',
            stock: 20,
            rating: 4.7
        },
        {
            id: 'offer4',
            name: 'سماعات لاسلكية',
            price: 220,
            oldPrice: 320,
            discount: 31,
            image: '🎧',
            description: 'سماعات بلوتوث عالية الجودة بخصم 31%',
            badge: 'خصم 31%',
            timeLeft: 'ينتهي خلال 7 أيام',
            category: 'offers',
            stock: 12,
            rating: 4.8
        },
        {
            id: 'offer5',
            name: 'عرض أدوات المطبخ',
            price: 350,
            oldPrice: 500,
            discount: 30,
            image: '🍳',
            description: 'طقم أدوات مطبخ كامل بخصم 30%',
            badge: 'خصم 30%',
            timeLeft: 'ينتهي خلال 4 أيام',
            category: 'offers',
            stock: 6,
            rating: 4.6
        },
        {
            id: 'offer6',
            name: 'عرض نهاية الموسم',
            price: 450,
            oldPrice: 680,
            discount: 34,
            image: '🛍️',
            description: 'خصومات هائلة على جميع المنتجات بنهاية الموسم',
            badge: 'خصم 34%',
            timeLeft: 'ينتهي خلال 6 أيام',
            category: 'offers',
            stock: 25,
            rating: 4.9
        }
    ],
    accessories: [
        {
            id: 'acc1',
            name: 'ساعة يد فاخرة',
            price: 350,
            image: '⌚',
            description: 'ساعة يد أنيقة بتصميم عصري ومناسب لجميع المناسبات',
            badge: 'جديد',
            category: 'accessories',
            stock: 10,
            rating: 4.5
        },
        {
            id: 'acc2',
            name: 'قلادة ذهبية',
            price: 420,
            image: '🔗',
            description: 'قلادة ذهبية عيار 18 قيراط بتصميم كلاسيكي',
            badge: 'الأكثر مبيعاً',
            category: 'accessories',
            stock: 5,
            rating: 4.7
        },
        {
            id: 'acc3',
            name: 'خاتم فضة',
            price: 180,
            image: '💍',
            description: 'خاتم فضة عالي الجودة بتصميم مميز',
            badge: null,
            category: 'accessories',
            stock: 15,
            rating: 4.3
        },
        {
            id: 'acc4',
            name: 'نظارة شمسية',
            price: 220,
            image: '🕶️',
            description: 'نظارة شمسية UV400 للحماية الكاملة من الشمس',
            badge: 'خصم',
            category: 'accessories',
            stock: 8,
            rating: 4.6
        },
        {
            id: 'acc5',
            name: 'سوار جلد طبيعي',
            price: 95,
            image: '📿',
            description: 'سوار مصنوع من الجلد الطبيعي بتصميم رجالي',
            badge: null,
            category: 'accessories',
            stock: 20,
            rating: 4.4
        },
        {
            id: 'acc6',
            name: 'حقيبة يد جلدية',
            price: 580,
            image: '👜',
            description: 'حقيبة يد أنيقة مصنوعة من الجلد الطبيعي',
            badge: 'جديد',
            category: 'accessories',
            stock: 3,
            rating: 4.8
        }
    ],
    cosmetics: [
        {
            id: 'cos1',
            name: 'أحمر شفاه مات',
            price: 75,
            image: '💄',
            description: 'أحمر شفاه مات طويل الأمد بتدرجات ألوان متنوعة',
            badge: 'جديد',
            category: 'cosmetics',
            stock: 25,
            rating: 4.5
        },
        {
            id: 'cos2',
            name: 'ماسكارا مضاعفة',
            price: 65,
            image: '👁️',
            description: 'ماسكارا تعطي رموشك كثافة وطول مضاعف',
            badge: 'الأكثر مبيعاً',
            category: 'cosmetics',
            stock: 18,
            rating: 4.6
        },
        {
            id: 'cos3',
            name: 'كريم أساس',
            price: 120,
            image: '💧',
            description: 'كريم أساس خفيف الوزن مع تغطية متوسطة',
            badge: null,
            category: 'cosmetics',
            stock: 12,
            rating: 4.4
        },
        {
            id: 'cos4',
            name: 'ظلال عيون',
            price: 95,
            image: '🎨',
            description: 'باليت ظلال عيون بألوان ناعمة ولامعة',
            badge: 'خصم',
            category: 'cosmetics',
            stock: 9,
            rating: 4.7
        },
        {
            id: 'cos5',
            name: 'كونسيلر عالي التغطية',
            price: 85,
            image: '🖌️',
            description: 'كونسيلر سائل عالي التغطية للهالات والعيوب',
            badge: null,
            category: 'cosmetics',
            stock: 22,
            rating: 4.3
        },
        {
            id: 'cos6',
            name: 'سيروم فيتامين سي',
            price: 180,
            image: '💧',
            description: 'سيروم فيتامين سي لتوحيد لون البشرة وإشراقها',
            badge: 'جديد',
            category: 'cosmetics',
            stock: 7,
            rating: 4.8
        }
    ],
    clothing: [
        {
            id: 'clo1',
            name: 'فستان سهرة',
            price: 450,
            image: '👗',
            description: 'فستان سهرة طويل بتصميم أنيق ومناسب للمناسبات',
            badge: 'جديد',
            category: 'clothing',
            stock: 6,
            rating: 4.9
        },
        {
            id: 'clo2',
            name: 'جينز ضيق',
            price: 220,
            image: '👖',
            description: 'جينز ضيق مريح ومصمم ليعطي مظهراً أنيقاً',
            badge: 'الأكثر مبيعاً',
            category: 'clothing',
            stock: 15,
            rating: 4.7
        },
        {
            id: 'clo3',
            name: 'بلوزة حرير',
            price: 180,
            image: '👕',
            description: 'بلوزة نسائية مصنوعة من الحرير الطبيعي',
            badge: null,
            category: 'clothing',
            stock: 10,
            rating: 4.5
        },
        {
            id: 'clo4',
            name: 'كارديجان صوف',
            price: 250,
            image: '🧥',
            description: 'كارديجان صوفي دافئ بأزرار خشبية',
            badge: 'خصم',
            category: 'clothing',
            stock: 8,
            rating: 4.6
        },
        {
            id: 'clo5',
            name: 'تي شيرت قطني',
            price: 85,
            image: '👕',
            description: 'تي شيرت قطني 100% بألوان متنوعة',
            badge: null,
            category: 'clothing',
            stock: 30,
            rating: 4.4
        },
        {
            id: 'clo6',
            name: 'جاكيت جلد',
            price: 680,
            image: '🧥',
            description: 'جاكيت جلد طبيعي بتصميم كلاسيكي',
            badge: 'جديد',
            category: 'clothing',
            stock: 4,
            rating: 4.8
        }
    ],
    electronics: [
        {
            id: 'elec1',
            name: 'سماعات لاسلكية',
            price: 320,
            image: '🎧',
            description: 'سماعات بلوتوث لاسلكية مع عزل صوتي ممتاز',
            badge: 'جديد',
            category: 'electronics',
            stock: 12,
            rating: 4.8
        },
        {
            id: 'elec2',
            name: 'شاحن سريع',
            price: 95,
            image: '🔌',
            description: 'شاحن سريع للهواتف بقوة 65 واط',
            badge: 'الأكثر مبيعاً',
            category: 'electronics',
            stock: 25,
            rating: 4.6
        },
        {
            id: 'elec3',
            name: 'سماعة ذكية',
            price: 450,
            image: '🔊',
            description: 'سماعة ذكية مع مساعد صوتي مدمج',
            badge: null,
            category: 'electronics',
            stock: 7,
            rating: 4.7
        },
        {
            id: 'elec4',
            name: 'ساعة ذكية',
            price: 780,
            image: '⌚',
            description: 'ساعة ذكية مع شاشة AMOLED ومراقبة صحية',
            badge: 'خصم',
            category: 'electronics',
            stock: 5,
            rating: 4.9
        },
        {
            id: 'elec5',
            name: 'كاميرا مراقبة',
            price: 220,
            image: '📹',
            description: 'كاميرا مراقبة ذكية مع رؤية ليلية',
            badge: null,
            category: 'electronics',
            stock: 9,
            rating: 4.5
        },
        {
            id: 'elec6',
            name: 'لوحة مفاتيح ميكانيكية',
            price: 180,
            image: '⌨️',
            description: 'لوحة مفاتيح ميكانيكية مع إضاءة RGB',
            badge: 'جديد',
            category: 'electronics',
            stock: 14,
            rating: 4.6
        }
    ],
    home: [
        {
            id: 'home1',
            name: 'سجادة صوف',
            price: 420,
            image: '🧶',
            description: 'سجادة صوف طبيعي بتصميم شرقي',
            badge: 'جديد',
            category: 'home',
            stock: 4,
            rating: 4.7
        },
        {
            id: 'home2',
            name: 'مفرش طاولة',
            price: 85,
            image: '🍽️',
            description: 'مفرش طاولة قطني مقاوم للبقع',
            badge: 'الأكثر مبيعاً',
            category: 'home',
            stock: 20,
            rating: 4.4
        },
        {
            id: 'home3',
            name: 'وسائد زخرفية',
            price: 65,
            image: '🛏️',
            description: 'مجموعة وسائد زخرفية بألوان متناسقة',
            badge: null,
            category: 'home',
            stock: 15,
            rating: 4.3
        },
        {
            id: 'home4',
            name: 'إبريق شاي',
            price: 120,
            image: '🫖',
            description: 'إبريق شاي سيراميك مع 4 أكواب',
            badge: 'خصم',
            category: 'home',
            stock: 8,
            rating: 4.6
        },
        {
            id: 'home5',
            name: 'شمعدان زجاجي',
            price: 95,
            image: '🕯️',
            description: 'شمعدان زجاجي بتصميم عصري',
            badge: null,
            category: 'home',
            stock: 12,
            rating: 4.5
        },
        {
            id: 'home6',
            name: 'مصباح أرضي',
            price: 280,
            image: '💡',
            description: 'مصباح أرضي مع شدة إضاءة قابلة للتعديل',
            badge: 'جديد',
            category: 'home',
            stock: 6,
            rating: 4.8
        }
    ]
};

// طرق الدفع
const paymentMethods = [
    {
        id: 'cash',
        name: 'كاش',
        description: 'الدفع عند الاستلام',
        icon: 'money-bill-wave'
    },
    {
        id: 'bank',
        name: 'تطبيق بنك',
        description: 'التحويل عبر تطبيق البنك',
        icon: 'university'
    },
    {
        id: 'fawry',
        name: 'تطبيق فوري',
        description: 'الدفع عبر تطبيق فوري',
        icon: 'mobile-alt'
    },
    {
        id: 'okash',
        name: 'تطبيق أوكاش',
        description: 'الدفع عبر تطبيق أوكاش',
        icon: 'wallet'
    },
    {
        id: 'mycash',
        name: 'تطبيق ماي كاشي',
        description: 'الدفع عبر تطبيق ماي كاشي',
        icon: 'money-check'
    }
];

// دالة لتحميل المنتجات من ملف JSON (إذا كان موجوداً)
async function loadProductsFromJSON() {
    try {
        const response = await fetch('data/products.json');
        if (response.ok) {
            const data = await response.json();
            
            // دمج البيانات مع الحفاظ على البيانات الحالية
            if (data.products) {
                Object.keys(data.products).forEach(category => {
                    if (products[category]) {
                        products[category] = [...products[category], ...data.products[category]];
                    }
                });
            }
            
            if (data.paymentMethods) {
                paymentMethods.push(...data.paymentMethods);
            }
            
            return true;
        }
    } catch (error) {
        console.log('استخدام المنتجات المحلية، خطأ في تحميل ملف JSON:', error);
    }
    return false;
}

// دالة لتهيئة الفئات
function initCategories() {
    const categoriesContainer = document.getElementById('categories');
    const footerLinks = document.getElementById('footer-links');
    
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    if (footerLinks) footerLinks.innerHTML = '';
    
    categories.forEach(category => {
        // إضافة أزرار الفئات
        const button = document.createElement('button');
        button.className = category.id === 'offers' ? 'category-btn active' : 'category-btn';
        button.id = `${category.id}-btn`;
        button.dataset.category = category.id;
        button.innerHTML = `
            <i class="fas fa-${category.icon}"></i>
            ${category.name}
        `;
        
        button.addEventListener('click', function() {
            switchCategory(category.id);
        });
        
        categoriesContainer.appendChild(button);
        
        // إضافة روابط الفوتر
        if (footerLinks) {
            const link = document.createElement('a');
            link.href = `#${category.id}`;
            link.className = 'category-link';
            link.dataset.category = category.id;
            link.textContent = category.name;
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                switchCategory(category.id);
            });
            
            footerLinks.appendChild(link);
        }
    });
}

// دالة لتبديل الفئة
function switchCategory(categoryId) {
    // تحديث أزرار الفئات
    document.querySelectorAll('.category-btn').forEach(btn => {
        if (btn.dataset.category === categoryId) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // إخفاء جميع الأقسام
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // إظهار القسم المحدد
    const targetSection = document.getElementById(categoryId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // عرض المحتوى المناسب
        if (categoryId === 'offers') {
            renderOffers();
        } else {
            renderProducts(categoryId);
        }
    }
    
    // تحديث عدد المنتجات
    updateProductsCount(categoryId);
    
    // التمرير إلى الأعلى
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// دالة لعرض العروض
function renderOffers() {
    const offersSection = document.getElementById('offers');
    if (!offersSection) return;
    
    const offers = products.offers || [];
    
    offersSection.innerHTML = `
        <div class="offers-section">
            <div class="offers-header">
                <h2 class="offers-title">
                    <i class="fas fa-tags pulse"></i>
                    العروض والخصومات الحصرية
                </h2>
                <div class="offer-badge">🔥 عروض محدودة الوقت</div>
            </div>
            
            <div class="offers-grid" id="offers-grid">
                ${offers.length === 0 ? `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <i class="fas fa-tags"></i>
                        <h3>لا توجد عروض حالياً</h3>
                        <p>سيتم إضافة عروض جديدة قريباً</p>
                    </div>
                ` : offers.map(offer => {
                    const cartItem = window.cartManager?.getCartItem(offer.id) || null;
                    const quantity = cartItem ? cartItem.quantity : 0;
                    
                    return `
                        <div class="offer-card">
                            <div class="offer-banner">${offer.badge}</div>
                            <div class="offer-image">
                                ${offer.image}
                            </div>
                            <div class="offer-info">
                                <h3 class="offer-name">${offer.name}</h3>
                                <p class="offer-description">${offer.description}</p>
                                <div class="offer-price">
                                    <div class="old-price">${offer.oldPrice} ريال</div>
                                    <div class="new-price">${offer.price} ريال</div>
                                    <div class="discount-percent">%${offer.discount}</div>
                                </div>
                                <div class="stock-info">
                                    <i class="fas fa-box"></i>
                                    <span>المتبقي: ${offer.stock || 10}</span>
                                </div>
                                <div class="offer-actions">
                                    <div class="time-left">
                                        <i class="fas fa-clock"></i>
                                        <span>${offer.timeLeft}</span>
                                    </div>
                                    <button class="add-to-cart-btn ${quantity > 0 ? 'added' : ''}" 
                                            data-id="${offer.id}" 
                                            data-category="${offer.category}">
                                        <i class="fas fa-${quantity > 0 ? 'check' : 'shopping-cart'}"></i>
                                        ${quantity > 0 ? 'مضاف' : 'أضف للسلة'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `;
    
    // إضافة مستمعي الأحداث للعروض
    addProductEventListeners();
}

// دالة لعرض المنتجات
function renderProducts(categoryId) {
    const categorySection = document.getElementById(categoryId);
    if (!categorySection) return;
    
    const categoryProducts = products[categoryId] || [];
    const category = categories.find(c => c.id === categoryId);
    
    categorySection.innerHTML = `
        <div class="section-header">
            <h2 class="section-title">
                <i class="fas fa-${category?.icon || 'box'}"></i>
                ${category?.name || 'المنتجات'}
            </h2>
            <div class="products-count">${categoryProducts.length} منتج</div>
        </div>
        
        <div class="products-grid" id="${categoryId}-products">
            ${categoryProducts.length === 0 ? `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-box-open"></i>
                    <h3>لا توجد منتجات حالياً</h3>
                    <p>سيتم إضافة منتجات جديدة قريباً في هذه الفئة</p>
                </div>
            ` : categoryProducts.map(product => {
                const cartItem = window.cartManager?.getCartItem(product.id) || null;
                const quantity = cartItem ? cartItem.quantity : 0;
                
                return `
                    <div class="product-card">
                        ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                        <div class="product-image">
                            ${product.image}
                        </div>
                        <div class="product-info">
                            <div class="product-category">
                                <i class="fas fa-tag"></i>
                                ${category?.name || ''}
                            </div>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description}</p>
                            <div class="product-meta">
                                <div class="stock-info">
                                    <i class="fas fa-box"></i>
                                    <span>المتبقي: ${product.stock || 10}</span>
                                </div>
                                <div class="rating-info">
                                    <i class="fas fa-star"></i>
                                    <span>${product.rating || 4.0}</span>
                                </div>
                            </div>
                            <div class="product-footer">
                                <div class="product-price">${product.price}<span> ريال</span></div>
                                <div class="product-actions">
                                    <div class="quantity-control" ${quantity === 0 ? 'style="display:none;"' : ''}>
                                        <button class="quantity-btn minus" data-id="${product.id}">
                                            <i class="fas fa-minus"></i>
                                        </button>
                                        <span class="quantity" id="quantity-${product.id}">${quantity}</span>
                                        <button class="quantity-btn plus" data-id="${product.id}">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                    <button class="add-to-cart-btn ${quantity > 0 ? 'added' : ''}" 
                                            data-id="${product.id}" 
                                            data-category="${product.category}">
                                        <i class="fas fa-${quantity > 0 ? 'check' : 'shopping-cart'}"></i>
                                        ${quantity > 0 ? 'مضاف' : 'أضف للسلة'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
    
    // إضافة مستمعي الأحداث للمنتجات
    addProductEventListeners();
}

// دالة لإضافة مستمعي الأحداث للمنتجات
function addProductEventListeners() {
    // أزرار إضافة إلى السلة
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = this.dataset.id;
            const category = this.dataset.category;
            
            if (window.cartManager) {
                const cartItem = window.cartManager.getCartItem(id);
                if (cartItem) {
                    window.cartManager.removeFromCart(id);
                } else {
                    window.cartManager.addToCart(id, category);
                }
            }
            
            e.stopPropagation();
        });
    });
    
    // أزرار زيادة الكمية
    document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = this.dataset.id;
            if (window.cartManager) {
                window.cartManager.addToCart(id);
            }
            e.stopPropagation();
        });
    });
    
    // أزرار تقليل الكمية
    document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = this.dataset.id;
            if (window.cartManager) {
                window.cartManager.updateCartItemQuantity(id, -1);
            }
            e.stopPropagation();
        });
    });
}

// دالة لتحديث عدد المنتجات
function updateProductsCount(categoryId) {
    const categoryProducts = products[categoryId] || [];
    const countElement = document.querySelector(`#${categoryId} .products-count`);
    if (countElement) {
        countElement.textContent = `${categoryProducts.length} منتج`;
    }
}

// دالة لتهيئة طرق الدفع
function initPaymentMethods() {
    const paymentMethodsContainer = document.getElementById('payment-methods');
    if (!paymentMethodsContainer) return;
    
    paymentMethodsContainer.innerHTML = paymentMethods.map(method => `
        <div class="payment-method">
            <input type="radio" id="${method.id}" name="payment" value="${method.id}" ${method.id === 'cash' ? 'checked' : ''}>
            <label class="payment-label" for="${method.id}">
                <i class="fas fa-${method.icon} payment-icon"></i>
                <span class="payment-name">${method.name}</span>
                <span class="payment-desc">${method.description}</span>
            </label>
        </div>
    `).join('');
}

// دالة للحصول على منتج بواسطة ID
function getProductById(productId) {
    for (const [categoryId, categoryProducts] of Object.entries(products)) {
        const product = categoryProducts.find(p => p.id === productId);
        if (product) {
            return { ...product, category: categoryId };
        }
    }
    return null;
}

// دالة للحصول على اسم الفئة
function getCategoryName(categoryId) {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : '';
}

// دالة للبحث عن المنتجات
function searchProducts(searchTerm) {
    const results = [];
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return results;
    
    Object.entries(products).forEach(([categoryId, categoryProducts]) => {
        categoryProducts.forEach(product => {
            if (product.name.toLowerCase().includes(term) || 
                product.description.toLowerCase().includes(term)) {
                results.push({
                    ...product,
                    category: categoryId,
                    categoryName: getCategoryName(categoryId)
                });
            }
        });
    });
    
    return results;
}

// دالة لتصفية المنتجات حسب السعر
function filterProducts(categoryId, minPrice = 0, maxPrice = Infinity) {
    const categoryProducts = products[categoryId] || [];
    return categoryProducts.filter(product => 
        product.price >= minPrice && product.price <= maxPrice
    );
}

// تصدير الدوال
window.productsManager = {
    categories,
    products,
    paymentMethods,
    initCategories,
    initPaymentMethods,
    switchCategory,
    renderOffers,
    renderProducts,
    getProductById,
    getCategoryName,
    searchProducts,
    filterProducts,
    loadProductsFromJSON
};
