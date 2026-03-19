const express = require("express");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

function parseCsvLine(line) {
  // Minimal CSV parser that supports quoted fields.
  const out = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }

    if (ch === ',') {
      out.push(cur);
      cur = "";
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    cur += ch;
  }

  out.push(cur);
  return out;
}

function coerceValue(key, value) {
  if (value === null || value === undefined) return value;
  const trimmed = String(value).trim();

  if (["clock_in_hour", "clock_out_hour", "anomaly_flag"].includes(key)) {
    const n = Number.parseInt(trimmed, 10);
    return Number.isNaN(n) ? trimmed : n;
  }

  if (key === "shift_length") {
    const n = Number.parseFloat(trimmed);
    return Number.isNaN(n) ? trimmed : n;
  }

  return trimmed;
}

function readAnomalyResultsCsv(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return { results: [], anomalies: [] };
  }

  const raw = fs.readFileSync(csvPath, "utf8");
  const lines = raw.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return { results: [], anomalies: [] };
  }

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const results = [];

  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      const key = headers[j];
      row[key] = coerceValue(key, cols[j] ?? "");
    }
    results.push(row);
  }

  const anomalies = results.filter((r) => r.anomaly_flag === -1);
  return { results, anomalies };
}

function runPythonAnomalyScan({ mainCodeDir, scriptPath, pythonBin, source }) {
  return new Promise((resolve, reject) => {
    const args = [scriptPath, "--source", source];

    const child = spawn(pythonBin, args, {
      cwd: mainCodeDir,
      env: process.env,
      windowsHide: true
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (d) => {
      stdout += d.toString();
    });

    child.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    child.on("error", (err) => reject(err));

    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
      } else {
        const err = new Error(`AI scan failed (exit code ${code}).`);
        err.stdout = stdout;
        err.stderr = stderr;
        reject(err);
      }
    });
  });
}

// Admin-only: run scan now
router.get("/run", authMiddleware, async (req, res) => {
  const mainCodeDir = path.resolve(__dirname, "..", "..");
  const scriptPath = path.join(mainCodeDir, "AI", "anomaly_detection.py");
  const csvPath = path.join(mainCodeDir, "AI", "anomaly_results.csv");

  const pythonBin = process.env.PYTHON_BIN || "python";
  const source = (req.query.source || "offchain").toString();

  try {
    if (!fs.existsSync(scriptPath)) {
      return res.status(500).json({
        message: "AI script not found",
        expectedPath: scriptPath
      });
    }

    const execResult = await runPythonAnomalyScan({
      mainCodeDir,
      scriptPath,
      pythonBin,
      source
    });

    const { results, anomalies } = readAnomalyResultsCsv(csvPath);

    return res.json({
      message: "AI anomaly scan complete",
      ranAt: new Date().toISOString(),
      source,
      pythonBin,
      results,
      anomalies,
      stdout: req.query.debug ? execResult.stdout : undefined,
      stderr: req.query.debug ? execResult.stderr : undefined
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message || "AI scan error",
      stderr: err.stderr,
      stdout: err.stdout
    });
  }
});

// Admin-only: read last saved results without rerunning
router.get("/latest", authMiddleware, roleMiddleware("admin"), async (req, res) => {
  const mainCodeDir = path.resolve(__dirname, "..", "..");
  const csvPath = path.join(mainCodeDir, "AI", "anomaly_results.csv");

  const { results, anomalies } = readAnomalyResultsCsv(csvPath);

  if (results.length === 0) {
    return res.status(404).json({
      message: "No anomaly results found yet. Run /api/anomaly/run first.",
      csvPath
    });
  }

  return res.json({
    message: "Latest anomaly results",
    csvPath,
    results,
    anomalies
  });
});

module.exports = router;
