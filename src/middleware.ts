import { type NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Desabilitado para desenvolvimento front-end
export async function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
