// src/pages/ChecklistPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../context/MenuContext.jsx";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Order in which we generate pages
const MEAL_ORDER = ["breakfast", "lunch", "snacks", "midnightSnacks", "dinner"];

const MEAL_LABEL = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  snacks: "SNACKS",
  midnightSnacks: "MIDNIGHT SNACKS",
  dinner: "DINNER",
};

export default function ChecklistPage() {
  const { menu, company } = useMenu();
  const navigate = useNavigate();

  if (!menu) {
    return (
      <main>
        <div className="no-print" style={{ marginBottom: 16 }}>
          <button
            className="btn-primary"
            type="button"
            onClick={() => navigate("/upload")}
          >
            ← Upload menu first
          </button>
        </div>
        <p style={{ color: "#e11d48" }}>
          No menu data found. Please go back and upload the Excel file.
        </p>
      </main>
    );
  }

  const orderedDays = DAYS_ORDER.filter((d) => menu[d]);
  const days = orderedDays.length ? orderedDays : Object.keys(menu);

  // Which meals actually have any data?
  const mealsToRender = MEAL_ORDER.filter((key) =>
    Object.values(menu).some(
      (day) => Array.isArray(day?.[key]) && day[key].length > 0
    )
  );

  if (!mealsToRender.length) {
    return (
      <main>
        <div className="no-print" style={{ marginBottom: 16 }}>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => navigate("/upload")}
          >
            ← Back to upload
          </button>
        </div>
        <p style={{ color: "#e11d48" }}>
          No menu items detected for Breakfast / Lunch / Snacks / Midnight Snacks /
          Dinner in this file. Please check the Excel format.
        </p>
      </main>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <main>
      {/* Controls (hidden when printing) */}
      <div
        className="no-print"
        style={{ display: "flex", gap: 12, marginBottom: 12 }}
      >
        <button
          className="btn-ghost"
          type="button"
          onClick={() => navigate("/upload")}
        >
          ← Back to upload
        </button>
        <button className="btn-primary" type="button" onClick={handlePrint}>
          Print / Save as PDF
        </button>
      </div>

      {/* One sheet per meal (will become separate pages when printing) */}
      {mealsToRender.map((mealKey, index) => {
        const label = MEAL_LABEL[mealKey];

        return (
          <div
            key={mealKey}
            className={`print-sheet meal-sheet ${
              index > 0 ? "page-break" : ""
            }`}
          >
            <table className="food-checklist-table">
              <thead>
                {/* Top header row */}
                <tr>
                  <th className="table-header company-cell" colSpan={2}>
                    Company - {company}
                  </th>
                  <th className="table-header title-cell" colSpan={2}>
                    <span className="food-badge">FOOD CHECK-LIST</span>
                  </th>
                  <th className="table-header brand-cell">
                    <div>BHOOK</div>
                    <div className="brand-sub">
                      Chemical Free Food Experience
                    </div>
                  </th>
                </tr>

                {/* Second header row */}
                <tr>
                  <th className="date-head">Date</th>
                  <th className="menu-head" colSpan={3}>
                    {company} * {label} *
                  </th>
                  <th className="wastage-head">Wastage</th>
                </tr>
              </thead>

              <tbody>
                {days.map((dayKey) => {
                  const items = (menu[dayKey]?.[mealKey] || []).filter(Boolean);
                  if (!items.length) return null; // skip day with no items

                  const columnCount = 3;
                  const chunkSize = Math.ceil(items.length / columnCount) || 1;

                  const cols = [];
                  for (let c = 0; c < columnCount; c++) {
                    cols.push(items.slice(c * chunkSize, (c + 1) * chunkSize));
                  }

                  const rowsCount = chunkSize;

                  return (
                    <React.Fragment key={`${mealKey}-${dayKey}`}>
                      {Array.from({ length: rowsCount }).map((_, rowIndex) => (
                        <tr key={`${mealKey}-${dayKey}-row-${rowIndex}`}>
                          {/* Date cell spans all rows + footer row */}
                          {rowIndex === 0 && (
                            <td className="date-cell" rowSpan={rowsCount + 1}>
                              {dayKey}
                            </td>
                          )}

                          {/* 3 columns of menu items */}
                          {cols.map((col, colIndex) => (
                            <td key={colIndex} className="item-col">
                              {col[rowIndex] ? (
                                <label className="item-label">
                                  <input
                                    type="checkbox"
                                    className="item-checkbox"
                                  />
                                  <span>{col[rowIndex]}</span>
                                </label>
                              ) : null}
                            </td>
                          ))}

                          {/* Wastage cell spans all rows + footer row */}
                          {rowIndex === 0 && (
                            <td
                              className="wastage-cell"
                              rowSpan={rowsCount + 1}
                            >
                              {/* small box to write wastage */}
                            </td>
                          )}
                        </tr>
                      ))}

                      {/* Footer row */}
                      <tr className="footer-row">
                        <td className="footer-cell" colSpan={4}>
                          Time: __________________&nbsp;&nbsp;&nbsp;
                          Handler: __________________&nbsp;&nbsp;&nbsp;
                          Supervisor: __________________
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      })}
    </main>
  );
}
