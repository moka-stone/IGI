// Класс для управления таблицей контактов
class ContactsTable {
    constructor(data) {
        this.originalData = data;
        this.filteredData = [...data];
        this.currentData = [...data];
        this.currentPage = 1;
        this.itemsPerPage = 3;
        this.sortColumn = null;
        this.sortDirection = 'asc';
        this.selectedRows = new Set();
        
        this.init();
    }

    init() {
        this.renderTable();
        this.setupEventListeners();
        this.renderPagination();
    }

    setupEventListeners() {
        // Кнопка добавления
        document.getElementById('add-btn').addEventListener('click', () => {
            document.getElementById('add-form-container').style.display = 'block';
        });

        // Кнопка отмены
        document.getElementById('cancel-btn').addEventListener('click', () => {
            document.getElementById('add-form-container').style.display = 'none';
            this.resetForm();
        });

        // Сортировка по заголовкам
        document.querySelectorAll('.sortable').forEach(header => {
            header.addEventListener('click', (e) => {
                const column = e.target.closest('.sortable').dataset.column;
                this.sortTable(column);
            });
        });

        // Фильтрация
        document.getElementById('filter-btn').addEventListener('click', () => {
            this.filterTable();
        });

        // Форма добавления
        document.getElementById('add-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addContact();
        });

        // Валидация URL
        document.getElementById('photo-url').addEventListener('blur', () => {
            this.validateURL();
            this.checkFormValidity();
        });

        // Валидация телефона
        document.getElementById('phone').addEventListener('blur', () => {
            this.validatePhone();
            this.checkFormValidity();
        });

        // Проверка валидности формы при изменении полей
        ['name', 'position', 'description', 'email'].forEach(field => {
            document.getElementById(field).addEventListener('input', () => {
                this.checkFormValidity();
            });
        });

        // Кнопка премирования
        document.getElementById('premiate-btn').addEventListener('click', () => {
            this.premiateSelected();
        });
    }

    renderTable() {
        const tbody = document.getElementById('table-body');
        tbody.innerHTML = '';

        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageData = this.currentData.slice(start, end);

        pageData.forEach((contact, index) => {
            const row = document.createElement('tr');
            row.dataset.id = contact.id;
            row.dataset.index = start + index;
            
            row.innerHTML = `
                <td>${this.escapeHtml(contact.name)}</td>
                <td><img src="${this.escapeHtml(contact.photo)}" alt="${this.escapeHtml(contact.name)}" class="contact-photo-small"></td>
                <td>${this.escapeHtml(contact.position)}</td>
                <td>${this.escapeHtml(contact.description)}</td>
                <td>${this.escapeHtml(contact.phone)}</td>
                <td>${this.escapeHtml(contact.email)}</td>
                <td><input type="checkbox" class="row-checkbox" data-id="${contact.id}"></td>
            `;

            // Клик по строке
            row.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    this.showRowDetails(contact);
                }
            });

            // Чекбокс
            const checkbox = row.querySelector('.row-checkbox');
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedRows.add(contact.id);
                } else {
                    this.selectedRows.delete(contact.id);
                }
                this.updateSelectedInfo();
            });

            tbody.appendChild(row);
        });

        // Обновляем индикаторы сортировки
        this.updateSortIndicators();
    }

    sortTable(column) {
        if (this.sortColumn === column) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortColumn = column;
            this.sortDirection = 'asc';
        }

        this.currentData.sort((a, b) => {
            let aVal = a[column];
            let bVal = b[column];

            if (column === 'photo') {
                return 0; // Не сортируем по фото
            }

            if (typeof aVal === 'string') {
                aVal = aVal.toLowerCase();
                bVal = bVal.toLowerCase();
            }

            if (this.sortDirection === 'asc') {
                return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
            } else {
                return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
            }
        });

        this.currentPage = 1;
        this.renderTable();
        this.renderPagination();
    }

    updateSortIndicators() {
        document.querySelectorAll('.sort-indicator').forEach(indicator => {
            indicator.textContent = '';
        });

        if (this.sortColumn) {
            const header = document.querySelector(`[data-column="${this.sortColumn}"]`);
            if (header) {
                const indicator = header.nextElementSibling;
                indicator.textContent = this.sortDirection === 'asc' ? ' ↑' : ' ↓';
            }
        }
    }

    filterTable() {
        const filterText = document.getElementById('filter-input').value.toLowerCase();
        
        if (!filterText) {
            this.currentData = [...this.filteredData];
        } else {
            this.currentData = this.filteredData.filter(contact => {
                return Object.values(contact).some(value => 
                    String(value).toLowerCase().includes(filterText)
                );
            });
        }

        this.currentPage = 1;
        this.renderTable();
        this.renderPagination();
    }

    renderPagination() {
        const pagination = document.getElementById('pagination');
        const totalPages = Math.ceil(this.currentData.length / this.itemsPerPage);

        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }

        let html = '';
        
        // Кнопка "Назад"
        html += `<button class="page-btn" ${this.currentPage === 1 ? 'disabled' : ''} data-page="${this.currentPage - 1}">Назад</button>`;

        // Номера страниц
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="page-btn ${i === this.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }

        // Кнопка "Вперед"
        html += `<button class="page-btn" ${this.currentPage === totalPages ? 'disabled' : ''} data-page="${this.currentPage + 1}">Вперед</button>`;

        pagination.innerHTML = html;

        // Обработчики кликов
        pagination.querySelectorAll('.page-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!e.target.disabled) {
                    this.currentPage = parseInt(e.target.dataset.page);
                    this.renderTable();
                    this.renderPagination();
                }
            });
        });
    }

    showRowDetails(contact) {
        const detailsDiv = document.getElementById('row-details');
        detailsDiv.innerHTML = `
            <h3>Детали сотрудника</h3>
            <p><strong>ФИО:</strong> ${this.escapeHtml(contact.name)}</p>
            <p><strong>Должность:</strong> ${this.escapeHtml(contact.position)}</p>
            <p><strong>Описание:</strong> ${this.escapeHtml(contact.description)}</p>
            <p><strong>Телефон:</strong> ${this.escapeHtml(contact.phone)}</p>
            <p><strong>Email:</strong> ${this.escapeHtml(contact.email)}</p>
            <img src="${this.escapeHtml(contact.photo)}" alt="${this.escapeHtml(contact.name)}" class="contact-photo-large">
        `;
    }

    validateURL() {
        const urlInput = document.getElementById('photo-url');
        const url = urlInput.value.trim();
        const validationSpan = document.getElementById('url-validation');

        // URL должен начинаться с http:// или https:// и заканчиваться на .php или .html
        const urlPattern = /^https?:\/\/.+\.(php|html)$/i;

        if (!url) {
            validationSpan.textContent = '';
            urlInput.classList.remove('invalid');
            return false;
        }

        if (urlPattern.test(url)) {
            validationSpan.textContent = '✓ Валидный URL';
            validationSpan.className = 'validation-message valid';
            urlInput.classList.remove('invalid');
            return true;
        } else {
            validationSpan.textContent = '✗ URL должен начинаться с http:// или https:// и заканчиваться на .php или .html';
            validationSpan.className = 'validation-message invalid';
            urlInput.classList.add('invalid');
            return false;
        }
    }

    validatePhone() {
        const phoneInput = document.getElementById('phone');
        const phone = phoneInput.value.trim();
        const validationSpan = document.getElementById('phone-validation');

        // Телефон может начинаться с +375 или 8, код оператора в скобках или без, остальное с дефисами и пробелами
        const phonePattern = /^(\+375|8)\s?\(?\d{2,3}\)?\s?\d{2,3}[\s-]?\d{2}[\s-]?\d{2}$/;

        if (!phone) {
            validationSpan.textContent = '';
            phoneInput.classList.remove('invalid');
            return false;
        }

        if (phonePattern.test(phone)) {
            validationSpan.textContent = '✓ Валидный телефон';
            validationSpan.className = 'validation-message valid';
            phoneInput.classList.remove('invalid');
            return true;
        } else {
            validationSpan.textContent = '✗ Неверный формат телефона';
            validationSpan.className = 'validation-message invalid';
            phoneInput.classList.add('invalid');
            return false;
        }
    }

    checkFormValidity() {
        const name = document.getElementById('name').value.trim();
        const position = document.getElementById('position').value.trim();
        const description = document.getElementById('description').value.trim();
        const email = document.getElementById('email').value.trim();
        const urlValid = this.validateURL();
        const phoneValid = this.validatePhone();

        const submitBtn = document.getElementById('submit-btn');
        
        if (name && position && description && email && urlValid && phoneValid) {
            submitBtn.disabled = false;
        } else {
            submitBtn.disabled = true;
        }
    }

    addContact() {
        const name = document.getElementById('name').value.trim();
        const position = document.getElementById('position').value.trim();
        const photoUrl = document.getElementById('photo-url').value.trim();
        const description = document.getElementById('description').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();

        const newContact = {
            id: Date.now(), // Временный ID
            name: name,
            position: position,
            photo: photoUrl,
            description: description,
            phone: phone,
            email: email
        };

        this.originalData.push(newContact);
        this.filteredData.push(newContact);
        this.currentData.push(newContact);

        // Сбрасываем фильтр и сортировку
        document.getElementById('filter-input').value = '';
        this.sortColumn = null;
        this.currentPage = Math.ceil(this.currentData.length / this.itemsPerPage);
        
        this.renderTable();
        this.renderPagination();
        this.resetForm();
        document.getElementById('add-form-container').style.display = 'none';
    }

    resetForm() {
        document.getElementById('add-form').reset();
        document.getElementById('url-validation').textContent = '';
        document.getElementById('phone-validation').textContent = '';
        document.getElementById('url-validation').className = 'validation-message';
        document.getElementById('phone-validation').className = 'validation-message';
        document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
        document.getElementById('submit-btn').disabled = true;
    }

    updateSelectedInfo() {
        const infoDiv = document.getElementById('selected-info');
        if (this.selectedRows.size > 0) {
            infoDiv.textContent = `Выбрано сотрудников: ${this.selectedRows.size}`;
        } else {
            infoDiv.textContent = '';
        }
    }

    premiateSelected() {
        if (this.selectedRows.size === 0) {
            alert('Выберите сотрудников для премирования');
            return;
        }

        // Показываем прелоадер
        const preloaderContainer = document.getElementById('preloader-container');
        preloaderContainer.style.display = 'block';

        // Через 5 секунд скрываем прелоадер и показываем результат
        setTimeout(() => {
            preloaderContainer.style.display = 'none';

            const selectedContacts = this.originalData.filter(contact => 
                this.selectedRows.has(contact.id)
            );

            const surnames = selectedContacts.map(contact => {
                const parts = contact.name.split(' ');
                return parts[0]; // Фамилия (первое слово)
            });

            const resultDiv = document.getElementById('premiate-result');
            resultDiv.innerHTML = `
                <h3>Текст премирования</h3>
                <p>Поздравляем сотрудников ${surnames.join(', ')} с получением премии за отличную работу!</p>
            `;

            // Сбрасываем выбор
            this.selectedRows.clear();
            document.querySelectorAll('.row-checkbox').forEach(cb => cb.checked = false);
            this.updateSelectedInfo();
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (typeof contactsData !== 'undefined') {
        new ContactsTable(contactsData);
    }
});

