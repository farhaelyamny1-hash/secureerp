
-- Fix: Add PERMISSIVE policies for authenticated users on all company tables
-- Without permissive policies, restrictive-only policies deny ALL access

-- categories
CREATE POLICY "Authenticated users can access categories"
  ON public.categories FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- companies
CREATE POLICY "Authenticated users can access companies"
  ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- company_members
CREATE POLICY "Authenticated users can access company_members"
  ON public.company_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- customers
CREATE POLICY "Authenticated users can access customers"
  ON public.customers FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- employees
CREATE POLICY "Authenticated users can access employees"
  ON public.employees FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- expenses
CREATE POLICY "Authenticated users can access expenses"
  ON public.expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- invoice_items
CREATE POLICY "Authenticated users can access invoice_items"
  ON public.invoice_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- invoices
CREATE POLICY "Authenticated users can access invoices"
  ON public.invoices FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- notifications
CREATE POLICY "Authenticated users can access notifications"
  ON public.notifications FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- payments
CREATE POLICY "Authenticated users can access payments"
  ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- products
CREATE POLICY "Authenticated users can access products"
  ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- profiles
CREATE POLICY "Authenticated users can access profiles"
  ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- quotations
CREATE POLICY "Authenticated users can access quotations"
  ON public.quotations FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- subscriptions
CREATE POLICY "Authenticated users can access subscriptions"
  ON public.subscriptions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add missing trigger for auto-creating profiles on signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
