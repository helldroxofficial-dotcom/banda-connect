
-- ROLES
CREATE TYPE public.app_role AS ENUM ('admin','rider','customer');

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  area TEXT DEFAULT 'Station Road',
  address TEXT,
  wallet_balance NUMERIC NOT NULL DEFAULT 0,
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.raw_user_meta_data->>'phone',''))
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- CATALOGUE
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  hindi TEXT,
  sort_order INT NOT NULL DEFAULT 0
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  hindi TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,
  unit TEXT NOT NULL DEFAULT '1 pc',
  image_key TEXT NOT NULL DEFAULT 'grocery-atta',
  category_slug TEXT NOT NULL REFERENCES public.categories(slug) ON UPDATE CASCADE,
  tag TEXT,
  stock INT NOT NULL DEFAULT 50,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT USING (true);
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  item_total NUMERIC NOT NULL DEFAULT 0,
  packaging_fee NUMERIC NOT NULL DEFAULT 5,
  delivery_fee NUMERIC NOT NULL DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  savings NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'cod',
  status TEXT NOT NULL DEFAULT 'placed',
  address TEXT,
  area TEXT,
  rider_name TEXT,
  rating INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders own update" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- SERVICE LISTINGS
CREATE TABLE public.service_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  provider_name TEXT,
  description TEXT,
  price_text TEXT,
  location TEXT,
  contact TEXT,
  rating NUMERIC DEFAULT 4.7,
  image_key TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.service_listings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_listings TO authenticated;
GRANT ALL ON public.service_listings TO service_role;
ALTER TABLE public.service_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings public read approved" ON public.service_listings FOR SELECT USING (status = 'approved');
CREATE POLICY "listings own read" ON public.service_listings FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "listings own insert" ON public.service_listings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "listings own update" ON public.service_listings FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "listings admin delete" ON public.service_listings FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- DEMAND POSTS
CREATE TABLE public.demand_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  budget TEXT,
  location TEXT,
  contact TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.demand_posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.demand_posts TO authenticated;
GRANT ALL ON public.demand_posts TO service_role;
ALTER TABLE public.demand_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "demand public read open" ON public.demand_posts FOR SELECT USING (status = 'open');
CREATE POLICY "demand own read" ON public.demand_posts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "demand own insert" ON public.demand_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "demand own update" ON public.demand_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "demand own delete" ON public.demand_posts FOR DELETE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- MINI ATM
CREATE TABLE public.mini_atm_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 20,
  address TEXT,
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.mini_atm_requests TO authenticated;
GRANT ALL ON public.mini_atm_requests TO service_role;
ALTER TABLE public.mini_atm_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "atm own read" ON public.mini_atm_requests FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "atm own insert" ON public.mini_atm_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "atm update" ON public.mini_atm_requests FOR UPDATE TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin')) WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));

-- SEED CATEGORIES
INSERT INTO public.categories (slug, name, hindi, sort_order) VALUES
 ('atta','Aata & Flours','आटा',1),
 ('rice-dal','Rice & Dals','चावल व दाल',2),
 ('oils-ghee','Oils & Ghee','तेल व घी',3),
 ('spices','Spices & Cooking','मसाले',4),
 ('tea-sugar','Tea & Sugar','चाय व चीनी',5),
 ('dairy','Dairy & Bakery','डेयरी',6),
 ('snacks','Snacks & Namkeen','स्नैक्स',7);

-- SEED PRODUCTS
INSERT INTO public.products (name, hindi, price, mrp, unit, image_key, category_slug, tag) VALUES
 ('Fortune Chakki Fresh Atta','चक्की आटा',245,270,'5 kg','grocery-atta','atta','Bestseller'),
 ('Aashirvaad Whole Wheat Atta','गेहूं आटा',465,520,'10 kg','grocery-atta','atta',NULL),
 ('Maida (Refined Flour)','मैदा',48,55,'1 kg','grocery-atta','atta',NULL),
 ('Sooji / Rava','सूजी',32,38,'500 g','grocery-atta','atta',NULL),
 ('Besan (Gram Flour)','बेसन',82,95,'1 kg','grocery-atta','atta',NULL),
 ('Premium Basmati Rice','बासमती चावल',520,610,'5 kg','grocery-rice','rice-dal','Bestseller'),
 ('Arhar / Toor Dal','अरहर दाल',148,175,'1 kg','grocery-pulses','rice-dal',NULL),
 ('Chana Dal','चना दाल',92,105,'1 kg','grocery-pulses','rice-dal',NULL),
 ('Moong Dal','मूंग दाल',124,140,'1 kg','grocery-pulses','rice-dal',NULL),
 ('Kabuli Chana','काबुली चना',110,128,'1 kg','grocery-pulses','rice-dal',NULL),
 ('Sona Masoori Rice','सोना मसूरी चावल',285,320,'5 kg','grocery-rice','rice-dal',NULL),
 ('Fortune Kachi Ghani Mustard Oil','सरसों तेल',162,185,'1 L','grocery-mustard-oil','oils-ghee','Bestseller'),
 ('Saffola Gold Refined Oil','रिफाइंड तेल',185,210,'1 L','grocery-mustard-oil','oils-ghee',NULL),
 ('Amul Pure Ghee','शुद्ध घी',640,720,'1 L','grocery-ghee','oils-ghee',NULL),
 ('Engine Kachi Ghani Oil','कच्ची घानी तेल',158,178,'1 L','grocery-mustard-oil','oils-ghee',NULL),
 ('Everest Garam Masala','गरम मसाला',78,90,'100 g','grocery-spices','spices',NULL),
 ('Rajesh Masala Combo Pack','मसाला पैक',135,160,'5 x 50 g','grocery-spices','spices','Combo'),
 ('Tata Salt Iodised','नमक',28,32,'1 kg','grocery-salt','spices',NULL),
 ('Haldi Powder','हल्दी',48,58,'200 g','grocery-spices','spices',NULL),
 ('Lal Mirch Powder','लाल मिर्च',62,74,'200 g','grocery-spices','spices',NULL),
 ('Dhaniya Powder','धनिया पाउडर',44,52,'200 g','grocery-spices','spices',NULL),
 ('Red Label Tea','चाय पत्ती',142,160,'250 g','grocery-tea','tea-sugar',NULL),
 ('Tata Tea Gold','टाटा टी गोल्ड',285,320,'500 g','grocery-tea','tea-sugar','Bestseller'),
 ('Premium Refined Sugar','चीनी',52,58,'1 kg','grocery-sugar','tea-sugar',NULL),
 ('Desi Jaggery / Gud','गुड़',68,80,'1 kg','grocery-sugar','tea-sugar',NULL),
 ('Amul Taaza Toned Milk','अमूल दूध',33,35,'500 ml','grocery-milk','dairy','10 min'),
 ('Amul Butter','मक्खन',58,62,'100 g','grocery-butter','dairy',NULL),
 ('Farm Fresh Eggs','अंडे',84,95,'Tray of 12','grocery-eggs','dairy',NULL),
 ('Fresh Paneer','पनीर',96,110,'200 g','grocery-milk','dairy',NULL),
 ('Parle-G Biscuits','बिस्किट',40,48,'Pack of 4','grocery-biscuits','snacks','Combo'),
 ('Marie Gold Biscuits','मैरी बिस्किट',35,40,'250 g','grocery-biscuits','snacks',NULL),
 ('Masala Namkeen Mix','नमकीन',48,55,'400 g','grocery-namkeen','snacks',NULL),
 ('Kurkure Masala Munch','कुरकुरे',20,20,'90 g','grocery-namkeen','snacks',NULL),
 ('Aloo Bhujia','आलू भुजिया',52,60,'400 g','grocery-namkeen','snacks',NULL);
