import Link from 'next/link';
import {Plus} from 'lucide-react';
import {requireProfile} from '@/lib/supabase/auth';
import {serverClient} from '@/lib/supabase/server';
import {supabaseConfigured} from '@/lib/supabase/config';
import {AdminNav} from '../admin-nav';
import type {DbProperty} from '@/lib/properties/types';

const labels:Record<string,string>={draft:'Rascunho',pending_review:'Aguardando aprovação',published:'Publicado',rejected:'Rejeitado',inactive:'Inativo',sold:'Vendido',rented:'Alugado'};
const pageSize=24;

export default async function PropertiesPage({searchParams}:{searchParams:Promise<{page?:string}>}){
  const profile=await requireProfile();
  if(!profile||!supabaseConfigured)return <main className="admin-main"><h1>Configuração pendente</h1><p>Conecte o projeto Supabase do Yuri para ativar o painel.</p></main>;
  const requested=Number((await searchParams).page||1);
  const page=Number.isSafeInteger(requested)&&requested>0?requested:1;
  const client=await serverClient();
  let query=client.from('properties').select('*',{count:'exact'}).order('updated_at',{ascending:false}).range((page-1)*pageSize,page*pageSize-1);
  if(profile.role==='contributor')query=query.eq('created_by',profile.id);
  const {data,error,count}=await query;
  const items=(data||[]) as DbProperty[];
  const countQueries=[
    client.from('properties').select('id',{count:'exact',head:true}).eq('publication_status','published').eq('property_status','available'),
    client.from('properties').select('id',{count:'exact',head:true}).eq('publication_status','pending_review'),
    client.from('properties').select('id',{count:'exact',head:true}).eq('publication_status','draft'),
    client.from('properties').select('id',{count:'exact',head:true}).neq('property_status','available')
  ];
  const results=await Promise.all(countQueries.map(q=>profile.role==='contributor'?q.eq('created_by',profile.id):q));
  const counts=results.map(r=>r.count||0);
  const covers=new Map<string,string>();
  if(items.length){
    const {data:images}=await client.from('property_images').select('property_id,thumbnail_path').in('property_id',items.map(p=>p.id)).eq('is_cover',true);
    await Promise.all((images||[]).map(async image=>{
      const {data:signed}=await client.storage.from('property-images').createSignedUrl(image.thumbnail_path,3600);
      if(signed?.signedUrl)covers.set(image.property_id,signed.signedUrl);
    }));
  }
  return <>
    <AdminNav admin={profile.role==='admin'} name={profile.name||profile.email}/>
    <main className="admin-main">
      <div className="admin-heading"><div><p className="admin-kicker">PORTFÓLIO</p><h1>Imóveis</h1></div><Link className="admin-button" href="/admin/imoveis/novo"><Plus size={18} strokeWidth={2} aria-hidden="true"/><span>Novo imóvel</span></Link></div>
      {error&&<p role="alert" className="admin-error">Não foi possível carregar os imóveis: {error.message}</p>}
      <div className="admin-stats">
        <div><strong>{counts[0]}</strong><span>Publicados</span></div>
        <div><strong>{counts[1]}</strong><span>Aguardando aprovação</span></div>
        <div><strong>{counts[2]}</strong><span>Rascunhos</span></div>
        <div><strong>{counts[3]}</strong><span>Inativos / vendidos / alugados</span></div>
      </div>
      {!items.length?<div className="admin-panel"><p>{page===1?'Nenhum imóvel cadastrado. Comece pelo botão “Novo imóvel”.':'Nenhum imóvel nesta página.'}</p></div>:
      <div className="admin-list">{items.map(p=><article key={p.id} className="admin-row">
        {covers.get(p.id)&&<img className="admin-row-cover" src={covers.get(p.id)} alt={`Capa de ${p.title}`}/>}
        <div><h2>{p.title||'Sem título'}</h2><p>{[p.neighborhood,p.city].filter(Boolean).join(' · ')} · {labels[p.publication_status]}{p.property_status!=='available'&&` · ${labels[p.property_status]}`}</p><small>Atualizado em {new Date(p.updated_at).toLocaleDateString('pt-BR')}</small></div>
        <Link href={`/admin/imoveis/${p.slug}`}>Editar</Link>
        {p.publication_status==='published'&&p.property_status==='available'&&<Link href={`/imoveis/${p.slug}`} target="_blank" rel="noreferrer">Visualizar</Link>}
      </article>)}</div>}
      <nav className="admin-pagination" aria-label="Páginas de imóveis">
        {page>1&&<Link href={`/admin/imoveis?page=${page-1}`}>← Anterior</Link>}
        <span>Página {page} de {Math.max(1,Math.ceil((count||0)/pageSize))}</span>
        {page*pageSize<(count||0)&&<Link href={`/admin/imoveis?page=${page+1}`}>Próxima →</Link>}
      </nav>
    </main>
  </>;
}
