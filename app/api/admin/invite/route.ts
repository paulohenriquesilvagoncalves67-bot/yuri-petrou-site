import {NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {requireAdmin} from '@/lib/supabase/auth';
import {supabaseEnv} from '@/lib/supabase/config';
export async function POST(request:Request){
 await requireAdmin();
 const secret=process.env.SUPABASE_SECRET_KEY;
 if(!secret)return NextResponse.json({error:'Configure SUPABASE_SECRET_KEY no servidor.'},{status:503});
 const body=await request.json().catch(()=>({})) as {email?:unknown;name?:unknown};const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';const name=typeof body.name==='string'?body.name.trim():'';
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!name||name.length>100)return NextResponse.json({error:'Informe nome e e-mail válidos.'},{status:400});
 const {url}=supabaseEnv();const admin=createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
 const {error}=await admin.auth.admin.inviteUserByEmail(email,{data:{name},redirectTo:new URL('/admin/definir-senha',request.url).toString()});
 if(error)return NextResponse.json({error:error.message},{status:400});
 return NextResponse.json({ok:true});
}
