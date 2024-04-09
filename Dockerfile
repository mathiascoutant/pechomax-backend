FROM node:21-alpine as dependencies

WORKDIR /deps

COPY ./package*.json .

RUN npm install

FROM node:21-alpine as build

WORKDIR /build

COPY --from=dependencies /deps/node_modules ./node_modules
COPY ./package.json .

COPY . .

RUN npm run build

FROM node:21-alpine

WORKDIR /app

COPY --from=build /build/dist ./dist
COPY --from=build /build/build ./build
COPY --from=build /build/package.json .
COPY --from=dependencies /deps/node_modules ./node_modules

CMD npm run start:prod