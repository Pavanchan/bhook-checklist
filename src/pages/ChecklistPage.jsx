// src/pages/ChecklistPage.jsx
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMenu } from "../context/MenuContext.jsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const DAYS_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const MEAL_ORDER = ["breakfast", "lunch", "snacks", "midnightSnacks", "dinner"];

const MEAL_LABEL = {
  breakfast: "BREAKFAST",
  lunch: "LUNCH",
  snacks: "SNACKS",
  midnightSnacks: "MIDNIGHT SNACKS",
  dinner: "DINNER",
};

export default function ChecklistPage() {
  const { menu, company, setMenu } = useMenu();
  const navigate = useNavigate();
  const wrapperRef = useRef(null); // contains all sheets

  // ---- Edit mode state ----
  const [isEditing, setIsEditing] = useState(false);
  const [localMenu, setLocalMenu] = useState(menu);

  // keep local copy in sync if menu changes from elsewhere
  useEffect(() => {
    setLocalMenu(menu);
  }, [menu]);

  // use localMenu while editing, otherwise the original menu
  const effectiveMenu = isEditing ? localMenu : menu;

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

  const orderedDays = DAYS_ORDER.filter((d) => effectiveMenu[d]);
  const days = orderedDays.length ? orderedDays : Object.keys(effectiveMenu);

  // Which meals actually have data?
  const mealsToRender = MEAL_ORDER.filter((key) =>
    Object.values(effectiveMenu).some(
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

  // ---- Editing helpers ----
  const handleItemChange = (dayKey, mealKey, itemIndex, newValue) => {
    setLocalMenu((prev) => {
      const day = { ...(prev[dayKey] || {}) };
      const items = [...(day[mealKey] || [])];
      items[itemIndex] = newValue;
      day[mealKey] = items;
      return { ...prev, [dayKey]: day };
    });
  };

  const startEditing = () => {
    setLocalMenu(menu); // just in case
    setIsEditing(true);
  };

  const saveEditing = () => {
    setMenu(localMenu);
    setIsEditing(false);
  };

  const cancelEditing = () => {
    setLocalMenu(menu);
    setIsEditing(false);
  };

  // ---- Download ALL sheets as a single tall PNG ----
 // Download EACH meal sheet as its own PNG
const handleDownloadImage = async () => {
  if (!wrapperRef.current) return;

  try {
    const sheets = wrapperRef.current.querySelectorAll(".meal-sheet");

    if (!sheets.length) {
      alert("No sheets found to export.");
      return;
    }

    for (let i = 0; i < sheets.length; i++) {
      const sheet = sheets[i];

      // meal key from data attribute (breakfast / lunch / snacks / dinner)
      const mealKey = sheet.getAttribute("data-meal") || `sheet-${i + 1}`;
      const mealLabel = MEAL_LABEL[mealKey] || `SHEET-${i + 1}`;

      const canvas = await html2canvas(sheet, {
        scale: 2,
        useCORS: true,
      });

      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${company || "bhook"}-${mealLabel
        .toLowerCase()
        .replace(/\s+/g, "-")}.png`;
      link.click();
    }
  } catch (err) {
    console.error("PNG export failed:", err);
    alert("Could not generate images. Please try again.");
  }
};


  // ---- Download each sheet as one page in a PDF ----
  const handleDownloadPDF = async () => {
    if (!wrapperRef.current) return;

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const sheets = wrapperRef.current.querySelectorAll(".meal-sheet");
      if (!sheets.length) return;

      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];

        const canvas = await html2canvas(sheet, {
          scale: 2,
          useCORS: true,
        });
        const imgData = canvas.toDataURL("image/png");

        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const y = Math.max(0, (pageHeight - imgHeight) / 2);

        pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);

        if (i < sheets.length - 1) {
          pdf.addPage();
        }
      }

      pdf.save(`${company || "bhook"}-food-checklist.pdf`);
    } catch (err) {
      console.error("PDF export failed:", err);
      alert("Could not generate PDF. Please try again.");
    }
  };

  return (
    <main>
      {/* Controls (never printed) */}
      <div
        className="no-print"
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <button
          className="btn-ghost"
          type="button"
          onClick={() => navigate("/upload")}
        >
          ← Back to upload
        </button>

        {/* Edit controls */}
        {!isEditing ? (
          <button className="btn-ghost" type="button" onClick={startEditing}>
            ✏️ Edit items
          </button>
        ) : (
          <>
            <button className="btn-primary" type="button" onClick={saveEditing}>
              ✅ Save changes
            </button>
            <button className="btn-ghost" type="button" onClick={cancelEditing}>
              ✖ Cancel
            </button>
          </>
        )}

        {/* Export controls – disabled while editing */}
        <button
          className="btn-primary"
          type="button"
          onClick={handlePrint}
          disabled={isEditing}
          style={isEditing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
        >
          Print / Save as PDF (Browser)
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={handleDownloadPDF}
          disabled={isEditing}
          style={isEditing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
        >
          Download PDF
        </button>
        <button
          className="btn-ghost"
          type="button"
          onClick={handleDownloadImage}
          disabled={isEditing}
          style={isEditing ? { opacity: 0.6, cursor: "not-allowed" } : {}}
        >
          Download as Image (PNG)
        </button>
      </div>

      {/* Wrapper captured for PNG/PDF */}
      <div ref={wrapperRef}>
        {mealsToRender.map((mealKey, index) => {
          const label = MEAL_LABEL[mealKey];

          return (
                <div
      key={mealKey}
      className={`print-sheet meal-sheet ${
        index > 0 ? "page-break" : ""
      }`}
      data-meal={mealKey}
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
                    const items = effectiveMenu[dayKey]?.[mealKey] || [];
                    if (!items.length) return null;

                    const columnCount = 3;
                    const chunkSize =
                      Math.ceil(items.length / columnCount) || 1;

                    const rowsCount = chunkSize;

                    return (
                      <React.Fragment key={`${mealKey}-${dayKey}`}>
                        {Array.from({ length: rowsCount }).map(
                          (_, rowIndex) => (
                            <tr
                              key={`${mealKey}-${dayKey}-row-${rowIndex}`}
                            >
                              {/* Date cell spans all rows + footer row */}
                              {rowIndex === 0 && (
                                <td
                                  className="date-cell"
                                  rowSpan={rowsCount + 1}
                                >
                                  {dayKey}
                                </td>
                              )}

                              {/* 3 columns of menu items */}
                              {Array.from({ length: columnCount }).map(
                                (_, colIndex) => {
                                  const globalIndex =
                                    colIndex * chunkSize + rowIndex;
                                  const value = items[globalIndex];

                                  // in display mode, skip empty cells
                                  if (!value && !isEditing) {
                                    return (
                                      <td
                                        key={colIndex}
                                        className="item-col"
                                      ></td>
                                    );
                                  }

                                  return (
                                    <td key={colIndex} className="item-col">
                                      {isEditing ? (
                                        <input
                                          className="edit-input"
                                          value={value || ""}
                                          onChange={(e) =>
                                            handleItemChange(
                                              dayKey,
                                              mealKey,
                                              globalIndex,
                                              e.target.value
                                            )
                                          }
                                          placeholder="(empty)"
                                        />
                                      ) : value ? (
                                        <label className="item-label">
                                          <input
                                            type="checkbox"
                                            className="item-checkbox"
                                          />
                                          <span>{value}</span>
                                        </label>
                                      ) : null}
                                    </td>
                                  );
                                }
                              )}

                              {/* Wastage cell spans all rows + footer row */}
                              {rowIndex === 0 && (
                                <td
                                  className="wastage-cell"
                                  rowSpan={rowsCount + 1}
                                >
                                  {/* write wastage by hand after printing */}
                                </td>
                              )}
                            </tr>
                          )
                        )}

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
      </div>
    </main>
  );
}
