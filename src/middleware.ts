import { NextRequest, NextResponse } from 'next/server';
import { botInviteUrl } from './utils/constants';

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/invite') {
    return NextResponse.redirect(botInviteUrl);
  }
}
