import { httpBatchLink, loggerLink } from '@trpc/client';
import { createTRPCNext } from '@trpc/next';
import type { AppRouter } from '../server/routers/_app';

export const trpc = createTRPCNext<AppRouter>({
  config() {
    return {
      links: [
        loggerLink({
          enabled(opts) {
            return (
              (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') ||
              (opts.direction === 'down' && opts.result instanceof Error)
            );
          },
        }),
        httpBatchLink({ url: '/api/trpc' }),
      ],
    };
  },
});
