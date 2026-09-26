import Link from 'next/link';
import {requireProfile} from '@/lib/supabase/auth';
import {AdminNav} from '../../admin-nav';
import {PropertyEditor} from '../property-editor';
export default async function NewPropertyPage(){const profile=await requireProfile();if(!profile)return <main className="admin-main">Configure o Supabase para começar.</main>;return <><AdminNav admin={profile.role==='admin'} name={profile.name||profile.email}/><main className="admin-main"><Link href="/admin/imoveis">← Voltar aos imóveis</Link><h1>Novo imóvel</h1><PropertyEditor profile={profile}/></main></>}
