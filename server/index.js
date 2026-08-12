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

app.get("/user_selections/:id", (req,res)=>{
    const { id } = req.params;
    db.get(
	`
	SELECT
	  id,
	  customer_name,
	  cover_type,
	  applicant1_age,
	  applicant_1_cover_history,
	  applicant_2_age,
	  applicant_2_cover_history,
	  hospital_cover,
	  extras_cover,
	  payment_frequency,
	  annual_discount,
	  notes,
	  created_at
	FROM user_selections
	WHERE id =?
	`,
	[id],
	(error, row) => {
	  if (error) {
		console.error("failed to retrieve quote:", error);

		return res.status(500).json({
		  error: "Failed to retrieve quote",
		});
	  }
	  if (!row) {
		return res.status(404).json({
		  error: "Quote not found",
	  });
	}
	res.json(row);
	}
    );
  });

app.put("/user_selections/:id", (req, res) => {
  const { id } = req.params;

  const {
    customer_name,
    cover_type,
    applicant1_age,
    applicant_1_cover_history,
    applicant_2_age,
    applicant_2_cover_history,
    hospital_cover,
    extras_cover,
    payment_frequency,
    annual_discount,
    notes,
  } = req.body;

  if (
    !customer_name ||
    !cover_type||
    !applicant1_age ||
    !applicant_1_cover_history ||
    !hospital_cover ||
    !extras_cover ||
    !payment_frequency
  )  {

    return res.status(400).json({
	error: "missing required data fields",
    });
  }

  const age1 = Number(applicant1_age);
  if (!Number.isInteger(age1) || age1 < 18 || age1 > 100) {

    return res.status(400).json({
	error: "Applicant 1 age must be between 18 and 100",
    });
  }

  const isTwoAdultCover = cover_type.toLowerCase() === "couple" || cover_type.toLowerCase() === "family";
  let age2 = null;
  let history2 = null;

  if (isTwoAdultCover) {
    age2 = Number(applicant_2_age);

  if (!Number.isInteger(age2) || age2 < 18 || age2 > 100) {

    return res.status(400).json({
	error: "Applicant 2 age must be between 18 and 100",
    });
  }

  if (!applicant_2_cover_history) {

    return res.status(400).json({
	error: "Applicant 2 cover history is required",
    });
  }

  history2 = applicant_2_cover_history.trim().toLowerCase();
  }

  const discount = Number(annual_discount) || 0;
  if (discount < 0 || discount > 10) {

    return res.status(400).json({
	error: "Annual discount must be between 0 and 10",
    });
  }

  db.run(
    `
    UPDATE user_selections
    SET
	customer_name = ?,
	cover_type = ?,
	applicant1_age = ?,
	applicant_1_cover_history = ?,
	applicant_2_age = ?,
	applicant_2_cover_history = ?,
	hospital_cover = ?,
	extras_cover = ?,
	payment_frequency = ?,
	annual_discount = ?,
	notes = ?
    WHERE id = ?
    `,
    [
	customer_name.trim(),
	cover_type.trim().toLowerCase(),
	age1,
	applicant_1_cover_history.trim().toLowerCase(),
	age2,
	history2,
	hospital_cover.trim().toLowerCase(),
	extras_cover.trim().toLowerCase(),
	payment_frequency.trim().toLowerCase(),
	discount,
	notes ? notes.trim() : null,
	id,
    ],
    function (error) {
	if (error) {
	  console.error("Failed to update quote:", error);

	  return res.status(500).json({
	    error: "Failed to update quote",
	  });
	}

	if (this.changes ===0) {

	  return res.status(404).json({
	    error: "quote not found",
	  });
	}

	db.get(
	  `
	  SELECT
		id,
		customer_name,
		cover_type,
		applicant1_age,
		applicant_1_cover_history,
		applicant_2_age,
		applicant_2_cover_history,
		hospital_cover,
		extras_cover,
		payment_frequency,
		annual_discount,
		notes,
		created_at
	    FROM user_selections
	    WHERE id = ?
	    `,
	    [id],
	    (selectError, updatedQuote) => {

		if (selectError) {
		  console.error(
		    "Quote updated but could not be retrieved",
		    selectError
		  );

		return res.status(500).json({
		  error: "Quote updated but could not be retrieved",
		});
	    }
	    res.json(updatedQuote);
	    }
	  );
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

    const insertedId = this.lastID;

    db.get(
      `SELECT * FROM user_selections WHERE id = ?`,
      [insertedId],
      (selectError, row) => {

        if (selectError) {
          console.error("Failed to fetch saved record:", selectError);
          return res.status(500).json({ error: "failed to load saved record" });
        }

        res.status(200).json({
          message: "policy saved successfully!",
          record: row,
        });
      }
    );
  });
});
