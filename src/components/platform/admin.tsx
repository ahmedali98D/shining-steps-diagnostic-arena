"use client";

import { useCallback, useEffect, useState } from "react";
import { Download, LogOut, School } from "lucide-react";
import { Bar, Card, C, Chip, Mascot, SectionTitle, Spinner, api } from "./kit";
import { SKILL_META, Skill } from "@/lib/questions/types";

interface AdminStats {
  students: number;
  teachers: number;
  classes: number;
  attemptCount: number;
  fullDiagnosticCount: number;
  avgFluency: number;
  skillAverages: { skill: Skill; avgContinuous: number; count: number }[];
  levelDist: Record<string, number>;
  bandDist: Record<string, number>;
  recent: { id: string; mode: string; fluencyPct: number | null; overallLevel: number | null; bandCode: string | null; finishedAt: string | null }[];
}

const BAND_COLORS: Record<string, string> = {
  EXCELLENT: "#15857A",
  VERY_GOOD: "#2B6CB0",
  GOOD: "#E8A200",
  REVISE: "#FF6A3B",
  REPEAT: "#C2410C",
};

export default function AdminHome({ name, onSignOut }: { name: string; onSignOut: () => void }) {
  const [stats, setStats] = useState<AdminStats | null>(null);

  const load = useCallback(() => {
    api<AdminStats>("/api/admin/stats", undefined, "GET").then((r) => setStats(r.ok && r.data ? r.data : null));
  }, []);

  useEffect(load, [load]);

  const exportCsv = () => {
    if (!stats) return;
    const rows = [["mode", "overallLevel", "fluencyPct", "band", "finishedAt"]];
    for (const a of stats.recent) rows.push([a.mode, String(a.overallLevel ?? ""), String(a.fluencyPct ?? ""), a.bandCode || "", a.finishedAt || ""]);
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "shining-steps-recent-attempts.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const maxLevel = Math.max(1, ...Object.values(stats?.levelDist || { 0: 1 }));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Mascot size={50} color={C.teal} />
          <div>
            <div className="text-lg font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Center View</div>
            <div className="text-xs font-extrabold" style={{ color: C.soft }}>Shining Steps academic system - {name}</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCsv} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#E4F2EE", color: C.teal }}>
            <Download size={15} className="mr-1 inline" /> Export CSV
          </button>
          <button onClick={onSignOut} className="rounded-xl px-3 py-2 text-sm font-extrabold" style={{ background: "#FFEAE2", color: C.coral }}>
            <LogOut size={15} className="mr-1 inline" /> Sign out
          </button>
        </div>
      </div>

      {!stats ? (
        <div className="flex min-h-[40vh] items-center justify-center"><Spinner /></div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <StatCard label="Students" value={stats.students} color={C.teal} />
            <StatCard label="Teachers" value={stats.teachers} color={C.violet} />
            <StatCard label="Classes" value={stats.classes} color={C.amber} />
            <StatCard label="Completed runs" value={stats.attemptCount} color={C.coral} />
            <StatCard label="Avg fluency" value={`${stats.avgFluency}%`} color={C.teal} />
          </div>

          <Card className="mt-5 p-6">
            <SectionTitle kicker="Center averages" title="Skill pillars across the center" />
            <div className="grid gap-3 sm:grid-cols-2">
              {stats.skillAverages.map((s) => (
                <div key={s.skill} className="rounded-2xl p-4" style={{ background: SKILL_META[s.skill].soft }}>
                  <div className="flex items-center justify-between">
                    <Chip color={SKILL_META[s.skill].color}>{SKILL_META[s.skill].label}</Chip>
                    <span className="font-black" style={{ color: SKILL_META[s.skill].color }}>avg L{s.avgContinuous}</span>
                  </div>
                  <div className="mt-2"><Bar pct={(s.avgContinuous / 8) * 100} color={SKILL_META[s.skill].color} /></div>
                  <div className="mt-1 text-xs font-bold" style={{ color: C.soft }}>from {s.count} full diagnostics</div>
                </div>
              ))}
              {stats.skillAverages.length === 0 && <p className="font-bold" style={{ color: C.soft }}>No full diagnostics yet.</p>}
            </div>
          </Card>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <SectionTitle kicker="Placement map" title="Students by level" />
              <div className="flex items-end gap-2 pt-2">
                {Object.entries(stats.levelDist)
                  .sort((a, b) => Number(a[0]) - Number(b[0]))
                  .map(([lv, n]) => (
                    <div key={lv} className="flex-1 text-center">
                      <div className="rounded-t-lg" style={{ height: 8 + (n / maxLevel) * 90, background: C.teal, opacity: 0.9 }} />
                      <div className="text-[11px] font-extrabold" style={{ color: C.soft }}>L{lv}</div>
                      <div className="text-[10px] font-bold" style={{ color: C.soft }}>{n}</div>
                    </div>
                  ))}
              </div>
            </Card>
            <Card className="p-6">
              <SectionTitle kicker="Verdicts" title="Advice bands given" />
              <div className="grid gap-2 pt-2">
                {Object.entries(stats.bandDist).map(([band, n]) => (
                  <div key={band} className="flex items-center justify-between rounded-xl px-3 py-2" style={{ background: `${BAND_COLORS[band] || C.teal}14` }}>
                    <span className="text-sm font-extrabold" style={{ color: BAND_COLORS[band] || C.teal }}>{band.replace("_", " ")}</span>
                    <span className="font-black" style={{ color: C.ink }}>{n}</span>
                  </div>
                ))}
                {Object.keys(stats.bandDist).length === 0 && <p className="font-bold" style={{ color: C.soft }}>No data yet.</p>}
              </div>
            </Card>
          </div>

          <Card className="mt-5 p-6">
            <div className="flex items-center gap-2">
              <School size={20} color={C.teal} />
              <SectionTitle kicker="Live feed" title="Recent attempts" />
            </div>
            <div className="grid gap-2">
              {stats.recent.map((a) => (
                <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl bg-white px-3 py-2" style={{ border: `1px solid ${C.line}` }}>
                  <Chip color={a.mode === "FULL" ? C.teal : C.violet}>{a.mode === "FULL" ? "Full" : a.mode}</Chip>
                  <span className="text-sm font-extrabold" style={{ color: C.ink }}>Level {a.overallLevel ?? "-"} - {a.fluencyPct ?? 0}% fluency</span>
                  {a.bandCode && <Chip color={BAND_COLORS[a.bandCode] || C.teal}>{a.bandCode.replace("_", " ").toLowerCase()}</Chip>}
                  <span className="ml-auto text-xs font-bold" style={{ color: C.soft }}>
                    {a.finishedAt ? new Date(a.finishedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              ))}
              {stats.recent.length === 0 && <p className="font-bold" style={{ color: C.soft }}>No attempts yet.</p>}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-2xl p-4 text-center" style={{ background: `${color}12`, border: `1px solid ${C.line}` }}>
      <div className="text-2xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color }}>{value}</div>
      <div className="text-xs font-extrabold" style={{ color: C.soft }}>{label}</div>
    </div>
  );
}
