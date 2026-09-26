import type {MetadataRoute} from 'next';
import {config,route} from '@/data/site';
import {getPublicProperties} from '@/lib/properties/public';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  const properties=await getPublicProperties();
  return (['pt','en'] as const).flatMap(l=>['','imoveis','sobre-yuri','anuncie-seu-imovel','contato',...properties.map(p=>'imoveis/'+p.slug)].map(p=>({url:config.origin+route(l,p)})));
}
