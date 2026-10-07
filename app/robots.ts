import type {MetadataRoute} from 'next';
import {config} from '@/data/site';
import {supabaseConfigured} from '@/lib/supabase/config';

export default function robots():MetadataRoute.Robots{
  return {rules:{userAgent:'*',...(config.demo&&!supabaseConfigured?{disallow:'/'}:{allow:'/',disallow:'/admin/'})},sitemap:config.origin+'/sitemap.xml'};
}
