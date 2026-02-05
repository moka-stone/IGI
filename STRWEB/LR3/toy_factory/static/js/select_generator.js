// Класс для генерации элементов Select
class SelectGenerator {
    constructor() {
        this.selects = [];
        this.init();
    }

    init() {
        // Загружаем сохраненные элементы из localStorage
        this.loadFromStorage();
        
        // Обработчик чекбокса включения генератора
        const enableCheckbox = document.getElementById('enable-select-generator');
        const container = document.getElementById('select-generator-container');
        
        enableCheckbox.addEventListener('change', (e) => {
            if (e.target.checked) {
                container.style.display = 'block';
            } else {
                container.style.display = 'none';
            }
        });

        // Кнопка добавления нового select
        document.getElementById('add-select-btn').addEventListener('click', () => {
            this.addSelect();
        });

        // Восстанавливаем состояние чекбокса
        const savedState = localStorage.getItem('selectGeneratorEnabled');
        if (savedState === 'true') {
            enableCheckbox.checked = true;
            container.style.display = 'block';
        }
        
        enableCheckbox.addEventListener('change', (e) => {
            localStorage.setItem('selectGeneratorEnabled', e.target.checked);
        });
    }

    addSelect() {
        const selectId = Date.now();
        const selectData = {
            id: selectId,
            name: '',
            multiple: false,
            size: 1,
            required: false,
            disabled: false,
            options: []
        };

        this.selects.push(selectData);
        this.renderSelect(selectData);
        this.saveToStorage();
    }

    renderSelect(selectData) {
        const container = document.getElementById('selects-container');
        const selectWrapper = document.createElement('div');
        selectWrapper.className = 'select-wrapper';
        selectWrapper.dataset.id = selectData.id;

        selectWrapper.innerHTML = `
            <div class="select-controls">
                <h4>Элемент Select #${this.selects.indexOf(selectData) + 1}</h4>
                <button class="btn-delete" data-id="${selectData.id}">Удалить</button>
            </div>
            <div class="select-config">
                <div class="config-group">
                    <label>
                        <input type="text" class="config-name" placeholder="name" value="${selectData.name}" data-id="${selectData.id}">
                        <span>name</span>
                    </label>
                </div>
                <div class="config-group">
                    <label>
                        <input type="checkbox" class="config-multiple" ${selectData.multiple ? 'checked' : ''} data-id="${selectData.id}">
                        <span>multiple</span>
                    </label>
                </div>
                <div class="config-group">
                    <label>
                        <input type="number" class="config-size" min="1" value="${selectData.size}" data-id="${selectData.id}">
                        <span>size</span>
                    </label>
                </div>
                <div class="config-group">
                    <label>
                        <input type="checkbox" class="config-required" ${selectData.required ? 'checked' : ''} data-id="${selectData.id}">
                        <span>required</span>
                    </label>
                </div>
                <div class="config-group">
                    <label>
                        <input type="checkbox" class="config-disabled" ${selectData.disabled ? 'checked' : ''} data-id="${selectData.id}">
                        <span>disabled</span>
                    </label>
                </div>
                <div class="config-group">
                    <label>
                        <input type="text" class="config-options" placeholder="Опции через запятую" data-id="${selectData.id}">
                        <span>Опции</span>
                    </label>
                </div>
            </div>
            <div class="select-preview">
                <label>Сгенерированный select:</label>
                <select class="preview-select" data-id="${selectData.id}"></select>
            </div>
        `;

        container.appendChild(selectWrapper);

        // Обработчики событий для настройки атрибутов
        this.setupEventListeners(selectWrapper, selectData);
        
        // Обновляем предпросмотр
        this.updatePreview(selectData);
    }

    setupEventListeners(wrapper, selectData) {
        // name
        wrapper.querySelector('.config-name').addEventListener('input', (e) => {
            selectData.name = e.target.value;
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // multiple
        wrapper.querySelector('.config-multiple').addEventListener('change', (e) => {
            selectData.multiple = e.target.checked;
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // size
        wrapper.querySelector('.config-size').addEventListener('input', (e) => {
            selectData.size = parseInt(e.target.value) || 1;
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // required
        wrapper.querySelector('.config-required').addEventListener('change', (e) => {
            selectData.required = e.target.checked;
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // disabled
        wrapper.querySelector('.config-disabled').addEventListener('change', (e) => {
            selectData.disabled = e.target.checked;
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // options
        wrapper.querySelector('.config-options').addEventListener('input', (e) => {
            const optionsText = e.target.value;
            selectData.options = optionsText.split(',').map(opt => opt.trim()).filter(opt => opt);
            this.updatePreview(selectData);
            this.saveToStorage();
        });

        // Удаление
        wrapper.querySelector('.btn-delete').addEventListener('click', () => {
            this.removeSelect(selectData.id);
        });
    }

    updatePreview(selectData) {
        const preview = document.querySelector(`.preview-select[data-id="${selectData.id}"]`);
        if (!preview) return;

        // Очищаем предыдущие опции
        preview.innerHTML = '';

        // Устанавливаем атрибуты
        if (selectData.name) {
            preview.name = selectData.name;
        } else {
            preview.removeAttribute('name');
        }

        if (selectData.multiple) {
            preview.setAttribute('multiple', '');
        } else {
            preview.removeAttribute('multiple');
        }

        preview.size = selectData.size;

        if (selectData.required) {
            preview.setAttribute('required', '');
        } else {
            preview.removeAttribute('required');
        }

        if (selectData.disabled) {
            preview.setAttribute('disabled', '');
        } else {
            preview.removeAttribute('disabled');
        }

        // Добавляем опции
        if (selectData.options.length > 0) {
            selectData.options.forEach((optionText, index) => {
                const option = document.createElement('option');
                option.value = `option${index + 1}`;
                option.textContent = optionText;
                preview.appendChild(option);
            });
        } else {
            // Добавляем пустую опцию по умолчанию
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Выберите...';
            preview.appendChild(option);
        }
    }

    removeSelect(id) {
        this.selects = this.selects.filter(select => select.id !== id);
        const wrapper = document.querySelector(`.select-wrapper[data-id="${id}"]`);
        if (wrapper) {
            wrapper.remove();
        }
        this.saveToStorage();
        this.updateNumbers();
    }

    updateNumbers() {
        document.querySelectorAll('.select-wrapper').forEach((wrapper, index) => {
            const h4 = wrapper.querySelector('h4');
            if (h4) {
                h4.textContent = `Элемент Select #${index + 1}`;
            }
        });
    }

    saveToStorage() {
        localStorage.setItem('generatedSelects', JSON.stringify(this.selects));
    }

    loadFromStorage() {
        const saved = localStorage.getItem('generatedSelects');
        if (saved) {
            try {
                this.selects = JSON.parse(saved);
                this.selects.forEach(selectData => {
                    this.renderSelect(selectData);
                });
            } catch (e) {
                console.error('Ошибка загрузки сохраненных элементов:', e);
            }
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new SelectGenerator();
});


