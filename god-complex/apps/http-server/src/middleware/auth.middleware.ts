import { auth } from "../auth";
import { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const session = await auth.api.getSession({
  headers: fromNodeHeaders(req.headers), 
});

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = { id: session.user.id };
  next();
}
