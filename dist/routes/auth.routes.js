"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
// STEP 1: Trigger GitHub OAuth Login
router.get("/github", (req, res, next) => {
    // Save mobile app's current Expo URL in session before passport takes over
    if (req.query.redirectUrl) {
        req.session.mobileRedirectUrl = req.query.redirectUrl;
    }
    passport_1.default.authenticate("github", {
        scope: ["user:email"],
    })(req, res, next);
});
// STEP 2: GitHub OAuth Callback
router.get("/github/callback", passport_1.default.authenticate("github", {
    session: false,
    failureRedirect: "/api/auth/failure",
}), async (req, res, next) => {
    try {
        const user = req.user;
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        // Read from session → fallback to env var for production builds
        const redirectBase = req.session.mobileRedirectUrl ||
            `${process.env.DEEP_LINK_SCHEME}auth/callback`;
        // Clean up session
        delete req.session.mobileRedirectUrl;
        return res.redirect(`${redirectBase}?token=${token}`);
    }
    catch (error) {
        next(error);
    }
});
// Failure Route
router.get("/failure", (_req, res) => {
    return res.status(401).json({
        success: false,
        message: "OAuth authentication failed",
    });
});
router.get("/me", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const user = await prisma_1.prisma.user.findUnique({
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
    }
    catch (error) {
        console.error("ME_ROUTE_ERROR:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
});
exports.default = router;
