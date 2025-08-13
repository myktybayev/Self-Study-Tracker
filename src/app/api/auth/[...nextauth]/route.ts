import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';

const handler = NextAuth({
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async jwt({ token, account, profile }) {
            // GitHub профилінен қосымша ақпарат алу
            if (account?.provider === 'github') {
                token.accessToken = account.access_token;
                token.githubUsername = (profile as any)?.login;
                token.githubId = (profile as any)?.id;
                // GitHub ID-ны user identifier ретінде қолдану
                token.userId = `github_${(profile as any)?.id}`;
            }
            return token;
        },
        async session({ session, token }) {
            // Session-ға GitHub ақпаратын қосу
            if (token.githubUsername) {
                (session.user as any).githubUsername = token.githubUsername as string;
                (session.user as any).githubId = token.githubId as number;
                (session.user as any).userId = token.userId as string; // GitHub ID-based user ID
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
