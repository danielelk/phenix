const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Demo data
const demoData = {
  // Admin users (Bureau Restreint)
  admins: [
    {
      firstName: "Jean",
      lastName: "Dupont",
      email: "admin@phenix.fr",
      password: "admin123",
      phone: "0612345678",
      role: "admin",
    },
    {
      firstName: "Marie",
      lastName: "Martin",
      email: "marie@phenix.fr",
      password: "marie123",
      phone: "0623456789",
      role: "admin",
    },
  ],

  // Accompagnateurs
  accompagnateurs: [
    {
      firstName: "Pierre",
      lastName: "Dubois",
      email: "pierre@phenix.fr",
      password: "pierre123",
      phone: "0634567890",
      role: "accompagnateur",
      isVehiculed: true,
    },
    {
      firstName: "Sophie",
      lastName: "Leroy",
      email: "sophie@phenix.fr",
      password: "sophie123",
      phone: "0645678901",
      role: "accompagnateur",
      isVehiculed: false,
    },
    {
      firstName: "Lucas",
      lastName: "Moreau",
      email: "lucas@phenix.fr",
      password: "lucas123",
      phone: "0656789012",
      role: "accompagnateur",
      isVehiculed: true,
    },
  ],

  // Adherents
  adherents: [
    {
      firstName: "Emma",
      lastName: "Bernard",
      email: "emma@example.com",
      password: "emma123",
      phone: "0667890123",
      role: "adherent",
      emergencyContactName: "Paul Bernard",
      emergencyContactPhone: "0678901234",
      medicalNotes: "Allergie aux arachides",
    },
    {
      firstName: "Thomas",
      lastName: "Petit",
      email: "thomas@example.com",
      password: "thomas123",
      phone: "0689012345",
      role: "adherent",
      emergencyContactName: "Julie Petit",
      emergencyContactPhone: "0690123456",
      medicalNotes: "Asthmatique",
    },
    {
      firstName: "Léa",
      lastName: "Robert",
      email: "lea@example.com",
      password: "lea123",
      phone: "0701234567",
      role: "adherent",
      emergencyContactName: "Marc Robert",
      emergencyContactPhone: "0712345678",
      medicalNotes: "",
    },
    {
      firstName: "Hugo",
      lastName: "Richard",
      email: "hugo@example.com",
      password: "hugo123",
      phone: "0723456789",
      role: "adherent",
      emergencyContactName: "Anne Richard",
      emergencyContactPhone: "0734567890",
      medicalNotes: "Diabétique",
    },
    {
      firstName: "Chloé",
      lastName: "Simon",
      email: "chloe@example.com",
      password: "chloe123",
      phone: "0745678901",
      role: "adherent",
      emergencyContactName: "David Simon",
      emergencyContactPhone: "0756789012",
      medicalNotes: "",
    },
  ],

  // Activities
  activities: [
    {
      title: "Sortie au parc",
      description: "Balade et pique-nique au parc municipal",
      startDate: new Date(new Date().getTime() + 86400000), // Tomorrow
      endDate: new Date(new Date().getTime() + 86400000 + 10800000), // Tomorrow + 3 hours
      location: "Parc Municipal, Centre-ville",
      type: "with_adherents",
      maxParticipants: 10,
      transportAvailable: true,
      transportCapacity: 8,
    },
    {
      title: "Atelier cuisine",
      description: "Apprentissage de recettes simples et conviviales",
      startDate: new Date(new Date().getTime() + 3 * 86400000), // In 3 days
      endDate: new Date(new Date().getTime() + 3 * 86400000 + 7200000), // In 3 days + 2 hours
      location: "Salle communale, 15 rue des Lilas",
      type: "with_adherents",
      maxParticipants: 8,
      transportAvailable: true,
      transportCapacity: 4,
    },
    {
      title: "Réunion équipe",
      description: "Réunion mensuelle des accompagnateurs",
      startDate: new Date(new Date().getTime() + 5 * 86400000), // In 5 days
      endDate: new Date(new Date().getTime() + 5 * 86400000 + 5400000), // In 5 days + 1.5 hours
      location: "Siège de l'association, 8 avenue des Roses",
      type: "without_adherents",
      maxParticipants: null,
      transportAvailable: false,
      transportCapacity: 0,
    },
    {
      title: "Visite musée",
      description: "Découverte du musée d'histoire naturelle",
      startDate: new Date(new Date().getTime() + 7 * 86400000), // In 7 days
      endDate: new Date(new Date().getTime() + 7 * 86400000 + 10800000), // In 7 days + 3 hours
      location: "Musée d'Histoire Naturelle, 45 rue des Sciences",
      type: "with_adherents",
      maxParticipants: 12,
      transportAvailable: true,
      transportCapacity: 10,
    },
    {
      title: "Formation premiers secours",
      description:
        "Formation aux gestes de premiers secours pour les accompagnateurs",
      startDate: new Date(new Date().getTime() + 10 * 86400000), // In 10 days
      endDate: new Date(new Date().getTime() + 10 * 86400000 + 14400000), // In 10 days + 4 hours
      location: "Centre de formation, 23 rue de la Santé",
      type: "without_adherents",
      maxParticipants: null,
      transportAvailable: false,
      transportCapacity: 0,
    },
  ],
};

// Function to hash password
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 12);
};

// Function to seed the database
const seedDatabase = async () => {
  const client = await pool.connect();

  try {
    // Start transaction
    await client.query("BEGIN");

    console.log("🌱 Starting database seeding...");

    // Clear existing data
    console.log("Clearing existing data...");
    await client.query("DELETE FROM activity_participants");
    await client.query("DELETE FROM activity_accompagnateurs");
    await client.query("DELETE FROM activities");
    await client.query("DELETE FROM users");

    // Insert admins
    console.log("Adding admin users...");
    for (const admin of demoData.admins) {
      const hashedPassword = await hashPassword(admin.password);
      await client.query(
        `
        INSERT INTO users (
          first_name, last_name, email, password, phone, role
        ) VALUES ($1, $2, $3, $4, $5, $6)
      `,
        [
          admin.firstName,
          admin.lastName,
          admin.email,
          hashedPassword,
          admin.phone,
          admin.role,
        ]
      );
    }

    // Insert accompagnateurs
    console.log("Adding accompagnateurs...");
    for (const accompagnateur of demoData.accompagnateurs) {
      const hashedPassword = await hashPassword(accompagnateur.password);
      await client.query(
        `
        INSERT INTO users (
          first_name, last_name, email, password, phone, role, is_vehiculed
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          accompagnateur.firstName,
          accompagnateur.lastName,
          accompagnateur.email,
          hashedPassword,
          accompagnateur.phone,
          accompagnateur.role,
          accompagnateur.isVehiculed,
        ]
      );
    }

    // Insert adherents
    console.log("Adding adherents...");
    for (const adherent of demoData.adherents) {
      const hashedPassword = await hashPassword(adherent.password);
      await client.query(
        `
        INSERT INTO users (
          first_name, last_name, email, password, phone, role, 
          emergency_contact_name, emergency_contact_phone, medical_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
        [
          adherent.firstName,
          adherent.lastName,
          adherent.email,
          hashedPassword,
          adherent.phone,
          adherent.role,
          adherent.emergencyContactName,
          adherent.emergencyContactPhone,
          adherent.medicalNotes,
        ]
      );
    }

    // Insert activities
    console.log("Adding activities...");
    for (const activity of demoData.activities) {
      // Assign first admin as creator
      const createdBy = 1; // First admin

      await client.query(
        `
        INSERT INTO activities (
          title, description, start_date, end_date, location, type, 
          max_participants, transport_available, transport_capacity, created_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          activity.title,
          activity.description,
          activity.startDate,
          activity.endDate,
          activity.location,
          activity.type,
          activity.maxParticipants,
          activity.transportAvailable,
          activity.transportCapacity,
          createdBy,
        ]
      );
    }

    // Add activity participants
    console.log("Adding activity participants...");
    // Activity 1: Add the first 3 adherents
    for (let i = 0; i < 3; i++) {
      const adherentId = 6 + i; // Adherent IDs start at 6
      await client.query(
        `
        INSERT INTO activity_participants (activity_id, user_id, needs_transport)
        VALUES ($1, $2, $3)
      `,
        [1, adherentId, i % 2 === 0]
      ); // Every other adherent needs transport
    }

    // Activity 2: Add adherents 4 and 5
    for (let i = 3; i < 5; i++) {
      const adherentId = 6 + i;
      await client.query(
        `
        INSERT INTO activity_participants (activity_id, user_id, needs_transport)
        VALUES ($1, $2, $3)
      `,
        [2, adherentId, i % 2 === 0]
      );
    }

    // Activity 4: Add all adherents
    for (let i = 0; i < 5; i++) {
      const adherentId = 6 + i;
      await client.query(
        `
        INSERT INTO activity_participants (activity_id, user_id, needs_transport)
        VALUES ($1, $2, $3)
      `,
        [4, adherentId, i % 2 === 0]
      );
    }

    // Add activity accompagnateurs
    console.log("Adding activity accompagnateurs...");
    // Activity 1: Accompagnateurs 1 and 2
    await client.query(
      `
      INSERT INTO activity_accompagnateurs (activity_id, user_id)
      VALUES ($1, $2)
    `,
      [1, 3]
    ); // Pierre
    await client.query(
      `
      INSERT INTO activity_accompagnateurs (activity_id, user_id)
      VALUES ($1, $2)
    `,
      [1, 4]
    ); // Sophie

    // Activity 2: Accompagnateur 3
    await client.query(
      `
      INSERT INTO activity_accompagnateurs (activity_id, user_id)
      VALUES ($1, $2)
    `,
      [2, 5]
    ); // Lucas

    // Activity 3: All accompagnateurs (team meeting)
    for (let i = 3; i <= 5; i++) {
      await client.query(
        `
        INSERT INTO activity_accompagnateurs (activity_id, user_id)
        VALUES ($1, $2)
      `,
        [3, i]
      );
    }

    // Activity 4: Accompagnateurs 1 and 3
    await client.query(
      `
      INSERT INTO activity_accompagnateurs (activity_id, user_id)
      VALUES ($1, $2)
    `,
      [4, 3]
    ); // Pierre
    await client.query(
      `
      INSERT INTO activity_accompagnateurs (activity_id, user_id)
      VALUES ($1, $2)
    `,
      [4, 5]
    ); // Lucas

    // Activity 5: All accompagnateurs (training)
    for (let i = 3; i <= 5; i++) {
      await client.query(
        `
        INSERT INTO activity_accompagnateurs (activity_id, user_id)
        VALUES ($1, $2)
      `,
        [5, i]
      );
    }

    // Commit transaction
    await client.query("COMMIT");

    console.log("✅ Database seeding completed successfully!");
    console.log("\nDemo users:");
    console.log("- Admin: admin@phenix.fr / admin123");
    console.log("- Accompagnateur: pierre@phenix.fr / pierre123");
    console.log("- Adherent: emma@example.com / emma123");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("❌ Error seeding database:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

// Check if seed flag is provided
const args = process.argv.slice(2);
if (args.includes("--seed")) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error("Failed to seed database:", err);
      process.exit(1);
    });
} else {
  console.log("Add the --seed flag to seed the database.");
  console.log("Example: node scripts/seed.js --seed");
  process.exit(0);
}
