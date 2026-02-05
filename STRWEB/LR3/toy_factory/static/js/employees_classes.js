// ========== ВАРИАНТ 1: Прототипное наследование ==========

// Базовый класс Employee (функциональный стиль)
function Employee(name, gender, maritalStatus) {
    this.name = name;
    this.gender = gender;
    this.maritalStatus = maritalStatus;
}

// Геттеры базового класса
Employee.prototype.getName = function() {
    return this.name;
};

Employee.prototype.getGender = function() {
    return this.gender;
};

Employee.prototype.getMaritalStatus = function() {
    return this.maritalStatus;
};

// Сеттеры базового класса
Employee.prototype.setName = function(name) {
    this.name = name;
};

Employee.prototype.setGender = function(gender) {
    this.gender = gender;
};

Employee.prototype.setMaritalStatus = function(status) {
    this.maritalStatus = status;
};

// Метод добавления через форму
Employee.prototype.addFromForm = function(formData) {
    this.setName(formData.name);
    this.setGender(formData.gender);
    this.setMaritalStatus(formData.status);
};

// Метод вывода на страницу
Employee.prototype.display = function() {
    return `
        <div class="employee-card">
            <p><strong>ФИО:</strong> ${this.getName()}</p>
            <p><strong>Пол:</strong> ${this.getGender()}</p>
            <p><strong>Семейное положение:</strong> ${this.getMaritalStatus()}</p>
        </div>
    `;
};

// Метод проверки брака
Employee.prototype.checkMarriageProbability = function(employees) {
    const married = employees.filter(emp => 
        emp.getMaritalStatus() === 'женат' || emp.getMaritalStatus() === 'замужем'
    );
    
    if (married.length < 2) {
        return 'Недостаточно данных. Нужно минимум 2 состоящих в браке сотрудника.';
    }
    
    const maleMarried = married.filter(emp => emp.getGender() === 'мужской');
    const femaleMarried = married.filter(emp => emp.getGender() === 'женский');
    
    if (maleMarried.length > 0 && femaleMarried.length > 0) {
        return `Вероятность брака между сотрудниками: ВЫСОКАЯ. Найдено ${maleMarried.length} женатых мужчин и ${femaleMarried.length} замужних женщин.`;
    }
    
    return 'Вероятность брака между сотрудниками: НИЗКАЯ. Все состоящие в браке сотрудники одного пола.';
};

// Класс наследник ExtendedEmployee
function ExtendedEmployee(name, gender, maritalStatus, department) {
    Employee.call(this, name, gender, maritalStatus);
    this.department = department;
}

// Наследование прототипа
ExtendedEmployee.prototype = Object.create(Employee.prototype);
ExtendedEmployee.prototype.constructor = ExtendedEmployee;

// Геттер для отдела
ExtendedEmployee.prototype.getDepartment = function() {
    return this.department;
};

// Сеттер для отдела
ExtendedEmployee.prototype.setDepartment = function(department) {
    this.department = department;
};

// Переопределение метода добавления через форму
ExtendedEmployee.prototype.addFromForm = function(formData) {
    Employee.prototype.addFromForm.call(this, formData);
    this.setDepartment(formData.department || 'Не указан');
};

// Переопределение метода вывода
ExtendedEmployee.prototype.display = function() {
    return `
        <div class="employee-card">
            <p><strong>ФИО:</strong> ${this.getName()}</p>
            <p><strong>Пол:</strong> ${this.getGender()}</p>
            <p><strong>Семейное положение:</strong> ${this.getMaritalStatus()}</p>
            <p><strong>Отдел:</strong> ${this.getDepartment()}</p>
        </div>
    `;
};

// ========== ВАРИАНТ 2: Классы с extends ==========

// Базовый класс EmployeeClass
class EmployeeClass {
    constructor(name, gender, maritalStatus) {
        this._name = name;
        this._gender = gender;
        this._maritalStatus = maritalStatus;
    }

    // Геттеры
    getName() {
        return this._name;
    }

    getGender() {
        return this._gender;
    }

    getMaritalStatus() {
        return this._maritalStatus;
    }

    // Сеттеры
    setName(name) {
        this._name = name;
    }

    setGender(gender) {
        this._gender = gender;
    }

    setMaritalStatus(status) {
        this._maritalStatus = status;
    }

    // Метод добавления через форму
    addFromForm(formData) {
        this.setName(formData.name);
        this.setGender(formData.gender);
        this.setMaritalStatus(formData.status);
    }

    // Метод вывода на страницу
    display() {
        return `
            <div class="employee-card">
                <p><strong>ФИО:</strong> ${this.getName()}</p>
                <p><strong>Пол:</strong> ${this.getGender()}</p>
                <p><strong>Семейное положение:</strong> ${this.getMaritalStatus()}</p>
            </div>
        `;
    }

    // Метод проверки брака
    checkMarriageProbability(employees) {
        const married = employees.filter(emp => 
            emp.getMaritalStatus() === 'женат' || emp.getMaritalStatus() === 'замужем'
        );
        
        if (married.length < 2) {
            return 'Недостаточно данных. Нужно минимум 2 состоящих в браке сотрудника.';
        }
        
        const maleMarried = married.filter(emp => emp.getGender() === 'мужской');
        const femaleMarried = married.filter(emp => emp.getGender() === 'женский');
        
        if (maleMarried.length > 0 && femaleMarried.length > 0) {
            return `Вероятность брака между сотрудниками: ВЫСОКАЯ. Найдено ${maleMarried.length} женатых мужчин и ${femaleMarried.length} замужних женщин.`;
        }
        
        return 'Вероятность брака между сотрудниками: НИЗКАЯ. Все состоящие в браке сотрудники одного пола.';
    }
}

// Класс наследник ExtendedEmployeeClass
class ExtendedEmployeeClass extends EmployeeClass {
    constructor(name, gender, maritalStatus, department) {
        super(name, gender, maritalStatus);
        this._department = department;
    }

    // Геттер для отдела
    getDepartment() {
        return this._department;
    }

    // Сеттер для отдела
    setDepartment(department) {
        this._department = department;
    }

    // Переопределение метода добавления через форму
    addFromForm(formData) {
        super.addFromForm(formData);
        this.setDepartment(formData.department || 'Не указан');
    }

    // Переопределение метода вывода
    display() {
        return `
            <div class="employee-card">
                <p><strong>ФИО:</strong> ${this.getName()}</p>
                <p><strong>Пол:</strong> ${this.getGender()}</p>
                <p><strong>Семейное положение:</strong> ${this.getMaritalStatus()}</p>
                <p><strong>Отдел:</strong> ${this.getDepartment()}</p>
            </div>
        `;
    }
}

// ========== Управление данными ==========

// Массивы для хранения сотрудников
const protoEmployees = [
    new ExtendedEmployee('Иванов И.И.', 'мужской', 'женат', 'Отдел продаж'),
    new ExtendedEmployee('Петрова А.С.', 'женский', 'замужем', 'Бухгалтерия'),
    new ExtendedEmployee('Сидоров П.В.', 'мужской', 'холост', 'IT-отдел'),
    new ExtendedEmployee('Козлова М.А.', 'женский', 'замужем', 'Отдел кадров'),
    new ExtendedEmployee('Смирнов Д.Н.', 'мужской', 'женат', 'Отдел продаж')
];

const classEmployees = [
    new ExtendedEmployeeClass('Иванов И.И.', 'мужской', 'женат', 'Отдел продаж'),
    new ExtendedEmployeeClass('Петрова А.С.', 'женский', 'замужем', 'Бухгалтерия'),
    new ExtendedEmployeeClass('Сидоров П.В.', 'мужской', 'холост', 'IT-отдел'),
    new ExtendedEmployeeClass('Козлова М.А.', 'женский', 'замужем', 'Отдел кадров'),
    new ExtendedEmployeeClass('Смирнов Д.Н.', 'мужской', 'женат', 'Отдел продаж')
];

// Функция для работы с прототипным наследованием
function initPrototypeTab() {
    const addBtn = document.getElementById('proto-add-btn');
    const checkBtn = document.getElementById('proto-check-btn');
    const listDiv = document.getElementById('proto-list');
    const resultDiv = document.getElementById('proto-result');

    // Отображаем изначальный массив
    renderProtoList();

    addBtn.addEventListener('click', () => {
        const name = document.getElementById('proto-name').value.trim();
        const gender = document.getElementById('proto-gender').value;
        const status = document.getElementById('proto-status').value;
        const department = document.getElementById('proto-department').value.trim();

        if (!name || !gender || !status) {
            alert('Заполните все обязательные поля');
            return;
        }

        const employee = new ExtendedEmployee(name, gender, status, department || 'Не указан');
        employee.addFromForm({ name, gender, status, department });
        protoEmployees.push(employee);

        // Очистка формы
        document.getElementById('proto-name').value = '';
        document.getElementById('proto-gender').value = '';
        document.getElementById('proto-status').value = '';
        document.getElementById('proto-department').value = '';

        renderProtoList();
    });

    checkBtn.addEventListener('click', () => {
        if (protoEmployees.length === 0) {
            resultDiv.innerHTML = '<p>Добавьте сотрудников для проверки</p>';
            return;
        }

        const result = protoEmployees[0].checkMarriageProbability(protoEmployees);
        resultDiv.innerHTML = `<div class="result-content">${result}</div>`;
    });

    function renderProtoList() {
        if (protoEmployees.length === 0) {
            listDiv.innerHTML = '<p>Список сотрудников пуст</p>';
            return;
        }

        listDiv.innerHTML = '<h4>Список сотрудников:</h4>';
        protoEmployees.forEach((emp, index) => {
            listDiv.innerHTML += `<div class="employee-item">${index + 1}. ${emp.display()}</div>`;
        });
    }
}

// Функция для работы с классами
function initClassTab() {
    const addBtn = document.getElementById('class-add-btn');
    const checkBtn = document.getElementById('class-check-btn');
    const listDiv = document.getElementById('class-list');
    const resultDiv = document.getElementById('class-result');

    // Отображаем изначальный массив
    renderClassList();

    addBtn.addEventListener('click', () => {
        const name = document.getElementById('class-name').value.trim();
        const gender = document.getElementById('class-gender').value;
        const status = document.getElementById('class-status').value;
        const department = document.getElementById('class-department').value.trim();

        if (!name || !gender || !status) {
            alert('Заполните все обязательные поля');
            return;
        }

        const employee = new ExtendedEmployeeClass(name, gender, status, department || 'Не указан');
        employee.addFromForm({ name, gender, status, department });
        classEmployees.push(employee);

        // Очистка формы
        document.getElementById('class-name').value = '';
        document.getElementById('class-gender').value = '';
        document.getElementById('class-status').value = '';
        document.getElementById('class-department').value = '';

        renderClassList();
    });

    checkBtn.addEventListener('click', () => {
        if (classEmployees.length === 0) {
            resultDiv.innerHTML = '<p>Добавьте сотрудников для проверки</p>';
            return;
        }

        const result = classEmployees[0].checkMarriageProbability(classEmployees);
        resultDiv.innerHTML = `<div class="result-content">${result}</div>`;
    });

    function renderClassList() {
        if (classEmployees.length === 0) {
            listDiv.innerHTML = '<p>Список сотрудников пуст</p>';
            return;
        }

        listDiv.innerHTML = '<h4>Список сотрудников:</h4>';
        classEmployees.forEach((emp, index) => {
            listDiv.innerHTML += `<div class="employee-item">${index + 1}. ${emp.display()}</div>`;
        });
    }
}

// Переключение вкладок
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(`${targetTab}-tab`).classList.add('active');
        });
    });
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initTabs();
    initPrototypeTab();
    initClassTab();
});

