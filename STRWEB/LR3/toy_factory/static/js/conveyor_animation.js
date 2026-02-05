// Анимация конвейера при скроллинге
class ConveyorAnimation {
    constructor() {
        this.lastScrollTop = 0;
        this.scrollDirection = 0;
        this.products = [];
        this.init();
    }

    init() {
        // Получаем изображения товаров
        this.loadProducts();
        
        // Слушаем событие скролла
        window.addEventListener('scroll', () => {
            this.handleScroll();
        });
        
        // Инициализируем начальную позицию
        this.handleScroll();
    }

    loadProducts() {
        // Ручная настройка каждого товара
        // Для каждого товара можно задать:
        // - imageSrc: путь к изображению
        // - initialLeft: начальная позиция по горизонтали (px)
        // - initialTop: начальная позиция по вертикали (px, относительно центра конвейера)
        // - speedMultiplier: множитель скорости горизонтального движения (1.0 = обычная скорость)
        // - direction: направление горизонтального движения (1 = вправо при скролле вниз, -1 = влево)
        // - verticalSpeed: скорость вертикального движения (0 = не движется, положительное = вниз при скролле вниз, отрицательное = вверх)
        // - verticalDirection: направление вертикального движения относительно скролла (1 = вниз при скролле вниз, -1 = вверх при скролле вниз)
        const productConfigs = [
            {
                imageSrc: '/media/pipe/bear1.png',
                initialLeft: 40,      // Начальная позиция слева (px)
                initialTop: -20,      // Смещение вверх/вниз от центра (px, отрицательное = вверх)
                speedMultiplier: 0.4, // Множитель скорости горизонтального движения
                direction: 1,          // Направление горизонтального движения (1 = вправо, -1 = влево)
                verticalSpeed: 0.6,    // Скорость вертикального движения (0 = не движется)
                verticalDirection: 1   // Направление вертикального движения (1 = вниз при скролле вниз, -1 = вверх)
            },
            {
                imageSrc: '/media/pipe/bear2.png',
                initialLeft: 200,
                initialTop: 80,
                speedMultiplier: 0.4,
                direction: 1,
                verticalSpeed: 0.4,   
                verticalDirection: 1
            },
            {
                imageSrc: '/media/pipe/bear3.png',
                initialLeft: 500,
                initialTop: 220,
                speedMultiplier: 0.4,
                direction: 1,
                verticalSpeed: 0.1,    
                verticalDirection: 1
            },
            {
                imageSrc: '/media/pipe/bear4.png',
                initialLeft: 700,
                initialTop: 200,
                speedMultiplier: 0.7,
                direction: 1,
                verticalSpeed: 0.1,      
                verticalDirection: -1
            },
            {
                imageSrc: '/media/pipe/lego1.png',
                initialLeft: 940,
                initialTop: 300,
                speedMultiplier: 0.7,
                direction: 1,
                verticalSpeed: 0.3,    
                verticalDirection: -1
            },
        ];

        const container = document.getElementById('products-on-conveyor');
        if (!container) return;

        // Создаем товары с индивидуальными настройками
        productConfigs.forEach((config, index) => {
            const product = document.createElement('div');
            product.className = 'conveyor-product';
            product.style.left = `${config.initialLeft}px`;
            product.style.top = `${config.initialTop}px`;
            product.innerHTML = `<img src="${config.imageSrc}" alt="Товар">`;
            container.appendChild(product);
            this.products.push({
                element: product,
                position: config.initialLeft,
                verticalPosition: config.initialTop,
                speedMultiplier: config.speedMultiplier,
                direction: config.direction,
                verticalSpeed: config.verticalSpeed || 0,
                verticalDirection: config.verticalDirection || 1
            });
        });
    }

    handleScroll() {
        const conveyorSection = document.getElementById('conveyor-section');
        if (!conveyorSection) return;

        const rect = conveyorSection.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Определяем направление скролла
        if (scrollTop > this.lastScrollTop) {
            this.scrollDirection = 1; // Вниз - товары движутся вправо
        } else if (scrollTop < this.lastScrollTop) {
            this.scrollDirection = -1; // Вверх - товары движутся влево
        }
        this.lastScrollTop = scrollTop;

        // Проверяем, видна ли секция конвейера в видимой области экрана
        // Секция должна быть хотя бы частично видна
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        // Дополнительная проверка: секция должна быть в рабочей зоне
        // Рабочая зона: от -200px выше экрана до +200px ниже экрана
        const isInWorkingZone = rect.bottom > -200 && rect.top < window.innerHeight + 200;
        
        if (isVisible && isInWorkingZone) {
            // Скорость движения зависит только от направления скролла
            const baseSpeed = 1.5;
            const speed = this.scrollDirection * baseSpeed;
            
            this.animateProducts(speed);
        } else {
            // Если секция не видна, останавливаем анимацию
            this.animateProducts(0);
        }
    }

    animateProducts(speed) {
        const conveyorWidth = document.querySelector('.conveyor-container')?.offsetWidth || 1200;
        const conveyorHeight = document.querySelector('.conveyor-container')?.offsetHeight || 400;
        
        this.products.forEach((product, index) => {
            // Применяем индивидуальную скорость и направление для горизонтального движения
            const individualSpeed = speed * product.speedMultiplier * product.direction;
            product.position += individualSpeed;
            
            // Применяем вертикальное движение
            if (product.verticalSpeed !== 0) {
                const verticalMovement = speed * product.verticalSpeed * product.verticalDirection;
                product.verticalPosition += verticalMovement;
                
                // Ограничиваем вертикальное движение (чтобы товары не уходили слишком далеко)
                const maxVerticalOffset = conveyorHeight / 2 - 60; // 60px - половина высоты товара
                if (product.verticalPosition > maxVerticalOffset) {
                    product.verticalPosition = maxVerticalOffset;
                }
                if (product.verticalPosition < -maxVerticalOffset) {
                    product.verticalPosition = -maxVerticalOffset;
                }
                
                product.element.style.top = `${product.verticalPosition}px`;
            }
            
            // Если товар ушел за правый край, перемещаем его в начало
            if (product.position > conveyorWidth) {
                product.position = -100;
            }
            
            // Если товар ушел за левый край, перемещаем его в конец
            if (product.position < -100) {
                product.position = conveyorWidth;
            }
            
            product.element.style.left = `${product.position}px`;
        });
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new ConveyorAnimation();
});

