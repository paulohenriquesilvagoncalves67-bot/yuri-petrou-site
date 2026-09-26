import Link from 'next/link';
import {requireAdmin} from '@/lib/supabase/auth';
import {serverClient} from '@/lib/supabase/server';
import {AdminNav} from '../admin-nav';
import type {DbProperty} from '@/lib/properties/types';
export default async function ReviewPage(){const profile=await requireAdmin();const client=await serverClient();const {data,error}=await client.from('properties').select('*').eq('publication_status','pending_review').order('updated_at',{ascending:true});return <><AdminNav admin name={profile.name||profile.email}/><main className="admin-main"><p className="admin-kicker">REVISÃO</p><h1>Aguardando aprovação</h1>{error&&<p className="admin-error" role="alert">{error.message}</p>}{!data?.length&&<div className="admin-panel">Nenhum imóvel aguardando aprovação.</div>}{(data as DbProperty[]||[]).map(p=><article className="admin-row" key={p.id}><div><h2>{p.title}</h2><p>{[p.neighborhood,p.city].filter(Boolean).join(' · ')}</p></div><Link href={`/admin/imoveis/${p.id}`}>Revisar</Link></article>)}</main></>}
