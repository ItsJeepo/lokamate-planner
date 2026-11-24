CREATE TABLE IF NOT EXISTS public.itineraries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  city text NOT NULL,
  style text NOT NULL,
  budget bigint NOT NULL,
  days integer NOT NULL,
  notes text,
  result jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.itineraries ADD COLUMN IF NOT EXISTS prefs jsonb;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.itineraries TO authenticated;
GRANT ALL ON public.itineraries TO service_role;
ALTER TABLE public.itineraries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can insert their own itineraries" ON public.itineraries;
DROP POLICY IF EXISTS "Users can delete their own itineraries" ON public.itineraries;
CREATE POLICY "Users can view their own itineraries" ON public.itineraries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own itineraries" ON public.itineraries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own itineraries" ON public.itineraries FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS itineraries_user_created_idx ON public.itineraries (user_id, created_at DESC);

DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','moderator','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade not null, role app_role not null, unique(user_id, role));
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role) returns boolean language sql stable security definer set search_path = public as $$ select exists (select 1 from public.user_roles where user_id=_user_id and role=_role) $$;
revoke execute on function public.has_role(uuid, app_role) from public, anon;
grant execute on function public.has_role(uuid, app_role) to authenticated;
DROP POLICY IF EXISTS "Users see own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins manage itineraries" ON public.itineraries;
create policy "Users see own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "Admins manage itineraries" on public.itineraries for all to authenticated using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE OR REPLACE FUNCTION public.purge_old_itineraries() RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  DELETE FROM public.itineraries WHERE created_at < now() - interval '30 days';
$$;
REVOKE EXECUTE ON FUNCTION public.purge_old_itineraries() FROM PUBLIC, anon, authenticated;
SELECT cron.schedule('purge-old-itineraries', '0 3 * * *', 'SELECT public.purge_old_itineraries()');

CREATE OR REPLACE FUNCTION public.enforce_itinerary_limit() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF public.has_role(NEW.user_id, 'admin') THEN RETURN NEW; END IF;
  IF (SELECT count(*) FROM public.itineraries WHERE user_id = NEW.user_id AND created_at >= now() - interval '30 days') >= 2 THEN
    RAISE EXCEPTION 'ITINERARY_LIMIT';
  END IF;
  RETURN NEW;
END $$;
REVOKE EXECUTE ON FUNCTION public.enforce_itinerary_limit() FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS itineraries_limit ON public.itineraries;
CREATE TRIGGER itineraries_limit BEFORE INSERT ON public.itineraries FOR EACH ROW EXECUTE FUNCTION public.enforce_itinerary_limit();