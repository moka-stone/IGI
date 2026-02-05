// Класс для слайдера
class ImageSlider {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        // Параметры по умолчанию
        this.options = {
            images: options.images || [],
            links: options.links || [],
            captions: options.captions || [],
            loop: options.loop !== undefined ? options.loop : true,
            navs: options.navs !== undefined ? options.navs : true,
            pags: options.pags !== undefined ? options.pags : true,
            auto: options.auto !== undefined ? options.auto : true,
            stopMouseHover: options.stopMouseHover !== undefined ? options.stopMouseHover : true,
            delay: options.delay || 5
        };

        this.currentIndex = 0;
        this.autoInterval = null;
        this.isPaused = false;

        this.init();
    }

    init() {
        // Создание структуры слайдера
        this.createSliderStructure();
        
        // Инициализация слайдов
        this.renderSlides();
        
        // Создание навигации
        if (this.options.navs) {
            this.createNavigation();
        }
        
        // Создание пагинации
        if (this.options.pags) {
            this.createPagination();
        }
        
        // Создание счетчика слайдов
        this.createCounter();
        
        // Запуск автопрокрутки
        if (this.options.auto) {
            this.startAutoSlide();
        }
    }

    createSliderStructure() {
        this.container.innerHTML = '';
        this.container.className = 'slider-container';
        
        // Основной контейнер слайдов
        this.slidesContainer = document.createElement('div');
        this.slidesContainer.className = 'slides-container';
        this.container.appendChild(this.slidesContainer);

        // Контейнер для элементов управления (пагинация и счетчик)
        this.controlsContainer = document.createElement('div');
        this.controlsContainer.className = 'slider-controls';
        this.container.appendChild(this.controlsContainer);
    }

    renderSlides() {
        this.slidesContainer.innerHTML = '';
        
        this.options.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            if (index === 0) {
                slide.classList.add('active');
            }

            const link = document.createElement('a');
            link.href = this.options.links[index] || '#';
            link.className = 'slide-link';

            const img = document.createElement('img');
            img.src = image;
            img.alt = `Slide ${index + 1}`;
            img.className = 'slide-image';

            link.appendChild(img);

            // Добавление подписи
            if (this.options.captions[index]) {
                const caption = document.createElement('div');
                caption.className = 'slide-caption';
                caption.textContent = this.options.captions[index];
                link.appendChild(caption);
            }

            slide.appendChild(link);
            this.slidesContainer.appendChild(slide);
        });

        // Обработчик наведения мыши (для stopMouseHover)
        if (this.options.auto && this.options.stopMouseHover) {
            this.slidesContainer.addEventListener('mouseenter', () => {
                this.pauseAutoSlide();
            });
            this.slidesContainer.addEventListener('mouseleave', () => {
                this.resumeAutoSlide();
            });
        }
    }

    createNavigation() {
        const navContainer = document.createElement('div');
        navContainer.className = 'slider-navigation';

        // Кнопка "Назад"
        const prevButton = document.createElement('button');
        prevButton.className = 'slider-btn slider-btn-prev';
        prevButton.innerHTML = '&#8249;';
        prevButton.setAttribute('aria-label', 'Предыдущий слайд');
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.prevSlide();
        });
        navContainer.appendChild(prevButton);

        // Кнопка "Вперед"
        const nextButton = document.createElement('button');
        nextButton.className = 'slider-btn slider-btn-next';
        nextButton.innerHTML = '&#8250;';
        nextButton.setAttribute('aria-label', 'Следующий слайд');
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.nextSlide();
        });
        navContainer.appendChild(nextButton);

        // Добавляем навигацию внутрь контейнера слайдов, чтобы она была поверх
        this.slidesContainer.appendChild(navContainer);
    }

    createPagination() {
        const pagContainer = document.createElement('div');
        pagContainer.className = 'slider-pagination';

        this.options.images.forEach((_, index) => {
            const pagItem = document.createElement('button');
            pagItem.className = 'pagination-dot';
            if (index === 0) {
                pagItem.classList.add('active');
            }
            pagItem.setAttribute('aria-label', `Перейти к слайду ${index + 1}`);
            pagItem.addEventListener('click', () => this.goToSlide(index));
            pagContainer.appendChild(pagItem);
        });

        this.controlsContainer.appendChild(pagContainer);
    }

    createCounter() {
        const counter = document.createElement('div');
        counter.className = 'slider-counter';
        this.counterElement = counter;
        this.updateCounter();
        this.controlsContainer.appendChild(counter);
    }

    updateCounter() {
        if (this.counterElement) {
            this.counterElement.textContent = `${this.currentIndex + 1}/${this.options.images.length}`;
        }
    }

    showSlide(index) {
        const slides = this.slidesContainer.querySelectorAll('.slide');
        
        if (slides.length === 0) return;

        // Удаление активного класса
        slides.forEach(slide => slide.classList.remove('active'));

        // Добавление активного класса текущему слайду
        if (slides[index]) {
            slides[index].classList.add('active');
        }

        // Обновление пагинации
        if (this.options.pags) {
            const pagDots = this.controlsContainer.querySelectorAll('.pagination-dot');
            pagDots.forEach((dot, i) => {
                dot.classList.toggle('active', i === index);
            });
        }

        // Обновление счетчика
        this.updateCounter();
    }

    nextSlide() {
        if (this.currentIndex < this.options.images.length - 1) {
            this.currentIndex++;
        } else if (this.options.loop) {
            this.currentIndex = 0;
        }
        this.showSlide(this.currentIndex);
        
        // Перезапуск автопрокрутки
        if (this.options.auto) {
            this.restartAutoSlide();
        }
    }

    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        } else if (this.options.loop) {
            this.currentIndex = this.options.images.length - 1;
        }
        this.showSlide(this.currentIndex);
        
        // Перезапуск автопрокрутки
        if (this.options.auto) {
            this.restartAutoSlide();
        }
    }

    goToSlide(index) {
        if (index >= 0 && index < this.options.images.length) {
            this.currentIndex = index;
            this.showSlide(this.currentIndex);
            
            // Перезапуск автопрокрутки
            if (this.options.auto) {
                this.restartAutoSlide();
            }
        }
    }

    startAutoSlide() {
        if (this.autoInterval) {
            clearInterval(this.autoInterval);
        }
        
        const delayMs = this.options.delay * 1000;
        this.autoInterval = setInterval(() => {
            if (!this.isPaused) {
                this.nextSlide();
            }
        }, delayMs);
    }

    pauseAutoSlide() {
        this.isPaused = true;
    }

    resumeAutoSlide() {
        this.isPaused = false;
    }

    restartAutoSlide() {
        this.startAutoSlide();
    }

    updateDelay(newDelay) {
        this.options.delay = newDelay;
        if (this.options.auto) {
            this.startAutoSlide();
        }
    }
}

