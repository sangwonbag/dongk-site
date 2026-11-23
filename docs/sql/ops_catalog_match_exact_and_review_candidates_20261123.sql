-- Executed on 2026-11-23 after protected snapshot.
-- Safe to re-run: existing candidates are protected by composite-key ON CONFLICT DO NOTHING.
-- Never use candidate status as permission to replace historical document data.

-- 1) Confirm same normalized name and category; exact or equivalent brand, otherwise skip.
with erp as (
 select s.workspace_id,e->>'id' eid,e->>'name' ename,coalesce(e->>'brand','') ebrand,e->>'category' ecat
 from public.dk_ops_state s, lateral jsonb_array_elements(s.data->'materials') e
), unmatched as (
 select e.* from erp e
 left join public.dk_ops_material_link_candidates l
 on l.workspace_id=e.workspace_id and l.erp_material_id=e.eid
 where l.erp_material_id is null
), names as (
 select u.workspace_id,u.eid,u.ebrand,p.product_id,p.code,p.brand,
 count(*) over(partition by u.workspace_id,u.eid) as choices
 from unmatched u join public.dk_ops_catalog_master p
 on u.ecat=p.category
 and lower(regexp_replace(u.ename,'[[:space:]/.,_()\[\]-]+','','g'))
 =lower(regexp_replace(p.name,'[[:space:]/.,_()\[\]-]+','','g'))
)
insert into public.dk_ops_material_link_candidates
 (workspace_id,erp_material_id,site_product_id,matched_code,match_method,review_status)
select workspace_id,eid,product_id,code,'exact_normalized_name_and_category','approved'
from names where choices=1
 and (ebrand='' or upper(ebrand)=upper(brand)
   or (ebrand='LX' and brand='LX하우시스')
   or (ebrand='LX하우시스' and brand='LX'))
on conflict(workspace_id,erp_material_id,site_product_id) do nothing;

-- 2) Partial code similarity: brand AND category must agree.
-- These are suggestions only. NEVER auto-approve.
with erp as (
 select s.workspace_id wid,e->>'id' eid,e->>'name' ename,e->>'category' ecat,
 coalesce(e->>'brand','') ebrand
 from public.dk_ops_state s, lateral jsonb_array_elements(s.data->'materials') e
), remaining as (
 select e.* from erp e
 left join public.dk_ops_material_link_candidates l
 on l.workspace_id=e.wid and l.erp_material_id=e.eid
 where l.erp_material_id is null and e.ebrand<>''
), tokens as (
 select r.*,t[1] tok from remaining r
 cross join lateral regexp_matches(upper(r.ename),'([A-Z]{0,4}[0-9]{4,7}[A-Z]{0,2})','g') t
), grouped as (
 select t.wid,t.eid,p.product_id,min(t.tok) matched_code
 from tokens t join public.dk_ops_catalog_master p on p.category=t.ecat
 and upper(regexp_replace(p.code,'[^A-Z0-9]','','g')) like '%'||t.tok||'%'
 and (upper(t.ebrand)=upper(p.brand)
 or (t.ebrand in ('LX','LX하우시스','LG') and p.brand in ('LX','LX하우시스')))
 group by t.wid,t.eid,p.product_id
), unique_erp as (
 select wid,eid from grouped group by wid,eid having count(*)=1
)
insert into public.dk_ops_material_link_candidates
 (workspace_id,erp_material_id,site_product_id,matched_code,match_method,review_status)
select g.wid,g.eid,g.product_id,g.matched_code,'partial_code_brand_category_review','candidate'
from grouped g join unique_erp u on g.wid=u.wid and g.eid=u.eid
on conflict(workspace_id,erp_material_id,site_product_id) do nothing;
