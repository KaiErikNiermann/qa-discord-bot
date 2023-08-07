FROM node:latest

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package.json /usr/src/bot
COPY package-lock.json /usr/src/bot
COPY .env /usr/src/bot
RUN npm install
RUN npm update

COPY . /usr/src/bot/

CMD ["npm", "start"]