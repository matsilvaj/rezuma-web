"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

/*
  6 wave curves in depth layers.
  Each has: yC (vertical center, de 0 a 1), amp (fraction of H), fx (horiz freq),
  ft (time speed), ph (phase), op (opacity), lw (line width), glow (bool).
*/
const CURVES = [
  // far background
  { yC: 0.40, amp: 0.095, fx: 0.0022, ft: 0.18, ph: 0.0,  op: 0.030, lw: 0.8, glow: false },
  { yC: 0.60, amp: 0.075, fx: 0.0036, ft: 0.14, ph: 2.2,  op: 0.025, lw: 0.8, glow: false },
  { yC: 0.33, amp: 0.115, fx: 0.0018, ft: 0.22, ph: 4.7,  op: 0.022, lw: 0.7, glow: false },
  // mid
  { yC: 0.47, amp: 0.105, fx: 0.0030, ft: 0.27, ph: 1.4,  op: 0.060, lw: 1.0, glow: false },
  { yC: 0.55, amp: 0.085, fx: 0.0042, ft: 0.20, ph: 5.3,  op: 0.050, lw: 0.9, glow: false },
  // foreground main, glow + shimmer
  { yC: 0.50, amp: 0.130, fx: 0.0028, ft: 0.31, ph: 3.2,  op: 0.26,  lw: 1.5, glow: true  },
] as const;

type Curve = typeof CURVES[number];

function waveY(x: number, c: Curve, smx: number, smy: number, t: number, H: number): number {
  const ps = smx * 1.8;
  const am = 1 + smy * 0.10;
  const A  = c.amp * am * H;
  return A * (
    Math.sin(c.fx * 1.00 * x + c.ph          + t * c.ft        + ps        ) * 0.55 +
    Math.sin(c.fx * 1.87 * x + c.ph * 1.63   + t * c.ft * 0.74 + ps * 0.55 ) * 0.28 +
    Math.sin(c.fx * 0.63 * x + c.ph * 0.47   + t * c.ft * 1.38 + ps * 1.5  ) * 0.17
  );
}

function buildPath(ctx: CanvasRenderingContext2D, c: Curve, W: number, H: number, smx: number, smy: number, t: number) {
  const cy = H * c.yC;
  ctx.beginPath();
  for (let x = 0; x <= W; x += 3) {
    const y = cy + waveY(x, c, smx, smy, t, H);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
}

function drawCurve(
  ctx: CanvasRenderingContext2D,
  c: Curve,
  W: number,
  H: number,
  smx: number,
  smy: number,
  t: number
) {
  if (c.glow) {
    const passes = [
      { w: 60, op: 0.025 },
      { w: 28, op: 0.050 },
      { w: 12, op: 0.100 },
      { w:  5, op: 0.160 },
    ];
    for (const p of passes) {
      buildPath(ctx, c, W, H, smx, smy, t);
      ctx.strokeStyle = `rgba(94,184,138,${p.op})`;
      ctx.lineWidth = p.w;
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // traveling shimmer
    const cy = H * c.yC;
    const frac = (Math.sin((t * 0.28) % (2 * Math.PI)) + 1) / 2;
    const sx = frac * W;
    const sy = cy + waveY(sx, c, smx, smy, t, H);
    const r = 90;
    const grad = ctx.createRadialGradient(sx, sy, 0, sx, sy, r);
    grad.addColorStop(0,   "rgba(94,184,138,0.18)");
    grad.addColorStop(0.3, "rgba(94,184,138,0.07)");
    grad.addColorStop(1,   "rgba(94,184,138,0)");
    ctx.fillStyle = grad;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
  }

  buildPath(ctx, c, W, H, smx, smy, t);
  ctx.strokeStyle = `rgba(94,184,138,${c.op})`;
  ctx.lineWidth = c.lw;
  ctx.lineCap = "round";
  ctx.stroke();
}

export function HeroSection({ viewerName }: { viewerName?: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0, dpr = 1;
    let rafId = 0;
    let time = 0;
    let mx = 0, my = 0, smx = 0, smy = 0;

    function resize() {
      // A interface roda sob CSS zoom (--rz-zoom), então a janela não serve de
      // régua: offset* dá o tamanho em px locais (o sistema de coordenadas do
      // desenho) e o rect dá o tamanho em px de tela. A razão entre os dois é o
      // zoom em vigor, que entra no dpr para a curva não sair serrilhada.
      const rect = canvas!.getBoundingClientRect();
      W = canvas!.offsetWidth;
      H = canvas!.offsetHeight;
      const zoom = W > 0 ? rect.width / W : 1;

      dpr = Math.min((window.devicePixelRatio || 1) * zoom, 3);
      canvas!.width  = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(1, 0, 0, 1, 0, 0);
      ctx!.scale(dpr, dpr);
    }

    const onMouse = (e: MouseEvent) => {
      // clientX e o rect vivem no mesmo espaço (px de tela), então a razão
      // entre eles dispensa saber o zoom.
      const rect = canvas!.getBoundingClientRect();
      // Canvas com tamanho zero (recarregando, aba escondida) daria divisão
      // por zero: o infinito vira NaN no desenho e o gradiente lança erro,
      // o que mata a animação de vez.
      if (rect.width <= 0 || rect.height <= 0) return;
      mx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      my = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
    };

    const tick = () => {
      smx += (mx - smx) * 0.032;
      smy += (my - smy) * 0.032;

      ctx.clearRect(0, 0, W, H);
      CURVES.forEach(c => drawCurve(ctx, c, W, H, smx, smy, time));

      time += 0.007;
      rafId = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouse);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
    };
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "var(--rz-vh)",
        overflow: "hidden",
        background: "#07080a",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />

      <nav
        className="rz-pad"
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: "22px",
          paddingBottom: "22px",
        }}
      >
        <img src="/logo.svg" alt="Rezuma" style={{ display: "block", height: "25px", width: "auto" }} />
        <Link
          href={viewerName ? "/dashboard" : "/login"}
          style={{ fontFamily: "var(--font-sans)", fontSize: "13px", fontWeight: 500, color: "rgba(237,237,234,0.40)", textDecoration: "none" }}
        >
          {viewerName ? `Olá, ${viewerName}` : "Entrar"}
        </Link>
      </nav>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px 100px",
          textAlign: "center",
        }}
      >
        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "2px", color: "rgba(237,237,234,0.22)", textTransform: "uppercase", marginBottom: "32px" }}>
          relatórios de fiis e ações
        </p>

        {/* Os tamanhos aqui são menores que o desenho original de propósito: a
            página inteira roda sob zoom 1.35, e o herói é a única seção que
            precisa caber na altura da janela. */}
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "clamp(34px, 5vw, 58px)",
            fontWeight: 700,
            color: "#ededea",
            letterSpacing: "-2.4px",
            lineHeight: 1.04,
            marginBottom: "22px",
            maxWidth: "580px",
          }}
        >
          Pare de ignorar<br />os relatórios.
        </h1>

        <p style={{ fontFamily: "var(--font-sans)", fontSize: "14px", color: "rgba(237,237,234,0.38)", lineHeight: 1.75, maxWidth: "390px", marginBottom: "38px" }}>
          Cada relatório dos seus FIIs e ações vira quatro parágrafos no seu
          e-mail e no Telegram, no mesmo dia.
        </p>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href={viewerName ? "/dashboard" : "/register"}
            style={{ fontFamily: "var(--font-sans)", background: "#ededea", color: "#07080a", padding: "12px 26px", borderRadius: "8px", fontSize: "13px", fontWeight: 600, letterSpacing: "-0.2px", textDecoration: "none" }}
          >
            {viewerName ? "Ir para os relatórios" : "Começar agora"}
          </Link>
          <a
            href="#exemplo"
            style={{ fontFamily: "var(--font-sans)", background: "transparent", color: "rgba(237,237,234,0.45)", padding: "12px 26px", borderRadius: "8px", fontSize: "13px", fontWeight: 500, border: "1px solid rgba(237,237,234,0.09)", textDecoration: "none" }}
          >
            Ver um resumo real
          </a>
        </div>

        <p style={{ fontFamily: "var(--font-mono)", fontSize: "10px", letterSpacing: "0.4px", color: "rgba(237,237,234,0.18)", marginTop: "26px" }}>
          documentos oficiais da CVM, do FNET e da B3
        </p>
      </div>

    </section>
  );
}
