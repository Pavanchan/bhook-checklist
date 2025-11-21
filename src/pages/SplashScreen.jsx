import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/upload");
    }, 4000); // 4 seconds
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "24px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: 90,
            height: 90,
            borderRadius: "999px",
            background:
              "radial-gradient(circle at 30% 0%, #f97316, #facc15 50%, #b45309)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 18px",
            boxShadow: "0 22px 50px rgba(252,211,77,0.4)",
          }}
        >
          <span
            style={{
              fontSize: 40,
              fontWeight: 900,
              color: "#111827",
              letterSpacing: "0.2em",
            }}
          >
            B
          </span>
        </div>
        <h1
          style={{
            margin: 0,
            fontSize: 30,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
          }}
        >
          BHOOK
        </h1>
        <p
          style={{
            marginTop: 10,
            fontSize: 13,
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "#9ca3af",
          }}
        >
          Chemical free food experience
        </p>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: "0.16em",
        }}
      >
        Loading food checklist studio…
      </div>
    </div>
  );
}
