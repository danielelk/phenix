ALTER TABLE activities 
ADD COLUMN is_paid BOOLEAN DEFAULT FALSE,
ADD COLUMN price DECIMAL(10, 2) DEFAULT 0.00;