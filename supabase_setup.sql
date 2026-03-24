-- Ejecuta esto en Supabase > SQL Editor

-- 1. Tabla de perfiles de usuario
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  experience text,
  sector text,
  skills text[],
  summary text,
  cv_url text,
  updated_at timestamp with time zone default now()
);

-- 2. Tabla de favoritos
create table public.favorites (
  id serial primary key,
  user_id uuid references auth.users on delete cascade not null,
  job_id integer not null,
  created_at timestamp with time zone default now(),
  unique(user_id, job_id)
);

-- 3. Tabla de alertas
create table public.alerts (
  id serial primary key,
  user_id uuid references auth.users on delete cascade not null,
  email text,
  sector text default 'Todos',
  area text default 'Todas',
  exp text default 'Todos',
  created_at timestamp with time zone default now()
);

-- 4. Seguridad: cada usuario solo ve sus propios datos (RLS)
alter table public.profiles  enable row level security;
alter table public.favorites enable row level security;
alter table public.alerts    enable row level security;

create policy "Perfil propio" on public.profiles
  for all using (auth.uid() = id);

create policy "Favoritos propios" on public.favorites
  for all using (auth.uid() = user_id);

create policy "Alertas propias" on public.alerts
  for all using (auth.uid() = user_id);

-- 5. Bucket privado para CVs
insert into storage.buckets (id, name, public) values ('cvs', 'cvs', false);

create policy "Subir CV propio" on storage.objects
  for insert with check (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Leer CV propio" on storage.objects
  for select using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Borrar CV propio" on storage.objects
  for delete using (bucket_id = 'cvs' and auth.uid()::text = (storage.foldername(name))[1]);
