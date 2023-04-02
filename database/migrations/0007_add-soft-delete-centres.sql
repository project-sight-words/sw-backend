-- Add soft delete for centres

ALTER TABLE centres
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deleted_by UUID REFERENCES users (id);

-- Add soft delete for classes

ALTER TABLE classes
ADD COLUMN deleted_at TIMESTAMPTZ,
ADD COLUMN deleted_by UUID REFERENCES users (id);
