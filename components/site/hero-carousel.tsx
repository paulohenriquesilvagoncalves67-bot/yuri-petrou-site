'use client';

import { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';

import { type Locale, route, tr } from '@/data/site';
import { WhatsAppButton } from '@/components/site/links';

const scenes = [
  {
    image: '/images/buzios.webp',
    alt: ['Mar e paisagem de Búzios', 'Sea and coastline of Búzios'],
    title: ['Conectando pessoas', 'Connecting people'],
    end: ['a paraísos.', 'to paradise.'],
    copy: [
      'Imóveis selecionados para viver, investir ou encontrar seu lugar em Búzios.',
      'Selected properties to live, invest or find your place in Búzios.',
    ],
    destination: 'imoveis',
    action: ['Explorar imóveis', 'Explore properties'],
  },
  {
    // Photo credit: Unsplash / scene supplied in the approved creative brief.
    image:
      'https://images.unsplash.com/photo-1576721804094-1dbcdb671711?auto=format&fit=crop&w=2400&q=85',
    alt: [
      'Vista elevada do mar e de uma ilha em Búzios',
      'An elevated view of the sea and an island in Búzios',
    ],
    title: ['Um lugar para', 'A place to'],
    end: ['chamar de seu.', 'call your own.'],
    copy: [
      'Entre o mar e a natureza, descubra as possibilidades do seu próximo endereço.',
      'Between the sea and nature, discover the possibilities of your next address.',
    ],
    destination: 'imoveis?finalidade=sale',
    action: ['Encontre seu imóvel', 'Find your property'],
  },
  {
    // Photo credit: Unsplash / scene supplied in the approved creative brief.
    image:
      'https://images.unsplash.com/photo-1508272961731-dc692d634a79?auto=format&fit=crop&w=2400&q=85',
    alt: [
      'Barcos ao pôr do sol em Armação dos Búzios',
      'Boats at sunset in Armação dos Búzios',
    ],
    title: ['Alguns dias aqui', 'A few days here'],
    end: ['mudam o ritmo.', 'change the pace.'],
    copy: [
      'Mais tempo perto do mar. Mais espaço para os momentos que importam.',
      'More time by the sea. More room for the moments that matter.',
    ],
    destination: 'imoveis?finalidade=holiday',
    action: ['Explorar temporada', 'Explore holiday rentals'],
  },
];

export function HeroCarousel({ l }: { l: Locale }) {
  const [viewport, api] = useEmblaCarousel({
    loop: true,
    duration: 45,
    breakpoints: {
      '(prefers-reduced-motion: reduce)': { duration: 0 },
    },
  });
  const [active, setActive] = useState(0);
  const language = l === 'en' ? 1 : 0;
  const scene = scenes[active];

  useEffect(() => {
    if (!api) return;
    const update = () => setActive(api.selectedScrollSnap());
    update();
    api.on('select', update);
    api.on('reInit', update);
    return () => {
      api.off('select', update);
      api.off('reInit', update);
    };
  }, [api]);

  useEffect(() => {
    const section = document.getElementById('selecionados');
    if (
      !section ||
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) return;
    section.classList.add('yp-reveal-pending');
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.remove('yp-reveal-pending');
          observer.disconnect();
        }
      },
      { threshold: 0.05 },
    );
    observer.observe(section);
    return () => {
      observer.disconnect();
      section.classList.remove('yp-reveal-pending');
    };
  }, []);

  return (
    <section
      className="yp-hero"
      aria-label={tr(l, 'Paisagens de Búzios', 'Búzios landscapes')}
      aria-roledescription={tr(l, 'carrossel', 'carousel')}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'ArrowRight') {
          event.preventDefault();
          api?.scrollNext();
        }
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          api?.scrollPrev();
        }
      }}
    >
      <div className="yp-viewport" ref={viewport}>
        <div className="yp-track">
          {scenes.map((item, index) => (
            <div
              className={`yp-slide ${active === index ? 'is-active' : ''}`}
              key={item.image}
              aria-hidden={active !== index}
            >
              <img
                className="yp-photo"
                src={item.image}
                srcSet={index === 0 ? '/images/buzios-small.webp 800w, /images/buzios.webp 2400w' : `${item.image.replace('w=2400', 'w=900')} 900w, ${item.image} 2400w`}
                sizes="100vw"
                alt={item.alt[language]}
                fetchPriority={index === 0 ? 'high' : 'low'}
                decoding="async"
                draggable={false}
                onError={(event) => {
                  const image = event.currentTarget;
                  if (!image.dataset.fallback) {
                    image.dataset.fallback = 'true';
                    image.removeAttribute('srcset');
                    image.src = '/images/buzios.webp';
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="yp-shade" aria-hidden="true" />
      <div className="yp-content">
        <div className="yp-copy" key={active}>
          <p className="yp-eyebrow">BÚZIOS, RIO DE JANEIRO</p>
          <h1>{scene.title[language]}<br /><em>{scene.end[language]}</em></h1>
          <p className="yp-description">{scene.copy[language]}</p>
        </div>
        <div className="yp-actions">
          <a className="button light" href={route(l, scene.destination)}>{scene.action[language]}<ArrowUpRight size={18} /></a>
          <WhatsAppButton l={l} className="hero-link" />
        </div>
      </div>
      <div className="yp-bottom">
        <a className="yp-discover" href="#selecionados"><ArrowDown size={18} />{tr(l, 'Descubra seu próximo capítulo', 'Discover your next chapter')}</a>
        <div className="yp-navigation">
          <span className="yp-place">Armação dos Búzios · RJ</span>
          <div className="yp-controls">
            <button type="button" onClick={() => api?.scrollPrev()} aria-label={tr(l, 'Foto anterior', 'Previous photo')}><ArrowLeft size={20} /></button>
            <span className="yp-counter" aria-live="polite" aria-atomic="true">{String(active + 1).padStart(2, '0')} / 03</span>
            <div className="yp-progress" aria-hidden="true"><span style={{ transform: `translateX(${active * 100}%)` }} /></div>
            <button type="button" onClick={() => api?.scrollNext()} aria-label={tr(l, 'Próxima foto', 'Next photo')}><ArrowRight size={20} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
