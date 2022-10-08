import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/invite') {
    return NextResponse.redirect(
      `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_APP_ID}&scope=applications.commands`
    );
  }
}
