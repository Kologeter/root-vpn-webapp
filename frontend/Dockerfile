FROM node:alpine AS build

COPY package.json package.json
COPY package-lock.json package-lock.json
COPY vite.config.js vite.config.js

RUN npm install

COPY . .

RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object
RUN npm run build

# Копируем шаблон
COPY nginx.conf /etc/nginx/nginx.conf

FROM nginx:alpine

COPY --from=build /dist /usr/share/nginx/html
COPY --from=build /etc/nginx/nginx.conf /etc/nginx/nginx.conf

EXPOSE ${NGINX_PORT}

CMD envsubst '${NGINX_PORT}' < /etc/nginx/nginx.template.conf > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'
