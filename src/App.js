/* eslint-disable */
import { useState, useEffect } from "react";
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import * as XLSX from 'xlsx';

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

const EVENT_TYPES = {
  'Shooting':   {color:'#0891b2',bg:'#E0F5FB'},
  'Activation': {color:'#10b981',bg:'#E0F7EF'},
  'Leave':      {color:'#f59e0b',bg:'#FEF4DC'},
  'Event':      {color:'#8b5cf6',bg:'#F0ECFF'},
  'Other':      {color:'#94a3b8',bg:'#F1F5F9'},
};

// Singapore Public Holidays (fixed + approximate for lunar)
const SG_HOLIDAYS = {
  '2025-01-01':"New Year's Day",
  '2025-01-29':'Chinese New Year',
  '2025-01-30':'Chinese New Year Day 2',
  '2025-03-31':'Hari Raya Puasa',
  '2025-04-18':'Good Friday',
  '2025-05-01':'Labour Day',
  '2025-05-12':'Vesak Day',
  '2025-06-07':'Hari Raya Haji',
  '2025-08-09':'National Day',
  '2025-10-20':'Deepavali',
  '2025-12-25':'Christmas Day',
  '2026-01-01':"New Year's Day",
  '2026-02-17':'Chinese New Year',
  '2026-02-18':'Chinese New Year Day 2',
  '2026-03-20':'Hari Raya Puasa',
  '2026-04-03':'Good Friday',
  '2026-05-01':'Labour Day',
  '2026-05-27':'Hari Raya Haji',
  '2026-05-31':'Vesak Day',
  '2026-08-09':'National Day',
  '2026-11-07':'Deepavali',
  '2026-12-25':'Christmas Day',
  '2027-01-01':"New Year's Day",
  '2027-02-06':'Chinese New Year',
  '2027-02-07':'Chinese New Year Day 2',
  '2027-03-10':'Hari Raya Puasa',
  '2027-03-26':'Good Friday',
  '2027-05-01':'Labour Day',
  '2027-05-17':'Hari Raya Haji',
  '2027-05-20':'Vesak Day',
  '2027-08-09':'National Day',
  '2027-10-27':'Deepavali',
  '2027-12-25':'Christmas Day',
};

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

// Compress image to max 800px and JPEG 70% — keeps base64 small enough for storage
const compressImage=(dataUrl,maxPx=800,quality=0.7)=>new Promise(resolve=>{
  const img=new Image();
  img.onload=()=>{
    let w=img.width,h=img.height;
    if(w>maxPx||h>maxPx){
      if(w>h){h=Math.round(h*maxPx/w);w=maxPx;}
      else{w=Math.round(w*maxPx/h);h=maxPx;}
    }
    const c=document.createElement('canvas');
    c.width=w;c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    resolve(c.toDataURL('image/jpeg',quality));
  };
  img.onerror=()=>resolve(dataUrl); // fallback to original if compression fails
  img.src=dataUrl;
});

const DEFAULT_TEAM = MC.map((c,i)=>({id:`m${i+1}`,name:`Member ${i+1}`,color:c}));
const sv = async(k,v)=>{ try{localStorage.setItem(k,JSON.stringify(v))}catch(e){
  if(e.name==='QuotaExceededError'||e.code===22){
    alert('Storage full — try removing some images from tasks to free up space.');
  }
} };
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
  const [events,setEvents]       =useState([]);
  const [leadRecords,setLeadRecs]=useState({});
  const [closedDeals,setClosedDeals]=useState({});
  const [fy,setFy]       = useState(fyNow());
  const [ready,setReady] = useState(false);
  const [authed,setAuthed]= useState(()=>localStorage.getItem('mkt_auth')==='true');

  const login  = ()=>{ localStorage.setItem('mkt_auth','true'); setAuthed(true); };
  const logout = ()=>{ localStorage.removeItem('mkt_auth'); setAuthed(false); setReady(false); };

  // useEffect MUST be before any early returns (React rules)
  useEffect(()=>{
    if(!authed){ setReady(false); return; }
    (async()=>{
      const [t,tk,k,e,l,b,ev,lr,cd]=await Promise.all([
        ld('mkt_team',DEFAULT_TEAM),ld('mkt_tasks',[]),
        ld('mkt_kpis',[]),ld('mkt_exp',{}),ld('mkt_leads',{}),ld('mkt_budgets',{}),
        ld('mkt_events',[]),ld('mkt_lead_recs',{}),ld('mkt_closed_deals',{}),
      ]);
      setTeam(t);setTasks(tk);setKpis(k);setExp(e);setLeads(l);setBudgets(b);
      setEvents(ev);setLeadRecs(lr);setClosedDeals(cd);setReady(true);
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
  const svEvents   =e=>{setEvents(e);    sv('mkt_events',e);};
  const svLeadRecs =r=>{setLeadRecs(r);  sv('mkt_lead_recs',r);};
  const svClosedDeals=d=>{setClosedDeals(d);sv('mkt_closed_deals',d);};

  const NAV=[
    {id:'dashboard', icon:'ti-layout-dashboard', label:'Dashboard'},
    {id:'tasks',     icon:'ti-layout-kanban',    label:'Tasks'},
    {id:'calendar',  icon:'ti-calendar',         label:'Calendar'},
    {id:'kpis',      icon:'ti-target',           label:'KPIs'},
    {id:'finance',   icon:'ti-report-money',     label:'Finance'},
    {id:'conversion',icon:'ti-arrows-exchange',  label:'Conversion'},
    {id:'settings',  icon:'ti-settings',         label:'Settings'},
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
        {page==='calendar'&&  <CalendarPage team={team} tasks={tasks} events={events} saveEvents={svEvents}/>}
        {page==='kpis'&&      <KpisPage team={team} kpis={kpis} saveKpis={svKpis} fy={fy}/>}
        {page==='finance'&&   <FinPage expenses={expenses} saveExp={svExp} leads={leads} saveLeads={svLeads} budgets={budgets} saveBudgets={svBudgets} fy={fy}/>}
        {page==='conversion'&&<ConversionPage leadRecords={leadRecords} saveLeadRecords={svLeadRecs} closedDeals={closedDeals} saveClosedDeals={svClosedDeals}/>}
        {page==='settings'&&  <SettingsPage team={team} saveTeam={svTeam} fy={fy} setFy={setFy}/>}
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
        const img=new Image();
        img.onload=()=>{
          const MAX=900;
          let w=img.width,h=img.height;
          if(w>MAX||h>MAX){
            if(w>h){h=Math.round(h*(MAX/w));w=MAX;}
            else{w=Math.round(w*(MAX/h));h=MAX;}
          }
          const canvas=document.createElement('canvas');
          canvas.width=w;canvas.height=h;
          canvas.getContext('2d').drawImage(img,0,0,w,h);
          const data=canvas.toDataURL('image/jpeg',0.72);
          setF(x=>({...x,images:[...(x.images||[]),{id:mkId(),data,name:file.name}]}));
        };
        img.src=ev.target.result;
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
function CalendarPage({team,tasks,events,saveEvents}) {
  const [cur,setCur]     =useState(new Date());
  const [eventModal,setEM]=useState(null); // null | {date} | {edit: event}
  const yr=cur.getFullYear(), mo=cur.getMonth();

  const MONTHS=['January','February','March','April','May','June',
    'July','August','September','October','November','December'];
  const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  // Calendar grid
  const firstDay=(new Date(yr,mo,1).getDay()+6)%7;
  const daysInMonth=new Date(yr,mo+1,0).getDate();
  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push({d:new Date(yr,mo,-(firstDay-i-1)),cur:false});
  for(let d=1;d<=daysInMonth;d++) cells.push({d:new Date(yr,mo,d),cur:true});
  while(cells.length%7!==0) cells.push({d:new Date(yr,mo+1,cells.length-daysInMonth-firstDay+1),cur:false});

  const toKey=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const todayKey=toKey(new Date());

  // Check recurring tasks
  const isRecurringOn=(task,date)=>{
    if(!task.recurring||!task.dueDate) return false;
    const start=new Date(task.dueDate+'T00:00:00');
    if(date<start) return false;
    if(toKey(date)===task.dueDate) return false;
    if(task.recurring==='weekly') return Math.round((date-start)/(1000*60*60*24))%7===0;
    if(task.recurring==='monthly') return date.getDate()===start.getDate();
    if(task.recurring==='quarterly'){const m=(date.getFullYear()-start.getFullYear())*12+(date.getMonth()-start.getMonth());return date.getDate()===start.getDate()&&m%3===0&&m>0;}
    if(task.recurring==='yearly') return date.getDate()===start.getDate()&&date.getMonth()===start.getMonth()&&date.getFullYear()>start.getFullYear();
    return false;
  };

  const tasksForDay=d=>{
    const k=toKey(d);
    return [...tasks.filter(t=>t.dueDate===k),...tasks.filter(t=>t.recurring&&isRecurringOn(t,d))];
  };

  const eventsForDay=d=>{
    const k=toKey(d);
    return events.filter(ev=>{
      if(ev.date===k) return true;
      if(ev.endDate&&ev.date<=k&&ev.endDate>=k) return true;
      return false;
    });
  };

  const getTaskColor=t=>{
    const ids=getIds(t);
    const m=team.find(x=>ids.includes(x.id));
    return m?m.color:EC[t.entity]?.a||'#94a3b8';
  };

  // Legend: active members this month
  const monthStr=`${yr}-${String(mo+1).padStart(2,'0')}`;
  const activeMembers=team.filter(m=>tasks.some(t=>getIds(t).includes(m.id)&&t.dueDate?.startsWith(monthStr)));

  const addEvent  =d=>{saveEvents([...events,{...d,id:mkId()}]);setEM(null);};
  const upEvent   =(id,d)=>{saveEvents(events.map(e=>e.id===id?{...e,...d}:e));setEM(null);};
  const delEvent  =id=>{saveEvents(events.filter(e=>e.id!==id));setEM(null);};

  return (
    <div>
      <PageHeader title="Calendar" action={
        <PBtn onClick={()=>setEM({date:todayKey})}>
          <i className="ti ti-plus" style={{fontSize:14}} aria-hidden/> Add event
        </PBtn>
      }/>

      {/* Month nav + legend */}
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:20,flexWrap:'wrap'}}>
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
        <div style={{display:'flex',gap:10,marginLeft:'auto',flexWrap:'wrap',alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:5}}>
            <div style={{width:10,height:10,borderRadius:2,background:'#ef4444'}}/>
            <span style={{fontSize:10,color:TXT2,fontWeight:500}}>Public holiday</span>
          </div>
          {Object.entries(EVENT_TYPES).map(([type,{color}])=>(
            <div key={type} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:10,height:10,borderRadius:2,background:color}}/>
              <span style={{fontSize:10,color:TXT2,fontWeight:500}}>{type}</span>
            </div>
          ))}
          {activeMembers.map(m=>(
            <div key={m.id} style={{display:'flex',alignItems:'center',gap:5}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:m.color}}/>
              <span style={{fontSize:10,color:TXT2,fontWeight:500}}>{m.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar grid */}
      <Card style={{overflow:'hidden'}}>
        {/* Day headers */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',
          borderBottom:`2px solid ${TBORDER}`}}>
          {DAYS.map(d=>(
            <div key={d} style={{padding:'10px 0',textAlign:'center',fontSize:11,
              fontWeight:700,color:TXT2,textTransform:'uppercase',letterSpacing:'0.06em'}}>
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)'}}>
          {cells.map((cell,i)=>{
            const key=toKey(cell.d);
            const isToday=key===todayKey;
            const holiday=SG_HOLIDAYS[key];
            const dayTasks=tasksForDay(cell.d);
            const dayEvents=eventsForDay(cell.d);
            const isWeekend=cell.d.getDay()===0||cell.d.getDay()===6;
            const allItems=[...dayEvents,...dayTasks];
            const showItems=allItems.slice(0,3);
            const extra=allItems.length-3;
            return (
              <div key={i}
                onClick={()=>setEM({date:key})}
                style={{minHeight:100,padding:'6px',
                  borderRight:`1px solid ${TBORDER}`,borderBottom:`1px solid ${TBORDER}`,
                  background:isToday?'#FAFAFF':holiday?'#FFF8F8':isWeekend&&!cell.cur?'#FAFBFF':CARD,
                  cursor:'pointer',transition:'background 0.1s'}}>

                {/* Date number */}
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3}}>
                  <span style={{fontSize:'9px',color:holiday?'#ef4444':TXT2,fontWeight:600,
                    overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',flex:1,
                    lineHeight:1.2,paddingRight:2}}>
                    {holiday&&`🇸🇬 ${holiday}`}
                  </span>
                  <span style={{
                    width:22,height:22,borderRadius:'50%',flexShrink:0,
                    background:isToday?'#6366f1':'transparent',
                    color:isToday?'white':cell.cur?TXT:'#CBD5E1',
                    fontSize:11,fontWeight:isToday?700:cell.cur?500:400,
                    display:'flex',alignItems:'center',justifyContent:'center'}}>
                    {cell.d.getDate()}
                  </span>
                </div>

                {/* Events first, then tasks */}
                {showItems.map((item,idx)=>{
                  const isEvent=item.type!==undefined&&EVENT_TYPES[item.type];
                  if(isEvent){
                    const {color}=EVENT_TYPES[item.type]||{color:'#94a3b8'};
                    const assignee=team.find(m=>m.id===item.assigneeId);
                    return (
                      <div key={item.id}
                        onClick={e=>{e.stopPropagation();setEM({edit:item});}}
                        style={{background:color,color:'white',fontSize:10,fontWeight:600,
                          padding:'2px 6px',borderRadius:4,marginBottom:2,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                          display:'flex',alignItems:'center',gap:3}}>
                        {assignee&&<span style={{fontSize:8,background:'rgba(255,255,255,0.3)',
                          borderRadius:99,padding:'0 4px'}}>{ini(assignee.name)}</span>}
                        {item.title}
                      </div>
                    );
                  } else {
                    const c=getTaskColor(item);
                    const done=item.status==='Done';
                    const od=item.status!=='Done'&&key<todayKey;
                    return (
                      <div key={item.id+key}
                        style={{background:od?'#ef4444':done?'#10b981':c,
                          color:'white',fontSize:10,fontWeight:600,padding:'2px 6px',
                          borderRadius:4,marginBottom:2,
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',
                          opacity:done?0.6:1,display:'flex',alignItems:'center',gap:3}}>
                        {item.recurring&&<i className="ti ti-repeat" style={{fontSize:8,flexShrink:0}}/>}
                        <span style={{overflow:'hidden',textOverflow:'ellipsis'}}>{item.title}</span>
                      </div>
                    );
                  }
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

      {/* Event modal */}
      {eventModal&&(
        <EventModal
          event={eventModal.edit||null}
          defaultDate={eventModal.date||todayKey}
          team={team}
          onClose={()=>setEM(null)}
          onSave={d=>eventModal.edit?upEvent(eventModal.edit.id,d):addEvent(d)}
          onDelete={eventModal.edit?()=>delEvent(eventModal.edit.id):null}
        />
      )}
    </div>
  );
}

function EventModal({event,defaultDate,team,onClose,onSave,onDelete}) {
  const [f,setF]=useState({
    title:event?.title||'',
    type:event?.type||'Event',
    date:event?.date||defaultDate,
    endDate:event?.endDate||'',
    assigneeId:event?.assigneeId||'',
    notes:event?.notes||'',
  });
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const {color}=EVENT_TYPES[f.type]||{color:'#6366f1'};
  return (
    <Modal title={event?'Edit event':'New event'} onClose={onClose}>
      <Lbl s="Event title">
        <Inp value={f.title} onChange={e=>s('title',e.target.value)} placeholder="e.g. Product shoot, Geraldine on leave"/>
      </Lbl>
      <Lbl s="Event type">
        <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
          {Object.entries(EVENT_TYPES).map(([type,{color:c}])=>(
            <button key={type} onClick={()=>s('type',type)}
              style={{padding:'5px 14px',borderRadius:99,border:`1.5px solid ${f.type===type?c:BORDER}`,
                background:f.type===type?c:'transparent',color:f.type===type?'white':TXT2,
                cursor:'pointer',fontSize:12,fontWeight:f.type===type?700:400,fontFamily:F}}>
              {type}
            </button>
          ))}
        </div>
      </Lbl>
      <Grid2>
        <Lbl s="Date">
          <Inp type="date" value={f.date} onChange={e=>s('date',e.target.value)}/>
        </Lbl>
        <Lbl s="End date (optional — for multi-day)">
          <Inp type="date" value={f.endDate} onChange={e=>s('endDate',e.target.value)}/>
        </Lbl>
      </Grid2>
      <Lbl s="Who (optional)">
        <Sel value={f.assigneeId} onChange={e=>s('assigneeId',e.target.value)}>
          <option value="">Whole team / no individual</option>
          {team.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}
        </Sel>
      </Lbl>
      <Lbl s="Notes (optional)">
        <Inp value={f.notes} onChange={e=>s('notes',e.target.value)} placeholder="Additional details"/>
      </Lbl>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16,paddingTop:14,
        borderTop:`1px solid ${TBORDER}`}}>
        {onDelete?<GhostBtn danger onClick={onDelete}>Delete</GhostBtn>:<span/>}
        <div style={{display:'flex',gap:8}}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
          <PBtn onClick={()=>f.title&&f.date&&onSave(f)} style={{background:color}}>Save event</PBtn>
        </div>
      </div>
    </Modal>
  );
}

/* ── Conversion ─────────────────────────────────────────────────────────────── */
const LEAD_SOURCES=['Website','Referral','Social Media','Cold Call','Walk-in','Event','Other'];

// Parse Excel/CSV file via SheetJS → {headers:string[], rows:string[][]}
async function parseExcelFile(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject('File read error — please try again.');
    reader.onload=e=>{
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});
        const ws=wb.Sheets[wb.SheetNames[0]];
        const raw=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
        // Find first row that has actual content (skip truly empty rows)
        const hIdx=raw.findIndex(r=>r.some(c=>String(c).trim()));
        if(hIdx<0||raw.length<=hIdx+1){reject('No data found in file.');return;}
        const headers=raw[hIdx].map(h=>String(h).trim());
        const rows=raw.slice(hIdx+1)
          .filter(r=>r.some(c=>String(c).trim()))
          .map(r=>headers.map((_,i)=>String(r[i]??'').trim()));
        resolve({headers,rows});
      }catch(err){reject('Could not read file — make sure it is .xlsx, .xls or .csv');}
    };
    reader.readAsArrayBuffer(file);
  });
}

// Map a raw row (array) + headers array to a lead object
function mapLead(row,headers){
  const g=h=>{
    const idx=headers.findIndex(x=>x.toLowerCase().replace(/[\s._/()\r\n]/g,'').includes(h));
    return idx>=0?(row[idx]||'').trim():'';
  };
  return {
    id:mkId(),
    no:g('nomth')||g('no'),
    date:g('leadsdate'),
    source:g('sourcesoflead'),
    name:g('contactname'),
    company:g('companypersonal')||g('company'),
    email:g('emailaddress')||g('email'),
    phone:g('phone'),
    repeatHp:g('repeathp')||g('repeat'),
    moreThanOne:g('morethan1')||g('morethan'),
    howMany:g('howmany'),
    primaryUse:g('primaryuse'),
    duration:g('durationoflease')||g('duration'),
    term:g('shortlongterms')||g('short'),
    vehicle:g('desiredvehicle')||g('vehicle'),
    notes:g('additionalinfo')||g('additional'),
    salesRep:g('salesrep'),
  };
}

// Map a raw row + headers to a closed deal object
function mapDeal(row,headers){
  const g=h=>{
    const idx=headers.findIndex(x=>x.toLowerCase().replace(/[\s._/()\-\r\n]/g,'').includes(h));
    return idx>=0?(row[idx]||'').trim():'';
  };
  return {
    id:mkId(),
    status:g('st'),
    contractNo:g('rentalcontract'),
    itemSN:g('items'),
    vehicleCondition:g('vehiclenew'),
    contractCount:g('contractcount'),
    month:g('month'),
    rentTerm:g('periodrent')||g('period'),
    rate:g('rate'),
    contractValue:g('totalrate')||g('total'),
    agreementDate:g('agmtdate'),
    startDate:g('startdate'),
    endDate:g('schend'),
    salesperson:g('salesman'),
    name:g('clientname')||g('client'),
    make:g('make'),
    model:g('model'),
    contractType:g('contractnew')||g('renewcontract'),
    customerType:g('customernew')||g('existingcustomer'),
    fromMarketing:null,
    matchedLeadId:null,
  };
}

// Excel upload modal
function ImportModal({type,onClose,onImport}){
  const [preview,setPreview]=useState(null);
  const [mode,setMode]      =useState('add');
  const [loading,setLoading]=useState(false);
  const [error,setError]    =useState('');
  const isLead=type==='lead';

  const previewCols=isLead
    ?['name','company','phone','source','date','salesRep']
    :['name','contractNo','salesperson','contractValue','startDate','contractType','customerType'];

  const handleFile=async e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    setLoading(true);setError('');setPreview(null);
    try{
      const {headers,rows}=await parseExcelFile(file);
      const mapped=rows.map(row=>isLead?mapLead(row,headers):mapDeal(row,headers));
      if(!mapped.length){setError('No data rows found in the file.');setLoading(false);return;}
      setPreview({mapped,total:rows.length});
    }catch(err){setError(String(err));}
    setLoading(false);
    e.target.value='';
  };

  return (
    <Modal title={`Import ${isLead?'Marketing Leads':'Closed Customers'} from Excel`} onClose={onClose} wide>

      <div style={{background:'#EEF1F9',borderRadius:10,padding:'12px 14px',marginBottom:16,
        fontSize:12,color:TXT2,lineHeight:1.7}}>
        <strong style={{color:TXT}}>Accepted formats:</strong> .xlsx · .xls · .csv<br/>
        <strong style={{color:TXT}}>First row must be the header row.</strong> Column order doesn't matter — columns are auto-detected.<br/>
        <strong style={{color:TXT}}>Expected columns:</strong><br/>
        <span style={{fontFamily:'monospace',fontSize:10,color:'#6366f1'}}>
          {isLead
            ?'No. MTH · LEADS DATE · SOURCES OF LEADS · CONTACT NAME · COMPANY/PERSONAL NAME · EMAIL ADDRESS · PHONE · REPEAT HP · MORE THAN 1 · HOW MANY · PRIMARY USE · DURATION OF LEASE · SHORT / LONG TERMS · DESIRED VEHICLE · ADDITIONAL INFO · SALES REP'
            :'St · Rental Contract · Item S/N · Vehicle (New/Used) · Contract Count · Month · Period Rent Term · Rate · Total Rate · AgmtDate · StartDate · SchEnd · SALESMAN · Client Name · Make · Model · Contract · Customer'}
        </span>
      </div>

      {/* Upload zone */}
      {!preview&&(
        <label style={{display:'flex',flexDirection:'column',alignItems:'center',gap:12,
          padding:'32px 24px',borderRadius:12,border:`2px dashed ${BORDER}`,cursor:'pointer',
          background:'#FAFBFF',marginBottom:14,transition:'background 0.15s'}}
          onMouseEnter={e=>e.currentTarget.style.background='#F0F0FF'}
          onMouseLeave={e=>e.currentTarget.style.background='#FAFBFF'}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{display:'none'}}/>
          {loading?(
            <>
              <div style={{width:48,height:48,borderRadius:14,background:'#EEEEFF',
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="ti ti-loader-2" style={{fontSize:24,color:'#6366f1'}}/>
              </div>
              <div style={{fontSize:13,color:TXT2}}>Reading file…</div>
            </>
          ):(
            <>
              <div style={{width:48,height:48,borderRadius:14,background:'#EEEEFF',
                display:'flex',alignItems:'center',justifyContent:'center'}}>
                <i className="ti ti-file-spreadsheet" style={{fontSize:24,color:'#6366f1'}}/>
              </div>
              <div style={{textAlign:'center'}}>
                <div style={{fontSize:14,fontWeight:700,color:TXT}}>Click to select your Excel file</div>
                <div style={{fontSize:12,color:TXT2,marginTop:4}}>.xlsx · .xls · .csv supported</div>
              </div>
            </>
          )}
        </label>
      )}

      {/* Error */}
      {error&&(
        <div style={{background:'#FEE9E9',border:'1px solid #FECACA',borderRadius:10,
          padding:'10px 14px',marginBottom:14,fontSize:12,color:'#dc2626',fontWeight:500}}>
          ⚠ {error}
          <div style={{marginTop:6}}>
            <label style={{color:'#6366f1',cursor:'pointer',textDecoration:'underline',fontSize:12}}>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{display:'none'}}/>
              Try a different file
            </label>
          </div>
        </div>
      )}

      {/* Preview */}
      {preview&&(
        <>
          <div style={{background:'#E0F7EF',border:'1px solid #BBF7D0',borderRadius:10,
            padding:'10px 14px',marginBottom:14,display:'flex',alignItems:'center',
            justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:13,fontWeight:700,color:'#047857'}}>
                ✓ {preview.total} rows read
              </span>
              <span style={{fontSize:12,color:'#065f46',marginLeft:8}}>
                — review the preview below then confirm
              </span>
            </div>
            <label style={{fontSize:11,color:'#6366f1',cursor:'pointer',
              textDecoration:'underline',fontFamily:F}}>
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{display:'none'}}/>
              Upload different file
            </label>
          </div>

          {/* Preview table */}
          <div style={{overflowX:'auto',marginBottom:14,maxHeight:220,
            border:`1px solid ${BORDER}`,borderRadius:10}}>
            <table style={{width:'100%',borderCollapse:'collapse',fontSize:11}}>
              <thead style={{position:'sticky',top:0,background:'#F7F8FD',zIndex:1}}>
                <tr>
                  {previewCols.map(c=>(
                    <th key={c} style={{...TH,padding:'8px 10px',textTransform:'capitalize',whiteSpace:'nowrap'}}>
                      {c.replace(/([A-Z])/g,' $1').trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.mapped.slice(0,10).map((row,i)=>(
                  <tr key={i} style={{borderTop:`1px solid ${TBORDER}`,
                    background:i%2===0?CARD:'#FAFBFF'}}>
                    {previewCols.map(c=>(
                      <td key={c} style={{...TD,padding:'7px 10px',maxWidth:150,
                        overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                        {row[c]||<span style={{color:'#CBD5E1'}}>—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
                {preview.mapped.length>10&&(
                  <tr>
                    <td colSpan={previewCols.length}
                      style={{...TD,color:TXT2,padding:'8px 10px',fontStyle:'italic',
                        textAlign:'center'}}>
                      … and {preview.mapped.length-10} more rows
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Import mode */}
          <div style={{display:'flex',gap:10,marginBottom:16}}>
            {[['add','Add to existing list'],['replace','Replace this month\'s list']].map(([m,label])=>(
              <label key={m} onClick={()=>setMode(m)}
                style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer',
                  padding:'10px 14px',borderRadius:9,flex:1,
                  border:`1.5px solid ${mode===m?'#6366f1':BORDER}`,
                  background:mode===m?'#EEEEFF':INBG}}>
                <div style={{width:14,height:14,borderRadius:'50%',flexShrink:0,
                  border:`2px solid ${mode===m?'#6366f1':'#CBD5E1'}`,
                  background:mode===m?'#6366f1':'transparent',
                  display:'flex',alignItems:'center',justifyContent:'center'}}>
                  {mode===m&&<div style={{width:5,height:5,borderRadius:'50%',background:'white'}}/>}
                </div>
                <span style={{fontSize:12,fontWeight:mode===m?600:400,
                  color:mode===m?'#6366f1':TXT}}>{label}</span>
              </label>
            ))}
          </div>

          <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
            <GhostBtn onClick={onClose}>Cancel</GhostBtn>
            <PBtn onClick={()=>onImport(preview.mapped,mode)}>
              Import {preview.mapped.length} rows
            </PBtn>
          </div>
        </>
      )}

      {!preview&&!loading&&!error&&(
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:4}}>
          <GhostBtn onClick={onClose}>Cancel</GhostBtn>
        </div>
      )}
    </Modal>
  );
}

// placeholder comment
function ConversionPage({leadRecords,saveLeadRecords,closedDeals,saveClosedDeals}){
  const now=new Date();
  const curMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const [tab,setTab]        =useState('leads');
  const [month,setMonth]    =useState(curMonth);
  const [leadModal,setLM]   =useState(null);
  const [dealModal,setDM]   =useState(null);
  const [importType,setIT]  =useState(null); // 'lead'|'deal'

  const mLeads=leadRecords[month]||[];
  const mDeals=closedDeals[month]||[];

  // Matching helpers
  const nPhone=p=>(p||'').replace(/\D/g,'');
  const nStr  =s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  const findMatch=(deal,leads)=>leads.find(lead=>{
    if(nPhone(deal.phone)&&nPhone(lead.phone)&&nPhone(deal.phone)===nPhone(lead.phone)) return true;
    const dn=nStr(deal.name); const ln=nStr(lead.name); const lc=nStr(lead.company);
    if(dn.length>2&&(dn===ln||dn===lc)) return true;
    const dc=nStr(deal.name); // client name vs company
    if(dc.length>2&&dc===lc) return true;
    return false;
  });

  const runAutoMatch=()=>{
    const updated=mDeals.map(deal=>{
      if(deal.fromMarketing!==undefined&&deal.fromMarketing!==null) return deal;
      const match=findMatch(deal,mLeads);
      return match?{...deal,matchedLeadId:match.id,fromMarketing:true}:deal;
    });
    saveClosedDeals({...closedDeals,[month]:updated});
  };

  // CRUD
  const saveLead=(d,id)=>{const u=id?mLeads.map(l=>l.id===id?{...l,...d}:l):[...mLeads,{...d,id:mkId()}];saveLeadRecords({...leadRecords,[month]:u});setLM(null);};
  const delLead =id=>{saveLeadRecords({...leadRecords,[month]:mLeads.filter(l=>l.id!==id)});setLM(null);};
  const saveDeal=(d,id)=>{const u=id?mDeals.map(dl=>dl.id===id?{...dl,...d}:dl):[...mDeals,{...d,id:mkId()}];saveClosedDeals({...closedDeals,[month]:u});setDM(null);};
  const delDeal =id=>{saveClosedDeals({...closedDeals,[month]:mDeals.filter(d=>d.id!==id)});setDM(null);};
  const markDeal=(id,val)=>saveClosedDeals({...closedDeals,[month]:mDeals.map(d=>d.id===id?{...d,fromMarketing:val}:d)});

  // Import
  const handleImport=(rows,mode,type)=>{
    if(type==='lead'){
      const existing=mode==='replace'?[]:mLeads;
      saveLeadRecords({...leadRecords,[month]:[...existing,...rows]});
    } else {
      const existing=mode==='replace'?[]:mDeals;
      saveClosedDeals({...closedDeals,[month]:[...existing,...rows]});
    }
    setIT(null);
  };

  // Analytics
  const fromMkt   =mDeals.filter(d=>d.fromMarketing===true);
  const unconfirmed=mDeals.filter(d=>d.fromMarketing===null||d.fromMarketing===undefined);
  const mktValue  =fromMkt.reduce((s,d)=>s+(+d.contractValue||0),0);
  const convRate  =mLeads.length>0?((fromMkt.length/mLeads.length)*100).toFixed(1):null;

  const spMap={};
  mDeals.forEach(d=>{
    const sp=d.salesperson||'Unknown';
    if(!spMap[sp])spMap[sp]={total:0,fromMkt:0,value:0};
    spMap[sp].total++;
    if(d.fromMarketing){spMap[sp].fromMkt++;spMap[sp].value+=(+d.contractValue||0);}
  });
  const spRows=Object.entries(spMap).sort((a,b)=>b[1].value-a[1].value);

  const monthOpts=[];
  for(let i=0;i<24;i++){
    const d=new Date(now.getFullYear(),now.getMonth()-i,1);
    const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    monthOpts.push({k,label:d.toLocaleDateString('en-SG',{month:'long',year:'numeric'})});
  }

  const ActionBar=({count,label,onAdd,onImport})=>(
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
      <span style={{fontSize:13,color:TXT2}}>{count} {label} this month</span>
      <div style={{display:'flex',gap:8}}>
        <button onClick={onImport} style={{background:'#E0F7EF',color:'#047857',border:'none',
          cursor:'pointer',padding:'7px 14px',borderRadius:9,fontSize:12,fontWeight:600,fontFamily:F,
          display:'flex',alignItems:'center',gap:5}}>
          <i className="ti ti-table-import" style={{fontSize:13}}/> Import from Excel
        </button>
        <PBtn onClick={onAdd}>
          <i className="ti ti-plus" style={{fontSize:13}}/> Add row
        </PBtn>
      </div>
    </div>
  );

  return (
    <div>
      <PageHeader title="Lead Conversion"/>

      {/* Month selector */}
      <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:20}}>
        <span style={{fontSize:13,color:TXT2,fontWeight:500}}>Month:</span>
        <Sel value={month} onChange={e=>setMonth(e.target.value)} style={{width:'auto'}}>
          {monthOpts.map(({k,label})=><option key={k} value={k}>{label}</option>)}
        </Sel>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:6,marginBottom:20}}>
        {[['leads','Marketing Leads',mLeads.length],['closed','Closed Customers',mDeals.length],['matching','Matching & Analytics',unconfirmed.length]].map(([id,label,cnt])=>(
          <button key={id} onClick={()=>setTab(id)} style={{
            padding:'8px 18px',fontSize:13,fontWeight:tab===id?700:500,
            border:`1.5px solid ${tab===id?'#6366f1':BORDER}`,borderRadius:99,
            background:tab===id?'#6366f1':CARD,cursor:'pointer',
            color:tab===id?'white':TXT2,fontFamily:F,
            boxShadow:tab===id?'0 2px 8px rgba(99,102,241,0.3)':'none',
            display:'flex',alignItems:'center',gap:6}}>
            {label}
            {cnt>0&&<span style={{background:id==='matching'?'#FEE9E9':'rgba(255,255,255,0.25)',
              color:id==='matching'?'#dc2626':'inherit',fontSize:10,padding:'1px 7px',borderRadius:99,fontWeight:700}}>
              {cnt}{id==='matching'?' pending':''}
            </span>}
          </button>
        ))}
      </div>

      {/* ── LEADS TAB ── */}
      {tab==='leads'&&(
        <>
          <ActionBar count={mLeads.length} label="leads" onAdd={()=>setLM({})} onImport={()=>setIT('lead')}/>
          {mLeads.length===0?(
            <Card style={{padding:'48px',textAlign:'center'}}>
              <i className="ti ti-users" style={{fontSize:32,color:TXT2,display:'block',marginBottom:12}}/>
              <p style={{color:TXT2,fontSize:14,margin:'0 0 16px'}}>No leads yet. Import from Excel or add manually.</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>setIT('lead')} style={{background:'#E0F7EF',color:'#047857',border:'none',
                  cursor:'pointer',padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:F}}>
                  Import from Excel
                </button>
                <button onClick={()=>setLM({})} style={{background:'#6366f1',color:'white',border:'none',
                  cursor:'pointer',padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:F}}>
                  + Add manually
                </button>
              </div>
            </Card>
          ):(
            <Card>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead><tr style={{borderBottom:`2px solid ${TBORDER}`,background:'#F7F8FD'}}>
                    {['#','Date','Source','Contact Name','Company','Phone','Email','Primary Use','Term','Vehicle','Sales Rep',''].map(h=><th key={h} style={{...TH,padding:'8px 10px'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {mLeads.map((l,i)=>(
                      <tr key={l.id} style={{borderBottom:`1px solid ${TBORDER}`,background:i%2===0?CARD:'#FAFBFF'}}>
                        <td style={{...TD,color:TXT2,fontSize:10,padding:'7px 10px'}}>{l.no||i+1}</td>
                        <td style={{...TD,padding:'7px 10px',whiteSpace:'nowrap'}}>{l.date||'—'}</td>
                        <td style={{padding:'7px 10px',whiteSpace:'nowrap'}}>
                          {l.source&&<span style={{background:'#EEEEFF',color:'#6366f1',fontSize:10,
                            fontWeight:600,padding:'2px 7px',borderRadius:99}}>{l.source}</span>}
                          {!l.source&&<span style={{color:TXT2}}>—</span>}
                        </td>
                        <td style={{...TD,fontWeight:600,padding:'7px 10px'}}>{l.name||'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{l.company||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',whiteSpace:'nowrap'}}>{l.phone||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',maxWidth:130,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{l.email||'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{l.primaryUse||'—'}</td>
                        <td style={{padding:'7px 10px',whiteSpace:'nowrap'}}>
                          {l.term&&<span style={{background:l.term.toLowerCase().includes('long')?'#EEEEFF':'#FEF4DC',
                            color:l.term.toLowerCase().includes('long')?'#6366f1':'#92400e',
                            fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:99}}>{l.term}</span>}
                          {!l.term&&<span style={{color:TXT2}}>—</span>}
                        </td>
                        <td style={{...TD,padding:'7px 10px'}}>{l.vehicle||'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{l.salesRep||'—'}</td>
                        <td style={{padding:'7px 10px'}}>
                          <button onClick={()=>setLM({edit:l})} style={{background:'#EEEEFF',color:'#6366f1',
                            border:'none',cursor:'pointer',padding:'3px 9px',borderRadius:7,
                            fontSize:11,fontWeight:600,fontFamily:F}}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── CLOSED TAB ── */}
      {tab==='closed'&&(
        <>
          <ActionBar count={mDeals.length} label="closed customers"
            onAdd={()=>setDM({})} onImport={()=>setIT('deal')}/>
          {mDeals.length===0?(
            <Card style={{padding:'48px',textAlign:'center'}}>
              <i className="ti ti-building" style={{fontSize:32,color:TXT2,display:'block',marginBottom:12}}/>
              <p style={{color:TXT2,fontSize:14,margin:'0 0 16px'}}>No closed customers yet. Import from Excel or add manually.</p>
              <div style={{display:'flex',gap:10,justifyContent:'center'}}>
                <button onClick={()=>setIT('deal')} style={{background:'#E0F7EF',color:'#047857',border:'none',
                  cursor:'pointer',padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:F}}>
                  Import from Excel
                </button>
                <button onClick={()=>setDM({})} style={{background:'#6366f1',color:'white',border:'none',
                  cursor:'pointer',padding:'8px 18px',borderRadius:10,fontSize:13,fontWeight:600,fontFamily:F}}>
                  + Add manually
                </button>
              </div>
            </Card>
          ):(
            <Card>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead><tr style={{borderBottom:`2px solid ${TBORDER}`,background:'#F7F8FD'}}>
                    {['St','Contract No','Client Name','Make','Model','Total Rate','Salesman','Start Date','Agmt Date','Contract','Customer','From Mkt?',''].map(h=><th key={h} style={{...TH,padding:'8px 10px'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {mDeals.map((d,i)=>(
                      <tr key={d.id} style={{borderBottom:`1px solid ${TBORDER}`,background:i%2===0?CARD:'#FAFBFF'}}>
                        <td style={{...TD,padding:'7px 10px'}}>{d.status||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',fontWeight:600,whiteSpace:'nowrap'}}>{d.contractNo||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',fontWeight:600}}>{d.name||'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{d.make||'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{d.model||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',fontWeight:600,color:'#10b981',whiteSpace:'nowrap'}}>{d.contractValue?`$${Number(d.contractValue).toLocaleString()}`:'—'}</td>
                        <td style={{...TD,padding:'7px 10px'}}>{d.salesperson||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',whiteSpace:'nowrap'}}>{d.startDate||'—'}</td>
                        <td style={{...TD,padding:'7px 10px',whiteSpace:'nowrap'}}>{d.agreementDate||'—'}</td>
                        <td style={{padding:'7px 10px'}}>
                          {d.contractType&&<span style={{background:'#EEEEFF',color:'#6366f1',fontSize:10,
                            fontWeight:600,padding:'2px 7px',borderRadius:99}}>{d.contractType}</span>}
                        </td>
                        <td style={{padding:'7px 10px'}}>
                          {d.customerType&&<span style={{background:'#E0F5FB',color:'#0369a1',fontSize:10,
                            fontWeight:600,padding:'2px 7px',borderRadius:99}}>{d.customerType}</span>}
                        </td>
                        <td style={{padding:'7px 10px'}}>
                          {d.fromMarketing===true&&<span style={{background:'#E0F7EF',color:'#047857',fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:99}}>✓ Yes</span>}
                          {d.fromMarketing===false&&<span style={{background:'#F1F5F9',color:TXT2,fontSize:10,fontWeight:600,padding:'2px 7px',borderRadius:99}}>✗ No</span>}
                          {(d.fromMarketing===null||d.fromMarketing===undefined)&&<span style={{fontSize:10,color:'#f59e0b',fontWeight:600}}>?</span>}
                        </td>
                        <td style={{padding:'7px 10px'}}>
                          <button onClick={()=>setDM({edit:d})} style={{background:'#EEEEFF',color:'#6366f1',
                            border:'none',cursor:'pointer',padding:'3px 9px',borderRadius:7,
                            fontSize:11,fontWeight:600,fontFamily:F}}>Edit</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* ── MATCHING & ANALYTICS TAB ── */}
      {tab==='matching'&&(
        <>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[
              {l:'Marketing leads',v:mLeads.length||'—',i:'ti-user-plus',c:'#6366f1',bg:'#EEEEFF'},
              {l:'Closed (from marketing)',v:fromMkt.length||'—',i:'ti-circle-check',c:'#10b981',bg:'#E0F7EF'},
              {l:'Conversion rate',v:convRate?`${convRate}%`:'—',i:'ti-percentage',c:'#0891b2',bg:'#E0F5FB'},
              {l:'Total contract value',v:mktValue?`$${mktValue.toLocaleString()}`:'—',i:'ti-cash',c:'#f59e0b',bg:'#FEF4DC'},
            ].map(({l,v,i,c,bg})=>(
              <Card key={l} style={{padding:'14px 16px'}}>
                <div style={{width:30,height:30,borderRadius:8,background:bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
                  <i className={`ti ${i}`} style={{fontSize:14,color:c}} aria-hidden/>
                </div>
                <div style={{fontSize:11,color:TXT2,fontWeight:600,marginBottom:3,textTransform:'uppercase',letterSpacing:'0.04em'}}>{l}</div>
                <div style={{fontSize:20,fontWeight:700,color:TXT}}>{v}</div>
              </Card>
            ))}
          </div>

          <Card style={{padding:'14px 18px',marginBottom:16,display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <div>
              <span style={{fontSize:13,fontWeight:600,color:TXT}}>Auto-match leads to closed customers</span>
              <p style={{margin:'3px 0 0',fontSize:12,color:TXT2}}>Matches by phone, company name, or contact name. {unconfirmed.length} unconfirmed.</p>
            </div>
            <PBtn onClick={runAutoMatch}>
              <i className="ti ti-arrows-exchange" style={{fontSize:14,marginRight:4}} aria-hidden/> Run auto-match
            </PBtn>
          </Card>

          {mDeals.length>0&&(
            <Card style={{marginBottom:16}}>
              <div style={{padding:'12px 16px',borderBottom:`1px solid ${TBORDER}`,fontSize:13,fontWeight:700,color:TXT}}>
                Confirm marketing source — unconfirmed shown first
              </div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse',fontSize:12}}>
                  <thead><tr style={{borderBottom:`2px solid ${TBORDER}`}}>
                    {['Client Name','Contract No','Salesperson','Total Rate','Matched Lead','From Marketing?'].map(h=><th key={h} style={{...TH,padding:'8px 12px'}}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {[...mDeals].sort((a,b)=>{
                      const ac=a.fromMarketing!==null&&a.fromMarketing!==undefined;
                      const bc=b.fromMarketing!==null&&b.fromMarketing!==undefined;
                      return ac===bc?0:ac?1:-1;
                    }).map((d,i)=>{
                      const match=d.matchedLeadId?mLeads.find(l=>l.id===d.matchedLeadId):null;
                      const confirmed=d.fromMarketing!==null&&d.fromMarketing!==undefined;
                      return (
                        <tr key={d.id} style={{borderBottom:`1px solid ${TBORDER}`,
                          background:confirmed?(d.fromMarketing?'#F0FDF4':'#FAFBFF'):'#FFFAEC'}}>
                          <td style={{...TD,fontWeight:600,padding:'8px 12px'}}>{d.name||'—'}</td>
                          <td style={{...TD,padding:'8px 12px',whiteSpace:'nowrap'}}>{d.contractNo||'—'}</td>
                          <td style={{...TD,padding:'8px 12px'}}>{d.salesperson||'—'}</td>
                          <td style={{...TD,fontWeight:700,color:'#10b981',padding:'8px 12px',whiteSpace:'nowrap'}}>{d.contractValue?`$${Number(d.contractValue).toLocaleString()}`:'—'}</td>
                          <td style={{...TD,padding:'8px 12px'}}>
                            {match?<span style={{fontSize:11,color:'#047857',fontWeight:500}}>
                              {match.name||match.company} {match.phone&&`· ${match.phone}`}
                            </span>:<span style={{fontSize:11,color:TXT2}}>No match found</span>}
                          </td>
                          <td style={{padding:'8px 12px'}}>
                            {!confirmed?(
                              <div style={{display:'flex',gap:6}}>
                                <button onClick={()=>markDeal(d.id,true)} style={{background:'#E0F7EF',color:'#047857',border:'none',cursor:'pointer',padding:'4px 10px',borderRadius:7,fontSize:11,fontWeight:600,fontFamily:F}}>✓ Yes</button>
                                <button onClick={()=>markDeal(d.id,false)} style={{background:'#F1F5F9',color:TXT2,border:'none',cursor:'pointer',padding:'4px 10px',borderRadius:7,fontSize:11,fontWeight:600,fontFamily:F}}>✗ No</button>
                              </div>
                            ):(
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <span style={{fontSize:11,fontWeight:700,color:d.fromMarketing?'#047857':TXT2}}>{d.fromMarketing?'✓ Yes':'✗ No'}</span>
                                <button onClick={()=>markDeal(d.id,null)} style={{background:'none',border:'none',cursor:'pointer',color:TXT2,fontSize:10,textDecoration:'underline',fontFamily:F}}>Reset</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {spRows.length>0&&(
            <Card>
              <div style={{padding:'12px 16px',borderBottom:`1px solid ${TBORDER}`,fontSize:13,fontWeight:700,color:TXT}}>Salesperson breakdown</div>
              <div style={{overflowX:'auto'}}>
                <table style={{width:'100%',borderCollapse:'collapse'}}>
                  <thead><tr style={{borderBottom:`2px solid ${TBORDER}`}}>
                    {['Salesperson','Total closed','From marketing','Closing rate','Contract value (mkt leads)'].map(h=><th key={h} style={TH}>{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {spRows.map(([sp,s],i)=>{
                      const rate=mLeads.length>0?((s.fromMkt/mLeads.length)*100).toFixed(1):null;
                      return (
                        <tr key={sp} style={{borderBottom:`1px solid ${TBORDER}`,background:i%2===0?CARD:'#FAFBFF'}}>
                          <td style={{...TD,fontWeight:700}}>{sp}</td>
                          <td style={TD}>{s.total}</td>
                          <td style={TD}>{s.fromMkt}</td>
                          <td style={TD}>
                            {rate?(
                              <div style={{display:'flex',alignItems:'center',gap:8}}>
                                <div style={{flex:1,height:5,borderRadius:3,background:'#EEF1F9',overflow:'hidden',minWidth:60}}>
                                  <div style={{width:`${Math.min(100,rate)}%`,height:'100%',background:'#6366f1',borderRadius:3}}/>
                                </div>
                                <span style={{fontSize:12,fontWeight:700,color:'#6366f1',whiteSpace:'nowrap'}}>{rate}%</span>
                              </div>
                            ):<span style={{color:TXT2}}>—</span>}
                          </td>
                          <td style={{...TD,fontWeight:700,color:'#10b981'}}>{s.value>0?`$${s.value.toLocaleString()}`:'—'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      {leadModal&&<LeadModal lead={leadModal.edit} onClose={()=>setLM(null)} onSave={d=>saveLead(d,leadModal.edit?.id)} onDelete={leadModal.edit?()=>delLead(leadModal.edit.id):null}/>}
      {dealModal&&<DealModal deal={dealModal.edit} onClose={()=>setDM(null)} onSave={d=>saveDeal(d,dealModal.edit?.id)} onDelete={dealModal.edit?()=>delDeal(dealModal.edit.id):null}/>}
      {importType&&<ImportModal type={importType} onClose={()=>setIT(null)} onImport={(rows,mode)=>handleImport(rows,mode,importType)}/>}
    </div>
  );
}

function LeadModal({lead,onClose,onSave,onDelete}){
  const [f,setF]=useState({name:lead?.name||'',company:lead?.company||'',phone:lead?.phone||'',
    email:lead?.email||'',source:lead?.source||'',date:lead?.date||'',
    primaryUse:lead?.primaryUse||'',duration:lead?.duration||'',term:lead?.term||'',
    vehicle:lead?.vehicle||'',salesRep:lead?.salesRep||'',notes:lead?.notes||''});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <Modal title={lead?'Edit lead':'New lead'} onClose={onClose} wide>
      <Grid2>
        <Lbl s="Contact name"><Inp value={f.name} onChange={e=>s('name',e.target.value)} placeholder="Full name"/></Lbl>
        <Lbl s="Company / Personal name"><Inp value={f.company} onChange={e=>s('company',e.target.value)} placeholder="Company or personal name"/></Lbl>
        <Lbl s="Phone"><Inp value={f.phone} onChange={e=>s('phone',e.target.value)} placeholder="+65 XXXX XXXX"/></Lbl>
        <Lbl s="Email"><Inp value={f.email} onChange={e=>s('email',e.target.value)} placeholder="email@example.com"/></Lbl>
        <Lbl s="Lead date"><Inp value={f.date} onChange={e=>s('date',e.target.value)} placeholder="e.g. 1-Jan-25"/></Lbl>
        <Lbl s="Source">
          <Sel value={f.source} onChange={e=>s('source',e.target.value)}>
            <option value="">Select</option>
            {LEAD_SOURCES.map(src=><option key={src} value={src}>{src}</option>)}
          </Sel>
        </Lbl>
        <Lbl s="Primary use"><Inp value={f.primaryUse} onChange={e=>s('primaryUse',e.target.value)} placeholder="e.g. Logistics"/></Lbl>
        <Lbl s="Duration of lease"><Inp value={f.duration} onChange={e=>s('duration',e.target.value)} placeholder="e.g. 12 months"/></Lbl>
        <Lbl s="Short / Long term">
          <Sel value={f.term} onChange={e=>s('term',e.target.value)}>
            <option value="">Select</option>
            <option value="Short Term">Short Term</option>
            <option value="Long Term">Long Term</option>
          </Sel>
        </Lbl>
        <Lbl s="Desired vehicle"><Inp value={f.vehicle} onChange={e=>s('vehicle',e.target.value)} placeholder="e.g. 1-ton lorry"/></Lbl>
        <Lbl s="Sales rep"><Inp value={f.salesRep} onChange={e=>s('salesRep',e.target.value)} placeholder="Salesperson name"/></Lbl>
      </Grid2>
      <Lbl s="Additional info">
        <textarea value={f.notes} onChange={e=>s('notes',e.target.value)} rows={2}
          style={{...inputStyle,resize:'vertical'}} placeholder="Any additional notes"/>
      </Lbl>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16,paddingTop:14,borderTop:`1px solid ${TBORDER}`}}>
        {onDelete?<GhostBtn danger onClick={onDelete}>Delete</GhostBtn>:<span/>}
        <div style={{display:'flex',gap:8}}><GhostBtn onClick={onClose}>Cancel</GhostBtn><PBtn onClick={()=>(f.name||f.company)&&onSave(f)}>Save lead</PBtn></div>
      </div>
    </Modal>
  );
}

function DealModal({deal,onClose,onSave,onDelete}){
  const [f,setF]=useState({name:deal?.name||'',contractNo:deal?.contractNo||'',
    status:deal?.status||'',itemSN:deal?.itemSN||'',vehicleCondition:deal?.vehicleCondition||'',
    contractCount:deal?.contractCount||'',month:deal?.month||'',rentTerm:deal?.rentTerm||'',
    rate:deal?.rate||'',contractValue:deal?.contractValue||'',agreementDate:deal?.agreementDate||'',
    startDate:deal?.startDate||'',endDate:deal?.endDate||'',salesperson:deal?.salesperson||'',
    make:deal?.make||'',model:deal?.model||'',contractType:deal?.contractType||'',customerType:deal?.customerType||''});
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  return (
    <Modal title={deal?'Edit closed customer':'New closed customer'} onClose={onClose} wide>
      <Grid2>
        <Lbl s="Client name"><Inp value={f.name} onChange={e=>s('name',e.target.value)} placeholder="Client name"/></Lbl>
        <Lbl s="Rental contract no."><Inp value={f.contractNo} onChange={e=>s('contractNo',e.target.value)} placeholder="Contract number"/></Lbl>
        <Lbl s="Salesman"><Inp value={f.salesperson} onChange={e=>s('salesperson',e.target.value)} placeholder="Salesperson name"/></Lbl>
        <Lbl s="Total rate ($)"><Inp type="number" value={f.contractValue} onChange={e=>s('contractValue',e.target.value)} placeholder="0"/></Lbl>
        <Lbl s="Make"><Inp value={f.make} onChange={e=>s('make',e.target.value)} placeholder="e.g. Toyota"/></Lbl>
        <Lbl s="Model"><Inp value={f.model} onChange={e=>s('model',e.target.value)} placeholder="e.g. Hiace"/></Lbl>
        <Lbl s="Agreement date"><Inp value={f.agreementDate} onChange={e=>s('agreementDate',e.target.value)} placeholder="e.g. 1-Jan-25"/></Lbl>
        <Lbl s="Start date"><Inp value={f.startDate} onChange={e=>s('startDate',e.target.value)} placeholder="e.g. 1-Feb-25"/></Lbl>
        <Lbl s="Contract">
          <Sel value={f.contractType} onChange={e=>s('contractType',e.target.value)}>
            <option value="">Select</option>
            <option value="New Contract">New Contract</option>
            <option value="Renew Contract">Renew Contract</option>
          </Sel>
        </Lbl>
        <Lbl s="Customer">
          <Sel value={f.customerType} onChange={e=>s('customerType',e.target.value)}>
            <option value="">Select</option>
            <option value="New Customer">New Customer</option>
            <option value="Existing Customer">Existing Customer</option>
          </Sel>
        </Lbl>
      </Grid2>
      <div style={{display:'flex',justifyContent:'space-between',marginTop:16,paddingTop:14,borderTop:`1px solid ${TBORDER}`}}>
        {onDelete?<GhostBtn danger onClick={onDelete}>Delete</GhostBtn>:<span/>}
        <div style={{display:'flex',gap:8}}><GhostBtn onClick={onClose}>Cancel</GhostBtn><PBtn onClick={()=>(f.name||f.contractNo)&&onSave(f)}>Save customer</PBtn></div>
      </div>
    </Modal>
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
