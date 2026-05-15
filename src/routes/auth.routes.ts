import { Router, Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";

const router = Router();

/**
 * STEP 1:
 * Trigger GitHub OAuth Login
 */
router.get(
  "/github",
  passport.authenticate("github", {
    session: false,
  }),
);

/**
 * STEP 2:
 * GitHub OAuth Callback
 */
router.get(
  "/github/callback",
  passport.authenticate("github", {
    session: false,
    failureRedirect: "/auth/failure",
  }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as {
        id: string;
        email: string;
        name?: string | null;
        avatar?: string | null;
      };

      /**
       * STEP 3:
       * Generate Aegis JWT
       */
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        },
        process.env.JWT_SECRET!,
        {
          expiresIn: "7d",
        },
      );

      /**
       * STEP 4:
       * Redirect back to mobile app
       */
      const redirectUrl = `${process.env.DEEP_LINK_SCHEME}?token=${token}`;
      // deep link - work look at text file
      return res.redirect(redirectUrl);
    } catch (error) {
      next(error);
    }
  },
);

/**
 * OPTIONAL:
 * OAuth Failure Route
 */
router.get("/failure", (_req: Request, res: Response) => {
  return res.status(401).json({
    success: false,
    message: "OAuth authentication failed",
  });
});

export default router;
