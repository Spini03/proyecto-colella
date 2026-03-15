FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
COPY prisma ./prisma
COPY prisma.config.js ./prisma.config.js
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG MERCADO_PAGO_ACCESS_TOKEN
ARG RESEND_API_KEY
ARG DATABASE_URL

RUN echo "MERCADO_PAGO_ACCESS_TOKEN=${MERCADO_PAGO_ACCESS_TOKEN}" > .env
RUN echo "RESEND_API_KEY=${RESEND_API_KEY}" >> .env
RUN echo "DATABASE_URL=${DATABASE_URL}" >> .env

RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.js ./prisma.config.js

EXPOSE 3000
CMD ["node", "server.js"]
