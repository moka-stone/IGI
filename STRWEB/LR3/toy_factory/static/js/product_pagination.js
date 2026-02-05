// Клиентская пагинация для каталога товаров
class ProductPagination {
    constructor() {
        this.products = [];
        this.currentPage = 1;
        this.itemsPerPage = parseInt(localStorage.getItem('productsPerPage')) || 3;
        this.init();
    }

    init() {
        // Собираем все товары со страницы
        const productCards = document.querySelectorAll('.product-card');
        
        if (productCards.length === 0) {
            console.warn('ProductPagination: No product cards found');
            return;
        }
        
        productCards.forEach((card, index) => {
            this.products.push({
                element: card,
                index: index
            });
        });

        // Устанавливаем значение селектора
        const perPageSelect = document.getElementById('per-page-select');
        if (perPageSelect) {
            perPageSelect.value = this.itemsPerPage;
            perPageSelect.addEventListener('change', (e) => {
                this.itemsPerPage = parseInt(e.target.value);
                localStorage.setItem('productsPerPage', this.itemsPerPage);
                this.currentPage = 1;
                this.render();
            });
        } else {
            console.warn('ProductPagination: per-page-select element not found');
        }

        // Рендерим первую страницу
        this.render();
        
        // Применяем эффект 3D к видимым карточкам после рендера
        this.init3DEffects();
    }
    
    init3DEffects() {
        // Применяем эффект 3D только к видимым карточкам
        const visibleCards = Array.from(this.products)
            .slice((this.currentPage - 1) * this.itemsPerPage, this.currentPage * this.itemsPerPage)
            .map(item => item.element);
        
        visibleCards.forEach(card => {
            // Проверяем, не применен ли уже эффект
            if (card.dataset.effect3d === 'true') {
                return;
            }
            
            card.dataset.effect3d = 'true';
            
            card.addEventListener('mouseenter', function() {
                this.style.transition = 'none';
            });
            
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
                this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transition = 'transform 0.5s ease-out, box-shadow 0.5s ease-out';
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
                this.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
            });
        });
    }

    render() {
        // Скрываем все товары
        this.products.forEach(item => {
            item.element.style.display = 'none';
        });

        // Показываем товары текущей страницы
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageProducts = this.products.slice(start, end);

        pageProducts.forEach(item => {
            item.element.style.display = 'block';
        });

        // Рендерим пагинацию
        this.renderPagination();
        
        // Применяем эффект 3D к видимым карточкам
        this.init3DEffects();
    }

    renderPagination() {
        const totalPages = Math.ceil(this.products.length / this.itemsPerPage);
        const paginationWrapper = document.getElementById('pagination-wrapper');

        if (!paginationWrapper) {
            console.error('ProductPagination: pagination-wrapper element not found');
            return;
        }

        if (totalPages <= 1) {
            paginationWrapper.innerHTML = '';
            return;
        }

        let html = `
            <div class="pagination-info">
                Страница ${this.currentPage} из ${totalPages}
            </div>
            <div class="pagination">
        `;

        // Кнопка "Первая"
        if (this.currentPage > 1) {
            html += `<button class="page-link" data-page="1">Первая</button>`;
        }

        // Кнопка "Назад"
        if (this.currentPage > 1) {
            html += `<button class="page-link" data-page="${this.currentPage - 1}">Назад</button>`;
        }

        // Номера страниц
        const maxVisible = 5;
        let startPage = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
        let endPage = Math.min(totalPages, startPage + maxVisible - 1);

        if (endPage - startPage < maxVisible - 1) {
            startPage = Math.max(1, endPage - maxVisible + 1);
        }

        if (startPage > 1) {
            html += `<button class="page-link" data-page="1">1</button>`;
            if (startPage > 2) {
                html += `<span class="page-ellipsis">...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            if (i === this.currentPage) {
                html += `<span class="page-link active">${i}</span>`;
            } else {
                html += `<button class="page-link" data-page="${i}">${i}</button>`;
            }
        }

        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += `<span class="page-ellipsis">...</span>`;
            }
            html += `<button class="page-link" data-page="${totalPages}">${totalPages}</button>`;
        }

        // Кнопка "Вперед"
        if (this.currentPage < totalPages) {
            html += `<button class="page-link" data-page="${this.currentPage + 1}">Вперед</button>`;
        }

        // Кнопка "Последняя"
        if (this.currentPage < totalPages) {
            html += `<button class="page-link" data-page="${totalPages}">Последняя</button>`;
        }

        html += `</div>`;
        paginationWrapper.innerHTML = html;

        // Обработчики кликов
        paginationWrapper.querySelectorAll('.page-link[data-page]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentPage = parseInt(e.target.dataset.page);
                this.render();
            });
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new ProductPagination();
});

