"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("../config/passport"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
/**
 * STEP 1:
 * Trigger GitHub OAuth Login
 */
router.get("/github", passport_1.default.authenticate("github", {
    session: false,
}));
/**
 * STEP 2:
 * GitHub OAuth Callback
 */
router.get("/github/callback", passport_1.default.authenticate("github", {
    session: false,
    failureRedirect: "/auth/failure",
}), async (req, res, next) => {
    try {
        const user = req.user;
        /**
         * STEP 3:
         * Generate Aegis JWT
         */
        const token = jsonwebtoken_1.default.sign({
            id: user.id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
        }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });
        /**
         * STEP 4:
         * Redirect back to mobile app
         */
        const redirectUrl = `${process.env.DEEP_LINK_SCHEME}?token=${token}`;
        // deep link - work look at text file
        return res.redirect(redirectUrl);
    }
    catch (error) {
        next(error);
    }
});
/**
 * OPTIONAL:
 * OAuth Failure Route
 */
router.get("/failure", (_req, res) => {
    return res.status(401).json({
        success: false,
        message: "OAuth authentication failed",
    });
});
exports.default = router;
