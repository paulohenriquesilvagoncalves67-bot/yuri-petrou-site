import { Locale, tr } from './site';
export type Property = {
  id: string;
  slug: string;
  title: { pt: string; en: string };
  purpose: 'sale' | 'rent' | 'holiday';
  propertyType: string;
  propertyTypeLabel?: string;
  region: string;
  location?: { pt: string; en: string };
  address?: string;
  price?: number;
  showPrice: boolean;
  bedrooms?: number;
  suites?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  builtArea?: number;
  landArea: number;
  description: { pt: string; en: string };
  shortDescription: { pt: string; en: string };
  amenities: { pt: string[]; en: string[] };
  images: string[];
  imageThumbnails?: string[];
  imageAltTexts?: string[];
  videos?: { url: string; contentType: string }[];
  coverImage: string;
  coverThumbnail?: string;
  featured: boolean;
  airbnbUrl?: string;
  whatsappMessage?: string;
  status: 'demo' | 'available' | 'unavailable';
  seoTitle?: string;
  seoDescription?: string;
  galleryLayout?: 'portrait' | 'mixed';
};

export function priceText(p:Property,l:Locale){return p.showPrice&&p.price?new Intl.NumberFormat(l==='pt'?'pt-BR':'en-US',{style:'currency',currency:'BRL',maximumFractionDigits:0}).format(p.price)+(p.purpose==='holiday'?tr(l,' / noite',' / night'):p.purpose==='rent'?tr(l,' / mês',' / month'):''):tr(l,'Sob consulta','Price on request')}
