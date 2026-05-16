import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { getGithubRepositories } from "../services/github/github.service";

const router = Router();

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

export default router;