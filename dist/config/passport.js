"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_github2_1 = require("passport-github2");
const prisma_1 = require("../lib/prisma");
// Passport’s job here is:
// redirect user to GitHub
// receive GitHub callback
// exchange temporary code for access token
// fetch GitHub profile
// give your backend the authenticated user
passport_1.default.use(new passport_github2_1.Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL,
    scope: ["user:email", "repo"],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails?.[0]?.value;
        if (!email) {
            return done(new Error("No email returned from GitHub"));
        }
        // STEP 1:
        // Check if GitHub account already exists
        const existingAccount = await prisma_1.prisma.account.findUnique({
            where: {
                provider_providerAccountId: {
                    provider: "github",
                    providerAccountId: profile.id,
                },
            },
            include: {
                user: true,
            },
        });
        if (existingAccount) {
            return done(null, existingAccount.user);
        }
        // STEP 2:
        // Find existing user OR create new user
        const user = await prisma_1.prisma.user.upsert({
            where: {
                email,
            },
            update: {},
            create: {
                email,
                name: profile.displayName || profile.username,
                avatar: profile.photos?.[0]?.value,
            },
        });
        // STEP 3:
        // Link GitHub account to user
        await prisma_1.prisma.account.create({
            data: {
                userId: user.id,
                type: "oauth",
                provider: "github",
                providerAccountId: profile.id,
                access_token: accessToken,
                refresh_token: refreshToken,
            },
        });
        await prisma_1.prisma.integration.upsert({
            where: {
                userId_provider: {
                    userId: user.id,
                    provider: "github",
                },
            },
            update: {
                accessToken: accessToken,
                refreshToken: refreshToken,
                username: profile.username,
                email: email,
                avatar: profile.photos?.[0]?.value,
                status: "connected",
            },
            create: {
                userId: user.id,
                provider: "github",
                providerAccountId: profile.id,
                accessToken: accessToken,
                refreshToken: refreshToken,
                username: profile.username,
                email: email,
                avatar: profile.photos?.[0]?.value,
                status: "connected",
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error);
    }
}));
exports.default = passport_1.default;
