import type { Property } from './properties';

const image = (id: string) => `/images/residencia-buzios/residencia-buzios-${id}.webp`;

export const realProperty: Property = {
  id: 'residencia-buzios-202',
  slug: 'residencia-contemporanea-armacao-dos-buzios',
  title: {
    pt: 'Arquitetura para viver Búzios',
    en: 'Contemporary living in Búzios',
  },
  purpose: 'sale',
  propertyType: 'house',
  region: '',
  location: { pt: 'Armação dos Búzios', en: 'Armação dos Búzios' },
  price: 2790000,
  showPrice: true,
  bedrooms: 4,
  parkingSpaces: 3,
  builtArea: 202,
  landArea: 450,
  description: {
    pt: 'Uma casa para quem valoriza arquitetura, conforto e qualidade em cada detalhe.\n\nEm Armação dos Búzios, esta residência de alto padrão combina um projeto contemporâneo com materiais e acabamentos de primeira linha. São 202 m² de área construída em um terreno de 450 m², com ambientes amplos, iluminados e pensados para viver e receber bem.\n\nA sala com pé-direito duplo se integra à cozinha gourmet e à área de jantar. A cozinha conta com ilha em mármore, móveis planejados, eletrodomésticos modernos e sistema de som ambiente. Na área externa, piscina, jacuzzi, deck de madeira, jardim, churrasqueira a gás e até um muro de escalada criam um espaço de lazer completo.\n\nA casa oferece 4 quartos, incluindo uma suíte térrea e uma suíte master com varanda e banheiro com dois chuveiros. Conta ainda com energia solar, iluminação em LED e garagem para até 3 veículos.\n\nVenda porteira fechada.',
    en: 'A home for those who value architecture, comfort and quality in every detail.\n\nIn Armação dos Búzios, this high-end residence pairs contemporary design with premium materials and finishes. It offers 202 m² of built area on a 450 m² plot, with generous, light-filled spaces designed for living and entertaining.\n\nThe double-height living room connects to the gourmet kitchen and dining area. The kitchen features a marble island, custom cabinetry, modern appliances and an ambient sound system. Outside, a pool, jacuzzi, wooden deck, garden, gas barbecue and even a climbing wall create a complete leisure setting.\n\nThe house has four bedrooms, including a ground-floor suite and a primary suite with a balcony and a bathroom with two showers. It also includes solar power, LED lighting and parking for up to three cars.\n\nSold fully furnished and equipped.',
  },
  shortDescription: {
    pt: 'Projeto contemporâneo, lazer completo e venda porteira fechada.',
    en: 'Contemporary design, complete leisure area and fully furnished sale.',
  },
  amenities: {
    pt: [
      'Sala com pé-direito duplo', 'Cozinha gourmet integrada', 'Ilha em mármore',
      'Móveis planejados', 'Eletrodomésticos modernos', 'Som ambiente',
      'Piscina e jacuzzi', 'Deck de madeira e jardim', 'Churrasqueira a gás',
      'Muro de escalada', 'Suíte térrea', 'Suíte master com varanda',
      'Dois chuveiros na suíte master', 'Energia solar', 'Iluminação em LED',
      'Garagem para até 3 veículos',
    ],
    en: [
      'Double-height living room', 'Integrated gourmet kitchen', 'Marble island',
      'Custom cabinetry', 'Modern appliances', 'Ambient sound system',
      'Pool and jacuzzi', 'Wooden deck and garden', 'Gas barbecue',
      'Climbing wall', 'Ground-floor suite', 'Primary suite with balcony',
      'Two showers in the primary suite', 'Solar power', 'LED lighting',
      'Parking for up to 3 cars',
    ],
  },
  coverImage: image('9827'),
  images: [
    '9827', '9824', '9829', '9830', '9835', '9826', '9844',
    '9819', '9814', '9833', '9818', '9815', '9816', '9821',
    '9834', '9839', '9840', '9841', '9842',
  ].map(image),
  featured: true,
  status: 'available',
  seoTitle: 'Residência contemporânea à venda em Armação dos Búzios',
  seoDescription: 'Casa de alto padrão com 202 m² construídos, terreno de 450 m², 4 quartos, piscina, jacuzzi e venda porteira fechada por R$ 2.790.000.',
};
