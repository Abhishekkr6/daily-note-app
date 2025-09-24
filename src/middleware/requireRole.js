// middleware/requireRole.js
import { verifyAccessToken } from "@/utils/token";
import User from "@/models/userModel";

export function requireRole(role) {
  return async function (req, res, next) {
    try {
      const token = req.cookies.authToken || req.headers.authorization?.split(" ")[1];
      if (!token) return res.status(401).json({ error: "Unauthorized" });
      const payload = verifyAccessToken(token);
      const user = await User.findById(payload.id);
      if (!user || user.role !== role) {
        return res.status(403).json({ error: "Forbidden" });
      }
      req.user = user;
      next();
    } catch (err) {
      return res.status(401).json({ error: "Unauthorized" });
    }
  };
}
