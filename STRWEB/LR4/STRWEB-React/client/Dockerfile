FROM node:18-alpine

WORKDIR /app

# Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Копируем остальные файлы
COPY . .

# Открываем порт
EXPOSE 3000

# Команда по умолчанию
CMD ["npm", "start"]

