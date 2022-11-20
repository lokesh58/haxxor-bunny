import { NextRequest, NextResponse } from 'next/server';
import { BotInviteUrl, ExternalBotInviteUrl } from './constants';

export default async function middleware(request: NextRequest) {
  // Handle Bot Invite Link (internal URL => discord URL)
  if (request.nextUrl.pathname === BotInviteUrl) {
    return NextResponse.redirect(ExternalBotInviteUrl);
  }
  return NextResponse.next();
}
