// لوحة تحكم المستخدم

class UserDashboard {
    constructor() {
        this.stats = {};
        this.orders = [];
        this.recentActivity = [];
        this.charts = {};
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupCharts();
        this.setupAutoRefresh();
    }
    
    loadData() {
        this.loadStats();
        this.loadOrders();
        this.loadRecentActivity();
    }
    
    loadStats() {
        const orderHistory = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        const cartHistory = JSON.parse(localStorage.getItem('user_behavior') || '{}');
        
        this.stats = {
            totalOrders: orderHistory.length,
            totalSpent: this.calculateTotalSpent(orderHistory),
            averageOrderValue: this.calculateAverageOrderValue(orderHistory),
            favoriteCategory: this.getFavoriteCategory(orderHistory),
            wishlistItems: wishlist.length,
            cartAdditions: cartHistory.addedToCart?.length || 0,
            lastOrderDate: this.getLastOrderDate(orderHistory),
            daysAsCustomer: this.getDaysAsCustomer(orderHistory)
        };
    }
    
    calculateTotalSpent(orders) {
        return orders.reduce((total, order) => total + (order.total || 0), 0);
    }
    
    calculateAverageOrderValue(orders) {
        if (orders.length === 0) return 0;
        return this.calculateTotalSpent(orders) / orders.length;
    }
    
    getFavoriteCategory(orders) {
        if (orders.length === 0) return 'لا توجد بيانات';
        
        const categoryCount = {};
        orders.forEach(order => {
            if (order.cart && Array.isArray(order.cart)) {
                order.cart.forEach(item => {
                    if (item.category) {
                        categoryCount[item.category] = (categoryCount[item.category] || 0) + 1;
                    }
                });
            }
        });
        
        const favorite = Object.entries(categoryCount)
            .sort((a, b) => b[1] - a[1])[0];
        
        return favorite ? window.productsManager?.getCategoryName(favorite[0]) || favorite[0] : 'غير محدد';
    }
    
    getLastOrderDate(orders) {
        if (orders.length === 0) return 'لا توجد طلبات';
        
        const lastOrder = orders[orders.length - 1];
        return new Date(lastOrder.date).toLocaleDateString('ar-SA');
    }
    
    getDaysAsCustomer(orders) {
        if (orders.length === 0) return 0;
        
        const firstOrder = new Date(orders[0].date);
        const today = new Date();
        const diffTime = Math.abs(today - firstOrder);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    
    loadOrders() {
        this.orders = JSON.parse(localStorage.getItem('orderHistory') || '[]')
            .slice(-10) // آخر 10 طلبات فقط
            .reverse();
    }
    
    loadRecentActivity() {
        const activity = [];
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        
        // نشاط السلة
        const cartActivity = JSON.parse(localStorage.getItem('user_behavior') || '{}');
        if (cartActivity.addedToCart) {
            cartActivity.addedToCart.slice(-5).forEach(item => {
                if (now - item.timestamp < oneDay * 7) { // آخر 7 أيام
                    activity.push({
                        type: 'cart_add',
                        title: 'إضافة منتج للسلة',
                        description: this.getProductName(item.productId),
                        timestamp: item.timestamp,
                        icon: 'fas fa-cart-plus'
                    });
                }
            });
        }
        
        // نشاط المفضلة
        const wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
        wishlist.slice(-3).forEach(item => {
            if (now - new Date(item.addedAt).getTime() < oneDay * 7) {
                activity.push({
                    type: 'wishlist_add',
                    title: 'إضافة للمفضلة',
                    description: item.name,
                    timestamp: new Date(item.addedAt).getTime(),
                    icon: 'fas fa-heart'
                });
            }
        });
        
        // نشاط الطلبات
        this.orders.slice(0, 3).forEach(order => {
            activity.push({
                type: 'order',
                title: 'طلب جديد',
                description: `طلب #${order.id.slice(-6)}`,
                timestamp: new Date(order.date).getTime(),
                icon: 'fas fa-shopping-bag'
            });
        });
        
        // ترتيب حسب التاريخ
        this.recentActivity = activity.sort((a, b) => b.timestamp - a.timestamp).slice(0, 10);
    }
    
    getProductName(productId) {
        const product = window.productsManager?.getProductById(productId);
        return product ? product.name : 'منتج';
    }
    
    setupEventListeners() {
        // رابط لوحة التحكم في الفوتر
        document.getElementById('dashboard-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDashboard();
        });
        
        // إغلاق لوحة التحكم
        document.addEventListener('click', (e) => {
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection && 
                dashboardSection.style.display === 'block' &&
                !dashboardSection.contains(e.target) &&
                !e.target.closest('#dashboard-link')) {
                this.hideDashboard();
            }
        });
    }
    
    showDashboard() {
        // إخفاء الأقسام الأخرى
        document.querySelectorAll('.category-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // إظهار لوحة التحكم
        const dashboardSection = document.getElementById('dashboard-section');
        if (!dashboardSection) {
            this.createDashboardSection();
        } else {
            dashboardSection.style.display = 'block';
        }
        
        // تحديث البيانات
        this.refreshDashboard();
        
        // التمرير للأعلى
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    hideDashboard() {
        const dashboardSection = document.getElementById('dashboard-section');
        if (dashboardSection) {
            dashboardSection.style.display = 'none';
        }
        
        // إعادة عرض صفحة العروض
        const offersSection = document.getElementById('offers');
        if (offersSection) {
            offersSection.classList.add('active');
        }
    }
    
    createDashboardSection() {
        const section = document.createElement('section');
        section.id = 'dashboard-section';
        section.className = 'dashboard-section';
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.appendChild(section);
        }
        
        this.renderDashboard();
    }
    
    renderDashboard() {
        const section = document.getElementById('dashboard-section');
        if (!section) return;
        
        section.innerHTML = `
            <div class="user-dashboard">
                <!-- الرأس -->
                <div class="dashboard-header">
                    <div>
                        <h2><i class="fas fa-chart-line"></i> لوحة التحكم</h2>
                        <p class="dashboard-subtitle">مرحباً بك في مركز إحصائياتك الشخصية</p>
                    </div>
                    <div class="dashboard-actions">
                        <button class="refresh-dashboard" id="refresh-dashboard">
                            <i class="fas fa-sync-alt"></i>
                            تحديث
                        </button>
                        <button class="export-dashboard" id="export-dashboard">
                            <i class="fas fa-download"></i>
                            تصدير
                        </button>
                        <button class="close-dashboard" id="close-dashboard">
                            <i class="fas fa-times"></i>
                            إغلاق
                        </button>
                    </div>
                </div>
                
                <!-- الإحصائيات -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon total-orders">
                            <i class="fas fa-shopping-bag"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.totalOrders}</h3>
                            <p>إجمالي الطلبات</p>
                            <small>${this.stats.lastOrderDate}</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon total-spent">
                            <i class="fas fa-money-bill-wave"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.totalSpent.toFixed(2)}</h3>
                            <p>إجمالي المشتريات</p>
                            <small>ريال سعودي</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon avg-order">
                            <i class="fas fa-calculator"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.averageOrderValue.toFixed(2)}</h3>
                            <p>متوسط قيمة الطلب</p>
                            <small>ريال سعودي</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon favorite-cat">
                            <i class="fas fa-star"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.favoriteCategory}</h3>
                            <p>الفئة المفضلة</p>
                            <small>بناءً على مشترياتك</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon wishlist">
                            <i class="fas fa-heart"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.wishlistItems}</h3>
                            <p>عناصر المفضلة</p>
                            <small>المنتجات المفضلة</small>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon customer-days">
                            <i class="fas fa-calendar"></i>
                        </div>
                        <div class="stat-info">
                            <h3>${this.stats.daysAsCustomer}</h3>
                            <p>يوم كعميل</p>
                            <small>منذ أول طلب</small>
                        </div>
                    </div>
                </div>
                
                <!-- المخططات -->
                <div class="dashboard-charts">
                    <div class="chart-container">
                        <h4><i class="fas fa-chart-pie"></i> توزيع المشتريات</h4>
                        <canvas id="purchase-distribution-chart"></canvas>
                    </div>
                    
                    <div class="chart-container">
                        <h4><i class="fas fa-chart-bar"></i> نشاط الشراء</h4>
                        <canvas id="purchase-activity-chart"></canvas>
                    </div>
                </div>
                
                <div class="dashboard-content">
                    <!-- الطلبات الأخيرة -->
                    <div class="recent-orders">
                        <div class="section-header">
                            <h4><i class="fas fa-history"></i> الطلبات الأخيرة</h4>
                            <a href="#" id="view-all-orders">عرض الكل</a>
                        </div>
                        
                        <div class="orders-list">
                            ${this.orders.length > 0 ? this.renderOrdersList() : `
                                <div class="empty-orders">
                                    <i class="fas fa-shopping-bag"></i>
                                    <p>لا توجد طلبات سابقة</p>
                                </div>
                            `}
                        </div>
                    </div>
                    
                    <!-- النشاط الأخير -->
                    <div class="recent-activity">
                        <div class="section-header">
                            <h4><i class="fas fa-bell"></i> النشاط الأخير</h4>
                        </div>
                        
                        <div class="activity-list">
                            ${this.recentActivity.length > 0 ? this.renderActivityList() : `
                                <div class="empty-activity">
                                    <i class="fas fa-history"></i>
                                    <p>لا توجد أنشطة حديثة</p>
                                </div>
                            `}
                        </div>
                    </div>
                </div>
                
                <!-- التوصيات الشخصية -->
                <div class="personal-recommendations">
                    <div class="section-header">
                        <h4><i class="fas fa-lightbulb"></i> توصيات مخصصة لك</h4>
                    </div>
                    
                    <div class="recommendations-list" id="personal-recommendations">
                        ${this.renderPersonalRecommendations()}
                    </div>
                </div>
            </div>
        `;
        
        // إضافة الأحداث
        this.setupDashboardEvents();
        
        // رسم المخططات
        this.renderCharts();
    }
    
    renderOrdersList() {
        return this.orders.map(order => `
            <div class="order-item">
                <div class="order-header">
                    <span class="order-id">#${order.id.slice(-6)}</span>
                    <span class="order-date">${new Date(order.date).toLocaleDateString('ar-SA')}</span>
                </div>
                <div class="order-details">
                    <div class="order-items">
                        ${order.cart ? `${order.cart.length} منتج` : 'تفاصيل غير متاحة'}
                    </div>
                    <div class="order-total">
                        ${order.total ? `${order.total.toFixed(2)} ريال` : ''}
                    </div>
                </div>
                <div class="order-status ${order.status || 'pending'}">
                    ${this.getStatusText(order.status)}
                </div>
            </div>
        `).join('');
    }
    
    getStatusText(status) {
        const statuses = {
            'pending': 'قيد الانتظار',
            'processing': 'قيد المعالجة',
            'shipped': 'تم الشحن',
            'delivered': 'تم التوصيل',
            'cancelled': 'ملغي'
        };
        
        return statuses[status] || 'قيد الانتظار';
    }
    
    renderActivityList() {
        return this.recentActivity.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${this.getTimeAgo(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }
    
    getTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        
        if (days > 0) return `قبل ${days} يوم`;
        if (hours > 0) return `قبل ${hours} ساعة`;
        if (minutes > 0) return `قبل ${minutes} دقيقة`;
        return 'الآن';
    }
    
    renderPersonalRecommendations() {
        // استخدام نظام التوصيات إذا كان متاحاً
        if (window.recommendationsManager) {
            const recommendations = window.recommendationsManager.recommendations.slice(0, 4);
            
            if (recommendations.length > 0) {
                return recommendations.map(product => `
                    <div class="recommendation-item" data-id="${product.id}">
                        <div class="recommendation-image">
                            ${product.image}
                        </div>
                        <div class="recommendation-info">
                            <div class="recommendation-name">${product.name}</div>
                            <div class="recommendation-price">${product.price} ريال</div>
                        </div>
                        <button class="add-to-cart-dashboard" data-id="${product.id}">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                `).join('');
            }
        }
        
        return `
            <div class="no-recommendations">
                <i class="fas fa-info-circle"></i>
                <p>ابدأ التسوق لتحصل على توصيات مخصصة</p>
            </div>
        `;
    }
    
    setupDashboardEvents() {
        // تحديث اللوحة
        document.getElementById('refresh-dashboard')?.addEventListener('click', () => {
            this.refreshDashboard();
        });
        
        // تصدير البيانات
        document.getElementById('export-dashboard')?.addEventListener('click', () => {
            this.exportDashboardData();
        });
        
        // إغلاق اللوحة
        document.getElementById('close-dashboard')?.addEventListener('click', () => {
            this.hideDashboard();
        });
        
        // عرض جميع الطلبات
        document.getElementById('view-all-orders')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showAllOrders();
        });
        
        // إضافة للسلة من التوصيات
        document.querySelectorAll('.add-to-cart-dashboard').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = e.currentTarget.dataset.id;
                window.cartManager?.addToCart(productId);
                
                // تأثير
                e.currentTarget.innerHTML = '<i class="fas fa-check"></i>';
                e.currentTarget.classList.add('added');
                setTimeout(() => {
                    e.currentTarget.innerHTML = '<i class="fas fa-cart-plus"></i>';
                    e.currentTarget.classList.remove('added');
                }, 1000);
            });
        });
    }
    
    refreshDashboard() {
        this.loadData();
        this.renderDashboard();
        
        window.uiManager?.showNotification(
            'تم التحديث',
            'تم تحديث بيانات لوحة التحكم',
            'success'
        );
    }
    
    setupCharts() {
        // سيتم رسم المخططات عند عرض اللوحة
    }
    
    renderCharts() {
        this.renderPurchaseDistributionChart();
        this.renderPurchaseActivityChart();
    }
    
    renderPurchaseDistributionChart() {
        const canvas = document.getElementById('purchase-distribution-chart');
        if (!canvas) return;
        
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const categoryTotals = {};
        
        orders.forEach(order => {
            if (order.cart && Array.isArray(order.cart)) {
                order.cart.forEach(item => {
                    if (item.category) {
                        categoryTotals[item.category] = (categoryTotals[item.category] || 0) + 1;
                    }
                });
            }
        });
        
        const categories = Object.keys(categoryTotals);
        const counts = Object.values(categoryTotals);
        
        // ألوان المخطط
        const colors = [
            'rgba(58, 54, 224, 0.8)',
            'rgba(255, 107, 139, 0.8)',
            'rgba(0, 212, 170, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(16, 185, 129, 0.8)'
        ];
        
        // رسم المخطط الدائري
        const ctx = canvas.getContext('2d');
        
        // إذا كان هناك مخطط سابق، قم بتدميره
        if (this.charts.purchaseDistribution) {
            this.charts.purchaseDistribution.destroy();
        }
        
        this.charts.purchaseDistribution = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: categories.map(cat => window.productsManager?.getCategoryName(cat) || cat),
                datasets: [{
                    data: counts,
                    backgroundColor: colors.slice(0, categories.length),
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            },
                            color: 'var(--text)'
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
                        },
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} منتج (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    renderPurchaseActivityChart() {
        const canvas = document.getElementById('purchase-activity-chart');
        if (!canvas) return;
        
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        const now = new Date();
        const last30Days = [];
        
        // إعداد بيانات آخر 30 يوم
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(now.getDate() - i);
            last30Days.push({
                date: date.toISOString().split('T')[0],
                count: 0,
                total: 0
            });
        }
        
        // حساب الطلبات لكل يوم
        orders.forEach(order => {
            const orderDate = new Date(order.date).toISOString().split('T')[0];
            const dayData = last30Days.find(d => d.date === orderDate);
            
            if (dayData) {
                dayData.count++;
                dayData.total += order.total || 0;
            }
        });
        
        // تحضير البيانات للمخطط
        const dates = last30Days.map(d => {
            const date = new Date(d.date);
            return `${date.getDate()}/${date.getMonth() + 1}`;
        });
        
        const orderCounts = last30Days.map(d => d.count);
        const orderTotals = last30Days.map(d => d.total / 100); // تحويل لمئات الريالات
        
        // رسم المخطط
        const ctx = canvas.getContext('2d');
        
        if (this.charts.purchaseActivity) {
            this.charts.purchaseActivity.destroy();
        }
        
        this.charts.purchaseActivity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [
                    {
                        label: 'عدد الطلبات',
                        data: orderCounts,
                        borderColor: 'rgba(58, 54, 224, 1)',
                        backgroundColor: 'rgba(58, 54, 224, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'قيمة الطلبات (مئات الريالات)',
                        data: orderTotals,
                        borderColor: 'rgba(255, 107, 139, 1)',
                        backgroundColor: 'rgba(255, 107, 139, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top',
                        rtl: true,
                        labels: {
                            font: {
                                family: 'Cairo',
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        rtl: true,
                        titleFont: {
                            family: 'Cairo'
                        },
                        bodyFont: {
                            family: 'Cairo'
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            font: {
                                family: 'Cairo'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'عدد الطلبات',
                            font: {
                                family: 'Cairo'
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'القيمة (مئات الريالات)',
                            font: {
                                family: 'Cairo'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        }
                    }
                }
            }
        });
    }
    
    showAllOrders() {
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]').reverse();
        
        const modal = document.createElement('div');
        modal.className = 'orders-modal';
        modal.innerHTML = `
            <div class="orders-content">
                <div class="orders-header">
                    <h3><i class="fas fa-history"></i> جميع الطلبات</h3>
                    <button class="close-orders">&times;</button>
                </div>
                <div class="orders-list-modal">
                    ${orders.length > 0 ? orders.map(order => `
                        <div class="order-details-modal">
                            <div class="order-header-modal">
                                <div>
                                    <strong>طلب #${order.id.slice(-6)}</strong>
                                    <div class="order-date-modal">${new Date(order.date).toLocaleString('ar-SA')}</div>
                                </div>
                                <div class="order-status-modal ${order.status || 'pending'}">
                                    ${this.getStatusText(order.status)}
                                </div>
                            </div>
                            
                            <div class="order-items-modal">
                                ${order.cart ? order.cart.map(item => `
                                    <div class="order-item-modal">
                                        <div class="item-name">${item.name}</div>
                                        <div class="item-quantity">${item.quantity} × ${item.price} ريال</div>
                                        <div class="item-total">${(item.quantity * item.price).toFixed(2)} ريال</div>
                                    </div>
                                `).join('') : ''}
                            </div>
                            
                            <div class="order-summary-modal">
                                <div class="summary-row">
                                    <span>المجموع:</span>
                                    <span>${order.total ? `${order.total.toFixed(2)} ريال` : ''}</span>
                                </div>
                                ${order.address ? `
                                    <div class="summary-row">
                                        <span>العنوان:</span>
                                        <span>${order.address}</span>
                                    </div>
                                ` : ''}
                                ${order.payment ? `
                                    <div class="summary-row">
                                        <span>طريقة الدفع:</span>
                                        <span>${order.payment}</span>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="empty-orders-modal">
                            <i class="fas fa-shopping-bag"></i>
                            <p>لا توجد طلبات سابقة</p>
                        </div>
                    `}
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الأحداث
        modal.querySelector('.close-orders').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    exportDashboardData() {
        const data = {
            stats: this.stats,
            orders: this.orders,
            recentActivity: this.recentActivity,
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dashboard-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        window.uiManager?.showNotification(
            'تم التصدير',
            'تم تصدير بيانات لوحة التحكم بنجاح',
            'success'
        );
    }
    
    setupAutoRefresh() {
        // تحديث اللوحة تلقائياً كل 5 دقائق إذا كانت مفتوحة
        setInterval(() => {
            const dashboardSection = document.getElementById('dashboard-section');
            if (dashboardSection && dashboardSection.style.display === 'block') {
                this.refreshDashboard();
            }
        }, 5 * 60 * 1000);
    }
}

// تهيئة لوحة التحكم
window.dashboardManager = new UserDashboard();
