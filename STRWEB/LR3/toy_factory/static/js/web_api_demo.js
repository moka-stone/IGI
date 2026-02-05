// Демонстрация Web API - нативный JS
function initAPIDemoComponent(container) {
    container.className = 'api-demo-container';
    container.innerHTML = `
        <div class="api-demo">
            <div class="api-section">
                <h3>📍 Geolocation API</h3>
                <p>Поиск местоположения через API (введите город или адрес)</p>
                <div style="margin-bottom: 15px;">
                    <input type="text" 
                           id="location-search" 
                           placeholder="Введите город или адрес (например: Минск, Москва, ул. Ленина 1)" 
                           style="padding: 10px; width: 100%; max-width: 400px; border: 2px solid #e0e0e0; border-radius: 5px; font-size: 14px;">
                    <div style="margin-top: 10px;">
                        <button class="btn-get-location" id="get-location-btn">Найти через API</button>
                        <button class="btn-get-location" id="get-my-location-btn" style="margin-left: 10px; background: #9f4d86;">Мое местоположение</button>
                    </div>
                </div>
                <div class="api-result" id="location-result"></div>
            </div>
            
            <div class="api-section">
                <h3>🔋 Battery Status API</h3>
                <p>Информация о состоянии батареи устройства</p>
                <button class="btn-get-location" id="get-battery-btn">Получить данные о батарее</button>
                <div class="api-result" id="battery-result"></div>
            </div>
            
        </div>
    `;
    
    const getLocationBtn = container.querySelector('#get-location-btn');
    const getMyLocationBtn = container.querySelector('#get-my-location-btn');
    const locationSearch = container.querySelector('#location-search');
    const locationResult = container.querySelector('#location-result');
    
    const getBatteryBtn = container.querySelector('#get-battery-btn');
    const batteryResult = container.querySelector('#battery-result');
    
    getLocationBtn.addEventListener('click', searchLocationByAPI);
    getMyLocationBtn.addEventListener('click', getMyLocation);
    getBatteryBtn.addEventListener('click', getBatteryInfo);
    
    locationSearch.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocationByAPI();
        }
    });
    
    // Попытка получить реальное местоположение
    function getMyLocation() {
        if (!navigator.geolocation) {
            locationResult.innerHTML = '<div class="error">Геолокация не поддерживается. Используйте поиск по API.</div>';
            return;
        }
        
        locationResult.innerHTML = '<div class="loading">Определение местоположения...</div>';
        
        navigator.geolocation.getCurrentPosition(
            function(position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const accuracy = position.coords.accuracy;
                
                // Получаем название места через обратный геокодинг API
                reverseGeocode(latitude, longitude, accuracy);
            },
            function(error) {
                let errorMsg = 'Не удалось получить местоположение. ';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMsg += 'Доступ запрещен. ';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMsg += 'Местоположение недоступно. ';
                        break;
                    case error.TIMEOUT:
                        errorMsg += 'Превышено время ожидания. ';
                        break;
                }
                errorMsg += 'Используйте поиск по API (введите город в поле выше).';
                locationResult.innerHTML = '<div class="error">' + errorMsg + '</div>';
            }
        );
    }
    
    // Обратный геокодинг - получение адреса по координатам через API
    async function reverseGeocode(lat, lon, accuracy) {
        try {
            const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ToyFactory/1.0'
                }
            });
            
            const data = await response.json();
            const address = data.display_name || 'Неизвестное место';
            
            showLocationOnMap(lat, lon, address, accuracy);
        } catch (error) {
            showLocationOnMap(lat, lon, 'Ваше местоположение', accuracy);
        }
    }
    
    // Поиск местоположения по названию через API
    async function searchLocationByAPI() {
        const searchTerm = locationSearch.value.trim();
        
        if (!searchTerm) {
            locationResult.innerHTML = '<div class="error">Введите город или адрес для поиска</div>';
            return;
        }
        
        locationResult.innerHTML = '<div class="loading">Поиск через API...</div>';
        
        try {
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'ToyFactory/1.0'
                }
            });
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const name = result.display_name || searchTerm;
                
                showLocationOnMap(lat, lon, name);
            } else {
                locationResult.innerHTML = '<div class="error">Местоположение не найдено. Попробуйте другой запрос (например: Минск, Москва, ул. Ленина 1)</div>';
            }
        } catch (error) {
            console.error('Geolocation API error:', error);
            locationResult.innerHTML = '<div class="error">Ошибка API. Проверьте подключение к интернету.</div>';
        }
    }
    
    function showLocationOnMap(latitude, longitude, locationName, accuracy) {
        let accuracyInfo = '';
        if (accuracy) {
            accuracyInfo = `<p><strong>Точность:</strong> ±${accuracy.toFixed(0)} метров</p>`;
        }
        
        locationResult.innerHTML = `
            <div class="success-result">
                <h4>📍 ${locationName}:</h4>
                <p><strong>Широта:</strong> ${latitude.toFixed(6)}°</p>
                <p><strong>Долгота:</strong> ${longitude.toFixed(6)}°</p>
                ${accuracyInfo}
                <div style="margin-top: 15px;">
                    <a href="https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}&zoom=12" 
                       target="_blank" 
                       class="btn-map">Показать на OpenStreetMap</a>
                    <a href="https://www.google.com/maps?q=${latitude},${longitude}" 
                       target="_blank" 
                       class="btn-map" style="margin-left: 10px;">Показать на Google Maps</a>
                </div>
            </div>
        `;
    }
    
    // Battery Status API
    async function getBatteryInfo() {
        if (!navigator.getBattery) {
            showBatteryDemo();
            return;
        }
        
        batteryResult.innerHTML = '<div class="loading">Получение данных о батарее...</div>';
        
        try {
            const battery = await navigator.getBattery();
            
            const level = (battery.level * 100).toFixed(0);
            const charging = battery.charging ? 'Да ⚡' : 'Нет';
            const chargingTime = battery.chargingTime === Infinity 
                ? 'Не применимо' 
                : `${Math.floor(battery.chargingTime / 60)} минут`;
            const dischargingTime = battery.dischargingTime === Infinity 
                ? 'Не применимо' 
                : `${Math.floor(battery.dischargingTime / 60)} минут`;
            
            displayBatteryInfo(level, charging, chargingTime, dischargingTime, false);
            
            battery.addEventListener('levelchange', function() {
                getBatteryInfo();
            });
            
            battery.addEventListener('chargingchange', function() {
                getBatteryInfo();
            });
            
        } catch (error) {
            console.error('Battery API error:', error);
            showBatteryDemo();
        }
    }
    
    // Демонстрационный режим для браузеров без поддержки
    function showBatteryDemo() {
        let demoLevel = 75;
        let demoCharging = false;
        
        function updateDemo() {
            const chargingTime = demoCharging ? '45 минут' : 'Не применимо';
            const dischargingTime = !demoCharging ? '180 минут' : 'Не применимо';
            
            displayBatteryInfo(demoLevel, demoCharging ? 'Да ⚡' : 'Нет', chargingTime, dischargingTime, true);
            
            const demoControls = batteryResult.querySelector('#demo-controls');
            if (demoControls) {
                const decreaseBtn = demoControls.querySelector('#decrease-battery');
                const increaseBtn = demoControls.querySelector('#increase-battery');
                const toggleChargeBtn = demoControls.querySelector('#toggle-charging');
                
                decreaseBtn.onclick = function() {
                    demoLevel = Math.max(0, demoLevel - 10);
                    updateDemo();
                };
                
                increaseBtn.onclick = function() {
                    demoLevel = Math.min(100, demoLevel + 10);
                    updateDemo();
                };
                
                toggleChargeBtn.onclick = function() {
                    demoCharging = !demoCharging;
                    updateDemo();
                };
            }
        }
        
        updateDemo();
    }
    
    // Отображение информации о батарее
    function displayBatteryInfo(level, charging, chargingTime, dischargingTime, isDemo) {
        let batteryColor = '#4CAF50';
        if (level < 20) {
            batteryColor = '#f44336';
        } else if (level < 50) {
            batteryColor = '#ff9800';
        }
        
        const demoWarning = isDemo ? '<div style="background: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin-bottom: 15px; color: #856404;"><strong>⚠️ Демо-режим:</strong> Ваш браузер не поддерживает Battery Status API. Показаны симулированные данные.</div>' : '';
        
        const demoControls = isDemo ? `
            <div id="demo-controls" style="margin-top: 15px; padding-top: 15px; border-top: 2px dashed #e0e0e0;">
                <p style="margin-bottom: 10px;"><strong>Управление демо:</strong></p>
                <button id="decrease-battery" class="btn-get-location" style="padding: 8px 15px; font-size: 14px;">➖ Уменьшить заряд</button>
                <button id="increase-battery" class="btn-get-location" style="padding: 8px 15px; font-size: 14px; margin-left: 5px;">➕ Увеличить заряд</button>
                <button id="toggle-charging" class="btn-get-location" style="padding: 8px 15px; font-size: 14px; margin-left: 5px; background: #9f4d86;">⚡ Переключить зарядку</button>
            </div>
        ` : '';
        
        batteryResult.innerHTML = `
            <div class="success-result">
                ${demoWarning}
                <h4>🔋 Состояние батареи:</h4>
                <div style="margin-top: 15px;">
                    <div style="margin-bottom: 15px;">
                        <div style="background: #e0e0e0; height: 30px; border-radius: 15px; overflow: hidden; position: relative;">
                            <div style="background: ${batteryColor}; height: 100%; width: ${level}%; transition: width 0.3s;"></div>
                            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-weight: bold; color: #333;">${level}%</span>
                        </div>
                    </div>
                    <p><strong>Уровень заряда:</strong> ${level}%</p>
                    <p><strong>Идет зарядка:</strong> ${charging}</p>
                    <p><strong>Время до полной зарядки:</strong> ${chargingTime}</p>
                    <p><strong>Время до разрядки:</strong> ${dischargingTime}</p>
                </div>
                ${demoControls}
            </div>
        `;
    }
    
    console.log('Web API Demo initialized');
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    const container = document.getElementById('api-demo-container');
    if (container) {
        initAPIDemoComponent(container);
    }
});

