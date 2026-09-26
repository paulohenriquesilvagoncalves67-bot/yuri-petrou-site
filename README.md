# Yuri Petrou — Búzios

Site editorial imobiliário responsivo com Home, catálogo filtrável, páginas individuais, Sobre, captação, Contato, páginas de regiões e inglês em /en. O gerenciamento dos imóveis foi preparado para Supabase. Consulte [supabase/README.md](./supabase/README.md) para ativar o banco exclusivo do Yuri, criar admin, convidar o colaborador e migrar os dois imóveis reais.

## Atualização de conteúdo
- `data/site.ts`: contatos oficiais, endereço, fotografia do corretor, idiomas, URLs e IDs de medição. Campos desconhecidos ficam vazios: nenhum telefone ou perfil foi inventado.
- `data/properties.ts`: fallback legado enquanto o Supabase não estiver configurado. Dez registros são fictícios e estão marcados como demonstração; dois imóveis reais podem ser importados pelo script. Preços não são exibidos no site.
- `data/image-sources.json`: procedência e licença das imagens ilustrativas.
- `components/site/`: componentes compartilhados e conteúdo editorial PT/EN. `tr` seleciona idioma sem duplicação de páginas; `words` centraliza a terminologia.
- `app/globals.css`: tokens e regras responsivas.

## Antes de uso comercial
1. Criar o projeto Supabase, importar os dois imóveis reais e publicar somente imóveis autorizados. Anúncios fictícios não são importados.
2. Informar WhatsApp (DDI e DDD), Instagram e endereço oficiais.
3. Inserir foto, biografia e logomarca oficiais.
4. Substituir o link Airbnb demonstrativo por anúncio real. O exemplo aponta expressamente para a home do Airbnb.
5. Revisar traduções, condições e contatos. Definir política de privacidade e consentimento antes de ativar medição.
6. Conectar o Supabase após aplicar o SQL. Sem credenciais, a demonstração continua com noindex e robots disallow; com Supabase, a indexação pública é habilitada e `/admin` é bloqueado no robots.

## Formulários e eventos
Os formulários usam validação HTML e compõem mensagem para WhatsApp. Não armazenam nem enviam leads no servidor. Sem telefone configurado, apresentam aviso explícito de que nada foi enviado. Abertura do WhatsApp não equivale a mensagem efetivamente enviada.

Eventos: view_property, click_whatsapp, click_airbnb, search_property, filter_property, submit_property e contact. Metadados comerciais registram imóvel, finalidade, origem, data e CTA; os eventos não incluem nome/telefone do formulário. GA4 permanece inativo sem ID e consentimento. Campo de Meta Pixel reservado, sem script ativo.

O catálogo oferece WebMCP filter_properties quando o navegador suporta document.modelContext, com validação e cancelamento de registro. CRM não foi implementado; dados de formulário são estruturados para integração posterior.

## Arquitetura
Next.js App Router / TypeScript; rota compartilhada dinâmica com metadata individual, URLs amigáveis e 404. Quando conectado, o Supabase alimenta Home, catálogo, filtros e detalhes sem novo deploy. Galeria com navegação circular; imagens WebP em dois tamanhos. Sem mapas, chatbot ou CRM.
