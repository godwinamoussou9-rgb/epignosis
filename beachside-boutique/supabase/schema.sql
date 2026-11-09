-- BEACHSIDE BOUTIQUE : base de données Supabase.
-- 1) Remplacez votre@email.com (tout en bas de la section « Administrateur ») par votre adresse.
-- 2) Collez ce fichier dans SQL Editor, puis cliquez sur Run. À exécuter une seule fois.

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price text not null default 'Prix en boutique',
  kind text not null default 'drop' check (kind in ('drop', 'arrival')),
  category text not null default 'Unisexe',
  sizes text not null default '',
  description text not null default '',
  image_url text,
  published boolean not null default true,
  created_at timestamptz not null default now()
);
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  stars int not null default 5 check (stars between 1 and 5),
  text text not null,
  created_at timestamptz not null default now()
);
create table public.faq (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create table public.admins (email text primary key);

-- Droits : tout le monde lit, seuls les administrateurs écrivent.
create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'))
$$;

alter table public.products enable row level security;
alter table public.reviews enable row level security;
alter table public.faq enable row level security;
alter table public.admins enable row level security;

create policy products_read on public.products for select using (published or public.is_admin());
create policy products_admin on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy reviews_read on public.reviews for select using (true);
create policy reviews_admin on public.reviews for all using (public.is_admin()) with check (public.is_admin());
create policy faq_read on public.faq for select using (true);
create policy faq_admin on public.faq for all using (public.is_admin()) with check (public.is_admin());
create policy admins_self on public.admins for select using (email = lower(auth.jwt() ->> 'email'));

-- Photos des articles
insert into storage.buckets (id, name, public) values ('products', 'products', true) on conflict (id) do nothing;
create policy images_read on storage.objects for select using (bucket_id = 'products');
create policy images_admin on storage.objects for all
  using (bucket_id = 'products' and public.is_admin())
  with check (bucket_id = 'products' and public.is_admin());

-- Pièces et questions de départ (vous pourrez les supprimer depuis /admin)
insert into public.products (name, kind, description, image_url) values
  ('Polo terre cuite', 'arrival', 'Polo à col liseré blanc, teinte terre cuite.', '/products/f0.jpg'),
  ('Polo ciel', 'drop', 'Polo bleu ciel au col sobre.', '/products/f1.jpg'),
  ('Polo ocre', 'arrival', 'Polo ocre à col liseré blanc.', '/products/f2.jpg'),
  ('Polo olive', 'drop', 'Polo vert olive à col liseré.', '/products/f3.jpg'),
  ('Polo crème', 'drop', 'Polo crème lumineux au col liseré.', '/products/f4.jpg'),
  ('Le portant complet', 'arrival', 'Toutes les teintes du moment, côte à côte.', '/products/f5.jpg');
insert into public.faq (question, answer, position) values
  ('Comment commander ?', 'Écrivez-nous sur WhatsApp avec le nom de la pièce qui vous plaît.', 1),
  ('Quand arrivent les nouveautés ?', 'De nouvelles pièces sont publiées chaque jour. Retrouvez-les dans les drops du jour et les arrivages.', 2),
  ('Où se trouve la boutique ?', 'Le bouton Google Maps de la section Nous trouver vous indique l’adresse.', 3),
  ('Comment vous joindre ?', 'Par WhatsApp, ou en message privé sur Instagram.', 4);

-- Administrateur : votre adresse e-mail, en minuscules (la même que votre compte Supabase Auth)
insert into public.admins (email) values (godwinamoussou9@gmail.com');
