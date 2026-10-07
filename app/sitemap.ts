import type {MetadataRoute} from 'next';
import {config,route} from '@/data/site';
import {getPublicProperties} from '@/lib/properties/public';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const properties=await getPublicProperties();
  const paths=['','imoveis','sobre-yuri','anuncie-seu-imovel','contato',...properties.map(p=>'imoveis/'+p.slug)];
  return paths.flatMap(path=>(['pt','en'] as const).map(l=>({
    url:config.origin+route(l,path),
    alternates:{languages:{'pt-BR':config.origin+route('pt',path),en:config.origin+route('en',path)}},
  })));
}
