-- Execute este arquivo no SQL Editor de um projeto Supabase novo.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id text primary key,
  label text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  name text not null,
  category_id text not null references public.categories(id) on delete restrict,
  description text not null,
  image_url text not null,
  image_path text,
  image_alt text not null,
  featured boolean not null default false,
  seasonal boolean not null default false,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create or replace function public.is_catalog_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_catalog_admin() from public;
grant execute on function public.is_catalog_admin() to anon, authenticated;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products to anon, authenticated;
grant insert, update, delete on public.categories, public.products to authenticated;

alter table public.admin_users enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;

drop policy if exists "Categorias visíveis para todos" on public.categories;
create policy "Categorias visíveis para todos"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "Administradores criam categorias" on public.categories;
create policy "Administradores criam categorias"
on public.categories for insert
to authenticated
with check ((select public.is_catalog_admin()));

drop policy if exists "Administradores atualizam categorias" on public.categories;
create policy "Administradores atualizam categorias"
on public.categories for update
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

drop policy if exists "Administradores excluem categorias" on public.categories;
create policy "Administradores excluem categorias"
on public.categories for delete
to authenticated
using ((select public.is_catalog_admin()));

drop policy if exists "Produtos ativos visíveis para todos" on public.products;
create policy "Produtos ativos visíveis para todos"
on public.products for select
to anon, authenticated
using (active = true or (select public.is_catalog_admin()));

drop policy if exists "Administradores criam produtos" on public.products;
create policy "Administradores criam produtos"
on public.products for insert
to authenticated
with check ((select public.is_catalog_admin()));

drop policy if exists "Administradores atualizam produtos" on public.products;
create policy "Administradores atualizam produtos"
on public.products for update
to authenticated
using ((select public.is_catalog_admin()))
with check ((select public.is_catalog_admin()));

drop policy if exists "Administradores excluem produtos" on public.products;
create policy "Administradores excluem produtos"
on public.products for delete
to authenticated
using ((select public.is_catalog_admin()));

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catalog-images',
  'catalog-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Imagens do catálogo visíveis para todos" on storage.objects;
create policy "Imagens do catálogo visíveis para todos"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'catalog-images');

drop policy if exists "Administradores enviam imagens" on storage.objects;
create policy "Administradores enviam imagens"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'catalog-images'
  and (select public.is_catalog_admin())
);

drop policy if exists "Administradores atualizam imagens" on storage.objects;
create policy "Administradores atualizam imagens"
on storage.objects for update
to authenticated
using (
  bucket_id = 'catalog-images'
  and (select public.is_catalog_admin())
)
with check (
  bucket_id = 'catalog-images'
  and (select public.is_catalog_admin())
);

drop policy if exists "Administradores excluem imagens" on storage.objects;
create policy "Administradores excluem imagens"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'catalog-images'
  and (select public.is_catalog_admin())
);

insert into public.categories (id, label, sort_order)
values
  ('salgados', 'Salgados e refeições', 0),
  ('doces', 'Doces', 1),
  ('kits', 'Kits', 2),
  ('marmitas-fit', 'Marmitas Fit', 3)
on conflict (id) do nothing;

insert into public.products (
  id,
  name,
  category_id,
  description,
  image_url,
  image_alt,
  featured,
  seasonal,
  active,
  sort_order
)
values
  ('1', 'Salgados', 'salgados', 'Coxinha, bolinho de carne, bolinho de queijo, risoles, calabresa com queijo, brócolis com queijo, salsichinha, croquete de carne e quibe.', '/images/cardapio/salgados.jpg', 'Bandeja de salgados variados', true, false, true, 0),
  ('2', 'Ceia', 'salgados', 'Preparamos sua ceia de Natal e Ano-Novo, incluindo sobremesas. Faça sua cotação conosco.', '/images/cardapio/ceia.jpg', 'Ceia especial de Natal e Ano-Novo', false, true, true, 1),
  ('3', 'Marmitinhas', 'marmitas-fit', 'Mais sabor, leveza e praticidade no seu dia a dia. Produção sob encomenda — solicite nosso cardápio.', '/images/cardapio/marmitinhas.jpg', 'Marmitinhas de comida caseira', true, false, true, 2),
  ('4', 'Sanduíche natural', 'salgados', 'Opções fresquinhas nos sabores frango ou atum.', '/images/cardapio/sanduiche-natural.jpg', 'Sanduíche natural recheado', false, false, true, 3),
  ('5', 'Panquecas', 'salgados', 'Frango com requeijão cremoso, carne, pizza, brócolis com queijo, escarola com queijo ou palmito.', '/images/cardapio/panquecas.jpg', 'Panquecas recheadas e gratinadas', false, false, true, 4),
  ('6', 'Torta', 'salgados', 'Massa deliciosa com frango e requeijão, carne, brócolis com queijo, queijo e presunto ou atum.', '/images/cardapio/torta.jpg', 'Torta salgada dourada', false, false, true, 5),
  ('7', 'Bolo de aniversário', 'doces', 'Vários sabores para celebrar sua data comemorativa, reunião ou aniversário.', '/images/cardapio/bolo-aniversario.jpg', 'Bolo decorado de aniversário', true, false, true, 6),
  ('8', 'Bolo vulcão', 'doces', 'Massa macia e cobertura generosa: brigadeiro, brigadeiro branco, ninho, prestígio, mousse de limão, mousse de maracujá ou creme com abacaxi.', '/images/cardapio/bolo-vulcao.jpg', 'Bolo vulcão com bastante cobertura', false, false, true, 7),
  ('9', 'Bolo piscininha', 'doces', 'Sabores brigadeiro, brigadeiro branco, ninho, mousse de limão, mousse de maracujá ou prestígio.', '/images/cardapio/bolo-piscininha.jpg', 'Bolo piscininha recheado', false, false, true, 8),
  ('10', 'Kit casal', 'kits', 'Delícias feitas especialmente para o seu amor: bolo coração, torta, brigadeiros e refrigerante ou suco.', '/images/cardapio/kit-casal.jpg', 'Mini kit de festa para casal', false, false, true, 9),
  ('11', 'Festa na caixa', 'kits', 'Uma caixa especial, cheia de gostosuras e delícias para comemorar.', '/images/cardapio/festa-na-caixa.jpg', 'Festa completa montada em uma caixa', false, false, true, 10),
  ('12', 'Kit festa', 'kits', 'Bolo decorado, salgadinhos e docinhos para uma celebração completa.', '/images/cardapio/kit-festa.jpg', 'Kit festa com bolo, salgadinhos e docinhos', true, false, true, 11)
on conflict (id) do nothing;

-- Depois de criar o usuário em Authentication > Users no painel do Supabase,
-- substitua o e-mail abaixo e execute somente este comando:
--
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'seu-email@exemplo.com'
-- on conflict (user_id) do nothing;
