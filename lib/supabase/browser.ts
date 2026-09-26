'use client';
import { createBrowserClient } from '@supabase/ssr';
import { supabaseEnv } from './config';
let client: ReturnType<typeof createBrowserClient> | undefined;
export function browserClient() {
  if (!client) { const {url,key}=supabaseEnv(); client=createBrowserClient(url,key); }
  return client;
}
