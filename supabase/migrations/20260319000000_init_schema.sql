-- ============================================================
-- Migration: 20260319000000_init_schema.sql
-- Description: Initial schema for pricewise shopping tracker
-- ============================================================

-- ----------------------------------------------------------------
-- SECTION 1: updated_at Trigger Function
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------
-- SECTION 2: products（商品主檔）
-- ----------------------------------------------------------------

CREATE TABLE public.products (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  category      TEXT,
  barcode       TEXT,
  default_unit  TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_user_id ON public.products(user_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_barcode ON public.products(barcode);

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "products: select own" ON public.products
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "products: insert own" ON public.products
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products: update own" ON public.products
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "products: delete own" ON public.products
  FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- SECTION 3: purchases（購物記錄）
-- ----------------------------------------------------------------

CREATE TABLE public.purchases (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  store_name    TEXT,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_amount  NUMERIC(12, 2),
  photo_url     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_purchases_user_id ON public.purchases(user_id);
CREATE INDEX idx_purchases_purchase_date ON public.purchases(purchase_date DESC);
CREATE INDEX idx_purchases_store_name ON public.purchases(store_name);

CREATE TRIGGER trg_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "purchases: select own" ON public.purchases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "purchases: insert own" ON public.purchases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "purchases: update own" ON public.purchases
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "purchases: delete own" ON public.purchases
  FOR DELETE USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- SECTION 4: items（商品明細）
-- ----------------------------------------------------------------

CREATE TABLE public.items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id   UUID NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name          TEXT NOT NULL,
  quantity      NUMERIC(10, 3) NOT NULL,
  unit          TEXT NOT NULL,
  unit_price    NUMERIC(12, 2) NOT NULL,
  total_price   NUMERIC(12, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_purchase_id ON public.items(purchase_id);
CREATE INDEX idx_items_product_id ON public.items(product_id);

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "items: select own" ON public.items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = items.purchase_id
        AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "items: insert own" ON public.items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = items.purchase_id
        AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "items: update own" ON public.items
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = items.purchase_id
        AND purchases.user_id = auth.uid()
    )
  );

CREATE POLICY "items: delete own" ON public.items
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.purchases
      WHERE purchases.id = items.purchase_id
        AND purchases.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- SECTION 5: price_history（價格歷史）
-- ----------------------------------------------------------------

CREATE TABLE public.price_history (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  item_id       UUID REFERENCES public.items(id) ON DELETE SET NULL,
  store_name    TEXT,
  quantity      NUMERIC(10, 3) NOT NULL,
  unit          TEXT NOT NULL,
  unit_price    NUMERIC(12, 2) NOT NULL,
  purchase_date DATE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_price_history_product_id ON public.price_history(product_id);
CREATE INDEX idx_price_history_purchase_date ON public.price_history(purchase_date DESC);
CREATE INDEX idx_price_history_store_name ON public.price_history(store_name);
CREATE INDEX idx_price_history_item_id ON public.price_history(item_id);

ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "price_history: select own" ON public.price_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = price_history.product_id
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "price_history: insert own" ON public.price_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = price_history.product_id
        AND products.user_id = auth.uid()
    )
  );

CREATE POLICY "price_history: delete own" ON public.price_history
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.products
      WHERE products.id = price_history.product_id
        AND products.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- SECTION 6: Trigger — 自動寫入 price_history
-- ----------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.handle_item_price_history()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.product_id IS NOT NULL THEN
    INSERT INTO public.price_history (
      product_id,
      item_id,
      store_name,
      quantity,
      unit,
      unit_price,
      purchase_date
    )
    SELECT
      NEW.product_id,
      NEW.id,
      p.store_name,
      NEW.quantity,
      NEW.unit,
      NEW.unit_price,
      p.purchase_date
    FROM public.purchases p
    WHERE p.id = NEW.purchase_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_items_price_history
  AFTER INSERT ON public.items
  FOR EACH ROW EXECUTE FUNCTION public.handle_item_price_history();
