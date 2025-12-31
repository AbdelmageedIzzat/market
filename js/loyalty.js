// نظام الولاء والمكافآت

class LoyaltyProgram {
    constructor() {
        this.points = 0;
        this.level = 'bronze';
        this.rewards = [];
        this.history = [];
        this.usePointsForOrder = false;
        this.init();
    }
    
    init() {
        this.loadPoints();
        this.loadRewards();
        this.loadHistory();
        this.setupEventListeners();
        this.updateLoyaltyDisplay();
        this.setupAutoPoints();
    }
    
    loadPoints() {
        try {
            const data = JSON.parse(localStorage.getItem('loyalty_data'));
            if (data) {
                this.points = data.points || 0;
                this.level = data.level || 'bronze';
                this.lastUpdated = data.lastUpdated;
            }
        } catch (error) {
            console.error('خطأ في تحميل نقاط الولاء:', error);
        }
        
        // حساب المستوى بناءً على النقاط
        this.calculateLevel();
    }
    
    calculateLevel() {
        const points = this.points;
        
        if (points >= 1000) {
            this.level = 'platinum';
        } else if (points >= 500) {
            this.level = 'gold';
        } else if (points >= 100) {
            this.level = 'silver';
        } else {
            this.level = 'bronze';
        }
    }
    
    loadRewards() {
        this.rewards = [
            {
                id: 'free_shipping',
                name: 'توصيل مجاني',
                description: 'توصيل مجاني لطلبتك القادمة',
                cost: 50,
                icon: 'fas fa-shipping-fast',
                category: 'shipping'
            },
            {
                id: 'discount_10',
                name: 'خصم 10%',
                description: 'خصم 10% على طلبتك القادمة',
                cost: 100,
                icon: 'fas fa-percentage',
                category: 'discount'
            },
            {
                id: 'gift_product',
                name: 'هدية مجانية',
                description: 'منتج هدية من اختيار المتجر',
                cost: 200,
                icon: 'fas fa-gift',
                category: 'gift'
            },
            {
                id: 'early_access',
                name: 'وصول مبكر',
                description: 'وصول مبكر للعروض الجديدة',
                cost: 150,
                icon: 'fas fa-clock',
                category: 'access'
            },
            {
                id: 'double_points',
                name: 'نقاط مزدوجة',
                description: 'نقاط مزدوجة على مشترياتك ليوم كامل',
                cost: 300,
                icon: 'fas fa-coins',
                category: 'points'
            }
        ];
    }
    
    loadHistory() {
        try {
            this.history = JSON.parse(localStorage.getItem('loyalty_history')) || [];
        } catch (error) {
            console.error('خطأ في تحميل سجل الولاء:', error);
            this.history = [];
        }
    }
    
    setupEventListeners() {
        // حدث استخدام نقاط في الطلب
        document.addEventListener('DOMContentLoaded', () => {
            const usePointsCheckbox = document.getElementById('use-loyalty-points');
            if (usePointsCheckbox) {
                usePointsCheckbox.addEventListener('change', (e) => {
                    this.usePointsForOrder = e.target.checked;
                    this.updatePointsDisplay();
                });
            }
        });
        
        // حدث مطالبة بالمكافأة
        document.addEventListener('click', (e) => {
            if (e.target.closest('.claim-reward')) {
                const rewardId = e.target.closest('.claim-reward').dataset.rewardId;
                this.claimReward(rewardId);
            }
        });
    }
    
    addPoints(amount, reason, details = {}) {
        const multiplier = this.getLevelMultiplier();
        const totalPoints = Math.floor(amount * multiplier);
        
        this.points += totalPoints;
        this.calculateLevel();
        
        // تسجيل في السجل
        const historyEntry = {
            type: 'points_added',
            points: totalPoints,
            reason,
            details,
            multiplier,
            date: new Date().toISOString()
        };
        
        this.history.push(historyEntry);
        
        // الاحتفاظ بآخر 100 إدخال فقط
        if (this.history.length > 100) {
            this.history = this.history.slice(-100);
        }
        
        // حفظ البيانات
        this.saveData();
        
        // تحديث العرض
        this.updateLoyaltyDisplay();
        
        // التحقق من المكافآت الجديدة
        this.checkForNewRewards();
        
        // إظهار إشعار
        this.showPointsNotification(totalPoints, reason);
        
        return {
            points: totalPoints,
            multiplier,
            newTotal: this.points,
            newLevel: this.level
        };
    }
    
    getLevelMultiplier() {
        const multipliers = {
            bronze: 1,
            silver: 1.2,
            gold: 1.5,
            platinum: 2
        };
        return multipliers[this.level] || 1;
    }
    
    getLevelName() {
        const names = {
            bronze: 'برونزي',
            silver: 'فضي',
            gold: 'ذهبي',
            platinum: 'بلاتيني'
        };
        return names[this.level] || 'برونزي';
    }
    
    getLevelIcon() {
        const icons = {
            bronze: 'fas fa-award',
            silver: 'fas fa-medal',
            gold: 'fas fa-trophy',
            platinum: 'fas fa-crown'
        };
        return icons[this.level] || 'fas fa-award';
    }
    
    showPointsNotification(points, reason) {
        window.uiManager?.showNotification(
            '🎉 نقاط مكافأة!',
            `لقد حصلت على ${points} نقطة مكافأة ${reason ? `(${reason})` : ''}`,
            'success'
        );
    }
    
    deductPoints(amount, reason) {
        if (this.points < amount) {
            return {
                success: false,
                message: 'نقاط غير كافية',
                available: this.points
            };
        }
        
        this.points -= amount;
        
        // تسجيل في السجل
        this.history.push({
            type: 'points_deducted',
            points: amount,
            reason,
            date: new Date().toISOString()
        });
        
        this.saveData();
        this.updateLoyaltyDisplay();
        
        return {
            success: true,
            deducted: amount,
            remaining: this.points
        };
    }
    
    claimReward(rewardId) {
        const reward = this.rewards.find(r => r.id === rewardId);
        if (!reward) return;
        
        if (this.points < reward.cost) {
            window.uiManager?.showNotification(
                'نقاط غير كافية',
                `تحتاج ${reward.cost} نقطة لمطالبة هذه المكافأة`,
                'warning'
            );
            return;
        }
        
        if (confirm(`هل تريد استبدال ${reward.cost} نقطة مقابل "${reward.name}"؟`)) {
            const result = this.deductPoints(reward.cost, `مكافأة: ${reward.name}`);
            
            if (result.success) {
                // تفعيل المكافأة
                this.activateReward(reward);
                
                window.uiManager?.showNotification(
                    '🎁 مبروك!',
                    `تم استبدال ${reward.cost} نقطة بنجاح. ${reward.description}`,
                    'success'
                );
            }
        }
    }
    
    activateReward(reward) {
        // تفعيل المكافأة بناءً على نوعها
        switch(reward.category) {
            case 'discount':
                this.activateDiscountReward(reward);
                break;
            case 'shipping':
                this.activateShippingReward(reward);
                break;
            case 'gift':
                this.activateGiftReward(reward);
                break;
            case 'access':
                this.activateAccessReward(reward);
                break;
            case 'points':
                this.activatePointsReward(reward);
                break;
        }
        
        // تسجيل تفعيل المكافأة
        this.history.push({
            type: 'reward_claimed',
            reward: reward.id,
            name: reward.name,
            date: new Date().toISOString()
        });
        
        this.saveData();
    }
    
    activateDiscountReward(reward) {
        // تفعيل خصم 10%
        const discount = {
            type: 'loyalty_discount',
            percentage: 10,
            rewardId: reward.id,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 يوم
        };
        
        localStorage.setItem('active_discount', JSON.stringify(discount));
    }
    
    activateShippingReward(reward) {
        // تفعيل توصيل مجاني
        const freeShipping = {
            type: 'free_shipping',
            rewardId: reward.id,
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        };
        
        localStorage.setItem('free_shipping', JSON.stringify(freeShipping));
    }
    
    activateGiftReward(reward) {
        // إضافة منتج هدية للسلة
        const giftProduct = {
            id: 'gift_' + Date.now(),
            name: 'هدية الولاء',
            price: 0,
            quantity: 1,
            category: 'gift',
            image: '🎁',
            isGift: true
        };
        
        // حفظ الهبة لاستخدامها في الطلب القادم
        localStorage.setItem('pending_gift', JSON.stringify(giftProduct));
    }
    
    activateAccessReward(reward) {
        // وصول مبكر للعروض
        const earlyAccess = {
            type: 'early_access',
            rewardId: reward.id,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ساعة
        };
        
        localStorage.setItem('early_access', JSON.stringify(earlyAccess));
        
        // إشعار للمستخدم
        window.uiManager?.showNotification(
            '🔓 وصول مبكر مفعل!',
            'يمكنك الآن الوصول للعروض الجديدة قبل الجميع لمدة 24 ساعة',
            'info'
        );
    }
    
    activatePointsReward(reward) {
        // تفعيل نقاط مزدوجة
        const doublePoints = {
            type: 'double_points',
            rewardId: reward.id,
            validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 ساعة
        };
        
        localStorage.setItem('double_points', JSON.stringify(doublePoints));
        
        window.uiManager?.showNotification(
            '💰 نقاط مزدوجة!',
            'ستحصل على نقاط مزدوجة على مشترياتك لمدة 24 ساعة',
            'info'
        );
    }
    
    checkForNewRewards() {
        // التحقق من مكافآت جديدة متاحة
        const availableRewards = this.getAvailableRewards();
        
        if (availableRewards.length > 0) {
            // عرض إشعار عن مكافآت جديدة
            setTimeout(() => {
                this.showNewRewardsNotification(availableRewards);
            }, 2000);
        }
    }
    
    getAvailableRewards() {
        return this.rewards.filter(reward => 
            this.points >= reward.cost && 
            !this.isRewardClaimedRecently(reward.id)
        );
    }
    
    isRewardClaimedRecently(rewardId) {
        const oneMonthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        
        return this.history.some(entry => 
            entry.type === 'reward_claimed' && 
            entry.reward === rewardId && 
            new Date(entry.date).getTime() > oneMonthAgo
        );
    }
    
    showNewRewardsNotification(rewards) {
        const rewardNames = rewards.map(r => r.name).join('، ');
        
        window.uiManager?.showNotification(
            '🎯 مكافآت جديدة متاحة!',
            `يمكنك الآن استبدال نقاطك بـ: ${rewardNames}`,
            'info'
        );
    }
    
    calculateDiscountFromPoints() {
        if (!this.usePointsForOrder || this.points === 0) return 0;
        
        // كل 10 نقاط = 1 ريال خصم
        const maxDiscountPoints = Math.min(this.points, 500); // حد أقصى 500 نقطة
        const discount = Math.floor(maxDiscountPoints / 10);
        
        return discount;
    }
    
    updatePointsDisplay() {
        const pointsSection = document.getElementById('loyalty-points-section');
        const pointsInfo = document.getElementById('points-info');
        const pointsEarned = document.getElementById('points-earned');
        const pointsAmount = document.getElementById('points-amount');
        
        if (pointsSection) {
            pointsSection.style.display = this.points > 0 ? 'block' : 'none';
        }
        
        if (pointsInfo) {
            const discount = this.calculateDiscountFromPoints();
            pointsInfo.innerHTML = `
                <div>النقاط الحالية: <strong>${this.points}</strong> نقطة</div>
                <div>الخصم المتاح: <strong>${discount} ريال</strong></div>
                <div>المستوى: <span class="level-badge ${this.level}">${this.getLevelName()}</span></div>
            `;
        }
        
        if (pointsEarned && pointsAmount) {
            const cartTotal = window.cartManager?.getTotal() || 0;
            const pointsToEarn = Math.floor(cartTotal / 10); // كل 10 ريال = 1 نقطة
            
            if (pointsToEarn > 0) {
                pointsEarned.style.display = 'block';
                pointsAmount.textContent = pointsToEarn;
            } else {
                pointsEarned.style.display = 'none';
            }
        }
    }
    
    updateLoyaltyDisplay() {
        this.updatePointsDisplay();
        
        // تحديث أيقونة الولاء إذا كانت موجودة
        const loyaltyIcon = document.getElementById('loyalty-icon');
        if (loyaltyIcon) {
            loyaltyIcon.innerHTML = `
                <i class="${this.getLevelIcon()}"></i>
                <span class="loyalty-points">${this.points}</span>
            `;
        }
    }
    
    getNextLevelPoints() {
        const thresholds = {
            bronze: 100,
            silver: 500,
            gold: 1000,
            platinum: Infinity
        };
        
        return thresholds[this.level] - this.points;
    }
    
    getProgressPercentage() {
        const thresholds = {
            bronze: 100,
            silver: 500,
            gold: 1000
        };
        
        const currentLevel = thresholds[this.level];
        const nextLevel = thresholds[this.getNextLevelName()] || 1000;
        
        if (currentLevel === Infinity) return 100;
        
        const progress = ((this.points - currentLevel) / (nextLevel - currentLevel)) * 100;
        return Math.min(Math.max(progress, 0), 100);
    }
    
    getNextLevelName() {
        const levels = ['bronze', 'silver', 'gold', 'platinum'];
        const currentIndex = levels.indexOf(this.level);
        return levels[currentIndex + 1] || 'platinum';
    }
    
    renderLoyaltyDashboard() {
        return `
            <div class="loyalty-dashboard">
                <div class="loyalty-header">
                    <h3><i class="fas fa-crown"></i> برنامج الولاء</h3>
                    <div class="current-level ${this.level}">
                        ${this.getLevelIcon()} ${this.getLevelName()}
                    </div>
                </div>
                
                <div class="points-display">
                    <div class="points-count">
                        <span class="points">${this.points}</span>
                        <span class="label">نقطة</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${this.getProgressPercentage()}%"></div>
                        <div class="progress-labels">
                            <span>${this.getNextLevelPoints()} نقطة للترقية</span>
                        </div>
                    </div>
                </div>
                
                <div class="benefits-section">
                    <h4>مميزات المستوى ${this.getLevelName()}</h4>
                    <ul class="benefits-list">
                        ${this.getLevelBenefits().map(benefit => `
                            <li><i class="fas fa-check"></i> ${benefit}</li>
                        `).join('')}
                    </ul>
                </div>
                
                <div class="rewards-section">
                    <h4>المكافآت المتاحة</h4>
                    <div class="rewards-grid">
                        ${this.getAvailableRewards().map(reward => `
                            <div class="reward-card available">
                                <div class="reward-icon">
                                    <i class="${reward.icon}"></i>
                                </div>
                                <div class="reward-info">
                                    <h5>${reward.name}</h5>
                                    <p>${reward.description}</p>
                                    <div class="reward-cost">
                                        <i class="fas fa-coins"></i>
                                        ${reward.cost} نقطة
                                    </div>
                                    <button class="claim-reward" data-reward-id="${reward.id}">
                                        استبدال
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                        
                        ${this.getAvailableRewards().length === 0 ? `
                            <div class="no-rewards">
                                <i class="fas fa-coins"></i>
                                <p>لا توجد مكافآت متاحة حالياً</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <div class="history-section">
                    <h4>سجل النقاط</h4>
                    <div class="history-list">
                        ${this.history.slice(-5).reverse().map(entry => `
                            <div class="history-item ${entry.type}">
                                <div class="history-icon">
                                    ${this.getHistoryIcon(entry.type)}
                                </div>
                                <div class="history-content">
                                    <div class="history-title">${this.getHistoryTitle(entry)}</div>
                                    <div class="history-date">${new Date(entry.date).toLocaleString('ar-SA')}</div>
                                </div>
                                <div class="history-points ${entry.points > 0 ? 'positive' : 'negative'}">
                                    ${entry.points > 0 ? '+' : ''}${entry.points || 0}
                                </div>
                            </div>
                        `).join('')}
                        
                        ${this.history.length === 0 ? `
                            <div class="empty-history">
                                <i class="fas fa-history"></i>
                                <p>لا توجد سجلات نقاط</p>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
    }
    
    getLevelBenefits() {
        const benefits = {
            bronze: [
                'مضاعف نقاط 1x',
                'تتبع النقاط',
                'المكافآت الأساسية'
            ],
            silver: [
                'مضاعف نقاط 1.2x',
                'خصومات خاصة',
                'توصيل أسرع',
                'جميع مميزات البرونزي'
            ],
            gold: [
                'مضاعف نقاط 1.5x',
                'هدايا مجانية',
                'دعم مميز',
                'عروض حصرية',
                'جميع مميزات الفضي'
            ],
            platinum: [
                'مضاعف نقاط 2x',
                'وصول مبكر للعروض',
                'توصيل مجاني دائم',
                'مدير حساب شخصي',
                'جميع مميزات الذهبي'
            ]
        };
        
        return benefits[this.level] || benefits.bronze;
    }
    
    getHistoryIcon(type) {
        const icons = {
            'points_added': 'fas fa-plus-circle',
            'points_deducted': 'fas fa-minus-circle',
            'reward_claimed': 'fas fa-gift',
            'level_up': 'fas fa-arrow-up',
            'purchase': 'fas fa-shopping-cart'
        };
        
        return icons[type] || 'fas fa-circle';
    }
    
    getHistoryTitle(entry) {
        switch (entry.type) {
            case 'points_added':
                return `نقاط مكافأة: ${entry.reason || 'شراء'}`;
            case 'points_deducted':
                return `استبدال نقاط: ${entry.reason}`;
            case 'reward_claimed':
                return `مكافأة: ${entry.name}`;
            case 'level_up':
                return `ترقية مستوى: ${entry.newLevel}`;
            case 'purchase':
                return `شراء: ${entry.details?.items || 'منتجات'}`;
            default:
                return entry.reason || 'نشاط';
        }
    }
    
    saveData() {
        try {
            const data = {
                points: this.points,
                level: this.level,
                lastUpdated: new Date().toISOString(),
                history: this.history
            };
            
            localStorage.setItem('loyalty_data', JSON.stringify(data));
            localStorage.setItem('loyalty_history', JSON.stringify(this.history));
        } catch (error) {
            console.error('خطأ في حفظ بيانات الولاء:', error);
        }
    }
    
    setupAutoPoints() {
        // إضافة نقاط تلقائية للأنشطة
        this.setupPurchasePoints();
        this.setupReviewPoints();
        this.setupReferralPoints();
    }
    
    setupPurchasePoints() {
        // مراقبة عمليات الشراء
        const originalSubmitOrder = window.checkoutManager?.submitOrderForm;
        if (originalSubmitOrder) {
            window.checkoutManager.submitOrderForm = async (...args) => {
                const result = await originalSubmitOrder.apply(window.checkoutManager, args);
                
                // إضافة نقاط للشراء
                const cartTotal = window.cartManager?.getTotal() || 0;
                if (cartTotal > 0) {
                    const points = Math.floor(cartTotal / 10); // كل 10 ريال = 1 نقطة
                    
                    // مضاعف النقاط إذا كان مفعلاً
                    const doublePoints = JSON.parse(localStorage.getItem('double_points'));
                    const multiplier = doublePoints ? 2 : 1;
                    
                    this.addPoints(points * multiplier, 'شراء', {
                        orderTotal: cartTotal,
                        items: window.cartManager?.getAllItems() || []
                    });
                }
                
                return result;
            };
        }
    }
    
    setupReviewPoints() {
        // إضافة نقاط لكتابة تقييمات
        // سيتم تنفيذ هذا عند دمج نظام التقييمات
    }
    
    setupReferralPoints() {
        // إضافة نقاط للإحالات
        // سيتم تنفيذ هذا عند إضافة نظام الإحالات
    }
    
    // دالة لتصدير بيانات الولاء
    exportData() {
        const data = {
            points: this.points,
            level: this.level,
            history: this.history,
            rewards: this.getAvailableRewards(),
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `loyalty-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// تهيئة برنامج الولاء
window.loyaltyManager = new LoyaltyProgram();
