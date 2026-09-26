import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {Header,Footer} from '@/components/site/chrome';
import {Home} from '@/components/site/home';
import {Catalog} from '@/components/site/catalog';
import {Details} from '@/components/site/details';
import {RealPropertyDetails} from '@/components/site/real-property-details';
import {About,ContactPage} from '@/components/site/pages';
import {config,Locale,regions,tr,route} from '@/data/site';
import {getPublicProperties,getPublicProperty} from '@/lib/properties/public';
import {supabaseConfigured} from '@/lib/supabase/config';

export const dynamic='force-dynamic';
function resolve(path:string[]=[]){const l:Locale=path[0]==='en'?'en':'pt';return {l,parts:path[0]==='en'||path[0]==='pt'?path.slice(1):path}}
export async function generateMetadata({params}:{params:Promise<{path?:string[]}>}):Promise<Metadata>{
  const {l,parts}=resolve((await params).path);
  const p=parts[0]==='imoveis'&&parts[1]?await getPublicProperty(parts[1]):undefined;
  const names:Record<string,string>={imoveis:tr(l,'Imóveis em Búzios','Properties in Búzios'),'sobre-yuri':tr(l,'Conheça Yuri','Meet Yuri'),'anuncie-seu-imovel':tr(l,'Anuncie seu imóvel','List your property'),contato:tr(l,'Contato','Contact'),regioes:regions.find(r=>r.slug===parts[1])?.name||'Búzios'};
  const title=p?.seoTitle||p?.title[l]||names[parts[0]]||tr(l,'Conectando pessoas a paraísos','Connecting people to paradise');
  const description=p?.seoDescription||p?.description[l]||tr(l,'Imóveis selecionados, atendimento pessoal e a experiência de viver em Búzios.','Selected properties, personal service and the experience of living in Búzios.');
  return {title:`${title} | Yuri Petrou`,description,alternates:{canonical:config.origin+route(l,parts.join('/')),languages:{'pt-BR':config.origin+route('pt',parts.join('/')),en:config.origin+route('en',parts.join('/'))}},openGraph:{title,description,images:p?.coverImage?[{url:p.coverImage.startsWith('http')?p.coverImage:config.origin+p.coverImage}]:undefined,type:'website',locale:l==='pt'?'pt_BR':'en_US'},robots:config.demo&&!supabaseConfigured?{index:false,follow:false}:{index:true,follow:true}};
}
export default async function Page({params}:{params:Promise<{path?:string[]}>}){
  const {l,parts}=resolve((await params).path);const path=parts.join('/');
  const needsProperties=!parts.length||(parts[0]==='imoveis'&&parts.length===1)||parts[0]==='regioes';
  const properties=needsProperties?await getPublicProperties():[];
  let content;
  if(!parts.length) content=<Home l={l} properties={properties}/>;
  else if(parts[0]==='imoveis'&&parts.length===1) content=<section className="section inner-page"><div className="page-intro"><p className="eyebrow">{tr(l,'O SEU LUGAR ESTÁ POR AQUI','YOUR PLACE IS SOMEWHERE HERE')}</p><h1>{tr(l,'Imóveis em Búzios','Properties in Búzios')}</h1><p>{tr(l,'Explore possibilidades para viver, investir ou ficar um pouco mais.','Explore possibilities to live, invest or stay a little longer.')}</p></div><Catalog l={l} properties={properties}/></section>;
  else if(parts[0]==='imoveis'&&parts.length===2){const p=await getPublicProperty(parts[1]);if(!p)notFound();content=p.status==='available'?<RealPropertyDetails p={p} l={l}/>:<Details p={p} l={l} related={await getPublicProperties()}/>;}
  else if(path==='sobre-yuri') content=<About l={l}/>;
  else if(path==='anuncie-seu-imovel') content=<ContactPage l={l} listing/>;
  else if(path==='contato') content=<ContactPage l={l}/>;
  else if(parts[0]==='regioes'&&parts.length===2){const r=regions.find(r=>r.slug===parts[1]);if(!r)notFound();content=<section className="section inner-page"><div className="page-intro"><p className="eyebrow">BÚZIOS, RIO DE JANEIRO</p><h1>{r.name}</h1><p>{tr(l,'Explore os imóveis nesta região.','Explore properties in this area.')}</p></div><Catalog l={l} properties={properties} initialRegion={r.slug}/></section>}
  else notFound();
  return <div lang={l==='pt'?'pt-BR':'en'}><a className="skip-link" href="#main">{tr(l,'Ir para o conteúdo','Skip to content')}</a><Header l={l} home={!parts.length} path={path}/><main id="main">{content}</main><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({'@context':'https://schema.org','@type':'WebSite',name:'Yuri Petrou',url:config.origin,inLanguage:['pt-BR','en']}).replace(/</g,'\\u003c')}}/><Footer l={l}/></div>;
}
