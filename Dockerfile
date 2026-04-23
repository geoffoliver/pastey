FROM oven/bun:1

WORKDIR /app

COPY package.json yarn.lock ./
RUN bun install --production

COPY src/ ./src/
COPY public/ ./public/
COPY config.json ./

RUN mkdir -p /app/uploads /app/data

EXPOSE 3000

CMD ["bun", "src/index.ts"]
