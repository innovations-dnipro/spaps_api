FROM node:18.9.0-alpine as build

WORKDIR /app
COPY . /app
RUN npm i
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "start:prod"]