import 'server-only';
import {cache} from 'react';
import { createClient } from '@supabase/supabase-js';
import { properties as legacyProperties, type Property } from '@/data/properties';
import { supabaseConfigured, supabaseEnv } from '@/lib/supabase/config';
import type {DbImage,DbProperty,DbVideo} from './types';

function publicClient(){const {url,key}=supabaseEnv();return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})}
function regionSlug(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
async function mapProperty(row:DbProperty, images:DbImage[], client:ReturnType<typeof publicClient>,fullGallery=false,videos:DbVideo[]=[]):Promise<Property>{
  const ordered=[...images].sort((a,b)=>a.position-b.position);
  const selected=fullGallery?ordered:ordered.filter(i=>i.is_cover).slice(0,1);
  const signed=await Promise.all(selected.map(async image=>{
    const [{data:full,error:fullError},{data:thumb,error:thumbError}]=await Promise.all([
      client.storage.from('property-images').createSignedUrl(image.storage_path,3600),
      client.storage.from('property-images').createSignedUrl(image.thumbnail_path,3600)
    ]);
    if(fullError||thumbError||!full?.signedUrl||!thumb?.signedUrl) throw new Error('Falha ao assinar imagens do imóvel.');
    return {url:full.signedUrl,thumb:thumb.signedUrl,alt:image.alt_text};
  }));
  const coverIndex=ordered.findIndex(i=>i.is_cover);
  const cover=signed[fullGallery&&coverIndex>=0?coverIndex:0];
  const signedVideos=await Promise.all(videos.sort((a,b)=>a.position-b.position).map(async video=>{
    const {data,error}=await client.storage.from('property-videos').createSignedUrl(video.storage_path,86400);
    if(error||!data?.signedUrl)throw new Error('Falha ao carregar vídeos do imóvel.');
    return {url:data.signedUrl,contentType:video.content_type};
  }));
  return {id:row.id,slug:row.slug,title:{pt:row.title,en:row.title_en||row.title},purpose:row.purpose,
    propertyType:regionSlug(row.property_type),propertyTypeLabel:row.property_type,
    region:regionSlug(row.neighborhood),location:{pt:[row.neighborhood,row.city].filter(Boolean).join(' · '),en:[row.neighborhood,row.city].filter(Boolean).join(' · ')},
    showPrice:false,bedrooms:row.bedrooms||undefined,suites:row.suites||undefined,bathrooms:row.bathrooms||undefined,
    parkingSpaces:row.parking_spaces||undefined,builtArea:row.area||undefined,landArea:row.land_area||row.area||0,
    description:{pt:row.description,en:row.description_en||row.description},
    shortDescription:{pt:row.short_description||row.description.slice(0,160),en:row.short_description||row.description_en||row.description.slice(0,160)},
    amenities:{pt:row.features,en:row.features},images:signed.map(i=>i.url),imageThumbnails:signed.map(i=>i.thumb),videos:signedVideos,
    imageAltTexts:signed.map(i=>i.alt),coverImage:cover?.url||'/images/buzios.webp',coverThumbnail:cover?.thumb,
    featured:row.featured,status:'available',seoTitle:row.seo_title||undefined,seoDescription:row.seo_description||undefined};
}
export const getPublicProperties=cache(async function getPublicProperties():Promise<Property[]> {
  if(!supabaseConfigured) return legacyProperties;
  const client=publicClient();
  const {data:rows,error}=await client.from('published_properties').select('*').order('featured',{ascending:false}).order('published_at',{ascending:false});
  if(error) throw new Error(`Não foi possível carregar os imóveis: ${error.message}`);
  if(!rows?.length) return [];
  const ids=rows.map(p=>p.id);
  const {data:images,error:imageError}=await client.from('property_images').select('*').in('property_id',ids).order('position');
  if(imageError) throw new Error(`Não foi possível carregar as fotos: ${imageError.message}`);
  return Promise.all((rows as DbProperty[]).map(p=>mapProperty(p,(images||[]).filter(i=>i.property_id===p.id) as DbImage[],client)));
});
export const getPublicProperty=cache(async function getPublicProperty(slug:string):Promise<Property|undefined>{
  if(!supabaseConfigured)return legacyProperties.find(p=>p.slug===slug);
  const client=publicClient();
  const {data:row,error}=await client.from('published_properties').select('*').eq('slug',slug).maybeSingle();
  if(error)throw new Error(`Não foi possível carregar o imóvel: ${error.message}`);
  if(!row)return undefined;
  const {data:images,error:imageError}=await client.from('property_images').select('*').eq('property_id',row.id).order('position');
  if(imageError)throw new Error(`Não foi possível carregar as fotos: ${imageError.message}`);
  const {data:videos,error:videoError}=await client.from('property_videos').select('*').eq('property_id',row.id).order('position');
  if(videoError)throw new Error(`Não foi possível carregar os vídeos: ${videoError.message}`);
  return mapProperty(row as DbProperty,(images||[]) as DbImage[],client,true,(videos||[]) as DbVideo[]);
});
