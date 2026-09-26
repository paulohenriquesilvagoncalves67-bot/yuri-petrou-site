'use client';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
export function AdminNav({admin,name}:{admin:boolean;name:string}){const router=useRouter();return <header className="admin-nav"><Link href="/admin/imoveis" className="admin-brand">YURI PETROU <small>GERENCIAMENTO DE IMÓVEIS</small></Link><nav><Link href="/admin/imoveis">Imóveis</Link>{admin&&<><Link href="/admin/revisao">Aguardando aprovação</Link><Link href="/admin/usuarios">Usuários</Link></>}</nav><span>{name}</span><button type="button" onClick={async()=>{await browserClient().auth.signOut();router.push('/admin/login');router.refresh()}}>Sair</button></header>}
