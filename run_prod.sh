#!/bin/bash

cat <<EOF > ./frontend/.env
VITE_SITE='https://root-vpn.ru'
VITE_WEBSOCKET='wss://root-vpn.ru'
EOF

cat <<EOF > ./frontend/nginx.conf
server {
  listen 3022;

  location / {
    root /usr/share/nginx/html;
    index index.html index.html;
    try_files $uri $uri/ /index.html =404;
  }

  include /etc/nginx/extra-conf.d/*.conf;
}
EOF

cat <<EOF > ./frontend/Dockerfile
FROM node:alpine AS build

#WORKDIR /app

#COPY package.json package-lock.json ./
COPY package.json package.json

COPY package-lock.json package-lock.json

COPY vite.config.js vite.config.js

RUN npm install

COPY . .

RUN #npm uninstall react-scripts && npm install react-scripts

RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

RUN npm run build

FROM nginx:alpine

COPY --from=build /dist /usr/share/nginx/html

COPY --from=build nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3022

CMD ["nginx", "-g", "daemon off;"]
EOF

docker compose -f docker-compose.prod.yml --env-file ./frontend/.env.prod up --build