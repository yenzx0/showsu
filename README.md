# ShowSu Delícias — Vue + Vite

Site responsivo da ShowSu com cardápio público e painel administrativo online.

## Rodar o projeto

Requisitos: Node.js 22.12 ou superior.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
```

Os arquivos prontos serão criados na pasta `dist`.

## Como o painel funciona

- Site público: `/`
- Painel administrativo: `/admin`
- Vercel: hospeda o site e executa o build do Vue.
- Supabase: guarda usuários, produtos, categorias e fotos.
- GitHub: guarda somente o código e o histórico de desenvolvimento.

Produtos, categorias e fotos são atualizados diretamente no painel. Essas alterações
não exigem commit nem pull request.

Se o Supabase ainda não estiver configurado, o site continua mostrando o catálogo
original de `src/data/products.js`, mas o painel fica bloqueado para edições.

## Configurar o Supabase

1. Crie um projeto em <https://supabase.com/dashboard>.
2. Abra **SQL Editor**, copie todo o arquivo `supabase/schema.sql` e execute.
3. Abra **Authentication > Users** e crie o usuário administrativo com e-mail e senha.
4. No SQL Editor, execute o comando indicado no final de `supabase/schema.sql`,
   substituindo o e-mail de exemplo pelo e-mail do usuário criado.
5. Em **Project Settings > API**, copie:
   - Project URL;
   - Publishable key (ou a chave `anon` em projetos antigos).
6. Crie um arquivo `.env` local usando `.env.example` como modelo:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publicavel
```

Não coloque no site a chave `service_role`, senha do banco ou qualquer chave secreta.

## Configurar a Vercel

O arquivo `vercel.json` já define:

- comando de build: `npm run build`;
- pasta publicada: `dist`;
- redirecionamento necessário para abrir `/admin` diretamente.

No projeto da Vercel, abra **Settings > Environment Variables** e adicione:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

Depois faça um novo deploy. A Vercel incorporará essas duas configurações públicas
ao build do Vue.

## Segurança

As tabelas e as fotos usam Row Level Security:

- visitantes podem consultar o catálogo;
- visitantes não podem cadastrar, editar ou excluir;
- usuários autenticados só podem editar quando também estiverem cadastrados em
  `public.admin_users`;
- criação pública de conta não faz parte do site.

A chave publicável pode aparecer no navegador. A proteção real é feita pelas políticas
do banco. A chave `service_role` nunca deve ser usada no frontend.

## Interface

- Nuxt UI fornece os controles acessíveis do login.
- Motion for Vue aplica movimentos leves e respeita a preferência do usuário por
  animações reduzidas.
- O restante da identidade visual continua em CSS próprio, preservando a paleta ShowSu.

## Onde editar

- `src/data/products.js`: catálogo de segurança exibido sem conexão.
- `src/data/site.js`: telefones, WhatsApp, Instagram e navegação.
- `src/components`: partes visuais do site e painel.
- `src/composables/useCatalog.js`: leitura e edição do catálogo online.
- `src/services/supabase.js`: conexão oficial com Supabase.
- `src/assets/styles/global.css`: paleta, tipografia e responsividade.
- `public/images`: imagens originais do site.
- `supabase/schema.sql`: banco, permissões e catálogo inicial.

## Preparação para IA

O arquivo `src/services/orderAssistant.js` funciona como camada inicial de integração.
Uma futura IA poderá consultar o catálogo do Supabase, recomendar quantidades e preparar
mensagens de pedido. Chaves privadas de IA deverão ficar em uma função de servidor, nunca
no navegador.
