ALTER TABLE public.orders
  ADD COLUMN section text NOT NULL DEFAULT 'market',
  ADD COLUMN platform_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN discount numeric NOT NULL DEFAULT 0,
  ADD COLUMN coupon_code text,
  ADD COLUMN delivery_slot text,
  ADD COLUMN runner_details jsonb;

CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description_en text NOT NULL DEFAULT '',
  description_hi text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'flat' CHECK (discount_type IN ('flat','percent')),
  discount_value numeric NOT NULL DEFAULT 0 CHECK (discount_value >= 0),
  min_order numeric NOT NULL DEFAULT 0,
  max_discount numeric,
  applies_to text NOT NULL DEFAULT 'all' CHECK (applies_to IN ('all','food','market','services')),
  merchant_name text,
  active boolean NOT NULL DEFAULT true,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "coupons readable while active"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (active = true);

COMMENT ON COLUMN public.orders.section IS 'Which app section the order belongs to: food | market | services';
COMMENT ON COLUMN public.orders.platform_fee IS 'Flat Rs9 platform fee charged on premium restaurant (Food Club) orders';
COMMENT ON COLUMN public.orders.runner_details IS 'Banda Runner multi-step task: {steps:[{type,address,note,km}], total_km}';