import {redirect} from 'next/navigation';
import {requireProfile} from '@/lib/supabase/auth';
export default async function AdminIndex(){const profile=await requireProfile();redirect(profile?.role==='admin'?'/admin/revisao':'/admin/imoveis')}
