import passport, { Profile } from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { prisma } from "../lib/prisma"; 

// Passport’s job here is:

// redirect user to GitHub
// receive GitHub callback
// exchange temporary code for access token
// fetch GitHub profile
// give your backend the authenticated user

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ["user:email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: (error: Error | null, user?: Express.User | false) => void,
    ) => {
      try {
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("No email returned from GitHub"));
        }

        // STEP 1:
        // Check if GitHub account already exists
        const existingAccount = await prisma.account.findUnique({
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
        const user = await prisma.user.upsert({
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
        await prisma.account.create({
          data: {
            userId: user.id,
            type: "oauth",
            provider: "github",
            providerAccountId: profile.id,
            access_token: accessToken,
            refresh_token: refreshToken,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error);
      }
    },
  ),
);

export default passport;
