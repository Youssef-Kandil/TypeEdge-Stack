FROM oven/bun:1.1.28-alpine AS base
WORKDIR /app

# Install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# Install production dependencies
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Pre-release stage
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [Optional] Tests & Build
# ENV NODE_ENV=production
# RUN bun test
# RUN bun run build

# Final release stage
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/src src
COPY --from=prerelease /app/package.json .
COPY --from=prerelease /app/tsconfig.json .

# Copy Drizzle migrations if needed for runtime migrate
COPY --from=prerelease /app/drizzle ./drizzle
COPY --from=prerelease /app/drizzle.config.ts .

# Expose port
EXPOSE 3000

# Run the app
CMD ["bun", "run", "src/index.ts"]
