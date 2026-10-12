FROM node:18.9.0
WORKDIR /react-app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . ./
RUN yarn build:prod
RUN yarn global add serve
EXPOSE 3000
CMD ["serve", "-s", "build"]