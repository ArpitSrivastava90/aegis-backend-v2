"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const github_service_1 = require("../services/github/github.service");
const router = (0, express_1.Router)();
router.get("/repos", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const repos = await (0, github_service_1.getGithubRepositories)(userId);
        return res.status(200).json({
            repos,
        });
    }
    catch (error) {
        console.error("GITHUB_REPOS_ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch repositories",
        });
    }
});
exports.default = router;
