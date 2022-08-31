# syntax=docker/dockerfile:1

FROM node:lts-alpine@sha256:2c405ed42fc0fd6aacbe5730042640450e5ec030bada7617beac88f742b6997b
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "yarn.lock", "."]
RUN yarn install --frozen-lockfile --ignore-scripts
COPY . .
