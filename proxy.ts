import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { supabaseConfigured, supabaseEnv } from './lib/supabase/config';
export async function proxy(request: NextRequest) {
  if (!supabaseConfigured) return NextResponse.next({request});
  const {url,key}=supabaseEnv();
  let response=NextResponse.next({request});
  const client=createServerClient(url,key,{cookies:{
    getAll:()=>request.cookies.getAll(),
    setAll:(values)=>{values.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});values.forEach(({name,value,options})=>response.cookies.set(name,value,options));}
  }});
  await client.auth.getUser();
  return response;
}
export const config={matcher:['/admin/:path*','/api/admin/:path*']};
