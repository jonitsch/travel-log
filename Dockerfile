# ---------- Build stage ----------
FROM node:lts-alpine AS builder

RUN mkdir /app && mkdir /app/data
COPY . /app
WORKDIR /app

RUN npm ci

RUN npx prisma generate

RUN npm run build

# ---------- Production stage ----------
FROM node:lts-alpine

RUN mkdir /app
COPY --from=builder /app/build /app/build
COPY --from=builder /app/package.json /app/package-lock.json /app/

ENV NODE_ENV=production
ENV BETTER_AUTH_BASE_URL=http://localhost:3000

EXPOSE 3000

RUN cd /app && npm install --omit dev

WORKDIR /app

CMD ["node", "build"]