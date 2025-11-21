// src/pages/UploadMenu.jsx
import { useState } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../context/MenuContext.jsx";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function UploadMenu() {
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const { setMenu, company, setCompany } = useMenu();
  const navigate = useNavigate();

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError("");

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        const parsed = parseMenu(rows);
        setMenu(parsed);

        console.log("PARSED MENU:", parsed);
      } catch (err) {
        console.error(err);
        setError("Error: Excel file format issue. Please re-check the template.");
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // SAFEST POSSIBLE PARSER
  const parseMenu = (rows) => {
    const menu = {};
    DAYS.forEach((d) => {
      menu[d] = {
        breakfast: [],
        lunch: [],
        snacks: [],
        midnightSnacks: [],
        dinner: [],
      };
    });

    let currentMealKey = null;
    let dayIndex = null;

    const detectMealKey = (value) => {
      if (!value) return null;
      const v = String(value).toLowerCase();

      if (v.includes("breakfast")) return "breakfast";
      if (v.includes("lunch")) return "lunch";
      if (v.includes("snack")) return "snacks"; // includes evening snacks
      if (v.includes("midnight")) return "midnightSnacks";
      if (v.includes("dinner")) return "dinner";
      return null;
    };

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r] || [];

      const cleanRow = row.map((x) =>
        x === undefined || x === null ? "" : String(x).trim()
      );

      const anyNonEmpty = cleanRow.some((v) => v !== "");
      if (!anyNonEmpty) continue;

      // 1) Detect DAY HEADER ROW
      const maybeDayIndex = {};
      DAYS.forEach((day) => {
        const idx = cleanRow.findIndex((v) => v && v.toLowerCase() === day.toLowerCase());
        if (idx !== -1) maybeDayIndex[day] = idx;
      });

      if (Object.keys(maybeDayIndex).length > 0) {
        dayIndex = maybeDayIndex;
        continue;
      }

      // 2) Detect MEAL SECTION
      cleanRow.forEach((cell) => {
        const mk = detectMealKey(cell);
        if (mk) currentMealKey = mk;
      });

      // 3) Extract data rows
      if (currentMealKey && dayIndex) {
        DAYS.forEach((day) => {
          const col = dayIndex[day];
          if (col === undefined) return;

          const cell = cleanRow[col];
          if (!cell) return;

          const items = cell
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);

          menu[day][currentMealKey].push(...items);
        });
      }
    }

    return menu;
  };

  const handleGenerate = () => {
    if (!fileName) {
      setError("Please upload the weekly menu Excel file first.");
      return;
    }
    navigate("/checklist");
  };

  return (
    <main>
      <section className="section-card">
        <div className="section-title">
          <span>Upload weekly menu</span>
          <span className="badge">Mon – Sun · Breakfast → Dinner</span>
        </div>

        <p className="section-subtitle">
          Select the company and upload the Excel menu.
        </p>

        {/* Company Name */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 13 }}>
            Company name
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              style={{
                marginLeft: 8,
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #4b5563",
                background: "#020617",
                color: "#f9fafb",
              }}
              placeholder="e.g. Red-Brick, Lumen"
            />
          </label>
        </div>

        {/* Upload */}
        <div className="upload-area">
          <div style={{ fontSize: 13 }}>Upload the .xlsx menu file.</div>

          <input type="file" accept=".xlsx,.xls" onChange={handleFile} />

          {fileName && <div className="file-meta">File: {fileName}</div>}

          {error && <div style={{ color: "#f97373", marginTop: 8 }}>{error}</div>}
        </div>

        <div className="actions-row">
          <button className="btn-primary" onClick={handleGenerate}>
            Generate checklists →
          </button>
        </div>
      </section>
    </main>
  );
}
