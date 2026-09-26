# Yuri Petrou — ativação do Supabase

Projeto exclusivo criado para Yuri: `yuri-petrou` (`arjffszvxirqkhuycvqw`), na organização `backend Yuri Petrou`, região `sa-east-1`. O SQL inicial foi aplicado em 26/09/2026. Nunca reutilize o `lineup-interno`.

## Ativar

1. Em **Auth > Providers > Email**, desative cadastro público (Allow new users to sign up). Configure SMTP próprio antes de depender de convites em produção. Em projetos Free novos com o envio padrão, a personalização de modelos de e-mail não está disponível.
2. Em **Auth > URL Configuration**, informe a URL pública do site e adicione `https://SEU-DOMINIO/admin/definir-senha` aos Redirect URLs (também a URL local se for testar localmente). O convite padrão do Supabase envia a sessão no fragmento da URL; a página de definição de senha agora a recebe no navegador. Se configurar SMTP próprio e personalizar o modelo, também é possível enviar `token_hash` para essa mesma página.
3. [setup.sql](./setup.sql) **já foi aplicado** somente no projeto novo. Ele criou `profiles`, `properties`, `property_images`, `property_activity`, a visão pública limitada `published_properties`, índices, triggers, RLS e o bucket privado `property-images`. Não execute novamente nem aplique sobre outro projeto.
4. Em **Auth > Users**, crie seu usuário admin pelo e-mail. Copie o UUID gerado. Execute no SQL Editor, substituindo o UUID:

   ```sql
   update public.profiles set role='admin', approved=true
   where id='SEU-UUID-AQUI';
   ```

   Confirme que exatamente uma linha foi atualizada. O perfil é criado pelo trigger de `auth.users`.
5. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`. A chave secreta **nunca** deve ter prefixo `NEXT_PUBLIC_` nem ser enviada ao Git.
6. No Vercel, crie as mesmas três variáveis para Production (e Preview, se necessário) e faça um novo deploy. O site continua funcionando com o catálogo legado somente enquanto as variáveis públicas não forem configuradas. Assim que forem, ele passa a ler exclusivamente o Supabase. Imóveis novos aparecem sem deploy.
7. Opcional: para importar as **duas propriedades reais** do código, configure `YURI_ADMIN_USER_ID` apenas no ambiente local e execute `node scripts/import-real-properties.mjs` na raiz. O script não importa os dez anúncios demonstrativos. Ele cria imóveis em revisão; abra `/admin/revisao`, confira e publique individualmente. Os arquivos locais permanecem intactos.
8. Entre em `/admin/login`. Em `/admin/usuarios`, convide Yuri pelo e-mail. Após o convite e a definição de senha, aprove o perfil dele nessa tela. Ele entra em `/admin/imoveis`, sem acesso a revisão ou usuários.

## Variáveis

| Nome | Onde | Função |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | local e Vercel | URL do projeto Yuri |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | local e Vercel | chave pública, protegida por RLS |
| `SUPABASE_SECRET_KEY` | servidor local e Vercel | convite administrativo; jamais frontend |
| `YURI_ADMIN_USER_ID` | somente importação local | UUID do primeiro admin |

## Testar o fluxo depois da conexão

1. Admin convida Yuri e aprova seu perfil. Yuri faz login e cria um rascunho pelo celular.
2. Yuri salva, sobe várias fotos, escolhe capa, ordena e envia para aprovação. Confirme que o imóvel ainda não aparece no site.
3. Admin vê o imóvel em `/admin/revisao`, pode editar SEO e textos, rejeitar com observação ou publicar. Confirme que a URL `/imoveis/SLUG` e o catálogo público mostram apenas o publicado/disponível, sem preço.
4. Yuri marca o imóvel como inativo/vendido/alugado; confirme sua retirada da Home, busca e sitemap. Admin restaura a situação para disponível.
5. Tente, com o usuário colaborador, mudar `role`, `approved`, `featured` ou `publication_status` para `published` diretamente pela API. As políticas e triggers devem negar a alteração. Teste também edição de outro imóvel e upload em ID alheio.

Sem o projeto Supabase e credenciais reais, login, upload, e políticas não podem ser validados ponta a ponta aqui. Revise o SQL em ambiente de desenvolvimento antes de ativar produção.
