# Not -slim: Prisma's query engine needs to detect a real OpenSSL at
# build/runtime, which the trimmed -slim image doesn't ship — it silently
# falls back to a guessed "openssl-1.1.x" target that may not match, breaking
# queries at runtime. The full bookworm image avoids that without an extra
# apt-get layer.
FROM node:22-bookworm

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

ENV PORT=8080
EXPOSE 8080

CMD ["npm", "run", "start:railway"]
