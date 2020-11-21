FROM node:lts-alpine as builder

COPY . /app
WORKDIR /app

RUN yarn && yarn build

FROM node:lts-alpine

COPY --from=builder /app/dist /app
COPY package.json /app
WORKDIR /app

RUN yarn --prod

ENTRYPOINT [ "node", "server.js" ]
