import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import {
  getGithubRepositories,
  getPullRequestDetails,
  getPullRequestFiles,
  getRepositoryPullRequests,
} from "../services/github/github.service";

const router = Router();

//* test done
router.get("/repos", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const repos = await getGithubRepositories(userId);

    return res.status(200).json({
      repos,
    });
  } catch (error) {
    console.error("GITHUB_REPOS_ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch repositories",
    });
  }
});

//* test done
//GET /api/github/repos/:owner/:repo/pulls
router.get("/repos/:owner/:repo/pulls", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const owner = req.params.owner as string;
    const repo = req.params.repo as string;
    // const pullNumber = req.params.pullNumber as string;

    const pulls = await getRepositoryPullRequests(userId, owner, repo);

    return res.status(200).json({
      pulls,
    });
  } catch (error) {
    console.error("GITHUB_PULLS_ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch pull requests",
    });
  }
});

//* test done
// GET /api/github/repos/:owner/:repo/pulls/:pullNumber/files
router.get(
  "/repos/:owner/:repo/pulls/:pullNumber/files",
  authMiddleware,
  async (req, res) => {
    try {
      const userId = req.auth?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const owner = req.params.owner as string;
      const repo = req.params.repo as string;
      const pullNumber = req.params.pullNumber as string;

      const files = await getPullRequestFiles(userId, owner, repo, pullNumber);

      return res.status(200).json({
        files,
      });
    } catch (error) {
      console.error("GITHUB_PR_FILES_ERROR:", error);

      return res.status(500).json({
        message: "Failed to fetch PR files",
      });
    }
  },
);

//* test done
// POST /api/github/analyze/pr-summary
router.post("/analyze/pr-summary", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { owner, repo, pullNumber } = req.body;

    const prData = await getPullRequestDetails(userId, owner, repo, pullNumber);

    const summary = await generatePRSummary(prData);

    return res.status(200).json({
      summary,
    });
  } catch (error) {
    console.error("PR_SUMMARY_ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate PR summary",
    });
  }
});

// POST /api/github/analyze/vulnerabilities
// POST https://aegis-backend-v2-2.onrender.com/api/github/analyze/vulnerabilities
router.post("/analyze/vulnerabilities", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { owner, repo, pullNumber } = req.body;

    const prData = await getPullRequestDetails(userId, owner, repo, pullNumber);

    const vulnerabilities = await analyzePRVulnerabilities(prData);

    return res.status(200).json({
      vulnerabilities,
    });
  } catch (error) {
    console.error("PR_VULNERABILITY_ERROR:", error);

    return res.status(500).json({
      message: "Failed to analyze vulnerabilities",
    });
  }
});

// POST https://aegis-backend-v2-2.onrender.com/api/github/analyze/risk-score
router.post("/analyze/risk-score", authMiddleware, async (req, res) => {
  try {
    const userId = req.auth?.id;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { owner, pullNumber } = req.body;
    const { repo } = req.body;
    const prData = await getPullRequestDetails(userId, owner, repo, pullNumber);

    const riskAnalysis = await generatePRRiskScore(prData);

    return res.status(200).json({
      risk: riskAnalysis,
    });
  } catch (error) {
    console.error("PR_RISK_SCORE_ERROR:", error);

    return res.status(500).json({
      message: "Failed to generate risk score",
    });
  }
});

export default router;

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
