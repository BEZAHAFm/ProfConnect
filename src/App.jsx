import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { BookOpen, CalendarDays, CheckCheck, Clock3, GraduationCap, LayoutDashboard, LogOut, Plus, Trash2, Users } from "lucide-react";

const url = import.meta.env.VITE_SUPABASE_URL;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = url && anon && !url.includes("VOTRE-PROJET") ? createClient(url, anon) : null;
const tabs = [
  ["dashboard", "Accueil", LayoutDashboard],
  ["students", "Élèves", Users],
  ["grades", "Notes", GraduationCap],
  ["attendance", "Appel", CheckCheck],
  ["late", "Retards", Clock3],
  ["schedule", "Emploi du temps", CalendarDays],
  ["homework", "Devoirs", BookOpen],
];
const emptyForm = { name: "", class_name: "2nde A" };

export default function App() {
  const [session, setSession] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [students, setStudents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [lates, setLates] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [className, setClassName] = useState("2nde A");
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentName, setStudentName] = useState("");
  const [gradeForm, setGradeForm] = useState({ student_id: "", subject: "Mathématiques", score: "15", coefficient: "1", assessment: "Évaluation" });
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().slice(0,10));
  const [attendanceSubject, setAttendanceSubject] = useState("Cours");
  const [lateForm, setLateForm] = useState({ student_id: "", time: "08:10", reason: "Transport" });
  const [scheduleForm, setScheduleForm] = useState({ day: "Lundi", time: "08:00–09:00", subject: "Mathématiques", room: "204" });
  const [homeworkText, setHomeworkText] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => { if (session) loadAll(); }, [session, className]);

  async function loadAll() {
    if (!supabase || !session) return;
    setLoading(true); setNotice("");
    const tables = ["students", "grades", "attendance", "late_records", "timetable", "homework"];
    const results = await Promise.all(tables.map((t) => supabase.from(t).select("*").order("created_at", { ascending: false })));
    const error = results.find((r) => r.error)?.error;
    if (error) setNotice("Erreur de chargement : " + error.message);
    const [s,g,a,l,sc,h] = results;
    setStudents((s.data || []).filter(x => x.class_name === className));
    setGrades((g.data || []).filter(x => x.class_name === className));
    setAttendance((a.data || []).filter(x => x.class_name === className));
    setLates((l.data || []).filter(x => x.class_name === className));
    setSchedule((sc.data || []).filter(x => x.class_name === className));
    setHomework((h.data || []).filter(x => x.class_name === className));
    const allStudents = s.data || [];
    setClasses([...new Set(["2nde A", "2nde B", "1ère A", "Terminale", ...allStudents.map(x => x.class_name)])]);
    setLoading(false);
  }

  async function signIn(e) {
    e.preventDefault(); setNotice("");
    if (!supabase) { setNotice("Configure d’abord les variables Supabase dans le fichier .env."); return; }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setNotice(error.message);
  }
  async function signOut() { await supabase.auth.signOut(); setSession(null); }

  async function addRow(table, payload, reset) {
    if (!supabase) return;
    setNotice("");
    const { error } = await supabase.from(table).insert({ ...payload, class_name: className });
    if (error) { setNotice("Impossible d’enregistrer : " + error.message); return; }
    if (reset) reset();
    setNotice("Enregistré et sauvegardé.");
    await loadAll();
  }
  async function removeRow(table, id) {
    if (!supabase || !confirm("Supprimer cet élément ?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    setNotice(error ? error.message : "Élément supprimé.");
    if (!error) loadAll();
  }
  const avg = useMemo(() => grades.length ? (grades.reduce((n,g) => n + Number(g.score),0)/grades.length).toFixed(1) : "—", [grades]);
  const studentNameFor = (id) => students.find(s => s.id === id)?.name || "Élève";
  const today = new Date().toISOString().slice(0,10);

  if (!supabase) return <main className="setup"><div className="brand-mark"><GraduationCap size={28}/></div><h1>ProfConnect</h1><p className="muted">Ton espace professeur privé</p><section className="panel"><h2>Première configuration</h2><p>La sauvegarde permanente utilise Supabase. Crée un projet, exécute le fichier <code>supabase/schema.sql</code>, puis renseigne les deux variables dans <code>.env</code>.</p><ol><li>Copie <code>.env.example</code> vers <code>.env</code>.</li><li>Ajoute l’URL du projet et la clé publique (anon/publishable).</li><li>Lance <code>npm install</code>, puis <code>npm run dev</code>.</li></ol><p className="muted small">Ne mets jamais une clé secrète/service_role dans le navigateur.</p></section></main>;

  if (!session) return <main className="login"><div className="login-card"><div className="brand-mark"><GraduationCap size={30}/></div><h1>ProfConnect</h1><p className="muted">Connecte-toi à ton espace professeur</p><form onSubmit={signIn}><label>Email professeur<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="prof@exemple.fr"/></label><label>Mot de passe<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe"/></label><button className="primary full">Se connecter</button></form>{notice && <p className="notice">{notice}</p>}<p className="small muted">Crée ton compte dans Supabase → Authentication → Users avant de te connecter.</p></div></main>;

  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><div className="brand-mark"><GraduationCap/></div><div><b>ProfConnect</b><small>Espace professeur</small></div></div><div className="class-picker"><label htmlFor="class">Classe active</label><select id="class" value={className} onChange={e=>setClassName(e.target.value)}>{classes.map(c=><option key={c}>{c}</option>)}</select></div><nav>{tabs.map(([id,label,Icon])=><button key={id} className={tab===id?"nav-item active":"nav-item"} onClick={()=>setTab(id)}><Icon size={18}/>{label}</button>)}</nav><button className="nav-item signout" onClick={signOut}><LogOut size={18}/>Déconnexion</button></aside>
    <main className="main"><header className="topbar"><div><span className="eyebrow">ESPACE PROFESSEUR</span><h1>{tabs.find(t=>t[0]===tab)?.[1]}</h1></div><div className="top-right"><span className="online-dot"/> Connecté <button className="icon-button" onClick={loadAll} title="Actualiser">↻</button></div></header>
      {notice && <div className="notice">{notice}<button onClick={()=>setNotice("")}>×</button></div>}
      {loading && <p className="muted">Chargement des données…</p>}
      {tab==="dashboard" && <><div className="welcome"><div><h2>Bonjour, Professeur 👋</h2><p>Voici le résumé de ta classe {className}.</p></div><span className="welcome-icon"><GraduationCap size={32}/></span></div><div className="stats"><Stat title="Élèves" value={students.length} Icon={Users}/><Stat title="Moyenne des notes" value={avg==="—"?"—":avg+"/20"} Icon={GraduationCap}/><Stat title="Retards" value={lates.length} Icon={Clock3}/><Stat title="Devoirs" value={homework.length} Icon={BookOpen}/></div><section className="panel"><h2>Accès rapide</h2><div className="quick-actions"><button onClick={()=>setTab("grades")}>＋ Saisir une note</button><button onClick={()=>setTab("attendance")}>✓ Faire l’appel</button><button onClick={()=>setTab("schedule")}>▦ Emploi du temps</button></div></section></>}
      {tab==="students" && <><section className="panel"><h2>Ajouter un élève</h2><form className="inline-form" onSubmit={e=>{e.preventDefault();if(studentName.trim())addRow("students",{name:studentName.trim()},()=>setStudentName(""));}}><input value={studentName} onChange={e=>setStudentName(e.target.value)} placeholder="Prénom et nom" required/><button className="primary"><Plus size={17}/> Ajouter</button></form></section><DataList rows={students} empty="Aucun élève dans cette classe." render={s=><><div className="avatar">{s.name.split(" ").map(x=>x[0]).join("").slice(0,2).toUpperCase()}</div><div className="row-main"><b>{s.name}</b><small>{s.class_name}</small></div><button className="delete" onClick={()=>removeRow("students",s.id)} title="Supprimer"><Trash2 size={17}/></button></>} /></>}
      {tab==="grades" && <><section className="panel"><h2>Nouvelle note</h2><form className="form-grid" onSubmit={e=>{e.preventDefault();if(!gradeForm.student_id){setNotice("Ajoute d’abord un élève à cette classe.");return;}const score=Number(gradeForm.score),coefficient=Number(gradeForm.coefficient);if(score<0||score>20||coefficient<=0){setNotice("Note entre 0 et 20 et coefficient positif requis.");return;}addRow("grades",{...gradeForm,score,coefficient,student_id:gradeForm.student_id},()=>setGradeForm({...gradeForm,score:"15"}));}}><label>Élève<select required value={gradeForm.student_id} onChange={e=>setGradeForm({...gradeForm,student_id:e.target.value})}><option value="">Choisir un élève</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Matière<input required value={gradeForm.subject} onChange={e=>setGradeForm({...gradeForm,subject:e.target.value})}/></label><label>Note /20<input type="number" min="0" max="20" step="0.25" required value={gradeForm.score} onChange={e=>setGradeForm({...gradeForm,score:e.target.value})}/></label><label>Coefficient<input type="number" min="0.1" step="0.1" required value={gradeForm.coefficient} onChange={e=>setGradeForm({...gradeForm,coefficient:e.target.value})}/></label><label className="wide">Évaluation<input value={gradeForm.assessment} onChange={e=>setGradeForm({...gradeForm,assessment:e.target.value})}/></label><button className="primary">Enregistrer la note</button></form></section><DataList rows={grades} empty="Aucune note pour cette classe." render={g=><><div className="row-main"><b>{studentNameFor(g.student_id)}</b><small>{g.subject} · {g.assessment || "Évaluation"} · Coef. {g.coefficient}</small></div><strong className={Number(g.score)>=10?"score good":"score bad"}>{g.score}/20</strong><button className="delete" onClick={()=>removeRow("grades",g.id)}><Trash2 size={17}/></button></>} /></>}
      {tab==="attendance" && <><section className="panel"><h2>Appel de la classe</h2><form onSubmit={async e=>{e.preventDefault();if(!students.length){setNotice("Ajoute d’abord des élèves.");return;}const entries=students.map(s=>({student_id:s.id,student_name:s.name,date:attendanceDate,subject:attendanceSubject,status:document.querySelector(`[data-attendance="${s.id}"]`)?.value||"Présent",class_name:className}));const {error}=await supabase.from("attendance").insert(entries);setNotice(error?error.message:"Appel enregistré et sauvegardé.");if(!error)loadAll();}}><div className="form-grid"><label>Date<input type="date" value={attendanceDate} onChange={e=>setAttendanceDate(e.target.value)} required/></label><label>Cours / matière<input value={attendanceSubject} onChange={e=>setAttendanceSubject(e.target.value)} required/></label></div><div className="attendance-list">{students.map(s=><div className="attendance-row" key={s.id}><span>{s.name}</span><select data-attendance={s.id} defaultValue="Présent"><option>Présent</option><option>Absent</option><option>En retard</option></select></div>)}</div><button className="primary">Valider et sauvegarder l’appel</button></form></section><h2 className="section-title">Historique récent</h2><DataList rows={attendance} empty="Aucun appel enregistré." render={a=><><div className="row-main"><b>{a.student_name || studentNameFor(a.student_id)}</b><small>{a.date} · {a.subject}</small></div><span className={"pill "+(a.status==="Présent"?"green":a.status==="Absent"?"red":"amber")}>{a.status}</span><button className="delete" onClick={()=>removeRow("attendance",a.id)}><Trash2 size={17}/></button></>} /></>}
      {tab==="late" && <><section className="panel"><h2>Signaler un retard</h2><form className="form-grid" onSubmit={e=>{e.preventDefault();if(!lateForm.student_id){setNotice("Choisis un élève.");return;}addRow("late_records",{...lateForm,student_id:lateForm.student_id},()=>setLateForm({...lateForm,time:"08:10",reason:"Transport"}));}}><label>Élève<select required value={lateForm.student_id} onChange={e=>setLateForm({...lateForm,student_id:e.target.value})}><option value="">Choisir</option>{students.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label><label>Heure<input type="time" value={lateForm.time} onChange={e=>setLateForm({...lateForm,time:e.target.value})}/></label><label className="wide">Motif<input value={lateForm.reason} onChange={e=>setLateForm({...lateForm,reason:e.target.value})}/></label><button className="primary">Enregistrer le retard</button></form></section><DataList rows={lates} empty="Aucun retard enregistré." render={l=><><div className="row-main"><b>{studentNameFor(l.student_id)}</b><small>{l.reason || "Motif non précisé"}</small></div><span className="pill amber">{l.time}</span><button className="delete" onClick={()=>removeRow("late_records",l.id)}><Trash2 size={17}/></button></>} /></>}
      {tab==="schedule" && <><section className="panel"><h2>Ajouter un cours</h2><form className="form-grid" onSubmit={e=>{e.preventDefault();addRow("timetable",scheduleForm,()=>setScheduleForm({...scheduleForm,time:"08:00–09:00"}));}}><label>Jour<select value={scheduleForm.day} onChange={e=>setScheduleForm({...scheduleForm,day:e.target.value})}>{["Lundi","Mardi","Mercredi","Jeudi","Vendredi"].map(d=><option key={d}>{d}</option>)}</select></label><label>Horaire<input required value={scheduleForm.time} onChange={e=>setScheduleForm({...scheduleForm,time:e.target.value})}/></label><label>Matière<input required value={scheduleForm.subject} onChange={e=>setScheduleForm({...scheduleForm,subject:e.target.value})}/></label><label>Salle<input value={scheduleForm.room} onChange={e=>setScheduleForm({...scheduleForm,room:e.target.value})}/></label><button className="primary">Ajouter le cours</button></form></section><DataList rows={[...schedule].sort((a,b)=>["Lundi","Mardi","Mercredi","Jeudi","Vendredi"].indexOf(a.day)-["Lundi","Mardi","Mercredi","Jeudi","Vendredi"].indexOf(b.day))} empty="Aucun cours enregistré." render={s=><><div className="time-block">{s.time}</div><div className="row-main"><b>{s.subject}</b><small>{s.day} · Salle {s.room || "—"}</small></div><button className="delete" onClick={()=>removeRow("timetable",s.id)}><Trash2 size={17}/></button></>} /></>}
      {tab==="homework" && <><section className="panel"><h2>Publier un devoir</h2><form onSubmit={e=>{e.preventDefault();if(homeworkText.trim())addRow("homework",{description:homeworkText.trim()},()=>setHomeworkText(""));}}><label>Consigne<textarea rows="4" required value={homeworkText} onChange={e=>setHomeworkText(e.target.value)} placeholder="Ex. : exercices 1 à 5, page 42, pour vendredi…"/></label><button className="primary">Publier le devoir</button></form></section><DataList rows={homework} empty="Aucun devoir publié." render={h=><><div className="row-main"><b>{h.description}</b><small>Ajouté le {new Date(h.created_at).toLocaleDateString("fr-FR")}</small></div><button className="delete" onClick={()=>removeRow("homework",h.id)}><Trash2 size={17}/></button></>} /></>}
      <footer>ProfConnect · Espace privé du professeur · {today}</footer>
    </main>
  </div>;
}

function Stat({title,value,Icon}) { return <section className="stat-card"><div className="stat-icon"><Icon size={20}/></div><p>{title}</p><strong>{value}</strong></section>; }
function DataList({rows,empty,render}) { return <section className="list-panel">{rows.length ? rows.map((r,i)=><div className="data-row" key={r.id || i}>{render(r)}</div>) : <div className="empty">{empty}</div>}</section>; }
