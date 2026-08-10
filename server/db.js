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
    CREATE TABLE IF NOT EXISTS users(
      id INTEGER PRIMARY KEY AUTOINCREMENT, 
      name TEXT, 
      email TEXT
    );
    CREATE TABLE IF NOT EXISTS hospital_tiers(
      hospital_cover TEXT, 
      pp_adult INTEGER
    );
    CREATE TABLE IF NOT EXISTS extra_tiers(
      extras_cover TEXT, 
      pp_adult INTEGER
    );
    CREATE TABLE IF NOT EXISTS family_coverage(
      cover_type TEXT, 
      adults_count INTEGER, 
      upgrade_fee INTEGER
    );
    CREATE TABLE IF NOT EXISTS lhc_loading(
      cover_history TEXT,
      lhc_loading FLOAT
    );
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
    );`);
});

module.exports = db;
