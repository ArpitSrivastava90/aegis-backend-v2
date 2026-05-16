"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGithubRepositories = void 0;
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
    if (!response.ok) {
        throw new Error("Failed to fetch repositories");
    }
    const repos = await response.json();
    return repos;
};
exports.getGithubRepositories = getGithubRepositories;
