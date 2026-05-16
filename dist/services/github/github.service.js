"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPullRequestDetails = exports.getPullRequestFiles = exports.getRepositoryPullRequests = exports.getGithubRepositories = void 0;
const prisma_1 = require("../../lib/prisma");
const getGithubRepositories = async (userId) => {
    const integration = await prisma_1.prisma.integration.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: "github",
            },
        },
    });
    if (!integration || !integration.accessToken) {
        throw new Error("GitHub integration not found");
    }
    const response = await fetch("https://api.github.com/user/repos", {
        headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            Accept: "application/vnd.github+json",
        },
    });
    const data = await response.json();
    if (!response.ok) {
        console.error("GITHUB API ERROR:", data);
        throw new Error("Failed to fetch repositories");
    }
    return data;
};
exports.getGithubRepositories = getGithubRepositories;
const getRepositoryPullRequests = async (userId, owner, repo) => {
    const integration = await prisma_1.prisma.integration.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: "github",
            },
        },
    });
    if (!integration || !integration.accessToken) {
        throw new Error("GitHub integration not found");
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            Accept: "application/vnd.github+json",
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch pull requests");
    }
    const pulls = await response.json();
    return pulls;
};
exports.getRepositoryPullRequests = getRepositoryPullRequests;
const getPullRequestFiles = async (userId, owner, repo, pullNumber) => {
    const integration = await prisma_1.prisma.integration.findUnique({
        where: {
            userId_provider: {
                userId,
                provider: "github",
            },
        },
    });
    if (!integration || !integration.accessToken) {
        throw new Error("GitHub integration not found");
    }
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`, {
        headers: {
            Authorization: `Bearer ${integration.accessToken}`,
            Accept: "application/vnd.github+json",
        },
    });
    if (!response.ok) {
        throw new Error("Failed to fetch PR files");
    }
    const files = await response.json();
    return files;
};
exports.getPullRequestFiles = getPullRequestFiles;
const getPullRequestDetails = async (userId, owner, repo, pullNumber) => {
    const files = await (0, exports.getPullRequestFiles)(userId, owner, repo, pullNumber);
    const formatted = files
        .map((file) => {
        return `
FILE: ${file.filename}

PATCH:
${file.patch || "No patch available"}
`;
    })
        .join("\n\n");
    return formatted;
};
exports.getPullRequestDetails = getPullRequestDetails;
