import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt =
  "XRPL 위에 세운 가족 송금·결제, 한 번에 — KFIP 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // Load Noto Sans KR weights 400/700/800 from Google Fonts CSS endpoint.
  // Satori needs the raw woff/ttf bytes — fetch them once at edge.
  const [regular, bold, extraBold] = await Promise.all([
    fontBytes("Noto+Sans+KR:wght@400"),
    fontBytes("Noto+Sans+KR:wght@700"),
    fontBytes("Noto+Sans+KR:wght@800"),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "#ffffff",
          padding: "80px",
          position: "relative",
          fontFamily: "Noto Sans KR",
        }}
      >
        {/* top row: logo + KFIP badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 22,
            fontWeight: 700,
            color: "#0a0a0a",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 999,
              background: "#00aae4",
            }}
          />
          <span>XRP·Family</span>
          <span style={{ color: "#999", fontWeight: 400 }}>/ KFIP 2026</span>
        </div>

        {/* live tag */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 60,
            background: "#f7fbfd",
            border: "1px solid #d6eef7",
            borderRadius: 999,
            padding: "10px 18px",
            fontSize: 18,
            fontWeight: 700,
            color: "#0077a8",
            alignSelf: "flex-start",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: 999,
              background: "#00aae4",
            }}
          />
          XRPL Testnet · Live
        </div>

        {/* headline */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 78,
            fontWeight: 800,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            color: "#0a0a0a",
          }}
        >
          XRPL 위에 세운
          <br />
          가족 송금·결제,{" "}
          <span
            style={{
              color: "#00aae4",
              borderBottom: "5px solid #00aae4",
              paddingBottom: 4,
            }}
          >
            한 번에
          </span>
        </div>

        {/* sub */}
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 28,
            color: "#555",
            lineHeight: 1.4,
          }}
        >
          베트남 부모님이 보낸 돈, <b style={{ color: "#0a0a0a", fontWeight: 800, margin: "0 8px" }}>3.2초</b>{" "}
          안에 한국 카드 잔액으로.
        </div>

        {/* footer row */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 60,
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 18,
            color: "#666",
          }}
        >
          <div style={{ fontStyle: "italic", color: "#999" }}>
            “Mẹ đã gửi 200,000 KRW”
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "#999", fontSize: 14 }}>POWERED BY</span>
            <span
              style={{
                color: "#00aae4",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              ● XRPL
            </span>
          </div>
        </div>

        {/* bottom accent line */}
        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 6,
            background: "#00aae4",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Noto Sans KR", data: regular, weight: 400, style: "normal" },
        { name: "Noto Sans KR", data: bold, weight: 700, style: "normal" },
        { name: "Noto Sans KR", data: extraBold, weight: 800, style: "normal" },
      ],
    },
  );
}

async function fontBytes(googleFontParam: string): Promise<ArrayBuffer> {
  // Force Google Fonts to serve TTF (not woff2) by claiming to be an old browser.
  // Satori doesn't decode woff2; it accepts TTF/OTF/woff raw bytes.
  const cssRes = await fetch(
    `https://fonts.googleapis.com/css2?family=${googleFontParam}&display=swap&subset=korean`,
    {
      headers: {
        // IE 9 era — Google serves TTF directly to such UAs.
        "User-Agent":
          "Mozilla/5.0 (Windows NT 6.1; Trident/7.0; rv:11.0) like Gecko",
      },
    },
  );
  const css = await cssRes.text();
  // Try truetype first, fall back to opentype.
  let match = css.match(/url\((https:\/\/[^)]+)\)\s*format\(['"]truetype['"]\)/);
  if (!match) {
    match = css.match(/url\((https:\/\/[^)]+)\)\s*format\(['"]opentype['"]\)/);
  }
  if (!match) {
    // Last resort: try the first url() in the CSS regardless of format.
    match = css.match(/url\((https:\/\/[^)]+)\)/);
  }
  if (!match) throw new Error(`Could not parse Google Font CSS for ${googleFontParam}`);
  const fontRes = await fetch(match[1]);
  return fontRes.arrayBuffer();
}
