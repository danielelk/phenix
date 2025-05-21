-- Table pour les formules d'adhésion
CREATE TABLE IF NOT EXISTS formules (
  id SERIAL PRIMARY KEY,
  titre VARCHAR(100) NOT NULL,
  description TEXT,
  prix DECIMAL(10, 2) NOT NULL,
  est_actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ajout des formules par défaut
INSERT INTO formules (titre, description, prix) 
VALUES 
('Formule Standard', 'Accès aux activités régulières de l''association', 150.00),
('Formule Loisirs', 'Accès aux sorties loisirs et événements spéciaux', 100.00),
('Formule Complète', 'Accès à toutes les activités (sport et loisirs)', 200.00)
ON CONFLICT DO NOTHING;

-- Ajouter des champs à la table membership_requests si elle existe déjà
ALTER TABLE membership_requests 
ADD COLUMN IF NOT EXISTS formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100),
ADD COLUMN IF NOT EXISTS est_benevole BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_sport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_loisirs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS autorisation_image BOOLEAN DEFAULT FALSE;

-- Ajouter des champs à la table adherents si elle existe déjà
ALTER TABLE adherents 
ADD COLUMN IF NOT EXISTS genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100),
ADD COLUMN IF NOT EXISTS formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS est_benevole BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_sport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_loisirs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS autorisation_image BOOLEAN DEFAULT FALSE;

-- Ajouter le champ type à la table activities pour supporter le BR
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_type_check;

ALTER TABLE activities
ADD CONSTRAINT activities_type_check 
CHECK (type IN ('with_adherents', 'without_adherents', 'br'));

-- Mise à jour de la table recurring_activities aussi
ALTER TABLE recurring_activities
DROP CONSTRAINT IF EXISTS recurring_activities_type_check;

ALTER TABLE recurring_activities
ADD CONSTRAINT recurring_activities_type_check 
CHECK (type IN ('with_adherents', 'without_adherents', 'br'));

-- Créer un index sur la table formules pour des recherches plus rapides
CREATE INDEX IF NOT EXISTS idx_formules_est_actif ON formules(est_actif);

-- Ajouter un index sur le champ formule_id des tables qui y font référence
CREATE INDEX IF NOT EXISTS idx_membership_requests_formule_id ON membership_requests(formule_id);
CREATE INDEX IF NOT EXISTS idx_adherents_formule_id ON adherents(formule_id);