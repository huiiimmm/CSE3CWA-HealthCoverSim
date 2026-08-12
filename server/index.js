const express = require("express");
const cors = require("cors");

const app = express();
const BACKEND_PORT = 5000;

const db = require("./db");

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend running!"
    });
});

app.listen(BACKEND_PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${BACKEND_PORT}`);
});
app.get("/hospital_tiers", (req,res)=>{

    db.all(
        "SELECT * FROM hospital_tiers",
        [],
        (err, rows)=>{
            if(err){
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});

app.get("/extra_tiers", (req,res)=>{
    db.all(
        "SELECT * FROM extra_tiers",
        [],
        (err, rows)=>{
            if(err){
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});

app.get("/family_coverage", (req,res)=>{
    db.all(
        "SELECT * FROM family_coverage",
        [],
        (err, rows)=>{
            if(err){
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );
});

app.get("/user_selections", (req,res)=>{
    db.all(
        "SELECT * FROM user_selections",
        [],
        (err, rows)=>{
            if(err){
                return res.status(500).json(err);
            }
            res.json(rows);
        }
    );

});

app.post("/save-record", (req, res) => {
  const {
	customerName,
	selectedFamilyCoverage,
	applicant1Age,
	applicant1CoverHistory,
	applicant2Age,
	applicant2CoverHistory,
	selectedHospitalTier,
	selectedExtraTier,
	selectedPaymentFrequency
  } = req.body;
  
  const sqlQuery = `
	INSERT INTO user_selections
	(customer_name, cover_type, applicant1_age, applicant_1_cover_history, applicant_2_age, applicant_2_cover_history, hospital_cover, extras_cover, payment_frequency)
	VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const valuesInput = [
	customerName,
	selectedFamilyCoverage,
	parseInt(applicant1Age, 10),
	applicant1CoverHistory,
	applicant2Age === '' ? null : parseInt(applicant2Age, 10),
	applicant2CoverHistory === '' ? null : applicant2CoverHistory,
	selectedHospitalTier,
	selectedExtraTier,
	selectedPaymentFrequency
  ];

  db.run(sqlQuery, valuesInput, function (error) {
  if (error) {
	console.error("Database tracking failure:", error);
	return res.status(500).json({ error: "failed to save data" });
  }
  res.status(200).json({ 
	message: "policy saved successfully!", 
	record: {
	  id: this.lastID, 
	  customerName,
          selectedFamilyCoverage,
          applicant1Age,
          applicant1CoverHistory,
          applicant2Age,
          applicant2CoverHistory,
          selectedHospitalTier,
          selectedExtraTier,
          selectedPaymentFrequency
	}
	});
  });
});
