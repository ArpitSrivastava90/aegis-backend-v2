"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const github_service_1 = require("../services/github/github.service");
const gemini_service_1 = require("../services/ai/gemini.service");
const router = (0, express_1.Router)();
//* test done
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
//* test done
//GET /api/github/repos/:owner/:repo/pulls
router.get("/repos/:owner/:repo/pulls", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const owner = req.params.owner;
        const repo = req.params.repo;
        // const pullNumber = req.params.pullNumber as string;
        const pulls = await (0, github_service_1.getRepositoryPullRequests)(userId, owner, repo);
        return res.status(200).json({
            pulls,
        });
    }
    catch (error) {
        console.error("GITHUB_PULLS_ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch pull requests",
        });
    }
});
//* test done
// GET /api/github/repos/:owner/:repo/pulls/:pullNumber/files
router.get("/repos/:owner/:repo/pulls/:pullNumber/files", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const owner = req.params.owner;
        const repo = req.params.repo;
        const pullNumber = req.params.pullNumber;
        const files = await (0, github_service_1.getPullRequestFiles)(userId, owner, repo, pullNumber);
        return res.status(200).json({
            files,
        });
    }
    catch (error) {
        console.error("GITHUB_PR_FILES_ERROR:", error);
        return res.status(500).json({
            message: "Failed to fetch PR files",
        });
    }
});
//* test done
// POST /api/github/analyze/pr-summary
router.post("/analyze/pr-summary", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const { owner, repo, pullNumber } = req.body;
        const prData = await (0, github_service_1.getPullRequestDetails)(userId, owner, repo, pullNumber);
        const summary = await (0, gemini_service_1.generatePRSummary)(prData);
        return res.status(200).json({
            summary,
        });
    }
    catch (error) {
        console.error("PR_SUMMARY_ERROR:", error);
        return res.status(500).json({
            message: "Failed to generate PR summary",
        });
    }
});
// POST /api/github/analyze/vulnerabilities
// POST https://aegis-backend-v2-2.onrender.com/api/github/analyze/vulnerabilities
router.post("/analyze/vulnerabilities", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const { owner, repo, pullNumber } = req.body;
        const prData = await (0, github_service_1.getPullRequestDetails)(userId, owner, repo, pullNumber);
        const vulnerabilities = await (0, gemini_service_1.analyzePRVulnerabilities)(prData);
        return res.status(200).json({
            vulnerabilities,
        });
    }
    catch (error) {
        console.error("PR_VULNERABILITY_ERROR:", error);
        return res.status(500).json({
            message: "Failed to analyze vulnerabilities",
        });
    }
});
// POST https://aegis-backend-v2-2.onrender.com/api/github/analyze/risk-score
router.post("/analyze/risk-score", auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const userId = req.auth?.id;
        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        const { owner, repo, pullNumber } = req.body;
        const prData = await (0, github_service_1.getPullRequestDetails)(userId, owner, repo, pullNumber);
        const riskAnalysis = await (0, gemini_service_1.generatePRRiskScore)(prData);
        return res.status(200).json({
            risk: riskAnalysis,
        });
    }
    catch (error) {
        console.error("PR_RISK_SCORE_ERROR:", error);
        return res.status(500).json({
            message: "Failed to generate risk score",
        });
    }
});
exports.default = router;
// Ai frontend side
// {
//   "owner": "vercel",
//   "repo": "next.js",
//   "pullNumber": "123"
// }
// Ai flow
// Frontend selects PR
// ↓
// Backend fetches PR files/diffs
// ↓
// Backend builds AI prompt
// ↓
// Gemini analyzes diff
// ↓
// Backend returns summary
// Request Body
// Frontend sends:
// {
//   "owner": "vercel",
//   "repo": "next.js",
//   "pullNumber": "123"
// }
