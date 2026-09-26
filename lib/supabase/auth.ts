import 'server-only';
import {redirect} from 'next/navigation';
import {supabaseConfigured} from './config';
import {serverClient} from './server';
import type {Profile} from '@/lib/properties/types';
export async function requireProfile(){
  if(!supabaseConfigured) return null;
  const client=await serverClient();
  const {data:{user}}=await client.auth.getUser();
  if(!user) redirect('/admin/login');
  const {data:profile,error}=await client.from('profiles').select('id,email,name,role,approved').eq('id',user.id).single();
  if(error||!profile?.approved) redirect('/admin/login?reason=approval');
  return profile as Profile;
}
export async function requireAdmin(){const profile=await requireProfile();if(!profile||profile.role!=='admin') redirect('/admin/imoveis');return profile}
