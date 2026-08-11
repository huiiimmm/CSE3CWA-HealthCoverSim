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
