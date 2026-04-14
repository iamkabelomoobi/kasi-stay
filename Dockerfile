# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*

FROM base AS deps
COPY package.json package-lock.json turbo.json ./
COPY apps/web/package.json apps/web/package.json
COPY apps/server/package.json apps/server/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/db/package.json packages/db/package.json
COPY packages/email/package.json packages/email/package.json
COPY packages/logger/package.json packages/logger/package.json
RUN npm ci

FROM deps AS builder
COPY . .
RUN npx turbo run build --filter=web --filter=@kasistay/server

FROM builder AS prod-deps
RUN npm prune --omit=dev

FROM node:22-bookworm-slim AS web
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder /app/apps/web/public ./apps/web/public

EXPOSE 3000

CMD ["node", "apps/web/server.js"]

FROM base AS server
WORKDIR /app/apps/server
ENV NODE_ENV=production
ENV PORT=4000

COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=builder /app/package.json /app/package.json

COPY --from=builder /app/apps/server/package.json ./package.json
COPY --from=builder /app/apps/server/dist ./dist

COPY --from=builder /app/packages/auth/package.json /app/packages/auth/package.json
COPY --from=builder /app/packages/auth/dist /app/packages/auth/dist

COPY --from=builder /app/packages/db/package.json /app/packages/db/package.json
COPY --from=builder /app/packages/db/dist /app/packages/db/dist
COPY --from=builder /app/packages/db/prisma /app/packages/db/prisma
COPY --from=builder /app/packages/db/prisma.config.ts /app/packages/db/prisma.config.ts

COPY --from=builder /app/packages/email/package.json /app/packages/email/package.json
COPY --from=builder /app/packages/email/dist /app/packages/email/dist

COPY --from=builder /app/packages/logger/package.json /app/packages/logger/package.json
COPY --from=builder /app/packages/logger/dist /app/packages/logger/dist

EXPOSE 4000

CMD ["node", "--experimental-specifier-resolution=node", "dist/index.js"]
