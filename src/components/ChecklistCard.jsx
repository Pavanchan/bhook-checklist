export default function ChecklistCard({ company = "Red-Brick", day, meal, items }) {
  if (!items || items.length === 0) return null;

  const mealLabel = {
    breakfast: "BREAKFAST",
    lunch: "LUNCH",
    snacks: "SNACKS",
    midnightSnacks: "MIDNIGHT SNACKS",
    dinner: "DINNER",
  }[meal];

  return (
    <div className="checklist-card">
      <div className="checklist-header">
        <div>
          <div className="checklist-header-title">
            {company} · {mealLabel}
          </div>
          <div className="checklist-header-meta">Day: {day}</div>
        </div>
        <div className="checklist-header-meta">Wastage □</div>
      </div>

      <div className="checklist-items">
        {items.map((item, idx) => (
          <label className="checklist-item" key={idx}>
            <input type="checkbox" />
            <span>{item}</span>
          </label>
        ))}
      </div>

      <div className="checklist-footer">
        <span>Time: ___________</span>
        <span>Handler: ___________</span>
        <span>Supervisor: ___________</span>
      </div>
    </div>
  );
}
