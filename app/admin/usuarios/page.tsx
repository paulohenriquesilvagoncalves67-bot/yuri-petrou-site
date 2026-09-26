import {requireAdmin} from '@/lib/supabase/auth';
import {serverClient} from '@/lib/supabase/server';
import {AdminNav} from '../admin-nav';
import {UserManager} from './user-manager';
import type {Profile} from '@/lib/properties/types';
export default async function UsersPage(){const profile=await requireAdmin();const client=await serverClient();const {data,error}=await client.from('profiles').select('id,email,name,role,approved').order('created_at',{ascending:false});return <><AdminNav admin name={profile.name||profile.email}/><main className="admin-main"><p className="admin-kicker">ACESSOS</p><h1>Usuários autorizados</h1>{error&&<p role="alert" className="admin-error">{error.message}</p>}<UserManager users={(data||[]) as Profile[]} currentId={profile.id}/></main></>}
