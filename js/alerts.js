// نظام التنبيهات الشخصية

class AlertSystem {
    constructor() {
        this.alerts = this.loadAlerts();
        this.notifications = [];
        this.notificationArea = null;
        this.init();
    }
    
    init() {
        this.createNotificationArea();
        this.setupEventListeners();
        this.checkAlerts();
        this.setupAutoCheck();
        this.setupPushNotifications();
    }
    
    loadAlerts() {
        try {
            return JSON.parse(localStorage.getItem('product_alerts')) || [];
        } catch (error) {
            console.error('خطأ في تحميل التنبيهات:', error);
            return [];
        }
    }
    
    saveAlerts() {
        try {
            localStorage.setItem('product_alerts', JSON.stringify(this.alerts));
        } catch (error) {
            console.error('خطأ في حفظ التنبيهات:', error);
        }
    }
    
    createNotificationArea() {
        this.notificationArea = document.getElementById('notification-area');
        if (!this.notificationArea) {
            this.notificationArea = document.createElement('div');
            this.notificationArea.id = 'notification-area';
            this.notificationArea.className = 'notification-area';
            document.body.appendChild(this.notificationArea);
        }
    }
    
    setupEventListeners() {
        // طلب إذن الإشعارات
        if ('Notification' in window && Notification.permission === 'default') {
            setTimeout(() => {
                this.requestNotificationPermission();
            }, 3000);
        }
        
        // مراقبة تغيرات السعر
        this.setupPriceMonitoring();
        
        // مراقبة المخزون
        this.setupStockMonitoring();
    }
    
    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('✅ تم تفعيل الإشعارات');
                }
            });
        }
    }
    
    setupPriceMonitoring() {
        // مراقبة تغيرات السعر للعروض
        const originalRenderOffers = window.productsManager?.renderOffers;
        if (originalRenderOffers) {
            window.productsManager.renderOffers = function(...args) {
                const result = originalRenderOffers.apply(this, args);
                window.alertsManager?.checkPriceAlerts();
                return result;
            };
        }
    }
    
    setupStockMonitoring() {
        // مراقبة تغيرات المخزون
        const observer = new MutationObserver(() => {
            this.checkStockAlerts();
        });
        
        observer.observe(document.body, { 
            childList: true, 
            subtree: true 
        });
    }
    
    setupAutoCheck() {
        // التحقق من التنبيهات كل دقيقة
        setInterval(() => {
            this.checkAlerts();
        }, 60000);
        
        // التحقق من الإشعارات الجديدة كل 30 ثانية
        setInterval(() => {
            this.showRandomNotification();
        }, 30000);
    }
    
    setupPushNotifications() {
        // محاكاة إشعارات وهمية من الخادم
        this.setupMockServerNotifications();
    }
    
    setupMockServerNotifications() {
        // إشعارات وهمية للعرض
        const notifications = [
            {
                id: 'flash_sale_1',
                type: 'flash_sale',
                title: 'عرض خاطف!',
                message: 'خصم 50% على الإلكترونيات لمدة ساعة فقط',
                icon: 'fas fa-bolt',
                color: '#FF6B8B',
                action: {
                    type: 'navigate',
                    target: 'electronics'
                }
            },
            {
                id: 'new_arrival_1',
                type: 'new_arrival',
                title: 'وصل جديد!',
                message: 'منتجات جديدة في قسم الملابس',
                icon: 'fas fa-star',
                color: '#00D4AA',
                action: {
                    type: 'navigate',
                    target: 'clothing'
                }
            },
            {
                id: 'restock_alert_1',
                type: 'restock',
                title: 'عاد للمخزون!',
                message: 'المنتج الذي تتابعه متوفر الآن',
                icon: 'fas fa-box',
                color: '#3A36E0',
                action: {
                    type: 'navigate',
                    target: 'product'
                }
            }
        ];
        
        // إضافة بعض الإشعارات بعد فترة
        setTimeout(() => {
            if (Math.random() > 0.5) {
                const notification = notifications[Math.floor(Math.random() * notifications.length)];
                this.showRealTimeNotification(notification);
            }
        }, 15000);
    }
    
    createAlert(productId, condition) {
        const product = window.productsManager?.getProductById(productId);
        if (!product) {
            window.uiManager?.showNotification(
                'خطأ',
                'المنتج غير موجود',
                'error'
            );
            return null;
        }
        
        const alert = {
            id: `alert_${Date.now()}`,
            productId,
            productName: product.name,
            condition,
            createdAt: new Date().toISOString(),
            active: true,
            triggered: false
        };
        
        this.alerts.push(alert);
        this.saveAlerts();
        
        window.uiManager?.showNotification(
            'تم إنشاء التنبيه',
            `سيتم إعلامك عند ${this.getConditionText(condition)}`,
            'success'
        );
        
        return alert;
    }
    
    getConditionText(condition) {
        switch (condition.type) {
            case 'price_drop':
                return `انخفاض السعر إلى ${condition.targetPrice} ريال أو أقل`;
            case 'back_in_stock':
                return 'توفر المنتج في المخزون';
            case 'discount':
                return `وصول الخصم إلى ${condition.minDiscount}% أو أكثر`;
            case 'flash_sale':
                return 'بدء عرض خاطف على المنتج';
            default:
                return 'تغير حالة المنتج';
        }
    }
    
    removeAlert(alertId) {
        const index = this.alerts.findIndex(alert => alert.id === alertId);
        if (index > -1) {
            this.alerts.splice(index, 1);
            this.saveAlerts();
            return true;
        }
        return false;
    }
    
    checkAlerts() {
        const triggeredAlerts = [];
        
        this.alerts.forEach(alert => {
            if (!alert.active || alert.triggered) return;
            
            const product = window.productsManager?.getProductById(alert.productId);
            if (!product) return;
            
            let shouldTrigger = false;
            
            switch (alert.condition.type) {
                case 'price_drop':
                    if (product.price <= alert.condition.targetPrice) {
                        shouldTrigger = true;
                    }
                    break;
                case 'back_in_stock':
                    if (product.stock > 0) {
                        shouldTrigger = true;
                    }
                    break;
                case 'discount':
                    if (product.discount && product.discount >= alert.condition.minDiscount) {
                        shouldTrigger = true;
                    }
                    break;
                case 'flash_sale':
                    // محاكاة وجود عرض خاطف
                    if (Math.random() > 0.8) {
                        shouldTrigger = true;
                    }
                    break;
            }
            
            if (shouldTrigger) {
                alert.triggered = true;
                alert.triggeredAt = new Date().toISOString();
                triggeredAlerts.push(alert);
                
                this.triggerAlert(alert, product);
            }
        });
        
        // حفظ التحديثات
        if (triggeredAlerts.length > 0) {
            this.saveAlerts();
        }
    }
    
    checkPriceAlerts() {
        // التحقق من تنبيهات السعر للعروض
        const offers = window.productsManager?.products?.offers || [];
        
        offers.forEach(offer => {
            this.alerts.forEach(alert => {
                if (alert.active && 
                    !alert.triggered && 
                    alert.productId === offer.id && 
                    alert.condition.type === 'price_drop' &&
                    offer.price <= alert.condition.targetPrice) {
                    
                    alert.triggered = true;
                    alert.triggeredAt = new Date().toISOString();
                    this.triggerAlert(alert, offer);
                }
            });
        });
    }
    
    checkStockAlerts() {
        // التحقق من تنبيهات المخزون
        // هذه دالة محاكاة
        if (Math.random() > 0.9) {
            const product = this.getRandomProduct();
            if (product) {
                this.alerts.forEach(alert => {
                    if (alert.active && 
                        !alert.triggered && 
                        alert.productId === product.id && 
                        alert.condition.type === 'back_in_stock') {
                        
                        alert.triggered = true;
                        alert.triggeredAt = new Date().toISOString();
                        this.triggerAlert(alert, product);
                    }
                });
            }
        }
    }
    
    getRandomProduct() {
        const allProducts = [];
        const categories = window.productsManager?.products;
        
        if (categories) {
            Object.values(categories).forEach(categoryProducts => {
                allProducts.push(...categoryProducts);
            });
        }
        
        return allProducts.length > 0 ? 
            allProducts[Math.floor(Math.random() * allProducts.length)] : 
            null;
    }
    
    triggerAlert(alert, product) {
        // إنشاء إشعار
        const notification = {
            id: `notification_${Date.now()}`,
            type: 'alert_triggered',
            title: 'تنبيه منتج!',
            message: `${product.name}: ${this.getAlertTriggerMessage(alert, product)}`,
            icon: 'fas fa-bell',
            color: '#3A36E0',
            alertId: alert.id,
            productId: product.id,
            timestamp: Date.now()
        };
        
        // إظهار الإشعار
        this.showRealTimeNotification(notification);
        
        // إرسال إشعار المتصفح
        this.sendBrowserNotification(notification);
        
        // إضافة للسجل
        this.addToNotificationLog(notification);
    }
    
    getAlertTriggerMessage(alert, product) {
        switch (alert.condition.type) {
            case 'price_drop':
                return `انخفض السعر إلى ${product.price} ريال`;
            case 'back_in_stock':
                return 'عاد إلى المخزون!';
            case 'discount':
                return `الخصم الآن ${product.discount}%`;
            case 'flash_sale':
                return 'بدأ عرض خاطف!';
            default:
                return 'تم تنفيذ الشرط';
        }
    }
    
    showRealTimeNotification(notification) {
        const notificationEl = document.createElement('div');
        notificationEl.className = `real-time-notification ${notification.type}`;
        notificationEl.dataset.id = notification.id;
        
        notificationEl.innerHTML = `
            <div class="notification-icon" style="color: ${notification.color || '#3A36E0'}">
                <i class="${notification.icon || 'fas fa-bell'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <div class="notification-time">${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <button class="close-notification" data-id="${notification.id}">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // إضافة النقر للإجراء
        if (notification.action) {
            notificationEl.style.cursor = 'pointer';
            notificationEl.addEventListener('click', () => {
                this.handleNotificationAction(notification);
                notificationEl.remove();
            });
        }
        
        this.notificationArea.appendChild(notificationEl);
        
        // إضافة حدث الإغلاق
        notificationEl.querySelector('.close-notification').addEventListener('click', (e) => {
            e.stopPropagation();
            notificationEl.remove();
        });
        
        // إخفاء تلقائي بعد 10 ثواني
        setTimeout(() => {
            if (notificationEl.parentNode) {
                notificationEl.remove();
            }
        }, 10000);
        
        // حفظ في المصفوفة
        this.notifications.push(notification);
        
        // الاحتفاظ بآخر 50 إشعار فقط
        if (this.notifications.length > 50) {
            this.notifications = this.notifications.slice(-50);
        }
    }
    
    handleNotificationAction(notification) {
        switch (notification.action?.type) {
            case 'navigate':
                if (notification.action.target === 'product' && notification.productId) {
                    // الانتقال للمنتج
                    const product = window.productsManager?.getProductById(notification.productId);
                    if (product && product.category) {
                        window.productsManager?.switchCategory(product.category);
                    }
                } else if (notification.action.target) {
                    // الانتقال للفئة
                    window.productsManager?.switchCategory(notification.action.target);
                }
                break;
                
            case 'view_alert':
                this.showAlertDetails(notification.alertId);
                break;
                
            case 'add_to_cart':
                if (notification.productId) {
                    window.cartManager?.addToCart(notification.productId);
                }
                break;
        }
    }
    
    sendBrowserNotification(notification) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const browserNotification = new Notification(notification.title, {
                body: notification.message,
                icon: '/icon.png',
                tag: notification.id
            });
            
            browserNotification.onclick = () => {
                this.handleNotificationAction(notification);
            };
        }
    }
    
    addToNotificationLog(notification) {
        const log = JSON.parse(localStorage.getItem('notification_log') || '[]');
        log.push({
            ...notification,
            read: false,
            receivedAt: new Date().toISOString()
        });
        
        // الاحتفاظ بآخر 100 إشعار فقط
        if (log.length > 100) {
            log.shift();
        }
        
        localStorage.setItem('notification_log', JSON.stringify(log));
    }
    
    showRandomNotification() {
        if (Math.random() > 0.7) {
            const notifications = [
                {
                    id: `random_${Date.now()}`,
                    type: 'info',
                    title: '💡 نصيحة',
                    message: 'استخدم المفضلة لحفظ المنتجات التي تعجبك للرجوع إليها لاحقاً',
                    icon: 'fas fa-lightbulb',
                    color: '#FFD700'
                },
                {
                    id: `random_${Date.now() + 1}`,
                    type: 'reminder',
                    title: '🛒 تذكير',
                    message: 'لديك منتجات في سلة التسوق. لا تنس إتمام الشراء!',
                    icon: 'fas fa-shopping-cart',
                    color: '#3A36E0'
                },
                {
                    id: `random_${Date.now() + 2}`,
                    type: 'offer',
                    title: '🎁 عرض خاص',
                    message: 'اطلع على العروض الحصرية في قسم "العروض والخصومات"',
                    icon: 'fas fa-gift',
                    color: '#FF6B8B'
                }
            ];
            
            const notification = notifications[Math.floor(Math.random() * notifications.length)];
            this.showRealTimeNotification(notification);
        }
    }
    
    showAlertDetails(alertId) {
        const alert = this.alerts.find(a => a.id === alertId);
        if (!alert) return;
        
        const product = window.productsManager?.getProductById(alert.productId);
        
        const modal = document.createElement('div');
        modal.className = 'alert-details-modal';
        modal.innerHTML = `
            <div class="alert-details-content">
                <div class="alert-header">
                    <h3><i class="fas fa-bell"></i> تفاصيل التنبيه</h3>
                    <button class="close-alert-details">&times;</button>
                </div>
                
                <div class="alert-info">
                    <div class="alert-product">
                        <div class="product-image">${product?.image || '📦'}</div>
                        <div class="product-details">
                            <h4>${alert.productName}</h4>
                            <div class="product-category">${product ? window.productsManager?.getCategoryName(product.category) : ''}</div>
                        </div>
                    </div>
                    
                    <div class="alert-condition">
                        <h4>شرط التنبيه:</h4>
                        <div class="condition-details">
                            <i class="fas fa-info-circle"></i>
                            <span>${this.getConditionText(alert.condition)}</span>
                        </div>
                    </div>
                    
                    <div class="alert-status">
                        <h4>حالة التنبيه:</h4>
                        <div class="status-indicator ${alert.triggered ? 'triggered' : 'active'}">
                            <i class="fas fa-${alert.triggered ? 'check-circle' : 'clock'}"></i>
                            <span>${alert.triggered ? 'تم التنبيه' : 'نشط'}</span>
                        </div>
                    </div>
                    
                    ${alert.triggered ? `
                        <div class="alert-triggered">
                            <h4>تم التنبيه في:</h4>
                            <div class="triggered-date">
                                <i class="fas fa-calendar"></i>
                                <span>${new Date(alert.triggeredAt).toLocaleString('ar-SA')}</span>
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="alert-actions">
                    ${!alert.triggered ? `
                        <button class="edit-alert" data-alert-id="${alert.id}">
                            <i class="fas fa-edit"></i>
                            تعديل
                        </button>
                    ` : ''}
                    <button class="delete-alert" data-alert-id="${alert.id}">
                        <i class="fas fa-trash"></i>
                        حذف
                    </button>
                    <button class="create-similar-alert" data-product-id="${alert.productId}">
                        <i class="fas fa-plus-circle"></i>
                        إنشاء تنبيه مماثل
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إضافة الأحداث
        modal.querySelector('.close-alert-details').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.delete-alert').addEventListener('click', () => {
            if (confirm('هل تريد حذف هذا التنبيه؟')) {
                this.removeAlert(alert.id);
                modal.remove();
                window.uiManager?.showNotification(
                    'تم الحذف',
                    'تم حذف التنبيه بنجاح',
                    'info'
                );
            }
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    showAlertManager() {
        const modal = document.createElement('div');
        modal.className = 'alert-manager-modal';
        modal.innerHTML = `
            <div class="alert-manager-content">
                <div class="alert-manager-header">
                    <h3><i class="fas fa-bell"></i> إدارة التنبيهات</h3>
                    <button class="close-alert-manager">&times;</button>
                </div>
                
                <div class="alert-manager-body">
                    <div class="alerts-list">
                        ${this.alerts.length > 0 ? this.alerts.map(alert => this.renderAlertItem(alert)).join('') : `
                            <div class="no-alerts">
                                <i class="fas fa-bell-slash"></i>
                                <h4>لا توجد تنبيهات</h4>
                                <p>أنشئ تنبيهات للمنتجات التي تتابعها</p>
                            </div>
                        `}
                    </div>
                    
                    <div class="create-alert-section">
                        <h4><i class="fas fa-plus-circle"></i> إنشاء تنبيه جديد</h4>
                        <div class="create-alert-form">
                            <div class="form-group">
                                <label>المنتج:</label>
                                <select id="alert-product-select" class="form-select">
                                    <option value="">اختر منتجاً...</option>
                                    ${this.getAllProducts().map(product => `
                                        <option value="${product.id}">${product.name} - ${product.price} ريال</option>
                                    `).join('')}
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label>نوع التنبيه:</label>
                                <select id="alert-type-select" class="form-select">
                                    <option value="price_drop">انخفاض السعر</option>
                                    <option value="back_in_stock">العودة للمخزون</option>
                                    <option value="discount">وصول خصم</option>
                                </select>
                            </div>
                            
                            <div class="form-group" id="alert-condition-group">
                                <!-- سيتم ملؤه ديناميكياً -->
                            </div>
                            
                            <button class="create-new-alert" id="create-new-alert-btn">
                                <i class="fas fa-bell"></i>
                                إنشاء التنبيه
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إعداد النموذج
        this.setupAlertForm(modal);
        
        // إضافة الأحداث
        modal.querySelector('.close-alert-manager').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    renderAlertItem(alert) {
        const product = window.productsManager?.getProductById(alert.productId);
        
        return `
            <div class="alert-item ${alert.triggered ? 'triggered' : 'active'}" data-alert-id="${alert.id}">
                <div class="alert-item-icon">
                    <i class="fas fa-bell${alert.triggered ? '-slash' : ''}"></i>
                </div>
                <div class="alert-item-info">
                    <div class="alert-product-name">${alert.productName}</div>
                    <div class="alert-condition-text">${this.getConditionText(alert.condition)}</div>
                    <div class="alert-date">أنشئ في ${new Date(alert.createdAt).toLocaleDateString('ar-SA')}</div>
                </div>
                <div class="alert-item-actions">
                    <button class="view-alert-details" data-alert-id="${alert.id}">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="delete-alert-item" data-alert-id="${alert.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
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
    
    setupAlertForm(modal) {
        const productSelect = modal.querySelector('#alert-product-select');
        const typeSelect = modal.querySelector('#alert-type-select');
        const conditionGroup = modal.querySelector('#alert-condition-group');
        const createBtn = modal.querySelector('#create-new-alert-btn');
        
        const updateConditionInput = () => {
            const productId = productSelect.value;
            const alertType = typeSelect.value;
            
            if (!productId) {
                conditionGroup.innerHTML = '<p class="form-help">اختر منتجاً أولاً</p>';
                return;
            }
            
            const product = window.productsManager?.getProductById(productId);
            if (!product) return;
            
            switch (alertType) {
                case 'price_drop':
                    conditionGroup.innerHTML = `
                        <label>السعر المستهدف:</label>
                        <div class="price-input-group">
                            <input type="number" 
                                   id="target-price" 
                                   class="form-input" 
                                   min="0" 
                                   max="${product.price * 2}" 
                                   value="${Math.floor(product.price * 0.8)}"
                                   step="10">
                            <span>ريال أو أقل</span>
                        </div>
                        <p class="form-help">السعر الحالي: ${product.price} ريال</p>
                    `;
                    break;
                    
                case 'back_in_stock':
                    conditionGroup.innerHTML = `
                        <div class="stock-alert-info">
                            <i class="fas fa-info-circle"></i>
                            <p>سيتم إعلامك عند توفر هذا المنتج في المخزون</p>
                        </div>
                    `;
                    break;
                    
                case 'discount':
                    conditionGroup.innerHTML = `
                        <label>نسبة الخصم:</label>
                        <div class="discount-input-group">
                            <input type="number" 
                                   id="min-discount" 
                                   class="form-input" 
                                   min="5" 
                                   max="90" 
                                   value="20"
                                   step="5">
                            <span>% أو أكثر</span>
                        </div>
                        <p class="form-help">${product.discount ? `الخصم الحالي: ${product.discount}%` : 'لا يوجد خصم حالياً'}</p>
                    `;
                    break;
            }
        };
        
        productSelect.addEventListener('change', updateConditionInput);
        typeSelect.addEventListener('change', updateConditionInput);
        
        // التهيئة الأولية
        updateConditionInput();
        
        createBtn.addEventListener('click', () => {
            const productId = productSelect.value;
            const alertType = typeSelect.value;
            
            if (!productId) {
                window.uiManager?.showNotification(
                    'خطأ',
                    'يرجى اختيار منتج',
                    'error'
                );
                return;
            }
            
            const product = window.productsManager?.getProductById(productId);
            if (!product) return;
            
            let condition;
            
            switch (alertType) {
                case 'price_drop':
                    const targetPrice = parseInt(modal.querySelector('#target-price').value);
                    if (targetPrice <= 0 || targetPrice > product.price * 2) {
                        window.uiManager?.showNotification(
                            'خطأ',
                            'السعر غير صالح',
                            'error'
                        );
                        return;
                    }
                    condition = { type: 'price_drop', targetPrice };
                    break;
                    
                case 'back_in_stock':
                    condition = { type: 'back_in_stock' };
                    break;
                    
                case 'discount':
                    const minDiscount = parseInt(modal.querySelector('#min-discount').value);
                    if (minDiscount < 5 || minDiscount > 90) {
                        window.uiManager?.showNotification(
                            'خطأ',
                            'نسبة الخصم غير صالحة',
                            'error'
                        );
                        return;
                    }
                    condition = { type: 'discount', minDiscount };
                    break;
                    
                default:
                    return;
            }
            
            this.createAlert(productId, condition);
            modal.remove();
        });
    }
}

// تهيئة نظام التنبيهات
window.alertsManager = new AlertSystem();
