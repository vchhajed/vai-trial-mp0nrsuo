export async function GET() {
  return Response.json({
    POSTGRES_URL: !!process.env.POSTGRES_URL,
    POSTGRES_URL_PREFIX: process.env.POSTGRES_URL?.slice(0, 20) ?? 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
  });
}
