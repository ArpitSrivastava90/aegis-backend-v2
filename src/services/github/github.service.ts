import { prisma } from "../../lib/prisma";

export const getGithubRepositories = async (userId: string) => {
  const integration = await prisma.integration.findUnique({
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

export const getRepositoryPullRequests = async (
  userId: string,
  owner: string,
  repo: string,
) => {
  const integration = await prisma.integration.findUnique({
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

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls`,
    {
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch pull requests");
  }

  const pulls = await response.json();

  return pulls;
};

export const getPullRequestFiles = async (
  userId: string,
  owner: string,
  repo: string,
  pullNumber: string,
) => {
  const integration = await prisma.integration.findUnique({
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

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
    {
      headers: {
        Authorization: `Bearer ${integration.accessToken}`,
        Accept: "application/vnd.github+json",
      },
    },
  );

  if (!response.ok) {
    throw new Error("Failed to fetch PR files");
  }

  const files = await response.json();

  return files;
};
export const getPullRequestDetails = async (
  userId: string,
  owner: string,
  repo: string,
  pullNumber: string,
) => {
  const files = await getPullRequestFiles(userId, owner, repo, pullNumber);

  const formatted = files
    .map((file: any) => {
      return `
FILE: ${file.filename}

PATCH:
${file.patch || "No patch available"}
`;
    })
    .join("\n\n");

  return formatted;
};
