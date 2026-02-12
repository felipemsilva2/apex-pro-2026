-- Migração: Correção de Dependência Circular em RLS e Restauração de Visibilidade
-- Data: 2026-02-10

-- 1. Melhorar a robustez das funções auxiliares (SECURITY DEFINER garante acesso bypassando RLS interno se necessário)
CREATE OR REPLACE FUNCTION public.get_my_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid();
$function$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, auth
AS $function$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$function$;

-- 2. Corrigir políticas da tabela profiles (O PONTO CRÍTICO)
-- Primeiro, garantimos que o usuário SEMPRE pode ver o próprio perfil (isso quebra a recursão circular)
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
FOR SELECT TO authenticated 
USING (id = auth.uid());

-- Permitir que coaches vejam perfis do seu próprio tenant (sem usar a função recursiva aqui)
DROP POLICY IF EXISTS "Users can view profiles in their tenant" ON public.profiles;
CREATE POLICY "Users can view profiles in their tenant" ON public.profiles 
FOR SELECT TO authenticated 
USING (
  tenant_id = (SELECT p.tenant_id FROM public.profiles p WHERE p.id = auth.uid())
);

-- 3. Corrigir visibilidade de Clientes (Importante para o Coach)
DROP POLICY IF EXISTS "Coaches can manage tenant clients" ON public.clients;
CREATE POLICY "Coaches can manage tenant clients" ON public.clients 
FOR ALL TO authenticated 
USING (
  (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'coach'::text
  AND 
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);

-- 4. Garantir visibilidade global de Tenants (Necessário para Whitelabel no login/onboarding)
DROP POLICY IF EXISTS "Anyone can select tenants" ON public.tenants;
CREATE POLICY "Anyone can select tenants" ON public.tenants 
FOR SELECT TO public 
USING (true);

-- 5. Otimização de Workout Logs (Comum ter erro de visibilidade aqui também)
DROP POLICY IF EXISTS "Coaches can view their student logs" ON public.workout_logs;
CREATE POLICY "Coaches can view their student logs" ON public.workout_logs 
FOR SELECT TO authenticated 
USING (
  tenant_id = (SELECT tenant_id FROM public.profiles WHERE id = auth.uid())
);
