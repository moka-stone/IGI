// Проверка возраста и расчет дня недели
class AgeChecker {
    constructor() {
        this.init();
    }

    init() {
        const checkBtn = document.getElementById('check-age-btn');
        const birthdateInput = document.getElementById('birthdate-input');
        
        checkBtn.addEventListener('click', () => {
            this.checkAge();
        });
        
        birthdateInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAge();
            }
        });
    }

    checkAge() {
        const birthdateInput = document.getElementById('birthdate-input');
        const birthdate = birthdateInput.value;
        const resultDiv = document.getElementById('age-result');
        
        if (!birthdate) {
            alert('Пожалуйста, введите дату рождения');
            return;
        }

        const birthDate = new Date(birthdate);
        const today = new Date();
        
        // Проверка валидности даты
        if (isNaN(birthDate.getTime())) {
            alert('Неверная дата');
            return;
        }
        
        // Проверка, что дата не в будущем
        if (birthDate > today) {
            alert('Дата рождения не может быть в будущем');
            return;
        }

        // Расчет возраста
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        // День недели введенной даты
        const daysOfWeek = ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        const dayOfWeek = daysOfWeek[birthDate.getDay()];

        if (age >= 18) {
            // Совершеннолетний
            resultDiv.innerHTML = `
                <div class="age-success">
                    <h3>Вы совершеннолетний</h3>
                    <p><strong>Ваш возраст:</strong> ${age} ${this.getAgeWord(age)}</p>
                    <p><strong>День недели вашего рождения:</strong> ${dayOfWeek}</p>
                </div>
            `;
        } else {
            // Несовершеннолетний
            alert('Вам необходимо разрешение родителей для использования сайта!');
            resultDiv.innerHTML = `
                <div class="age-warning">
                    <h3>Внимание!</h3>
                    <p><strong>Ваш возраст:</strong> ${age} ${this.getAgeWord(age)}</p>
                    <p>Вам необходимо разрешение родителей для использования сайта.</p>
                </div>
            `;
        }
    }

    getAgeWord(age) {
        const lastDigit = age % 10;
        const lastTwoDigits = age % 100;
        
        if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
            return 'лет';
        }
        
        if (lastDigit === 1) {
            return 'год';
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            return 'года';
        } else {
            return 'лет';
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    new AgeChecker();
});


