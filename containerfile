FROM oven/bun:1-alpine AS builder

RUN apk add bash

WORKDIR /app

COPY ./scripts ./scripts
COPY ./src ./src
COPY ./package.json ./
COPY ./bun.lock ./
COPY ./*config* ./
COPY ./.* ./

RUN ./scripts/init.sh
RUN bun run build
RUN ls -la ./dist/bin/ && chmod +x ./dist/bin/red

FROM oven/bun:1-alpine
COPY --from=builder /app/dist/bin /bin
ENTRYPOINT [ "/bin/red" ]