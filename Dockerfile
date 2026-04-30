FROM node:alpine AS builder

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

COPY . .
COPY prisma.config.ts .
COPY prisma ./prisma


RUN npm run build

FROM node:alpine AS runner

COPY package*.json ./

WORKDIR /usr/src/app

RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma.config.ts ./prisma.config.ts
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npx prisma db push && node dist/src/main.js"]