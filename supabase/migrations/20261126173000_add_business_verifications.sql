create table public.business_verifications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  business_number text not null check (business_number ~ '^[0-9]{10}$'),
  business_name text not null,
  representative text not null,
  opened_on date not null,
  business_address text not null default '',
  business_type text not null default '',
  business_item text not null default '',
  verified_at timestamptz not null
);

alter table public.business_verifications enable row level security;
revoke all on public.business_verifications from public, anon, authenticated;
grant select on public.business_verifications to authenticated;
grant select, insert, update on public.business_verifications to service_role;

create policy "Members can read their own business verification"
on public.business_verifications for select to authenticated
using ((select auth.uid()) = user_id);
