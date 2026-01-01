// js/products.js
[file content begin]
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

// بيانات المنتجات الاحتياطية (البيانات الأصلية)
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
            category: 'offers'
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
            category: 'offers'
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
            category: 'offers'
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
            category: 'offers'
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
            category: 'offers'
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
            category: 'offers'
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
            category: 'accessories'
        },
        {
            id: 'acc2',
            name: 'قلادة ذهبية',
            price: 420,
            image: '🔗',
            description: 'قلادة ذهبية عيار 18 قيراط بتصميم كلاسيكي',
            badge: 'الأكثر مبيعاً',
            category: 'accessories'
        },
        {
            id: 'acc3',
            name: 'خاتم فضة',
            price: 180,
            image: '💍',
            description: 'خاتم فضة عالي الجودة بتصميم مميز',
            badge: null,
            category: 'accessories'
        },
        {
            id: 'acc4',
            name: 'نظارة شمسية',
            price: 220,
            image: '🕶️',
            description: 'نظارة شمسية UV400 للحماية الكاملة من الشمس',
            badge: 'خصم',
            category: 'accessories'
        },
        {
            id: 'acc5',
            name: 'سوار جلد طبيعي',
            price: 95,
            image: '📿',
            description: 'سوار مصنوع من الجلد الطبيعي بتصميم رجالي',
            badge: null,
            category: 'accessories'
        },
        {
            id: 'acc6',
            name: 'حقيبة يد جلدية',
            price: 580,
            image: '👜',
            description: 'حقيبة يد أنيقة مصنوعة من الجلد الطبيعي',
            badge: 'جديد',
            category: 'accessories'
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
            category: 'cosmetics'
        },
        {
            id: 'cos2',
            name: 'ماسكارا مضاعفة',
            price: 65,
            image: '👁️',
            description: 'ماسكارا تعطي رموشك كثافة وطول مضاعف',
            badge: 'الأكثر مبيعاً',
            category: 'cosmetics'
        },
        {
            id: 'cos3',
            name: 'كريم أساس',
            price: 120,
            image: '💧',
            description: 'كريم أساس خفيف الوزن مع تغطية متوسطة',
            badge: null,
            category: 'cosmetics'
        },
        {
            id: 'cos4',
            name: 'ظلال عيون',
            price: 95,
            image: '🎨',
            description: 'باليت ظلال عيون بألوان ناعمة ولامعة',
            badge: 'خصم',
            category: 'cosmetics'
        },
        {
            id: 'cos5',
            name: 'كونسيلر عالي التغطية',
            price: 85,
            image: '🖌️',
            description: 'كونسيلر سائل عالي التغطية للهالات والعيوب',
            badge: null,
            category: 'cosmetics'
        },
        {
            id: 'cos6',
            name: 'سيروم فيتامين سي',
            price: 180,
            image: '💧',
            description: 'سيروم فيتامين سي لتوحيد لون البشرة وإشراقها',
            badge: 'جديد',
            category: 'cosmetics'
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
            category: 'clothing'
        },
        {
            id: 'clo2',
            name: 'جينز ضيق',
            price: 220,
            image: '👖',
            description: 'جينز ضيق مريح ومصمم ليعطي مظهراً أنيقاً',
            badge: 'الأكثر مبيعاً',
            category: 'clothing'
        },
        {
            id: 'clo3',
            name: 'بلوزة حرير',
            price: 180,
            image: '👕',
            description: 'بلوزة نسائية مصنوعة من الحرير الطبيعي',
            badge: null,
            category: 'clothing'
        },
        {
            id: 'clo4',
            name: 'كارديجان صوف',
            price: 250,
            image: '🧥',
            description: 'كارديجان صوفي دافئ بأزرار خشبية',
            badge: 'خصم',
            category: 'clothing'
        },
        {
            id: 'clo5',
            name: 'تي شيرت قطني',
            price: 85,
            image: '👕',
            description: 'تي شيرت قطني 100% بألوان متنوعة',
            badge: null,
            category: 'clothing'
        },
        {
            id: 'clo6',
            name: 'جاكيت جلد',
            price: 680,
            image: '🧥',
            description: 'جاكيت جلد طبيعي بتصميم كلاسيكي',
            badge: 'جديد',
            category: 'clothing'
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
            category: 'electronics'
        },
        {
            id: 'elec2',
            name: 'شاحن سريع',
            price: 95,
            image: '🔌',
            description: 'شاحن سريع للهواتف بقوة 65 واط',
            badge: 'الأكثر مبيعاً',
            category: 'electronics'
        },
        {
            id: 'elec3',
            name: 'سماعة ذكية',
            price: 450,
            image: '🔊',
            description: 'سماعة ذكية مع مساعد صوتي مدمج',
            badge: null,
            category: 'electronics'
        },
        {
            id: 'elec4',
            name: 'ساعة ذكية',
            price: 780,
            image: '⌚',
            description: 'ساعة ذكية مع شاشة AMOLED ومراقبة صحية',
            badge: 'خصم',
            category: 'electronics'
        },
        {
            id: 'elec5',
            name: 'كاميرا مراقبة',
            price: 220,
            image: '📹',
            description: 'كاميرا مراقبة ذكية مع رؤية ليلية',
            badge: null,
            category: 'electronics'
        },
        {
            id: 'elec6',
            name: 'لوحة مفاتيح ميكانيكية',
            price: 180,
            image: '⌨️',
            description: 'لوحة مفاتيح ميكانيكية مع إضاءة RGB',
            badge: 'جديد',
            category: 'electronics'
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
            category: 'home'
        },
        {
            id: 'home2',
            name: 'مفرش طاولة',
            price: 85,
            image: '🍽️',
            description: 'مفرش طاولة قطني مقاوم للبقع',
            badge: 'الأكثر مبيعاً',
            category: 'home'
        },
        {
            id: 'home3',
            name: 'وسائد زخرفية',
            price: 65,
            image: '🛏️',
            description: 'مجموعة وسائد زخرفية بألوان متناسقة',
            badge: null,
            category: 'home'
        },
        {
            id: 'home4',
            name: 'إبريق شاي',
            price: 120,
            image: '🫖',
            description: 'إبريق شاي سيراميك مع 4 أكواب',
            badge: 'خصم',
            category: 'home'
        },
        {
            id: 'home5',
            name: 'شمعدان زجاجي',
            price: 95,
            image: '🕯️',
            description: 'شمعدان زجاجي بتصميم عصري',
            badge: null,
            category: 'home'
        },
        {
            id: 'home6',
            name: 'مصباح أرضي',
            price: 280,
            image: '💡',
            description: 'مصباح أرضي مع شدة إضاءة قابلة للتعديل',
            badge: 'جديد',
            category: 'home'
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

// دالة لتحميل المنتجات من Firebase أو استخدام البيانات المحلية
async function loadProductsFromJSON() {
    console.log('📦 بدء تحميل المنتجات...');
    
    try {
        // محاولة الاتصال بـ Firebase أولاً
        if (window.db && typeof window.db.collection === 'function') {
            console.log('🔥 محاولة تحميل من Firebase...');
            
            try {
                // اختبار الاتصال مع مهلة زمنية
                const testConnection = await Promise.race([
                    window.db.collection('products').limit(1).get(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('انتهت مهلة الاتصال')), 3000))
                ]);
                
                if (testConnection && !testConnection.empty) {
                    console.log('✅ Firebase متصل، جاري تحميل المنتجات...');
                    
                    // الحصول على جميع المنتجات
                    const snapshot = await window.db.collection('products').get();
                    
                    if (!snapshot.empty) {
                        console.log(`✅ تم العثور على ${snapshot.size} منتج في Firebase`);
                        
                        // مسح البيانات الحالية
                        const currentProducts = {};
                        Object.keys(products).forEach(key => currentProducts[key] = []);
                        
                        // تعبئة المنتجات الجديدة
                        snapshot.forEach(doc => {
                            const productData = doc.data();
                            const product = {
                                id: doc.id,
                                name: productData.name || 'منتج بدون اسم',
                                price: productData.price || 0,
                                image: productData.image || '📦',
                                description: productData.description || '',
                                badge: productData.badge || null,
                                category: productData.category || 'offers',
                                oldPrice: productData.oldPrice || null,
                                discount: productData.discount || null,
                                timeLeft: productData.timeLeft || null
                            };
                            
                            // إضافة المنتج للفئة المناسبة
                            const category = product.category;
                            if (currentProducts[category]) {
                                currentProducts[category].push(product);
                            } else {
                                currentProducts.offers.push(product);
                            }
                        });
                        
                        // تحديث البيانات الأصلية
                        Object.keys(products).forEach(key => {
                            products[key] = currentProducts[key] || [];
                        });
                        
                        console.log('✅ تم تحميل منتجات Firebase بنجاح');
                        return true;
                    } else {
                        console.log('⚠️ Firebase فارغ، استخدام البيانات المحلية');
                    }
                }
            } catch (firebaseError) {
                console.log('❌ خطأ في Firebase:', firebaseError.message);
                // الاستمرار في استخدام البيانات المحلية
            }
        } else {
            console.log('ℹ️ Firebase غير متاح، استخدام البيانات المحلية');
        }
        
        // استخدام البيانات المحلية (التي تم تعريفها بالفعل)
        console.log('✅ استخدام البيانات المحلية الاحتياطية');
        console.log(`📊 عدد المنتجات: ${Object.values(products).reduce((sum, arr) => sum + arr.length, 0)}`);
        
        return true;
        
    } catch (error) {
        console.error('❌ خطأ في تحميل المنتجات:', error);
        return false;
    }
}

// دالة لتهيئة الفئات
function initCategories() {
    console.log('🎯 تهيئة الفئات...');
    const categoriesContainer = document.getElementById('categories');
    const footerLinks = document.getElementById('footer-links');
    
    if (!categoriesContainer) {
        console.error('❌ عنصر الفئات غير موجود');
        return;
    }
    
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
            console.log(`🔄 تبديل إلى فئة: ${category.name}`);
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
    
    console.log('✅ تم تهيئة الفئات');
}

// دالة لتبديل الفئة
function switchCategory(categoryId) {
    console.log(`🔄 تبديل الفئة إلى: ${categoryId}`);
    
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
    console.log('🎁 عرض العروض...');
    const offersSection = document.getElementById('offers');
    if (!offersSection) {
        console.error('❌ قسم العروض غير موجود');
        return;
    }
    
    const offers = products.offers || [];
    console.log(`📊 عدد العروض: ${offers.length}`);
    
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
                    <div class="empty-state">
                        <i class="fas fa-tags"></i>
                        <h3>لا توجد عروض حالياً</h3>
                        <p>سيتم إضافة عروض جديدة قريباً</p>
                    </div>
                ` : offers.map(offer => {
                    const cartItem = window.cartManager?.getCartItem(offer.id) || null;
                    const quantity = cartItem ? cartItem.quantity : 0;
                    
                    return `
                        <div class="offer-card">
                            ${offer.badge ? `<div class="offer-banner">${offer.badge}</div>` : ''}
                            <div class="offer-image">
                                ${offer.image || '📦'}
                            </div>
                            <div class="offer-info">
                                <h3 class="offer-name">${offer.name}</h3>
                                <p class="offer-description">${offer.description || 'لا يوجد وصف'}</p>
                                <div class="offer-price">
                                    ${offer.oldPrice ? `<div class="old-price">${offer.oldPrice} ريال</div>` : ''}
                                    <div class="new-price">${offer.price} ريال</div>
                                    ${offer.discount ? `<div class="discount-percent">%${offer.discount}</div>` : ''}
                                </div>
                                <div class="offer-actions">
                                    ${offer.timeLeft ? `
                                    <div class="time-left">
                                        <i class="fas fa-clock"></i>
                                        <span>${offer.timeLeft}</span>
                                    </div>
                                    ` : ''}
                                    <button class="add-to-cart-btn ${quantity > 0 ? 'added' : ''}" 
                                            data-id="${offer.id}" 
                                            data-category="${offer.category || 'offers'}">
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
    console.log('✅ تم عرض العروض');
}

// دالة لعرض المنتجات
function renderProducts(categoryId) {
    console.log(`📦 عرض منتجات فئة: ${categoryId}`);
    const categorySection = document.getElementById(categoryId);
    if (!categorySection) {
        console.error(`❌ قسم الفئة ${categoryId} غير موجود`);
        return;
    }
    
    const categoryProducts = products[categoryId] || [];
    const category = categories.find(c => c.id === categoryId);
    
    console.log(`📊 عدد المنتجات في الفئة: ${categoryProducts.length}`);
    
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
                <div class="empty-state">
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
                            ${product.image || '📦'}
                        </div>
                        <div class="product-info">
                            <div class="product-category">
                                <i class="fas fa-tag"></i>
                                ${category?.name || ''}
                            </div>
                            <h3 class="product-name">${product.name}</h3>
                            <p class="product-description">${product.description || 'لا يوجد وصف'}</p>
                            <div class="product-footer">
                                <div class="product-price">${product.price}<span> ريال</span></div>
                                <div class="product-actions">
                                    <div class="quantity-control" style="display: ${quantity > 0 ? 'flex' : 'none'};">
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
                                            data-category="${product.category || categoryId}">
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
    console.log('✅ تم عرض المنتجات');
}

// دالة لإضافة مستمعي الأحداث للمنتجات
function addProductEventListeners() {
    console.log('🎯 إضافة مستمعي الأحداث للمنتجات...');
    
    // أزرار إضافة إلى السلة
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const id = this.dataset.id;
            const category = this.dataset.category;
            
            console.log(`🛒 النقر على إضافة منتج: ${id}`);
            
            if (window.cartManager) {
                const cartItem = window.cartManager.getCartItem(id);
                if (cartItem) {
                    console.log(`➖ إزالة منتج من السلة: ${id}`);
                    window.cartManager.removeFromCart(id);
                } else {
                    console.log(`➕ إضافة منتج إلى السلة: ${id}`);
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
            console.log(`➕ زيادة كمية المنتج: ${id}`);
            
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
            console.log(`➖ تقليل كمية المنتج: ${id}`);
            
            if (window.cartManager) {
                window.cartManager.updateCartItemQuantity(id, -1);
            }
            e.stopPropagation();
        });
    });
    
    console.log('✅ تم إضافة مستمعي الأحداث');
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
    console.log('💳 تهيئة طرق الدفع...');
    const paymentMethodsContainer = document.getElementById('payment-methods');
    if (!paymentMethodsContainer) {
        console.error('❌ عنصر طرق الدفع غير موجود');
        return;
    }
    
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
    
    console.log('✅ تم تهيئة طرق الدفع');
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

// دالة لإعادة تحميل المنتجات
async function reloadProducts() {
    console.log('🔄 إعادة تحميل المنتجات...');
    await loadProductsFromJSON();
    
    // إعادة عرض الفئة النشطة حالياً
    const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'offers';
    switchCategory(activeCategory);
    
    console.log('✅ تم إعادة تحميل المنتجات');
}

// دالة لبدء عرض المنتجات (بدون انتظار)
function startProducts() {
    console.log('🚀 بدء عرض المنتجات...');
    
    // تهيئة الفئات
    initCategories();
    
    // تهيئة طرق الدفع
    initPaymentMethods();
    
    // عرض العروض
    renderOffers();
    
    console.log('✅ المنتجات جاهزة للعرض');
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
    loadProductsFromJSON,
    reloadProducts,
    startProducts  // دالة جديدة للبدء الفوري
};

console.log('✅ products.js تم التحميل بنجاح');
[file content end]
