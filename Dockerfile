# ---------- Build stage ----------
FROM node:lts-alpine AS builder

RUN mkdir /app && mkdir /pictures
COPY . /app
WORKDIR /app

RUN npm ci
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
