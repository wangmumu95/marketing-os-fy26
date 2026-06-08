import { useState, useEffect } from "react";

const ENTITIES = ["PPVTL", "PPA/PPC", "EM", "LOADUP", "Others"];
const EC = {
  PPVTL: { a: "#6366f1", bg: "#eef2ff", t: "#4338ca" },
  "PPA/PPC": { a: "#0891b2", bg: "#e0f2fe", t: "#0369a1" },
  EM: { a: "#10b981", bg: "#ecfdf5", t: "#065f46" },
  LOADUP: { a: "#f59e0b", bg: "#fef3c7", t: "#92400e" },
  Others: { a: "#8b5cf6", bg: "#f5f3ff", t: "#6d28d9" },
};
const TASK_COLS = ["To Do", "In Progress", "Review", "Done"];
const CC = {
  "To Do": "#94a3b8",
  "In Progress": "#6366f1",
  Review: "#f59e0b",
  Done: "#10b981",
};
const KPI_TYPES = [
  "Leads Generated",
  "Conversion Rate",
  "Social Media",
  "Campaign ROI",
  "Revenue/Sales",
];
const KPI_UNITS = {
  "Leads Generated": "",
  "Conversion Rate": "%",
  "Social Media": "",
  "Campaign ROI": "%",
  "Revenue/Sales": "$",
};
const EXP_CATS = [
  "Lead Generation",
  "Awareness",
  "Customer Retention",
  "Essential Services",
];
const LEAD_SRCS = ["Long Term", "Short Term", "Untrackable"];
const FY_MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];
const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const PC = {
  Low: "#94a3b8",
  Medium: "#6366f1",
  High: "#f59e0b",
  Urgent: "#ef4444",
};
const MC = ["#6366f1", "#0891b2", "#10b981", "#f59e0b", "#ef4444"];
const RECUR_OPTS = ["", "weekly", "monthly", "quarterly", "yearly"];
const RECUR_LABEL = {
  weekly: "Weekly",
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

const fyNow = () => {
  const m = new Date().getMonth(),
    y = new Date().getFullYear();
  return m >= 3 ? y : y - 1;
};
const fyLabel = (y) => `FY${String(y).slice(2)}/${String(y + 1).slice(2)}`;
const fyMKey = (fy, mi) => {
  const nm = {
    Apr: 4,
    May: 5,
    Jun: 6,
    Jul: 7,
    Aug: 8,
    Sep: 9,
    Oct: 10,
    Nov: 11,
    Dec: 12,
    Jan: 1,
    Feb: 2,
    Mar: 3,
  };
  return `${mi >= 9 ? fy + 1 : fy}-${String(nm[FY_MONTHS[mi]]).padStart(
    2,
    "0"
  )}`;
};
const mkId = () => Math.random().toString(36).slice(2, 10);
const ini = (n) =>
  n
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
// backward compat: old tasks used assigneeId (string), new use assigneeIds (array)
const getIds = (t) => t.assigneeIds || (t.assigneeId ? [t.assigneeId] : []);

const DEFAULT_TEAM = MC.map((c, i) => ({
  id: `m${i + 1}`,
  name: `Member ${i + 1}`,
  color: c,
}));

import { createClient } from "@supabase/supabase-js";
const _sb = createClient(
  "https://jnxaheayzoxmhmydbeqd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpueGFoZWF5em94bWhteWRiZXFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA1MTkwMzQsImV4cCI6MjA5NjA5NTAzNH0.P_7OmeMxn10FtQhYzlnBfl2sJkjotOf8f-nGVGLXa8A"
);
const sv = async (k, v) => {
  await _sb.from("mkt_store").upsert({ key: k, value: JSON.stringify(v) });
};
const ld = async (k, fb) => {
  try {
    const { data } = await _sb
      .from("mkt_store")
      .select("value")
      .eq("key", k)
      .single();
    if (data) return JSON.parse(data.value);
  } catch {}
  return fb;
};

/* ── Shared UI ───────────────────────────────────────────────────────────── */
const Avatar = ({ name, color, size = 28 }) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: "50%",
      background: color + "25",
      border: `1.5px solid ${color}55`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: size * 0.34,
      fontWeight: 500,
      color,
      flexShrink: 0,
    }}
  >
    {ini(name)}
  </div>
);

// Stacked avatars for multi-assignee display
function AvatarStack({ assignees, size = 18 }) {
  const show = assignees.slice(0, 3);
  const extra = assignees.length - 3;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {show.map((m, i) => (
        <div
          key={m.id}
          style={{
            marginLeft: i > 0 ? -5 : 0,
            zIndex: show.length - i,
            position: "relative",
          }}
        >
          <Avatar name={m.name} color={m.color} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            marginLeft: -5,
            width: size,
            height: size,
            borderRadius: "50%",
            background: "var(--color-background-secondary)",
            border: "1.5px solid var(--color-border-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: size * 0.34,
            fontWeight: 500,
            color: "var(--color-text-secondary)",
            flexShrink: 0,
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

const Chip = ({ label, ec }) => {
  const c = EC[ec] || { bg: "#f1f5f9", t: "#475569" };
  return (
    <span
      style={{
        background: c.bg,
        color: c.t,
        fontSize: "10px",
        fontWeight: 500,
        padding: "2px 6px",
        borderRadius: "4px",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.55)",
        zIndex: 1000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "50px 16px 16px",
      }}
    >
      <div
        style={{
          background: "var(--color-background-primary)",
          borderRadius: "12px",
          border: "0.5px solid var(--color-border-secondary)",
          width: "100%",
          maxWidth: wide ? 580 : 460,
          maxHeight: "88vh",
          overflow: "auto",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 18px",
            borderBottom: "0.5px solid var(--color-border-tertiary)",
            position: "sticky",
            top: 0,
            background: "var(--color-background-primary)",
            zIndex: 1,
          }}
        >
          <span style={{ fontSize: "14px", fontWeight: 500 }}>{title}</span>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-secondary)",
              padding: "2px",
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            <i className="ti ti-x" />
          </button>
        </div>
        <div style={{ padding: "18px" }}>{children}</div>
      </div>
    </div>
  );
}

const Lbl = ({ s, children, span }) => (
  <div style={{ marginBottom: 12, gridColumn: span ? "1/-1" : "" }}>
    <div
      style={{
        fontSize: 11,
        color: "var(--color-text-secondary)",
        fontWeight: 500,
        marginBottom: 4,
      }}
    >
      {s}
    </div>
    {children}
  </div>
);
const Grid2 = ({ children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
    {children}
  </div>
);
const Inp = (p) => (
  <input
    {...p}
    style={{ width: "100%", boxSizing: "border-box", fontSize: 13, ...p.style }}
  />
);
const Sel = ({ children, ...p }) => (
  <select {...p} style={{ width: "100%", fontSize: 13, ...p.style }}>
    {children}
  </select>
);

const PBtn = ({ children, onClick, style = {} }) => (
  <button
    onClick={onClick}
    style={{
      background: "#6366f1",
      color: "white",
      border: "none",
      cursor: "pointer",
      padding: "7px 16px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 500,
      ...style,
    }}
  >
    {children}
  </button>
);
const GhostBtn = ({ children, onClick, danger, color }) => (
  <button
    onClick={onClick}
    style={{
      background: danger ? "#fee2e2" : color ? color + "15" : "none",
      color: danger ? "#dc2626" : color || "var(--color-text-primary)",
      border:
        danger || color ? "none" : "0.5px solid var(--color-border-secondary)",
      cursor: "pointer",
      padding: "6px 14px",
      borderRadius: "6px",
      fontSize: "13px",
      fontWeight: 500,
    }}
  >
    {children}
  </button>
);

const TH = {
  padding: "8px 12px",
  textAlign: "left",
  fontSize: "11px",
  fontWeight: 500,
  color: "var(--color-text-secondary)",
  whiteSpace: "nowrap",
};
const TD = {
  padding: "8px 12px",
  textAlign: "left",
  fontSize: "12px",
  whiteSpace: "nowrap",
};

/* ── App root ────────────────────────────────────────────────────────────── */
export default function App() {
  const [page, setPage] = useState("dashboard");
  const [team, setTeam] = useState(DEFAULT_TEAM);
  const [tasks, setTasks] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [expenses, setExp] = useState({});
  const [leads, setLeads] = useState({});
  const [fy, setFy] = useState(fyNow());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, tk, k, e, l] = await Promise.all([
        ld("mkt_team", DEFAULT_TEAM),
        ld("mkt_tasks", []),
        ld("mkt_kpis", []),
        ld("mkt_exp", {}),
        ld("mkt_leads", {}),
      ]);
      setTeam(t);
      setTasks(tk);
      setKpis(k);
      setExp(e);
      setLeads(l);
      setReady(true);
    })();
  }, []);

  const svTeam = (t) => {
    setTeam(t);
    sv("mkt_team", t);
  };
  const svTasks = (t) => {
    setTasks(t);
    sv("mkt_tasks", t);
  };
  const svKpis = (k) => {
    setKpis(k);
    sv("mkt_kpis", k);
  };
  const svExp = (e) => {
    setExp(e);
    sv("mkt_exp", e);
  };
  const svLeads = (l) => {
    setLeads(l);
    sv("mkt_leads", l);
  };

  if (!ready)
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "var(--color-text-secondary)",
          fontSize: 13,
        }}
      >
        Loading…
      </div>
    );

  const NAV = [
    { id: "dashboard", icon: "ti-layout-dashboard", label: "Dashboard" },
    { id: "tasks", icon: "ti-layout-kanban", label: "Tasks" },
    { id: "kpis", icon: "ti-target", label: "KPIs" },
    { id: "finance", icon: "ti-report-money", label: "Finance" },
    { id: "settings", icon: "ti-settings", label: "Settings" },
  ];

  return (
    <div
      style={{
        display: "flex",
        minHeight: 620,
        fontFamily: "'Calibri', 'Trebuchet MS', Arial, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: 186,
          flexShrink: 0,
          background: "#0f172a",
          borderRadius: "12px 0 0 12px",
          padding: "20px 10px",
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.28)",
            fontSize: "9px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            padding: "0 8px",
            marginBottom: 14,
          }}
        >
          Marketing OS
        </div>
        {NAV.map((n) => {
          const active = page === n.id;
          return (
            <button
              key={n.id}
              onClick={() => setPage(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "8px 10px",
                borderRadius: 7,
                border: active
                  ? "0.5px solid rgba(99,102,241,0.35)"
                  : "0.5px solid transparent",
                background: active ? "rgba(99,102,241,0.18)" : "transparent",
                color: active ? "#a5b4fc" : "rgba(255,255,255,0.45)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                textAlign: "left",
                width: "100%",
                transition: "all 0.12s",
              }}
            >
              <i
                className={`ti ${n.icon}`}
                style={{ fontSize: 15 }}
                aria-hidden
              />
              {n.label}
            </button>
          );
        })}
        <div
          style={{
            marginTop: "auto",
            paddingTop: 14,
            borderTop: "0.5px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.2)",
              fontSize: "9px",
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              padding: "0 4px",
              marginBottom: 8,
            }}
          >
            Team
          </div>
          {team.map((m) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "3px 4px",
                marginBottom: 1,
              }}
            >
              <div
                style={{
                  width: 19,
                  height: 19,
                  borderRadius: "50%",
                  background: m.color + "28",
                  border: `1.5px solid ${m.color}45`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "8px",
                  fontWeight: 500,
                  color: m.color,
                  flexShrink: 0,
                }}
              >
                {ini(m.name)}
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.36)",
                  fontSize: "10px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {m.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          padding: "22px 24px",
          overflow: "auto",
          minWidth: 0,
          background: "var(--color-background-tertiary)",
          borderRadius: "0 12px 12px 0",
        }}
      >
        {page === "dashboard" && (
          <DashPage
            team={team}
            tasks={tasks}
            kpis={kpis}
            expenses={expenses}
            leads={leads}
            fy={fy}
            setPage={setPage}
          />
        )}
        {page === "tasks" && (
          <TasksPage team={team} tasks={tasks} saveTasks={svTasks} />
        )}
        {page === "kpis" && (
          <KpisPage team={team} kpis={kpis} saveKpis={svKpis} fy={fy} />
        )}
        {page === "finance" && (
          <FinPage
            expenses={expenses}
            saveExp={svExp}
            leads={leads}
            saveLeads={svLeads}
            fy={fy}
          />
        )}
        {page === "settings" && (
          <SettingsPage team={team} saveTeam={svTeam} fy={fy} setFy={setFy} />
        )}
      </div>
    </div>
  );
}

/* ── Dashboard ───────────────────────────────────────────────────────────── */
function DashPage({ team, tasks, kpis, expenses, leads, fy, setPage }) {
  const now = new Date();
  const curKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}`;

  const monthExp = Object.values(expenses[curKey] || {}).reduce(
    (s, v) => s + (+v || 0),
    0
  );
  const monthLeads = Object.values(leads[curKey] || {}).reduce(
    (s, v) => s + (+v || 0),
    0
  );
  const cpl =
    monthLeads > 0 && monthExp > 0 ? (monthExp / monthLeads).toFixed(2) : null;
  const inProg = tasks.filter((t) => t.status === "In Progress").length;
  const overdue = tasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== "Done"
  ).length;

  const CARDS = [
    { l: "In progress", v: inProg, i: "ti-loader-2", c: "#6366f1" },
    { l: "Overdue", v: overdue, i: "ti-alert-circle", c: "#ef4444" },
    { l: "Leads (mtd)", v: monthLeads || "-", i: "ti-user-plus", c: "#0891b2" },
    {
      l: "Spend (mtd)",
      v: monthExp ? `$${monthExp.toLocaleString()}` : "-",
      i: "ti-cash",
      c: "#10b981",
    },
    {
      l: "Cost per lead",
      v: cpl ? `$${cpl}` : "-",
      i: "ti-coin",
      c: "#f59e0b",
    },
  ];

  const mStats = team.map((m) => ({
    ...m,
    todo: tasks.filter((t) => getIds(t).includes(m.id) && t.status === "To Do")
      .length,
    ip: tasks.filter(
      (t) => getIds(t).includes(m.id) && t.status === "In Progress"
    ).length,
    review: tasks.filter(
      (t) => getIds(t).includes(m.id) && t.status === "Review"
    ).length,
    done: tasks.filter((t) => getIds(t).includes(m.id) && t.status === "Done")
      .length,
  }));

  const eKpiSum = ENTITIES.map((e) => {
    const ek = kpis.filter((k) => k.entity === e);
    if (!ek.length) return { e, pct: null };
    const avg =
      ek.reduce(
        (s, k) =>
          s + (k.target > 0 ? Math.min(100, (k.current / k.target) * 100) : 0),
        0
      ) / ek.length;
    return { e, pct: Math.round(avg), count: ek.length };
  });

  return (
    <div>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Dashboard</h2>
        <p
          style={{
            margin: "3px 0 0",
            fontSize: 12,
            color: "var(--color-text-secondary)",
          }}
        >
          {fyLabel(fy)} ·{" "}
          {now.toLocaleDateString("en-SG", { month: "long", year: "numeric" })}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5,1fr)",
          gap: 10,
          marginBottom: 18,
        }}
      >
        {CARDS.map((c) => (
          <div
            key={c.l}
            style={{
              background: "var(--color-background-primary)",
              border: "0.5px solid var(--color-border-tertiary)",
              borderRadius: 10,
              padding: "12px 14px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                marginBottom: 6,
              }}
            >
              <i
                className={`ti ${c.i}`}
                style={{ fontSize: 13, color: c.c }}
                aria-hidden
              />
              <span
                style={{
                  fontSize: "10px",
                  color: "var(--color-text-secondary)",
                  fontWeight: 500,
                  lineHeight: 1.2,
                }}
              >
                {c.l}
              </span>
            </div>
            <div style={{ fontSize: 20, fontWeight: 500 }}>{c.v}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.15fr 0.85fr",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>Team workload</span>
            <button
              onClick={() => setPage("tasks")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: "#6366f1",
                fontWeight: 500,
              }}
            >
              View tasks →
            </button>
          </div>
          {mStats.map((m) => {
            const total = m.todo + m.ip + m.review + m.done;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <Avatar name={m.name} color={m.color} size={26} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {m.name}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "var(--color-text-secondary)",
                        whiteSpace: "nowrap",
                        marginLeft: 4,
                      }}
                    >
                      {m.todo + m.ip + m.review} active
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: 2,
                      height: 4,
                      borderRadius: 2,
                      overflow: "hidden",
                      background: "var(--color-background-secondary)",
                    }}
                  >
                    {total === 0 && (
                      <div
                        style={{
                          flex: 1,
                          background: "var(--color-background-secondary)",
                        }}
                      />
                    )}
                    {m.todo > 0 && (
                      <div style={{ flex: m.todo, background: "#cbd5e1" }} />
                    )}
                    {m.ip > 0 && (
                      <div style={{ flex: m.ip, background: "#6366f1" }} />
                    )}
                    {m.review > 0 && (
                      <div style={{ flex: m.review, background: "#f59e0b" }} />
                    )}
                    {m.done > 0 && (
                      <div style={{ flex: m.done, background: "#10b981" }} />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div
            style={{
              display: "flex",
              gap: 10,
              marginTop: 10,
              paddingTop: 10,
              borderTop: "0.5px solid var(--color-border-tertiary)",
            }}
          >
            {[
              ["#cbd5e1", "To Do"],
              ["#6366f1", "In Progress"],
              ["#f59e0b", "Review"],
              ["#10b981", "Done"],
            ].map(([c, l]) => (
              <div
                key={l}
                style={{ display: "flex", alignItems: "center", gap: 4 }}
              >
                <div
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {l}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)",
            borderRadius: 10,
            padding: "14px 16px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 500 }}>KPI overview</span>
            <button
              onClick={() => setPage("kpis")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: 11,
                color: "#6366f1",
                fontWeight: 500,
              }}
            >
              View →
            </button>
          </div>
          {eKpiSum.map(({ e, pct, count }) => {
            const c = EC[e] || { a: "#94a3b8" };
            return (
              <div key={e} style={{ marginBottom: 13 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 500 }}>{e}</span>
                  <span
                    style={{
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {pct === null ? "No KPIs" : `${pct}%`}
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    borderRadius: 2,
                    background: "var(--color-background-secondary)",
                    overflow: "hidden",
                  }}
                >
                  {pct !== null && (
                    <div
                      style={{
                        width: `${pct}%`,
                        height: "100%",
                        background: c.a,
                        transition: "width 0.3s",
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "14px 16px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500 }}>All tasks</span>
          <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
            {tasks.length} total
          </span>
        </div>
        {tasks.length === 0 && (
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              margin: 0,
              textAlign: "center",
              padding: "20px 0",
            }}
          >
            No tasks yet — head to Tasks to add some.
          </p>
        )}
        {tasks.slice(0, 8).map((t) => {
          const ids = getIds(t);
          const assignees = team.filter((m) => ids.includes(m.id));
          const od =
            t.dueDate && new Date(t.dueDate) < now && t.status !== "Done";
          const stDone = (t.subtasks || []).filter((s) => s.done).length;
          const stTotal = (t.subtasks || []).length;
          return (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                borderBottom: "0.5px solid var(--color-border-tertiary)",
              }}
            >
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: CC[t.status] || "#94a3b8",
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: 12,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {t.title}
              </span>
              {t.recurring && (
                <i
                  className="ti ti-repeat"
                  style={{ fontSize: 11, color: "#94a3b8" }}
                  aria-hidden
                />
              )}
              {stTotal > 0 && (
                <span
                  style={{ fontSize: 10, color: "var(--color-text-secondary)" }}
                >
                  {stDone}/{stTotal}
                </span>
              )}
              {t.entity && <Chip label={t.entity} ec={t.entity} />}
              <span
                style={{
                  fontSize: 10,
                  color: od ? "#ef4444" : "var(--color-text-secondary)",
                  whiteSpace: "nowrap",
                }}
              >
                {t.status}
              </span>
              {assignees.length > 0 && (
                <AvatarStack assignees={assignees} size={20} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Tasks Page ──────────────────────────────────────────────────────────── */
function TasksPage({ team, tasks, saveTasks }) {
  const [fm, setFm] = useState("all");
  const [fe, setFe] = useState("all");
  const [modal, setModal] = useState(null);
  const [dragId, setDrag] = useState(null);
  const now = new Date();

  const filtered = tasks.filter(
    (t) =>
      (fm === "all" || getIds(t).includes(fm)) &&
      (fe === "all" || t.entity === fe)
  );

  const addTask = (d) => {
    saveTasks([
      {
        ...d,
        id: mkId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      ...tasks,
    ]);
    setModal(null);
  };
  const upTask = (id, d) => {
    saveTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, ...d, updatedAt: new Date().toISOString() } : t
      )
    );
    setModal(null);
  };
  const delTask = (id) => {
    saveTasks(tasks.filter((t) => t.id !== id));
    setModal(null);
  };
  const moveTask = (id, status) =>
    saveTasks(
      tasks.map((t) =>
        t.id === id ? { ...t, status, updatedAt: new Date().toISOString() } : t
      )
    );
  const createNext = (newTask) => {
    saveTasks([newTask, ...tasks]);
    setModal(null);
  };
  const toggleSub = (taskId, subId) => {
    saveTasks(
      tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: (t.subtasks || []).map((s) =>
                s.id === subId ? { ...s, done: !s.done } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>Tasks</h2>
        <PBtn onClick={() => setModal("add")}>
          <i className="ti ti-plus" style={{ marginRight: 4 }} aria-hidden />{" "}
          Add task
        </PBtn>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 14,
          alignItems: "center",
        }}
      >
        <Sel
          value={fm}
          onChange={(e) => setFm(e.target.value)}
          style={{ width: "auto", fontSize: 12 }}
        >
          <option value="all">All members</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Sel>
        <Sel
          value={fe}
          onChange={(e) => setFe(e.target.value)}
          style={{ width: "auto", fontSize: 12 }}
        >
          <option value="all">All entities</option>
          {ENTITIES.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </Sel>
        <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>
          {filtered.length} tasks
        </span>
      </div>

      {/* Kanban */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: 10,
          alignItems: "start",
        }}
      >
        {TASK_COLS.map((col) => {
          const colT = filtered.filter((t) => t.status === col);
          return (
            <div
              key={col}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragId) {
                  moveTask(dragId, col);
                  setDrag(null);
                }
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 8,
                }}
              >
                <div
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: CC[col],
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 500 }}>{col}</span>
                <span
                  style={{
                    fontSize: 10,
                    color: "var(--color-text-secondary)",
                    marginLeft: "auto",
                    background: "var(--color-background-secondary)",
                    padding: "1px 6px",
                    borderRadius: 8,
                  }}
                >
                  {colT.length}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 7,
                  minHeight: 50,
                }}
              >
                {colT.map((t) => {
                  const ids = getIds(t);
                  const assignees = team.filter((m) => ids.includes(m.id));
                  const ec = EC[t.entity] || { a: "#94a3b8" };
                  const od =
                    t.dueDate &&
                    new Date(t.dueDate) < now &&
                    t.status !== "Done";
                  const stDone = (t.subtasks || []).filter(
                    (s) => s.done
                  ).length;
                  const stTotal = (t.subtasks || []).length;
                  const stPct =
                    stTotal > 0 ? Math.round((stDone / stTotal) * 100) : null;
                  return (
                    <div
                      key={t.id}
                      draggable
                      onDragStart={() => setDrag(t.id)}
                      onClick={() => setModal({ edit: t })}
                      style={{
                        background: "var(--color-background-primary)",
                        border: "0.5px solid var(--color-border-tertiary)",
                        borderLeft: `3px solid ${ec.a}`,
                        borderRadius: 8,
                        padding: "9px 10px",
                        cursor: "pointer",
                      }}
                    >
                      {/* Title row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 5,
                          marginBottom: 6,
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: 12,
                            fontWeight: 500,
                            lineHeight: 1.3,
                            flex: 1,
                          }}
                        >
                          {t.title}
                        </p>
                        {t.recurring && (
                          <span
                            title={`Repeats ${t.recurring}`}
                            style={{
                              background: "#f0f9ff",
                              color: "#0891b2",
                              fontSize: "9px",
                              fontWeight: 500,
                              padding: "1px 5px",
                              borderRadius: 4,
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            <i
                              className="ti ti-repeat"
                              style={{ fontSize: 9, marginRight: 2 }}
                              aria-hidden
                            />
                            {RECUR_LABEL[t.recurring]}
                          </span>
                        )}
                      </div>

                      {/* Sub-task progress bar */}
                      {stTotal > 0 && (
                        <div
                          style={{ marginBottom: 7 }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: 3,
                            }}
                          >
                            <span
                              style={{
                                fontSize: "9px",
                                color: "var(--color-text-secondary)",
                              }}
                            >
                              Milestones
                            </span>
                            <span
                              style={{
                                fontSize: "9px",
                                color:
                                  stDone === stTotal
                                    ? "#10b981"
                                    : "var(--color-text-secondary)",
                                fontWeight: stDone === stTotal ? 500 : 400,
                              }}
                            >
                              {stDone}/{stTotal}
                            </span>
                          </div>
                          <div
                            style={{
                              height: 3,
                              borderRadius: 2,
                              background: "var(--color-background-secondary)",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${stPct}%`,
                                height: "100%",
                                background:
                                  stDone === stTotal ? "#10b981" : ec.a,
                                transition: "width 0.25s",
                              }}
                            />
                          </div>
                          {/* Quick-check subtasks */}
                          <div style={{ marginTop: 5 }}>
                            {(t.subtasks || []).map((sub) => (
                              <div
                                key={sub.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSub(t.id, sub.id);
                                }}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 5,
                                  padding: "2px 0",
                                  cursor: "pointer",
                                }}
                              >
                                <div
                                  style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 3,
                                    border: `1.5px solid ${
                                      sub.done
                                        ? ec.a
                                        : "var(--color-border-secondary)"
                                    }`,
                                    background: sub.done ? ec.a : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                  }}
                                >
                                  {sub.done && (
                                    <i
                                      className="ti ti-check"
                                      style={{ fontSize: 8, color: "white" }}
                                      aria-hidden
                                    />
                                  )}
                                </div>
                                <span
                                  style={{
                                    fontSize: "10px",
                                    color: "var(--color-text-secondary)",
                                    textDecoration: sub.done
                                      ? "line-through"
                                      : "none",
                                    lineHeight: 1.3,
                                  }}
                                >
                                  {sub.title}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Footer row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        {t.entity && <Chip label={t.entity} ec={t.entity} />}
                        <div
                          style={{
                            marginLeft: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <div
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: PC[t.priority] || "#94a3b8",
                            }}
                          />
                          {assignees.length > 0 && (
                            <AvatarStack assignees={assignees} size={18} />
                          )}
                        </div>
                      </div>
                      {t.dueDate && (
                        <p
                          style={{
                            margin: "5px 0 0",
                            fontSize: 10,
                            color: od
                              ? "#ef4444"
                              : "var(--color-text-secondary)",
                          }}
                        >
                          {od ? "⚠ " : ""}Due {t.dueDate}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {modal === "add" && (
        <TaskModal
          title="New task"
          onClose={() => setModal(null)}
          onSave={addTask}
          team={team}
        />
      )}
      {modal?.edit && (
        <TaskModal
          title="Edit task"
          task={modal.edit}
          onClose={() => setModal(null)}
          onSave={(d) => upTask(modal.edit.id, d)}
          onDelete={() => delTask(modal.edit.id)}
          onCreateNext={createNext}
          team={team}
        />
      )}
    </div>
  );
}

/* ── Task Modal (updated: multi-assignee, subtasks, recurring) ───────────── */
function TaskModal({
  title,
  task,
  onClose,
  onSave,
  onDelete,
  onCreateNext,
  team,
}) {
  const [f, setF] = useState({
    title: task?.title || "",
    description: task?.description || "",
    assigneeIds: task ? getIds(task) : [],
    entity: task?.entity || "",
    priority: task?.priority || "Medium",
    status: task?.status || "To Do",
    dueDate: task?.dueDate || "",
    recurring: task?.recurring || "",
    subtasks: task?.subtasks || [],
  });
  const [newSt, setNewSt] = useState("");
  const s = (k, v) => setF((x) => ({ ...x, [k]: v }));

  const toggleAssignee = (id) => {
    s(
      "assigneeIds",
      f.assigneeIds.includes(id)
        ? f.assigneeIds.filter((x) => x !== id)
        : [...f.assigneeIds, id]
    );
  };

  const addSub = () => {
    if (!newSt.trim()) return;
    s("subtasks", [
      ...f.subtasks,
      { id: mkId(), title: newSt.trim(), done: false },
    ]);
    setNewSt("");
  };
  const toggleSub = (id) =>
    s(
      "subtasks",
      f.subtasks.map((st) => (st.id === id ? { ...st, done: !st.done } : st))
    );
  const delSub = (id) =>
    s(
      "subtasks",
      f.subtasks.filter((st) => st.id !== id)
    );
  const moveSub = (i, dir) => {
    const arr = [...f.subtasks];
    const ni = i + dir;
    if (ni < 0 || ni >= arr.length) return;
    [arr[i], arr[ni]] = [arr[ni], arr[i]];
    s("subtasks", arr);
  };

  const handleCreateNext = () => {
    let nd = "";
    if (f.dueDate && f.recurring) {
      const d = new Date(f.dueDate);
      if (f.recurring === "weekly") d.setDate(d.getDate() + 7);
      if (f.recurring === "monthly") d.setMonth(d.getMonth() + 1);
      if (f.recurring === "quarterly") d.setMonth(d.getMonth() + 3);
      if (f.recurring === "yearly") d.setFullYear(d.getFullYear() + 1);
      nd = d.toISOString().slice(0, 10);
    }
    const next = {
      ...f,
      id: mkId(),
      status: "To Do",
      dueDate: nd,
      subtasks: f.subtasks.map((st) => ({ ...st, done: false })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onCreateNext(next);
  };

  const stDone = f.subtasks.filter((s) => s.done).length;

  return (
    <Modal title={title} onClose={onClose} wide>
      <Lbl s="Task title" span>
        <Inp
          value={f.title}
          onChange={(e) => s("title", e.target.value)}
          placeholder="What needs to be done?"
        />
      </Lbl>
      <Lbl s="Description" span>
        <textarea
          value={f.description}
          onChange={(e) => s("description", e.target.value)}
          placeholder="Optional notes…"
          rows={2}
          style={{
            width: "100%",
            boxSizing: "border-box",
            fontSize: 13,
            padding: "6px 10px",
            border: "0.5px solid var(--color-border-secondary)",
            borderRadius: 6,
            resize: "vertical",
            background: "var(--color-background-primary)",
            color: "var(--color-text-primary)",
            fontFamily: "'Calibri', 'Trebuchet MS', Arial, sans-serif",
          }}
        />
      </Lbl>

      <Grid2>
        <Lbl s="Entity">
          <Sel value={f.entity} onChange={(e) => s("entity", e.target.value)}>
            <option value="">None</option>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Sel>
        </Lbl>
        <Lbl s="Priority">
          <Sel
            value={f.priority}
            onChange={(e) => s("priority", e.target.value)}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Sel>
        </Lbl>
        <Lbl s="Status">
          <Sel value={f.status} onChange={(e) => s("status", e.target.value)}>
            {TASK_COLS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Sel>
        </Lbl>
        <Lbl s="Recurring">
          <Sel
            value={f.recurring}
            onChange={(e) => s("recurring", e.target.value)}
          >
            <option value="">Not recurring</option>
            {RECUR_OPTS.filter(Boolean).map((r) => (
              <option key={r} value={r}>
                {RECUR_LABEL[r]}
              </option>
            ))}
          </Sel>
        </Lbl>
      </Grid2>

      <Lbl s="Due date" span>
        <Inp
          type="date"
          value={f.dueDate}
          onChange={(e) => s("dueDate", e.target.value)}
          style={{ width: "auto" }}
        />
      </Lbl>

      {/* Assignees — multi-select */}
      <Lbl s="Assigned to (select one or more)" span>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}
        >
          {team.map((m) => {
            const checked = f.assigneeIds.includes(m.id);
            return (
              <label
                key={m.id}
                onClick={() => toggleAssignee(m.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: `1.5px solid ${
                    checked ? m.color + "80" : "var(--color-border-tertiary)"
                  }`,
                  background: checked ? m.color + "10" : "transparent",
                  transition: "all 0.12s",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 4,
                    border: `1.5px solid ${
                      checked ? m.color : "var(--color-border-secondary)"
                    }`,
                    background: checked ? m.color : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {checked && (
                    <i
                      className="ti ti-check"
                      style={{ fontSize: 10, color: "white" }}
                      aria-hidden
                    />
                  )}
                </div>
                <Avatar name={m.name} color={m.color} size={20} />
                <span style={{ fontSize: 12, fontWeight: checked ? 500 : 400 }}>
                  {m.name}
                </span>
              </label>
            );
          })}
        </div>
      </Lbl>

      {/* Sub-tasks / Milestones */}
      <div
        style={{
          borderTop: "0.5px solid var(--color-border-tertiary)",
          paddingTop: 14,
          marginTop: 4,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 500 }}>
            Milestones / sub-tasks
          </span>
          {f.subtasks.length > 0 && (
            <span
              style={{
                fontSize: 11,
                color:
                  stDone === f.subtasks.length && f.subtasks.length > 0
                    ? "#10b981"
                    : "var(--color-text-secondary)",
                fontWeight:
                  stDone === f.subtasks.length && f.subtasks.length > 0
                    ? 500
                    : 400,
              }}
            >
              {stDone}/{f.subtasks.length} done
            </span>
          )}
        </div>

        {f.subtasks.length > 0 && (
          <div
            style={{
              marginBottom: 10,
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {f.subtasks.map((st, i) => (
              <div
                key={st.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "5px 8px",
                  borderRadius: 7,
                  background: st.done
                    ? "var(--color-background-secondary)"
                    : "transparent",
                  border: "0.5px solid var(--color-border-tertiary)",
                }}
              >
                <div
                  onClick={() => toggleSub(st.id)}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: 3,
                    border: `1.5px solid ${
                      st.done ? "#10b981" : "var(--color-border-secondary)"
                    }`,
                    background: st.done ? "#10b981" : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    cursor: "pointer",
                  }}
                >
                  {st.done && (
                    <i
                      className="ti ti-check"
                      style={{ fontSize: 9, color: "white" }}
                      aria-hidden
                    />
                  )}
                </div>
                <span
                  style={{
                    flex: 1,
                    fontSize: 12,
                    textDecoration: st.done ? "line-through" : "none",
                    color: st.done
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-primary)",
                  }}
                >
                  {st.title}
                </span>
                <div style={{ display: "flex", gap: 2 }}>
                  <button
                    onClick={() => moveSub(i, -1)}
                    disabled={i === 0}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: i === 0 ? "default" : "pointer",
                      color: "var(--color-text-secondary)",
                      padding: "1px 3px",
                      opacity: i === 0 ? 0.3 : 1,
                    }}
                  >
                    <i className="ti ti-chevron-up" style={{ fontSize: 11 }} />
                  </button>
                  <button
                    onClick={() => moveSub(i, 1)}
                    disabled={i === f.subtasks.length - 1}
                    style={{
                      background: "none",
                      border: "none",
                      cursor:
                        i === f.subtasks.length - 1 ? "default" : "pointer",
                      color: "var(--color-text-secondary)",
                      padding: "1px 3px",
                      opacity: i === f.subtasks.length - 1 ? 0.3 : 1,
                    }}
                  >
                    <i
                      className="ti ti-chevron-down"
                      style={{ fontSize: 11 }}
                    />
                  </button>
                  <button
                    onClick={() => delSub(st.id)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#ef4444",
                      padding: "1px 3px",
                    }}
                  >
                    <i className="ti ti-x" style={{ fontSize: 11 }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 6 }}>
          <Inp
            value={newSt}
            onChange={(e) => setNewSt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSub())
            }
            placeholder="Add a milestone or sub-task…"
            style={{ fontSize: 12 }}
          />
          <button
            onClick={addSub}
            style={{
              background: "#6366f1",
              color: "white",
              border: "none",
              cursor: "pointer",
              padding: "6px 12px",
              borderRadius: 6,
              fontSize: 12,
              whiteSpace: "nowrap",
              fontWeight: 500,
            }}
          >
            + Add
          </button>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 16,
          paddingTop: 14,
          borderTop: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {onDelete ? (
          <GhostBtn danger onClick={onDelete}>
            Delete
          </GhostBtn>
        ) : (
          <span />
        )}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {f.recurring && onCreateNext && (
            <GhostBtn color="#0891b2" onClick={handleCreateNext}>
              <i
                className="ti ti-repeat"
                style={{ marginRight: 4, fontSize: 12 }}
                aria-hidden
              />
              Next occurrence
            </GhostBtn>
          )}
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PBtn onClick={() => f.title && onSave(f)}>Save task</PBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── KPIs Page ───────────────────────────────────────────────────────────── */
function KpisPage({ team, kpis, saveKpis, fy }) {
  const [entity, setEntity] = useState(ENTITIES[0]);
  const [modal, setModal] = useState(null);

  const ek = kpis.filter((k) => k.entity === entity);
  const addKpi = (d) => {
    saveKpis([...kpis, { ...d, id: mkId() }]);
    setModal(null);
  };
  const upKpi = (id, d) => {
    saveKpis(kpis.map((k) => (k.id === id ? { ...k, ...d } : k)));
    setModal(null);
  };
  const delKpi = (id) => {
    saveKpis(kpis.filter((k) => k.id !== id));
    setModal(null);
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 14,
        }}
      >
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
          KPIs — {fyLabel(fy)}
        </h2>
        <PBtn onClick={() => setModal("add")}>
          <i className="ti ti-plus" style={{ marginRight: 4 }} aria-hidden />{" "}
          Add KPI
        </PBtn>
      </div>
      <div
        style={{
          display: "flex",
          marginBottom: 18,
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {ENTITIES.map((e) => {
          const { a } = EC[e] || { a: "#94a3b8" };
          const active = e === entity;
          const cnt = kpis.filter((k) => k.entity === e).length;
          return (
            <button
              key={e}
              onClick={() => setEntity(e)}
              style={{
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: active ? 500 : 400,
                border: "none",
                borderBottom: active
                  ? `2px solid ${a}`
                  : "2px solid transparent",
                background: "transparent",
                cursor: "pointer",
                color: active ? a : "var(--color-text-secondary)",
                marginBottom: "-0.5px",
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              {e}
              {cnt > 0 && (
                <span
                  style={{
                    background: active
                      ? a + "18"
                      : "var(--color-background-secondary)",
                    color: active ? a : "var(--color-text-secondary)",
                    fontSize: 10,
                    padding: "0 5px",
                    borderRadius: 8,
                  }}
                >
                  {cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>
      {ek.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem 1rem",
            color: "var(--color-text-secondary)",
            fontSize: 13,
          }}
        >
          No KPIs for {entity} yet.
          <br />
          <button
            onClick={() => setModal("add")}
            style={{
              marginTop: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6366f1",
              fontSize: 13,
              fontWeight: 500,
            }}
          >
            + Add first KPI
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
            gap: 12,
          }}
        >
          {ek.map((k) => {
            const pct =
              k.target > 0
                ? Math.min(100, Math.round((k.current / k.target) * 100))
                : 0;
            const { a } = EC[k.entity] || { a: "#6366f1" };
            const unit = KPI_UNITS[k.type] || "";
            const pre = unit === "$";
            const m = team.find((x) => x.id === k.assigneeId);
            const over = pct >= 100;
            return (
              <div
                key={k.id}
                onClick={() => setModal({ edit: k })}
                style={{
                  background: "var(--color-background-primary)",
                  border: `0.5px solid ${
                    over ? a + "60" : "var(--color-border-tertiary)"
                  }`,
                  borderRadius: 10,
                  padding: "14px 16px",
                  cursor: "pointer",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "10px",
                        color: "var(--color-text-secondary)",
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {k.type}
                    </p>
                    {m && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          marginTop: 4,
                        }}
                      >
                        <Avatar name={m.name} color={m.color} size={15} />
                        <span
                          style={{
                            fontSize: "9px",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {m.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 500 }}>
                    {pre ? unit : ""}
                    {Number(k.current || 0).toLocaleString()}
                    {!pre ? unit : ""}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 5,
                    fontSize: 10,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  <span
                    style={{
                      color: over ? a : "var(--color-text-secondary)",
                      fontWeight: over ? 500 : 400,
                    }}
                  >
                    {over ? "✓ Target hit" : "Progress"}
                  </span>
                  <span>
                    of {pre ? unit : ""}
                    {Number(k.target || 0).toLocaleString()}
                    {!pre ? unit : ""}
                  </span>
                </div>
                <div
                  style={{
                    height: 5,
                    borderRadius: 3,
                    background: "var(--color-background-secondary)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: a,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
                {k.notes && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.4,
                    }}
                  >
                    {k.notes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
      {modal === "add" && (
        <KpiModal
          title="New KPI"
          entity={entity}
          onClose={() => setModal(null)}
          onSave={addKpi}
          team={team}
        />
      )}
      {modal?.edit && (
        <KpiModal
          title="Edit KPI"
          kpi={modal.edit}
          entity={entity}
          onClose={() => setModal(null)}
          onSave={(d) => upKpi(modal.edit.id, d)}
          onDelete={() => delKpi(modal.edit.id)}
          team={team}
        />
      )}
    </div>
  );
}

function KpiModal({ title, kpi, entity, onClose, onSave, onDelete, team }) {
  const [f, setF] = useState({
    entity: kpi?.entity || entity,
    type: kpi?.type || KPI_TYPES[0],
    target: kpi?.target || "",
    current: kpi?.current || "",
    assigneeId: kpi?.assigneeId || "",
    notes: kpi?.notes || "",
  });
  const s = (k, v) => setF((x) => ({ ...x, [k]: v }));
  return (
    <Modal title={title} onClose={onClose}>
      <Grid2>
        <Lbl s="Entity">
          <Sel value={f.entity} onChange={(e) => s("entity", e.target.value)}>
            {ENTITIES.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </Sel>
        </Lbl>
        <Lbl s="KPI type">
          <Sel value={f.type} onChange={(e) => s("type", e.target.value)}>
            {KPI_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </Sel>
        </Lbl>
        <Lbl
          s={`FY target ${
            KPI_UNITS[f.type] ? `(${KPI_UNITS[f.type]})` : "(count)"
          }`}
        >
          <Inp
            type="number"
            value={f.target}
            onChange={(e) => s("target", e.target.value)}
            placeholder="0"
          />
        </Lbl>
        <Lbl s="Current value">
          <Inp
            type="number"
            value={f.current}
            onChange={(e) => s("current", e.target.value)}
            placeholder="0"
          />
        </Lbl>
      </Grid2>
      <Lbl s="Assigned to (individual KPI)">
        <Sel
          value={f.assigneeId}
          onChange={(e) => s("assigneeId", e.target.value)}
        >
          <option value="">Team KPI</option>
          {team.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </Sel>
      </Lbl>
      <Lbl s="Notes (optional)">
        <Inp
          value={f.notes}
          onChange={(e) => s("notes", e.target.value)}
          placeholder="e.g. Source, methodology"
        />
      </Lbl>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 14,
          paddingTop: 14,
          borderTop: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {onDelete ? (
          <GhostBtn danger onClick={onDelete}>
            Delete
          </GhostBtn>
        ) : (
          <span />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PBtn onClick={() => onSave(f)}>Save KPI</PBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── Finance Page ────────────────────────────────────────────────────────── */
function FinPage({ expenses, saveExp, leads, saveLeads, fy }) {
  const [tab, setTab] = useState("expenses");
  const [expEdit, setExpEdit] = useState(null);
  const [leadEdit, setLead] = useState(null);
  const [expF, setExpF] = useState({});
  const [leadF, setLeadF] = useState({});

  const fyMths = FY_MONTHS.map((m, i) => ({
    label: m,
    key: fyMKey(fy, i),
    year: i >= 9 ? fy + 1 : fy,
  }));
  const fyTotExp = fyMths.reduce(
    (s, { key }) =>
      s + EXP_CATS.reduce((ss, c) => ss + (+(expenses[key] || {})[c] || 0), 0),
    0
  );
  const fyTotLeads = fyMths.reduce(
    (s, { key }) =>
      s + LEAD_SRCS.reduce((ss, r) => ss + (+(leads[key] || {})[r] || 0), 0),
    0
  );

  return (
    <div>
      <h2 style={{ margin: "0 0 14px", fontSize: 18, fontWeight: 500 }}>
        Finance — {fyLabel(fy)}
      </h2>
      <div
        style={{
          display: "flex",
          marginBottom: 18,
          borderBottom: "0.5px solid var(--color-border-tertiary)",
        }}
      >
        {[
          ["expenses", "Expenses"],
          ["leads", "Leads & CPL"],
        ].map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: tab === id ? 500 : 400,
              border: "none",
              borderBottom:
                tab === id ? "2px solid #6366f1" : "2px solid transparent",
              background: "transparent",
              cursor: "pointer",
              color: tab === id ? "#6366f1" : "var(--color-text-secondary)",
              marginBottom: "-0.5px",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "expenses" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {EXP_CATS.map((c) => {
              const tot = fyMths.reduce(
                (s, { key }) => s + (+(expenses[key] || {})[c] || 0),
                0
              );
              return (
                <div
                  key={c}
                  style={{
                    background: "var(--color-background-primary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: 10,
                    padding: "12px 14px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 5px",
                      fontSize: 10,
                      color: "var(--color-text-secondary)",
                      fontWeight: 500,
                    }}
                  >
                    {c}
                  </p>
                  <p style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>
                    {tot > 0 ? `$${tot.toLocaleString()}` : "-"}
                  </p>
                </div>
              );
            })}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  <th style={TH}>Month</th>
                  {EXP_CATS.map((c) => (
                    <th key={c} style={TH}>
                      {c}
                    </th>
                  ))}
                  <th style={TH}>Total</th>
                  <th style={TH} />
                </tr>
              </thead>
              <tbody>
                {fyMths.map(({ label, key, year }) => {
                  const r = expenses[key] || {};
                  const tot = EXP_CATS.reduce((s, c) => s + (+r[c] || 0), 0);
                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary)",
                      }}
                    >
                      <td style={{ ...TD, fontWeight: 500 }}>
                        {label} {year}
                      </td>
                      {EXP_CATS.map((c) => (
                        <td key={c} style={TD}>
                          {r[c] ? `$${Number(r[c]).toLocaleString()}` : "-"}
                        </td>
                      ))}
                      <td style={{ ...TD, fontWeight: 500 }}>
                        {tot > 0 ? `$${tot.toLocaleString()}` : "-"}
                      </td>
                      <td style={TD}>
                        <button
                          onClick={() => {
                            setExpF(r);
                            setExpEdit(key);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6366f1",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr
                  style={{
                    background: "var(--color-background-secondary)",
                    borderTop: "1.5px solid var(--color-border-secondary)",
                  }}
                >
                  <td style={{ ...TD, fontWeight: 500 }}>FY Total</td>
                  {EXP_CATS.map((c) => {
                    const tot = fyMths.reduce(
                      (s, { key }) => s + (+(expenses[key] || {})[c] || 0),
                      0
                    );
                    return (
                      <td key={c} style={{ ...TD, fontWeight: 500 }}>
                        {tot > 0 ? `$${tot.toLocaleString()}` : "-"}
                      </td>
                    );
                  })}
                  <td style={{ ...TD, fontWeight: 500, color: "#6366f1" }}>
                    {fyTotExp > 0 ? `$${fyTotExp.toLocaleString()}` : "-"}
                  </td>
                  <td style={TD} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === "leads" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              marginBottom: 18,
            }}
          >
            {[
              { l: "FY leads", v: fyTotLeads || "-" },
              {
                l: "FY spend",
                v: fyTotExp ? `$${fyTotExp.toLocaleString()}` : "-",
              },
              {
                l: "FY cost per lead",
                v:
                  fyTotLeads > 0 && fyTotExp > 0
                    ? `$${(fyTotExp / fyTotLeads).toFixed(2)}`
                    : "-",
              },
              {
                l: "Avg leads/month",
                v: fyTotLeads > 0 ? Math.round(fyTotLeads / 12) : "-",
              },
            ].map(({ l, v }) => (
              <div
                key={l}
                style={{
                  background: "var(--color-background-primary)",
                  border: "0.5px solid var(--color-border-tertiary)",
                  borderRadius: 10,
                  padding: "12px 14px",
                }}
              >
                <p
                  style={{
                    margin: "0 0 5px",
                    fontSize: 10,
                    color: "var(--color-text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {l}
                </p>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 500 }}>{v}</p>
              </div>
            ))}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--color-background-secondary)" }}>
                  <th style={TH}>Month</th>
                  {LEAD_SRCS.map((s) => (
                    <th key={s} style={TH}>
                      {s}
                    </th>
                  ))}
                  <th style={TH}>Total</th>
                  <th style={TH}>Spend</th>
                  <th style={{ ...TH, color: "#6366f1" }}>CPL</th>
                  <th style={TH} />
                </tr>
              </thead>
              <tbody>
                {fyMths.map(({ label, key, year }) => {
                  const lr = leads[key] || {};
                  const er = expenses[key] || {};
                  const totL = LEAD_SRCS.reduce((s, r) => s + (+lr[r] || 0), 0);
                  const totE = EXP_CATS.reduce((s, c) => s + (+er[c] || 0), 0);
                  const cpl =
                    totL > 0 && totE > 0 ? (totE / totL).toFixed(2) : null;
                  return (
                    <tr
                      key={key}
                      style={{
                        borderBottom:
                          "0.5px solid var(--color-border-tertiary)",
                      }}
                    >
                      <td style={{ ...TD, fontWeight: 500 }}>
                        {label} {year}
                      </td>
                      {LEAD_SRCS.map((r) => (
                        <td key={r} style={TD}>
                          {lr[r] ? Number(lr[r]).toLocaleString() : "-"}
                        </td>
                      ))}
                      <td style={{ ...TD, fontWeight: 500 }}>
                        {totL > 0 ? totL.toLocaleString() : "-"}
                      </td>
                      <td style={TD}>
                        {totE > 0 ? `$${totE.toLocaleString()}` : "-"}
                      </td>
                      <td
                        style={{
                          ...TD,
                          fontWeight: 500,
                          color: cpl
                            ? "#6366f1"
                            : "var(--color-text-secondary)",
                        }}
                      >
                        {cpl ? `$${cpl}` : "-"}
                      </td>
                      <td style={TD}>
                        <button
                          onClick={() => {
                            setLeadF(lr);
                            setLead(key);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#6366f1",
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
                <tr
                  style={{
                    background: "var(--color-background-secondary)",
                    borderTop: "1.5px solid var(--color-border-secondary)",
                  }}
                >
                  <td style={{ ...TD, fontWeight: 500 }}>FY Total</td>
                  {LEAD_SRCS.map((r) => {
                    const tot = fyMths.reduce(
                      (s, { key }) => s + (+(leads[key] || {})[r] || 0),
                      0
                    );
                    return (
                      <td key={r} style={{ ...TD, fontWeight: 500 }}>
                        {tot > 0 ? tot.toLocaleString() : "-"}
                      </td>
                    );
                  })}
                  <td style={{ ...TD, fontWeight: 500 }}>
                    {fyTotLeads > 0 ? fyTotLeads.toLocaleString() : "-"}
                  </td>
                  <td style={{ ...TD, fontWeight: 500 }}>
                    {fyTotExp > 0 ? `$${fyTotExp.toLocaleString()}` : "-"}
                  </td>
                  <td style={{ ...TD, fontWeight: 500, color: "#6366f1" }}>
                    {fyTotLeads > 0 && fyTotExp > 0
                      ? `$${(fyTotExp / fyTotLeads).toFixed(2)}`
                      : "-"}
                  </td>
                  <td style={TD} />
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {expEdit && (
        <Modal
          title={`Expenses — ${
            fyMths.find((m) => m.key === expEdit)?.label
          } ${expEdit?.slice(0, 4)}`}
          onClose={() => setExpEdit(null)}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              margin: "0 0 14px",
            }}
          >
            Enter monthly spend per category
          </p>
          {EXP_CATS.map((c) => (
            <Lbl key={c} s={c}>
              <Inp
                type="number"
                value={expF[c] || ""}
                onChange={(e) =>
                  setExpF((f) => ({ ...f, [c]: e.target.value }))
                }
                placeholder="0"
              />
            </Lbl>
          ))}
          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 14,
            }}
          >
            <span
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Total:{" "}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              $
              {EXP_CATS.reduce(
                (s, c) => s + (+expF[c] || 0),
                0
              ).toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <GhostBtn onClick={() => setExpEdit(null)}>Cancel</GhostBtn>
            <PBtn
              onClick={() => {
                saveExp({ ...expenses, [expEdit]: expF });
                setExpEdit(null);
              }}
            >
              Save
            </PBtn>
          </div>
        </Modal>
      )}
      {leadEdit && (
        <Modal
          title={`Leads — ${
            fyMths.find((m) => m.key === leadEdit)?.label
          } ${leadEdit?.slice(0, 4)}`}
          onClose={() => setLead(null)}
        >
          <p
            style={{
              fontSize: 12,
              color: "var(--color-text-secondary)",
              margin: "0 0 14px",
            }}
          >
            Enter lead counts by source type
          </p>
          {LEAD_SRCS.map((r) => (
            <Lbl key={r} s={`${r} leads`}>
              <Inp
                type="number"
                value={leadF[r] || ""}
                onChange={(e) =>
                  setLeadF((f) => ({ ...f, [r]: e.target.value }))
                }
                placeholder="0"
              />
            </Lbl>
          ))}
          <div
            style={{
              background: "var(--color-background-secondary)",
              borderRadius: 8,
              padding: "10px 12px",
              marginBottom: 14,
            }}
          >
            <span
              style={{ fontSize: 12, color: "var(--color-text-secondary)" }}
            >
              Total leads:{" "}
            </span>
            <span style={{ fontSize: 13, fontWeight: 500 }}>
              {LEAD_SRCS.reduce(
                (s, r) => s + (+leadF[r] || 0),
                0
              ).toLocaleString()}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <GhostBtn onClick={() => setLead(null)}>Cancel</GhostBtn>
            <PBtn
              onClick={() => {
                saveLeads({ ...leads, [leadEdit]: leadF });
                setLead(null);
              }}
            >
              Save
            </PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ── Settings Page ───────────────────────────────────────────────────────── */
function SettingsPage({ team, saveTeam, fy, setFy }) {
  const [lt, setLt] = useState(() => team.map((m) => ({ ...m })));
  const [saved, setSaved] = useState(false);
  const save = () => {
    saveTeam(lt);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };
  return (
    <div>
      <h2 style={{ margin: "0 0 18px", fontSize: 18, fontWeight: 500 }}>
        Settings
      </h2>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "16px 18px",
          marginBottom: 14,
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 500 }}>
          Team members
        </h3>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 12,
            color: "var(--color-text-secondary)",
          }}
        >
          Rename team members and set a colour. These appear on tasks and KPIs.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {lt.map((m, i) => (
            <div
              key={m.id}
              style={{ display: "flex", alignItems: "center", gap: 10 }}
            >
              <Avatar name={m.name} color={m.color} size={34} />
              <input
                value={m.name}
                onChange={(e) =>
                  setLt((t) =>
                    t.map((x, j) =>
                      j === i ? { ...x, name: e.target.value } : x
                    )
                  )
                }
                style={{ flex: 1, fontSize: 13 }}
                placeholder={`Member ${i + 1}`}
              />
              <label
                style={{
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 11,
                  color: "var(--color-text-secondary)",
                }}
              >
                Colour
                <input
                  type="color"
                  value={m.color}
                  onChange={(e) =>
                    setLt((t) =>
                      t.map((x, j) =>
                        j === i ? { ...x, color: e.target.value } : x
                      )
                    )
                  }
                  style={{
                    width: 28,
                    height: 28,
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    padding: 0,
                    borderRadius: 4,
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </div>
      <div
        style={{
          background: "var(--color-background-primary)",
          border: "0.5px solid var(--color-border-tertiary)",
          borderRadius: 10,
          padding: "16px 18px",
          marginBottom: 18,
        }}
      >
        <h3 style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 500 }}>
          Fiscal year
        </h3>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Sel
            value={fy}
            onChange={(e) => setFy(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            {[2023, 2024, 2025, 2026, 2027, 2028].map((y) => (
              <option key={y} value={y}>
                {fyLabel(y)}
              </option>
            ))}
          </Sel>
          <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>
            Apr {fy} – Mar {fy + 1}
          </span>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <PBtn onClick={save}>Save changes</PBtn>
        {saved && (
          <span style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>
            ✓ Saved
          </span>
        )}
      </div>
    </div>
  );
}
