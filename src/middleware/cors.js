// middleware/cors.js
export function corsMiddleware(req, res, next) {
  const allowedOrigins = [process.env.NEXT_PUBLIC_APP_URL, "https://your-production-domain.com"];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  }
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
}
