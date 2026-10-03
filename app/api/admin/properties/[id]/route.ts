import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
import {requireAdmin} from '@/lib/supabase/auth';
import {supabaseEnv} from '@/lib/supabase/config';
export async function DELETE(_request:NextRequest,{params}:{params:Promise<{id:string}>}){
  await requireAdmin();
  const {id}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))return NextResponse.json({error:'ID inválido.'},{status:400});
  const secret=process.env.SUPABASE_SECRET_KEY;
  if(!secret)return NextResponse.json({error:'Configure SUPABASE_SECRET_KEY no servidor.'},{status:503});
  const {url}=supabaseEnv();const service=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:images,error:imageError}=await service.from('property_images').select('storage_path,thumbnail_path').eq('property_id',id);
  if(imageError)return NextResponse.json({error:imageError.message},{status:500});
  const {data:videos,error:videoError}=await service.from('property_videos').select('storage_path').eq('property_id',id);
  if(videoError)return NextResponse.json({error:videoError.message},{status:500});
  const {error:deleteError}=await service.from('properties').delete().eq('id',id);
  if(deleteError)return NextResponse.json({error:deleteError.message},{status:500});
  const paths=(images||[]).flatMap(image=>[image.storage_path,image.thumbnail_path]);
  const videoPaths=(videos||[]).map(video=>video.storage_path);
  const [photoCleanup,videoCleanup]=await Promise.all([
    paths.length?service.storage.from('property-images').remove(paths):Promise.resolve({error:null}),
    videoPaths.length?service.storage.from('property-videos').remove(videoPaths):Promise.resolve({error:null})
  ]);
  if(photoCleanup.error||videoCleanup.error)return NextResponse.json({ok:true,warning:'Imóvel excluído, mas alguns arquivos órfãos exigem limpeza no Storage.'});
  return NextResponse.json({ok:true});
}
