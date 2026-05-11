import { NextResponse } from 'next/server';

// Routes that are real pages — NOT company IDs
const RESERVED = new Set(['about', 'products', 'brands', 'case-studies', 'clients', 'contact', 'admin', 'api', '_next', 'favicon.ico']);

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const first = pathname.split('/')[1];
  if (RESERVED.has(first)) return NextResponse.next();
  // Everything else falls through to the [companyId] dynamic route
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|logo.png|products/).*)'],
};
