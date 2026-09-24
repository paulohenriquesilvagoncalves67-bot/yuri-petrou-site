'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { Property } from '@/data/properties';
import { type Locale, route, tr } from '@/data/site';
import { priceText } from '@/data/properties';
import { SiteArrow } from './site-arrow';
import { track } from './links';

export function RealPropertyDetails({ p, l }: { p: Property; l: Locale }) {
  const [index, setIndex] = useState(0);
  const count = p.images.length;
  const location = p.location?.[l] || 'Armação dos Búzios';

  useEffect(() => {
    track('view_property', { property: p.id, purpose: p.purpose });
  }, [p.id, p.purpose]);

  const changeImage = (next: number) => setIndex((next + count) % count);

  return (
    <article className="real-listing">
      <div className="real-listing-inner">
        <a className="real-back" href={route(l, 'imoveis')}>
          <SiteArrow direction="left" />{tr(l, 'Voltar para imóveis', 'Back to properties')}
        </a>
        <div className="real-intro">
          <div>
            <p className="eyebrow">{tr(l, 'RESIDÊNCIA À VENDA', 'HOME FOR SALE')} · {location.toUpperCase()}</p>
            <h1>{p.title[l]}</h1>
            <p className="real-intro-copy">{p.shortDescription[l]}</p>
          </div>
          <div className="real-intro-price">
            <span>{tr(l, 'VENDA PORTEIRA FECHADA', 'FULLY FURNISHED SALE')}</span>
            <strong>{priceText(p, l)}</strong>
          </div>
        </div>
      </div>

      <div className={`real-gallery ${p.galleryLayout === 'mixed' && !p.images[index].includes('-vertical.') ? 'real-gallery--landscape' : ''}`} aria-label={tr(l, 'Fotos da residência', 'Photos of the home')}>
        <div className="real-gallery-stage">
          <Image
            key={p.images[index]}
            src={p.images[index]}
            alt={`${p.title[l]} — ${tr(l, 'foto', 'photo')} ${index + 1} ${tr(l, 'de', 'of')} ${count}`}
            fill
            sizes="(max-width: 760px) 100vw, 85vw"
            className="real-gallery-main"
            priority={index === 0}
          />
          <div className="real-gallery-controls">
            <button type="button" onClick={() => changeImage(index - 1)} aria-label={tr(l, 'Foto anterior', 'Previous photo')}>
              <SiteArrow direction="left" />
            </button>
            <span aria-live="polite">{String(index + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
            <button type="button" onClick={() => changeImage(index + 1)} aria-label={tr(l, 'Próxima foto', 'Next photo')}>
              <SiteArrow />
            </button>
          </div>
        </div>
        <div className="real-gallery-thumbs" aria-label={tr(l, 'Escolher foto', 'Choose photo')}>
          {p.images.map((src, photoIndex) => (
            <button
              type="button"
              key={src}
              className={photoIndex === index ? 'is-active' : ''}
              onClick={() => changeImage(photoIndex)}
              aria-label={`${tr(l, 'Ver foto', 'View photo')} ${photoIndex + 1}`}
              aria-current={photoIndex === index ? 'true' : undefined}
            >
              <Image src={src.replace('.webp', '-small.webp')} alt="" fill sizes="96px" />
            </button>
          ))}
        </div>
      </div>

      <div className="real-listing-inner real-content">
        <div>
          <p className="eyebrow">{tr(l, 'OS DETALHES', 'THE DETAILS')}</p>
          <h2>{tr(l, 'Projetada para viver bem.', 'Designed for living well.')}</h2>
          <div className="real-description">
            {p.description[l].split('\n\n').map(paragraph => <p key={paragraph}>{paragraph}</p>)}
          </div>
          <h3>{tr(l, 'O que a casa oferece', 'What this home offers')}</h3>
          <ul className="real-amenities">{p.amenities[l].map(item => <li key={item}>{item}</li>)}</ul>
        </div>
        <aside className="real-facts">
          <p className="eyebrow">{tr(l, 'EM NÚMEROS', 'AT A GLANCE')}</p>
          {p.builtArea && <div><strong>{p.builtArea} m²</strong><span>{tr(l, 'área construída', 'built area')}</span></div>}
          <div><strong>{p.landArea} m²</strong><span>{tr(l, 'terreno', 'plot')}</span></div>
          {p.bedrooms && <div><strong>{String(p.bedrooms).padStart(2, '0')}</strong><span>{tr(l, 'quartos', 'bedrooms')}</span></div>}
          {p.suites && <div><strong>{String(p.suites).padStart(2, '0')}</strong><span>{tr(l, 'suítes', 'suites')}</span></div>}
          {p.parkingSpaces && <div><strong>{String(p.parkingSpaces).padStart(2, '0')}</strong><span>{tr(l, 'vagas', 'parking spaces')}</span></div>}
          <div className="real-facts-cta">
            <span>{tr(l, 'VENDA PORTEIRA FECHADA', 'FULLY FURNISHED SALE')}</span>
            <strong>{priceText(p, l)}</strong>
            <a className="button" href={route(l, 'contato')}>
              {tr(l, 'Conhecer esta casa', 'Enquire about this home')}<SiteArrow />
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
