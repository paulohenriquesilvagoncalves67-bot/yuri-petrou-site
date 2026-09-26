'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';

export function PasswordForm(){
 const router=useRouter();
 const [password,setPassword]=useState('');
 const [message,setMessage]=useState('');
 const [busy,setBusy]=useState(false);
 const [ready,setReady]=useState(false);
 useEffect(()=>{
  let active=true;
  async function prepare(){
   const query=new URLSearchParams(window.location.search);
   const hash=new URLSearchParams(window.location.hash.slice(1));
   const tokenHash=query.get('token_hash');
   const code=query.get('code');
   const accessToken=hash.get('access_token');
   const refreshToken=hash.get('refresh_token');
   const authError=hash.get('error_description');
   window.history.replaceState(null,'',window.location.pathname);
   if(authError){if(active)setMessage(authError);return;}
   try{
    const client=browserClient();
    if(tokenHash&&query.get('type')==='invite'){
     const {error}=await client.auth.verifyOtp({token_hash:tokenHash,type:'invite'});
     if(error)throw error;
    }else if(code){
     const {error}=await client.auth.exchangeCodeForSession(code);
     if(error)throw error;
    }else if(accessToken&&refreshToken){
     const {error}=await client.auth.setSession({access_token:accessToken,refresh_token:refreshToken});
     if(error)throw error;
    }
    const {data,error}=await client.auth.getUser();
    if(error||!data.user)throw error??new Error('Convite inválido ou expirado.');
    if(active)setReady(true);
   }catch(reason){if(active)setMessage(reason instanceof Error?reason.message:'Não foi possível aceitar o convite.');}
  }
  void prepare();
  return()=>{active=false;};
 },[]);
 async function save(e:React.FormEvent){
  e.preventDefault();
  if(!ready)return;
  setBusy(true);
  const {error}=await browserClient().auth.updateUser({password});
  setBusy(false);
  if(error){setMessage(error.message);return;}
  router.push('/admin');router.refresh();
 }
 return <form className="admin-form" onSubmit={save}><label>Nova senha<input type="password" minLength={10} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{message&&<p role="alert">{message}</p>}<button disabled={busy||!ready}>{busy?'Salvando…':ready?'Definir senha':'Validando convite…'}</button></form>;
}
