import {NextRequest,NextResponse} from 'next/server';
import type {EmailOtpType} from '@supabase/supabase-js';
import {serverClient} from '@/lib/supabase/server';
export async function GET(request:NextRequest){
  const tokenHash=request.nextUrl.searchParams.get('token_hash');
  const type=request.nextUrl.searchParams.get('type');
  const code=request.nextUrl.searchParams.get('code');
  const client=await serverClient();
  if(tokenHash&&type==='invite'){
    const {error}=await client.auth.verifyOtp({token_hash:tokenHash,type:type as EmailOtpType});
    return NextResponse.redirect(new URL(error?'/admin/login?reason=invalid-invite':'/admin/definir-senha',request.url));
  }
  if(code){const {error}=await client.auth.exchangeCodeForSession(code);return NextResponse.redirect(new URL(error?'/admin/login':'/admin/definir-senha',request.url))}
  return NextResponse.redirect(new URL('/admin/login?reason=invalid-invite',request.url));
}
