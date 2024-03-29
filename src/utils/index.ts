export const getBaseAppUrl = (): string => {
  if (process.env.STATIC_URL) {
    return `https://${process.env.STATIC_URL}`;
  }
  return `http://localhost:${process.env.HOST_PORT ?? 3000}`;
};
