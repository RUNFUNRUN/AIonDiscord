FROM node

COPY package*.json ./
RUN npm install
