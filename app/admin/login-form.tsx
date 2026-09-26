'use client';
import {useState} from 'react';
import {useRouter,useSearchParams} from 'next/navigation';
import {browserClient} from '@/lib/supabase/browser';
export function LoginForm(){const router=useRouter(),params=useSearchParams();const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  async function submit(e:React.FormEvent){e.preventDefault();setBusy(true);setError('');const {error}=await browserClient().auth.signInWithPassword({email,password});setBusy(false);if(error){setError('Acesso não autorizado ou credenciais incorretas.');return}router.push('/admin');router.refresh()}
  return <form onSubmit={submit} className="admin-form"><label>E-mail<input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Senha<input type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)}/></label>{params.get('reason')==='approval'&&<p className="admin-warning">Seu acesso aguarda aprovação.</p>}{params.get('reason')==='invalid-invite'&&<p className="admin-warning">Convite inválido ou expirado. Peça um novo convite ao administrador.</p>}{error&&<p role="alert" className="admin-error">{error}</p>}<button disabled={busy}>{busy?'Entrando…':'Entrar'}</button></form>}
