import { NextRequest, NextResponse } from 'next/server';
import { BotInviteUrl, CDNUrl, ExternalBotInviteUrl } from './constants';

export default async function middleware(request: NextRequest) {
  // Handle Bot Invite Link (internal URL => discord URL)
  if (request.nextUrl.pathname === BotInviteUrl) {
    return NextResponse.redirect(ExternalBotInviteUrl);
  }
  if (request.nextUrl.pathname.startsWith(CDNUrl)) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = `/api${request.nextUrl.pathname}`;
    return NextResponse.rewrite(rewriteUrl);
  }
  return NextResponse.next();
}
