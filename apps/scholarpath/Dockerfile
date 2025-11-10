FROM node:20

WORKDIR /app

COPY package.json pnpm-lock.yaml* .
RUN corepack enable && pnpm install --frozen-lockfile --prefer-offline

COPY . .

RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start"]
