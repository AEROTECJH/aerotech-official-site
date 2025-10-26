/**
 * AEROTECH Drone Comparison Tool
 * Allows users to compare specifications of different drone models
 */

class DroneComparator {
    constructor() {
        this.models = this.getModels();
        this.selectedModels = [];
        this.maxComparisons = 3;
        this.init();
    }

    init() {
        // Create comparison tool UI
        this.createComparisonTool();
        
        // Setup comparison trigger buttons
        this.setupComparisonTriggers();
    }

    getModels() {
        return {
            k1: {
                id: 'k1',
                name: 'K1',
                fullName: 'AEROTECH K1',
                category: 'Универсальная платформа',
                image: '/images/k1-drone-MAINVIEW.jpg',
                status: 'В разработке',
                readiness: '20%',
                specs: {
                    type: 'Квадрокоптер',
                    wingspan: 'N/A',
                    length: '600 мм',
                    height: '200 мм',
                    weight: '2.5 кг',
                    maxTakeoffWeight: '4.0 кг',
                    payloadCapacity: '1.5 кг',
                    maxSpeed: '72 км/ч',
                    cruiseSpeed: '45 км/ч',
                    maxFlightTime: '120 мин',
                    maxRange: '50 км',
                    ceiling: '3000 м',
                    windResistance: '12 м/с',
                    positioning: '1 см (RTK GPS)',
                    protection: 'IP68',
                    powerSource: 'Li-Po 6S',
                    batteryCapacity: '22000 мАч',
                    features: [
                        'Модульная полезная нагрузка',
                        'Устойчивость к РЭБ',
                        'Автономный полет',
                        'Точное позиционирование RTK',
                        'Композитный корпус'
                    ]
                },
                price: 'По запросу',
                availability: 'Предзаказ'
            },
            synergia: {
                id: 'synergia',
                name: 'Synergia 1.0',
                fullName: 'AEROTECH Synergia 1.0',
                category: 'Программная платформа',
                image: '/images/synergia-platform.jpg',
                status: 'Разработка',
                readiness: '15%',
                specs: {
                    type: 'ПО для управления',
                    features: [
                        'Планирование миссий',
                        'Мониторинг в реальном времени',
                        '3D визуализация',
                        'Управление флотом',
                        'Аналитика данных'
                    ]
                },
                price: 'По запросу',
                availability: 'Разработка'
            },
            sr: {
                id: 'sr',
                name: 'SR',
                fullName: 'AEROTECH SR',
                category: 'Разведывательный дрон',
                image: '/images/sr-drone.jpg',
                status: 'Концепт',
                readiness: '5%',
                specs: {
                    type: 'Разведывательный БПЛА',
                    features: [
                        'Малозаметность',
                        'Длительный полет',
                        'Тепловизор',
                        'Ночное видение',
                        'Криптозащита'
                    ]
                },
                price: 'TBA',
                availability: 'Концепт'
            }
        };
    }

    createComparisonTool() {
        const tool = document.createElement('div');
        tool.className = 'comparison-tool';
        tool.innerHTML = `
            <div class="comparison-overlay"></div>
            <div class="comparison-modal">
                <div class="comparison-header">
                    <h2>Сравнение моделей</h2>
                    <button class="comparison-close" aria-label="Закрыть">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <div class="comparison-selector">
                    <p>Выберите до ${this.maxComparisons} моделей для сравнения:</p>
                    <div class="comparison-models">
                        ${Object.values(this.models).map(model => this.renderModelCard(model)).join('')}
                    </div>
                </div>
                <div class="comparison-table-container" style="display: none;">
                    <div class="comparison-actions">
                        <button class="btn-outline btn-small comparison-reset">Начать заново</button>
                        <button class="btn-gradient btn-small comparison-export">Распечатать</button>
                    </div>
                    <div class="comparison-table"></div>
                </div>
            </div>
        `;
        
        document.body.appendChild(tool);
        
        // Setup event listeners
        this.setupEventListeners(tool);
    }

    renderModelCard(model) {
        return `
            <div class="comparison-model-card" data-model-id="${model.id}">
                <div class="comparison-model-image">
                    <img src="${model.image}" alt="${model.fullName}" data-fallback="true">
                </div>
                <div class="comparison-model-info">
                    <h3>${model.name}</h3>
                    <p>${model.category}</p>
                    <span class="model-status">${model.status} (${model.readiness})</span>
                </div>
                <button class="comparison-model-select">
                    <span class="select-text">Выбрать</span>
                    <span class="selected-check" style="display: none;">✓</span>
                </button>
            </div>
        `;
    }

    setupEventListeners(tool) {
        // Close button
        tool.querySelector('.comparison-close').addEventListener('click', () => {
            this.close();
        });
        
        // Overlay click
        tool.querySelector('.comparison-overlay').addEventListener('click', () => {
            this.close();
        });
        
        // Model selection
        tool.querySelectorAll('.comparison-model-card').forEach(card => {
            const button = card.querySelector('.comparison-model-select');
            button.addEventListener('click', () => {
                const modelId = card.dataset.modelId;
                this.toggleModel(modelId, card);
            });
        });
        
        // Reset button
        tool.querySelector('.comparison-reset').addEventListener('click', () => {
            this.reset();
        });
        
        // Export button
        tool.querySelector('.comparison-export').addEventListener('click', () => {
            this.printComparison();
        });
        
        // Setup image error handling
        this.setupImageErrorHandling(tool);
    }

    setupImageErrorHandling(container) {
        container.querySelectorAll('img[data-fallback]').forEach(img => {
            img.addEventListener('error', () => {
                img.src = '/images/placeholder.jpg';
                img.removeAttribute('data-fallback');
            });
        });
    }

    setupComparisonTriggers() {
        // Add "Compare" button to product pages
        document.querySelectorAll('[data-comparison-trigger]').forEach(trigger => {
            trigger.addEventListener('click', () => {
                const modelId = trigger.dataset.modelId;
                this.open(modelId);
            });
        });
    }

    toggleModel(modelId, card) {
        const index = this.selectedModels.indexOf(modelId);
        
        if (index > -1) {
            // Deselect
            this.selectedModels.splice(index, 1);
            card.classList.remove('selected');
            card.querySelector('.select-text').style.display = 'inline';
            card.querySelector('.selected-check').style.display = 'none';
        } else {
            // Select
            if (this.selectedModels.length >= this.maxComparisons) {
                this.showNotification(`Можно выбрать максимум ${this.maxComparisons} модели`);
                return;
            }
            
            this.selectedModels.push(modelId);
            card.classList.add('selected');
            card.querySelector('.select-text').style.display = 'none';
            card.querySelector('.selected-check').style.display = 'inline';
        }
        
        // Update comparison table
        if (this.selectedModels.length >= 2) {
            this.showComparisonTable();
        } else {
            this.hideComparisonTable();
        }
        
        // Track selection
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('comparison_model_toggled', {
                modelId: modelId,
                selected: index === -1,
                totalSelected: this.selectedModels.length
            });
        }
    }

    showComparisonTable() {
        const container = document.querySelector('.comparison-table-container');
        const table = document.querySelector('.comparison-table');
        
        container.style.display = 'block';
        table.innerHTML = this.renderComparisonTable();
        
        // Setup image error handling for table images
        this.setupImageErrorHandling(table);
        
        // Scroll to table
        container.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    hideComparisonTable() {
        const container = document.querySelector('.comparison-table-container');
        container.style.display = 'none';
    }

    renderComparisonTable() {
        const selectedModelsData = this.selectedModels.map(id => this.models[id]);
        
        // Get all spec keys
        const allSpecKeys = new Set();
        selectedModelsData.forEach(model => {
            if (model.specs) {
                Object.keys(model.specs).forEach(key => allSpecKeys.add(key));
            }
        });
        
        const specLabels = {
            type: 'Тип',
            wingspan: 'Размах крыльев',
            length: 'Длина',
            height: 'Высота',
            weight: 'Вес',
            maxTakeoffWeight: 'Макс. взлетный вес',
            payloadCapacity: 'Полезная нагрузка',
            maxSpeed: 'Макс. скорость',
            cruiseSpeed: 'Крейсерская скорость',
            maxFlightTime: 'Время полета',
            maxRange: 'Дальность',
            ceiling: 'Макс. высота',
            windResistance: 'Ветроустойчивость',
            positioning: 'Позиционирование',
            protection: 'Защита',
            powerSource: 'Питание',
            batteryCapacity: 'Емкость батареи',
            features: 'Особенности'
        };
        
        let html = '<table class="comparison-specs-table">';
        
        // Header row
        html += '<thead><tr><th>Характеристика</th>';
        selectedModelsData.forEach(model => {
            html += `
                <th class="model-column">
                    <div class="model-header">
                        <img src="${model.image}" alt="${model.name}" data-fallback="true">
                        <h4>${model.fullName}</h4>
                        <span class="model-category">${model.category}</span>
                    </div>
                </th>
            `;
        });
        html += '</tr></thead>';
        
        // Spec rows
        html += '<tbody>';
        allSpecKeys.forEach(key => {
            if (key === 'features') return; // Handle features separately
            
            html += `<tr><td class="spec-label">${specLabels[key] || key}</td>`;
            selectedModelsData.forEach(model => {
                const value = model.specs?.[key] || '—';
                html += `<td class="spec-value">${value}</td>`;
            });
            html += '</tr>';
        });
        
        // Features row
        html += '<tr><td class="spec-label">Особенности</td>';
        selectedModelsData.forEach(model => {
            const features = model.specs?.features || [];
            html += `
                <td class="spec-value">
                    <ul class="feature-list">
                        ${features.map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </td>
            `;
        });
        html += '</tr>';
        
        // Price and availability
        html += '<tr class="spec-highlight"><td class="spec-label">Цена</td>';
        selectedModelsData.forEach(model => {
            html += `<td class="spec-value"><strong>${model.price}</strong></td>`;
        });
        html += '</tr>';
        
        html += '<tr class="spec-highlight"><td class="spec-label">Доступность</td>';
        selectedModelsData.forEach(model => {
            html += `<td class="spec-value"><strong>${model.availability}</strong></td>`;
        });
        html += '</tr>';
        
        html += '</tbody></table>';
        
        return html;
    }

    open(modelId = null) {
        const tool = document.querySelector('.comparison-tool');
        tool.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        if (modelId && !this.selectedModels.includes(modelId)) {
            const card = tool.querySelector(`[data-model-id="${modelId}"]`);
            if (card) {
                this.toggleModel(modelId, card);
            }
        }
        
        // Track open
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('comparison_opened', {
                preselectedModel: modelId
            });
        }
    }

    close() {
        const tool = document.querySelector('.comparison-tool');
        tool.classList.remove('active');
        document.body.style.overflow = '';
    }

    reset() {
        // Deselect all models
        this.selectedModels.forEach(modelId => {
            const card = document.querySelector(`[data-model-id="${modelId}"]`);
            if (card) {
                card.classList.remove('selected');
                card.querySelector('.select-text').style.display = 'inline';
                card.querySelector('.selected-check').style.display = 'none';
            }
        });
        
        this.selectedModels = [];
        this.hideComparisonTable();
        
        // Track reset
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('comparison_reset');
        }
    }

    printComparison() {
        // Print the comparison table
        window.print();
        
        // Track print
        if (window.AerotechAnalytics) {
            window.AerotechAnalytics.track('comparison_printed', {
                models: this.selectedModels
            });
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'comparison-notification';
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize drone comparator
window.addEventListener('DOMContentLoaded', () => {
    window.AerotechComparator = new DroneComparator();
});

// Add comparison tool styles
const comparatorStyles = document.createElement('style');
comparatorStyles.textContent = `
    .comparison-tool {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 99999;
        display: none;
    }
    
    .comparison-tool.active {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .comparison-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.9);
        backdrop-filter: blur(4px);
    }
    
    .comparison-modal {
        position: relative;
        z-index: 1;
        width: 95%;
        max-width: 1400px;
        max-height: 90vh;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 16px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: modalSlideIn 0.4s ease-out;
    }
    
    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .comparison-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 24px 32px;
        border-bottom: 1px solid #333;
        background: rgba(0, 192, 192, 0.05);
    }
    
    .comparison-header h2 {
        margin: 0;
        font-size: 28px;
        color: white;
        font-weight: 700;
    }
    
    .comparison-close {
        background: transparent;
        border: none;
        color: #666;
        cursor: pointer;
        padding: 4px;
        display: flex;
        transition: color 0.2s;
    }
    
    .comparison-close:hover {
        color: white;
    }
    
    .comparison-selector,
    .comparison-table-container {
        padding: 32px;
        overflow-y: auto;
    }
    
    .comparison-models {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
        margin-top: 24px;
    }
    
    .comparison-model-card {
        background: rgba(255, 255, 255, 0.03);
        border: 2px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        overflow: hidden;
        transition: all 0.3s;
    }
    
    .comparison-model-card:hover {
        border-color: rgba(0, 192, 192, 0.5);
        transform: translateY(-4px);
    }
    
    .comparison-model-card.selected {
        border-color: #00c0c0;
        background: rgba(0, 192, 192, 0.1);
    }
    
    .comparison-model-image {
        width: 100%;
        height: 180px;
        overflow: hidden;
        background: #1a1a1a;
    }
    
    .comparison-model-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    
    .comparison-model-info {
        padding: 16px;
    }
    
    .comparison-model-info h3 {
        margin: 0 0 8px 0;
        font-size: 20px;
        color: white;
    }
    
    .comparison-model-info p {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #b0b0b0;
    }
    
    .model-status {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(0, 192, 192, 0.2);
        border-radius: 12px;
        font-size: 12px;
        color: #00c0c0;
    }
    
    .comparison-model-select {
        width: 100%;
        padding: 12px;
        background: linear-gradient(135deg, #00c0c0, #00a0a0);
        border: none;
        color: #0a0a0a;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
    }
    
    .comparison-model-select:hover {
        background: linear-gradient(135deg, #00d5d5, #00b5b5);
    }
    
    .comparison-model-card.selected .comparison-model-select {
        background: #00c851;
    }
    
    .comparison-actions {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
        justify-content: flex-end;
    }
    
    .comparison-specs-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(255, 255, 255, 0.02);
        border-radius: 8px;
        overflow: hidden;
    }
    
    .comparison-specs-table th,
    .comparison-specs-table td {
        padding: 16px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .comparison-specs-table thead th {
        background: rgba(0, 192, 192, 0.1);
        color: white;
        font-weight: 600;
    }
    
    .model-column {
        min-width: 250px;
    }
    
    .model-header {
        text-align: center;
    }
    
    .model-header img {
        width: 80px;
        height: 80px;
        border-radius: 8px;
        object-fit: cover;
        margin-bottom: 12px;
    }
    
    .model-header h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        color: white;
    }
    
    .model-category {
        font-size: 12px;
        color: #b0b0b0;
    }
    
    .spec-label {
        font-weight: 600;
        color: #00c0c0;
        min-width: 200px;
    }
    
    .spec-value {
        color: #b0b0b0;
    }
    
    .spec-highlight {
        background: rgba(0, 192, 192, 0.05);
    }
    
    .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    
    .feature-list li {
        padding: 4px 0;
        padding-left: 20px;
        position: relative;
    }
    
    .feature-list li:before {
        content: "✓";
        position: absolute;
        left: 0;
        color: #00c0c0;
    }
    
    .comparison-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        z-index: 100000;
        padding: 16px 24px;
        background: rgba(15, 15, 15, 0.98);
        border: 1px solid #00c0c0;
        border-radius: 8px;
        color: white;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        box-shadow: 0 4px 20px rgba(0, 192, 192, 0.3);
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s;
    }
    
    .comparison-notification.show {
        opacity: 1;
        transform: translateX(0);
    }
    
    @media (max-width: 768px) {
        .comparison-modal {
            width: 100%;
            max-height: 100vh;
            border-radius: 0;
        }
        
        .comparison-models {
            grid-template-columns: 1fr;
        }
        
        .comparison-specs-table {
            font-size: 14px;
        }
        
        .comparison-specs-table th,
        .comparison-specs-table td {
            padding: 12px 8px;
        }
    }
    
    @media print {
        .comparison-header,
        .comparison-actions,
        .comparison-selector {
            display: none !important;
        }
        
        .comparison-tool {
            display: block !important;
        }
        
        .comparison-modal {
            max-height: none;
            border: none;
        }
    }
`;
document.head.appendChild(comparatorStyles);

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DroneComparator;
}
