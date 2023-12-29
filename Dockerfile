FROM node:18 as base

FROM base as deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm i --frozen-lockfile

FROM base as builder
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM base as runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
USER nextjs
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "127.0.0.1"
CMD ["node", "server.js"]
