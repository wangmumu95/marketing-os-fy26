/* eslint-disable */
import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ENTITIES = ['PPVTL','PPA/PPC','EM','LOADUP','Others'];
const EC = {
  'PPVTL':   { a:'#6366f1', bg:'#EEEEFF', t:'#4338ca' },
  'PPA/PPC': { a:'#0891b2', bg:'#E0F5FB', t:'#0369a1' },
  'EM':      { a:'#10b981', bg:'#E0F7EF', t:'#047857' },
  'LOADUP':  { a:'#f59e0b', bg:'#FEF4DC', t:'#92400e' },
  'Others':  { a:'#8b5cf6', bg:'#F0ECFF', t:'#6d28d9' },
};
const TASK_COLS = ['To Do','In Progress','Review','Done'];
const CC = { 'To Do':'#94a3b8','In Progress':'#6366f1','Review':'#f59e0b','Done':'#10b981' };
const COL_BG = { 'To Do':'#F4F6FD','In Progress':'#EEEEFF','Review':'#FFFAEC','Done':'#E8FAF3' };
const KPI_TYPES = ['Leads Generated','Conversion Rate','Social Media','Campaign ROI','Revenue/Sales'];
const KPI_UNITS = {'Leads Generated':'','Conversion Rate':'%','Social Media':'','Campaign ROI':'%','Revenue/Sales':'$'};
const EXP_CATS = ['Lead Generation','Awareness','Customer Retention','Essential Services'];
const LEAD_SRCS = ['Long Term','Short Term','Untrackable'];
const FY_MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
const PRIORITIES = ['Low','Medium','High','Urgent'];
const PC = { Low:'#94a3b8', Medium:'#6366f1', High:'#f59e0b', Urgent:'#ef4444' };
const PBG = { Low:'#F1F5F9', Medium:'#EEEEFF', High:'#FFFAEC', Urgent:'#FEE9E9' };
const MC = ['#6366f1','#0891b2','#10b981','#f59e0b','#ef4444'];
const RECUR_OPTS = ['','weekly','monthly','quarterly','yearly'];
const RECUR_LABEL = {weekly:'Weekly',monthly:'Monthly',quarterly:'Quarterly',yearly:'Yearly'};
const TEAM_PASSWORD = 'Panpac3003';

const F = "'Calibri','Trebuchet MS',Arial,sans-serif";
const PAGE  = '#EEF1F9';
const CARD  = '#FFFFFF';
const CSHADOW = '0 2px 12px rgba(20,25,60,0.07)';
const BORDER = '#E5E9F5';
const TBORDER = '#EEF1F9';
const TXT = '#1A1D30';
const TXT2 = '#7C829A';
const INBG = '#F7F8FD';

const fyNow   = () => { const m=new Date().getMonth(),y=new Date().getFullYear(); return m>=3?y:y-1; };
const fyLabel = y  => `FY${String(y).slice(2)}/${String(y+1).slice(2)}`;
const fyMKey  = (fy,mi) => {
  const nm={Apr:4,May:5,Jun:6,Jul:7,Aug:8,Sep:9,Oct:10,Nov:11,Dec:12,Jan:1,Feb:2,Mar:3};
  return `${mi>=9?fy+1:fy}-${String(nm[FY_MONTHS[mi]]).padStart(2,'0')}`;
};
const mkId  = () => Math.random().toString(36).slice(2,10);
const ini   = n => n.split(' ').filter(Boolean).map(w=>w[0].toUpperCase()).slice(0,2).join('');
const getIds= t => t.assigneeIds||(t.assigneeId?[t.assigneeId]:[]);

// Link helpers
const getDomain = url => {
  try {
    const h=new URL(url).hostname.replace('www.','');
    if(h.includes('canva')) return 'Canva';
    if(h.includes('drive.google')||h.includes('docs.google')) return 'Google Drive';
    if(h.includes('onedrive')||h.includes('sharepoint')||h.includes('1drv.ms')) return 'OneDrive';
    if(h.includes('figma')) return 'Figma';
    if(h.includes('notion')) return 'Notion';
    if(h.includes('dropbox')) return 'Dropbox';
    return h.split('.')[0].charAt(0).toUpperCase()+h.split('.')[0].slice(1);
  } catch { return 'Link'; }
};
const getLinkColor = url => {
  try {
    const h=new URL(url).hostname;
    if(h.includes('canva')) return '#7c3aed';
    if(h.includes('google')) return '#1a73e8';
    if(h.includes('onedrive')||h.includes('sharepoint')||h.includes('1drv')) return '#0078d4';
    if(h.includes('figma')) return '#f24e1e';
    if(h.includes('notion')) return '#000000';
    if(h.includes('dropbox')) return '#0061ff';
  } catch {}
  return '#6366f1';
};

const DEFAULT_TEAM = MC.map((c,i)=>({id:`m${i+1}`,name:`Member ${i+1}`,color:c}));
const sv = async(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v))}catch{} };
const ld = async(k,fb)=>{ try{const r=localStorage.getItem(k);if(r!==null)return JSON.parse(r)}catch{} return fb; };

/* ── Shared UI ─────────────────────────────────────────────────────────────── */
const Avatar = ({name,color,size=28}) => (
  <div style={{width:size,height:size,borderRadius:'50%',background:color+'22',
    border:`2px solid ${color}40`,display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:size*.34,fontWeight:600,color,flexShrink:0,fontFamily:F}}>
    {ini(name)}
  </div>
);

function AvatarStack({assignees,size=20}) {
  const show=assignees.slice(0,3);
  const extra=assignees.length-3;
  return (
    <div style={{display:'flex',alignItems:'center'}}>
      {show.map((m,i)=>(
        <div key={m.id} style={{marginLeft:i>0?-6:0,zIndex:show.length-i,position:'relative'}}>
          <Avatar name={m.name} color={m.color} size={size}/>
        </div>
      ))}
      {extra>0&&(
        <div style={{marginLeft:-6,width:size,height:size,borderRadius:'50%',background:'#E5E9F5',
          border:'2px solid white',display:'flex',alignItems:'center',justifyContent:'center',
          fontSize:size*.3,fontWeight:600,color:TXT2,flexShrink:0}}>+{extra}</div>
      )}
    </div>
  );
}

const Chip = ({label,ec}) => {
  const c=EC[ec]||{bg:'#F1F5F9',t:'#64748b'};
  return <span style={{background:c.bg,color:c.t,fontSize:'10px',fontWeight:600,
    padding:'3px 8px',borderRadius:99,whiteSpace:'nowrap'}}>{label}</span>;
};

const PriorityBadge = ({priority}) => (
  <span style={{background:PBG[priority]||'#F1F5F9',color:PC[priority]||'#94a3b8',
    fontSize:'9px',fontWeight:600,padding:'2px 7px',borderRadius:99,
    whiteSpace:'nowrap',textTransform:'uppercase'}}>{priority}</span>
);

function Modal({title,onClose,children,wide=false}) {
  return (
    <div onMouseDown={e=>e.target===e.currentTarget&&onClose()}
      style={{position:'fixed',inset:0,background:'rgba(15,20,50,0.45)',zIndex:1000,
        backdropFilter:'blur(4px)',display:'flex',alignItems:'flex-start',
        justifyContent:'center',padding:'50px 16px 16px',fontFamily:F}}>
      <div style={{background:CARD,borderRadius:18,boxShadow:'0 24px 60px rgba(15,20,50,0.18)',
        border:`1px solid ${BORDER}`,width:'100%',maxWidth:wide?580:460,
        maxHeight:'88vh',overflow:'auto',flexShrink:0}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'16px 20px',borderBottom:`1px solid ${TBORDER}`,
          position:'sticky',top:0,background:CARD,zIndex:1}}>
          <span style={{fontSize:15,fontWeight:600,color:TXT}}>{title}</span>
          <button onClick={onClose} style={{background:'#F0F3FB',border:'none',cursor:'pointer',
            color:TXT2,width:28,height:28,borderRadius:8,display:'flex',
            alignItems:'center',justifyContent:'center',fontSize:16}}>
            <i className="ti ti-x"/>
          </button>
        </div>
        <div style={{padding:'20px'}}>{children}</div>
      </div>
    </div>
  );
}

const Lbl = ({s,children,span}) => (
  <div style={{marginBottom:14,gridColumn:span?'1/-1':''}}>
    <div style={{fontSize:11,color:TXT2,fontWeight:600,marginBottom:5,
      textTransform:'uppercase',letterSpacing:'0.05em'}}>{s}</div>
    {children}
  </div>
);
const Grid2 = ({children}) => <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>{children}</div>;
const inputStyle = {width:'100%',boxSizing:'border-box',fontSize:13,padding:'8px 12px',
  border:`1px solid ${BORDER}`,borderRadius:8,background:INBG,color:TXT,fontFamily:F,outline:'none'};
const Inp = (p) => <input {...p} style={{...inputStyle,...p.style}}/>;
const Sel = ({children,...p}) => (
  <select {...p} style={{...inputStyle,cursor:'pointer',...p.style}}>{children}</select>
);
const PBtn = ({children,onClick,style={}}) => (
  <button onClick={onClick} style={{background:'#6366f1',color:'white',border:'none',cursor:'pointer',
    padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:F,
    display:'flex',alignItems:'center',gap:4,boxShadow:'0 2px 8px rgba(99,102,241,0.3)',...style}}>
    {children}
  </button>
);
const GhostBtn = ({children,onClick,danger,color}) => (
  <button onClick={onClick} style={{
    background:danger?'#FEE9E9':color?color+'18':'#F0F3FB',
    color:danger?'#dc2626':color||TXT,border:'none',cursor:'pointer',
    padding:'7px 16px',borderRadius:10,fontSize:13,fontWeight:500,fontFamily:F}}>
    {children}
  </button>
);

const TH = {padding:'10px 14px',textAlign:'left',fontSize:'11px',fontWeight:700,
  color:TXT2,whiteSpace:'nowrap',textTransform:'uppercase',letterSpacing:'0.05em'};
const TD = {padding:'10px 14px',textAlign:'left',fontSize:'13px',whiteSpace:'nowrap',color:TXT};

function PageHeader({title,sub,action}) {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:22}}>
      <div>
        <h2 style={{margin:0,fontSize:20,fontWeight:700,color:TXT,letterSpacing:'-0.02em'}}>{title}</h2>
        {sub&&<p style={{margin:'2px 0 0',fontSize:12,color:TXT2}}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const Card = ({children,style={}}) => (
  <div style={{background:CARD,borderRadius:14,boxShadow:CSHADOW,border:`1px solid ${BORDER}`,...style}}>
    {children}
  </div>
);

/* ── Login page ─────────────────────────────────────────────────────────────── */
function LoginPage({onLogin}) {
  const [pw,setPw]=useState('');
  const [error,setError]=useState(false);
  const attempt=()=>{
    if(pw===TEAM_PASSWORD){onLogin();}
    else{setError(true);setTimeout(()=>setError(false),2000);}
  };
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',width:'100vw',background:'#EEF1F9',fontFamily:F}}>
      <div style={{background:CARD,borderRadius:20,
        boxShadow:'0 8px 40px rgba(15,20,50,0.12)',
        border:`1px solid ${BORDER}`,padding:'40px 48px',
        width:'100%',maxWidth:380,textAlign:'center'}}>
        <div style={{width:56,height:56,borderRadius:16,background:'#6366f1',
          display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px'}}>
          <i className="ti ti-chart-bar" style={{fontSize:26,color:'white'}}/>
        </div>
        <h1 style={{margin:'0 0 6px',fontSize:22,fontWeight:700,color:TXT}}>Marketing OS</h1>
        <p style={{margin:'0 0 28px',fontSize:13,color:TXT2}}>Enter the team password to continue</p>
        <input type="password" value={pw}
          onChange={e=>{setPw(e.target.value);setError(false);}}
          onKeyDown={e=>e.key==='Enter'&&attempt()}
          placeholder="Password"
          style={{...inputStyle,textAlign:'center',letterSpacing:'0.15em',
            marginBottom:12,fontSize:15,width:'100%',
            border:`1.5px solid ${error?'#ef4444':BORDER}`,
            background:error?'#FEE9E9':INBG}}/>
        {error&&<p style={{color:'#ef4444',fontSize:12,margin:'0 0 12px',fontWeight:500}}>
          Incorrect password. Try again.</p>}
        <button onClick={attempt} style={{width:'100%',background:'#6366f1',
          color:'white',border:'none',cursor:'pointer',padding:'11px',
          borderRadius:10,fontSize:14,fontWeight:700,fontFamily:F,
          boxShadow:'0 4px 12px rgba(99,102,241,0.35)'}}>
          Sign in →
        </button>
        <p style={{margin:'20px 0 0',fontSize:11,color:TXT2}}>
          Ask your team lead if you've forgotten the password.
        </p>
      </div>
    </div>
  );
}

/* ── App ────────────────────────────────────────────────────────────────────── */
export default function App() {
  const [page,setPage]   = useState('dashboard');
  const [team,setTeam]   = useState(DEFAULT_TEAM);
  const [tasks,setTasks] = useState([]);
  const [kpis,setKpis]   = useState([]);
  const [expenses,setExp]= useState({});
  const [leads,setLeads] = useState({});
  const [budgets,setBudgets]=useState({});
  const [fy,setFy]       = useState(fyNow());
  const [ready,setReady] = useState(false);
  const [authed,setAuthed]= useState(()=>localStorage.getItem('mkt_auth')==='true');

  const login  = ()=>{ localStorage.setItem('mkt_auth','true'); setAuthed(true); };
  const logout = ()=>{ localStorage.removeItem('mkt_auth'); setAuthed(false); setReady(false); };

  // useEffect MUST be before any early returns (React rules)
  useEffect(()=>{
    if(!authed){ setReady(false); return; }
    (async()=>{
      const [t,tk,k,e,l,b]=await Promise.all([
        ld('mkt_team',DEFAULT_TEAM),ld('mkt_tasks',[]),
        ld('mkt_kpis',[]),ld('mkt_exp',{}),ld('mkt_leads',{}),ld('mkt_budgets',{}),
      ]);
      setTeam(t);setTasks(tk);setKpis(k);setExp(e);setLeads(l);setBudgets(b);setReady(true);
    })();
  },[authed]);

  // Early returns AFTER all hooks
  if(!authed) return <LoginPage onLogin={login}/>;
  if(!ready) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',
      height:'100vh',color:TXT2,fontSize:14,fontFamily:F,background:PAGE}}>
      Loading…
    </div>
  );

  const svTeam  = t=>{setTeam(t); sv('mkt_team',t);};
  const svTasks = t=>{setTasks(t);sv('mkt_tasks',t);};
  const svKpis  = k=>{setKpis(k); sv('mkt_kpis',k);};
  const svExp   = e=>{setExp(e);  sv('mkt_exp',e);};
  const svLeads = l=>{setLeads(l);sv('mkt_leads',l);};
  const svBudgets=b=>{setBudgets(b);sv('mkt_budgets',b);};

  const NAV=[
    {id:'dashboard',icon:'ti-layout-dashboard',label:'Dashboard'},
    {id:'tasks',    icon:'ti-layout-kanban',    label:'Tasks'},
    {id:'calendar', icon:'ti-calendar',         label:'Calendar'},
    {id:'kpis',     icon:'ti-target',           label:'KPIs'},
    {id:'finance',  icon:'ti-report-money',     label:'Finance'},
    {id:'settings', icon:'ti-settings',         label:'Settings'},
  ];

  return (
    <div style={{display:'flex',height:'100vh',width:'100vw',fontFamily:F,background:PAGE,overflow:'hidden'}}>

      {/* ── Sidebar ── */}
      <div style={{width:200,flexShrink:0,height:'100vh',background:'#1A1D30',
        display:'flex',flexDirection:'column'}}>

        {/* Logo — fixed at top */}
        <div style={{flexShrink:0,padding:'20px 12px 12px',display:'flex',alignItems:'center',gap:10}}>
          <div style={{width:32,height:32,borderRadius:10,background:'#6366f1',
            display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            <i className="ti ti-chart-bar" style={{fontSize:16,color:'white'}} aria-hidden/>
          </div>
          <span style={{color:'white',fontSize:14,fontWeight:700}}>Marketing OS</span>
        </div>

        {/* Middle — scrollable if needed */}
        <div style={{flex:1,overflowY:'auto',padding:'0 12px',minHeight:0}}>

          {/* Nav */}
          <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',
            letterSpacing:'0.08em',padding:'0 8px',marginBottom:6}}>Menu</div>
          {NAV.map(n=>{
            const active=page===n.id;
            return (
              <button key={n.id} onClick={()=>setPage(n.id)} style={{
                display:'flex',alignItems:'center',gap:10,padding:'7px 10px',borderRadius:10,
                border:'none',background:active?'rgba(99,102,241,0.2)':'transparent',
                color:active?'#a5b4fc':'rgba(255,255,255,0.45)',
                cursor:'pointer',fontSize:13,fontWeight:active?600:400,
                textAlign:'left',width:'100%',marginBottom:2,position:'relative'}}>
                {active&&<div style={{position:'absolute',left:0,top:'20%',bottom:'20%',
                  width:3,background:'#6366f1',borderRadius:'0 3px 3px 0'}}/>}
                <div style={{width:28,height:28,borderRadius:8,
                  background:active?'#6366f1':'rgba(255,255,255,0.07)',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <i className={`ti ${n.icon}`} style={{fontSize:14}} aria-hidden/>
                </div>
                {n.label}
              </button>
            );
          })}

          {/* Team */}
          <div style={{marginTop:12,paddingTop:10,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <div style={{fontSize:10,color:'rgba(255,255,255,0.25)',textTransform:'uppercase',
              letterSpacing:'0.08em',padding:'0 4px',marginBottom:6}}>Team</div>
            {team.map(m=>(
              <div key={m.id} style={{display:'flex',alignItems:'center',gap:8,padding:'3px 4px',marginBottom:2}}>
                <div style={{width:20,height:20,borderRadius:'50%',background:m.color+'30',
                  border:`2px solid ${m.color}50`,display:'flex',alignItems:'center',
                  justifyContent:'center',fontSize:'8px',fontWeight:700,color:m.color,flexShrink:0}}>
                  {ini(m.name)}
                </div>
                <span style={{color:'rgba(255,255,255,0.4)',fontSize:11,overflow:'hidden',
                  textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</span>
              </div>
            ))}
          </div>

        </div>{/* end scrollable middle */}

        {/* Logout — fixed at bottom, ALWAYS visible */}
        <div style={{flexShrink:0,padding:'10px 12px 16px',
          borderTop:'1px solid rgba(255,255,255,0.08)'}}>
          <button onClick={logout} style={{display:'flex',alignItems:'center',gap:10,
            width:'100%',padding:'8px 10px',borderRadius:10,border:'none',
            background:'rgba(239,68,68,0.12)',color:'#fca5a5',cursor:'pointer',
            fontSize:13,fontWeight:500,fontFamily:F}}>
            <div style={{width:28,height:28,borderRadius:8,background:'rgba(239,68,68,0.15)',
              display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              <i className="ti ti-logout" style={{fontSize:14}}/>
            </div>
            Log out
          </button>
        </div>

      </div>

      {/* ── Content ── */}
      <div style={{flex:1,height:'100vh',padding:'24px 28px',overflow:'auto',minWidth:0}}>
        {page==='dashboard'&&<DashPage team={team} tasks={tasks} kpis={kpis} expenses={expenses} leads={leads} fy={fy} setPage={setPage}/>}
        {page==='tasks'&&    <TasksPage team={team} tasks={tasks} saveTasks={svTasks}/>}
        {page==='calendar'&& <CalendarPage team={team} tasks={tasks}/>}
        {page==='kpis'&&     <KpisPage team={team} kpis={kpis} saveKpis={svKpis} fy={fy}/>}
        {page==='finance'&&  <FinPage expenses={expenses} saveExp={svExp} leads={leads} saveLeads={svLeads} budgets={budgets} saveBudgets={svBudgets} fy={fy}/>}
        {page==='settings'&& <SettingsPage team={team} saveTeam={svTeam} fy={fy} setFy={setFy}/>}
      </div>
    </div>
  );
}

/* ── Dashboard ──────────────────────────────────────────────────────────────── */
function DashPage({team,tasks,kpis,expenses,leads,fy,setPage}) {
  const now=new Date();
  const todayKey=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  // Team ongoing tasks — exclude Done
  const mStats=team.map(m=>({
    ...m,
    todo:   tasks.filter(t=>getIds(t).includes(m.id)&&t.status==='To Do').length,
    ip:     tasks.filter(t=>getIds(t).includes(m.id)&&t.status==='In Progress').length,
    review: tasks.filter(t=>getIds(t).includes(m.id)&&t.status==='Review').length,
    total:  tasks.filter(t=>getIds(t).includes(m.id)&&t.status!=='Done').length,
  }));

  // KPI overview by entity — text + check
  const eKpiSummary=ENTITIES.map(e=>{
    const ek=kpis.filter(k=>k.entity===e);
    return {e, kpis:ek};
  });

  // All tasks sorted by deadline — overdue first, then nearest, then no date
  const sortedTasks=[...tasks].sort((a,b)=>{
    const aOver=a.dueDate&&a.dueDate<todayKey&&a.status!=='Done';
    const bOver=b.dueDate&&b.dueDate<todayKey&&b.status!=='Done';
    if(aOver&&!bOver) return -1;
    if(!aOver&&bOver) return 1;
    if(a.dueDate&&b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if(a.dueDate&&!b.dueDate) return -1;
    if(!a.dueDate&&b.dueDate) return 1;
    return 0;
  });

  return (
    <div>
      <PageHeader title="Dashboard" sub={`${fyLabel(fy)} · ${now.toLocaleDateString('en-SG',{month:'long',year:'numeric'})}`}/>

      <div style={{display:'grid',gridTemplateColumns:'1.2fr 0.8fr',gap:16,marginBottom:16}}>

        {/* Team ongoing tasks */}
        <Card style={{padding:'18px 20px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16}}>
            <span style={{fontSize:14,fontWeight:700,color:TXT}}>Team's ongoing tasks</span>
            <button onClick={()=>setPage('tasks')} style={{background:'#EEEEFF',border:'none',
              cursor:'pointer',fontSize:12,color:'#6366f1',fontWeight:600,padding:'5px 12px',
              borderRadius:8,fontFamily:F}}>View tasks →</button>
          </div>
          {mStats.map(m=>(
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <Avatar name={m.name} color={m.color} size={30}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:13,fontWeight:600,color:TXT,overflow:'hidden',
                    textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.name}</span>
                  <span style={{fontSize:11,color:TXT2,whiteSpace:'nowrap',marginLeft:4}}>
                    {m.total} active
                  </span>
                </div>
                <div style={{display:'flex',gap:2,height:6,borderRadius:3,
                  overflow:'hidden',background:'#EEF1F9'}}>
                  {m.total===0&&<div style={{flex:1,background:'#EEF1F9'}}/>}
                  {m.todo>0&&   <div style={{flex:m.todo,  background:'#CBD5E1'}}/>}
                  {m.ip>0&&     <div style={{flex:m.ip,    background:'#6366f1'}}/>}
                  {m.review>0&& <div style={{flex:m.review,background:'#f59e0b'}}/>}
                </div>
              </div>
            </div>
          ))}
          <div style={{display:'flex',gap:14,marginTop:12,paddingTop:12,
            borderTop:`1px solid ${TBORDER}`}}>
            {[['#CBD5E1','To Do'],['#6366f1','In Progress'],['#f59e0b','Review']].map(([c,l])=>(
              <div key={l} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:8,height:8,borderRadius:2,background:c}}/>
                <span style={{fontSize:10,color:TXT2,fontWeight:500}}>{l}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI overview — text + check */}
        <Card style={{padding:'18px 20px',overflow:'auto',maxHeight:340}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
            <span style={{fontSize:14,fontWeight:700,color:TXT}}>KPI overview</span>
            <button onClick={()=>setPage('kpis')} style={{background:'#EEEEFF',border:'none',
              cursor:'pointer',fontSize:12,color:'#6366f1',fontWeight:600,padding:'5px 12px',
              borderRadius:8,fontFamily:F}}>View →</button>
          </div>
          {eKpiSummary.map(({e,kpis:ek})=>{
            const {a,bg}=EC[e]||{a:'#94a3b8',bg:'#F1F5F9'};
            return (
              <div key={e} style={{marginBottom:14}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:6}}>
                  <div style={{width:8,height:8,borderRadius:2,background:a,flexShrink:0}}/>
                  <span style={{fontSize:12,fontWeight:700,color:TXT}}>{e}</span>
                  {ek.length===0&&<span style={{fontSize:10,color:TXT2,fontWeight:400}}>— no KPIs</span>}
                  {ek.length>0&&<span style={{fontSize:10,color:TXT2,marginLeft:'auto'}}>
                    {ek.filter(k=>k.done).length}/{ek.length}
                  </span>}
                </div>
                {ek.map(k=>(
                  <div key={k.id} style={{display:'flex',alignItems:'center',gap:8,
                    padding:'4px 8px',borderRadius:7,marginBottom:3,
                    background:k.done?'#F0FDF4':'#F7F8FD',
                    border:`1px solid ${k.done?'#BBF7D0':BORDER}`}}>
                    <div style={{width:14,height:14,borderRadius:'50%',flexShrink:0,
                      background:k.done?'#10b981':'transparent',
                      border:`1.5px solid ${k.done?'#10b981':'#CBD5E1'}`,
                      display:'flex',alignItems:'center',justifyContent:'center'}}>
                      {k.done&&<i className="ti ti-check" style={{fontSize:8,color:'white'}} aria-hidden/>}
                    </div>
                    <span style={{fontSize:11,fontWeight:500,color:k.done?'#047857':TXT,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                      {k.title||k.type||'KPI'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </Card>
      </div>

      {/* All tasks sorted by deadline */}
      <Card style={{padding:'18px 20px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
          <span style={{fontSize:14,fontWeight:700,color:TXT}}>All tasks</span>
          <span style={{background:'#EEF1F9',color:TXT2,fontSize:11,fontWeight:600,
            padding:'3px 10px',borderRadius:99}}>{tasks.length} total</span>
        </div>
        {tasks.length===0&&(
          <p style={{fontSize:13,color:TXT2,margin:0,textAlign:'center',padding:'24px 0'}}>
            No tasks yet — head to Tasks to add some.
          </p>
        )}
        {sortedTasks.slice(0,10).map(t=>{
          const ids=getIds(t);
          const assignees=team.filter(m=>ids.includes(m.id));
          const od=t.dueDate&&t.dueDate<todayKey&&t.status!=='Done';
          const stDone=(t.subtasks||[]).filter(s=>s.done).length;
          const stTotal=(t.subtasks||[]).length;
          const daysUntil=t.dueDate?Math.round((new Date(t.dueDate+'T00:00:00')-now)/(1000*60*60*24)):null;
          const nearingSoon=daysUntil!==null&&daysUntil>=0&&daysUntil<=3;
          return (
            <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',
              borderBottom:`1px solid ${TBORDER}`}}>
              <div style={{width:8,height:8,borderRadius:2,
                background:CC[t.status]||'#94a3b8',flexShrink:0}}/>
              <span style={{flex:1,fontSize:13,color:TXT,overflow:'hidden',
                textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</span>
              {t.recurring&&<i className="ti ti-repeat" style={{fontSize:11,color:'#94a3b8'}} aria-hidden/>}
              {stTotal>0&&<span style={{fontSize:10,color:TXT2,background:'#EEF1F9',
                padding:'2px 7px',borderRadius:99,fontWeight:600}}>{stDone}/{stTotal}</span>}
              {t.entity&&<Chip label={t.entity} ec={t.entity}/>}
              {/* Due date badge */}
              {t.dueDate&&(
                <span style={{fontSize:10,fontWeight:600,whiteSpace:'nowrap',
                  padding:'2px 8px',borderRadius:99,
                  background:od?'#FEE9E9':nearingSoon?'#FEF4DC':'#EEF1F9',
                  color:od?'#dc2626':nearingSoon?'#92400e':TXT2}}>
                  {od?'⚠ Overdue':nearingSoon?`Due in ${daysUntil}d`:t.dueDate}
                </span>
              )}
              <span style={{fontSize:11,color:TXT2,whiteSpace:'nowrap'}}>{t.status}</span>
              {assignees.length>0&&<AvatarStack assignees={assignees} size={22}/>}
            </div>
          );
        })}
        {sortedTasks.length>10&&(
          <button onClick={()=>setPage('tasks')} style={{marginTop:10,background:'none',border:'none',
            cursor:'pointer',color:'#6366f1',fontSize:12,fontWeight:600,fontFamily:F,padding:'4px 0'}}>
            View all {sortedTasks.length} tasks →
          </button>
        )}
      </Card>
    </div>
  );
}
/* ── Tasks ──────────────────────────────────────────────────────────────────── */
function TasksPage({team,tasks,saveTasks}) {
  const [fm,setFm]=useState('all');
  const [fe,setFe]=useState('all');
  const [modal,setModal]=useState(null);
  const [dragId,setDrag]=useState(null);
  const [cardLightbox,setCardLightbox]=useState(null);
  const now=new Date();

  const filtered=tasks.filter(t=>(fm==='all'||getIds(t).includes(fm))&&(fe==='all'||t.entity===fe));
  const addTask   =d=>{saveTasks([{...d,id:mkId(),createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()},...tasks]);setModal(null);};
  const upTask    =(id,d)=>{saveTasks(tasks.map(t=>t.id===id?{...t,...d,updatedAt:new Date().toISOString()}:t));setModal(null);};
  const delTask   =id=>{saveTasks(tasks.filter(t=>t.id!==id));setModal(null);};
  const moveTask  =(id,status)=>saveTasks(tasks.map(t=>t.id===id?{...t,status,updatedAt:new Date().toISOString()}:t));
  const createNext=nt=>{saveTasks([nt,...tasks]);setModal(null);};
  const toggleSub =(tid,sid)=>{saveTasks(tasks.map(t=>t.id===tid?{...t,subtasks:(t.subtasks||[]).map(s=>s.id===sid?{...s,done:!s.done}:s),updatedAt:new Date().toISOString()}:t));};

  return (
    <div>
      <PageHeader title="Tasks" action={<PBtn onClick={()=>setModal('add')}><i className="ti ti-plus" style={{fontSize:14}} aria-hidden/> Add task</PBtn>}/>
      <div style={{display:'flex',gap:8,marginBottom:18,alignItems:'center'}}>
        <Sel value={fm} onChange={e=>setFm(e.target.value)} style={{width:'auto',fontSize:12}}>
          <option value="all">All members</option>
          {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </Sel>
        <Sel value={fe} onChange={e=>setFe(e.target.value)} style={{width:'auto',fontSize:12}}>
          <option value="all">All entities</option>
          {ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
        </Sel>
        <span style={{fontSize:12,color:TXT2,background:CARD,padding:'5px 12px',borderRadius:99,border:`1px solid ${BORDER}`,fontWeight:500}}>{filtered.length} tasks</span>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,alignItems:'start'}}>
        {TASK_COLS.map(col=>{
          const colT=filtered.filter(t=>t.status===col);
          return (
            <div key={col} onDragOver={e=>e.preventDefault()}
              onDrop={e=>{e.preventDefault();if(dragId){moveTask(dragId,col);setDrag(null);}}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:10,padding:'0 2px'}}>
                <div style={{width:10,height:10,borderRadius:3,background:CC[col]}}/>
                <span style={{fontSize:13,fontWeight:700,color:TXT}}>{col}</span>
                <span style={{background:CC[col]+'22',color:CC[col],fontSize:11,fontWeight:700,padding:'1px 8px',borderRadius:99,marginLeft:'auto'}}>{colT.length}</span>
              </div>
              <div style={{background:COL_BG[col],borderRadius:14,padding:'10px 8px',minHeight:100,display:'flex',flexDirection:'column',gap:8}}>
                {colT.map(t=>{
                  const ids=getIds(t);
                  const assignees=team.filter(m=>ids.includes(m.id));
                  const ec=EC[t.entity]||{a:'#94a3b8'};
                  const od=t.dueDate&&new Date(t.dueDate)<now&&t.status!=='Done';
                  const stDone=(t.subtasks||[]).filter(s=>s.done).length;
                  const stTotal=(t.subtasks||[]).length;
                  const stPct=stTotal>0?Math.round((stDone/stTotal)*100):null;
                  return (
                    <div key={t.id} draggable onDragStart={()=>setDrag(t.id)} onClick={()=>setModal({edit:t})}
                      style={{background:CARD,borderRadius:12,padding:'12px 14px',cursor:'pointer',
                        boxShadow:CSHADOW,borderTop:`3px solid ${ec.a}`}}>
                      <div style={{display:'flex',alignItems:'flex-start',gap:6,marginBottom:8}}>
                        <p style={{margin:0,fontSize:13,fontWeight:600,color:TXT,lineHeight:1.35,flex:1}}>{t.title}</p>
                        {t.recurring&&(
                          <span style={{background:'#E0F5FB',color:'#0891b2',fontSize:'9px',fontWeight:700,
                            padding:'2px 6px',borderRadius:99,whiteSpace:'nowrap',flexShrink:0,textTransform:'uppercase'}}>
                            <i className="ti ti-repeat" style={{fontSize:8,marginRight:2}} aria-hidden/>
                            {RECUR_LABEL[t.recurring]}
                          </span>
                        )}
                      </div>
                      {stTotal>0&&(
                        <div style={{marginBottom:10}} onClick={e=>e.stopPropagation()}>
                          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                            <span style={{fontSize:10,color:TXT2,fontWeight:500}}>Milestones</span>
                            <span style={{fontSize:10,color:stDone===stTotal?'#10b981':TXT2,fontWeight:stDone===stTotal?700:500}}>{stDone}/{stTotal}</span>
                          </div>
                          <div style={{height:4,borderRadius:2,background:'#EEF1F9',overflow:'hidden',marginBottom:6}}>
                            <div style={{width:`${stPct}%`,height:'100%',background:stDone===stTotal?'#10b981':ec.a,borderRadius:2}}/>
                          </div>
                          {(t.subtasks||[]).map(sub=>(
                            <div key={sub.id} onClick={e=>{e.stopPropagation();toggleSub(t.id,sub.id);}}
                              style={{display:'flex',alignItems:'center',gap:7,padding:'3px 0',cursor:'pointer'}}>
                              <div style={{width:14,height:14,borderRadius:4,flexShrink:0,
                                border:`1.5px solid ${sub.done?ec.a:BORDER}`,background:sub.done?ec.a:'transparent',
                                display:'flex',alignItems:'center',justifyContent:'center'}}>
                                {sub.done&&<i className="ti ti-check" style={{fontSize:9,color:'white'}} aria-hidden/>}
                              </div>
                              <span style={{fontSize:11,color:sub.done?TXT2:TXT,textDecoration:sub.done?'line-through':'none'}}>{sub.title}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
                        {t.entity&&<Chip label={t.entity} ec={t.entity}/>}
                        {t.priority&&<PriorityBadge priority={t.priority}/>}
                        <div style={{marginLeft:'auto',display:'flex',alignItems:'center',gap:6}}>
                          {assignees.length>0&&<AvatarStack assignees={assignees} size={20}/>}
                        </div>
                      </div>
                      {t.dueDate&&(
                        <div style={{display:'flex',alignItems:'center',gap:4,marginTop:8}}>
                          <i className="ti ti-calendar" style={{fontSize:10,color:od?'#ef4444':TXT2}} aria-hidden/>
                          <span style={{fontSize:10,color:od?'#ef4444':TXT2,fontWeight:od?600:400}}>{od?'Overdue · ':''}{t.dueDate}</span>
                        </div>
                      )}
                      {/* Link chips */}
                      {(t.links||[]).length>0&&(
                        <div style={{display:'flex',flexWrap:'wrap',gap:4,marginTop:7}}
                          onClick={e=>e.stopPropagation()}>
                          {(t.links||[]).map(link=>{
                            const c=getLinkColor(link.url);
                            const label=link.label||getDomain(link.url);
                            return (
                              <a key={link.id} href={link.url} target="_blank"
                                rel="noopener noreferrer"
                                style={{display:'flex',alignItems:'center',gap:4,
                                  fontSize:10,fontWeight:600,padding:'2px 7px',
                                  borderRadius:5,background:c+'15',color:c,
                                  textDecoration:'none',border:`1px solid ${c}30`}}>
                                <i className="ti ti-link" style={{fontSize:9}}/>
                                {label}
                              </a>
                            );
                          })}
                        </div>
                      )}
                      {/* Image thumbnails */}
                      {(t.images||[]).length>0&&(
                        <div style={{display:'flex',gap:5,marginTop:7,flexWrap:'wrap'}}
                          onClick={e=>e.stopPropagation()}>
                          {(t.images||[]).slice(0,3).map(img=>(
                            <img key={img.id} src={img.data} alt={img.name}
                              style={{width:44,height:44,borderRadius:7,objectFit:'cover',
                                cursor:'pointer',border:`1px solid ${BORDER}`}}
                              onClick={e=>{e.stopPropagation();setCardLightbox(img);}}/>
                          ))}
                          {(t.images||[]).length>3&&(
                            <div style={{width:44,height:44,borderRadius:7,background:'#EEF1F9',
                              border:`1px solid ${BORDER}`,display:'flex',alignItems:'center',
                              justifyContent:'center',fontSize:11,fontWeight:600,color:TXT2}}>
                              +{(t.images||[]).length-3}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                <button onClick={()=>setModal('add')}
                  style={{background:'transparent',border:`1.5px dashed ${CC[col]}40`,borderRadius:10,
                    padding:'8px',cursor:'pointer',color:TXT2,fontSize:12,fontFamily:F,
                    display:'flex',alignItems:'center',justifyContent:'center',gap:5,fontWeight:500}}>
                  <i className="ti ti-plus" style={{fontSize:12,color:CC[col]}} aria-hidden/> Add task
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {modal==='add'&&<TaskModal title="New task" onClose={()=>setModal(null)} onSave={addTask} team={team}/>}
      {modal?.edit&&<TaskModal title="Edit task" task={modal.edit} onClose={()=>setModal(null)}
        onSave={d=>upTask(modal.edit.id,d)} onDelete={()=>delTask(modal.edit.id)}
        onCreateNext={createNext} team={team}/>}

      {/* Card image lightbox */}
      {cardLightbox&&(
        <div onMouseDown={()=>setCardLightbox(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:2000,
            display:'flex',alignItems:'center',justifyContent:'center',
            cursor:'pointer',flexDirection:'column',gap:12,padding:24}}>
          <img src={cardLightbox.data} alt={cardLightbox.name}
            style={{maxWidth:'85vw',maxHeight:'80vh',borderRadius:12,objectFit:'contain',
              boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}
            onMouseDown={e=>e.stopPropagation()}/>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12,fontFamily:F}}>
            {cardLightbox.name} · click outside to close
          </div>
        </div>
      )}
    </div>
  );
}

function TaskModal({title,task,onClose,onSave,onDelete,onCreateNext,team}) {
  const [f,setF]=useState({
    title:task?.title||'',description:task?.description||'',
    assigneeIds:task?getIds(task):[],entity:task?.entity||'',
    priority:task?.priority||'Medium',status:task?.status||'To Do',
    dueDate:task?.dueDate||'',recurring:task?.recurring||'',
    subtasks:task?.subtasks||[],
    links:task?.links||[],
    images:task?.images||[],
  });
  const [newSt,setNewSt]=useState('');
  const [newLinkUrl,setNewLinkUrl]=useState('');
  const [newLinkLabel,setNewLinkLabel]=useState('');
  const [lightbox,setLightbox]=useState(null);
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const toggleA=id=>s('assigneeIds',f.assigneeIds.includes(id)?f.assigneeIds.filter(x=>x!==id):[...f.assigneeIds,id]);
  const addSub=()=>{if(!newSt.trim())return;s('subtasks',[...f.subtasks,{id:mkId(),title:newSt.trim(),done:false}]);setNewSt('');};
  const toggleSub=id=>s('subtasks',f.subtasks.map(st=>st.id===id?{...st,done:!st.done}:st));
  const delSub=id=>s('subtasks',f.subtasks.filter(st=>st.id!==id));
  const moveSub=(i,dir)=>{const a=[...f.subtasks];const ni=i+dir;if(ni<0||ni>=a.length)return;[a[i],a[ni]]=[a[ni],a[i]];s('subtasks',a);};

  const addLink=()=>{
    const url=newLinkUrl.trim();
    if(!url) return;
    const fullUrl=url.startsWith('http')?url:'https://'+url;
    s('links',[...(f.links||[]),{id:mkId(),url:fullUrl,label:newLinkLabel.trim()}]);
    setNewLinkUrl(''); setNewLinkLabel('');
  };
  const delLink=id=>s('links',(f.links||[]).filter(l=>l.id!==id));

  const handleImages=e=>{
    const files=Array.from(e.target.files||[]);
    files.forEach(file=>{
      if(!file.type.startsWith('image/')) return;
      const reader=new FileReader();
      reader.onload=ev=>{
        const img={id:mkId(),data:ev.target.result,name:file.name};
        setF(x=>({...x,images:[...(x.images||[]),img]}));
      };
      reader.readAsDataURL(file);
    });
    e.target.value='';
  };
  const delImage=id=>s('images',(f.images||[]).filter(img=>img.id!==id));
  const handleCreateNext=()=>{
    let nd='';
    if(f.dueDate&&f.recurring){
      const d=new Date(f.dueDate);
      if(f.recurring==='weekly')d.setDate(d.getDate()+7);
      if(f.recurring==='monthly')d.setMonth(d.getMonth()+1);
      if(f.recurring==='quarterly')d.setMonth(d.getMonth()+3);
      if(f.recurring==='yearly')d.setFullYear(d.getFullYear()+1);
      nd=d.toISOString().slice(0,10);
    }
    onCreateNext({...f,id:mkId(),status:'To Do',dueDate:nd,
      subtasks:f.subtasks.map(st=>({...st,done:false})),
      createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});
  };
  const stDone=f.subtasks.filter(x=>x.done).length;
  return (
    <Modal title={title} onClose={onClose} wide>
      <Lbl s="Task title" span><Inp value={f.title} onChange={e=>s('title',e.target.value)} placeholder="What needs to be done?"/></Lbl>
      <Lbl s="Description" span>
        <textarea value={f.description} onChange={e=>s('description',e.target.value)}
          placeholder="Optional notes…" rows={2} style={{...inputStyle,resize:'vertical'}}/>
      </Lbl>
      <Grid2>
        <Lbl s="Entity"><Sel value={f.entity} onChange={e=>s('entity',e.target.value)}>
          <option value="">None</option>{ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
        </Sel></Lbl>
        <Lbl s="Priority"><Sel value={f.priority} onChange={e=>s('priority',e.target.value)}>
          {PRIORITIES.map(p=><option key={p} value={p}>{p}</option>)}
        </Sel></Lbl>
        <Lbl s="Status"><Sel value={f.status} onChange={e=>s('status',e.target.value)}>
          {TASK_COLS.map(c=><option key={c} value={c}>{c}</option>)}
        </Sel></Lbl>
        <Lbl s="Recurring"><Sel value={f.recurring} onChange={e=>s('recurring',e.target.value)}>
          <option value="">Not recurring</option>
          {RECUR_OPTS.filter(Boolean).map(r=><option key={r} value={r}>{RECUR_LABEL[r]}</option>)}
        </Sel></Lbl>
      </Grid2>
      <Lbl s="Due date" span><Inp type="date" value={f.dueDate} onChange={e=>s('dueDate',e.target.value)} style={{width:'auto'}}/></Lbl>
      <Lbl s="Assigned to" span>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
          {team.map(m=>{
            const checked=f.assigneeIds.includes(m.id);
            return (
              <div key={m.id} onClick={()=>toggleA(m.id)}
                style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',
                  padding:'8px 12px',borderRadius:10,
                  border:`1.5px solid ${checked?m.color+'80':BORDER}`,
                  background:checked?m.color+'10':INBG}}>
                <div style={{width:16,height:16,borderRadius:4,flexShrink:0,
                  border:`1.5px solid ${checked?m.color:BORDER}`,background:checked?m.color:'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {checked&&<i className="ti ti-check" style={{fontSize:10,color:'white'}} aria-hidden/>}
                </div>
                <Avatar name={m.name} color={m.color} size={20}/>
                <span style={{fontSize:12,fontWeight:checked?600:400,color:TXT}}>{m.name}</span>
              </div>
            );
          })}
        </div>
      </Lbl>
      <div style={{borderTop:`1px solid ${TBORDER}`,paddingTop:16,marginTop:4}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:TXT,textTransform:'uppercase',letterSpacing:'0.05em'}}>Milestones / Sub-tasks</span>
          {f.subtasks.length>0&&<span style={{fontSize:11,color:stDone===f.subtasks.length&&f.subtasks.length>0?'#10b981':TXT2,fontWeight:600}}>{stDone}/{f.subtasks.length} done</span>}
        </div>
        {f.subtasks.length>0&&(
          <div style={{marginBottom:10,display:'flex',flexDirection:'column',gap:4}}>
            {f.subtasks.map((st,i)=>(
              <div key={st.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',
                borderRadius:9,background:st.done?'#F0FDF4':'#F7F8FD',
                border:`1px solid ${st.done?'#BBF7D0':BORDER}`}}>
                <div onClick={()=>toggleSub(st.id)} style={{width:16,height:16,borderRadius:4,
                  border:`1.5px solid ${st.done?'#10b981':BORDER}`,background:st.done?'#10b981':'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,cursor:'pointer'}}>
                  {st.done&&<i className="ti ti-check" style={{fontSize:10,color:'white'}} aria-hidden/>}
                </div>
                <span style={{flex:1,fontSize:12,textDecoration:st.done?'line-through':'none',color:st.done?TXT2:TXT}}>{st.title}</span>
                <div style={{display:'flex',gap:2}}>
                  {[[-1,'ti-chevron-up'],[1,'ti-chevron-down']].map(([dir,icon])=>(
                    <button key={dir} onClick={()=>moveSub(i,dir)} style={{background:'none',border:'none',cursor:'pointer',color:TXT2,padding:'1px 3px'}}>
                      <i className={`ti ${icon}`} style={{fontSize:11}}/>
                    </button>
                  ))}
                  <button onClick={()=>delSub(st.id)} style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:'1px 3px'}}>
                    <i className="ti ti-x" style={{fontSize:11}}/>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div style={{display:'flex',gap:8}}>
          <Inp value={newSt} onChange={e=>setNewSt(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addSub())}
            placeholder="Add a milestone or sub-task…" style={{fontSize:12}}/>
          <button onClick={addSub} style={{background:'#6366f1',color:'white',border:'none',
            cursor:'pointer',padding:'8px 14px',borderRadius:9,fontSize:12,fontFamily:F,fontWeight:600,whiteSpace:'nowrap'}}>
            + Add
          </button>
        </div>
      </div>

      {/* Links */}
      <div style={{borderTop:`1px solid ${TBORDER}`,paddingTop:14,marginTop:4}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:TXT,textTransform:'uppercase',letterSpacing:'0.05em'}}>
            Links
          </span>
          {(f.links||[]).length>0&&(
            <span style={{fontSize:11,color:TXT2}}>{(f.links||[]).length} attached</span>
          )}
        </div>
        {(f.links||[]).length>0&&(
          <div style={{display:'flex',flexDirection:'column',gap:6,marginBottom:10}}>
            {(f.links||[]).map(link=>{
              const c=getLinkColor(link.url);
              const label=link.label||getDomain(link.url);
              return (
                <div key={link.id} style={{display:'flex',alignItems:'center',gap:8,padding:'7px 10px',
                  borderRadius:9,background:'#F7F8FD',border:`1px solid ${BORDER}`}}>
                  <div style={{width:24,height:24,borderRadius:6,background:c+'18',
                    display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    <i className="ti ti-link" style={{fontSize:12,color:c}}/>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:12,fontWeight:600,color:TXT,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{label}</div>
                    <div style={{fontSize:10,color:TXT2,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{link.url}</div>
                  </div>
                  <a href={link.url} target="_blank" rel="noopener noreferrer"
                    style={{color:c,fontSize:11,fontWeight:600,textDecoration:'none',
                      padding:'3px 8px',borderRadius:6,background:c+'15',whiteSpace:'nowrap'}}
                    onClick={e=>e.stopPropagation()}>
                    Open ↗
                  </a>
                  <button onClick={()=>delLink(link.id)}
                    style={{background:'none',border:'none',cursor:'pointer',color:'#ef4444',padding:'2px 4px'}}>
                    <i className="ti ti-x" style={{fontSize:11}}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
        <div style={{display:'flex',flexDirection:'column',gap:6}}>
          <Inp value={newLinkUrl} onChange={e=>setNewLinkUrl(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addLink())}
            placeholder="Paste URL (Canva, Google Drive, OneDrive…)" style={{fontSize:12}}/>
          <div style={{display:'flex',gap:6}}>
            <Inp value={newLinkLabel} onChange={e=>setNewLinkLabel(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&(e.preventDefault(),addLink())}
              placeholder="Label (optional, e.g. Campaign Brief)" style={{fontSize:12}}/>
            <button onClick={addLink} style={{background:'#6366f1',color:'white',border:'none',
              cursor:'pointer',padding:'8px 14px',borderRadius:9,fontSize:12,
              fontFamily:F,fontWeight:600,whiteSpace:'nowrap'}}>
              + Add
            </button>
          </div>
        </div>
      </div>

      {/* Attachments (photos & screenshots) */}
      <div style={{borderTop:`1px solid ${TBORDER}`,paddingTop:14,marginTop:4}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <span style={{fontSize:12,fontWeight:700,color:TXT,textTransform:'uppercase',letterSpacing:'0.05em'}}>
            Photos & Screenshots
          </span>
          {(f.images||[]).length>0&&(
            <span style={{fontSize:11,color:TXT2}}>{(f.images||[]).length} attached</span>
          )}
        </div>

        {/* Thumbnail grid */}
        {(f.images||[]).length>0&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:8,marginBottom:12}}>
            {(f.images||[]).map(img=>(
              <div key={img.id} style={{position:'relative',aspectRatio:'1',borderRadius:10,overflow:'hidden',
                background:'#EEF1F9',border:`1px solid ${BORDER}`}}>
                <img src={img.data} alt={img.name}
                  style={{width:'100%',height:'100%',objectFit:'cover',cursor:'pointer',display:'block'}}
                  onClick={()=>setLightbox(img)}/>
                <button onClick={()=>delImage(img.id)}
                  style={{position:'absolute',top:4,right:4,background:'rgba(0,0,0,0.55)',
                    color:'white',border:'none',cursor:'pointer',width:20,height:20,
                    borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
                    fontSize:10,padding:0}}>
                  <i className="ti ti-x"/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload zone — click only */}
        <label style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,
          padding:'18px',borderRadius:10,border:`2px dashed ${BORDER}`,cursor:'pointer',
          background:'#FAFBFF'}}>
          <input type="file" accept="image/*" multiple onChange={handleImages} style={{display:'none'}}/>
          <div style={{width:36,height:36,borderRadius:10,background:'#EEEEFF',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i className="ti ti-photo" style={{fontSize:18,color:'#6366f1'}}/>
          </div>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:13,fontWeight:600,color:TXT}}>Click to add photos or screenshots</div>
            <div style={{fontSize:11,color:TXT2,marginTop:2}}>PNG, JPG, GIF, WebP — multiple files supported</div>
          </div>
        </label>
      </div>

      {/* Lightbox */}
      {lightbox&&(
        <div onMouseDown={()=>setLightbox(null)}
          style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.88)',zIndex:2000,
            display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',
            flexDirection:'column',gap:12,padding:24}}>
          <img src={lightbox.data} alt={lightbox.name}
            style={{maxWidth:'85vw',maxHeight:'80vh',borderRadius:12,objectFit:'contain',
              boxShadow:'0 24px 60px rgba(0,0,0,0.5)'}}
            onMouseDown={e=>e.stopPropagation()}/>
          <div style={{color:'rgba(255,255,255,0.6)',fontSize:12}}>{lightbox.name} · click outside to close</div>
        </div>
      )}

      <div style={{display:'flex',justifyContent:'space-between',marginTop:18,paddingTop:14,borderTop:`1px solid ${TBORDER}`}}>
        {onDelete?<GhostBtn danger onClick={onDelete}>Delete</GhostBtn>:<span/>}
        <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'flex-end'}}>
          {f.recurring&&onCreateNext&&(
            <GhostBtn color="#0891b2" onClick={handleCreateNext}>
              <i className="ti ti-repeat" style={{marginRight:4,fontSize:12}} aria-hidden/>Next occurrence
            </GhostBtn>
          )}
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PBtn onClick={()=>f.title&&onSave(f)}>Save task</PBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── KPIs ───────────────────────────────────────────────────────────────────── */
function KpisPage({team,kpis,saveKpis,fy}) {
  const [entity,setEntity]=useState(ENTITIES[0]);
  const [modal,setModal]=useState(null);

  const ek=kpis.filter(k=>k.entity===entity);
  const addKpi =d=>{saveKpis([...kpis,{...d,id:mkId()}]);setModal(null);};
  const upKpi  =(id,d)=>{saveKpis(kpis.map(k=>k.id===id?{...k,...d}:k));setModal(null);};
  const delKpi =id=>{saveKpis(kpis.filter(k=>k.id!==id));setModal(null);};
  const toggleDone=id=>{saveKpis(kpis.map(k=>k.id===id?{...k,done:!k.done}:k));};

  const doneCount=ek.filter(k=>k.done).length;

  return (
    <div>
      <PageHeader title={`KPIs — ${fyLabel(fy)}`} action={
        <PBtn onClick={()=>setModal('add')}>
          <i className="ti ti-plus" style={{fontSize:14}} aria-hidden/> Add KPI
        </PBtn>
      }/>

      {/* Entity tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {ENTITIES.map(e=>{
          const {a,bg}=EC[e]||{a:'#94a3b8',bg:'#F1F5F9'};
          const active=e===entity;
          const cnt=kpis.filter(k=>k.entity===e).length;
          const doneCnt=kpis.filter(k=>k.entity===e&&k.done).length;
          return (
            <button key={e} onClick={()=>setEntity(e)} style={{
              padding:'7px 16px',fontSize:12,fontWeight:active?700:500,
              border:`1.5px solid ${active?a:BORDER}`,borderRadius:99,
              background:active?a:CARD,cursor:'pointer',color:active?'white':TXT2,
              fontFamily:F,display:'flex',alignItems:'center',gap:6,
              boxShadow:active?`0 2px 8px ${a}40`:'none'}}>
              {e}
              {cnt>0&&(
                <span style={{background:active?'rgba(255,255,255,0.25)':bg,
                  color:active?'white':a,fontSize:10,fontWeight:700,
                  padding:'0 6px',borderRadius:99}}>
                  {doneCnt}/{cnt}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {ek.length===0?(
        <Card style={{padding:'48px',textAlign:'center'}}>
          <div style={{width:48,height:48,borderRadius:14,background:'#EEF1F9',
            display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px'}}>
            <i className="ti ti-target" style={{fontSize:22,color:TXT2}} aria-hidden/>
          </div>
          <p style={{color:TXT2,fontSize:14,margin:'0 0 12px'}}>
            No KPIs set for {entity} yet.
          </p>
          <button onClick={()=>setModal('add')} style={{background:'#6366f1',color:'white',
            border:'none',cursor:'pointer',padding:'8px 20px',borderRadius:10,
            fontSize:13,fontWeight:600,fontFamily:F}}>+ Add first KPI</button>
        </Card>
      ):(
        <>
          {/* Progress summary */}
          <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
            <div style={{flex:1,height:6,borderRadius:3,background:'#EEF1F9',overflow:'hidden'}}>
              <div style={{
                width:`${ek.length>0?(doneCount/ek.length)*100:0}%`,
                height:'100%',background:(EC[entity]||{a:'#6366f1'}).a,
                borderRadius:3,transition:'width 0.3s'}}/>
            </div>
            <span style={{fontSize:12,color:TXT2,fontWeight:600,whiteSpace:'nowrap'}}>
              {doneCount} of {ek.length} achieved
            </span>
          </div>

          {/* KPI list */}
          <div style={{display:'flex',flexDirection:'column',gap:10}}>
            {ek.map(k=>{
              const {a}=EC[k.entity]||{a:'#6366f1'};
              const m=team.find(x=>x.id===k.assigneeId);
              return (
                <Card key={k.id} style={{padding:'14px 18px',
                  border:`1.5px solid ${k.done?'#BBF7D0':BORDER}`,
                  background:k.done?'#F0FDF4':CARD}}>
                  <div style={{display:'flex',alignItems:'flex-start',gap:12}}>
                    {/* Done toggle */}
                    <div onClick={()=>toggleDone(k.id)}
                      style={{width:22,height:22,borderRadius:'50%',flexShrink:0,
                        cursor:'pointer',marginTop:1,
                        border:`2px solid ${k.done?'#10b981':BORDER}`,
                        background:k.done?'#10b981':'transparent',
                        display:'flex',alignItems:'center',justifyContent:'center',
                        transition:'all 0.15s'}}>
                      {k.done&&<i className="ti ti-check" style={{fontSize:11,color:'white'}} aria-hidden/>}
                    </div>

                    {/* Content */}
                    <div style={{flex:1,minWidth:0}}>
                      <p style={{margin:'0 0 4px',fontSize:14,fontWeight:600,
                        color:k.done?'#047857':TXT,
                        textDecoration:k.done?'line-through':'none',
                        lineHeight:1.4}}>
                        {k.title||k.type||'Untitled KPI'}
                      </p>
                      {k.notes&&(
                        <p style={{margin:'0 0 6px',fontSize:12,color:TXT2,lineHeight:1.4}}>
                          {k.notes}
                        </p>
                      )}
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        {m&&(
                          <div style={{display:'flex',alignItems:'center',gap:5}}>
                            <Avatar name={m.name} color={m.color} size={18}/>
                            <span style={{fontSize:11,color:TXT2}}>{m.name}</span>
                          </div>
                        )}
                        {k.done&&(
                          <span style={{fontSize:11,color:'#10b981',fontWeight:600}}>
                            ✓ Achieved
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Edit button */}
                    <button onClick={()=>setModal({edit:k})}
                      style={{background:'#EEF1F9',border:'none',cursor:'pointer',
                        color:TXT2,padding:'4px 10px',borderRadius:7,
                        fontSize:11,fontWeight:600,fontFamily:F,flexShrink:0}}>
                      Edit
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}

      {modal==='add'&&<KpiModal title="New KPI" entity={entity} onClose={()=>setModal(null)} onSave={addKpi} team={team}/>}
      {modal?.edit&&<KpiModal title="Edit KPI" kpi={modal.edit} entity={entity} onClose={()=>setModal(null)} onSave={d=>upKpi(modal.edit.id,d)} onDelete={()=>delKpi(modal.edit.id)} team={team}/>}
    </div>
  );
}

function KpiModal({title,kpi,entity,onClose,onSave,onDelete,team}) {
  const [f,setF]=useState({
    entity:kpi?.entity||entity,
    title:kpi?.title||kpi?.type||'',
    assigneeId:kpi?.assigneeId||'',
    notes:kpi?.notes||'',
    done:kpi?.done||false,
  });
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <Modal title={title} onClose={onClose}>
      <Lbl s="Entity">
        <Sel value={f.entity} onChange={e=>s('entity',e.target.value)}>
          {ENTITIES.map(e=><option key={e} value={e}>{e}</option>)}
        </Sel>
      </Lbl>
      <Lbl s="What needs to be achieved by end of FY">
        <textarea value={f.title} onChange={e=>s('title',e.target.value)}
          placeholder="e.g. Increase website leads to 500 per month by March"
          rows={3}
          style={{...inputStyle,resize:'vertical'}}/>
      </Lbl>
      <Lbl s="Assigned to (optional)">
        <Sel value={f.assigneeId} onChange={e=>s('assigneeId',e.target.value)}>
          <option value="">Team / no individual</option>
          {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </Sel>
      </Lbl>
      <Lbl s="Notes (optional)">
        <Inp value={f.notes} onChange={e=>s('notes',e.target.value)}
          placeholder="Context or how this will be measured"/>
      </Lbl>
      {kpi&&(
        <div onClick={()=>s('done',!f.done)}
          style={{display:'flex',alignItems:'center',gap:10,cursor:'pointer',
            padding:'10px 14px',borderRadius:10,marginBottom:4,
            background:f.done?'#F0FDF4':'#F7F8FD',
            border:`1px solid ${f.done?'#BBF7D0':BORDER}`}}>
          <div style={{width:20,height:20,borderRadius:'50%',flexShrink:0,
            border:`2px solid ${f.done?'#10b981':BORDER}`,
            background:f.done?'#10b981':'transparent',
            display:'flex',alignItems:'center',justifyContent:'center'}}>
            {f.done&&<i className="ti ti-check" style={{fontSize:11,color:'white'}} aria-hidden/>}
          </div>
          <span style={{fontSize:13,fontWeight:500,color:f.done?'#047857':TXT}}>
            {f.done?'Achieved ✓':'Mark as achieved'}
          </span>
        </div>
      )}
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16,
        paddingTop:14,borderTop:`1px solid ${TBORDER}`}}>
        {onDelete?<GhostBtn danger onClick={onDelete}>Delete</GhostBtn>:<span/>}
        <div style={{display:'flex',gap:8}}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PBtn onClick={()=>f.title&&onSave(f)}>Save KPI</PBtn>
        </div>
      </div>
    </Modal>
  );
}
function FinPage({expenses,saveExp,leads,saveLeads,budgets,saveBudgets,fy}) {
  const [tab,setTab]          =useState('expenses');
  const [expEdit,setExpEdit]  =useState(null);
  const [leadEdit,setLead]    =useState(null);
  const [budgetEdit,setBudEdit]=useState(null); // monthKey being budget-edited
  const [expF,setExpF]        =useState({});
  const [leadF,setLeadF]      =useState({});
  const [budgetF,setBudgetF]  =useState({});

  const fyMths=FY_MONTHS.map((m,i)=>({label:m,key:fyMKey(fy,i),year:i>=9?fy+1:fy}));

  // Totals
  const fyTotExp    =fyMths.reduce((s,{key})=>s+EXP_CATS.reduce((ss,c)=>ss+(+((expenses[key]||{})[c])||0),0),0);
  const fyTotLeads  =fyMths.reduce((s,{key})=>s+LEAD_SRCS.reduce((ss,r)=>ss+(+((leads[key]||{})[r])||0),0),0);
  const fyLeadGenExp=fyMths.reduce((s,{key})=>s+(+((expenses[key]||{})['Lead Generation'])||0),0);
  const monthsWithLeads=fyMths.filter(({key})=>LEAD_SRCS.reduce((s,r)=>s+(+((leads[key]||{})[r])||0),0)>0).length;

  // Per-month budget helpers (budgets now keyed by monthKey like expenses)
  const monthBudgetTotal=key=>EXP_CATS.reduce((s,c)=>s+(+((budgets[key]||{})[c])||0),0);
  const fyTotBudget=fyMths.reduce((s,{key})=>s+monthBudgetTotal(key),0);
  const fyBudgetByCat=c=>fyMths.reduce((s,{key})=>s+(+((budgets[key]||{})[c])||0),0);

  const variance=(actual,budget)=>budget>0?Math.round(((actual-budget)/budget)*100):null;

  // Chart: monthly actual vs budget
  let cumA=0,cumB=0;
  const chartData=fyMths.map(({label,key})=>{
    const actual=EXP_CATS.reduce((s,c)=>s+(+((expenses[key]||{})[c])||0),0);
    const budget=monthBudgetTotal(key);
    cumA+=actual; cumB+=budget;
    return {'month':label,'Monthly Actual':actual,'Monthly Budget':budget,
      'Cumulative Actual':Math.round(cumA),'Cumulative Budget':Math.round(cumB)};
  });
  const hasAnyBudget=fyTotBudget>0;

  const CAT_COLORS=['#6366f1','#0891b2','#10b981','#f59e0b'];

  return (
    <div>
      <PageHeader title={`Finance — ${fyLabel(fy)}`}/>
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {[['expenses','Expenses'],['leads','Leads & CPL']].map(([id,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{padding:'8px 20px',fontSize:13,fontWeight:tab===id?700:500,
            border:`1.5px solid ${tab===id?'#6366f1':BORDER}`,borderRadius:99,
            background:tab===id?'#6366f1':CARD,cursor:'pointer',color:tab===id?'white':TXT2,
            fontFamily:F,boxShadow:tab===id?'0 2px 8px rgba(99,102,241,0.3)':'none'}}>{label}</button>
        ))}
      </div>

      {tab==='expenses'&&(
        <>
          {/* Summary cards */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {EXP_CATS.map((c,i)=>{
              const actual=fyMths.reduce((s,{key})=>s+(+((expenses[key]||{})[c])||0),0);
              const budget=fyBudgetByCat(c);
              const vPct=variance(actual,budget);
              return (
                <Card key={c} style={{padding:'16px'}}>
                  <div style={{width:32,height:32,borderRadius:8,background:CAT_COLORS[i]+'20',
                    display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                    <i className="ti ti-cash" style={{fontSize:15,color:CAT_COLORS[i]}} aria-hidden/>
                  </div>
                  <div style={{fontSize:11,color:TXT2,fontWeight:600,marginBottom:4,
                    textTransform:'uppercase',letterSpacing:'0.04em'}}>{c}</div>
                  <div style={{fontSize:20,fontWeight:700,color:TXT}}>{actual>0?`$${actual.toLocaleString()}`:'—'}</div>
                  {budget>0&&(
                    <div style={{marginTop:6}}>
                      <div style={{fontSize:10,color:TXT2}}>Budget: ${budget.toLocaleString()}</div>
                      {vPct!==null&&actual>0&&(
                        <div style={{fontSize:11,fontWeight:700,marginTop:2,color:vPct>0?'#ef4444':'#10b981'}}>
                          {vPct>0?`▲${vPct}% over`:`▼${Math.abs(vPct)}% under`} budget
                        </div>
                      )}
                      <div style={{height:4,borderRadius:2,background:'#EEF1F9',overflow:'hidden',marginTop:6}}>
                        <div style={{width:`${Math.min(100,budget>0?(actual/budget)*100:0)}%`,
                          height:'100%',background:vPct>0?'#ef4444':CAT_COLORS[i],borderRadius:2}}/>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Chart */}
          {hasAnyBudget&&(
            <Card style={{padding:'18px 20px',marginBottom:16}}>
              <div style={{fontSize:13,fontWeight:700,color:TXT,marginBottom:16}}>
                Budget vs Actual — {fyLabel(fy)}
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <ComposedChart data={chartData} margin={{top:4,right:16,left:0,bottom:0}}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F9"/>
                  <XAxis dataKey="month" tick={{fontSize:11,fill:TXT2}} axisLine={false} tickLine={false}/>
                  <YAxis tick={{fontSize:11,fill:TXT2}} axisLine={false} tickLine={false}
                    tickFormatter={v=>v>=1000?`$${(v/1000).toFixed(0)}k`:`$${v}`}/>
                  <Tooltip formatter={(v,n)=>[`$${Number(v).toLocaleString()}`,n]}
                    contentStyle={{borderRadius:10,border:`1px solid ${BORDER}`,fontSize:12,fontFamily:F}}/>
                  <Legend wrapperStyle={{fontSize:12,fontFamily:F,paddingTop:8}}/>
                  <Bar dataKey="Monthly Budget" fill="#E5E9F5" radius={[4,4,0,0]}/>
                  <Bar dataKey="Monthly Actual" fill="#6366f1" radius={[4,4,0,0]}/>
                  <Line type="monotone" dataKey="Cumulative Budget" stroke="#94a3b8"
                    strokeWidth={2} strokeDasharray="5 4" dot={false}/>
                  <Line type="monotone" dataKey="Cumulative Actual" stroke="#f59e0b"
                    strokeWidth={2} dot={{r:3,fill:'#f59e0b'}}/>
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* Expenses table */}
          <Card>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead>
                  <tr style={{borderBottom:`2px solid ${TBORDER}`}}>
                    <th style={TH}>Month</th>
                    {EXP_CATS.map(c=><th key={c} style={TH}>{c}</th>)}
                    <th style={TH}>Total</th>
                    <th style={TH}>Actual</th>
                    <th style={TH}>Budget</th>
                  </tr>
                </thead>
                <tbody>
                  {fyMths.map(({label,key,year},ri)=>{
                    const r=expenses[key]||{};
                    const b=budgets[key]||{};
                    const totActual=EXP_CATS.reduce((s,c)=>s+(+r[c]||0),0);
                    const totBudget=EXP_CATS.reduce((s,c)=>s+(+b[c]||0),0);
                    const totV=variance(totActual,totBudget);
                    return (
                      <tr key={key} style={{background:ri%2===0?CARD:'#FAFBFF',
                        borderBottom:`1px solid ${TBORDER}`}}>
                        <td style={{...TD,fontWeight:600}}>{label} {year}</td>
                        {EXP_CATS.map(c=>{
                          const actual=+r[c]||0;
                          const budget=+b[c]||0;
                          const vPct=variance(actual,budget);
                          return (
                            <td key={c} style={TD}>
                              <div style={{fontWeight:500}}>{actual>0?`$${Number(actual).toLocaleString()}`:'—'}</div>
                              {budget>0&&<div style={{fontSize:10,color:TXT2,marginTop:1}}>Budget: ${Number(budget).toLocaleString()}</div>}
                              {vPct!==null&&actual>0&&(
                                <div style={{fontSize:10,fontWeight:700,marginTop:1,
                                  color:vPct>0?'#ef4444':'#10b981'}}>
                                  {vPct>0?`▲${vPct}%`:`▼${Math.abs(vPct)}%`}
                                </div>
                              )}
                            </td>
                          );
                        })}
                        <td style={{...TD,fontWeight:700,color:'#6366f1'}}>
                          <div>{totActual>0?`$${totActual.toLocaleString()}`:'—'}</div>
                          {totBudget>0&&<div style={{fontSize:10,color:TXT2,marginTop:1}}>Budget: ${totBudget.toLocaleString()}</div>}
                          {totV!==null&&totActual>0&&(
                            <div style={{fontSize:10,fontWeight:700,marginTop:1,
                              color:totV>0?'#ef4444':'#10b981'}}>
                              {totV>0?`▲${totV}%`:`▼${Math.abs(totV)}%`}
                            </div>
                          )}
                        </td>
                        <td style={TD}>
                          <button onClick={()=>{setExpF(r);setExpEdit(key);}}
                            style={{background:'#EEEEFF',color:'#6366f1',border:'none',cursor:'pointer',
                              padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:600,fontFamily:F,marginBottom:4,display:'block'}}>
                            Edit actual
                          </button>
                          <button onClick={()=>{setBudgetF(b);setBudEdit(key);}}
                            style={{background:'#E0F7EF',color:'#047857',border:'none',cursor:'pointer',
                              padding:'4px 10px',borderRadius:8,fontSize:11,fontWeight:600,fontFamily:F,display:'block'}}>
                            Edit budget
                          </button>
                        </td>
                        <td style={TD}>{totBudget>0?`$${totBudget.toLocaleString()}`:'—'}</td>
                      </tr>
                    );
                  })}
                  {/* FY totals row */}
                  <tr style={{background:'#F7F8FD',borderTop:`2px solid ${BORDER}`}}>
                    <td style={{...TD,fontWeight:700}}>FY Total</td>
                    {EXP_CATS.map(c=>{
                      const actual=fyMths.reduce((s,{key})=>s+(+((expenses[key]||{})[c])||0),0);
                      const budget=fyBudgetByCat(c);
                      const vPct=variance(actual,budget);
                      return (
                        <td key={c} style={TD}>
                          <div style={{fontWeight:700}}>{actual>0?`$${actual.toLocaleString()}`:'—'}</div>
                          {budget>0&&<div style={{fontSize:10,color:TXT2,marginTop:1}}>Budget: ${budget.toLocaleString()}</div>}
                          {vPct!==null&&actual>0&&(
                            <div style={{fontSize:10,fontWeight:700,marginTop:1,color:vPct>0?'#ef4444':'#10b981'}}>
                              {vPct>0?`▲${vPct}%`:`▼${Math.abs(vPct)}%`}
                            </div>
                          )}
                        </td>
                      );
                    })}
                    <td style={{...TD,fontWeight:700,color:'#6366f1',fontSize:14}}>
                      <div>{fyTotExp>0?`$${fyTotExp.toLocaleString()}`:'—'}</div>
                      {fyTotBudget>0&&<div style={{fontSize:11,color:TXT2,marginTop:1}}>Budget: ${fyTotBudget.toLocaleString()}</div>}
                      {fyTotBudget>0&&fyTotExp>0&&(()=>{
                        const vPct=variance(fyTotExp,fyTotBudget);
                        return vPct!==null?<div style={{fontSize:11,fontWeight:700,marginTop:1,
                          color:vPct>0?'#ef4444':'#10b981'}}>
                          {vPct>0?`▲${vPct}% over`:`▼${Math.abs(vPct)}% under`}
                        </div>:null;
                      })()}
                    </td>
                    <td style={TD}/>
                    <td style={{...TD,fontWeight:700}}>{fyTotBudget>0?`$${fyTotBudget.toLocaleString()}`:'—'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {tab==='leads'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[{l:'FY leads',v:fyTotLeads||'—',i:'ti-users',c:'#6366f1',bg:'#EEEEFF'},
              {l:'Lead gen spend',v:fyLeadGenExp?`$${fyLeadGenExp.toLocaleString()}`:'—',i:'ti-cash',c:'#0891b2',bg:'#E0F5FB'},
              {l:'FY cost/lead',v:fyTotLeads>0&&fyLeadGenExp>0?`$${(fyLeadGenExp/fyTotLeads).toFixed(2)}`:'—',i:'ti-coin',c:'#10b981',bg:'#E0F7EF'},
              {l:'Avg leads/month',v:fyTotLeads>0&&monthsWithLeads>0?Math.round(fyTotLeads/monthsWithLeads):'—',i:'ti-chart-line',c:'#f59e0b',bg:'#FEF4DC'},
            ].map(({l,v,i,c,bg})=>(
              <Card key={l} style={{padding:'16px'}}>
                <div style={{width:32,height:32,borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:10}}>
                  <i className={`ti ${i}`} style={{fontSize:15,color:c}} aria-hidden/>
                </div>
                <div style={{fontSize:11,color:TXT2,fontWeight:600,marginBottom:4,textTransform:'uppercase',letterSpacing:'0.04em'}}>{l}</div>
                <div style={{fontSize:20,fontWeight:700,color:TXT}}>{v}</div>
              </Card>
            ))}
          </div>
          <Card>
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%',borderCollapse:'collapse'}}>
                <thead><tr style={{borderBottom:`2px solid ${TBORDER}`}}>
                  <th style={TH}>Month</th>
                  {LEAD_SRCS.map(s=><th key={s} style={TH}>{s}</th>)}
                  <th style={TH}>Total leads</th>
                  <th style={TH}>Lead Gen Spend</th>
                  <th style={{...TH,color:'#6366f1'}}>CPL</th>
                  <th style={TH}/>
                </tr></thead>
                <tbody>
                  {fyMths.map(({label,key,year},ri)=>{
                    const lr=leads[key]||{};const er=expenses[key]||{};
                    const totL=LEAD_SRCS.reduce((s,r)=>s+(+lr[r]||0),0);
                    const leadGenSpend=+(er['Lead Generation']||0);
                    const cpl=totL>0&&leadGenSpend>0?(leadGenSpend/totL).toFixed(2):null;
                    return (
                      <tr key={key} style={{background:ri%2===0?CARD:'#FAFBFF',borderBottom:`1px solid ${TBORDER}`}}>
                        <td style={{...TD,fontWeight:600}}>{label} {year}</td>
                        {LEAD_SRCS.map(r=><td key={r} style={TD}>{lr[r]?Number(lr[r]).toLocaleString():'—'}</td>)}
                        <td style={{...TD,fontWeight:700}}>{totL>0?totL.toLocaleString():'—'}</td>
                        <td style={TD}>{leadGenSpend>0?`$${leadGenSpend.toLocaleString()}`:'—'}</td>
                        <td style={{...TD,fontWeight:700,color:cpl?'#6366f1':TXT2}}>{cpl?`$${cpl}`:'—'}</td>
                        <td style={TD}><button onClick={()=>{setLeadF(lr);setLead(key);}}
                          style={{background:'#EEEEFF',color:'#6366f1',border:'none',cursor:'pointer',
                            padding:'4px 12px',borderRadius:8,fontSize:11,fontWeight:600,fontFamily:F}}>Edit</button></td>
                      </tr>
                    );
                  })}
                  <tr style={{background:'#F7F8FD',borderTop:`2px solid ${BORDER}`}}>
                    <td style={{...TD,fontWeight:700}}>FY Total</td>
                    {LEAD_SRCS.map(r=>{const tot=fyMths.reduce((s,{key})=>s+(+((leads[key]||{})[r])||0),0);return<td key={r} style={{...TD,fontWeight:700}}>{tot>0?tot.toLocaleString():'—'}</td>;})}
                    <td style={{...TD,fontWeight:700}}>{fyTotLeads>0?fyTotLeads.toLocaleString():'—'}</td>
                    <td style={{...TD,fontWeight:700}}>{fyLeadGenExp>0?`$${fyLeadGenExp.toLocaleString()}`:'—'}</td>
                    <td style={{...TD,fontWeight:700,color:'#6366f1',fontSize:14}}>{fyTotLeads>0&&fyLeadGenExp>0?`$${(fyLeadGenExp/fyTotLeads).toFixed(2)}`:'—'}</td>
                    <td style={TD}/>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Edit actual modal */}
      {expEdit&&(
        <Modal title={`Actual spend — ${fyMths.find(m=>m.key===expEdit)?.label} ${expEdit?.slice(0,4)}`} onClose={()=>setExpEdit(null)}>
          <p style={{fontSize:13,color:TXT2,margin:'0 0 16px'}}>Enter monthly actual spend per category</p>
          {EXP_CATS.map(c=><Lbl key={c} s={c}><Inp type="number" value={expF[c]||''} onChange={e=>setExpF(f=>({...f,[c]:e.target.value}))} placeholder="0"/></Lbl>)}
          <div style={{background:'#F7F8FD',borderRadius:10,padding:'12px 14px',marginBottom:16,border:`1px solid ${BORDER}`}}>
            <span style={{fontSize:12,color:TXT2}}>Total: </span>
            <span style={{fontSize:15,fontWeight:700,color:TXT}}>${EXP_CATS.reduce((s,c)=>s+(+expF[c]||0),0).toLocaleString()}</span>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <GhostBtn onClick={()=>setExpEdit(null)}>Cancel</GhostBtn>
            <PBtn onClick={()=>{saveExp({...expenses,[expEdit]:expF});setExpEdit(null);}}>Save</PBtn>
          </div>
        </Modal>
      )}

      {/* Edit budget modal */}
      {budgetEdit&&(
        <Modal title={`Budget — ${fyMths.find(m=>m.key===budgetEdit)?.label} ${budgetEdit?.slice(0,4)}`} onClose={()=>setBudEdit(null)}>
          <p style={{fontSize:13,color:TXT2,margin:'0 0 16px'}}>Enter the budgeted amount per category for this month</p>
          {EXP_CATS.map(c=><Lbl key={c} s={c}><Inp type="number" value={budgetF[c]||''} onChange={e=>setBudgetF(f=>({...f,[c]:e.target.value}))} placeholder="0"/></Lbl>)}
          <div style={{background:'#F7F8FD',borderRadius:10,padding:'12px 14px',marginBottom:16,border:`1px solid ${BORDER}`}}>
            <span style={{fontSize:12,color:TXT2}}>Total budget: </span>
            <span style={{fontSize:15,fontWeight:700,color:TXT}}>${EXP_CATS.reduce((s,c)=>s+(+budgetF[c]||0),0).toLocaleString()}</span>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <GhostBtn onClick={()=>setBudEdit(null)}>Cancel</GhostBtn>
            <PBtn onClick={()=>{saveBudgets({...budgets,[budgetEdit]:budgetF});setBudEdit(null);}}>Save budget</PBtn>
          </div>
        </Modal>
      )}

      {/* Edit leads modal */}
      {leadEdit&&(
        <Modal title={`Leads — ${fyMths.find(m=>m.key===leadEdit)?.label} ${leadEdit?.slice(0,4)}`} onClose={()=>setLead(null)}>
          <p style={{fontSize:13,color:TXT2,margin:'0 0 16px'}}>Enter lead counts by source type</p>
          {LEAD_SRCS.map(r=><Lbl key={r} s={`${r} leads`}><Inp type="number" value={leadF[r]||''} onChange={e=>setLeadF(f=>({...f,[r]:e.target.value}))} placeholder="0"/></Lbl>)}
          <div style={{background:'#F7F8FD',borderRadius:10,padding:'12px 14px',marginBottom:16,border:`1px solid ${BORDER}`}}>
            <span style={{fontSize:12,color:TXT2}}>Total leads: </span>
            <span style={{fontSize:15,fontWeight:700,color:TXT}}>{LEAD_SRCS.reduce((s,r)=>s+(+leadF[r]||0),0).toLocaleString()}</span>
          </div>
          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <GhostBtn onClick={()=>setLead(null)}>Cancel</GhostBtn>
            <PBtn onClick={()=>{saveLeads({...leads,[leadEdit]:leadF});setLead(null);}}>Save</PBtn>
          </div>
        </Modal>
      )}
    </div>
  );
}
/* ── Calendar ───────────────────────────────────────────────────────────────── */
function CalendarPage({team,tasks}) {
  const [cur,setCur]=useState(new Date());
  const [selected,setSelected]=useState(null);
  const yr=cur.getFullYear(), mo=cur.getMonth();

  const MONTHS=['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Build calendar grid (Monday first)
  const firstDay=(new Date(yr,mo,1).getDay()+6)%7; // 0=Mon
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push({d:new Date(yr,mo,-(firstDay-i-1)),cur:false});
  for(let d=1;d<=daysInMonth;d++) cells.push({d:new Date(yr,mo,d),cur:true});
  while(cells.length%7!==0) cells.push({d:new Date(yr,mo+1,cells.length-daysInMonth-firstDay+1),cur:false});

  const toKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const todayKey=toKey(new Date());

  // Check if a recurring task falls on a given day
  const isRecurringOn=(task,date)=>{
    if(!task.recurring||!task.dueDate) return false;
    const start=new Date(task.dueDate+'T00:00:00');
    if(date<start) return false; // don't show before original due date
    if(toKey(date)===task.dueDate) return false; // already shown as direct match
    if(task.recurring==='weekly'){
      const diff=Math.round((date-start)/(1000*60*60*24));
      return diff%7===0;
    }
    if(task.recurring==='monthly'){
      return date.getDate()===start.getDate();
    }
    if(task.recurring==='quarterly'){
      const mDiff=(date.getFullYear()-start.getFullYear())*12+(date.getMonth()-start.getMonth());
      return date.getDate()===start.getDate()&&mDiff%3===0&&mDiff>0;
    }
    if(task.recurring==='yearly'){
      return date.getDate()===start.getDate()&&date.getMonth()===start.getMonth()&&date.getFullYear()>start.getFullYear();
    }
    return false;
  };

  const tasksForDay=d=>{
    const k=toKey(d);
    const direct=tasks.filter(t=>t.dueDate===k);
    const recurring=tasks.filter(t=>t.recurring&&isRecurringOn(t,d));
    return [...direct,...recurring];
  };

  const getTaskColor=t=>{
    const ids=getIds(t);
    const m=team.find(x=>ids.includes(x.id));
    return m?m.color:EC[t.entity]?.a||'#94a3b8';
  };

  // All members who have tasks this month (for legend)
  const activeMembers=team.filter(m=>
    tasks.some(t=>getIds(t).includes(m.id)&&t.dueDate&&
      t.dueDate.startsWith(`${yr}-${String(mo+1).padStart(2,'0')}`))
  );

  return (
    <div>
      <PageHeader title="Calendar"/>

      {/* Month nav */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20}}>
        <button onClick={()=>setCur(new Date(yr,mo-1,1))} style={{
          background:CARD,border:`1px solid ${BORDER}`,cursor:'pointer',
          width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',
          justifyContent:'center',color:TXT,boxShadow:CSHADOW}}>
          <i className="ti ti-chevron-left" style={{fontSize:15}}/>
        </button>
        <span style={{fontSize:17,fontWeight:700,color:TXT,minWidth:160,textAlign:'center'}}>
          {MONTHS[mo]} {yr}
        </span>
        <button onClick={()=>setCur(new Date(yr,mo+1,1))} style={{
          background:CARD,border:`1px solid ${BORDER}`,cursor:'pointer',
          width:34,height:34,borderRadius:9,display:'flex',alignItems:'center',
          justifyContent:'center',color:TXT,boxShadow:CSHADOW}}>
          <i className="ti ti-chevron-right" style={{fontSize:15}}/>
        </button>
        <button onClick={()=>setCur(new Date())} style={{
          background:'#EEEEFF',border:'none',cursor:'pointer',color:'#6366f1',
          padding:'6px 14px',borderRadius:9,fontSize:12,fontWeight:600,fontFamily:F}}>
          Today
        </button>
        {/* Legend */}
        {activeMembers.length>0&&(
          <div style={{display:'flex',gap:10,marginLeft:'auto',flexWrap:'wrap'}}>
            {activeMembers.map(m=>(
              <div key={m.id} style={{display:'flex',alignItems:'center',gap:5}}>
                <div style={{width:10,height:10,borderRadius:3,background:m.color,flexShrink:0}}/>
                <span style={{fontSize:11,color:TXT2,fontWeight:500}}>{m.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calendar grid */}
      <Card style={{overflow:'hidden'}}>
        {/* Day headers */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',
          borderBottom:`2px solid ${TBORDER}`}}>
          {DAYS.map(d=>(
            <div key={d} style={{padding:'10px 0',textAlign:'center',
              fontSize:11,fontWeight:700,color:TXT2,
              textTransform:'uppercase',letterSpacing:'0.06em'}}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {cells.map((cell,i)=>{
            const key=toKey(cell.d);
            const isToday=key===todayKey;
            const dayTasks=tasksForDay(cell.d);
            const overdue=dayTasks.filter(t=>t.status!=='Done'&&key<todayKey);
            const show=dayTasks.slice(0,3);
            const extra=dayTasks.length-3;
            const isSelected=selected===key;
            const isWeekend=cell.d.getDay()===0||cell.d.getDay()===6;
            return (
              <div key={i} onClick={()=>setSelected(isSelected?null:key)}
                style={{minHeight:90,padding:'8px',
                  borderRight:`1px solid ${TBORDER}`,
                  borderBottom:`1px solid ${TBORDER}`,
                  background:isSelected?'#F3F4FF':isToday?'#FAFAFF':isWeekend&&!cell.cur?'#FAFBFF':CARD,
                  cursor:'pointer',transition:'background 0.1s'}}>

                {/* Date number */}
                <div style={{display:'flex',justifyContent:'flex-end',marginBottom:4}}>
                  <span style={{
                    width:24,height:24,borderRadius:'50%',
                    background:isToday?'#6366f1':'transparent',
                    color:isToday?'white':cell.cur?TXT:'#CBD5E1',
                    fontSize:12,fontWeight:isToday?700:cell.cur?500:400,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {cell.d.getDate()}
                  </span>
                </div>

                {/* Tasks */}
                {show.map(t=>{
                  const c=getTaskColor(t);
                  const done=t.status==='Done';
                  const od=t.status!=='Done'&&key<todayKey;
                  const bgColor=od?'#ef4444':done?'#10b981':c;
                  return (
                    <div key={t.id+key} style={{
                      background:bgColor,color:'white',
                      fontSize:10,fontWeight:600,padding:'2px 7px',
                      borderRadius:5,marginBottom:2,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                      opacity:done?0.6:1,display:'flex',alignItems:'center',gap:3}}>
                      {t.recurring&&<i className="ti ti-repeat" style={{fontSize:8,flexShrink:0}}/>}
                      <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{t.title}</span>
                    </div>
                  );
                })}
                {extra>0&&(
                  <div style={{fontSize:10,color:TXT2,fontWeight:600,padding:'1px 4px'}}>
                    +{extra} more
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected day task list */}
      {selected&&(()=>{
        const dayTasks=tasks.filter(t=>t.dueDate===selected);
        if(!dayTasks.length) return null;
        const d=new Date(selected+'T00:00:00');
        return (
          <Card style={{padding:'16px 20px',marginTop:14}}>
            <div style={{fontSize:13,fontWeight:700,color:TXT,marginBottom:12}}>
              Tasks due {d.toLocaleDateString('en-SG',{weekday:'long',day:'numeric',month:'long'})}
              <span style={{background:'#EEF1F9',color:TXT2,fontSize:11,fontWeight:600,
                padding:'2px 8px',borderRadius:99,marginLeft:8}}>{dayTasks.length}</span>
            </div>
            {dayTasks.map(t=>{
              const ids=getIds(t);
              const assignees=team.filter(m=>ids.includes(m.id));
              const c=getTaskColor(t);
              const od=t.status!=='Done'&&selected<todayKey;
              return (
                <div key={t.id} style={{display:'flex',alignItems:'center',gap:10,
                  padding:'8px 0',borderBottom:`1px solid ${TBORDER}`}}>
                  <div style={{width:3,height:32,borderRadius:2,background:c,flexShrink:0}}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,color:od?'#dc2626':TXT,
                      overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.title}</div>
                    <div style={{fontSize:11,color:TXT2,marginTop:1}}>{t.status}{od?' · Overdue':''}</div>
                  </div>
                  {t.entity&&<Chip label={t.entity} ec={t.entity}/>}
                  {assignees.length>0&&<AvatarStack assignees={assignees} size={22}/>}
                </div>
              );
            })}
          </Card>
        );
      })()}
    </div>
  );
}

/* ── Settings ───────────────────────────────────────────────────────────────── */
function SettingsPage({team,saveTeam,fy,setFy}) {
  const [lt,setLt]=useState(()=>team.map(m=>({...m})));
  const [saved,setSaved]=useState(false);
  const save=()=>{saveTeam(lt);setSaved(true);setTimeout(()=>setSaved(false),2000);};
  return (
    <div>
      <PageHeader title="Settings"/>
      <Card style={{padding:'20px 24px',marginBottom:16}}>
        <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:700,color:TXT}}>Team members</h3>
        <p style={{margin:'0 0 18px',fontSize:13,color:TXT2}}>Rename members and pick a colour.</p>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {lt.map((m,i)=>(
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 14px',borderRadius:12,background:'#F7F8FD',border:`1px solid ${BORDER}`}}>
              <Avatar name={m.name} color={m.color} size={36}/>
              <input value={m.name} onChange={e=>setLt(t=>t.map((x,j)=>j===i?{...x,name:e.target.value}:x))}
                style={{...inputStyle,flex:1,background:CARD}}/>
              <label style={{cursor:'pointer',display:'flex',alignItems:'center',gap:6,fontSize:12,color:TXT2,fontWeight:500}}>
                Colour
                <input type="color" value={m.color} onChange={e=>setLt(t=>t.map((x,j)=>j===i?{...x,color:e.target.value}:x))}
                  style={{width:30,height:30,border:'none',background:'none',cursor:'pointer',padding:0,borderRadius:6}}/>
              </label>
            </div>
          ))}
        </div>
      </Card>
      <Card style={{padding:'20px 24px',marginBottom:20}}>
        <h3 style={{margin:'0 0 6px',fontSize:15,fontWeight:700,color:TXT}}>Fiscal year</h3>
        <p style={{margin:'0 0 14px',fontSize:13,color:TXT2}}>Data is grouped by the selected fiscal year.</p>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <Sel value={fy} onChange={e=>setFy(Number(e.target.value))} style={{width:'auto'}}>
            {[2023,2024,2025,2026,2027,2028].map(y=><option key={y} value={y}>{fyLabel(y)}</option>)}
          </Sel>
          <span style={{fontSize:13,color:TXT2,background:'#EEF1F9',padding:'6px 14px',borderRadius:99,fontWeight:500}}>Apr {fy} – Mar {fy+1}</span>
        </div>
      </Card>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <PBtn onClick={save}>Save changes</PBtn>
        {saved&&<span style={{fontSize:13,color:'#10b981',fontWeight:700,display:'flex',alignItems:'center',gap:5}}>
          <i className="ti ti-circle-check" style={{fontSize:15}} aria-hidden/> Saved!
        </span>}
      </div>
    </div>
  );
}
