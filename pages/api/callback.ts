import type { NextApiRequest, NextApiResponse } from 'next';

const {
  OAUTH_CLIENT_ID,
  OAUTH_CLIENT_SECRET,
} = process.env;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, state } = req.query;

  if (!code || !OAUTH_CLIENT_ID || !OAUTH_CLIENT_SECRET) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: OAUTH_CLIENT_ID,
        client_secret: OAUTH_CLIENT_SECRET,
        code: code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json({ error: tokenData.error_description || 'OAuth failed' });
    }

    const accessToken = tokenData.access_token;

    // Return HTML that posts the token back to Decap CMS
    res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authenticating...</title>
        </head>
        <body>
          <script>
            (function() {
              function receiveMessage(e) {
                if (e.data === 'authorizing:' + window.location.origin) {
                  window.opener.postMessage(
                    {
                      token: '${accessToken}',
                      provider: 'github'
                    },
                    e.origin
                  );
                }
              }
              window.addEventListener('message', receiveMessage, false);
              window.opener.postMessage('authorizing:' + window.location.origin, '*');
            })();
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}