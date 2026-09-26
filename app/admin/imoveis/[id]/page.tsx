import Link from 'next/link';
import {notFound} from 'next/navigation';
import {requireProfile} from '@/lib/supabase/auth';
import {serverClient} from '@/lib/supabase/server';
import {AdminNav} from '../../admin-nav';
import {PropertyEditor, type EditorImage} from '../property-editor';
import type {DbImage,DbProperty} from '@/lib/properties/types';
export default async function EditPropertyPage({params}:{params:Promise<{id:string}>}){const profile=await requireProfile();if(!profile)notFound();const {id}=await params;const client=await serverClient();const {data,error}=await client.from('properties').select('*').eq('id',id).single();if(error||!data)notFound();const {data:images}=await client.from('property_images').select('*').eq('property_id',id).order('position');const photos:EditorImage[]=await Promise.all(((images||[]) as DbImage[]).map(async image=>{const {data:full}=await client.storage.from('property-images').createSignedUrl(image.thumbnail_path,3600);return {...image,preview:full?.signedUrl||''}}));return <><AdminNav admin={profile.role==='admin'} name={profile.name||profile.email}/><main className="admin-main"><Link href="/admin/imoveis">← Voltar aos imóveis</Link><h1>Editar imóvel</h1><PropertyEditor profile={profile} initial={data as DbProperty} initialImages={photos}/></main></>}
