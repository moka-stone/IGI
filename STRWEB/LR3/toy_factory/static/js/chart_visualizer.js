function initChartVisualizerComponent(container) {
    const opts = {
        xMin: -0.9,
        xMax: 0.9,
        xStep: 0.1,
        termsCount: 10
    };
    
    let chart = null;
    let tableData = [];
    
    container.className = 'chart-visualizer-container';
    container.innerHTML = `
        <div class="chart-visualizer">
            <h2>График функции ln(1+x)</h2>
            <p class="description">Сравнение разложения в ряд Тейлора и точного значения</p>
            
            <div class="chart-controls">
                <div class="control-group">
                    <label>Начало X:</label>
                    <input type="number" id="x-min" value="${opts.xMin}" step="0.1" min="-0.99" max="0">
                </div>
                
                <div class="control-group">
                    <label>Конец X:</label>
                    <input type="number" id="x-max" value="${opts.xMax}" step="0.1" min="0" max="1">
                </div>
                
                <div class="control-group">
                    <label>Шаг:</label>
                    <input type="number" id="x-step" value="${opts.xStep}" step="0.01" min="0.01" max="0.5">
                </div>
                
                <div class="control-group">
                    <label>Членов ряда:</label>
                    <input type="number" id="terms-count" value="${opts.termsCount}" min="1" max="50">
                </div>
                
                <button class="btn-calculate" id="calculate-btn">Построить график</button>
            </div>
            
            <div class="chart-container">
                <canvas id="function-chart"></canvas>
            </div>
            
            <div class="chart-actions">
                <button class="btn-save-image" id="save-image-btn">Сохранить как изображение</button>
                <button class="btn-save-data" id="save-data-btn">Сохранить данные в файл</button>
                <button class="btn-toggle-table" id="toggle-table-btn">Показать таблицу данных</button>
            </div>
            
            <div class="data-table-container" style="display: none;">
                <h3>Таблица значений</h3>
                <div class="table-wrapper">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>x</th>
                                <th>n</th>
                                <th>F(x) (ряд)</th>
                                <th>Math F(x) (Math.log)</th>
                                <th>eps (погрешность)</th>
                            </tr>
                        </thead>
                        <tbody id="data-table-body"></tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
    
    const xMinInput = container.querySelector('#x-min');
    const xMaxInput = container.querySelector('#x-max');
    const xStepInput = container.querySelector('#x-step');
    const termsInput = container.querySelector('#terms-count');
    const calculateBtn = container.querySelector('#calculate-btn');
    const canvasElement = container.querySelector('#function-chart');
    const saveImageBtn = container.querySelector('#save-image-btn');
    const saveDataBtn = container.querySelector('#save-data-btn');
    const toggleTableBtn = container.querySelector('#toggle-table-btn');
    const tableContainer = container.querySelector('.data-table-container');
    const tableBody = container.querySelector('#data-table-body');
    
    calculateBtn.addEventListener('click', buildChart);
    saveImageBtn.addEventListener('click', saveAsImage);
    saveDataBtn.addEventListener('click', saveDataToFile);
    toggleTableBtn.addEventListener('click', function() {
        const isVisible = tableContainer.style.display !== 'none';
        tableContainer.style.display = isVisible ? 'none' : 'block';
        toggleTableBtn.textContent = isVisible ? 'Показать таблицу данных' : 'Скрыть таблицу данных';
    });

    // Функция для вычисления ряда Тейлора: ln(1+x) = x - x²/2 + x³/3 - x⁴/4 + ...
    function calculateSeries(x, n) {
        let sum = 0;
        for (let i = 1; i <= n; i++) {
            sum += Math.pow(-1, i - 1) * Math.pow(x, i) / i;
        }
        return sum;
    }
    
    function calculateMath(x) {
        return Math.log(1 + x);
    }
    
    function buildChart() {
        const xMin = parseFloat(xMinInput.value);
        const xMax = parseFloat(xMaxInput.value);
        const xStep = parseFloat(xStepInput.value);
        const n = parseInt(termsInput.value, 10);
        
        if (xMin >= xMax) {
            alert('Начало должно быть меньше конца!');
            return;
        }
        
        if (xMin < -1 || xMax > 1) {
            alert('Значения x должны быть в диапазоне (-1, 1) для сходимости ряда!');
            return;
        }
        
        const xValues = [];
        const seriesValues = [];
        const mathValues = [];
        tableData = [];
        
        for (let x = xMin; x <= xMax; x += xStep) {
            const xRounded = Math.round(x * 100) / 100;
            xValues.push(xRounded);
            
            const seriesValue = calculateSeries(xRounded, n);
            const mathValue = calculateMath(xRounded);
            const eps = Math.abs(seriesValue - mathValue);
            
            seriesValues.push(seriesValue);
            mathValues.push(mathValue);
            
            tableData.push({
                x: xRounded,
                n: n,
                series: seriesValue,
                math: mathValue,
                eps: eps
            });
        }
        
        if (chart) {
            chart.destroy();
        }
        
        const ctx = canvasElement.getContext('2d');
        
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: xValues,
                datasets: [
                    {
                        label: 'Math F(x) = ln(1+x) (точное значение)',
                        data: mathValues,
                        borderColor: '#e74c3c',
                        backgroundColor: 'rgba(231, 76, 60, 0.2)',
                        borderWidth: 4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                        pointBackgroundColor: '#e74c3c',
                        pointBorderColor: '#fff',
                        pointBorderWidth: 2,
                        tension: 0.1,
                        fill: false,
                        order: 2
                    },
                    {
                        label: 'F(x) = ∑(-1)ⁿ⁻¹ xⁿ/n (ряд Тейлора)',
                        data: seriesValues,
                        borderColor: '#3498db',
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        borderWidth: 2,
                        pointRadius: 2,
                        pointHoverRadius: 4,
                        tension: 0.3,
                        fill: false,
                        order: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'График функции ln(1+x) (n = ' + n + ')',
                        font: {
                            size: 18,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: true,
                        position: 'top'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'x'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'F(x)'
                        }
                    }
                }
            }
        });
        
        updateTable();
    }
    
    function updateTable() {
        tableBody.innerHTML = tableData.map(function(row) {
            return `
            <tr>
                <td>${row.x.toFixed(2)}</td>
                <td>${row.n}</td>
                <td>${row.series.toFixed(6)}</td>
                <td>${row.math.toFixed(6)}</td>
                <td>${row.eps.toExponential(2)}</td>
            </tr>
            `;
        }).join('');
    }
    
    function saveAsImage() {
        if (!chart) {
            alert('Сначала постройте график!');
            return;
        }
        
        const link = document.createElement('a');
        link.download = 'ln_function_chart.png';
        link.href = chart.toBase64Image();
        link.click();
    }
    
    function saveDataToFile() {
        if (tableData.length === 0) {
            alert('Нет данных для сохранения!');
            return;
        }
        
        let content = 'ГРАФИК ФУНКЦИИ ln(1+x)\n';
        content += '='.repeat(80) + '\n\n';
        content += 'Разложение в ряд Тейлора: ln(1+x) = ∑(-1)ⁿ⁻¹ xⁿ/n, |x| < 1\n\n';
        content += 'Параметры:\n';
        content += '- Начало X: ' + xMinInput.value + '\n';
        content += '- Конец X: ' + xMaxInput.value + '\n';
        content += '- Шаг: ' + xStepInput.value + '\n';
        content += '- Членов ряда: ' + termsInput.value + '\n\n';
        content += '='.repeat(80) + '\n\n';
        content += 'x'.padEnd(10) + ' | ' + 'n'.padEnd(5) + ' | ' + 'F(x) ряд'.padEnd(15) + ' | ' + 'Math F(x)'.padEnd(15) + ' | ' + 'eps'.padEnd(12) + '\n';
        content += '-'.repeat(80) + '\n';
        
        tableData.forEach(function(row) {
            content += row.x.toFixed(2).padEnd(10) + ' | ' + String(row.n).padEnd(5) + ' | ' + row.series.toFixed(6).padEnd(15) + ' | ' + row.math.toFixed(6).padEnd(15) + ' | ' + row.eps.toExponential(2).padEnd(12) + '\n';
        });
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'ln_function_data.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Данные сохранены в файл ln_function_data.txt');
    }
    
    // Проверяем наличие Chart.js и строим график по умолчанию
    if (typeof Chart === 'undefined') {
        alert('Chart.js не загружен! Убедитесь, что библиотека подключена.');
    } else {
        buildChart();
    }
    
    console.log('ChartVisualizer initialized');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('chart-visualizer-container');
    if (container) {
        initChartVisualizerComponent(container);
    }
});

