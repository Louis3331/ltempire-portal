import NextAuth from 'next-auth';

const WhopProvider = {
  id: 'whop',
  name: 'Whop',
  type: 'oauth',
  authorization: {
    url: 'https://whop.com/oauth',
    params: {
      scope: 'openid',
    },
  },
  token: {
    url: 'https://api.whop.com/oauth/token',
    async request({ params, checks }) {
      console.log('params.code:', params.code);
      console.log('code_verifier:', checks?.code_verifier);
      const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: params.code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/whop`,
        client_id: process.env.WHOP_CLIENT_ID,
      });
      if (checks?.code_verifier) {
        body.append('code_verifier', checks.code_verifier);
      }
      console.log('token body:', body.toString().replace(params.code, '[CODE]'));
      const response = await fetch('https://api.whop.com/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const tokens = await response.json();
      console.log('Whop token response:', JSON.stringify(tokens));
      return { tokens };
    },
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
  checks: ['pkce', 'state'],
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
