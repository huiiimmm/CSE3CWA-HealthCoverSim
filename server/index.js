const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

const db = require("./db");


app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Backend running!"
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
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
    );`);
});

app.post("/users", (req, res) => {

    const { name, email } = req.body;

    db.run(
        "INSERT INTO users(name,email) VALUES(?,?)",
        [name, email],
        function(err){

            if(err){
                return res.status(500).json(err);
            }

            res.json({
                id: this.lastID
            });

        }
    );

});

app.get("/users", (req,res)=>{

    db.all(
        "SELECT * FROM users",
        [],
        (err, rows)=>{

            if(err){
                return res.status(500).json(err);
            }

            res.json(rows);

        }
    );

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

