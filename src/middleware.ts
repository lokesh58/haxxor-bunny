import { NextRequest, NextResponse } from 'next/server';
import { ExternalBotInviteUrl, InternalBotInviteUrl } from './utils/constants';

export default async function middleware(request: NextRequest) {
  // Handle Bot Internal Invite Link
  if (request.nextUrl.pathname === InternalBotInviteUrl) {
    return NextResponse.redirect(ExternalBotInviteUrl);
  }
  return NextResponse.next();
}
