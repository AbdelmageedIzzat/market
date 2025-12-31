// نظام البحث المتقدم

class SearchManager {
    constructor() {
        this.searchInput = null;
        this.searchResults = null;
        this.searchContainer = null;
        this.init();
    }
    
    init() {
        this.createSearchBar();
        this.setupEventListeners();
    }
    
    // إنشاء شريط البحث
    createSearchBar() {
        // إنشاء شريط البحث في الهيدر
        const headerContent = document.querySelector('.header-content');
        if (!headerContent) return;
        
        this.searchContainer = document.createElement('div');
        this.searchContainer.className = 'search-container';
        
        this.searchContainer.innerHTML = `
            <div class="search-box">
                <input type="text" id="global-search" placeholder="ابحث عن منتج..." autocomplete="off">
                <button id="search-btn"><i class="fas fa-search"></i></button>
            </div>
            <div class="search-results" id="search-results"></div>
        `;
        
        // إدراج شريط البحث بعد الشعار
        const logo = headerContent.querySelector('.logo');
        if (logo) {
            logo.insertAdjacentElement('afterend', this.searchContainer);
        } else {
            headerContent.insertBefore(this.searchContainer, headerContent.firstChild);
        }
        
        this.searchInput = document.getElementById('global-search');
        this.searchResults = document.getElementById('search-results');
    }
    
    setupEventListeners() {
        if (!this.searchInput) return;
        
        // البحث أثناء الكتابة
        this.searchInput.addEventListener('input', () => {
            this.performSearch();
        });
        
        // إظهار/إخفاء نتائج البحث
        this.searchInput.addEventListener('focus', () => {
            if (this.searchInput.value.trim().length > 0) {
                this.searchResults.style.display = 'block';
            }
        });
        
        // البحث عند الضغط على Enter
        this.searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.performSearch();
            }
        });
        
        // زر البحث
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performSearch();
            });
        }
        
        // إغلاق نتائج البحث عند النقر خارجها
        document.addEventListener('click', (e) => {
            if (!this.searchContainer?.contains(e.target)) {
                this.searchResults.style.display = 'none';
            }
        });
        
        // تصفية عند اختيار فئة
        document.addEventListener('categorySelected', (e) => {
            if (e.detail?.categoryId && this.searchInput.value.trim().length > 0) {
                this.performSearch();
            }
        });
    }
    
    // تنفيذ البحث
    performSearch() {
        const query = this.searchInput.value.trim().toLowerCase();
        
        if (query.length === 0) {
            this.searchResults.style.display = 'none';
            this.searchResults.innerHTML = '';
            return;
        }
        
        const results = this.searchProducts(query);
        this.displayResults(results);
        this.searchResults.style.display = 'block';
    }
    
    // البحث في المنتجات
    searchProducts(query) {
        const allProducts = [];
        
        // جمع جميع المنتجات من جميع الفئات
        Object.values(window.productsManager?.products || {}).forEach(categoryProducts => {
            categoryProducts.forEach(product => {
                allProducts.push(product);
            });
        });
        
        // تصفية النتائج
        return allProducts.filter(product => {
            const searchFields = [
                product.name,
                product.description,
                product.category,
                product.badge,
                product.price.toString()
            ];
            
            return searchFields.some(field => 
                field && field.toString().toLowerCase().includes(query)
            );
        });
    }
    
    // عرض نتائج البحث
    displayResults(results) {
        if (!this.searchResults) return;
        
        if (results.length === 0) {
            this.searchResults.innerHTML = `
                <div class="search-result-empty">
                    <i class="fas fa-search"></i>
                    <div class="search-result-info">
                        <h4>لا توجد نتائج</h4>
                        <p>لم يتم العثور على منتجات تطابق البحث</p>
                    </div>
                </div>
            `;
            return;
        }
        
        let html = '';
        results.slice(0, 10).forEach(product => {
            const categoryName = window.productsManager?.getCategoryName(product.category) || product.category;
            
            html += `
                <div class="search-result-item" data-id="${product.id}">
                    <div class="search-result-image">
                        ${product.image}
                    </div>
                    <div class="search-result-info">
                        <h4>${this.highlightText(product.name, this.searchInput.value)}</h4>
                        <div class="search-result-category">${categoryName}</div>
                        <div class="search-result-price">${product.price} ريال</div>
                    </div>
                    <button class="search-result-add" data-id="${product.id}">
                        <i class="fas fa-plus"></i>
                    </button>
                </div>
            `;
        });
        
        if (results.length > 10) {
            html += `
                <div class="search-result-more">
                    <span>+${results.length - 10} منتج إضافي</span>
                </div>
            `;
        }
        
        this.searchResults.innerHTML = html;
        this.addResultEventListeners();
    }
    
    // إضافة تأثير تمييز للنص
    highlightText(text, query) {
        if (!query) return text;
        
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }
    
    // إضافة مستمعي الأحداث للنتائج
    addResultEventListeners() {
        // النقر على نتيجة
        this.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.classList.contains('search-result-add')) {
                    const productId = item.dataset.id;
                    this.viewProduct(productId);
                }
            });
        });
        
        // إضافة إلى السلة من نتائج البحث
        this.searchResults.querySelectorAll('.search-result-add').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const productId = btn.dataset.id;
                
                if (window.cartManager) {
                    window.cartManager.addToCart(productId);
                    window.uiManager?.showNotification('تمت الإضافة', 'تم إضافة المنتج إلى السلة');
                    this.searchResults.style.display = 'none';
                    this.searchInput.value = '';
                }
            });
        });
    }
    
    // عرض المنتج
    viewProduct(productId) {
        const product = window.productsManager?.getProductById(productId);
        if (product && product.category) {
            // تبديل إلى الفئة المناسبة
            window.productsManager?.switchCategory(product.category);
            
            // تمرير إلى المنتج
            setTimeout(() => {
                const productElement = document.querySelector(`[data-id="${productId}"]`);
                if (productElement) {
                    productElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    productElement.classList.add('highlight-product');
                    setTimeout(() => {
                        productElement.classList.remove('highlight-product');
                    }, 2000);
                }
            }, 300);
            
            this.searchResults.style.display = 'none';
            this.searchInput.value = '';
        }
    }
    
    // فتح/إغلاق البحث
    toggleSearch() {
        if (this.searchContainer) {
            this.searchContainer.classList.toggle('active');
            if (this.searchContainer.classList.contains('active')) {
                this.searchInput.focus();
            }
        }
    }
    
    // مسح البحث
    clearSearch() {
        if (this.searchInput) {
            this.searchInput.value = '';
            this.searchResults.style.display = 'none';
            this.searchResults.innerHTML = '';
        }
    }
}

// تهيئة مدير البحث
window.searchManager = new SearchManager();
