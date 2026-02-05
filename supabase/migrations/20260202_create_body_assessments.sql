-- Migration: Create body_assessments table
-- Description: Stores body composition assessments for clients
-- Professional can create/edit, clients can view their own

-- Create table
CREATE TABLE IF NOT EXISTS body_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Assessment date
    assessment_date DATE NOT NULL,
    
    -- Essential metrics
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,2),
    lean_mass_kg DECIMAL(5,2),
    fat_mass_kg DECIMAL(5,2),
    bmi DECIMAL(4,2),
    
    -- Circumferences (cm)
    waist_cm DECIMAL(5,2),
    hip_cm DECIMAL(5,2),
    arm_cm DECIMAL(5,2),
    thigh_cm DECIMAL(5,2),
    chest_cm DECIMAL(5,2),
    
    -- Calculated ratios
    waist_hip_ratio DECIMAL(4,3),
    
    -- Professional notes
    notes TEXT,
    
    -- Goals (optional)
    target_weight_kg DECIMAL(5,2),
    target_body_fat_percentage DECIMAL(4,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_body_assessments_client ON body_assessments(client_id);
CREATE INDEX idx_body_assessments_date ON body_assessments(assessment_date DESC);
CREATE INDEX idx_body_assessments_tenant ON body_assessments(tenant_id);

-- Enable RLS
ALTER TABLE body_assessments ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Professionals can view their clients' assessments
CREATE POLICY "Professionals can view their clients assessments"
ON body_assessments FOR SELECT
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- RLS Policy: Professionals can create/update/delete their clients' assessments
CREATE POLICY "Professionals can manage their clients assessments"
ON body_assessments FOR ALL
USING (
    tenant_id IN (
        SELECT tenant_id FROM profiles WHERE id = auth.uid()
    )
);

-- RLS Policy: Clients can view their own assessments
CREATE POLICY "Clients can view their own assessments"
ON body_assessments FOR SELECT
USING (
    client_id IN (
        SELECT id FROM clients WHERE user_id = auth.uid()
    )
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_body_assessments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER body_assessments_updated_at
BEFORE UPDATE ON body_assessments
FOR EACH ROW
EXECUTE FUNCTION update_body_assessments_updated_at();
