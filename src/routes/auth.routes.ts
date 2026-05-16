import { Router, Request, Response, NextFunction } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../lib/prisma";
import { getPullRequestDetails } from "../services/github/github.service";

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

router.get("/me", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    console.error("ME_ROUTE_ERROR:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
});



export default router;
