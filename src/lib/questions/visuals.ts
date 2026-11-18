// UDL visual layer, redesigned for 2026 quality standards.
//
// Two families of visuals:
//  1. Vector visuals drawn in code (town maps, maze, wall clock, night-sky
//     star counting, frequency calendars). Geometry, labels and counts stay
//     exact because the audio scripts depend on them.
//  2. Illustrated assets generated for this platform (scenes, picture strips,
//     menu cards, price tags, shop shelves) rendered by the runner as
//     responsive HTML - see visual_map.ts for the data.
//
// Every vector visual follows one cartographic / infographic design language:
// warm paper, sand streets, drawn buildings with depth, teal and coral
// accents, Baloo typography.
import { QVisual } from "./types";

const FONT = "font-family=\"'Baloo 2','Segoe UI',sans-serif\"";
const INK = "#3E362C";
const SOFT = "#8A7B63";
const LINE = "#E3D9C6";
const PAPER = "#FFFDF7";
const TEAL = "#15857A";
const TEAL_DK = "#0E6B62";
const CORAL = "#FF6A3B";
const WOOD = "#B08968";
const SAND = "#EDE4D2";
const SAND_EDGE = "#DFD2B8";
const WALL = "#FFF6E8";
const WALL_EDGE = "#E4CFA9";
const GRASS = "#E7F1E1";
const GRASS_PATCH = "#D8EDD0";
const LEAF_1 = "#6FAF7C";
const LEAF_2 = "#559A67";

function frame(h: number, inner: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${h}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">`
    + `<rect x="1" y="1" width="638" height="${h - 2}" rx="18" fill="${PAPER}" stroke="${LINE}" stroke-width="2"/>`
    + `<rect x="8" y="8" width="624" height="${h - 16}" rx="13" fill="none" stroke="#F0E7D5" stroke-width="1.5"/>`
    + inner + `</svg>`;
}

function chip(cx: number, cy: number, label: string, opts: { fill?: string; color?: string; fs?: number } = {}): string {
  const fs = opts.fs ?? 13;
  const w = Math.max(label.length * fs * 0.62 + 18, 34);
  const fill = opts.fill ?? "#FFFFFF";
  const color = opts.color ?? SOFT;
  return `<g>`
    + `<rect x="${cx - w / 2}" y="${cy - 10}" width="${w}" height="20" rx="10" fill="${fill}" stroke="${LINE}" stroke-width="1.5"/>`
    + `<text x="${cx}" y="${cy + 4.5}" text-anchor="middle" ${FONT} font-size="${fs}" font-weight="800" fill="${color}">${label}</text>`
    + `</g>`;
}

function shadow(cx: number, y: number, rx: number): string {
  return `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="5" fill="${INK}" opacity="0.10"/>`;
}

// ---------------------------------------------------------------- buildings

type BBox = { x: number; y: number; w: number; h: number };

function roofPath(cx: number, baseY: number, half: number, apexY: number): string {
  return `M ${cx - half} ${baseY} Q ${cx - half} ${baseY - 4} ${cx - half + 5} ${baseY - 5} L ${cx - 4} ${apexY + 4} Q ${cx} ${apexY} ${cx + 4} ${apexY + 4} L ${cx + half - 5} ${baseY - 5} Q ${cx + half} ${baseY - 4} ${cx + half} ${baseY} Z`;
}

function window4(x: number, y: number, w: number, h: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="2.5" fill="#CDE7E2" stroke="#9CC9C2" stroke-width="1.5"/>`
    + `<line x1="${x + w / 2}" y1="${y}" x2="${x + w / 2}" y2="${y + h}" stroke="#9CC9C2" stroke-width="1"/>`
    + `<line x1="${x}" y1="${y + h / 2}" x2="${x + w}" y2="${y + h / 2}" stroke="#9CC9C2" stroke-width="1"/>`;
}

function tree(x: number, y: number, s = 1): string {
  return `<g>`
    + `<rect x="${x - 2.5 * s}" y="${y}" width="${5 * s}" height="${12 * s}" rx="2" fill="#A07B54"/>`
    + `<circle cx="${x}" cy="${y - 4 * s}" r="${9 * s}" fill="${LEAF_1}"/>`
    + `<circle cx="${x - 6 * s}" cy="${y + 1 * s}" r="${7 * s}" fill="${LEAF_2}"/>`
    + `<circle cx="${x + 6 * s}" cy="${y + 1 * s}" r="${7 * s}" fill="${LEAF_1}"/>`
    + `<circle cx="${x + 2 * s}" cy="${y - 7 * s}" r="${5.5 * s}" fill="#8CC497"/>`
    + `</g>`;
}

function bush(x: number, y: number, s = 1): string {
  return `<g>`
    + `<ellipse cx="${x - 4 * s}" cy="${y}" rx="${6 * s}" ry="${4.5 * s}" fill="${LEAF_2}"/>`
    + `<ellipse cx="${x + 4 * s}" cy="${y}" rx="${6 * s}" ry="${4.5 * s}" fill="${LEAF_1}"/>`
    + `</g>`;
}

function drawHouse(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 4;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.56, 92);
  const bh = baseY - top - 8;
  return shadow(cx, baseY + 3, bw * 0.62)
    + `<path d="${roofPath(cx, top + bh * 0.42, bw * 0.62, top)}" fill="${TEAL}" stroke="${TEAL_DK}" stroke-width="1"/>`
    + `<rect x="${cx + bw * 0.3}" y="${top + bh * 0.1}" width="9" height="${bh * 0.24}" rx="2" fill="#E09A7E"/>`
    + `<rect x="${cx - bw / 2}" y="${top + bh * 0.42}" width="${bw}" height="${bh * 0.58}" rx="2" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + `<rect x="${cx - 8}" y="${top + bh * 0.66}" width="16" height="${bh * 0.34}" rx="2" fill="${WOOD}"/>`
    + `<circle cx="${cx + 4}" cy="${top + bh * 0.85}" r="1.3" fill="#6B543B"/>`
    + window4(cx - bw * 0.36, top + bh * 0.58, 12, 11)
    + window4(cx + bw * 0.16, top + bh * 0.58, 12, 11);
}

function drawSchool(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 6;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.84, 160);
  const bh = baseY - top - 6;
  const winW = 15, winH = 12;
  const wy = top + bh * 0.42;
  return shadow(cx, baseY + 3, bw * 0.58)
    + `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${bh}" rx="3" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + `<rect x="${cx - bw / 2 - 5}" y="${top - 5}" width="${bw + 10}" height="9" rx="4" fill="${TEAL}"/>`
    + `<path d="M ${cx - 16} ${top - 5} L ${cx} ${top - 18} L ${cx + 16} ${top - 5} Z" fill="${CORAL}"/>`
    + `<line x1="${cx}" y1="${top - 18}" x2="${cx}" y2="${top - 26}" stroke="${SOFT}" stroke-width="2"/>`
    + `<path d="M ${cx} ${top - 26} L ${cx + 12} ${top - 22} L ${cx} ${top - 19} Z" fill="${CORAL}"/>`
    + window4(cx - bw * 0.34, wy, winW, winH)
    + window4(cx - bw * 0.15, wy, winW, winH)
    + window4(cx + bw * 0.15, wy, winW, winH)
    + window4(cx + bw * 0.34 - winW, wy, winW, winH)
    + `<rect x="${cx - 10}" y="${top + bh * 0.62}" width="20" height="${bh * 0.38}" rx="2" fill="${WOOD}"/>`
    + `<rect x="${cx - 16}" y="${baseY}" width="32" height="4" rx="2" fill="${SAND_EDGE}"/>`;
}

function drawCafe(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 6;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.62, 110);
  const bh = baseY - top;
  const n = 6;
  const sw = (bw + 8) / n;
  const stripes: string[] = [];
  for (let i = 0; i < n; i++) {
    const sx = cx - bw / 2 - 4 + i * sw;
    stripes.push(`<path d="M ${sx.toFixed(1)} ${top + 4} h ${sw.toFixed(1)} v 7 a ${(sw / 2).toFixed(1)} ${(sw / 2).toFixed(1)} 0 0 1 -${sw.toFixed(1)} 0 Z" fill="${i % 2 ? "#FFE9D2" : CORAL}" stroke="#E4CFA9" stroke-width="0.6"/>`);
  }
  return shadow(cx, baseY + 3, bw * 0.6)
    + `<rect x="${cx - bw / 2}" y="${top + 4}" width="${bw}" height="${bh - 4}" rx="3" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + stripes.join("")
    + window4(cx - bw * 0.38, top + 22, bw * 0.36, bh * 0.44)
    + `<rect x="${cx + bw * 0.08}" y="${top + 22}" width="${bw * 0.24}" height="${bh - 26}" rx="2" fill="${WOOD}"/>`
    + `<circle cx="${cx + bw * 0.08 + bw * 0.12}" cy="${top + 28}" r="1.3" fill="#6B543B"/>`;
}

function drawBank(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 6;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.66, 112);
  const bh = baseY - top - 8;
  const colW = 8;
  const colY = top + bh * 0.34;
  const cols = [-0.36, -0.12, 0.12, 0.36].map(
    (o) => `<rect x="${cx + bw * o - colW / 2}" y="${colY}" width="${colW}" height="${bh * 0.56}" rx="2" fill="#FFFDF7" stroke="${WALL_EDGE}" stroke-width="1.2"/>`
  ).join("");
  return shadow(cx, baseY + 3, bw * 0.6)
    + `<rect x="${cx - bw / 2}" y="${top + bh * 0.24}" width="${bw}" height="${bh * 0.76}" rx="3" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + `<path d="M ${cx - bw * 0.56} ${top + bh * 0.26} L ${cx} ${top - 2} L ${cx + bw * 0.56} ${top + bh * 0.26} Z" fill="${TEAL}"/>`
    + `<circle cx="${cx}" cy="${top + bh * 0.13}" r="5.5" fill="#FFFDF7" stroke="${TEAL_DK}" stroke-width="1.2"/>`
    + cols
    + `<rect x="${cx - bw * 0.1}" y="${top + bh * 0.62}" width="${bw * 0.2}" height="${bh * 0.38}" rx="2" fill="${WOOD}"/>`
    + `<rect x="${cx - bw / 2 + 2}" y="${baseY}" width="${bw - 4}" height="3.5" rx="1.75" fill="${SAND_EDGE}"/>`
    + `<rect x="${cx - bw / 2 + 5}" y="${baseY + 4}" width="${bw - 10}" height="3.5" rx="1.75" fill="${SAND_EDGE}" opacity="0.7"/>`;
}

function drawPark(b: BBox): string {
  const gx = b.x + 5;
  const gy = b.y + 4;
  const gw = b.w - 10;
  const gh = b.h - 28;
  const pathDots: string[] = [];
  for (let i = 0; i < 5; i++) {
    pathDots.push(`<circle cx="${gx + gw * 0.2 + i * gw * 0.15}" cy="${gy + gh * 0.8 - i * gh * 0.12}" r="2.4" fill="#FFFDF7"/>`);
  }
  return `<rect x="${gx}" y="${gy}" width="${gw}" height="${gh}" rx="10" fill="${GRASS_PATCH}"/>`
    + pathDots.join("")
    + tree(b.x + b.w * 0.26, gy + gh * 0.62, 1.05)
    + tree(b.x + b.w * 0.56, gy + gh * 0.4, 0.9)
    + tree(b.x + b.w * 0.78, gy + gh * 0.68, 1)
    + bush(b.x + b.w * 0.42, gy + gh * 0.82, 0.9)
    + bush(b.x + b.w * 0.66, gy + gh * 0.86, 0.8);
}

function drawLibrary(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 6;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.62, 106);
  const bh = baseY - top - 8;
  return shadow(cx, baseY + 3, bw * 0.6)
    + `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${bh}" rx="3" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + `<rect x="${cx - bw / 2 - 4}" y="${top - 5}" width="${bw + 8}" height="8" rx="3.5" fill="${WOOD}"/>`
    + window4(cx - bw * 0.32, top + bh * 0.3, 13, 12)
    + window4(cx + bw * 0.32 - 13, top + bh * 0.3, 13, 12)
    + `<rect x="${cx - 9}" y="${top + bh * 0.55}" width="18" height="${bh * 0.45}" rx="2" fill="${TEAL}"/>`
    + `<path d="M ${cx - 8} ${top + bh * 0.18} q 5 -4 8 0 q 3 -4 8 0 l 0 7 q -4 -3 -8 0 q -4 -3 -8 0 Z" fill="${CORAL}"/>`;
}

function drawStation(b: BBox): string {
  const cx = b.x + b.w / 2;
  const top = b.y + 6;
  const baseY = b.y + b.h - 26;
  const bw = Math.min(b.w * 0.66, 112);
  const bh = baseY - top - 8;
  const archW = bw * 0.44;
  const archTop = top + bh * 0.3;
  return shadow(cx, baseY + 3, bw * 0.6)
    + `<rect x="${cx - bw / 2}" y="${top}" width="${bw}" height="${bh}" rx="3" fill="${WALL}" stroke="${WALL_EDGE}" stroke-width="1.5"/>`
    + `<path d="M ${cx - archW / 2} ${baseY} L ${cx - archW / 2} ${archTop + archW / 2} A ${archW / 2} ${archW / 2} 0 0 1 ${cx + archW / 2} ${archTop + archW / 2} L ${cx + archW / 2} ${baseY} Z" fill="#F6E7CF" stroke="${WALL_EDGE}" stroke-width="1.2"/>`
    + `<rect x="${cx - bw / 2 - 4}" y="${top - 5}" width="${bw + 8}" height="8" rx="3.5" fill="${CORAL}"/>`
    + `<circle cx="${cx}" cy="${top + bh * 0.14}" r="6.5" fill="#FFFFFF" stroke="${SOFT}" stroke-width="1.4"/>`
    + `<line x1="${cx}" y1="${top + bh * 0.14}" x2="${cx}" y2="${top + bh * 0.14 - 4}" stroke="${SOFT}" stroke-width="1.4"/>`
    + `<line x1="${cx}" y1="${top + bh * 0.14}" x2="${cx + 3}" y2="${top + bh * 0.14 + 1}" stroke="${SOFT}" stroke-width="1.4"/>`
    + `<rect x="${cx + bw * 0.3}" y="${baseY - 12}" width="12" height="12" rx="2" fill="#CDE7E2" stroke="#9CC9C2" stroke-width="1.2"/>`
    + `<rect x="${cx - bw * 0.42}" y="${baseY - 12}" width="12" height="12" rx="2" fill="#CDE7E2" stroke="#9CC9C2" stroke-width="1.2"/>`;
}

const BUILDERS: Record<string, (b: BBox) => string> = {
  house: drawHouse,
  school: drawSchool,
  cafe: drawCafe,
  bank: drawBank,
  park: drawPark,
  library: drawLibrary,
  station: drawStation,
};

// ------------------------------------------------------------------- streets

function street(x: number, y: number, w: number, h: number): string {
  const horizontal = w >= h;
  const dashes: string[] = [];
  if (horizontal) {
    const cy = y + h / 2;
    for (let dx = x + 8; dx < x + w - 16; dx += 26) {
      dashes.push(`<line x1="${dx}" y1="${cy}" x2="${dx + 14}" y2="${cy}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`);
    }
  } else {
    const cx = x + w / 2;
    for (let dy = y + 8; dy < y + h - 16; dy += 26) {
      dashes.push(`<line x1="${cx}" y1="${dy}" x2="${cx}" y2="${dy + 14}" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round"/>`);
    }
  }
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="${SAND}"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="9" fill="none" stroke="${SAND_EDGE}" stroke-width="2"/>`
    + dashes.join("");
}

function crosswalk(cx: number, y: number, h: number): string {
  const stripes: string[] = [];
  for (let i = 0; i < 4; i++) {
    stripes.push(`<rect x="${cx - 7 + i * 4}" y="${y + 4}" width="2.5" height="${h - 8}" rx="1.2" fill="#FFFFFF"/>`);
  }
  return stripes.join("");
}

// ------------------------------------------------------------------ town map

export interface MapBlockSpec { type: keyof typeof BUILDERS; label: string; x: number; y: number; w: number; h: number; start?: boolean }

export function townMap(alt: string, streets: [number, number, number, number][], blocks: MapBlockSpec[], city?: string): QVisual {
  const H = 330;
  const art = blocks.map((b) => {
    const draw = BUILDERS[b.type] ?? drawHouse;
    const labelCy = b.y + b.h - 10;
    const labelOpts = b.start ? { fill: CORAL, color: "#FFFFFF", fs: 11 } : { fill: "#FFFFFF", color: SOFT };
    const labelText = b.start ? "YOU ARE HERE" : b.label;
    return draw(b) + chip(b.x + b.w / 2, labelCy, labelText, labelOpts);
  }).join("");
  const pin = (() => {
    const start = blocks.find((b) => b.start);
    if (!start) return "";
    const px = start.x + start.w / 2;
    const py = start.y + 2;
    return `<g>`
      + `<circle cx="${px}" cy="${py - 30}" r="17" fill="${CORAL}" opacity="0.16"/>`
      + `<path d="M ${px - 7} ${py - 14} L ${px} ${py + 2} L ${px + 7} ${py - 14} Z" fill="${CORAL}" stroke="#C44A22" stroke-width="1.4"/>`
      + `<circle cx="${px}" cy="${py - 24}" r="11" fill="${CORAL}" stroke="#C44A22" stroke-width="1.4"/>`
      + `<circle cx="${px}" cy="${py - 24}" r="4.4" fill="#FFFFFF"/>`
      + `</g>`;
  })();
  const cityTag = city ? chip(64, 30, city.toUpperCase(), { fill: TEAL, color: "#FFFFFF", fs: 11 }) : "";
  const compass = `<g transform="translate(604 24)">`
    + `<circle r="14" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>`
    + `<text y="-1.5" text-anchor="middle" ${FONT} font-size="8.5" font-weight="800" fill="${TEAL}">N</text>`
    + `<path d="M 0 3 L -3.5 10 L 3.5 10 Z" fill="${TEAL}"/>`
    + `</g>`;
  const cornerTrees = [
    tree(24, 26, 0.95), tree(616, 300, 0.95), tree(24, 300, 0.85),
  ].join("");
  const inner = `<rect x="8" y="8" width="624" height="${H - 16}" rx="13" fill="${GRASS}"/>`
    + streets.map(([x, y, w, h]) => street(x, y, w, h)).join("")
    + cornerTrees
    + art
    + pin
    + compass
    + cityTag;
  return { kind: "map", alt, svg: frame(H, inner) };
}

// ---------------------------------------------------------------------- maze

function glyph(kind: string): string {
  switch (kind) {
    case "palette":
      return `<g transform="rotate(-8)">`
        + `<ellipse rx="13" ry="10.5" fill="#F6E2C8" stroke="#C9A97C" stroke-width="1.6"/>`
        + `<circle cx="-5" cy="-3.5" r="2.3" fill="${CORAL}"/>`
        + `<circle cx="1" cy="-5" r="2.3" fill="${TEAL}"/>`
        + `<circle cx="6.5" cy="-1.5" r="2.3" fill="#F2B233"/>`
        + `<circle cx="-1" cy="3" r="2.3" fill="#7A6BB0"/>`
        + `<path d="M 9 6 q 5 2 3 -4" fill="#F6E2C8" stroke="#C9A97C" stroke-width="1.4"/>`
        + `</g>`;
    case "book":
      return `<g>`
        + `<path d="M 0 -4 C -3.5 -8 -10 -9 -14 -7 L -14 5 C -9.5 3 -3.5 4 0 7 C 3.5 4 9.5 3 14 5 L 14 -7 C 10 -9 3.5 -8 0 -4 Z" fill="${TEAL}"/>`
        + `<line x1="0" y1="-4" x2="0" y2="7" stroke="${TEAL_DK}" stroke-width="1.4"/>`
        + `<line x1="-10" y1="-3.5" x2="-4" y2="-2.5" stroke="#EAF4F2" stroke-width="1.4"/>`
        + `<line x1="-10" y1="0" x2="-4" y2="0.8" stroke="#EAF4F2" stroke-width="1.4"/>`
        + `<line x1="4" y1="-2.5" x2="10" y2="-3.5" stroke="#EAF4F2" stroke-width="1.4"/>`
        + `</g>`;
    case "ball":
      return `<g>`
        + `<circle r="10" fill="#E8A25B" stroke="#B26A32" stroke-width="1.5"/>`
        + `<path d="M -10 0 Q 0 5 10 0 M 0 -10 Q 5 0 0 10" fill="none" stroke="#B26A32" stroke-width="1.4"/>`
        + `</g>`;
    default:
      return `<g>`
        + `<circle cx="-4" cy="5" r="5" fill="${INK}"/>`
        + `<rect x="-0.6" y="-9" width="2.6" height="14" rx="1.3" fill="${INK}"/>`
        + `<path d="M 2 -9 q 7 2.5 6 9 q -2 -4.5 -6 -4 Z" fill="${CORAL}"/>`
        + `</g>`;
  }
}

export function mazeVisual(
  alt: string,
  rooms: { letter: string; glyph: "palette" | "book" | "ball" | "note"; label: string; x: number; y: number }[]
): QVisual {
  const H = 360;
  const WALLW = 52;
  const FLOORW = 36;
  const wallStroke = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${WOOD}" stroke-width="${WALLW}" stroke-linecap="round"/>`;
  const floorStroke = (x1: number, y1: number, x2: number, y2: number) =>
    `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#FFFFFF" stroke-width="${FLOORW}" stroke-linecap="round"/>`;

  // Corridor skeleton (walls first, room boxes after, floors punch openings).
  const walls = [
    wallStroke(330, 58, 330, 216), wallStroke(170, 110, 490, 110),
    wallStroke(170, 210, 490, 210), wallStroke(330, 206, 330, 302),
  ].join("");
  const roomRects = rooms.map((r) =>
    `<rect x="${r.x}" y="${r.y}" width="150" height="78" rx="14" fill="#FFFFFF" stroke="${WOOD}" stroke-width="9"/>`
  ).join("");
  const floors = [
    floorStroke(330, 54, 330, 118), floorStroke(196, 110, 444, 110),
    floorStroke(330, 102, 330, 218), floorStroke(196, 210, 444, 210),
    floorStroke(330, 202, 330, 286),
  ].join("");
  const bricks = `<g>`
    + `<rect x="304" y="286" width="52" height="20" rx="4" fill="#A85B4B"/>`
    + `<line x1="304" y1="293" x2="356" y2="293" stroke="#8C4237" stroke-width="1.6"/>`
    + `<line x1="304" y1="299.5" x2="356" y2="299.5" stroke="#8C4237" stroke-width="1.6"/>`
    + `<line x1="317" y1="286" x2="317" y2="293" stroke="#8C4237" stroke-width="1.6"/>`
    + `<line x1="343" y1="286" x2="343" y2="293" stroke="#8C4237" stroke-width="1.6"/>`
    + `<line x1="304" y1="293" x2="304" y2="299.5" stroke="#8C4237" stroke-width="0"/>`
    + `<line x1="330" y1="293" x2="330" y2="299.5" stroke="#8C4237" stroke-width="1.6"/>`
    + `<line x1="317" y1="299.5" x2="317" y2="306" stroke="#8C4237" stroke-width="0"/>`
    + `</g>`;
  const startMat = `<g>`
    + `<rect x="295" y="32" width="70" height="26" rx="13" fill="${CORAL}"/>`
    + `<text x="330" y="49.5" text-anchor="middle" ${FONT} font-size="13.5" font-weight="800" fill="#FFFFFF" letter-spacing="1">START</text>`
    + `</g>`;
  const roomArt = rooms.map((r) => {
    const cx = r.x + 75;
    return `<g transform="translate(${cx} ${r.y + 30})">${glyph(r.glyph)}</g>`
      + `<g transform="translate(${r.x + 26} ${r.y + 28})"><circle r="13" fill="${TEAL}"/><text text-anchor="middle" dy="4.5" ${FONT} font-size="14" font-weight="800" fill="#FFFFFF">${r.letter}</text></g>`
      + `<text x="${cx}" y="${r.y + 62}" text-anchor="middle" ${FONT} font-size="12.5" font-weight="800" fill="${SOFT}">${r.label}</text>`;
  }).join("");
  const inner = walls + roomRects + floors + bricks + startMat + roomArt;
  return { kind: "maze", alt, svg: frame(H, inner) };
}

// --------------------------------------------------------------------- clock

export function clockVisual(alt: string, hh: number, mm: number): QVisual {
  const H = 300;
  const cx = 320;
  const cy = 152;
  const R = 112;
  const ticks: string[] = [];
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 - 90) * (Math.PI / 180);
    const major = i % 5 === 0;
    const r1 = major ? R - 18 : R - 12;
    const r2 = R - 26;
    ticks.push(`<line x1="${cx + r1 * Math.cos(a)}" y1="${cy + r1 * Math.sin(a)}" x2="${cx + r2 * Math.cos(a)}" y2="${cy + r2 * Math.sin(a)}" stroke="${major ? INK : "#D8CBB0"}" stroke-width="${major ? 3 : 2}" stroke-linecap="round"/>`);
  }
  const numerals: string[] = [];
  for (let n = 1; n <= 12; n++) {
    const a = (n * 30 - 90) * (Math.PI / 180);
    const nx = cx + (R - 44) * Math.cos(a);
    const ny = cy + (R - 44) * Math.sin(a) + 8;
    numerals.push(`<text x="${nx}" y="${ny}" text-anchor="middle" ${FONT} font-size="24" font-weight="800" fill="${INK}">${n}</text>`);
  }
  const minA = ((mm * 6) - 90) * (Math.PI / 180);
  const hrA = (((hh % 12) * 30) + mm * 0.5 - 90) * (Math.PI / 180);
  const mx = cx + 62 * Math.cos(minA);
  const my = cy + 62 * Math.sin(minA);
  const hx = cx + 42 * Math.cos(hrA);
  const hy = cy + 42 * Math.sin(hrA);
  const inner = `<ellipse cx="${cx}" cy="${cy + R + 14}" rx="${R * 0.86}" ry="9" fill="${INK}" opacity="0.10"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="${TEAL}"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R + 10}" fill="none" stroke="${TEAL_DK}" stroke-width="2"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R - 2}" fill="#FFFFFF"/>`
    + `<circle cx="${cx}" cy="${cy}" r="${R - 2}" fill="none" stroke="${LINE}" stroke-width="1.5"/>`
    + ticks.join("")
    + numerals.join("")
    + `<line x1="${cx}" y1="${cy}" x2="${hx}" y2="${hy}" stroke="${TEAL}" stroke-width="9" stroke-linecap="round"/>`
    + `<line x1="${cx}" y1="${cy}" x2="${mx}" y2="${my}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
    + `<circle cx="${cx}" cy="${cy}" r="8" fill="${TEAL}"/>`
    + `<circle cx="${cx}" cy="${cy}" r="3" fill="#FFFFFF"/>`;
  return { kind: "clock", alt, svg: frame(H, inner) };
}

// ------------------------------------------------------------- night sky sky

// Fully drawn night scene: the star count is the answer material, so the sky
// is rendered in code and contains EXACTLY twelve stars - three rows of four.
export function skyStars(alt: string): QVisual {
  const H = 330;
  const stars: string[] = [];
  const cols = [120, 260, 400, 540];
  const rows = [100, 175, 250];
  for (const y of rows) {
    for (const x of cols) {
      const pts: string[] = [];
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 11 : 4.6;
        const a = (i * 36 - 90) * (Math.PI / 180);
        pts.push(`${(x + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`);
      }
      stars.push(`<circle cx="${x}" cy="${y}" r="18" fill="#FFD966" opacity="0.20"/>`
        + `<circle cx="${x}" cy="${y}" r="11.5" fill="#FFE9A8" opacity="0.35"/>`
        + `<polygon points="${pts.join(" ")}" fill="#FFDD7E" stroke="#F2B233" stroke-width="1"/>`);
    }
  }
  const cloud = (cx: number, cy: number, s: number, o: number) =>
    `<g fill="#2E3C72" opacity="${o}">`
    + `<ellipse cx="${cx}" cy="${cy}" rx="${52 * s}" ry="${16 * s}"/>`
    + `<circle cx="${cx - 26 * s}" cy="${cy - 8 * s}" r="${13 * s}"/>`
    + `<circle cx="${cx}" cy="${cy - 13 * s}" r="${16 * s}"/>`
    + `<circle cx="${cx + 27 * s}" cy="${cy - 7 * s}" r="${12 * s}"/>`
    + `</g>`;
  const hill = (d: string, fill: string) => `<path d="${d}" fill="${fill}"/>`;
  const moon = `<g>`
    + `<circle cx="530" cy="70" r="46" fill="#FFE9A8" opacity="0.16"/>`
    + `<mask id="moonmask"><rect x="462" y="8" width="170" height="130" fill="#FFFFFF"/><circle cx="544" cy="60" r="26" fill="#000000"/></mask>`
    + `<circle cx="530" cy="70" r="30" fill="#FFE9A8" mask="url(#moonmask)"/>`
    + `</g>`;
  const inner = `<defs>`
    + `<linearGradient id="skygrad" x1="0" y1="0" x2="0" y2="1">`
    + `<stop offset="0" stop-color="#141F45"/><stop offset="0.55" stop-color="#31406E"/><stop offset="1" stop-color="#4A3A78"/>`
    + `</linearGradient>`
    + `<clipPath id="skyclip"><rect x="8" y="8" width="624" height="${H - 16}" rx="13"/></clipPath>`
    + `</defs>`
    + `<g clip-path="url(#skyclip)">`
    + `<rect x="8" y="8" width="624" height="${H - 16}" fill="url(#skygrad)"/>`
    + moon
    + cloud(150, 120, 1, 0.9)
    + cloud(420, 200, 1.1, 0.8)
    + cloud(300, 66, 0.8, 0.7)
    + hill(`M 8 250 Q 130 210 260 244 T 632 236 L 632 322 L 8 322 Z`, "#1E3B35")
    + hill(`M 8 290 Q 180 250 340 286 T 632 280 L 632 322 L 8 322 Z`, "#16302B")
    + stars.join("")
    + `</g>`;
  return { kind: "sky", alt, svg: frame(H, inner) };
}

// -------------------------------------------------------- frequency calendar

function calendarTile(x: number, y: number, marks: { color: string; cells: number[] } | "none", label: string): string {
  const w = 128;
  const headH = 24;
  const gx = x + 14;
  const gy = y + headH + 12;
  const cw = 12;
  const gap = 3.4;
  const cells: string[] = [];
  const isNone = marks === "none";
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 7; c++) {
      const idx = r * 7 + c;
      const cxp = gx + c * (cw + gap);
      const cyp = gy + r * (cw + gap);
      let fill = "#FFFDF7";
      let stroke = "#E3D9C6";
      if (!isNone) {
        const m = marks as { color: string; cells: number[] };
        if (m.cells.includes(idx)) { fill = m.color; stroke = m.color; }
      }
      cells.push(`<rect x="${cxp}" y="${cyp}" width="${cw}" height="${cw}" rx="3" fill="${fill}" stroke="${stroke}" stroke-width="1.4"/>`);
    }
  }
  const noneCross = isNone
    ? `<line x1="${gx - 4}" y1="${gy - 4}" x2="${gx + 7 * (cw + gap) - gap + 4}" y2="${gy + 3 * (cw + gap) - gap + 4}" stroke="${CORAL}" stroke-width="4" stroke-linecap="round" opacity="0.85"/>`
      + `<line x1="${gx + 7 * (cw + gap) - gap + 4}" y1="${gy - 4}" x2="${gx - 4}" y2="${gy + 3 * (cw + gap) - gap + 4}" stroke="${CORAL}" stroke-width="4" stroke-linecap="round" opacity="0.85"/>`
    : "";
  const labelW = Math.max(label.length * 8.4 + 16, 40);
  return `<g>`
    + `<rect x="${x}" y="${y}" width="${w}" height="128" rx="14" fill="#FFFFFF" stroke="${LINE}" stroke-width="2"/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${headH}" rx="14" fill="${TEAL}"/>`
    + `<rect x="${x}" y="${y + headH - 12}" width="${w}" height="12" fill="${TEAL}"/>`
    + `<rect x="${x + w / 2 - 14}" y="${y - 5}" width="6" height="12" rx="3" fill="${WOOD}"/>`
    + `<rect x="${x + w / 2 + 8}" y="${y - 5}" width="6" height="12" rx="3" fill="${WOOD}"/>`
    + cells.join("")
    + noneCross
    + `<rect x="${x + w / 2 - labelW / 2}" y="${y + 112}" width="${labelW}" height="19" rx="9.5" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>`
    + `<text x="${x + w / 2}" y="${y + 125.5}" text-anchor="middle" ${FONT} font-size="11.5" font-weight="800" fill="${SOFT}">${label}</text>`
    + `</g>`;
}

export function frequencyStrip(alt: string): QVisual {
  const H = 200;
  const y = 26;
  const xs = [24, 183, 342, 501].map((v) => v + 1);
  const tiles = [
    calendarTile(xs[0], y, { color: CORAL, cells: [10] }, "once a week"),
    calendarTile(xs[1], y, { color: CORAL, cells: [3, 15] }, "twice a week"),
    calendarTile(xs[2], y, { color: TEAL, cells: Array.from({ length: 21 }, (_, i) => i) }, "every day"),
    calendarTile(xs[3], y, "none", "never"),
  ].join("");
  return { kind: "strip", alt, svg: frame(H, tiles) };
}

// ------------------------------------------------------------ data graphics
// Exact-in-code charts and diagrams for the upper-level writing tasks. Every
// number in the data arrays is the number the student must describe, so the
// geometry is computed from the data, never hand-drawn.

const BLUE = "#2E7BB5";
const AMBER = "#E8A200";
const VIOLET = "#6B4FA0";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function chartFrame(h: number, title: string, subtitle: string, inner: string, legend?: string): string {
  const head = `<text x="320" y="34" text-anchor="middle" ${FONT} font-size="17" font-weight="800" fill="${INK}">${esc(title)}</text>`
    + (subtitle ? `<text x="320" y="52" text-anchor="middle" ${FONT} font-size="11.5" font-weight="700" fill="${SOFT}">${esc(subtitle)}</text>` : "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 ${h}" width="100%" preserveAspectRatio="xMidYMid meet" style="display:block">`
    + `<rect x="1" y="1" width="638" height="${h - 2}" rx="18" fill="${PAPER}" stroke="${LINE}" stroke-width="2"/>`
    + head
    + (legend || "")
    + inner
    + `</svg>`;
}

function niceMax(v: number): number {
  const steps = [5, 10, 15, 20, 25, 30, 40, 50, 60, 80, 100, 120, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
  for (const s of steps) if (v <= s) return s;
  return Math.ceil(v / 500) * 500;
}

export interface BarSpec { label: string; value: number }

export function barChart(alt: string, title: string, subtitle: string, bars: BarSpec[], color = TEAL, yMaxHint?: number): QVisual {
  const H = 400;
  const top = 84;
  const bottom = 330;
  const left = 78;
  const right = 596;
  const maxVal = Math.max(...bars.map((b) => b.value));
  const yMax = niceMax(yMaxHint ?? maxVal * 1.12);
  const plotW = right - left;
  const slot = plotW / bars.length;
  const bw = Math.min(slot * 0.52, 84);
  const grid: string[] = [];
  for (let i = 0; i <= 4; i++) {
    const v = (yMax * i) / 4;
    const y = bottom - ((bottom - top) * i) / 4;
    grid.push(`<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="${i === 0 ? INK : LINE}" stroke-width="${i === 0 ? 2 : 1.4}"/>`
      + `<text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" ${FONT} font-size="11.5" font-weight="700" fill="${SOFT}">${v % 1 === 0 ? v : v.toFixed(1)}</text>`);
  }
  const colArt = bars.map((b, i) => {
    const hVal = ((bottom - top) * b.value) / yMax;
    const x = left + slot * i + (slot - bw) / 2;
    const y = bottom - hVal;
    const cx = x + bw / 2;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="${hVal.toFixed(1)}" rx="7" fill="${color}" opacity="${0.92}"/>`
      + `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${bw.toFixed(1)}" height="7" rx="3.5" fill="#FFFFFF" opacity="0.35"/>`
      + `<text x="${cx.toFixed(1)}" y="${(y - 9).toFixed(1)}" text-anchor="middle" ${FONT} font-size="13" font-weight="800" fill="${INK}">${b.value}</text>`
      + `<text x="${cx.toFixed(1)}" y="${(bottom + 20).toFixed(1)}" text-anchor="middle" ${FONT} font-size="12" font-weight="800" fill="${INK}">${esc(b.label)}</text>`;
  }).join("");
  const inner = grid.join("") + colArt;
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, inner) };
}

export interface LineSeriesSpec { name: string; color: string; points: number[] }

export function lineChart(
  alt: string, title: string, subtitle: string, xLabels: string[], series: LineSeriesSpec[], yMaxHint?: number, unit = ""
): QVisual {
  const H = 420;
  const top = 92;
  const bottom = 342;
  const left = 78;
  const right = 592;
  const maxVal = Math.max(...series.flatMap((s) => s.points));
  const yMax = niceMax(yMaxHint ?? maxVal * 1.1);
  const plotW = right - left;
  const step = plotW / Math.max(1, xLabels.length - 1);
  const py = (v: number) => bottom - ((bottom - top) * v) / yMax;
  const px = (i: number) => left + step * i;
  const grid: string[] = [];
  for (let i = 0; i <= 4; i++) {
    const v = (yMax * i) / 4;
    const y = py(v);
    grid.push(`<line x1="${left}" y1="${y.toFixed(1)}" x2="${right}" y2="${y.toFixed(1)}" stroke="${i === 0 ? INK : LINE}" stroke-width="${i === 0 ? 2 : 1.4}"/>`
      + `<text x="${left - 10}" y="${(y + 4).toFixed(1)}" text-anchor="end" ${FONT} font-size="11.5" font-weight="700" fill="${SOFT}">${v % 1 === 0 ? v : v.toFixed(1)}</text>`);
  }
  const xLabelsArt = xLabels.map((l, i) =>
    `<text x="${px(i).toFixed(1)}" y="${(bottom + 22).toFixed(1)}" text-anchor="middle" ${FONT} font-size="12" font-weight="800" fill="${INK}">${esc(l)}</text>`
  ).join("");
  const seriesArt = series.map((s) => {
    const pts = s.points.map((v, i) => `${px(i).toFixed(1)},${py(v).toFixed(1)}`);
    const dots = s.points.map((v, i) =>
      `<circle cx="${px(i).toFixed(1)}" cy="${py(v).toFixed(1)}" r="5" fill="#FFFFFF" stroke="${s.color}" stroke-width="3"/>`
      + `<text x="${px(i).toFixed(1)}" y="${(py(v) - 11).toFixed(1)}" text-anchor="middle" ${FONT} font-size="11.5" font-weight="800" fill="${s.color}">${v}${unit}</text>`
    ).join("");
    return `<polyline points="${pts.join(" ")}" fill="none" stroke="${s.color}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` + dots;
  }).join("");
  const legend = series.map((s, i) => {
    const lx = 592 - series.slice(0, i + 1).reduce((a, t) => a + t.name.length * 8 + 46, 0);
    return `<g transform="translate(${lx} 62)">`
      + `<line x1="0" y1="6" x2="24" y2="6" stroke="${s.color}" stroke-width="3.5" stroke-linecap="round"/>`
      + `<circle cx="12" cy="6" r="4.5" fill="#FFFFFF" stroke="${s.color}" stroke-width="2.6"/>`
      + `<text x="32" y="10.5" ${FONT} font-size="12.5" font-weight="800" fill="${INK}">${esc(s.name)}</text>`
      + `</g>`;
  }).join("");
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, grid.join("") + xLabelsArt + seriesArt, legend) };
}

export interface PieSliceSpec { label: string; pct: number; color: string }

export function pieChart(alt: string, title: string, subtitle: string, slices: PieSliceSpec[]): QVisual {
  const H = 400;
  const cx = 205;
  const cy = 226;
  const R = 118;
  let acc = -90;
  const sliceArt = slices.map((s) => {
    const a0 = (acc * Math.PI) / 180;
    acc += (s.pct / 100) * 360;
    const a1 = (acc * Math.PI) / 180;
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + R * Math.cos(a0), y0 = cy + R * Math.sin(a0);
    const x1 = cx + R * Math.cos(a1), y1 = cy + R * Math.sin(a1);
    const mid = (a0 + a1) / 2;
    const lx = cx + (R + 22) * Math.cos(mid), ly = cy + (R + 22) * Math.sin(mid);
    const pctLabel = `<text x="${lx.toFixed(1)}" y="${(ly + 4).toFixed(1)}" text-anchor="middle" ${FONT} font-size="12.5" font-weight="800" fill="${INK}">${s.pct}%</text>`;
    return `<path d="M ${cx} ${cy} L ${x0.toFixed(1)} ${y0.toFixed(1)} A ${R} ${R} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} Z" fill="${s.color}" stroke="${PAPER}" stroke-width="3"/>`
      + pctLabel;
  }).join("");
  const hole = `<circle cx="${cx}" cy="${cy}" r="52" fill="${PAPER}" stroke="${LINE}" stroke-width="1.5"/>`
    + `<text x="${cx}" y="${cy - 4}" text-anchor="middle" ${FONT} font-size="13" font-weight="800" fill="${SOFT}">class</text>`
    + `<text x="${cx}" y="${cy + 14}" text-anchor="middle" ${FONT} font-size="13" font-weight="800" fill="${SOFT}">total</text>`;
  const legend = slices.map((s, i) => {
    const y = 140 + i * 44;
    return `<g transform="translate(392 ${y})">`
      + `<rect x="0" y="0" width="228" height="34" rx="10" fill="#FFFFFF" stroke="${LINE}" stroke-width="1.5"/>`
      + `<rect x="10" y="9" width="16" height="16" rx="5" fill="${s.color}"/>`
      + `<text x="36" y="22.5" ${FONT} font-size="13" font-weight="800" fill="${INK}">${esc(s.label)}</text>`
      + `<text x="216" y="22.5" text-anchor="end" ${FONT} font-size="13" font-weight="800" fill="${SOFT}">${s.pct}%</text>`
      + `</g>`;
  }).join("");
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, sliceArt + hole + legend) };
}

export interface ProcessStepSpec { label: string; sub?: string }

export function processDiagram(alt: string, title: string, subtitle: string, steps: ProcessStepSpec[]): QVisual {
  const H = 300;
  const n = steps.length;
  const gap = 30;
  const boxW = Math.min((588 - (n - 1) * gap) / n, 150);
  const totalW = n * boxW + (n - 1) * gap;
  const x0 = 320 - totalW / 2;
  const y = 118;
  const boxH = 104;
  const rows: string[] = [];
  steps.forEach((s, i) => {
    const x = x0 + i * (boxW + gap);
    rows.push(`<rect x="${x.toFixed(1)}" y="${y}" width="${boxW.toFixed(1)}" height="${boxH}" rx="14" fill="#FFFFFF" stroke="${WOOD}" stroke-width="2.5"/>`
      + `<rect x="${x.toFixed(1)}" y="${y}" width="${boxW.toFixed(1)}" height="30" rx="14" fill="${i % 2 ? CORAL : TEAL}"/>`
      + `<rect x="${x.toFixed(1)}" y="${y + 16}" width="${boxW.toFixed(1)}" height="14" fill="${i % 2 ? CORAL : TEAL}"/>`
      + `<text x="${(x + boxW / 2).toFixed(1)}" y="${y + 21}" text-anchor="middle" ${FONT} font-size="13" font-weight="800" fill="#FFFFFF">${i + 1}</text>`);
    const words = s.label.split(" ");
    const line1: string[] = [];
    const line2: string[] = [];
    let tgt = line1;
    for (const w of words) {
      if (([...line1, ...line2].join(" ") + " " + w).length > 15 && line1.length > 0 && line2.length === 0) tgt = line2;
      tgt.push(w);
    }
    rows.push(`<text x="${(x + boxW / 2).toFixed(1)}" y="${y + 54}" text-anchor="middle" ${FONT} font-size="13.5" font-weight="800" fill="${INK}">${esc(line1.join(" "))}</text>`);
    if (line2.length > 0) rows.push(`<text x="${(x + boxW / 2).toFixed(1)}" y="${y + 72}" text-anchor="middle" ${FONT} font-size="13.5" font-weight="800" fill="${INK}">${esc(line2.join(" "))}</text>`);
    if (s.sub) rows.push(`<text x="${(x + boxW / 2).toFixed(1)}" y="${y + 92}" text-anchor="middle" ${FONT} font-size="11" font-weight="700" fill="${SOFT}">${esc(s.sub)}</text>`);
    if (i < n - 1) {
      const ax = x + boxW + 4;
      const ay = y + boxH / 2;
      rows.push(`<line x1="${ax}" y1="${ay}" x2="${ax + gap - 10}" y2="${ay}" stroke="${SOFT}" stroke-width="3" stroke-linecap="round"/>`
        + `<path d="M ${ax + gap - 12} ${ay - 6} L ${ax + gap} ${ay} L ${ax + gap - 12} ${ay + 6} Z" fill="${SOFT}"/>`);
    }
  });
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, rows.join("")) };
}

export function tableVisual(alt: string, title: string, subtitle: string, headers: string[], rows: string[][], widths?: number[]): QVisual {
  const H = 120 + rows.length * 42 + (subtitle ? 14 : 0);
  const x = 40;
  const w = 560;
  const top = 92;
  const colWs = widths && widths.length === headers.length ? widths : headers.map(() => 1);
  const sum = colWs.reduce((a, b) => a + b, 0);
  const colX: number[] = [];
  let accX = x;
  for (const cw of colWs) {
    colX.push(accX);
    accX += (cw / sum) * w;
  }
  const headerArt = headers.map((hd, i) =>
    `<text x="${(colX[i] + 14).toFixed(1)}" y="${top + 24}" ${FONT} font-size="13.5" font-weight="800" fill="#FFFFFF">${esc(hd)}</text>`
    + (i > 0 ? `<line x1="${colX[i].toFixed(1)}" y1="${top + 6}" x2="${colX[i].toFixed(1)}" y2="${top + 34}" stroke="#FFFFFF" stroke-width="1" opacity="0.4"/>` : "")
  ).join("");
  const rowArt = rows.map((r, ri) => {
    const y = top + 40 + ri * 42;
    const bg = ri % 2 ? "#FBF3E4" : "#FFFFFF";
    const cells = r.map((c, ci) =>
      `<text x="${(colX[ci] + 14).toFixed(1)}" y="${y + 26}" ${FONT} font-size="14" font-weight="${ci === 0 ? 800 : 700}" fill="${ci === 0 ? INK : "#5A5140"}">${esc(c)}</text>`
    ).join("");
    return `<rect x="${x}" y="${y}" width="${w}" height="42" rx="10" fill="${bg}" stroke="${LINE}" stroke-width="1.4"/>` + cells;
  }).join("");
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, `<rect x="${x}" y="${top}" width="${w}" height="40" rx="10" fill="${TEAL}"/>` + headerArt + rowArt) };
}

/** Two small town panels side by side (before / after) for IELTS-style map tasks. */
export function dualMap(
  alt: string, title: string, subtitle: string, labelA: string, labelB: string,
  streets: [number, number, number, number][], blocksA: MapBlockSpec[], blocksB: MapBlockSpec[]
): QVisual {
  const H = 420;
  const s = 0.472;
  const panel = (blocks: MapBlockSpec[], ox: number, oy: number, label: string) => {
    const art = blocks.map((b) => {
      const draw = BUILDERS[b.type] ?? drawHouse;
      const labelCy = b.y + b.h - 10;
      const labelOpts = b.start ? { fill: CORAL, color: "#FFFFFF", fs: 11 } : { fill: "#FFFFFF", color: SOFT };
      const labelText = b.start ? "YOU ARE HERE" : b.label;
      return draw(b) + chip(b.x + b.w / 2, labelCy, labelText, labelOpts);
    }).join("");
    const streetsArt = streets.map(([x, y, w, h]) => street(x, y, w, h)).join("");
    const pin = (() => {
      const start = blocks.find((b) => b.start);
      if (!start) return "";
      const px = start.x + start.w / 2;
      const py = start.y + 2;
      return `<circle cx="${px}" cy="${py - 24}" r="11" fill="${CORAL}" stroke="#C44A22" stroke-width="1.4"/>`
        + `<circle cx="${px}" cy="${py - 24}" r="4.4" fill="#FFFFFF"/>`
        + `<path d="M ${px - 7} ${py - 14} L ${px} ${py + 2} L ${px + 7} ${py - 14} Z" fill="${CORAL}" stroke="#C44A22" stroke-width="1.4"/>`;
    })();
    return `<rect x="${ox}" y="${oy}" width="${640 * s}" height="${330 * s}" rx="12" fill="${GRASS}" stroke="${LINE}" stroke-width="2"/>`
      + `<g transform="translate(${ox} ${oy}) scale(${s})">${streetsArt}${art}${pin}</g>`
      + `<text x="${ox + 640 * s / 2}" y="${oy - 10}" text-anchor="middle" ${FONT} font-size="14" font-weight="800" fill="${TEAL}">${esc(label)}</text>`;
  };
  const inner = panel(blocksA, 32, 116, labelA) + panel(blocksB, 336, 116, labelB);
  return { kind: "chart", alt, svg: chartFrame(H, title, subtitle, inner) };
}

