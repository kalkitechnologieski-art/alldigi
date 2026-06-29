export const dynamic = 'force-static';
import { NextRequest, NextResponse } from 'next/server';
export async function GET() { return NextResponse.json([]); }
