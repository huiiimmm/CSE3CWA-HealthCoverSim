const sqlite3 = require("sqlite3").verbose();
const path = require('path');

const db = new sqlite3.Database("./database.db", (err) => {
  if (err) {
    console.error("Database connection failed:", err.message);
  } else {
    console.log("Connected to SQLite database");
  }
});

db.serialize(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS hospital_tiers(
      hospital_cover TEXT, 
      pp_adult INTEGER
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_hospital_tiers
    ON hospital_tiers (hospital_cover);
    INSERT OR IGNORE INTO hospital_tiers(hospital_cover, pp_adult)
    VALUES ('none', 0),
	   ('basic', 90),
	   ('bronze', 120),
	   ('silver', 160),
	   ('gold', 220);

    CREATE TABLE IF NOT EXISTS extra_tiers(
      extras_cover TEXT, 
      pp_adult INTEGER
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_extra_tiers
    ON extra_tiers (extras_cover);
    INSERT OR IGNORE INTO extra_tiers(extras_cover, pp_adult)
    VALUES ('none', 0),
	   ('basic', 25),
	   ('standard', 45),
	   ('premium', 70);

    CREATE TABLE IF NOT EXISTS family_coverage(
      cover_type TEXT, 
      adults_count INTEGER, 
      upgrade_fee INTEGER
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_family_coverage
    ON family_coverage (cover_type);
    INSERT OR IGNORE INTO family_coverage(cover_type, adults_count, upgrade_fee)
    VALUES ('single', 1, 0),
	   ('couple', 2, 0),
	   ('family', 2, 30);

    CREATE TABLE IF NOT EXISTS user_selections (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	customer_name TEXT NOT NULL,
	cover_type TEXT NOT NULL,
	applicant1_age INTEGER NOT NULL,
	applicant_1_cover_history TEXT NOT NULL,
	applicant_2_age INTEGER,
	applicant_2_cover_history TEXT, 
	hospital_cover TEXT NOT NULL,
	extras_cover TEXT NOT NULL,
	payment_frequency TEXT NOT NULL,
	annual_discount REAL DEFAULT 0.0,
	notes TEXT,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE UNIQUE INDEX IF NOT EXISTS unique_user_selections
    ON user_selections (id);

    `, (e) => {
	if (e) console.error("Databse Initialization failed: ", e.message);
});
});

module.exports = db;
