import { ImageResponse } from "next/og";

export const alt = "Toufique Ahmed — Developer Portfolio";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e293b 55%, #172554 100%)",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 24,
            fontWeight: 600,
            color: "#93c5fd",
          }}
        >
          TOUFIQUE AHMED · PORTFOLIO
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 68,
              fontWeight: 800,
              letterSpacing: "-2px",
              lineHeight: 1.15,
            }}
          >
            Building Ideas
            <br />
            Into Software.
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 28,
              fontSize: 28,
              color: "#cbd5e1",
            }}
          >
            Aspiring Full-Stack Developer
          </div>

          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 22,
              color: "#93c5fd",
            }}
          >
            IoT & Robotics Engineering Student
          </div>
        </div>

        <div
          style={{
            display: "flex",
            borderTop: "1px solid #475569",
            paddingTop: 24,
            fontSize: 21,
            color: "#cbd5e1",
          }}
        >
          React.js · Next.js · JavaScript · MongoDB
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}