-- Reference SQL for DK-Floor shopping catalog -> operations catalog
-- Already applied to Supabase DK-Floor on 2026-11-17.
-- Read API only: does not rewrite legacy ERP documents, quantities, LOT or prices.

create table if not exists public.dk_ops_material_link_candidates (
 workspace_id uuid not null references public.dk_ops_workspaces(id) on delete cascade,
 erp_material_id text not null,
 site_product_id bigint not null references public.products(id) on delete cascade,
 matched_code text not null,
 match_method text not null default 'exact_code_and_category',
 review_status text not null default 'candidate'
   check (review_status in ('candidate','approved','rejected')),
 created_at timestamptz not null default now(),
 primary key(workspace_id,erp_material_id,site_product_id)
);
alter table public.dk_ops_material_link_candidates enable row level security;
revoke all on public.dk_ops_material_link_candidates from anon,authenticated;
drop policy if exists dk_ops_catalog_candidates_member_read
 on public.dk_ops_material_link_candidates;
create policy dk_ops_catalog_candidates_member_read
 on public.dk_ops_material_link_candidates for select to authenticated
 using (exists (select 1 from public.dk_ops_members m
  where m.workspace_id = dk_ops_material_link_candidates.workspace_id
   and m.user_id = (select auth.uid())));
drop policy if exists dk_ops_catalog_candidates_admin_review
 on public.dk_ops_material_link_candidates;
create policy dk_ops_catalog_candidates_admin_review
 on public.dk_ops_material_link_candidates for update to authenticated
 using (exists (select 1 from public.dk_ops_members m
  where m.workspace_id = dk_ops_material_link_candidates.workspace_id
   and m.user_id = (select auth.uid()) and m.role in ('admin','editor')))
 with check (exists (select 1 from public.dk_ops_members m
  where m.workspace_id = dk_ops_material_link_candidates.workspace_id
   and m.user_id = (select auth.uid()) and m.role in ('admin','editor')));
grant select on public.dk_ops_material_link_candidates to authenticated;
grant update(review_status) on public.dk_ops_material_link_candidates to authenticated;

create or replace view public.dk_ops_catalog_master
with (security_invoker = true) as
select
  p.id as product_id,
  ('shop:' || p.id::text) as material_id,
  coalesce(nullif(btrim(p.product_code),''),nullif(btrim(p.code),''),'') as code,
  p.name as name,
  coalesce(c.name,nullif(btrim(p.category),''),'') as category,
  coalesce(b.name,nullif(btrim(p.brand),''),'') as brand,
  coalesce(nullif(btrim(p.specification),''),nullif(btrim(p.size_text),''),'') as spec,
  coalesce(p.unit,'') as unit,
  coalesce(p.thickness,'') as thickness,
  p.price as sale,
  coalesce(p.is_active,true) as is_active,
  p.updated_at as catalog_updated_at
from public.products p
left join public.categories c on c.id=p.category_id
left join public.brands b on b.id=p.brand_id;
revoke all on public.dk_ops_catalog_master from public,anon;
grant select on public.dk_ops_catalog_master to authenticated;

create or replace function public.dk_ops_search_shop_materials(
 q text default '', result_limit integer default 40,
 show_inactive boolean default false
)
returns setof public.dk_ops_catalog_master
language sql stable security invoker
set search_path = ''
as $function$
 with term as (
 select
   lower(btrim(coalesce(q,''))) as needle,
   case when btrim(coalesce(q,'')) ~ '^[A-Za-z0-9[:space:]./_-]+$'
    then regexp_replace(upper(coalesce(q,'')),'[^A-Z0-9]','','g')
    else ''
   end as code_needle
 )
 select m.*
 from public.dk_ops_catalog_master m cross join term t
 where (coalesce(show_inactive,false) or m.is_active)
  and (t.needle=''
   or (t.code_needle<>'' and regexp_replace(upper(m.code),'[^A-Z0-9]','','g')
       like '%' || t.code_needle || '%')
   or lower(m.name) like '%' || t.needle || '%'
   or lower(m.category) like '%' || t.needle || '%'
   or lower(m.brand) like '%' || t.needle || '%'
   or not exists (
     select 1 from regexp_split_to_table(t.needle,'[[:space:]]+') word
     where word<>'' and lower(concat_ws(' ',m.code,m.name,m.category,m.brand,
                                       m.spec,m.unit,m.thickness))
                      not like '%' || word || '%'
   ))
 order by case
   when upper(m.code)=upper(btrim(coalesce(q,''))) then 0
   when t.code_needle<>'' and regexp_replace(upper(m.code),'[^A-Z0-9]','','g')=t.code_needle then 1
   when t.code_needle<>'' and regexp_replace(upper(m.code),'[^A-Z0-9]','','g') like t.code_needle || '%' then 2
   when t.code_needle<>'' and regexp_replace(upper(m.code),'[^A-Z0-9]','','g') like '%' || t.code_needle || '%' then 3
   when lower(m.name) like t.needle || '%' then 4
   else 5
  end,m.name,m.product_id
 limit least(greatest(coalesce(result_limit,40),1),100);
$function$;
revoke all on function public.dk_ops_search_shop_materials(text,integer,boolean)
 from public,anon;
grant execute on function public.dk_ops_search_shop_materials(text,integer,boolean)
 to authenticated;

create or replace view public.dk_ops_catalog_approved_links
with (security_invoker = true) as
select
 l.workspace_id,l.erp_material_id,c.product_id,
 c.material_id as canonical_material_id,c.code,c.name,c.category,c.brand,
 c.spec,c.unit,c.thickness,c.sale as catalog_sale_price,c.is_active
from public.dk_ops_material_link_candidates l
join public.dk_ops_catalog_master c on c.product_id=l.site_product_id
where l.review_status='approved';
revoke all on public.dk_ops_catalog_approved_links from public,anon;
grant select on public.dk_ops_catalog_approved_links to authenticated;

-- Candidate approval and historical migration are deliberately omitted:
-- requires category/brand review before each ERP ID is mapped.
