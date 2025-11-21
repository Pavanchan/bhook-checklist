// src/pages/ChecklistPage.jsx
import React, { useRef } from "react";
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
  const { menu, company } = useMenu();
  const navigate = useNavigate();
  const wrapperRef = useRef(null); // will contain all printable sheets

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

  // Determine which meals actually have items
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

  // Download ALL sheets as a single long PNG image
  const handleDownloadImage = async () => {
    if (!wrapperRef.current) return;

    try {
      const canvas = await html2canvas(wrapperRef.current, {
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${company || "bhook"}-food-checklist.png`;
      link.click();
    } catch (err) {
      console.error("PNG export failed:", err);
      alert("Could not generate image. Please try again.");
    }
  };

  // Download each meal-sheet as a separate page in a single PDF
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
        const y = Math.max(0, (pageHeight - imgHeight) / 2); // vertical centering

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
          gap: 12,
          marginBottom: 12,
          flexWrap: "wrap",
        }}
      >
        <button
          className="btn-ghost"
          type="button"
          onClick={() => navigate("/upload")}
        >
          ← Back to upload
        </button>
        <button className="btn-primary" type="button" onClick={handlePrint}>
          Print / Save as PDF (Browser)
        </button>
        <button className="btn-ghost" type="button" onClick={handleDownloadPDF}>
          Download PDF
        </button>
        <button className="btn-ghost" type="button" onClick={handleDownloadImage}>
          Download as Image (PNG)
        </button>
      </div>

      {/* Wrapper that will be captured for PNG/PDF (no controls inside) */}
      <div ref={wrapperRef}>
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
                    if (!items.length) return null;

                    const columnCount = 3;
                    const chunkSize =
                      Math.ceil(items.length / columnCount) || 1;

                    const cols = [];
                    for (let c = 0; c < columnCount; c++) {
                      cols.push(
                        items.slice(c * chunkSize, (c + 1) * chunkSize)
                      );
                    }

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
