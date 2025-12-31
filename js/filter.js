// نظام التصفية والفرز المتقدم

class FilterManager {
    constructor() {
        this.filters = {
            priceRange: { min: 0, max: 10000 },
            categories: [],
            sortBy: 'default',
            inStock: false,
            rating: 0,
            searchTerm: ''
        };
        
        this.activeFilters = new Set();
        this.filterPanel = null;
        this.init();
    }
    
    init() {
        this.createFilterPanel();
        this.setupEventListeners();
        this.loadSavedFilters();
        this.applyInitialFilters();
    }
    
    createFilterPanel() {
        const filterSidebar = document.getElementById('filter-sidebar');
        if (!filterSidebar) return;
        
        // زر التصفية
        const filterToggle = document.getElementById('filter-toggle') || 
            this.createFilterToggle();
        
        // لوحة التصفية
        this.filterPanel = document.getElementById('filter-panel') || 
            this.createFilterPanelContent();
        
        filterSidebar.appendChild(filterToggle);
        filterSidebar.appendChild(this.filterPanel);
    }
    
    createFilterToggle() {
        const toggle = document.createElement('button');
        toggle.id = 'filter-toggle';
        toggle.className = 'filter-toggle';
        toggle.innerHTML = `
            <i class="fas fa-filter"></i>
            <span>التصفية والترتيب</span>
        `;
        return toggle;
    }
    
    createFilterPanelContent() {
        const panel = document.createElement('div');
        panel.id = 'filter-panel';
        panel.className = 'filter-panel';
        
        panel.innerHTML = `
            <div class="filter-section">
                <h4><i class="fas fa-filter"></i> التصفية</h4>
                
                <!-- البحث -->
                <div class="filter-group">
                    <label>البحث داخل الفئة:</label>
                    <div class="search-filter">
                        <input type="text" id="category-search" placeholder="ابحث عن منتج..." class="form-input">
                        <i class="fas fa-search"></i>
                    </div>
                </div>
                
                <!-- نطاق السعر -->
                <div class="filter-group">
                    <label>السعر:</label>
                    <div class="price-range">
                        <div class="price-inputs">
                            <input type="number" id="price-min" min="0" max="10000" value="0" placeholder="من">
                            <span>إلى</span>
                            <input type="number" id="price-max" min="0" max="10000" value="10000" placeholder="إلى">
                        </div>
                        <input type="range" id="price-range-min" min="0" max="10000" value="0" step="100">
                        <input type="range" id="price-range-max" min="0" max="10000" value="10000" step="100">
                        <div class="price-display">
                            <span id="min-price-display">0 ريال</span> - 
                            <span id="max-price-display">10000 ريال</span>
                        </div>
                    </div>
                </div>
                
                <!-- التصنيفات -->
                <div class="filter-group">
                    <label>التصنيفات:</label>
                    <div class="category-filters" id="category-filters"></div>
                </div>
                
                <!-- التقييم -->
                <div class="filter-group">
                    <label>التقييم:</label>
                    <div class="rating-filter">
                        ${[5,4,3,2,1].map(rating => `
                            <label class="rating-option">
                                <input type="radio" name="rating" value="${rating}">
                                <span class="stars">${this.generateStars(rating)}</span>
                                <span>${rating} فما فوق</span>
                            </label>
                        `).join('')}
                        <label class="rating-option">
                            <input type="radio" name="rating" value="0" checked>
                            <span>الكل</span>
                        </label>
                    </div>
                </div>
                
                <!-- المخزون -->
                <div class="filter-group">
                    <label class="checkbox-label">
                        <input type="checkbox" id="in-stock-only">
                        <span class="checkmark"></span>
                        المنتجات المتوفرة فقط
                    </label>
                </div>
            </div>
            
            <!-- الفرز -->
            <div class="filter-section">
                <h4><i class="fas fa-sort-amount-down"></i> الفرز</h4>
                <div class="filter-group">
                    <select id="sort-options" class="form-select">
                        <option value="default">الافتراضي</option>
                        <option value="price-low">السعر: من الأقل للأعلى</option>
                        <option value="price-high">السعر: من الأعلى للأقل</option>
                        <option value="rating">الأعلى تقييماً</option>
                        <option value="newest">الأحدث</option>
                        <option value="popular">الأكثر مبيعاً</option>
                        <option value="name-asc">الاسم: أ-ي</option>
                        <option value="name-desc">الاسم: ي-أ</option>
                    </select>
                </div>
            </div>
            
            <!-- الإجراءات -->
            <div class="filter-actions">
                <button class="apply-filters" id="apply-filters">
                    <i class="fas fa-check"></i>
                    تطبيق التصفية
                </button>
                <button class="reset-filters" id="reset-filters">
                    <i class="fas fa-redo"></i>
                    إعادة تعيين
                </button>
                <button class="save-filters" id="save-filters">
                    <i class="fas fa-save"></i>
                    حفظ
                </button>
            </div>
            
            <!-- الفلاتر النشطة -->
            <div class="active-filters" id="active-filters"></div>
        `;
        
        return panel;
    }
    
    setupEventListeners() {
        // تبديل لوحة التصفية
        document.getElementById('filter-toggle')?.addEventListener('click', () => {
            this.toggleFilterPanel();
        });
        
        // تطبيق التصفية
        document.getElementById('apply-filters')?.addEventListener('click', () => {
            this.updateFiltersFromUI();
            this.applyFilters();
        });
        
        // إعادة تعيين التصفية
        document.getElementById('reset-filters')?.addEventListener('click', () => {
            this.resetFilters();
        });
        
        // حفظ التصفية
        document.getElementById('save-filters')?.addEventListener('click', () => {
            this.saveFilters();
        });
        
        // البحث داخل الفئة
        document.getElementById('category-search')?.addEventListener('input', (e) => {
            this.filters.searchTerm = e.target.value;
            this.debouncedApplyFilters();
        });
        
        // نطاق السعر
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const rangeMin = document.getElementById('price-range-min');
        const rangeMax = document.getElementById('price-range-max');
        
        if (priceMin && priceMax && rangeMin && rangeMax) {
            [priceMin, priceMax, rangeMin, rangeMax].forEach(input => {
                input.addEventListener('input', () => {
                    this.updatePriceRange();
                    this.debouncedApplyFilters();
                });
            });
        }
        
        // التقييم
        document.querySelectorAll('input[name="rating"]').forEach(input => {
            input.addEventListener('change', () => {
                this.filters.rating = parseInt(input.value);
                this.debouncedApplyFilters();
            });
        });
        
        // المخزون
        document.getElementById('in-stock-only')?.addEventListener('change', (e) => {
            this.filters.inStock = e.target.checked;
            this.debouncedApplyFilters();
        });
        
        // الفرز
        document.getElementById('sort-options')?.addEventListener('change', (e) => {
            this.filters.sortBy = e.target.value;
            this.debouncedApplyFilters();
        });
    }
    
    debouncedApplyFilters = this.debounce(() => {
        this.applyFilters();
    }, 300);
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    toggleFilterPanel() {
        this.filterPanel.classList.toggle('active');
    }
    
    updateFiltersFromUI() {
        // تحديث القيم من واجهة المستخدم
        const priceMin = document.getElementById('price-min')?.value || 0;
        const priceMax = document.getElementById('price-max')?.value || 10000;
        
        this.filters.priceRange = {
            min: parseInt(priceMin),
            max: parseInt(priceMax)
        };
        
        // التصنيفات
        this.filters.categories = [];
        document.querySelectorAll('.category-filter:checked').forEach(checkbox => {
            this.filters.categories.push(checkbox.value);
        });
        
        // البحث
        this.filters.searchTerm = document.getElementById('category-search')?.value || '';
        
        // التقييم
        const ratingInput = document.querySelector('input[name="rating"]:checked');
        this.filters.rating = ratingInput ? parseInt(ratingInput.value) : 0;
        
        // المخزون
        this.filters.inStock = document.getElementById('in-stock-only')?.checked || false;
        
        // الفرز
        this.filters.sortBy = document.getElementById('sort-options')?.value || 'default';
    }
    
    updatePriceRange() {
        const priceMin = document.getElementById('price-min');
        const priceMax = document.getElementById('price-max');
        const rangeMin = document.getElementById('price-range-min');
        const rangeMax = document.getElementById('price-range-max');
        const minDisplay = document.getElementById('min-price-display');
        const maxDisplay = document.getElementById('max-price-display');
        
        if (priceMin && priceMax && rangeMin && rangeMax && minDisplay && maxDisplay) {
            // تحديث المدى من المدخلات
            priceMin.value = rangeMin.value;
            priceMax.value = rangeMax.value;
            
            // تحديث العرض
            minDisplay.textContent = `${rangeMin.value} ريال`;
            maxDisplay.textContent = `${rangeMax.value} ريال`;
        }
    }
    
    applyFilters() {
        const currentCategory = this.getCurrentCategory();
        if (!currentCategory) return;
        
        // تحديث الفلاتر النشطة
        this.updateActiveFilters();
        
        // تطبيق التصفية على المنتجات
        this.filterProducts(currentCategory);
    }
    
    filterProducts(categoryId) {
        let products = window.productsManager?.products[categoryId] || [];
        
        // تطبيق الفلاتر
        products = this.applySearchFilter(products);
        products = this.applyPriceFilter(products);
        products = this.applyCategoryFilter(products);
        products = this.applyRatingFilter(products);
        products = this.applyStockFilter(products);
        products = this.applySorting(products);
        
        // عرض المنتجات المصفاة
        this.displayFilteredProducts(categoryId, products);
        
        // تحديث العداد
        this.updateProductCount(categoryId, products.length);
        
        // حفظ التصفية الحالية
        this.saveCurrentFilters();
    }
    
    applySearchFilter(products) {
        if (!this.filters.searchTerm) return products;
        
        const term = this.filters.searchTerm.toLowerCase();
        return products.filter(product => 
            product.name.toLowerCase().includes(term) || 
            product.description.toLowerCase().includes(term)
        );
    }
    
    applyPriceFilter(products) {
        return products.filter(product => 
            product.price >= this.filters.priceRange.min && 
            product.price <= this.filters.priceRange.max
        );
    }
    
    applyCategoryFilter(products) {
        if (this.filters.categories.length === 0) return products;
        
        return products.filter(product => 
            this.filters.categories.includes(product.category)
        );
    }
    
    applyRatingFilter(products) {
        if (this.filters.rating === 0) return products;
        
        return products.filter(product => 
            product.rating >= this.filters.rating
        );
    }
    
    applyStockFilter(products) {
        if (!this.filters.inStock) return products;
        
        return products.filter(product => 
            product.stock > 0
        );
    }
    
    applySorting(products) {
        switch (this.filters.sortBy) {
            case 'price-low':
                return [...products].sort((a, b) => a.price - b.price);
            case 'price-high':
                return [...products].sort((a, b) => b.price - a.price);
            case 'rating':
                return [...products].sort((a, b) => b.rating - a.rating);
            case 'newest':
                return [...products].reverse();
            case 'popular':
                return [...products].sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
            case 'name-asc':
                return [...products].sort((a, b) => a.name.localeCompare(b.name));
            case 'name-desc':
                return [...products].sort((a, b) => b.name.localeCompare(a.name));
            default:
                return products;
        }
    }
    
    displayFilteredProducts(categoryId, products) {
        const categorySection = document.getElementById(categoryId);
        if (!categorySection) return;
        
        const productsGrid = categorySection.querySelector('.products-grid');
        if (!productsGrid) return;
        
        // إعادة عرض المنتجات
        if (categoryId === 'offers') {
            window.productsManager?.renderOffers();
        } else {
            window.productsManager?.renderProducts(categoryId);
        }
    }
    
    updateProductCount(categoryId, count) {
        const countElement = document.querySelector(`#${categoryId} .products-count`);
        if (countElement) {
            countElement.textContent = `${count} منتج`;
        }
    }
    
    updateActiveFilters() {
        const container = document.getElementById('active-filters');
        if (!container) return;
        
        const activeFilters = [];
        
        // سعر
        if (this.filters.priceRange.min > 0 || this.filters.priceRange.max < 10000) {
            activeFilters.push({
                type: 'price',
                label: `السعر: ${this.filters.priceRange.min} - ${this.filters.priceRange.max} ريال`,
                clear: () => {
                    this.filters.priceRange = { min: 0, max: 10000 };
                    this.applyFilters();
                }
            });
        }
        
        // تصنيفات
        if (this.filters.categories.length > 0) {
            activeFilters.push({
                type: 'category',
                label: `${this.filters.categories.length} تصنيف`,
                clear: () => {
                    this.filters.categories = [];
                    this.applyFilters();
                }
            });
        }
        
        // تقييم
        if (this.filters.rating > 0) {
            activeFilters.push({
                type: 'rating',
                label: `${this.filters.rating}+ نجوم`,
                clear: () => {
                    this.filters.rating = 0;
                    this.applyFilters();
                }
            });
        }
        
        // مخزون
        if (this.filters.inStock) {
            activeFilters.push({
                type: 'stock',
                label: 'متوفر فقط',
                clear: () => {
                    this.filters.inStock = false;
                    this.applyFilters();
                }
            });
        }
        
        // بحث
        if (this.filters.searchTerm) {
            activeFilters.push({
                type: 'search',
                label: `بحث: "${this.filters.searchTerm}"`,
                clear: () => {
                    this.filters.searchTerm = '';
                    this.applyFilters();
                }
            });
        }
        
        // عرض الفلاتر النشطة
        if (activeFilters.length > 0) {
            container.innerHTML = `
                <h5>الفلاتر النشطة:</h5>
                <div class="active-filters-list">
                    ${activeFilters.map(filter => `
                        <span class="active-filter" data-type="${filter.type}">
                            ${filter.label}
                            <button class="remove-filter" data-type="${filter.type}">
                                <i class="fas fa-times"></i>
                            </button>
                        </span>
                    `).join('')}
                    <button class="clear-all-filters" id="clear-all-filters">
                        مسح الكل
                    </button>
                </div>
            `;
            
            // إضافة الأحداث
            container.querySelectorAll('.remove-filter').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const type = e.currentTarget.dataset.type;
                    const filter = activeFilters.find(f => f.type === type);
                    if (filter) filter.clear();
                });
            });
            
            container.querySelector('#clear-all-filters')?.addEventListener('click', () => {
                this.resetFilters();
            });
            
            container.style.display = 'block';
        } else {
            container.style.display = 'none';
        }
    }
    
    resetFilters() {
        this.filters = {
            priceRange: { min: 0, max: 10000 },
            categories: [],
            sortBy: 'default',
            inStock: false,
            rating: 0,
            searchTerm: ''
        };
        
        // تحديث واجهة المستخدم
        this.updateUIFromFilters();
        this.applyFilters();
        
        window.uiManager?.showNotification(
            'تم إعادة التعيين',
            'تمت إعادة تعيين جميع الفلاتر',
            'info'
        );
    }
    
    updateUIFromFilters() {
        // تحديث واجهة المستخدم بناءً على القيم الحالية
        document.getElementById('price-min').value = this.filters.priceRange.min;
        document.getElementById('price-max').value = this.filters.priceRange.max;
        document.getElementById('price-range-min').value = this.filters.priceRange.min;
        document.getElementById('price-range-max').value = this.filters.priceRange.max;
        document.getElementById('category-search').value = this.filters.searchTerm;
        document.getElementById('in-stock-only').checked = this.filters.inStock;
        document.getElementById('sort-options').value = this.filters.sortBy;
        
        // التقييم
        document.querySelector(`input[name="rating"][value="${this.filters.rating}"]`).checked = true;
        
        // تحديث عرض السعر
        this.updatePriceDisplay();
    }
    
    updatePriceDisplay() {
        const minDisplay = document.getElementById('min-price-display');
        const maxDisplay = document.getElementById('max-price-display');
        
        if (minDisplay && maxDisplay) {
            minDisplay.textContent = `${this.filters.priceRange.min} ريال`;
            maxDisplay.textContent = `${this.filters.priceRange.max} ريال`;
        }
    }
    
    loadSavedFilters() {
        try {
            const saved = JSON.parse(localStorage.getItem('saved_filters'));
            if (saved) {
                this.filters = { ...this.filters, ...saved };
                this.updateUIFromFilters();
            }
        } catch (error) {
            console.error('خطأ في تحميل الفلاتر المحفوظة:', error);
        }
    }
    
    saveFilters() {
        try {
            localStorage.setItem('saved_filters', JSON.stringify(this.filters));
            window.uiManager?.showNotification(
                'تم الحفظ',
                'تم حفظ إعدادات التصفية',
                'success'
            );
        } catch (error) {
            console.error('خطأ في حفظ الفلاتر:', error);
            window.uiManager?.showNotification(
                'خطأ في الحفظ',
                'تعذر حفظ إعدادات التصفية',
                'error'
            );
        }
    }
    
    saveCurrentFilters() {
        // حفظ التصفية الحالية للفئة الحالية
        const currentCategory = this.getCurrentCategory();
        if (currentCategory) {
            try {
                const categoryFilters = JSON.parse(localStorage.getItem('category_filters') || '{}');
                categoryFilters[currentCategory] = this.filters;
                localStorage.setItem('category_filters', JSON.stringify(categoryFilters));
            } catch (error) {
                console.error('خطأ في حفظ تصفية الفئة:', error);
            }
        }
    }
    
    loadCategoryFilters(categoryId) {
        try {
            const categoryFilters = JSON.parse(localStorage.getItem('category_filters') || '{}');
            if (categoryFilters[categoryId]) {
                this.filters = { ...this.filters, ...categoryFilters[categoryId] };
                this.updateUIFromFilters();
                return true;
            }
        } catch (error) {
            console.error('خطأ في تحميل تصفية الفئة:', error);
        }
        return false;
    }
    
    getCurrentCategory() {
        const activeSection = document.querySelector('.category-section.active');
        return activeSection ? activeSection.id : null;
    }
    
    generateStars(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars += '<i class="fas fa-star"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        return stars;
    }
    
    applyInitialFilters() {
        // تطبيق التصفية عند تغيير الفئة
        const observer = new MutationObserver(() => {
            const currentCategory = this.getCurrentCategory();
            if (currentCategory && !this.activeFilters.has(currentCategory)) {
                this.loadCategoryFilters(currentCategory);
                this.applyFilters();
                this.activeFilters.add(currentCategory);
            }
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });
    }
}

// تهيئة مدير التصفية
window.filterManager = new FilterManager();
