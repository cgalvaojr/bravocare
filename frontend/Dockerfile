FROM node:16.13.2-alpine as development

WORKDIR /usr/src/app

ENV PATH /usr/src/app/node_modules/.bin:$PATH

COPY package*.json .

RUN npm install

COPY . .

RUN chown -R node:node ./node_modules

#CMD ["npm", "run", "dev"]
