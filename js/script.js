// بيانات المنتجات
const products = [
    {
        id: 1,
        name: "آيفون 14 برو",
        description: "أحدث إصدار من آيفون بشاشة ديناميكية وكاميرا محسنة",
        price: 4499,
        image: "https://images.unsplash.com/photo-1663499482523-1c0c1eae708d?w=600",
        category: "هواتف"
    },
    {
        id: 2,
        name: "سامسونج جالاكسي S23",
        description: "هاتف ذكي بمعالج سريع وكاميرات متطورة",
        price: 3999,
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w-600",
        category: "هواتف"
    },
    {
        id: 3,
        name: "لابتوب ديل XPS 15",
        description: "لابتوب قوي للمحترفين بشاشة 4K ومعالج i9",
        price: 7999,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w-600",
        category: "لابتوبات"
    },
    {
        id: 4,
        name: "ساعات آبل ووتش",
        description: "ساعة ذكية بتتبع اللياقة والصحة",
        price: 1999,
        image: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w-600",
        category: "إكسسوارات"
    },
    {
        id: 5,
        name: "سماعات سوني",
        description: "سماعات رأس لاسلكية بإلغاء ضجيج",
        price: 1299,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w-600",
        category: "سماعات"
    },
    {
        id: 6,
        name: "كاميرا كانون",
        description: "كاميرا احترافية بدقة 24 ميجابكسل",
        price: 5599,
        image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w-600",
        category: "كاميرات"
    }
];

// بيانات السلة
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// طرق الدفع
const paymentMethods = [
    { id: 1, name: "الدفع عند الاستلام", icon: "fas fa-money-bill-wave" },
    { id: 2, name: "بطاقة ائتمان", icon: "fas fa-credit-card" },
    { id: 3, name: "تحويل بنكي", icon: "fas fa-university" },
    { id: 4, name: "آبل باي", icon: "fab fa-apple" },
    { id: 5, name: "حساب باي بال", icon: "fab fa-paypal" }
];

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    displayProducts();
    updateCartCount();
    displayCartItems();
    displayPaymentMethods();
    setupSearch();
});

// عرض المنتجات
function displayProducts() {
    const container = document.getElementById('productsContainer');
    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${product.price.toFixed(2)} ريال</div>
                <button class="add-to-cart" onclick="addToCart(${product.id})">
                    أضف إلى السلة
                </button>
            </div>
        `;
        container.appendChild(productCard);
    });
}

// إعداد البحث
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        
        if (searchTerm.length === 0) {
            searchResults.style.display = 'none';
            return;
        }
        
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
        
        displaySearchResults(filteredProducts);
    });
    
    searchInput.addEventListener('focus', function() {
        if (this.value.trim().length > 0) {
            searchResults.style.display = 'block';
        }
    });
    
    // إخفاء نتائج البحث عند النقر خارجها
    document.addEventListener('click', function(e) {
        if (!searchResults.contains(e.target) && e.target !== searchInput) {
            searchResults.style.display = 'none';
        }
    });
}

// عرض نتائج البحث
function displaySearchResults(results) {
    const searchResults = document.getElementById('searchResults');
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">لا توجد نتائج</div>';
        searchResults.style.display = 'block';
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="search-result-item" onclick="addToCart(${product.id}); this.blur();">
            <img src="${product.image}" alt="${product.name}">
            <div class="search-result-info">
                <h4>${product.name}</h4>
                <p>${product.price.toFixed(2)} ريال</p>
            </div>
        </div>
    `).join('');
    
    searchResults.style.display = 'block';
}

// عرض طرق الدفع المصغرة
function displayPaymentMethods() {
    const container = document.getElementById('paymentMethods');
    container.innerHTML = paymentMethods.map(method => `
        <div class="payment-method" onclick="selectPaymentMethod(${method.id})">
            <i class="${method.icon} payment-icon-small"></i>
            <span>${method.name}</span>
        </div>
    `).join('');
    
    // تحديد الدفع عند الاستلام كخيار افتراضي
    selectPaymentMethod(1);
}

let selectedPaymentMethod = 1;

function selectPaymentMethod(id) {
    selectedPaymentMethod = id;
    document.querySelectorAll('.payment-method').forEach(method => {
        method.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
}

// إدارة السلة
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    updateCartCount();
    displayCartItems();
    showAlert('تمت إضافة المنتج إلى السلة', 'success');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartCount();
    displayCartItems();
    showAlert('تم إزالة المنتج من السلة', 'success');
}

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            updateCartCount();
            displayCartItems();
        }
    }
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

function calculateTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// عرض عناصر السلة
function displayCartItems() {
    const container = document.getElementById('cartItems');
    const totalElement = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: #7f8c8d;">السلة فارغة</div>';
        totalElement.textContent = '0.00';
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-price">${(item.price * item.quantity).toFixed(2)} ريال</div>
                
                <!-- تعديل الكمية داخل السلة -->
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-value">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
                
                <button class="remove-item" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> إزالة
                </button>
            </div>
        </div>
    `).join('');
    
    totalElement.textContent = calculateTotal().toFixed(2);
}

// التحكم في عرض السلة
function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

// إتمام الطلب
function openCheckout() {
    if (cart.length === 0) {
        showAlert('السلة فارغة. أضف منتجات أولاً', 'error');
        return;
    }
    
    displayOrderSummary();
    document.getElementById('checkoutModal').style.display = 'flex';
}

function closeCheckout() {
    document.getElementById('checkoutModal').style.display = 'none';
}

function displayOrderSummary() {
    const container = document.getElementById('orderSummary');
    const totalElement = document.getElementById('orderTotal');
    
    container.innerHTML = cart.map(item => `
        <div class="order-item">
            <span>${item.name} × ${item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)} ريال</span>
        </div>
    `).join('');
    
    totalElement.textContent = calculateTotal().toFixed(2);
}

// تأكيد الطلب
function confirmOrder() {
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    
    if (!name || !phone) {
        showAlert('الرجاء تعبئة الاسم ورقم الهاتف', 'error');
        return;
    }
    
    displayFinalConfirmation(name, phone);
    closeCheckout();
}

// عرض تأكيد الطلب النهائي
function displayFinalConfirmation(name, phone) {
    const container = document.getElementById('orderDetailsConfirm');
    const address = document.getElementById('customerAddress').value;
    const notes = document.getElementById('customerNotes').value;
    const paymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    container.innerHTML = `
        <div class="order-detail-item">
            <span>الاسم:</span>
            <span>${name}</span>
        </div>
        <div class="order-detail-item">
            <span>الهاتف:</span>
            <span>${phone}</span>
        </div>
        ${address ? `
        <div class="order-detail-item">
            <span>العنوان:</span>
            <span>${address}</span>
        </div>
        ` : ''}
        <div class="order-detail-item">
            <span>طريقة الدفع:</span>
            <span>${paymentMethod.name}</span>
        </div>
        <hr style="margin: 15px 0; border-color: #ddd;">
        ${cart.map(item => `
            <div class="order-detail-item">
                <span>${item.name} × ${item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)} ريال</span>
            </div>
        `).join('')}
        <hr style="margin: 15px 0; border-color: #ddd;">
        <div class="order-detail-item" style="font-weight: bold;">
            <span>المجموع الكلي:</span>
            <span>${calculateTotal().toFixed(2)} ريال</span>
        </div>
        ${notes ? `
        <div class="order-detail-item">
            <span>ملاحظات:</span>
            <span>${notes}</span>
        </div>
        ` : ''}
    `;
    
    document.getElementById('finalConfirmationModal').style.display = 'flex';
}

function editOrder() {
    document.getElementById('finalConfirmationModal').style.display = 'none';
    openCheckout();
}

// إرسال الطلب عبر الواتساب
function sendToWhatsApp() {
    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const address = document.getElementById('customerAddress').value;
    const notes = document.getElementById('customerNotes').value;
    const paymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
    
    // تحسين تنسيق رسالة الواتساب
    let message = `📦 *طلب جديد*\n\n`;
    message += `👤 *العميل:* ${name}\n`;
    message += `📞 *الهاتف:* ${phone}\n`;
    
    if (address) {
        message += `📍 *العنوان:* ${address}\n`;
    }
    
    message += `💳 *طريقة الدفع:* ${paymentMethod.name}\n\n`;
    message += `🛒 *المنتجات:*\n`;
    message += '─'.repeat(20) + '\n';
    
    cart.forEach(item => {
        message += `• ${item.name}\n`;
        message += `  الكمية: ${item.quantity}\n`;
        message += `  السعر: ${item.price.toFixed(2)} × ${item.quantity} = ${(item.price * item.quantity).toFixed(2)} ريال\n`;
        message += '─'.repeat(20) + '\n';
    });
    
    message += `\n💰 *المجموع الكلي:* ${calculateTotal().toFixed(2)} ريال\n\n`;
    
    if (notes) {
        message += `📝 *ملاحظات:*\n${notes}\n\n`;
    }
    
    message += `🕒 *وقت الطلب:* ${new Date().toLocaleString('ar-SA')}`;
    
    // ترميز الرسالة للرابط
    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = '966123456789'; // استبدل برقم الهاتف الفعلي
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    
    // حفظ الطلب محلياً
    const order = {
        id: Date.now(),
        date: new Date().toISOString(),
        customer: { name, phone, address },
        items: cart,
        total: calculateTotal(),
        paymentMethod: paymentMethod.name,
        notes
    };
    
    saveOrder(order);
    
    // فتح الواتساب
    window.open(whatsappUrl, '_blank');
    
    // إفراغ السلة
    cart = [];
    saveCart();
    updateCartCount();
    displayCartItems();
    
    // إغلاق النافذة وعرض رسالة نجاح
    document.getElementById('finalConfirmationModal').style.display = 'none';
    showAlert('تم إرسال الطلب بنجاح! سيتم التواصل معك قريباً.', 'success');
    
    // إعادة تعيين النموذج
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('customerAddress').value = '';
    document.getElementById('customerNotes').value = '';
}

function saveOrder(order) {
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
}

// عرض رسائل التنبيه
function showAlert(message, type) {
    // إزالة أي رسالة سابقة
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    alert.textContent = message;
    
    document.body.insertBefore(alert, document.body.firstChild);
    
    setTimeout(() => {
        alert.style.transition = 'opacity 0.5s';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 500);
    }, 3000);
}

// إغلاق النوافذ عند الضغط على زر Esc
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeCheckout();
        document.getElementById('finalConfirmationModal').style.display = 'none';
    }
});
