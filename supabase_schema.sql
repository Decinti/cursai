-- Ejecuta este script en el SQL Editor de tu proyecto Supabase
-- https://supabase.com/dashboard/project/_/sql

-- Tabla: ramos
create table ramos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users,
  nombre text not null,
  descripcion text,
  created_at timestamp default now()
);

-- Tabla: clases
create table clases (
  id uuid primary key default gen_random_uuid(),
  ramo_id uuid references ramos(id) on delete cascade,
  numero int not null,
  nombre text not null,
  transcripcion text,
  sintesis text,
  created_at timestamp default now()
);

-- Habilitar Row Level Security
alter table ramos enable row level security;
alter table clases enable row level security;

-- Policies: cada usuario solo ve sus propios datos
create policy "usuarios ven sus ramos" on ramos
  for all using (auth.uid() = user_id);

create policy "usuarios ven sus clases" on clases
  for all using (
    ramo_id in (select id from ramos where user_id = auth.uid())
  );
