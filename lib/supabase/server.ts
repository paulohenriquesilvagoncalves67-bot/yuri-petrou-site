import 'server-only';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseEnv } from './config';
export async function serverClient() {
  const {url,key}=supabaseEnv();
  const store=await cookies();
  return createServerClient(url,key,{cookies:{
    getAll:()=>store.getAll(),
    setAll:(values)=>{try { values.forEach(({name,value,options})=>store.set(name,value,options)); } catch { /* Server Components cannot set cookies; proxy refreshes them. */ }}
  }});
}
