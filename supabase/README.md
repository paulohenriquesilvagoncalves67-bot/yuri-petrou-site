# Yuri Petrou — ativação do Supabase

Projeto exclusivo criado para Yuri: `yuri-petrou` (`arjffszvxirqkhuycvqw`), na organização `backend Yuri Petrou`, região `sa-east-1`. O SQL inicial foi aplicado em 26/09/2026. Nunca reutilize o `lineup-interno`.

## Estado atual

- Cadastro público desativado em **Auth > Providers**. E-mail confirmado continua exigido.
- URL pública e redirects de definição de senha configurados para produção e localhost.
- Primeiro perfil `admin` (`paulohenriquesilvagoncalves67@gmail.com`) criado e aprovado. O próprio Paulo deve definir a senha pelo link enviado por e-mail.
- As duas propriedades reais e suas 38 fotos foram importadas e publicadas; os anúncios demonstrativos não foram importados.
- As três variáveis de ambiente abaixo foram configuradas no projeto Vercel `yuri-petrou`, apenas em Production. A chave secreta foi salva como Secret.

## Configuração e manutenção

1. Configure SMTP próprio antes de depender de convites em produção. Em projetos Free novos com o envio padrão, a personalização de modelos de e-mail não está disponível.
2. Se o domínio mudar, atualize **Auth > URL Configuration** e os Redirect URLs para `/admin/definir-senha`. O convite padrão do Supabase envia a sessão no fragmento da URL; a página de definição de senha a recebe no navegador.
3. [setup.sql](./setup.sql) **já foi aplicado** somente no projeto novo. Ele criou `profiles`, `properties`, `property_images`, `property_activity`, a projeção pública limitada `published_properties`, índices, triggers, RLS e o bucket privado `property-images`. Não execute novamente nem aplique sobre outro projeto.
4. Para criar outro administrador no futuro, use **Auth > Users** e promova o perfil criado pelo trigger, substituindo o UUID:

   ```sql
   update public.profiles set role='admin', approved=true
   where id='SEU-UUID-AQUI';
   ```

   Confirme que exatamente uma linha foi atualizada. O perfil é criado pelo trigger de `auth.users`.
5. Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`. A chave secreta **nunca** deve ter prefixo `NEXT_PUBLIC_` nem ser enviada ao Git.
6. No Vercel, as mesmas três variáveis já estão em Production. Configure também em Preview apenas se precisar testar prévias. O catálogo público lê exclusivamente o Supabase e novos imóveis aparecem sem deploy.
7. O script `node scripts/import-real-properties.mjs` foi usado para a importação inicial e pode ser repetido sem duplicar imagens. Ele não importa os dez anúncios demonstrativos. Os arquivos locais permanecem intactos.
8. Entre em `/admin/login`. Em `/admin/usuarios`, convide Yuri pelo e-mail. Após o convite e a definição de senha, aprove o perfil dele nessa tela. Ele entra em `/admin/imoveis`, sem acesso a revisão ou usuários.

## Ajuste temporário — 27/09/2026

Foi aplicada no projeto de produção a migração `allow_review_without_description_or_cover`: envio para revisão/publicação não exige mais descrição com 30 caracteres nem foto de capa. Continuam exigidos título (mínimo de 3 caracteres) e cidade (mínimo de 2), além das verificações de autenticação, aprovação, autoria e demais campos administrativos. A mesma regra está refletida em [setup.sql](./setup.sql) para referência; não reexecute o setup inicial.

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

O build, o catálogo público, as fotos, a página individual e o redirecionamento de rotas protegidas foram verificados em produção. O fluxo autenticado de criação e aprovação de um terceiro imóvel ainda depende de Paulo definir a senha e Yuri receber o convite; faça o teste acima antes do uso cotidiano.
