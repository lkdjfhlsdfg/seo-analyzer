import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const hash = url.hash.substring(1); // Remove the leading #
    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');

    if (!access_token) {
      throw new Error('No access token found');
    }

    // Send the access token back to the parent window
    const script = `
      window.opener.postMessage(
        { type: 'GOOGLE_SIGN_IN_SUCCESS', access_token: '${access_token}' },
        '${url.origin}'
      );
      window.close();
    `;

    return new NextResponse(
      `
      <html>
        <body>
          <script>${script}</script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  } catch (error) {
    console.error('Error in Google callback:', error);
    return new NextResponse(
      `
      <html>
        <body>
          <script>
            window.close();
          </script>
        </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html',
        },
      }
    );
  }
} 