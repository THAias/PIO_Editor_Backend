ARG NPM_TOKEN

FROM node:lts-alpine AS builder
ARG NPM_TOKEN
ENV VERSION_ENV=localVersion

WORKDIR /app

COPY package.json ./
COPY tsconfig.prod.json ./
COPY src ./
COPY assets ./
COPY .env.production ./
COPY package.json ./
COPY package-lock.json ./

RUN npm config set -- //npm.pkg.github.com/:_authToken="${NPM_TOKEN}" && npm config set @thaias:registry=https://npm.pkg.github.com
RUN npm ci --no-audit --ignore-scripts
RUN rm -f .npmrc
# compile the backend into .dist folder
COPY . .
RUN npm run build-local

FROM node:lts-alpine AS production
ARG NPM_TOKEN
ENV NODE_ENV=production
ENV VERSION_ENV=localVersion

WORKDIR /app

COPY package.json ./
COPY package-lock.json ./

RUN npm config set -- //npm.pkg.github.com/:_authToken="${NPM_TOKEN}" && npm config set @thaias:registry=https://npm.pkg.github.com
RUN npm ci --omit=dev --no-audit --ignore-scripts
RUN rm -f .npmrc

RUN rm -rf package-lock.json

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.production ./dist/.env.production
COPY --from=builder /app/src/dataBase/exampleData.json ./dist/src/dataBase/exampleData.json


EXPOSE 7654

CMD ["node", "./dist/src/express/server.js"]