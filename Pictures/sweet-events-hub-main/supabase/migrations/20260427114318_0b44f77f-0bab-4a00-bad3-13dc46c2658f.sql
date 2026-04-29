
-- Roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Event type and category enums
CREATE TYPE public.event_type AS ENUM ('upcoming', 'past');
CREATE TYPE public.event_category AS ENUM ('pickleball', 'sip_paint', 'perfume', 'candlelight', 'other');

CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT NOT NULL DEFAULT '',
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  type event_type NOT NULL DEFAULT 'upcoming',
  category event_category NOT NULL DEFAULT 'other',
  location TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view events"
ON public.events FOR SELECT
USING (true);

CREATE POLICY "Admins can insert events"
ON public.events FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update events"
ON public.events FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete events"
ON public.events FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed featured Candlelight Dinner
INSERT INTO public.events (title, date, price, description, media_urls, type, category, location)
VALUES (
  'Candlelight Dinner',
  now() + interval '14 days',
  2499,
  'An intimate evening of soft candlelight, gourmet bites, and our signature cupcakes. Limited seats — reserve yours.',
  ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200','https://images.unsplash.com/photo-1551024601-bec78aea704b?w=1200'],
  'upcoming',
  'candlelight',
  'Mumbai'
),
(
  'Sip & Paint Sunday',
  now() - interval '20 days',
  1299,
  'A relaxed afternoon of painting, sipping, and sweet treats.',
  ARRAY['https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=1200','https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=1200'],
  'past',
  'sip_paint',
  'Bandra'
),
(
  'Pickleball Pop-up',
  now() - interval '40 days',
  999,
  'Friendly matches, refreshments and our cupcake bar court-side.',
  ARRAY['https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200','https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200'],
  'past',
  'pickleball',
  'Juhu'
),
(
  'Perfume Making Workshop',
  now() - interval '60 days',
  1799,
  'Craft your signature scent with our master perfumer, paired with cupcake tasting.',
  ARRAY['https://images.unsplash.com/photo-1541643600914-78b084683601?w=1200','https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=1200'],
  'past',
  'perfume',
  'Lower Parel'
);
