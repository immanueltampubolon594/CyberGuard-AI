"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Deretan logo (satu jalur, kanan ke kiri, tidak berhenti saat kursor).
 *
 * - Ruang kosong di sekeliling logo dipotong otomatis.
 * - Latar solid (misalnya putih) pada file PNG/SVG dihapus otomatis,
 *   jadi logo tampil satu warna, bukan kotak.
 * - Kecepatan dihitung dalam piksel per detik (SPEED).
 *
 * mode "original" : warna asli logo, latar dihapus (bawaan).
 * mode "mask"     : satu warna mengikuti teks sekitar.
 */

type Logo = {
  name: string;
  src: string;
  height?: number; // tinggi dasar (px), bawaan BASE_H
  mode?: "mask" | "original";
};

const LOGOS: Logo[] = [
  { name: "OWASP", src: "/partners/owasp.png" },
  { name: "BSSN", src: "/partners/bssn.png" },
  { name: "SANS Institute", src: "/partners/sans.png" },
  { name: "CIS", src: "/partners/cis.png" },
  { name: "INTERPOL", src: "/partners/interpol.png" },
  { name: "CISA", src: "/partners/cisa.png" },
  { name: "ITU", src: "/partners/itu.png" },
  { name: "ISACA", src: "/partners/isaca.png" },
  { name: "FIRST", src: "/partners/FIRST.png" },
  { name: "NIST", src: "/partners/NIST.png" },
];

// Jangan tulis "dipercaya oleh" atau "mitra" kecuali memang mitra resmi.
const LEAD = "Dipelajari dari standar dan praktik organisasi keamanan siber dunia";

const SPEED = 80; // piksel per detik (naikkan = lebih cepat)
const GAP = 56; // jarak antar logo (px)
const BASE_H = 52; // tinggi logo (px)
const MAX_W = 200; // lebar maksimum satu logo (px)
const MIN_H = 26; // tinggi minimum (px)

type Measured = {
  a: number; // rasio lebar/tinggi file asli
  bx: number; // kotak isi logo, pecahan dari ukuran file
  by: number;
  bw: number;
  bh: number;
  maskUrl: string; // gambar yang dipakai sebagai topeng satu warna
  colorUrl: string; // gambar warna asli dengan latar sudah dihapus
};

const cache = new Map<string, Promise<Measured | null>>();

// Ukur isi logo. Kalau file punya latar solid, ubah selisih warna terhadap
// latar menjadi transparansi supaya bisa dijadikan topeng satu warna.
function measure(src: string): Promise<Measured | null> {
  let p = cache.get(src);
  if (!p) {
    p = new Promise<Measured | null>((resolve) => {
      const img = new Image();
      const timer = setTimeout(() => resolve(null), 6000);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const nw = img.naturalWidth || 300;
          const nh = img.naturalHeight || 150;
          const a = nw / nh;
          const cw = a >= 1 ? 600 : Math.max(1, Math.round(600 * a));
          const ch = a >= 1 ? Math.max(1, Math.round(600 / a)) : 600;
          const c = document.createElement("canvas");
          c.width = cw;
          c.height = ch;
          const ctx = c.getContext("2d", { willReadFrequently: true });
          if (!ctx) return resolve(null);
          ctx.drawImage(img, 0, 0, cw, ch);
          const id = ctx.getImageData(0, 0, cw, ch);
          const d = id.data;
          const total = cw * ch;

          // Apakah file ini sudah punya transparansi?
          let transparent = 0;
          for (let i = 3; i < d.length; i += 4) if (d[i] < 40) transparent++;
          const corners = [0, cw - 1, (ch - 1) * cw, ch * cw - 1];
          const cornerClear = corners.some((p) => d[p * 4 + 3] < 200);
          const hasAlpha = cornerClear || transparent / total > 0.02;

          const alpha = new Uint8ClampedArray(total);
          if (hasAlpha) {
            for (let i = 0; i < total; i++) alpha[i] = d[i * 4 + 3];
          } else {
            // Warna latar = rata-rata empat sudut.
            let br = 0;
            let bg = 0;
            let bb = 0;
            for (const p0 of corners) {
              br += d[p0 * 4];
              bg += d[p0 * 4 + 1];
              bb += d[p0 * 4 + 2];
            }
            br /= 4;
            bg /= 4;
            bb /= 4;
            for (let i = 0; i < total; i++) {
              const dist = Math.max(
                Math.abs(d[i * 4] - br),
                Math.abs(d[i * 4 + 1] - bg),
                Math.abs(d[i * 4 + 2] - bb)
              );
              alpha[i] =
                dist <= 14 ? 0 : dist >= 90 ? 255 : Math.round(((dist - 14) / 76) * 255);
            }
          }

          let x0 = cw;
          let y0 = ch;
          let x1 = -1;
          let y1 = -1;
          for (let y = 0; y < ch; y++) {
            for (let x = 0; x < cw; x++) {
              if (alpha[y * cw + x] > 24) {
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
              }
            }
          }
          if (x1 < 0) return resolve(null);

          let maskUrl = src;
          let colorUrl = src;
          if (!hasAlpha) {
            const toUrl = (data: ImageData) => {
              const oc = document.createElement("canvas");
              oc.width = cw;
              oc.height = ch;
              const octx = oc.getContext("2d");
              if (!octx) return null;
              octx.putImageData(data, 0, 0);
              return oc.toDataURL("image/png");
            };
            const white = ctx.createImageData(cw, ch);
            const color = ctx.createImageData(cw, ch);
            // Warna latar (untuk memisahkan warna logo dari latar di tepi halus).
            let br = 0;
            let bg = 0;
            let bb = 0;
            for (const p0 of corners) {
              br += d[p0 * 4];
              bg += d[p0 * 4 + 1];
              bb += d[p0 * 4 + 2];
            }
            br /= 4;
            bg /= 4;
            bb /= 4;
            for (let i = 0; i < total; i++) {
              const al = alpha[i] / 255;
              white.data[i * 4] = 255;
              white.data[i * 4 + 1] = 255;
              white.data[i * 4 + 2] = 255;
              white.data[i * 4 + 3] = alpha[i];
              // Warna asli: buang campuran latar supaya tepi tidak berbingkai putih.
              const k = al > 0.02 ? al : 1;
              const cl = (v: number, b0: number) =>
                Math.max(0, Math.min(255, Math.round((v - (1 - al) * b0) / k)));
              color.data[i * 4] = cl(d[i * 4], br);
              color.data[i * 4 + 1] = cl(d[i * 4 + 1], bg);
              color.data[i * 4 + 2] = cl(d[i * 4 + 2], bb);
              color.data[i * 4 + 3] = alpha[i];
            }
            const mu = toUrl(white);
            const cu = toUrl(color);
            if (!mu || !cu) return resolve(null);
            maskUrl = mu;
            colorUrl = cu;
          }

          resolve({
            a,
            bx: x0 / cw,
            by: y0 / ch,
            bw: (x1 - x0 + 1) / cw,
            bh: (y1 - y0 + 1) / ch,
            maskUrl,
            colorUrl,
          });
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      img.src = src;
    });
    cache.set(src, p);
  }
  return p;
}

function Item({ logo, b, dup }: { logo: Logo; b: Measured | null; dup: boolean }) {
  const mask = (logo.mode ?? "original") === "mask";
  const base = logo.height ?? BASE_H;

  // Cadangan kalau pengukuran gagal. Topeng hanya dipakai untuk SVG;
  // untuk PNG ditampilkan apa adanya supaya tidak berubah jadi kotak solid.
  if (!b) {
    const asMask = mask && /\.svg$/i.test(logo.src);
    const u = `url("${logo.src}")`;
    return (
      <span
        className={asMask ? "cgm-logo cgm-mask" : "cgm-logo"}
        style={asMask ? { maskImage: u, WebkitMaskImage: u } : undefined}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo.src}
          alt={dup ? "" : logo.name}
          style={{ height: base, width: "auto", maxWidth: MAX_W }}
        />
      </span>
    );
  }

  const H = Math.max(MIN_H, Math.min(base, (MAX_W * b.bh) / (b.bw * b.a)));
  const W = (H * b.bw * b.a) / b.bh;
  const FH = H / b.bh;
  const FW = FH * b.a;
  const size = `${FW}px ${FH}px`;
  const pos = `${-b.bx * FW}px ${-b.by * FH}px`;
  const maskU = `url("${b.maskUrl}")`;
  const origU = `url("${b.colorUrl}")`;

  const style: React.CSSProperties = mask
    ? {
        width: W,
        height: H,
        backgroundColor: "currentColor",
        maskImage: maskU,
        WebkitMaskImage: maskU,
        maskSize: size,
        WebkitMaskSize: size,
        maskPosition: pos,
        WebkitMaskPosition: pos,
      }
    : {
        width: W,
        height: H,
        backgroundImage: origU,
        backgroundSize: size,
        backgroundPosition: pos,
      };

  return (
    <span
      className="cgm-logo cgm-crop"
      role="img"
      aria-label={dup ? undefined : logo.name}
      style={style}
    />
  );
}

export default function CyberLogoMarquee() {
  const [measured, setMeasured] = useState<(Measured | null)[] | null>(null);
  const trackRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    let alive = true;
    Promise.all(LOGOS.map((l) => measure(l.src))).then((r) => {
      if (alive) setMeasured(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  // Durasi = lebar satu paruh / kecepatan, dihitung ulang kalau ukuran berubah.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const apply = () => {
      const half = el.scrollWidth / 2;
      if (half > 0) el.style.animationDuration = `${half / SPEED}s`;
    };
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, [measured]);

  if (LOGOS.length === 0 || !measured) return null;

  // Satu paruh harus cukup lebar mengisi layar agar loop mulus.
  const idx = LOGOS.map((_, i) => i);
  let half = [...idx];
  while (half.length < 8) half = [...half, ...idx];
  const loop = [...half, ...half];

  return (
    <section className="cgm" aria-label={LEAD}>
      <p className="cgm-lead">{LEAD}</p>
      <div className="cgm-view">
        <ul className="cgm-track" ref={trackRef}>
          {loop.map((li, i) => {
            const dup = i >= half.length;
            return (
              <li key={i} aria-hidden={dup}>
                <Item logo={LOGOS[li]} b={measured[li]} dup={dup} />
              </li>
            );
          })}
        </ul>
      </div>
      <style>{`
.cgm { position: relative; width: 100%; padding: 36px 0 40px; text-align: center; border-bottom: 1px solid rgba(128,140,170,.22); }
.cgm-lead { margin: 0 auto 28px; max-width: 760px; padding: 0 24px; font-size: 16px; line-height: 1.6; opacity: .8; }
.cgm-view { overflow: hidden; max-width: 1440px; margin: 0 auto;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent);
          mask-image: linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent); }
.cgm-track { display: flex; align-items: center; width: max-content; gap: ${GAP}px; margin: 0; padding: 4px ${GAP}px 4px 0; list-style: none;
  animation: cgm-scroll 60s linear infinite; }
.cgm-logo { display: block; line-height: 0; opacity: .9; }
.cgm-logo img { display: block; }
.cgm-crop { background-repeat: no-repeat; -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat; }
.cgm-mask { background-color: currentColor;
  -webkit-mask-repeat: no-repeat; mask-repeat: no-repeat;
  -webkit-mask-position: center; mask-position: center;
  -webkit-mask-size: contain; mask-size: contain; }
.cgm-mask img { opacity: 0; }
@keyframes cgm-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) { .cgm-track { animation: none; } }
`}</style>
    </section>
  );
}