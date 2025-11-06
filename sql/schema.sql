create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  google_sub text unique not null,
  email text unique not null,
  name text,
  picture text,
  created_at timestamptz default now()
);

create table if not exists stores (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references users(id) on delete cascade,
  slug text unique not null,
  display_name text not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references stores(id) on delete cascade,
  title text not null,
  description text,
  price_cents integer not null check (price_cents >= 0),
  image_url text,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid references users(id) on delete set null,
  total_cents integer not null check (total_cents >= 0),
  status text not null default 'created',
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  qty integer not null check (qty > 0),
  price_cents integer not null check (price_cents >= 0)
);
