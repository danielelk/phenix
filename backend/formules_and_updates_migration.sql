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

-- Ajout de colonnes à la table adherents
ALTER TABLE adherents 
ADD COLUMN IF NOT EXISTS genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100),
ADD COLUMN IF NOT EXISTS formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS est_benevole BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_sport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_loisirs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS autorisation_image BOOLEAN DEFAULT FALSE;

-- Ajout des formules par défaut
INSERT INTO formules (titre, description, prix) 
VALUES 
('Formule Standard', 'Accès aux activités régulières de l''association', 150.00),
('Formule Loisirs', 'Accès aux sorties loisirs et événements spéciaux', 100.00),
('Formule Complète', 'Accès à toutes les activités (sport et loisirs)', 200.00)
ON CONFLICT DO NOTHING;

-- Mise à jour de la table membership_requests pour inclure les nouveaux champs
ALTER TABLE membership_requests 
ADD COLUMN IF NOT EXISTS genre VARCHAR(10) CHECK (genre IN ('masculin', 'feminin')),
ADD COLUMN IF NOT EXISTS nationalite VARCHAR(100),
ADD COLUMN IF NOT EXISTS formule_id INTEGER REFERENCES formules(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS est_benevole BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_sport BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS inscription_loisirs BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS autorisation_image BOOLEAN DEFAULT FALSE;

-- Ajout d'un type d'activité "BR" (Bureau Restreint)
ALTER TABLE activities
DROP CONSTRAINT IF EXISTS activities_type_check;

ALTER TABLE activities
ADD CONSTRAINT activities_type_check 
CHECK (type IN ('with_adherents', 'without_adherents', 'br'));