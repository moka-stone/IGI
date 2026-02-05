// Функция переключения темы
function toggleTheme() {
    const body = document.body;
    const html = document.documentElement;
    const toggle = document.getElementById('theme-toggle');
    const inlineStyle = document.getElementById('theme-inline-style');
    
    if (body.classList.contains('dark-theme')) {
        body.classList.remove('dark-theme');
        html.classList.remove('dark-theme');
        // Удаляем inline стиль если он есть
        if (inlineStyle) {
            inlineStyle.remove();
        }
        localStorage.setItem('theme', 'light');
        toggle.innerHTML = '🌙';
    } else {
        body.classList.add('dark-theme');
        html.classList.add('dark-theme');
        localStorage.setItem('theme', 'dark');
        toggle.innerHTML = '☀️';
    }
}

// Применяем тему и устанавливаем правильную иконку при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const theme = localStorage.getItem('theme') || 'light';
    
    // Применяем тему к body и html
    if (theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
        document.body.classList.add('dark-theme');
    } else {
        document.documentElement.classList.remove('dark-theme');
        document.body.classList.remove('dark-theme');
    }
    
    // Устанавливаем правильную иконку
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        toggle.innerHTML = theme === 'light' ? '🌙' : '☀️';
    }
});
