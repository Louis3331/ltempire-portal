import NextAuth from 'next-auth';

const WhopProvider = {
  id: 'whop',
  name: 'Whop',
  type: 'oauth',
  authorization: {
    url: 'https://whop.com/oauth',
    params: {
      scope: 'openid',
      client_id: process.env.WHOP_CLIENT_ID,
      redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/whop`,
    },
  },
  token: {
    url: 'https://api.whop.com/v5/oauth/token',
  },
  userinfo: {
    url: 'https://api.whop.com/v5/me',
    async request({ tokens }) {
      const res = await fetch('https://api.whop.com/v5/me', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      return res.json();
    },
  },
  profile(profile) {
    return {
      id: profile.id,
      name: profile.username || profile.name,
      email: profile.email,
      image: profile.profile_pic_url,
    };
  },
  clientId: process.env.WHOP_CLIENT_ID,
  clientSecret: process.env.WHOP_CLIENT_SECRET,
};

export default NextAuth({
  providers: [WhopProvider],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.access_token) {
        token.accessToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      return session;
    },
  },
  pages: {
    signIn: '/',
    error: '/',
  },
  session: {
    strategy: 'jwt',
  },
});
