import type { NextApiRequest, NextApiResponse } from 'next';

interface LogoutResponse {
  message?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<LogoutResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Clear auth cookie/token
  res.setHeader('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 UTC;');

  return res.status(200).json({ message: 'Logged out successfully' });
}
