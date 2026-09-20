# Yuri Petrou — Búzios

Site editorial imobiliário responsivo com Home, catálogo filtrável, páginas individuais, Sobre, captação, Contato, páginas de regiões e inglês em /en.

## Atualização de conteúdo
- `data/site.ts`: contatos oficiais, endereço, fotografia do corretor, idiomas, URLs e IDs de medição. Campos desconhecidos ficam vazios: nenhum telefone ou perfil foi inventado.
- `data/properties.ts`: cadastro central. Dez registros são fictícios e estão marcados como demonstração. Substituir títulos, textos, imagens e características. O preço só aparece quando showPrice é true.
- `data/image-sources.json`: procedência e licença das imagens ilustrativas.
- `components/site/`: componentes compartilhados e conteúdo editorial PT/EN. `tr` seleciona idioma sem duplicação de páginas; `words` centraliza a terminologia.
- `app/globals.css`: tokens e regras responsivas.

## Antes de uso comercial
1. Substituir o catálogo e fotos ilustrativas por imóveis autorizados; definir status e preços.
2. Informar WhatsApp (DDI e DDD), Instagram e endereço oficiais.
3. Inserir foto, biografia e logomarca oficiais.
4. Substituir o link Airbnb demonstrativo por anúncio real. O exemplo aponta expressamente para a home do Airbnb.
5. Revisar traduções, condições e contatos. Definir política de privacidade e consentimento antes de ativar medição.
6. Remover avisos de demonstração e definir config.demo=false para habilitar indexação. A demonstração contém noindex e robots disallow.

## Formulários e eventos
Os formulários usam validação HTML e compõem mensagem para WhatsApp. Não armazenam nem enviam leads no servidor. Sem telefone configurado, apresentam aviso explícito de que nada foi enviado. Abertura do WhatsApp não equivale a mensagem efetivamente enviada.

Eventos: view_property, click_whatsapp, click_airbnb, search_property, filter_property, submit_property e contact. Metadados comerciais registram imóvel, finalidade, origem, data e CTA; os eventos não incluem nome/telefone do formulário. GA4 permanece inativo sem ID e consentimento. Campo de Meta Pixel reservado, sem script ativo.

O catálogo oferece WebMCP filter_properties quando o navegador suporta document.modelContext, com validação e cancelamento de registro. CRM não foi implementado; dados de formulário são estruturados para integração posterior.

## Arquitetura
React / Vinext / TypeScript; rota compartilhada com metadata individual, URLs amigáveis e 404. Dados podem crescer sem alterar os componentes. Galeria com navegação circular; filtragem local adequada para o catálogo previsto (~100 registros). Imagens WebP em dois tamanhos. Sem mapas, chatbot ou CRM.
