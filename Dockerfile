# Этап сборки
FROM --platform=$BUILDPLATFORM node:20-alpine AS builder
WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# Этап продакшн-окружения
FROM node:20-alpine AS runner
WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["serve", "dist", "-l", "3000"]