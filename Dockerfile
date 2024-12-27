# Этап сборки приложения
FROM node:alpine AS build

# Установка зависимостей
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Копирование исходного кода и настройка
COPY . .
RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm run build

# Этап сборки Nginx-образа
FROM nginx:alpine

# Установка рабочих директорий
WORKDIR /usr/share/nginx/html

# Копирование статических файлов из этапа сборки
COPY --from=build /app/dist ./

# Копирование шаблона конфигурации Nginx
COPY nginx.template.conf /etc/nginx/nginx.template.conf

# Экспонирование порта
EXPOSE ${NGINX_PORT}

# Подстановка переменных и запуск Nginx
CMD ["/bin/sh", "-c", "envsubst '${NGINX_PORT}' < /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
