import {Suspense} from 'react';
import {LoginForm} from '../login-form';
import {supabaseConfigured} from '@/lib/supabase/config';
export default function LoginPage(){return <main className="admin-login"><div className="admin-panel"><p className="admin-kicker">YURI PETROU · ACESSO RESTRITO</p><h1>Entrar no painel</h1>{supabaseConfigured?<Suspense fallback={<p>Carregando acesso…</p>}><LoginForm/></Suspense>:<p>O painel estará disponível após configurar o projeto Supabase exclusivo do Yuri.</p>}</div></main>}
