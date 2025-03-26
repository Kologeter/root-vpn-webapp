FROM node:alpine AS build

COPY package.json package.json

COPY package-lock.json package-lock.json

COPY vite.config.js vite.config.js

RUN npm install

COPY . .

RUN npm install --save-dev @babel/plugin-proposal-private-property-in-object

RUN npm run build

FROM nginx:alpine

COPY --from=build /dist /usr/share/nginx/html

COPY --from=build nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3150

CMD ["nginx", "-g", "daemon off;"]