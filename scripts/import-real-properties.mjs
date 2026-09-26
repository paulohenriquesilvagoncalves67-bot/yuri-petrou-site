import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import ts from 'typescript';
import {createClient} from '@supabase/supabase-js';

const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret=process.env.SUPABASE_SECRET_KEY;
const owner=process.env.YURI_ADMIN_USER_ID;
if(!url||!secret||!owner)throw Error('Configure NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY e YURI_ADMIN_USER_ID no ambiente local.');
const client=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
async function loadProperty(file,exportName){const source=await readFile(resolve('data',file),'utf8');const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText;const loaded=await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);return loaded[exportName]}
const properties=[await loadProperty('real-property.ts','realProperty'),await loadProperty('condominium-property.ts','condominiumProperty')];
for(const property of properties){
  let {data:row,error:lookupError}=await client.from('properties').select('id,publication_status').eq('slug',property.slug).maybeSingle();
  if(lookupError)throw lookupError;
  if(!row){const payload={title:property.title.pt,title_en:property.title.en,slug:property.slug,description:property.description.pt,description_en:property.description.en,short_description:property.shortDescription.pt,property_type:property.propertyType==='house'?'Casa':'Terreno',purpose:property.purpose,neighborhood:'',city:'Armação dos Búzios',bedrooms:property.bedrooms||0,suites:property.suites||0,bathrooms:property.bathrooms||0,parking_spaces:property.parkingSpaces||0,area:property.builtArea||null,land_area:property.landArea||null,features:property.amenities.pt,created_by:owner,featured:property.featured,publication_status:'draft',property_status:'available',seo_title:property.seoTitle||null,seo_description:property.seoDescription||null};const result=await client.from('properties').insert(payload).select('id,publication_status').single();if(result.error)throw result.error;row=result.data}
  const {data:existing,error:imageLookupError}=await client.from('property_images').select('sha256').eq('property_id',row.id);if(imageLookupError)throw imageLookupError;
  const hashes=new Set(existing.map(i=>i.sha256));
  for(const [position,image] of property.images.entries()){
    const file=await readFile(resolve('public',image.slice(1)));
    const hash=createHash('sha256').update(file).digest('hex');
    if(hashes.has(hash))continue;
    const smallImage=image.replace(/\.webp$/,'-small.webp');
    const thumb=await readFile(resolve('public',smallImage.slice(1)));
    const storagePath=`${row.id}/${hash}.webp`,thumbnailPath=`${row.id}/${hash}-thumb.webp`;
    for(const [path,content] of [[storagePath,file],[thumbnailPath,thumb]]){const {error}=await client.storage.from('property-images').upload(path,content,{contentType:'image/webp',upsert:false});if(error&&error.message.toLowerCase().includes('already exists')===false)throw error}
    const {error}=await client.from('property_images').insert({property_id:row.id,storage_path:storagePath,thumbnail_path:thumbnailPath,sha256:hash,position,is_cover:image===property.coverImage,alt_text:`${property.title.pt} — foto ${position+1}`});if(error)throw error;
    hashes.add(hash);
  }
  if(row.publication_status!=='published'){const {error}=await client.from('properties').update({publication_status:'pending_review'}).eq('id',row.id);if(error)throw error}
  console.log(`${property.slug}: importado e aguardando aprovação no painel.`);
}
