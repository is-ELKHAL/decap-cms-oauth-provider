import type { NextApiRequest, NextApiResponse } from 'next';

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
  OAUTH_SCOPE = 'repo,user'
} = process.env;

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    return res.status(500).json({ error: 'OAuth credentials not configured' });
  }

  const baseUrl = `https://${req.headers.host}`;
  const redirectUri = `${baseUrl}/api/callback`;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
    `client_id=${OAUTH_CLIENT_ID}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(OAUTH_SCOPE)}` +
    `&state=${Math.random().toString(36).substring(7)}`;

  res.redirect(302, githubAuthUrl);
}