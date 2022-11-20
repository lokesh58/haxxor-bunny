export const getBaseAppUrl = (): string => {
  if (process.env.RAILWAY_STATIC_URL) {
    return `https://${process.env.RAILWAY_STATIC_URL}`;
  }
  return `http://localhost:${process.env.PORT ?? 3000}`;
};
