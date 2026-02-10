-- 1. Optimized RLS Helper Functions
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT tenant_id FROM public.profiles WHERE id = (SELECT auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
AS $function$
  SELECT role FROM public.profiles WHERE id = (SELECT auth.uid());
$function$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
END;
$function$;

-- 2. Performance Indexes for Foreign Keys
CREATE INDEX IF NOT EXISTS idx_chat_messages_tenant_id ON public.chat_messages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_client_documents_tenant_id ON public.client_documents(tenant_id);
CREATE INDEX IF NOT EXISTS idx_clients_assigned_coach_id ON public.clients(assigned_coach_id);
CREATE INDEX IF NOT EXISTS idx_hormonal_compounds_protocol_id ON public.hormonal_compounds(protocol_id);
CREATE INDEX IF NOT EXISTS idx_hormonal_protocols_tenant_id ON public.hormonal_protocols(tenant_id);
CREATE INDEX IF NOT EXISTS idx_measurements_client_id ON public.measurements(client_id);
CREATE INDEX IF NOT EXISTS idx_measurements_tenant_id ON public.measurements(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_plan_id ON public.subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_library_id ON public.workout_exercises(exercise_library_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_exercise_id ON public.workout_logs(exercise_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_tenant_id ON public.workout_logs(tenant_id);

-- 3. Cleanup of Duplicate/Unused Indexes
DROP INDEX IF EXISTS public.idx_body_assessments_client;

-- 4. Refactored RLS Policies (High Performance Subquery Pattern)

-- Profiles
DROP POLICY IF EXISTS "Anyone can view coach profiles" ON public.profiles;
CREATE POLICY "Anyone can view coach profiles" ON public.profiles FOR SELECT TO public USING (role = 'coach'::text);
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL TO authenticated USING ((SELECT is_admin()));

-- Clients
DROP POLICY IF EXISTS "Coaches can manage tenant clients" ON public.clients;
CREATE POLICY "Coaches can manage tenant clients" ON public.clients FOR ALL TO public USING (((SELECT get_my_role()) = 'coach'::text) AND (tenant_id = (SELECT get_my_tenant_id())));
DROP POLICY IF EXISTS "Clients can see own record" ON public.clients;
CREATE POLICY "Clients can see own record" ON public.clients FOR SELECT TO public USING (user_id = (SELECT auth.uid()));
DROP POLICY IF EXISTS "Clients can update own record" ON public.clients;
CREATE POLICY "Clients can update own record" ON public.clients FOR UPDATE TO authenticated USING (user_id = (SELECT auth.uid())) WITH CHECK (user_id = (SELECT auth.uid()));

-- Tenants
DROP POLICY IF EXISTS "Anyone can select tenants" ON public.tenants;
CREATE POLICY "Anyone can select tenants" ON public.tenants FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Admins can manage tenants" ON public.tenants;
CREATE POLICY "Admins can manage tenants" ON public.tenants FOR ALL TO public USING ((SELECT is_admin()));

-- Workouts
DROP POLICY IF EXISTS "Coaches can manage workouts in their tenant" ON public.workouts;
CREATE POLICY "Coaches can manage workouts in their tenant" ON public.workouts FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Athletes can view their own workouts" ON public.workouts;
CREATE POLICY "Athletes can view their own workouts" ON public.workouts FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));

-- Workout Exercises
DROP POLICY IF EXISTS "Coaches can manage workout exercises" ON public.workout_exercises;
CREATE POLICY "Coaches can manage workout exercises" ON public.workout_exercises FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.tenant_id = (SELECT get_my_tenant_id())));
DROP POLICY IF EXISTS "Athletes can view their workout exercises" ON public.workout_exercises;
CREATE POLICY "Athletes can view their workout exercises" ON public.workout_exercises FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.workouts w WHERE w.id = workout_id AND w.client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid()))));

-- Workout Logs
DROP POLICY IF EXISTS "Athletes can manage their workout logs" ON public.workout_logs;
CREATE POLICY "Athletes can manage their workout logs" ON public.workout_logs FOR ALL TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Coaches can view their student logs" ON public.workout_logs;
CREATE POLICY "Coaches can view their student logs" ON public.workout_logs FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));

-- Meal Plans
DROP POLICY IF EXISTS "Coaches can manage meal plans" ON public.meal_plans;
CREATE POLICY "Coaches can manage meal plans" ON public.meal_plans FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Athletes can view their meal plans" ON public.meal_plans;
CREATE POLICY "Athletes can view their meal plans" ON public.meal_plans FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));

-- Meals
DROP POLICY IF EXISTS "Coaches can manage meals in their tenant" ON public.meals;
CREATE POLICY "Coaches can manage meals in their tenant" ON public.meals FOR ALL TO public USING (meal_plan_id IN (SELECT id FROM public.meal_plans WHERE tenant_id = (SELECT get_my_tenant_id())));
DROP POLICY IF EXISTS "Athletes can view their own meals" ON public.meals;
CREATE POLICY "Athletes can view their own meals" ON public.meals FOR SELECT TO public USING (meal_plan_id IN (SELECT id FROM public.meal_plans WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid()))));

-- Body Assessments
DROP POLICY IF EXISTS "Professionals can manage their clients assessments" ON public.body_assessments;
CREATE POLICY "Professionals can manage their clients assessments" ON public.body_assessments FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Professionals can view their clients assessments" ON public.body_assessments;
CREATE POLICY "Professionals can view their clients assessments" ON public.body_assessments FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Clients can view their own assessments" ON public.body_assessments;
CREATE POLICY "Clients can view their own assessments" ON public.body_assessments FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));

-- Appointments
DROP POLICY IF EXISTS "Coaches can manage appointments in their tenant" ON public.appointments;
CREATE POLICY "Coaches can manage appointments in their tenant" ON public.appointments FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Athletes can view their own appointments" ON public.appointments;
CREATE POLICY "Athletes can view their own appointments" ON public.appointments FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));

-- Chat Messages
DROP POLICY IF EXISTS "Users can view chats where they are sender or receiver" ON public.chat_messages;
CREATE POLICY "Users can view chats where they are sender or receiver" ON public.chat_messages FOR SELECT TO public USING ((sender_id = (SELECT auth.uid())) OR (receiver_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Users can insert chat messages" ON public.chat_messages;
CREATE POLICY "Users can insert chat messages" ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (sender_id = (SELECT auth.uid()));

-- Client Documents
DROP POLICY IF EXISTS "Coaches can manage documents in their tenant" ON public.client_documents;
CREATE POLICY "Coaches can manage documents in their tenant" ON public.client_documents FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Athletes can view their own documents" ON public.client_documents;
CREATE POLICY "Athletes can view their own documents" ON public.client_documents FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));
DROP POLICY IF EXISTS "Athletes can upload their own documents" ON public.client_documents;
CREATE POLICY "Athletes can upload their own documents" ON public.client_documents FOR INSERT TO authenticated WITH CHECK ((client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid()))) AND (tenant_id = (SELECT get_my_tenant_id())));

-- Hormonal Protocols
DROP POLICY IF EXISTS "Coaches can manage hormonal protocols" ON public.hormonal_protocols;
CREATE POLICY "Coaches can manage hormonal protocols" ON public.hormonal_protocols FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Athletes can view their hormonal protocols" ON public.hormonal_protocols;
CREATE POLICY "Athletes can view their hormonal protocols" ON public.hormonal_protocols FOR SELECT TO public USING (client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid())));

-- Hormonal Compounds
DROP POLICY IF EXISTS "Coaches can manage compounds in their tenant" ON public.hormonal_compounds;
CREATE POLICY "Coaches can manage compounds in their tenant" ON public.hormonal_compounds FOR ALL TO public USING (EXISTS (SELECT 1 FROM public.hormonal_protocols hp WHERE hp.id = protocol_id AND hp.tenant_id = (SELECT get_my_tenant_id())));
DROP POLICY IF EXISTS "Athletes can view their compounds" ON public.hormonal_compounds;
CREATE POLICY "Athletes can view their compounds" ON public.hormonal_compounds FOR SELECT TO public USING (EXISTS (SELECT 1 FROM public.hormonal_protocols hp WHERE hp.id = protocol_id AND hp.client_id IN (SELECT id FROM public.clients WHERE user_id = (SELECT auth.uid()))));

-- Audit Logs
DROP POLICY IF EXISTS "Coaches can see tenant audit logs" ON public.audit_logs;
CREATE POLICY "Coaches can see tenant audit logs" ON public.audit_logs FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));

-- Asaas Customers
DROP POLICY IF EXISTS "Tenants can view their own asaas customer info" ON public.asaas_customers;
CREATE POLICY "Tenants can view their own asaas customer info" ON public.asaas_customers FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));

-- Subscriptions
DROP POLICY IF EXISTS "Tenants can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Tenants can view their own subscriptions" ON public.subscriptions FOR SELECT TO public USING (tenant_id = (SELECT get_my_tenant_id()));

-- Foods
DROP POLICY IF EXISTS "Foods are viewable by authenticated users" ON public.foods;
CREATE POLICY "Foods are viewable by authenticated users" ON public.foods FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "Coaches can insert their own foods" ON public.foods;
CREATE POLICY "Coaches can insert their own foods" ON public.foods FOR INSERT TO authenticated WITH CHECK ((SELECT get_my_role()) = 'coach'::text);

-- Exercises Library
DROP POLICY IF EXISTS "Allow authenticated to read exercises_library" ON public.exercises_library;
CREATE POLICY "Allow authenticated to read exercises_library" ON public.exercises_library FOR SELECT TO authenticated USING (true);

-- Invitations
DROP POLICY IF EXISTS "Coaches can manage invitations for their tenant" ON public.invitations;
CREATE POLICY "Coaches can manage invitations for their tenant" ON public.invitations FOR ALL TO public USING (tenant_id = (SELECT get_my_tenant_id()));
DROP POLICY IF EXISTS "Anyone can read invitation by token" ON public.invitations;
CREATE POLICY "Anyone can read invitation by token" ON public.invitations FOR SELECT TO anon USING (status = 'pending'::text);

-- 5. Final Cleanup of Legacy Policy Names (NAMING MISMATCHES)
DROP POLICY IF EXISTS "coaches_manage_own_tenant" ON public.tenants;
DROP POLICY IF EXISTS "Clients can manage own workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Anyone can read tenant info" ON public.tenants;
DROP POLICY IF EXISTS "public_tenant_read" ON public.tenants;
DROP POLICY IF EXISTS "Super Admins can do everything on tenants" ON public.tenants;
DROP POLICY IF EXISTS "Super Admins can do everything on profiles" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by same tenant" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can see tenant workout logs" ON public.workout_logs;
DROP POLICY IF EXISTS "client_view_appointments" ON public.appointments;
DROP POLICY IF EXISTS "coach_manage_appointments" ON public.appointments;
DROP POLICY IF EXISTS "chat_insert_authenticated" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_select_policy" ON public.chat_messages;
DROP POLICY IF EXISTS "chat_update_own" ON public.chat_messages;
DROP POLICY IF EXISTS "coaches_manage_meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "clients_view_own_meal_plans" ON public.meal_plans;
DROP POLICY IF EXISTS "coaches_manage_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "clients_view_own_exercises" ON public.workout_exercises;
DROP POLICY IF EXISTS "clients_update_exercise_completion" ON public.workout_exercises;
DROP POLICY IF EXISTS "clients_update_workout_status" ON public.workouts;
