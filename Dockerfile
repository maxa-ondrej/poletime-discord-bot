FROM node:22.19.0-slim AS base

FROM base AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm run build

FROM base AS prod

WORKDIR /app

COPY --from=build /app/dist ./dist

ENV NODE_ENV=production
ENV DISCORD_TOKEN=""

CMD ["node", "dist/bin.cjs", "--token", "${DISCORD_TOKEN}"]
