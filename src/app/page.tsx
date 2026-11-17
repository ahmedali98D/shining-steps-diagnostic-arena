"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, Brain, GraduationCap, Headphones, Mic, PencilLine, Rocket, ShieldCheck, Sparkles, Trophy, Users } from "lucide-react";
import { BigButton, Card, C, Chip, Ladder, Mascot, Spinner, api, useHashRoute } from "@/components/platform/kit";
import AuthView from "@/components/platform/auth";
import StudentHome from "@/components/platform/student";
import Runner from "@/components/platform/runner";
import ResultsView from "@/components/platform/results";
import TeacherHome from "@/components/platform/teacher";
import AdminHome from "@/components/platform/admin";

interface Me {
  user: { id: string; name: string; role: string; xp: number; streak: number };
  badges: string[];
  classes: { id: string; name: string; code: string; teacher: string }[];
}

interface PublicStats {
  bank: { levels: number; questions: number };
  students: number;
  attempts: number;
}

export default function Home() {
  const [route, go] = useHashRoute();
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [activeAttemptId, setActiveAttemptId] = useState<string | null>(null);
  const [runMode, setRunMode] = useState<"FULL" | "reading" | "listening" | "writing" | "speaking">("FULL");
  const [runKey, setRunKey] = useState(0);

  const refreshMe = useCallback(async () => {
    const res = await api<Me>("/api/auth/me", undefined, "GET");
    setMe(res.ok && res.data ? res.data : null);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async data load on mount
    refreshMe();
    api<PublicStats>("/api/dashboard", undefined, "GET").then((r) => setStats(r.ok && r.data ? r.data : null));
  }, [refreshMe]);

  const view = route.split("/")[0] || "";
  const param = route.split("/")[1] || "";

  const roleHome = () => {
    if (!me) return;
    if (me.user.role === "STUDENT") go("student");
    else if (me.user.role === "TEACHER") go("teacher");
    else go("center");
  };

  const signOut = async () => {
    await api("/api/auth/logout", {});
    setMe(null);
    go("");
  };

  // ---------- guards ----------
  let content: React.ReactNode;

  if (loading) {
    content = (
      <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg }}>
        <div className="text-center">
          <Mascot size={110} mood="cheer" />
          <div className="mt-4"><Spinner /></div>
        </div>
      </div>
    );
  } else if (view === "auth") {
    content = <AuthView onAuthed={refreshMe} goHome={() => go("")} />;
  } else if (view === "student") {
    content = me ? (
      me.user.role === "STUDENT" ? (
        <StudentHome
          me={me}
          onStart={(mode) => {
            setRunMode(mode);
            setRunKey((k) => k + 1);
            go("assessment");
          }}
          onOpenAttempt={(id) => {
            setActiveAttemptId(id);
            go(`results/${id}`);
          }}
          onSignOut={signOut}
        />
      ) : (
        <AccessDenied goHome={roleHome} />
      )
    ) : (
      <RedirectToAuth go={go} />
    );
  } else if (view === "assessment") {
    content = me && me.user.role === "STUDENT" ? (
      <Runner
        key={runKey}
        mode={runMode}
        onFinish={(id) => {
          setActiveAttemptId(id);
          refreshMe();
          go(`results/${id}`);
        }}
        onExit={() => go("student")}
      />
    ) : (
      <RedirectToAuth go={go} />
    );
  } else if (view === "results" && param) {
    content = me ? (
      <ResultsView
        attemptId={param}
        onGoHome={roleHome}
        onRetake={(mode) => {
          setRunMode(mode);
          setRunKey((k) => k + 1);
          go("assessment");
        }}
      />
    ) : (
      <RedirectToAuth go={go} />
    );
  } else if (view === "teacher") {
    content = me ? (
      me.user.role === "TEACHER" || me.user.role === "ADMIN" ? (
        <TeacherHome
          name={me.user.name}
          onSignOut={signOut}
          onOpenAttempt={(id) => {
            setActiveAttemptId(id);
            go(`results/${id}`);
          }}
        />
      ) : (
        <AccessDenied goHome={roleHome} />
      )
    ) : (
      <RedirectToAuth go={go} />
    );
  } else if (view === "center") {
    content = me ? (
      me.user.role === "ADMIN" ? (
        <AdminHome name={me.user.name} onSignOut={signOut} />
      ) : (
        <AccessDenied goHome={roleHome} />
      )
    ) : (
      <RedirectToAuth go={go} />
    );
  } else {
    // ---------- landing ----------
    content = (
      <Landing
        me={me}
        stats={stats}
        go={go}
        roleHome={roleHome}
      />
    );
  }

  return (
    <div className="flex min-h-screen flex-col" style={{ background: C.bg, color: C.ink, fontFamily: "var(--font-nunito), 'Nunito', sans-serif" }}>
      {/* top bar */}
      <header className="sticky top-0 z-40 border-b backdrop-blur" style={{ borderColor: C.line, background: "rgba(255,249,240,0.92)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <button onClick={() => go("")} className="flex items-center gap-2">
            <Mascot size={40} />
            <div className="text-left">
              <div className="text-sm font-black leading-none" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
                Shining Steps
              </div>
              <div className="text-[10px] font-extrabold" style={{ color: C.coral }}>DIAGNOSTIC ARENA</div>
            </div>
          </button>
          <div className="flex items-center gap-2">
            {loading ? null : me ? (
              <>
                <span className="hidden text-xs font-extrabold sm:block" style={{ color: C.soft }}>
                  {me.user.name} - {me.user.role.toLowerCase()}
                </span>
                <button onClick={roleHome} className="rounded-xl px-4 py-2 text-sm font-extrabold text-white" style={{ background: C.teal }}>
                  My dashboard
                </button>
              </>
            ) : (
              <>
                <button onClick={() => go("auth")} className="rounded-xl px-4 py-2 text-sm font-extrabold" style={{ background: "#EFE3D3", color: C.ink }}>
                  Sign in
                </button>
                <button onClick={() => go("auth")} className="rounded-xl px-4 py-2 text-sm font-extrabold text-white" style={{ background: C.coral }}>
                  Start free <ArrowRight size={15} className="ml-1 inline" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{content}</main>

      <footer className="mt-auto border-t" style={{ borderColor: C.line, background: "#FDF6EA" }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-center sm:flex-row sm:text-left">
          <div className="text-xs font-bold" style={{ color: C.soft }}>
            Shining Steps academic system - Digital Diagnostic Assessment Platform
          </div>
          <div className="text-xs font-extrabold" style={{ color: C.ink }}>
            Created by Ahmed Mahmoud Saeed Ahmed Ali
          </div>
        </div>
      </footer>
      {activeAttemptId ? null : null}
    </div>
  );
}

function RedirectToAuth({ go }: { go: (h: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => go("auth"), 900);
    return () => clearTimeout(t);
  }, [go]);
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <Card className="p-6 text-center">
        <Mascot size={80} mood="think" />
        <p className="mt-2 font-bold" style={{ color: C.soft }}>Sign in first so your ladder progress is saved...</p>
      </Card>
    </div>
  );
}

function AccessDenied({ goHome }: { goHome: () => void }) {
  return (
    <div className="mx-auto mt-16 max-w-md">
      <Card className="p-8 text-center">
        <ShieldCheck size={40} className="mx-auto" color={C.coral} />
        <p className="mt-3 font-extrabold" style={{ color: C.ink }}>This desk belongs to a different role.</p>
        <div className="mt-4"><BigButton onClick={goHome} color={C.teal}>Go to my dashboard</BigButton></div>
      </Card>
    </div>
  );
}

// ---------------- landing ----------------
function Landing({ me, stats, go, roleHome }: { me: Me | null; stats: PublicStats | null; go: (h: string) => void; roleHome: () => void }) {
  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30" style={{ background: "radial-gradient(circle, #FFC53D 0%, transparent 65%)" }} />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-96 w-96 rounded-full opacity-25" style={{ background: "radial-gradient(circle, #15857A 0%, transparent 65%)" }} />
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2">
          <div>
            <Chip color={C.coral}><Sparkles size={13} /> gamified diagnostic - placement in minutes</Chip>
            <h1 className="mt-3 text-4xl font-black leading-tight md:text-5xl" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>
              Find your level.
              <br />
              <span style={{ color: C.coral }}>Climb the ladder.</span>
            </h1>
            <p className="mt-4 max-w-lg text-lg font-semibold leading-relaxed" style={{ color: C.soft }}>
              The Shining Steps Diagnostic Arena reads your four language pillars - reading, listening, writing, speaking - and
              places you on the exact level and unit of your Shining Steps book. Every answer you give comes back with a reason,
              and every retake shows your growth in percent.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {me ? (
                <BigButton onClick={roleHome} color={C.coral}>Open my dashboard <ArrowRight size={20} /></BigButton>
              ) : (
                <>
                  <BigButton onClick={() => go("auth")} color={C.coral}><Rocket size={20} /> Find my level now</BigButton>
                  <BigButton onClick={() => go("auth")} color={C.teal}><GraduationCap size={20} /> Teacher or center sign in</BigButton>
                </>
              )}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Chip color={C.teal}>{stats?.bank.levels ?? 9} book levels L0-L8</Chip>
              <Chip color={C.violet}>{stats?.bank.questions ?? 153} expert-tagged questions</Chip>
              <Chip color={C.coral}>{stats?.students ?? 0} students on board</Chip>
              <Chip color="#B25E02">{stats?.attempts ?? 0} diagnostics completed</Chip>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <Mascot size={150} mood="cheer" />
            <Card className="mt-4 w-full max-w-sm p-5">
              <Ladder current={5} compact />
              <p className="mt-1 text-center text-xs font-extrabold" style={{ color: C.soft }}>
                L0 - L10: the full Shining Steps ladder (your books cover L0-L8)
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* pillars */}
      <section className="mx-auto max-w-6xl px-4 pb-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: BookOpenCheck, t: "Reading", d: "Stories, notices, menus, timetables, essays - from first words to critical reading.", c: C.teal },
            { icon: Headphones, t: "Listening", d: "Real voices and dialogues, played right in your browser, twice per question.", c: C.amber },
            { icon: PencilLine, t: "Writing", d: "Sentence building, word order, emails and reviews - plus a Big Task your teacher reads.", c: C.coral },
            { icon: Mic, t: "Speaking", d: "Conversation moves, polite requests, debate rebuttals - the words that come out of you.", c: C.violet },
          ].map((p) => (
            <Card key={p.t} className="p-5 transition-transform hover:scale-[1.02]">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: `${p.c}1A` }}>
                <p.icon size={24} color={p.c} />
              </div>
              <h3 className="mt-3 text-lg font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>{p.t}</h3>
              <p className="mt-1 text-sm font-semibold" style={{ color: C.soft }}>{p.d}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* how it works */}
      <section className="border-y" style={{ borderColor: C.line, background: "#FDF6EA" }}>
        <div className="mx-auto max-w-6xl px-4 py-10">
          <h2 className="text-center text-3xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>How the diagnostic works</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              { n: "1", t: "Answer an adaptive ladder", d: "The engine starts mid-ladder and branches up or down by your answers - no wasted questions. About 30 questions across the four pillars." },
              { n: "2", t: "Get your exact spot", d: "You land on a Level (L0-L8), a unit and a lesson of the real Shining Steps books, with per-skill levels and a fluency percentage." },
              { n: "3", t: "See every reason, then grow", d: "Each question returns: right or wrong, why it is right, why yours did not work, and the framework tags your teachers use. Retake and watch your percent climb." },
            ].map((s) => (
              <Card key={s.n} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-full font-black text-white" style={{ background: C.coral }}>{s.n}</div>
                <h3 className="mt-3 text-lg font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>{s.t}</h3>
                <p className="mt-1 text-sm font-semibold" style={{ color: C.soft }}>{s.d}</p>
              </Card>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Chip color={C.teal}>Bloom&apos;s Revised Taxonomy</Chip>
            <Chip color={C.coral}>Webb&apos;s Depth of Knowledge</Chip>
            <Chip color={C.violet}>SOLO Taxonomy</Chip>
            <Chip color="#B25E02">Marzano</Chip>
            <Chip color="#2B6CB0">Understanding by Design</Chip>
            <Chip color="#0F766E">Universal Design for Learning</Chip>
          </div>
        </div>
      </section>

      {/* roles */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-center text-3xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>One arena, three desks</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-6">
            <GraduationCap size={30} color={C.teal} />
            <h3 className="mt-2 text-xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Students</h3>
            <p className="mt-1 text-sm font-semibold" style={{ color: C.soft }}>
              XP, streaks, badges and a climbing star. Your level, your unit, your percent of fluent English - and exactly what to revise.
            </p>
          </Card>
          <Card className="p-6">
            <Users size={30} color={C.violet} />
            <h3 className="mt-2 text-xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Teachers</h3>
            <p className="mt-1 text-sm font-semibold" style={{ color: C.soft }}>
              Create classes with join codes, see every student&apos;s latest placement, open full reports, and grade Big Task writing.
            </p>
          </Card>
          <Card className="p-6">
            <Trophy size={30} color={C.amber} />
            <h3 className="mt-2 text-xl font-black" style={{ fontFamily: "var(--font-baloo), 'Baloo 2', sans-serif", color: C.ink }}>Center</h3>
            <p className="mt-1 text-sm font-semibold" style={{ color: C.soft }}>
              Center-wide averages per pillar, the level map, verdict bands and a live feed - export everything as CSV.
            </p>
          </Card>
        </div>
        <div className="mt-8 text-center">
          <BigButton onClick={() => (me ? roleHome() : go("auth"))} color={C.coral}>
            <Brain size={20} /> Take my diagnostic
          </BigButton>
        </div>
      </section>
    </div>
  );
}
