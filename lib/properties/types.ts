export type PublicationStatus='draft'|'pending_review'|'published'|'rejected';
export type PropertyStatus='available'|'inactive'|'sold'|'rented';
export type Purpose='sale'|'rent'|'holiday';
export interface DbProperty {
 id:string; title:string; title_en:string; slug:string; description:string; description_en:string; short_description:string;
 property_type:string; purpose:Purpose; neighborhood:string; city:string; bedrooms:number; suites:number; bathrooms:number;
 parking_spaces:number; area:number|null; land_area:number|null; features:string[]; publication_status:PublicationStatus;
 property_status:PropertyStatus; featured:boolean; seo_title:string|null; seo_description:string|null; review_note:string|null;
 created_by:string; created_at:string; updated_at:string; published_at:string|null;
}
export interface DbImage { id:string; property_id:string; storage_path:string; thumbnail_path:string; position:number; is_cover:boolean; alt_text:string; sha256:string; created_at:string }
export interface DbVideo { id:string; property_id:string; storage_path:string; content_type:string; byte_size:number; position:number; sha256:string; created_at:string }
export interface Profile {id:string;email:string;name:string;role:'admin'|'contributor';approved:boolean}
