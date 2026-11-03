create schema if not exists extensions;
create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_cron;

create type public.account_type as enum ('cash', 'bank', 'card', 'wallet');
create type public.category_kind as enum ('income', 'expense');
create type public.tx_kind as enum ('income', 'expense');
create type public.tx_source as enum ('manual', 'recurring', 'import', 'seed');
create type public.goal_status as enum ('active', 'paused', 'completed');
create type public.goal_entry_kind as enum ('contribution', 'withdrawal');
create type public.recurring_frequency as enum ('weekly', 'monthly', 'yearly');
create type public.recurring_status as enum ('active', 'paused', 'cancelled');
create type public.activity_kind as enum ('transaction', 'no_spend');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 40),
  last_name text not null check (char_length(last_name) between 1 and 40),
  locale text not null default 'es' check (locale in ('es', 'en')),
  base_currency char(3) not null default 'PEN' check (base_currency in ('PEN', 'USD')),
  usd_pen_rate numeric(10, 4) not null default 1 check (usd_pen_rate > 0),
  date_format text null,
  show_achievements boolean not null default true,
  onboarding_done boolean not null default false,
  is_demo boolean not null default false,
  demo_expires_at timestamptz null,
  created_at timestamptz not null default now(),
  check (is_demo = (demo_expires_at is not null))
);

create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  type public.account_type not null,
  currency char(3) not null check (currency in ('PEN', 'USD')),
  opening_balance_minor bigint not null default 0,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  unique (id, currency)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind public.category_kind not null,
  default_key text null,
  name text null,
  archived_at timestamptz null,
  created_at timestamptz not null default now(),
  check (name is not null or default_key is not null),
  unique (id, user_id)
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 40),
  currency char(3) not null check (currency in ('PEN', 'USD')),
  target_minor bigint not null check (target_minor > 0),
  initial_saved_minor bigint not null default 0 check (initial_saved_minor >= 0),
  deadline date not null,
  status public.goal_status not null default 'active',
  completed_at timestamptz null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  unique (id, user_id)
);

create table public.recurring_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  category_id uuid not null,
  kind public.tx_kind not null,
  amount_minor bigint not null check (amount_minor > 0),
  frequency public.recurring_frequency not null,
  start_on date not null,
  end_on date null,
  status public.recurring_status not null default 'active',
  is_subscription boolean not null default false,
  service_name text null,
  description text null check (description is null or char_length(description) <= 140),
  resume_from date null,
  created_at timestamptz not null default now(),
  foreign key (account_id, user_id) references public.accounts(id, user_id),
  foreign key (category_id, user_id) references public.categories(id, user_id)
);

create table public.import_batches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  filename text not null check (char_length(filename) <= 120),
  rows_total integer not null check (rows_total >= 0),
  rows_imported integer not null check (rows_imported >= 0),
  rows_skipped integer not null check (rows_skipped >= 0),
  created_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null,
  currency char(3) not null check (currency in ('PEN', 'USD')),
  category_id uuid not null,
  kind public.tx_kind not null,
  amount_minor bigint not null check (amount_minor > 0 and amount_minor <= 99999999999),
  occurred_on date not null,
  description text null check (description is null or char_length(description) <= 140),
  source public.tx_source not null default 'manual',
  recurring_id uuid null references public.recurring_rules(id),
  recurring_occurrence_on date null,
  import_batch_id uuid null,
  client_request_id uuid null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  foreign key (account_id, user_id) references public.accounts(id, user_id),
  foreign key (account_id, currency) references public.accounts(id, currency),
  foreign key (category_id, user_id) references public.categories(id, user_id),
  foreign key (import_batch_id, user_id) references public.import_batches(id, user_id),
  check ((source = 'recurring') = (recurring_id is not null))
);

create table public.transfers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  from_account_id uuid not null,
  to_account_id uuid not null,
  amount_out_minor bigint not null check (amount_out_minor > 0),
  amount_in_minor bigint not null check (amount_in_minor > 0),
  occurred_on date not null,
  description text null check (description is null or char_length(description) <= 140),
  client_request_id uuid null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz null,
  foreign key (from_account_id, user_id) references public.accounts(id, user_id),
  foreign key (to_account_id, user_id) references public.accounts(id, user_id),
  check (from_account_id <> to_account_id)
);

create table public.budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  effective_from date not null check (effective_from = date_trunc('month', effective_from)::date),
  limit_minor bigint null check (limit_minor > 0),
  created_at timestamptz not null default now(),
  foreign key (category_id, user_id) references public.categories(id, user_id),
  unique (user_id, category_id, effective_from)
);

create table public.goal_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_id uuid not null,
  kind public.goal_entry_kind not null,
  amount_minor bigint not null check (amount_minor > 0),
  occurred_on date not null,
  client_request_id uuid null,
  created_at timestamptz not null default now(),
  foreign key (goal_id, user_id) references public.goals(id, user_id)
);

create table public.activity_days (
  user_id uuid not null references auth.users(id) on delete cascade,
  day date not null,
  kind public.activity_kind not null,
  primary key (user_id, day)
);

create table public.achievements (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null check (key in ('first_transaction', 'streak_7', 'streak_30', 'goal_completed', 'month_within_budget', 'tx_100')),
  unlocked_at timestamptz not null default now(),
  primary key (user_id, key)
);

create table public.insight_dismissals (
  user_id uuid not null references auth.users(id) on delete cascade,
  dedupe_key text not null,
  severity_at_dismissal text not null check (severity_at_dismissal in ('info', 'attention', 'alert')),
  period_end date not null,
  dismissed_at timestamptz not null default now(),
  primary key (user_id, dedupe_key)
);

create table public.user_stats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  best_streak_days integer not null default 0 check (best_streak_days >= 0),
  updated_at timestamptz not null default now()
);

create table public.demo_signups (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create unique index transactions_recurring_occurrence_unique
  on public.transactions (recurring_id, recurring_occurrence_on)
  where recurring_id is not null;
create unique index transactions_client_request_unique
  on public.transactions (user_id, client_request_id)
  where client_request_id is not null;
create unique index transfers_client_request_unique
  on public.transfers (user_id, client_request_id)
  where client_request_id is not null;
create unique index goal_entries_client_request_unique
  on public.goal_entries (user_id, client_request_id)
  where client_request_id is not null;
create unique index categories_user_kind_name_unique
  on public.categories (user_id, kind, lower(coalesce(name, default_key)));
create index transactions_user_occurred_index on public.transactions (user_id, occurred_on desc) where deleted_at is null;
create index transactions_user_category_occurred_index on public.transactions (user_id, category_id, occurred_on);
create index transactions_account_occurred_index on public.transactions (account_id, occurred_on);
create index transactions_description_trgm_index on public.transactions using gin (description extensions.gin_trgm_ops);
create index transfers_user_occurred_index on public.transfers (user_id, occurred_on desc);
create index transfers_from_account_index on public.transfers (from_account_id);
create index transfers_to_account_index on public.transfers (to_account_id);
create index goal_entries_goal_occurred_index on public.goal_entries (goal_id, occurred_on);
create index recurring_rules_user_status_index on public.recurring_rules (user_id, status);
create index profiles_demo_expires_index on public.profiles (demo_expires_at) where is_demo;
create index demo_signups_ip_created_index on public.demo_signups (ip_hash, created_at);
