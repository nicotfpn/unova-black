-- Apply to an owner-controlled Supabase project. No progress is publicly readable.
create table if not exists public.journeys (
 user_id uuid primary key references auth.users(id) on delete cascade,
 data jsonb not null,
 revision bigint not null default 1,
 updated_at timestamptz not null default now(),
 constraint journey_size check (octet_length(data::text) <= 100000),
 constraint journey_format check (jsonb_typeof(data->'caught') = 'array')
);
alter table public.journeys enable row level security;
create policy "Read own journey" on public.journeys for select to authenticated using (user_id=auth.uid());
create policy "Insert own journey" on public.journeys for insert to authenticated with check (user_id=auth.uid());
create policy "Update own journey" on public.journeys for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
revoke all on public.journeys from anon;
grant select,insert,update on public.journeys to authenticated;
create or replace function public.save_journey(p_data jsonb,p_expected bigint)
returns jsonb language plpgsql security invoker set search_path=public as $$
declare new_revision bigint;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 if p_expected=0 then
  insert into public.journeys(user_id,data,revision) values(auth.uid(),p_data,1)
  on conflict(user_id) do nothing returning revision into new_revision;
 else
  update public.journeys set data=p_data,revision=revision+1,updated_at=now()
  where user_id=auth.uid() and revision=p_expected returning revision into new_revision;
 end if;
 if new_revision is null then return jsonb_build_object('ok',false); end if;
 return jsonb_build_object('ok',true,'revision',new_revision);
end; $$;
revoke all on function public.save_journey(jsonb,bigint) from public,anon;
grant execute on function public.save_journey(jsonb,bigint) to authenticated;
