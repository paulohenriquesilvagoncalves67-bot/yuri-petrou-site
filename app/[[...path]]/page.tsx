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
const pageSeo:Record<string,{pt:[string,string];en:[string,string]}>= {
  '':{pt:['Imóveis à venda em Armação dos Búzios','Encontre casas selecionadas à venda em Armação dos Búzios. Conheça os imóveis e conte com o atendimento pessoal de Yuri Petrou.'],en:['Homes for sale in Búzios','Explore selected homes for sale in Armação dos Búzios, Brazil, with personal service from Yuri Petrou.']},
  imoveis:{pt:['Casas e imóveis à venda em Búzios','Explore casas e imóveis selecionados à venda em Armação dos Búzios. Veja fotos, características e detalhes de cada propriedade.'],en:['Homes and properties for sale in Búzios','Browse selected homes for sale in Armação dos Búzios, Brazil. View photos, features and property details.']},
  'sobre-yuri':{pt:['Sobre Yuri Petrou','Conheça Yuri Petrou e sua atuação no mercado imobiliário de Armação dos Búzios.'],en:['About Yuri Petrou','Learn about Yuri Petrou and his work in the Armação dos Búzios property market.']},
  'anuncie-seu-imovel':{pt:['Anuncie seu imóvel em Búzios','Apresente seu imóvel em Armação dos Búzios para avaliação e saiba como anunciá-lo com Yuri Petrou.'],en:['List your property in Búzios','Present your Armação dos Búzios property for review and learn how to list it with Yuri Petrou.']},
  contato:{pt:['Contato | Imóveis em Búzios','Entre em contato com Yuri Petrou para conversar sobre imóveis à venda em Armação dos Búzios.'],en:['Contact | Búzios properties','Contact Yuri Petrou to discuss homes for sale in Armação dos Búzios, Brazil.']},
};
export async function generateMetadata({params}:{params:Promise<{path?:string[]}>}):Promise<Metadata>{
  const {l,parts}=resolve((await params).path);
  const path=parts.join('/');
  const p=parts[0]==='imoveis'&&parts.length===2?await getPublicProperty(parts[1]):undefined;
  const region=parts[0]==='regioes'&&parts.length===2?regions.find(r=>r.slug===parts[1]):undefined;
  const staticSeo=pageSeo[path]?.[l];
  const title=p?(l==='pt'&&p.seoTitle?p.seoTitle:p.title[l]):region?tr(l,`Imóveis em ${region.name}, Búzios`,`Properties in ${region.name}, Búzios`):staticSeo?.[0]||'';
  const description=p?(l==='pt'&&p.seoDescription?p.seoDescription:p.shortDescription[l]):region?tr(l,`Conheça os imóveis disponíveis em ${region.name}, Armação dos Búzios.`,`Explore available properties in ${region.name}, Armação dos Búzios.`):staticSeo?.[1]||'';
  const fullTitle=title.toLowerCase().includes('yuri petrou')?title:`${title} | Yuri Petrou`;
  const canonical=config.origin+route(l,path);
  return {title:fullTitle,description,alternates:{canonical,languages:{'pt-BR':config.origin+route('pt',path),en:config.origin+route('en',path),'x-default':config.origin+route('pt',path)}},openGraph:{title:fullTitle,description,url:canonical,siteName:'Yuri Petrou',images:[{url:config.origin+config.hero,alt:'Armação dos Búzios'}],type:'website',locale:l==='pt'?'pt_BR':'en_US'},twitter:{card:'summary_large_image',title:fullTitle,description,images:[config.origin+config.hero]},robots:config.demo&&!supabaseConfigured?{index:false,follow:false}:{index:true,follow:true}};
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
