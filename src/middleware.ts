import { NextRequest, NextResponse } from 'next/server';
import { ExternalBotInviteUrl, InternalBotInviteUrl } from './utils/constants';

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === InternalBotInviteUrl) {
    return NextResponse.redirect(ExternalBotInviteUrl);
  }
}
