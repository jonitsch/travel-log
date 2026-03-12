# ---------- Build stage ----------
FROM node:lts-alpine AS builder

ENV BETTER_AUTH_BASE_URL=$BETTER_AUTH_BASE_URL
ENV BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL

RUN mkdir /app && mkdir /pictures
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
COPY --from=builder /app/prisma /app/prisma

EXPOSE 3000

RUN cd /app && npm install --omit dev

WORKDIR /app

CMD ["node", "build"]
