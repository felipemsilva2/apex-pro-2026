-- Asaas Integration Schema

-- 1. Update tenants table with billing fields
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS billing_email TEXT;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trialing';
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS overdue_since TIMESTAMP WITH TIME ZONE;
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '30 days');

-- 2. Table for Billing Plans
CREATE TABLE IF NOT EXISTS billing_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10, 2) NOT NULL,
    price_yearly NUMERIC(10, 2) NOT NULL,
    asaas_plan_id_monthly TEXT, -- Asaas external ID for monthly
    asaas_plan_id_yearly TEXT,  -- Asaas external ID for yearly
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Seed initial plans
INSERT INTO billing_plans (name, description, price_monthly, price_yearly)
VALUES (
    'ApexPRO Completo', 
    'Acesso total ao ecossistema: Treinos, Dietas, Protocolos e App Nativo.', 
    39.90, 
    382.80
) ON CONFLICT DO NOTHING;

-- 3. Table for Asaas Customers (Mapping Tenants to Asaas)
CREATE TABLE IF NOT EXISTS asaas_customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    asaas_id TEXT NOT NULL UNIQUE, -- The 'cus_...' ID from Asaas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(tenant_id)
);

-- 4. Table for Subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES billing_plans(id),
    asaas_id TEXT NOT NULL UNIQUE, -- The 'sub_...' ID from Asaas
    status TEXT NOT NULL, -- active, overdue, deleted
    billing_type TEXT NOT NULL, -- MENSAL, ANUAL
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. RLS Policies
ALTER TABLE billing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE asaas_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Allow coaches/admins to view plans
CREATE POLICY "Anyone can view active plans" ON billing_plans
    FOR SELECT USING (active = true);

-- Coaches can view their own customer info
CREATE POLICY "Tenants can view their own asaas customer info" ON asaas_customers
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = asaas_customers.tenant_id
        )
    );

-- Coaches can view their own subscriptions
CREATE POLICY "Tenants can view their own subscriptions" ON subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.tenant_id = subscriptions.tenant_id
        )
    );

-- Admin HQ can manage everything (if needed, but for now focus on coach access)
