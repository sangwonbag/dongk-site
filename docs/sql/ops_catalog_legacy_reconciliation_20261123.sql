-- Applied to Supabase DK-Floor on 2026-11-23.
-- This migration is additive and does NOT alter historical transaction amounts or LOT quantities.
create table if not exists dk_ops_private.ops_catalog_migration_backups (
 id bigint generated always as identity primary key,
 workspace_id uuid not null,
 state_version bigint not null,
 source_updated_at timestamptz not null,
 snapshot_data jsonb not null,
 snapshot_docs jsonb not null,
 created_at timestamptz not null default now(),
 unique(workspace_id,state_version,source_updated_at)
);
alter table dk_ops_private.ops_catalog_migration_backups enable row level security;
revoke all on dk_ops_private.ops_catalog_migration_backups from public,anon,authenticated;

-- Execute once per source version to preserve the exact original state.
insert into dk_ops_private.ops_catalog_migration_backups
 (workspace_id,state_version,source_updated_at,snapshot_data,snapshot_docs)
select workspace_id,version,updated_at,data,docs
from public.dk_ops_state
on conflict(workspace_id,state_version,source_updated_at) do nothing;

create or replace view public.dk_ops_catalog_legacy_reconciliation
with (security_invoker = true) as
select
 s.workspace_id,
 e.item->>'id' as legacy_material_id,
 e.item->>'code' as legacy_erp_code,
 e.item->>'name' as legacy_name,
 e.item->>'brand' as legacy_brand,
 e.item->>'category' as legacy_category,
 e.item->>'spec' as legacy_spec,
 e.item->>'unit' as legacy_unit,
 e.item->'stock' as legacy_stock,
 e.item->'purchase' as legacy_purchase,
 e.item->'sale' as legacy_sale,
 e.item->'unitQty' as legacy_unit_qty,
 e.item->>'source' as legacy_source,
 e.item->>'lastTransaction' as legacy_last_transaction,
 coalesce(l.review_status,'unmatched') as match_status,
 l.site_product_id as matched_shop_product_id,
 case when l.review_status='approved' then m.material_id else null end as canonical_material_id,
 case when l.review_status='approved' then m.name else null end as canonical_name,
 case when l.review_status='approved' then m.code else null end as canonical_code,
 case when l.review_status='approved' then m.brand else null end as canonical_brand,
 case when l.review_status='approved' then m.spec else null end as canonical_spec,
 case when l.review_status='approved' then m.unit else null end as canonical_unit
from public.dk_ops_state s
cross join lateral jsonb_array_elements(s.data->'materials') as e(item)
left join public.dk_ops_material_link_candidates l
 on l.workspace_id=s.workspace_id and l.erp_material_id=e.item->>'id'
left join public.dk_ops_catalog_master m
 on m.product_id=l.site_product_id;
revoke all on public.dk_ops_catalog_legacy_reconciliation from public,anon;
grant select on public.dk_ops_catalog_legacy_reconciliation to authenticated;
