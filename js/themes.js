// نظام السمات المخصصة

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'فاتح',
                colors: {
                    '--primary': '#3A36E0',
                    '--primary-light': '#6A66FF',
                    '--primary-dark': '#2A27B3',
                    '--secondary': '#FF6B8B',
                    '--secondary-light': '#FF9EB3',
                    '--accent': '#00D4AA',
                    '--accent-light': '#5CFFD6',
                    '--dark': '#1A1A2E',
                    '--dark-light': '#2D2D44',
                    '--light': '#F8F9FF',
                    '--gray': '#F0F2F5',
                    '--gray-dark': '#E4E6EF',
                    '--text': '#2D3748',
                    '--text-light': '#718096'
                }
            },
            dark: {
                name: 'داكن',
                colors: {
                    '--primary': '#6A66FF',
                    '--primary-light': '#8B88FF',
                    '--primary-dark': '#4A46D4',
                    '--secondary': '#FF8BA3',
                    '--secondary-light': '#FFB1C2',
                    '--accent': '#00E6B8',
                    '--accent-light': '#5CFFD6',
                    '--dark': '#F8F9FF',
                    '--dark-light': '#E4E6EF',
                    '--light': '#1A1A2E',
                    '--gray': '#2D2D44',
                    '--gray-dark': '#3D3D5A',
                    '--text': '#E4E6EF',
                    '--text-light': '#A0AEC0'
                }
            },
            sunset: {
                name: 'غروب',
                colors: {
                    '--primary': '#FF6B8B',
                    '--primary-light': '#FF8BA3',
                    '--primary-dark': '#E04A6D',
                    '--secondary': '#FF9E6B',
                    '--secondary-light': '#FFB88A',
                    '--accent': '#FFD166',
                    '--accent-light': '#FFE08A',
                    '--dark': '#2D1B2E',
                    '--dark-light': '#3D2B3E',
                    '--light': '#FFF5F7',
                    '--gray': '#FFE8EC',
                    '--gray-dark': '#FFD6DE',
                    '--text': '#2D3748',
                    '--text-light': '#718096'
                }
            },
            nature: {
                name: 'طبيعي',
                colors: {
                    '--primary': '#00D4AA',
                    '--primary-light': '#5CFFD6',
                    '--primary-dark': '#00B894',
                    '--secondary': '#4ECDC4',
                    '--secondary-light': '#7EE0D8',
                    '--accent': '#FFD166',
                    '--accent-light': '#FFE08A',
                    '--dark': '#1A2E2A',
                    '--dark-light': '#2B3E3A',
                    '--light': '#F0FFF4',
                    '--gray': '#E8F5E9',
                    '--gray-dark': '#D6E9D6',
                    '--text': '#2D3748',
                    '--text-light': '#718096'
                }
            }
        };
        
        this.currentTheme = 'light';
        this.customThemes = {};
        this.init();
    }
    
    init() {
        this.loadTheme();
        this.createThemeSelector();
        this.setupEventListeners();
        this.applyTheme(this.currentTheme);
    }
    
    loadTheme() {
        try {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme && (this.themes[savedTheme] || this.customThemes[savedTheme])) {
                this.currentTheme = savedTheme;
            }
            
            // تحميل السمات المخصصة
            const savedCustomThemes = localStorage.getItem('custom_themes');
            if (savedCustomThemes) {
                this.customThemes = JSON.parse(savedCustomThemes);
            }
        } catch (error) {
            console.error('خطأ في تحميل السمة:', error);
        }
    }
    
    createThemeSelector() {
        const headerActions = document.querySelector('.header-actions');
        if (!headerActions) return;
        
        const themeSelector = document.createElement('div');
        themeSelector.className = 'theme-selector';
        themeSelector.id = 'theme-selector';
        themeSelector.innerHTML = `
            <button class="theme-toggle" id="theme-toggle">
                <i class="fas fa-palette"></i>
            </button>
            <div class="theme-options" id="theme-options">
                <div class="theme-options-header">
                    <h4><i class="fas fa-palette"></i> اختيار السمة</h4>
                    <button class="close-theme-options">&times;</button>
                </div>
                <div class="themes-list" id="themes-list"></div>
                <div class="theme-actions">
                    <button class="create-theme-btn" id="create-theme-btn">
                        <i class="fas fa-plus"></i>
                        إنشاء سمة مخصصة
                    </button>
                </div>
            </div>
        `;
        
        headerActions.appendChild(themeSelector);
        this.renderThemesList();
    }
    
    renderThemesList() {
        const themesList = document.getElementById('themes-list');
        if (!themesList) return;
        
        // السمات الأساسية
        const builtInThemes = Object.keys(this.themes).map(themeKey => {
            const theme = this.themes[themeKey];
            return { id: themeKey, ...theme, isCustom: false };
        });
        
        // السمات المخصصة
        const customThemes = Object.keys(this.customThemes).map(themeKey => {
            const theme = this.customThemes[themeKey];
            return { id: themeKey, ...theme, isCustom: true };
        });
        
        // جميع السمات
        const allThemes = [...builtInThemes, ...customThemes];
        
        themesList.innerHTML = allThemes.map(theme => `
            <div class="theme-item ${theme.id === this.currentTheme ? 'active' : ''} ${theme.isCustom ? 'custom' : ''}" 
                 data-theme-id="${theme.id}">
                <div class="theme-preview" style="background: linear-gradient(135deg, 
                    ${theme.colors['--primary']} 0%, 
                    ${theme.colors['--secondary']} 100%);">
                    ${theme.isCustom ? '<i class="fas fa-user-edit"></i>' : ''}
                </div>
                <div class="theme-info">
                    <div class="theme-name">${theme.name}</div>
                    <div class="theme-type">${theme.isCustom ? 'مخصصة' : 'افتراضية'}</div>
                </div>
                ${theme.isCustom ? `
                    <div class="theme-custom-actions">
                        <button class="edit-theme" data-theme-id="${theme.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-theme" data-theme-id="${theme.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    setupEventListeners() {
        // تبديل قائمة السمات
        document.getElementById('theme-toggle')?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleThemeOptions();
        });
        
        // إغلاق قائمة السمات
        document.querySelector('.close-theme-options')?.addEventListener('click', () => {
            this.closeThemeOptions();
        });
        
        // النقر خارج القائمة لإغلاقها
        document.addEventListener('click', (e) => {
            const themeOptions = document.getElementById('theme-options');
            const themeToggle = document.getElementById('theme-toggle');
            
            if (themeOptions?.classList.contains('open') && 
                !themeOptions.contains(e.target) && 
                !themeToggle?.contains(e.target)) {
                this.closeThemeOptions();
            }
        });
        
        // اختيار سمة
        document.addEventListener('click', (e) => {
            const themeItem = e.target.closest('.theme-item');
            if (themeItem && !e.target.closest('.theme-custom-actions')) {
                const themeId = themeItem.dataset.themeId;
                this.applyTheme(themeId);
                this.closeThemeOptions();
            }
        });
        
        // إنشاء سمة مخصصة
        document.getElementById('create-theme-btn')?.addEventListener('click', () => {
            this.showThemeCreator();
        });
        
        // تحرير سمة مخصصة
        document.addEventListener('click', (e) => {
            const editBtn = e.target.closest('.edit-theme');
            if (editBtn) {
                const themeId = editBtn.dataset.themeId;
                this.editCustomTheme(themeId);
                e.stopPropagation();
            }
        });
        
        // حذف سمة مخصصة
        document.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.delete-theme');
            if (deleteBtn) {
                const themeId = deleteBtn.dataset.themeId;
                this.deleteCustomTheme(themeId);
                e.stopPropagation();
            }
        });
    }
    
    toggleThemeOptions() {
        const themeOptions = document.getElementById('theme-options');
        if (themeOptions) {
            themeOptions.classList.toggle('open');
        }
    }
    
    closeThemeOptions() {
        const themeOptions = document.getElementById('theme-options');
        if (themeOptions) {
            themeOptions.classList.remove('open');
        }
    }
    
    applyTheme(themeId) {
        const theme = this.themes[themeId] || this.customThemes[themeId];
        if (!theme) return;
        
        // تطبيق الألوان
        Object.entries(theme.colors).forEach(([property, value]) => {
            document.documentElement.style.setProperty(property, value);
        });
        
        // تحديث السمة الحالية
        this.currentTheme = themeId;
        localStorage.setItem('theme', themeId);
        
        // تحديث الواجهة
        this.updateActiveTheme();
        
        // إضافة فئة للجسم
        document.body.setAttribute('data-theme', themeId);
        
        // إظهار إشعار
        window.uiManager?.showNotification(
            'تم تغيير السمة',
            `تم تطبيق سمة "${theme.name}"`,
            'success'
        );
    }
    
    updateActiveTheme() {
        // تحديث العنصر النشط في القائمة
        document.querySelectorAll('.theme-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.themeId === this.currentTheme) {
                item.classList.add('active');
            }
        });
    }
    
    showThemeCreator(editThemeId = null) {
        const isEditing = !!editThemeId;
        const themeToEdit = editThemeId ? this.customThemes[editThemeId] : null;
        
        const modal = document.createElement('div');
        modal.className = 'theme-creator-modal';
        modal.innerHTML = `
            <div class="theme-creator-content">
                <div class="theme-creator-header">
                    <h3><i class="fas fa-palette"></i> ${isEditing ? 'تحرير السمة' : 'إنشاء سمة مخصصة'}</h3>
                    <button class="close-theme-creator">&times;</button>
                </div>
                
                <form class="theme-creator-form" id="theme-creator-form">
                    <div class="form-group">
                        <label for="theme-name">اسم السمة:</label>
                        <input type="text" 
                               id="theme-name" 
                               class="form-input" 
                               value="${themeToEdit?.name || ''}"
                               placeholder="أدخل اسم للسمة..."
                               required>
                    </div>
                    
                    <div class="color-picker-grid">
                        ${Object.entries(this.themes.light.colors).map(([property, defaultValue]) => {
                            const value = themeToEdit?.colors?.[property] || defaultValue;
                            const label = this.getColorLabel(property);
                            
                            return `
                                <div class="color-picker-item">
                                    <label for="${property}">${label}:</label>
                                    <div class="color-input-group">
                                        <input type="color" 
                                               id="${property}" 
                                               class="color-input" 
                                               value="${this.rgbToHex(value)}"
                                               data-property="${property}">
                                        <input type="text" 
                                               class="color-text-input" 
                                               value="${value}"
                                               data-property="${property}"
                                               placeholder="${value}">
                                    </div>
                                    <div class="color-preview" style="background-color: ${value};"></div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                    
                    <div class="theme-preview-section">
                        <h4>معاينة السمة:</h4>
                        <div class="theme-preview-card" id="theme-preview-card">
                            <div class="preview-header" style="background-color: var(--dark); color: var(--light);">
                                <div class="preview-logo">
                                    <i class="fas fa-globe-americas"></i>
                                    <span>معاينة</span>
                                </div>
                                <div class="preview-actions">
                                    <button class="preview-btn" style="background-color: var(--primary);">
                                        <i class="fas fa-shopping-cart"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="preview-body" style="background-color: var(--light);">
                                <div class="preview-product">
                                    <div class="preview-product-image" style="background-color: var(--gray);">
                                        <i class="fas fa-box"></i>
                                    </div>
                                    <div class="preview-product-info">
                                        <h5 style="color: var(--text);">منتج تجريبي</h5>
                                        <p style="color: var(--text-light);">وصف المنتج</p>
                                        <div class="preview-price" style="color: var(--primary);">100 ريال</div>
                                    </div>
                                </div>
                                <button class="preview-action-btn" style="background-color: var(--secondary); color: white;">
                                    <i class="fas fa-heart"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="save-theme-btn">
                            <i class="fas fa-save"></i>
                            ${isEditing ? 'تحديث السمة' : 'حفظ السمة'}
                        </button>
                        <button type="button" class="cancel-theme-creator">
                            إلغاء
                        </button>
                        ${isEditing ? `
                            <button type="button" class="reset-theme-colors" id="reset-theme-colors">
                                <i class="fas fa-redo"></i>
                                إعادة التعيين
                            </button>
                        ` : ''}
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // إعداد أحداث ألوان اللون
        this.setupColorPickerEvents(modal, themeToEdit);
        
        // إضافة الأحداث
        modal.querySelector('.close-theme-creator').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.cancel-theme-creator').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.querySelector('.reset-theme-colors')?.addEventListener('click', () => {
            this.resetThemeColors(modal, editThemeId);
        });
        
        modal.querySelector('#theme-creator-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveCustomTheme(modal, isEditing, editThemeId);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }
    
    getColorLabel(property) {
        const labels = {
            '--primary': 'اللون الأساسي',
            '--primary-light': 'اللون الأساسي الفاتح',
            '--primary-dark': 'اللون الأساسي الغامق',
            '--secondary': 'اللون الثانوي',
            '--secondary-light': 'اللون الثانوي الفاتح',
            '--accent': 'لون التمييز',
            '--accent-light': 'لون التمييز الفاتح',
            '--dark': 'اللون الغامق',
            '--dark-light': 'اللون الغامق الفاتح',
            '--light': 'اللون الفاتح',
            '--gray': 'اللون الرمادي',
            '--gray-dark': 'اللون الرمادي الغامق',
            '--text': 'لون النص',
            '--text-light': 'لون النص الفاتح'
        };
        
        return labels[property] || property;
    }
    
    rgbToHex(rgb) {
        // تحويل RGB إلى HEX
        if (rgb.startsWith('#')) return rgb;
        
        const rgbValues = rgb.match(/\d+/g);
        if (rgbValues && rgbValues.length === 3) {
            const [r, g, b] = rgbValues;
            return `#${parseInt(r).toString(16).padStart(2, '0')}${parseInt(g).toString(16).padStart(2, '0')}${parseInt(b).toString(16).padStart(2, '0')}`;
        }
        
        return '#000000';
    }
    
    setupColorPickerEvents(modal, themeToEdit) {
        const colorInputs = modal.querySelectorAll('.color-input');
        const textInputs = modal.querySelectorAll('.color-text-input');
        const previewCard = modal.querySelector('#theme-preview-card');
        
        const updatePreview = () => {
            const colors = {};
            
            colorInputs.forEach(input => {
                const property = input.dataset.property;
                colors[property] = input.value;
            });
            
            // تطبيق الألوان على المعاينة
            Object.entries(colors).forEach(([property, value]) => {
                previewCard.style.setProperty(property, value);
            });
            
            // تحديث حقول النص
            textInputs.forEach(input => {
                const property = input.dataset.property;
                const colorInput = modal.querySelector(`.color-input[data-property="${property}"]`);
                if (colorInput) {
                    input.value = colorInput.value;
                }
            });
        };
        
        colorInputs.forEach(input => {
            input.addEventListener('input', updatePreview);
        });
        
        textInputs.forEach(input => {
            input.addEventListener('input', (e) => {
                const property = e.target.dataset.property;
                const colorInput = modal.querySelector(`.color-input[data-property="${property}"]`);
                if (colorInput && this.isValidColor(e.target.value)) {
                    colorInput.value = this.rgbToHex(e.target.value);
                    updatePreview();
                }
            });
        });
        
        // التهيئة الأولية
        updatePreview();
    }
    
    isValidColor(color) {
        const style = new Option().style;
        style.color = color;
        return style.color !== '';
    }
    
    resetThemeColors(modal, themeId) {
        if (!themeId) return;
        
        const theme = this.customThemes[themeId];
        if (!theme) return;
        
        // إعادة تعيين الألوان للقيم الافتراضية
        const defaultColors = this.themes.light.colors;
        
        modal.querySelectorAll('.color-input').forEach(input => {
            const property = input.dataset.property;
            input.value = this.rgbToHex(defaultColors[property]);
        });
        
        // تحديث المعاينة
        const previewCard = modal.querySelector('#theme-preview-card');
        Object.entries(defaultColors).forEach(([property, value]) => {
            previewCard.style.setProperty(property, value);
        });
    }
    
    saveCustomTheme(modal, isEditing, editThemeId) {
        const themeName = modal.querySelector('#theme-name').value.trim();
        if (!themeName) {
            window.uiManager?.showNotification(
                'خطأ',
                'يرجى إدخال اسم للسمة',
                'error'
            );
            return;
        }
        
        // جمع الألوان
        const colors = {};
        modal.querySelectorAll('.color-input').forEach(input => {
            const property = input.dataset.property;
            colors[property] = input.value;
        });
        
        // إنشاء معرف فريد
        const themeId = isEditing ? editThemeId : `custom_${Date.now()}`;
        
        const theme = {
            name: themeName,
            colors,
            createdAt: isEditing ? this.customThemes[editThemeId]?.createdAt : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        // حفظ السمة
        this.customThemes[themeId] = theme;
        localStorage.setItem('custom_themes', JSON.stringify(this.customThemes));
        
        // تطبيق السمة الجديدة
        this.applyTheme(themeId);
        
        // تحديث القائمة
        this.renderThemesList();
        
        // إغلاق النافذة
        modal.remove();
        
        window.uiManager?.showNotification(
            'تم الحفظ',
            `تم ${isEditing ? 'تحديث' : 'إنشاء'} السمة "${themeName}" بنجاح`,
            'success'
        );
    }
    
    editCustomTheme(themeId) {
        this.showThemeCreator(themeId);
    }
    
    deleteCustomTheme(themeId) {
        if (!this.customThemes[themeId]) return;
        
        if (confirm(`هل تريد حذف السمة "${this.customThemes[themeId].name}"؟`)) {
            delete this.customThemes[themeId];
            
            // إذا كانت السمة الحالية هي المحذوفة، ارجع للسمة الفاتحة
            if (this.currentTheme === themeId) {
                this.applyTheme('light');
            }
            
            // حفظ التحديثات
            localStorage.setItem('custom_themes', JSON.stringify(this.customThemes));
            
            // تحديث القائمة
            this.renderThemesList();
            
            window.uiManager?.showNotification(
                'تم الحذف',
                'تم حذف السمة بنجاح',
                'info'
            );
        }
    }
    
    // دالة لتصدير السمة
    exportTheme(themeId) {
        const theme = this.themes[themeId] || this.customThemes[themeId];
        if (!theme) return;
        
        const data = {
            ...theme,
            exportedAt: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `theme-${theme.name}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // دالة لاستيراد سمة
    importTheme(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // التحقق من صحة البيانات
                if (!data.name || !data.colors) {
                    throw new Error('بيانات السمة غير صالحة');
                }
                
                // إنشاء معرف فريد
                const themeId = `imported_${Date.now()}`;
                
                // حفظ السمة
                this.customThemes[themeId] = {
                    name: data.name,
                    colors: data.colors,
                    importedAt: new Date().toISOString()
                };
                
                localStorage.setItem('custom_themes', JSON.stringify(this.customThemes));
                
                // تحديث القائمة
                this.renderThemesList();
                
                window.uiManager?.showNotification(
                    'تم الاستيراد',
                    `تم استيراد سمة "${data.name}" بنجاح`,
                    'success'
                );
                
            } catch (error) {
                console.error('خطأ في استيراد السمة:', error);
                window.uiManager?.showNotification(
                    'خطأ في الاستيراد',
                    'تعذر استيراد ملف السمة',
                    'error'
                );
            }
        };
        
        reader.readAsText(file);
    }
    
    // دالة لإعادة تعيين جميع السمات
    resetAllThemes() {
        if (confirm('هل تريد إعادة تعيين جميع السمات المخصصة؟')) {
            this.customThemes = {};
            localStorage.removeItem('custom_themes');
            localStorage.removeItem('theme');
            
            this.applyTheme('light');
            this.renderThemesList();
            
            window.uiManager?.showNotification(
                'تم الإعادة',
                'تمت إعادة تعيين جميع السمات',
                'info'
            );
        }
    }
}

// تهيئة مدير السمات
window.themeManager = new ThemeManager();
