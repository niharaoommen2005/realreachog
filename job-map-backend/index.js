const express = require("express");
const fs = require("fs");
const csv = require("csv-parser");
const cors = require("cors");
const { Parser } = require("json2csv");

const app = express();
app.use(cors());
app.use(express.json()); // needed for POST body parsing

const CSV_FILE = "jobs.csv";

// --- Endpoint: get all jobs ---
app.get("/jobs", (req, res) => {
  const results = [];
  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => results.push(data))
    .on("end", () => res.json(results));
});

// --- Endpoint: add new job ---
app.post("/add-job", (req, res) => {
  const newJob = req.body;
  const jobs = [];

  fs.createReadStream(CSV_FILE)
    .pipe(csv())
    .on("data", (data) => jobs.push(data))
    .on("end", () => {
      jobs.push(newJob); // add new job
      const parser = new Parser({ fields: Object.keys(newJob) });
      const csvData = parser.parse(jobs);
      fs.writeFileSync(CSV_FILE, csvData);
      res.json(newJob);
    });
});

// --- Start server ---
const PORT = 3000;
app.listen(PORT, () =>
  console.log(`🚀 Backend running on http://localhost:${PORT}`)
);
