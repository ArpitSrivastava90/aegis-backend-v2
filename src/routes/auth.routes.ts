import { Router, Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";

const router = Router();

// STEP 1: Trigger GitHub OAuth Login
router.get("/github", (req, res, next) => {
  passport.authenticate("github", {
    scope: ["user:email"],
    state: req.query.state as string,
  })(req, res, next);
});

// STEP 2: GitHub OAuth Callback
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/failure",
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as {
        id: string;
        email: string;
        name?: string | null;
        avatar?: string | null;
      };

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET!,
        { expiresIn: "7d" },
      );

      const redirectBase = req.query.state as string;

      return res.redirect(`${redirectBase}?token=${token}`);
    } catch (error) {
      next(error);
    }
  },
);

// Failure Route
router.get("/failure", (_req: Request, res: Response) => {
  return res.status(401).json({
    success: false,
    message: "OAuth authentication failed",
  });
});

export default router;