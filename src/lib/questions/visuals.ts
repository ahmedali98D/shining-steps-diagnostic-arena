// UDL visual layer: pure-SVG generators for maps, mazes, scenes, picture
// strips, clocks and document cards. No assets, no network - every picture is
// a lightweight inline SVG that scales to the card width.
import { QVisual } from "./types";

const FONT = "font-family=\"'Baloo 2','Segoe UI',sans-serif\"";
const INK = "#3E362C";
const SOFT = "#8A7B63";
const LINE = "#E3D9C6";
const STREET = "#EDE4D2";

function wrap(h: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${h}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">`
    + `<rect x="1" y="1" width="638" height="${h - 2}" rx="16" fill="#FFFDF7" stroke="${LINE}" stroke-width="2"/>`
    + `${inner}</svg>`;
}

function block(b: { emoji: string; label: string; x: number; y: number; w: number; h: number }): string {
  const cx = b.x + b.w / 2;
  const cy = b.y + b.h / 2;
  return `<rect x="${b.x}" y="${b.y}" width="${b.w}" height="${b.h}" rx="13" fill="#FFFFFF" stroke="${LINE}" stroke-width="2"/>`
    + `<text x="${cx}" y="${cy - 3}" text-anchor="middle" font-size="30">${b.emoji}</text>`
    + `<text x="${cx}" y="${b.y + b.h - 9}" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="${SOFT}">${b.label}</text>`;
}

function streetRect(x: number, y: number, w: number, h: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10" fill="${STREET}"/>`;
}

interface MapBlock { emoji: string; label: string; x: number; y: number; w: number; h: number }

export function townMap(alt: string, streets: [number, number, number, number][], blocks: MapBlock[]): QVisual {
  const H = 330;
  const inner = streets.map(([x, y, w, h]) => streetRect(x, y, w, h)).join("") + blocks.map(block).join("");
  return { kind: "map", alt, svg: wrap(H, inner) };
}

export function sceneVisual(alt: string, bg: { top: string; bottom: string }, items: { emoji: string; label?: string; x: number; y: number; size?: number }[], H = 330, shapes = ""): QVisual {
  const inner = `<rect x="1" y="1" width="638" height="${H / 2}" rx="16" fill="${bg.top}"/>`
    + `<rect x="1" y="${H / 2}" width="638" height="${H / 2 - 1}" rx="16" fill="${bg.bottom}"/>`
    + shapes
    + items.map((it) => {
      const s = it.size || 42;
      const t = `<text x="${it.x}" y="${it.y}" text-anchor="middle" font-size="${s}">${it.emoji}</text>`;
      return it.label ? t + `<text x="${it.x}" y="${it.y + 22}" text-anchor="middle" ${FONT} font-size="12" font-weight="700" fill="${SOFT}">${it.label}</text>` : t;
    }).join("");
  return { kind: "scene", alt, svg: wrap(H, inner) };
}

export function stripVisual(alt: string, tiles: { emoji: string; label: string }[], H = 210): QVisual {
  const n = tiles.length;
  const gap = 14;
  const tw = (640 - 48 - gap * (n - 1)) / n;
  const ty = 34;
  const inner = tiles.map((t, i) => {
    const x = 24 + i * (tw + gap);
    return `<rect x="${x}" y="${ty}" width="${tw}" height="${H - 68}" rx="14" fill="#FFFFFF" stroke="${LINE}" stroke-width="2"/>`
      + `<text x="${x + tw / 2}" y="${ty + (H - 68) / 2 - 6}" text-anchor="middle" font-size="40">${t.emoji}</text>`
      + `<text x="${x + tw / 2}" y="${H - 44}" text-anchor="middle" ${FONT} font-size="13" font-weight="700" fill="${SOFT}">${t.label}</text>`;
  }).join("");
  return { kind: "strip", alt, svg: wrap(H, inner) };
}

export function clockVisual(alt: string, hh: number, mm: number): QVisual {
  const H = 300;
  const cx = 320;
  const cy = 150;
  const r = 92;
  const minA = ((mm * 6) - 90) * (Math.PI / 180);
  const hrA = (((hh % 12) * 30) + mm * 0.5 - 90) * (Math.PI / 180);
  const mx = cx + 62 * Math.cos(minA);
  const my = cy + 62 * Math.sin(minA);
  const hx = cx + 44 * Math.cos(hrA);
  const hy = cy + 44 * Math.sin(hrA);
  const nums: [string, number, number][] = [["12", cx, cy - r + 22], ["3", cx + r - 20, cy + 6], ["6", cx, cy + r - 12], ["9", cx - r + 20, cy + 6]];
  const inner = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#FFFFFF" stroke="${LINE}" stroke-width="4"/>`
    + nums.map(([t, x, y]) => `<text x="${x}" y="${y}" text-anchor="middle" ${FONT} font-size="20" font-weight="800" fill="${INK}">${t}</text>`).join("")
    + `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="#15857A" stroke-width="7" stroke-linecap="round"/>`
    + `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="5" fill="${INK}"/>`;
  return { kind: "clock", alt, svg: wrap(H, inner) };
}

export function cardVisual(alt: string, title: string, rows: { head?: string; text?: string }[], H = 300): QVisual {
  const inner = `<text x="320" y="52" text-anchor="middle" ${FONT} font-size="24" font-weight="800" fill="${INK}">${title}</text>`
    + `<line x1="120" y1="66" x2="520" y2="66" stroke="${LINE}" stroke-width="2"/>`
    + rows.map((r, i) => {
      const y = 100 + i * 34;
      const head = r.head ? `<text x="140" y="${y}" ${FONT} font-size="15" font-weight="800" fill="#B25E02">${r.head}</text>` : "";
      const text = r.text ? `<text x="${r.head ? 260 : 140}" y="${y}" ${FONT} font-size="15" font-weight="600" fill="${INK}">${r.text}</text>` : "";
      return head + text;
    }).join("");
  return { kind: "card", alt, svg: wrap(H, inner) };
}

// Maze rendered metro-map style: corridors, junctions, lettered rooms, one
// blocked end. The spoken route stays unambiguous on the drawn map.
export function mazeVisual(alt: string, rooms: { letter: string; emoji: string; label: string; x: number; y: number }[]): QVisual {
  const H = 360;
  const corridor = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#D8CBB0" stroke-width="24" stroke-linecap="round"/>`;
  const dot = (x: number, y: number) => `<circle cx="${x}" cy="${y}" r="9" fill="#B08968"/>`;
  const inner = [
    corridor(330, 62, 330, 110), corridor(330, 110, 170, 110), corridor(330, 110, 490, 110),
    corridor(330, 110, 330, 210), corridor(330, 210, 170, 210), corridor(330, 210, 490, 210),
    corridor(330, 210, 330, 292),
    dot(330, 110), dot(330, 210),
    `<text x="330" y="48" text-anchor="middle" font-size="30">🚪</text>`,
    `<text x="330" y="26" text-anchor="middle" ${FONT} font-size="14" font-weight="800" fill="#15857A">START HERE</text>`,
    `<text x="330" y="316" text-anchor="middle" font-size="26">🧱</text>`,
    rooms.map((r) => block({ emoji: r.emoji, label: r.label, x: r.x, y: r.y, w: 150, h: 78 })
      + `<circle cx="${r.x + 24}" cy="${r.y + 24}" r="15" fill="#15857A"/><text x="${r.x + 24}" y="${r.y + 30}" text-anchor="middle" ${FONT} font-size="15" font-weight="800" fill="#FFFFFF">${r.letter}</text>`).join(""),
  ].join("");
  return { kind: "maze", alt, svg: wrap(H, inner) };
}

// Small helpers reused by the map designs.
export const START_HOUSE = (x: number, y: number, w: number, h: number): MapBlock => ({ emoji: "🏠", label: "START", x, y, w, h });
export { block as mapBlock };
