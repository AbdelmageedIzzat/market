// نظام التقييمات والمراجعات

class ReviewSystem {
    constructor() {
        this.reviews = this.loadReviews();
        this.ratings = this.loadRatings();
        this.currentReview = null;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateAllProductRatings();
    }
    
    loadReviews() {
        try {
            return JSON.parse(localStorage.getItem('product_reviews')) || {};
        } catch (error) {
            console.error('خطأ في تحميل التقييمات:', error);
            return {};
        }
    }
    
    loadRatings() {
        try {
            return JSON.parse(localStorage.getItem('product_ratings')) || {};
        } catch (error) {
            console.error('خطأ في تحميل التصنيفات:', error);
            return {};
        }
    }
    
    setupEventListeners() {
        // مراقبة النقر على أزرار كتابة تقييم
        document.addEventListener('click', (e) => {
            const writeReviewBtn = e.target.closest('.write-review-btn');
            if (writeReviewBtn) {
                const productId = writeReviewBtn.dataset.productId;
                this.showReviewModal(productId);
            }
        });
        
        // مراقبة إرسال نموذج التقييم
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('review-form')) {
                e.preventDefault();
                const productId = e.target.dataset.productId;
                this.submitReview(productId, e.target);
            }
        });
    }
    
    showReviewModal(productId) {
        const product = window.productsManager?.getProductById(productId);
        if (!product) return;
        
        const modal = document.createElement('div');
        modal.className = 'review-modal';
        modal.innerHTML = `
            <div class="review-content">
                <div class="review-header">
                    <h3><i class="fas fa-star"></i> تقييم ${product.name}</h3>
                    <button class="close-review">&times;</button>
                </div>
                
                <form class="review-form" data-product-id="${productId}">
                    <div class="form-group">
                        <label>التقييم:</label>
                        <div class="star-rating-input">
                            ${[1,2,3,4,5].map(star => `
                                <i class="far fa-star" data-rating="${star}"></i>
                            `).join('')}
                            <input type="hidden" name="rating" value="0" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="review-title-${productId}">عنوان المراجعة:</label>
                        <input type="text" 
                               id="review-title-${productId}" 
                               name="title" 
                               placeholder="اكتب عنواناً مختصراً..." 
                               maxlength="100"
                               required>
                    </div>
                    
                    <div class="form-group">
                        <label for="review-comment-${productId}">المراجعة:</label>
                        <textarea id="review-comment-${productId}" 
                                  name="comment" 
                                  placeholder="شاركنا تجربتك مع هذا المنتج..." 
                                  rows="5"
                                  required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>هل توصي بهذا المنتج؟</label>
                        <div class="recommendation-options">
                            <label>
                                <input type="radio" name="recommend" value="yes" checked>
                                <span>نعم</span>
                            </label>
                            <label>
                                <input type="radio" name="recommend" value="no">
                                <span>لا</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="submit-review">
                            <i class="fas fa-paper-plane"></i>
                            نشر المراجعة
                        </button>
                        <button type="button" class="cancel-review">
                            إلغاء
                        </button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إعداد أحداث النجوم
        const stars = modal.querySelectorAll('.star-rating-input i');
        const ratingInput = modal.querySelector('input[name="rating"]');
        
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const rating = parseInt(star.dataset.rating);
                this.setStarRating(stars, rating);
                ratingInput.value = rating;
            });
            
            star.addEventListener('mouseover', () => {
                const rating = parseInt(star.dataset.rating);
                this.previewStarRating(stars, rating);
            });
        });
        
        modal.querySelector('.star-rating-input').addEventListener('mouseleave', () => {
            const currentRating = parseInt(ratingInput.value);
            this.setStarRating(stars, currentRating);
        });
        
        // إغلاق النافذة
        modal.querySelector('.close-review').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.cancel-review').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    setStarRating(stars, rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.className = 'fas fa-star';
                star.style.color = '#FFD700';
            } else {
                star.className = 'far fa-star';
                star.style.color = '#ccc';
            }
        });
    }
    
    previewStarRating(stars, rating) {
        stars.forEach(star => {
            const starRating = parseInt(star.dataset.rating);
            if (starRating <= rating) {
                star.style.color = '#FFD700';
            } else {
                star.style.color = '#ccc';
            }
        });
    }
    
    submitReview(productId, form) {
        const formData = new FormData(form);
        const reviewData = {
            id: `review_${Date.now()}`,
            productId,
            rating: parseInt(formData.get('rating')),
            title: formData.get('title').trim(),
            comment: formData.get('comment').trim(),
            recommend: formData.get('recommend') === 'yes',
            date: new Date().toISOString(),
            helpful: 0,
            verified: this.checkVerifiedPurchase(productId),
            photos: []
        };
        
        // التحقق من البيانات
        if (!this.validateReview(reviewData)) {
            return;
        }
        
        // إضافة المراجعة
        this.addReview(reviewData);
        
        // إغلاق النافذة
        form.closest('.review-modal')?.remove();
        
        // إظهار إشعار
        window.uiManager?.showNotification(
            'شكراً لك!',
            'تم نشر تقييمك بنجاح',
            'success'
        );
    }
    
    validateReview(reviewData) {
        if (reviewData.rating < 1 || reviewData.rating > 5) {
            window.uiManager?.showNotification(
                'خطأ',
                'يرجى اختيار تقييم من 1 إلى 5 نجوم',
                'error'
            );
            return false;
        }
        
        if (reviewData.title.length < 5) {
            window.uiManager?.showNotification(
                'خطأ',
                'عنوان المراجعة قصير جداً',
                'error'
            );
            return false;
        }
        
        if (reviewData.comment.length < 20) {
            window.uiManager?.showNotification(
                'خطأ',
                'المراجعة قصيرة جداً، يرجى كتابة المزيد من التفاصيل',
                'error'
            );
            return false;
        }
        
        return true;
    }
    
    addReview(review) {
        // إضافة المراجعة للمنتج
        if (!this.reviews[review.productId]) {
            this.reviews[review.productId] = [];
        }
        
        this.reviews[review.productId].push(review);
        this.saveReviews();
        
        // تحديث تصنيف المنتج
        this.updateProductRating(review.productId);
        
        // تحديث العرض
        this.updateProductReviewsDisplay(review.productId);
    }
    
    updateProductRating(productId) {
        const productReviews = this.reviews[productId] || [];
        
        if (productReviews.length === 0) return;
        
        // حساب المتوسط
        const average = productReviews.reduce((sum, review) => sum + review.rating, 0) / productReviews.length;
        
        // حساب التوزيع
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        productReviews.forEach(review => {
            distribution[review.rating]++;
        });
        
        // حساب النسب المئوية
        Object.keys(distribution).forEach(rating => {
            distribution[rating] = Math.round((distribution[rating] / productReviews.length) * 100);
        });
        
        // حفظ التصنيف
        this.ratings[productId] = {
            average: parseFloat(average.toFixed(1)),
            count: productReviews.length,
            distribution,
            lastUpdated: new Date().toISOString()
        };
        
        this.saveRatings();
        
        // تحديث عرض التقييم في المنتج
        this.updateProductRatingDisplay(productId);
    }
    
    updateProductRatingDisplay(productId) {
        const rating = this.ratings[productId];
        if (!rating) return;
        
        // تحديث النجوم في بطاقة المنتج
        const productCards = document.querySelectorAll(`.add-to-cart-btn[data-id="${productId}"]`).forEach(btn => {
            const ratingElement = btn.closest('.product-card, .offer-card')?.querySelector('.rating-info');
            if (ratingElement) {
                ratingElement.innerHTML = `
                    <i class="fas fa-star"></i>
                    <span>${rating.average}</span>
                    <small>(${rating.count})</small>
                `;
            }
        });
    }
    
    updateProductReviewsDisplay(productId) {
        // تحديث عرض المراجعات إذا كان مفتوحاً
        const reviewsSection = document.querySelector(`.reviews-section[data-product-id="${productId}"]`);
        if (reviewsSection) {
            this.renderProductReviews(productId, reviewsSection);
        }
    }
    
    renderProductReviews(productId, container) {
        const productReviews = this.reviews[productId] || [];
        const rating = this.ratings[productId];
        
        if (!container) return;
        
        container.innerHTML = `
            <div class="reviews-header">
                <h3>التقييمات والمراجعات</h3>
                ${rating ? `
                    <div class="overall-rating">
                        <div class="rating-score">${rating.average}</div>
                        <div class="rating-stars">${this.generateStars(rating.average)}</div>
                        <div class="rating-count">${rating.count} تقييم</div>
                    </div>
                ` : ''}
            </div>
            
            ${rating ? `
                <div class="rating-distribution">
                    ${[5,4,3,2,1].map(star => `
                        <div class="distribution-row">
                            <span>${star} نجوم</span>
                            <div class="distribution-bar">
                                <div class="distribution-fill" 
                                     style="width: ${rating.distribution?.[star] || 0}%"></div>
                            </div>
                            <span>${rating.distribution?.[star] || 0}%</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="reviews-actions">
                <button class="write-review-btn" data-product-id="${productId}">
                    <i class="fas fa-pen"></i>
                    كتابة مراجعة
                </button>
                <div class="sort-reviews">
                    <select class="sort-select">
                        <option value="newest">الأحدث</option>
                        <option value="helpful">الأكثر فائدة</option>
                        <option value="highest">الأعلى تقييماً</option>
                        <option value="lowest">الأقل تقييماً</option>
                    </select>
                </div>
            </div>
            
            <div class="reviews-list">
                ${productReviews.length > 0 ? 
                    this.sortReviews(productReviews, 'newest').map(review => this.renderReviewItem(review)).join('') 
                    : `
                    <div class="no-reviews">
                        <i class="fas fa-comment"></i>
                        <p>لا توجد مراجعات بعد. كن أول من يكتب مراجعة!</p>
                    </div>
                `}
            </div>
        `;
        
        // إضافة الأحداث
        container.querySelector('.write-review-btn')?.addEventListener('click', (e) => {
            this.showReviewModal(productId);
        });
        
        container.querySelector('.sort-select')?.addEventListener('change', (e) => {
            const sortedReviews = this.sortReviews(productReviews, e.target.value);
            const reviewsList = container.querySelector('.reviews-list');
            reviewsList.innerHTML = sortedReviews.map(review => this.renderReviewItem(review)).join('');
        });
    }
    
    sortReviews(reviews, sortBy) {
        const sorted = [...reviews];
        
        switch (sortBy) {
            case 'newest':
                return sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
            case 'oldest':
                return sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
            case 'highest':
                return sorted.sort((a, b) => b.rating - a.rating);
            case 'lowest':
                return sorted.sort((a, b) => a.rating - b.rating);
            case 'helpful':
                return sorted.sort((a, b) => b.helpful - a.helpful);
            default:
                return sorted;
        }
    }
    
    renderReviewItem(review) {
        const date = new Date(review.date).toLocaleDateString('ar-SA');
        
        return `
            <div class="review-item" data-review-id="${review.id}">
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">
                            <i class="fas fa-user"></i>
                        </div>
                        <div class="reviewer-details">
                            <div class="reviewer-name">مستخدم</div>
                            <div class="review-date">${date}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${this.generateStars(review.rating)}
                        ${review.verified ? '<span class="verified-badge"><i class="fas fa-check-circle"></i> مشتري مؤكد</span>' : ''}
                    </div>
                </div>
                
                <div class="review-content">
                    <h4 class="review-title">${review.title}</h4>
                    <p class="review-comment">${review.comment}</p>
                    
                    ${review.recommend !== undefined ? `
                        <div class="recommendation ${review.recommend ? 'recommended' : 'not-recommended'}">
                            <i class="fas fa-thumbs-${review.recommend ? 'up' : 'down'}"></i>
                            ${review.recommend ? 'أوصي بهذا المنتج' : 'لا أوصي بهذا المنتج'}
                        </div>
                    ` : ''}
                </div>
                
                <div class="review-actions">
                    <button class="helpful-btn" data-review-id="${review.id}">
                        <i class="fas fa-thumbs-up"></i>
                        مفيد <span class="helpful-count">(${review.helpful})</span>
                    </button>
                    <button class="report-btn" data-review-id="${review.id}">
                        <i class="fas fa-flag"></i>
                        إبلاغ
                    </button>
                </div>
            </div>
        `;
    }
    
    generateStars(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        
        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }
        
        return stars;
    }
    
    markHelpful(reviewId) {
        let found = false;
        
        Object.keys(this.reviews).forEach(productId => {
            const reviewIndex = this.reviews[productId].findIndex(r => r.id === reviewId);
            if (reviewIndex > -1) {
                this.reviews[productId][reviewIndex].helpful++;
                found = true;
            }
        });
        
        if (found) {
            this.saveReviews();
            return true;
        }
        
        return false;
    }
    
    reportReview(reviewId) {
        // في تطبيق حقيقي، هنا سيتم إرسال بلاغ للخادم
        window.uiManager?.showNotification(
            'شكراً لك',
            'تم استلام بلاغك وسيتم مراجعته',
            'info'
        );
        
        return true;
    }
    
    checkVerifiedPurchase(productId) {
        // التحقق إذا كان المستخدم قد اشترى هذا المنتج
        const orders = JSON.parse(localStorage.getItem('orderHistory') || '[]');
        
        for (const order of orders) {
            if (order.cart && order.cart.some(item => item.id === productId)) {
                return true;
            }
        }
        
        return false;
    }
    
    updateAllProductRatings() {
        // تحديث تصنيفات جميع المنتجات
        Object.keys(this.reviews).forEach(productId => {
            this.updateProductRating(productId);
        });
    }
    
    getProductReviews(productId) {
        return this.reviews[productId] || [];
    }
    
    getProductRating(productId) {
        return this.ratings[productId] || null;
    }
    
    saveReviews() {
        try {
            localStorage.setItem('product_reviews', JSON.stringify(this.reviews));
        } catch (error) {
            console.error('خطأ في حفظ التقييمات:', error);
        }
    }
    
    saveRatings() {
        try {
            localStorage.setItem('product_ratings', JSON.stringify(this.ratings));
        } catch (error) {
            console.error('خطأ في حفظ التصنيفات:', error);
        }
    }
    
    // إحصائيات النظام
    getReviewStats() {
        const totalReviews = Object.values(this.reviews).reduce((sum, reviews) => sum + reviews.length, 0);
        const totalProducts = Object.keys(this.reviews).length;
        const averageRating = Object.values(this.ratings).reduce((sum, rating) => sum + rating.average, 0) / totalProducts || 0;
        
        return {
            totalReviews,
            totalProducts,
            averageRating: parseFloat(averageRating.toFixed(1)),
            distribution: this.getOverallDistribution()
        };
    }
    
    getOverallDistribution() {
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let totalReviews = 0;
        
        Object.values(this.ratings).forEach(rating => {
            Object.keys(distribution).forEach(star => {
                distribution[star] += rating.distribution?.[star] || 0;
            });
            totalReviews += rating.count;
        });
        
        // تحويل إلى نسب مئوية
        Object.keys(distribution).forEach(star => {
            distribution[star] = totalReviews > 0 ? Math.round((distribution[star] / totalReviews) * 100) : 0;
        });
        
        return distribution;
    }
}

// تهيئة نظام التقييمات
window.reviewsManager = new ReviewSystem();
