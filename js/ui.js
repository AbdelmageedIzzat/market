// في class UIManager - أضف هذه الدالة
addToCartAnimation(element) {
    if (!element) return;
    
    // إضافة تأثير النبض
    element.style.transform = 'scale(1.1)';
    element.style.boxShadow = '0 6px 20px rgba(58, 54, 224, 0.4)';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.boxShadow = '';
    }, 300);
    
    // إضافة تأثير الاهتزاز البسيط
    element.style.animation = 'vibrate 0.3s ease';
    
    setTimeout(() => {
        element.style.animation = '';
    }, 300);
}

// وأضف هذا الـ animation في CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes vibrate {
        0%, 100% { transform: translateX(0) scale(1.1); }
        25% { transform: translateX(-2px) scale(1.1); }
        75% { transform: translateX(2px) scale(1.1); }
    }
`;
document.head.appendChild(style);
