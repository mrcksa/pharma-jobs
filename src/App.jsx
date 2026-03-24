import { useState, useRef, useCallback, useEffect } from "react"
import { supabase } from "./supabase"

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY || ""

const JOBS = [
  { id:1, title:"Medical Science Liaison", company:"Pfizer", sector:"farmacéutico", area:"Científica/Médica", exp:"Senior", salary:"55.000–75.000€", desc:"Soporte científico a KOLs y equipos médicos. Presentación de datos clínicos y ensayos.", skills:["farmacología","comunicación científica","inglés","oncología"] },
  { id:2, title:"Regulatory Affairs Specialist", company:"Novartis", sector:"farmacéutico", area:"Regulatorio", exp:"Mid", salary:"38.000–50.000€", desc:"Gestión de expedientes regulatorios ante la EMA y agencias nacionales.", skills:["regulatorio","CTD","inglés","ICH guidelines"] },
  { id:3, title:"Clinical Data Manager", company:"IQVIA", sector:"hospitalario", area:"Datos/TI", exp:"Mid", salary:"40.000–52.000€", desc:"Gestión y validación de datos clínicos en estudios multicéntricos.", skills:["CDMS","SAS","Excel","ensayos clínicos"] },
  { id:4, title:"Pharmacovigilance Analyst", company:"Roche", sector:"farmacéutico", area:"Farmacovigilancia", exp:"Junior", salary:"28.000–38.000€", desc:"Notificación y seguimiento de eventos adversos según normativa ICH E2A.", skills:["farmacovigilancia","inglés","argus safety","regulatorio"] },
  { id:5, title:"Health IT Consultant", company:"Philips Health", sector:"hospitalario", area:"Datos/TI", exp:"Senior", salary:"60.000–80.000€", desc:"Implantación de soluciones HIS/EMR en hospitales europeos.", skills:["HL7","FHIR","gestión de proyectos","inglés"] },
  { id:6, title:"Medical Affairs Manager", company:"AstraZeneca", sector:"farmacéutico", area:"Científica/Médica", exp:"Senior", salary:"65.000–85.000€", desc:"Liderazgo de estrategia médica para línea de oncología.", skills:["oncología","inglés","liderazgo","publicaciones médicas"] },
  { id:7, title:"Quality Assurance Specialist", company:"Fresenius", sector:"hospitalario", area:"Calidad", exp:"Mid", salary:"35.000–45.000€", desc:"Auditorías internas y gestión de desviaciones bajo normas GMP/ISO 13485.", skills:["GMP","ISO 13485","auditoría","BPF"] },
  { id:8, title:"Biostatistician", company:"Syneos Health", sector:"farmacéutico", area:"Datos/TI", exp:"Mid", salary:"45.000–60.000€", desc:"Análisis estadístico de ensayos clínicos Fase II y III.", skills:["R","SAS","estadística","ensayos clínicos"] },
  { id:9, title:"Medical Writer", company:"Parexel", sector:"farmacéutico", area:"Científica/Médica", exp:"Junior", salary:"30.000–42.000€", desc:"Redacción de documentos regulatorios, protocolos e informes clínicos.", skills:["redacción médica","inglés","ICH E3","MS Word"] },
  { id:10, title:"Telemedicine Coordinator", company:"HM Hospitales", sector:"hospitalario", area:"Coordinación", exp:"Junior", salary:"25.000–33.000€", desc:"Coordinación de consultas virtuales y plataformas de telesalud.", skills:["telemedicina","CRM","comunicación","inglés"] },
]

const SECTORS = ["Todos","farmacéutico","hospitalario"]
const AREAS   = ["Todas","Científica/Médica","Regulatorio","Datos/TI","Farmacovigilancia","Calidad","Coordinación"]
const EXPS    = ["Todos","Junior","Mid","Senior"]
const LOGO_COLORS = ["#185FA5","#0F6E56","#7F77DD","#D85A30","#D4537E","#BA7517"]
const PLATFORMS = [
  { name:"LinkedIn", url:"https://www.linkedin.com/jobs/search/?keywords=pharma+hospital+remote&f_WT=2", bg:"#0a66c2" },
  { name:"Indeed",   url:"https://es.indeed.com/jobs?q=farmaceutico+hospitalario&remotejobs=true",        bg:"#2164f3" },
  { name:"InfoJobs", url:"https://www.infojobs.net/jobsearch/search-results/list.xhtml?keyword=farmaceutico&teletrabajo=true", bg:"#ff6600" },
  { name:"Jooble",   url:"https://es.jooble.org/SearchResult?ukw=farmac%C3%A9utico+hospitalario&remote=true", bg:"#4ba3e2" },
]

const css = `
  .app{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:740px;margin:0 auto;padding:0 0 2rem}
  .hero{background:linear-gradient(135deg,#0c447c 0%,#185FA5 60%,#1D9E75 100%);border-radius:16px;padding:2rem 1.75rem 1.75rem;margin-bottom:1.5rem;color:#fff}
  .hero h1{margin:0 0 4px;font-size:22px;font-weight:500}
  .hero p{margin:0;font-size:14px;opacity:.75}
  .hero-stats{display:flex;gap:12px;margin-top:1.25rem;flex-wrap:wrap}
  .hero-stat{background:rgba(255,255,255,.15);border-radius:10px;padding:8px 16px;font-size:13px}
  .hero-stat span{font-size:20px;font-weight:500;display:block}
  .hero-user{display:flex;justify-content:space-between;align-items:center;margin-top:1rem;padding-top:1rem;border-top:1px solid rgba(255,255,255,.2)}
  .hero-user p{margin:0;font-size:13px;opacity:.85}
  .logout-btn{background:rgba(255,255,255,.2);border:none;color:#fff;padding:5px 14px;border-radius:8px;font-size:12px;cursor:pointer;transition:background .15s}
  .logout-btn:hover{background:rgba(255,255,255,.35)}
  .tabs{display:flex;gap:4px;margin-bottom:1.25rem;background:#f1efe8;border-radius:10px;padding:4px}
  .tab{flex:1;border:none;background:none;border-radius:8px;padding:8px 4px;cursor:pointer;font-size:13px;font-weight:400;color:#5f5e5a;transition:all .15s;white-space:nowrap}
  .tab.active{background:#fff;color:#1a1a1a;font-weight:500;box-shadow:0 1px 4px rgba(0,0,0,.08)}
  .tab .badge{display:inline-block;background:#D85A30;color:#fff;font-size:10px;font-weight:700;border-radius:20px;padding:0 6px;margin-left:4px;line-height:18px}
  .search-bar{position:relative;margin-bottom:12px}
  .search-bar input{width:100%;padding:9px 12px 9px 36px;border:0.5px solid #ccc;border-radius:8px;font-size:14px;outline:none;font-family:inherit}
  .search-bar input:focus{border-color:#378ADD;box-shadow:0 0 0 2px #378ADD22}
  .search-icon{position:absolute;left:11px;top:50%;transform:translateY(-50%);width:16px;height:16px;opacity:.4;pointer-events:none}
  .filters{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}
  .filters select{flex:1;min-width:110px;font-size:13px;padding:8px 10px;border:0.5px solid #ccc;border-radius:8px;background:#fff;font-family:inherit;outline:none}
  .results-label{font-size:13px;color:#5f5e5a;margin-bottom:12px}
  .job-grid{display:grid;gap:10px}
  .job-card{background:#fff;border:0.5px solid #e0e0d8;border-radius:14px;padding:1rem 1.25rem;cursor:pointer;transition:all .15s}
  .job-card:hover{border-color:#378ADD;box-shadow:0 2px 12px rgba(24,95,165,.1);transform:translateY(-1px)}
  .job-card.fav{border-color:#D4537E33}
  .job-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:8px;margin-bottom:10px}
  .job-logo{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-weight:500;font-size:13px;flex-shrink:0}
  .job-title{margin:0;font-weight:500;font-size:15px;color:#1a1a1a}
  .job-company{margin:2px 0 0;font-size:13px;color:#5f5e5a}
  .job-tags{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .tag{font-size:11px;padding:3px 9px;border-radius:20px}
  .tag-remote{background:#0c447c;color:#B5D4F4}
  .tag-farm{background:#E6F1FB;color:#185FA5}
  .tag-hosp{background:#E1F5EE;color:#0F6E56}
  .tag-neutral{background:#f1efe8;color:#5f5e5a}
  .job-footer{display:flex;justify-content:space-between;align-items:center;margin-top:10px;padding-top:10px;border-top:0.5px solid #e0e0d8}
  .salary{font-size:13px;font-weight:500;color:#1a1a1a}
  .fav-btn{background:none;border:none;cursor:pointer;font-size:18px;padding:2px 4px;line-height:1;transition:transform .15s;flex-shrink:0}
  .fav-btn:hover{transform:scale(1.2)}
  .match-pill{font-size:12px;font-weight:500;padding:3px 10px;border-radius:20px}
  .match-high{background:#E1F5EE;color:#0F6E56}
  .match-mid{background:#FAEEDA;color:#854F0B}
  .match-low{background:#f1efe8;color:#5f5e5a}
  .section-label{font-size:12px;font-weight:500;text-transform:uppercase;letter-spacing:.06em;color:#5f5e5a;margin:0 0 8px}
  .profile-card{background:#fff;border:0.5px solid #e0e0d8;border-radius:14px;padding:1.25rem;margin-bottom:16px}
  .avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#378ADD,#1D9E75);display:flex;align-items:center;justify-content:center;font-weight:500;font-size:15px;color:#fff;flex-shrink:0}
  .skills-wrap{display:flex;gap:6px;flex-wrap:wrap;margin-top:6px}
  .skill-tag{font-size:12px;background:#E6F1FB;color:#185FA5;padding:3px 10px;border-radius:20px}
  .upload-area{border:1.5px dashed #ccc;border-radius:14px;padding:2rem;text-align:center;cursor:pointer;transition:all .15s;margin-bottom:14px}
  .upload-area:hover{border-color:#378ADD;background:#E6F1FB22}
  .divider{display:flex;align-items:center;gap:10px;margin:16px 0;color:#888;font-size:13px}
  .divider::before,.divider::after{content:'';flex:1;height:0.5px;background:#e0e0d8}
  .primary-btn{width:100%;padding:10px;background:linear-gradient(135deg,#185FA5,#1D9E75);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:500;cursor:pointer;transition:opacity .15s;font-family:inherit}
  .primary-btn:hover{opacity:.88}
  .primary-btn:disabled{opacity:.45;cursor:not-allowed}
  .secondary-btn{padding:8px 16px;background:#f1efe8;color:#1a1a1a;border:0.5px solid #ccc;border-radius:8px;font-size:13px;cursor:pointer;font-family:inherit}
  .platform-card{background:#fff;border:0.5px solid #e0e0d8;border-radius:14px;padding:1rem 1.25rem;display:flex;align-items:center;gap:14px;transition:all .15s}
  .platform-card:hover{border-color:#ccc}
  .plat-icon{width:42px;height:42px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;color:#fff;flex-shrink:0}
  .plat-link{margin-left:auto;padding:7px 16px;border-radius:8px;font-size:13px;font-weight:500;text-decoration:none;color:#fff;background:linear-gradient(135deg,#185FA5,#1D9E75)}
  .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:200;padding:16px}
  .modal{background:#fff;border-radius:16px;padding:1.5rem;max-width:540px;width:100%;max-height:82vh;overflow-y:auto}
  .modal-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px}
  .close-btn{background:#f1efe8;border:none;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:16px;color:#5f5e5a;display:flex;align-items:center;justify-content:center;flex-shrink:0}
  .active-bar{background:linear-gradient(90deg,#E6F1FB,#E1F5EE);border:0.5px solid #B5D4F4;border-radius:10px;padding:10px 14px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center}
  .alert-card{background:#fff;border:0.5px solid #e0e0d8;border-radius:14px;padding:1.25rem;margin-bottom:12px}
  .alert-card h3{margin:0 0 12px;font-size:15px;font-weight:500}
  .form-row{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:12px}
  .form-row input,.form-row select{flex:1;min-width:140px;font-size:13px;padding:8px 12px;border:0.5px solid #ccc;border-radius:8px;font-family:inherit;outline:none;background:#fff}
  .form-label{font-size:13px;color:#5f5e5a;margin:0 0 6px;display:block}
  .alert-result{background:#f1efe8;border-radius:10px;padding:14px;font-size:13px;line-height:1.8;color:#1a1a1a;white-space:pre-wrap;margin:12px 0}
  .copy-row{display:flex;gap:8px;flex-wrap:wrap}
  .empty-state{text-align:center;padding:3rem 1rem;color:#5f5e5a}
  .empty-state p{font-size:14px;margin:8px 0 0}
  textarea{width:100%;resize:vertical;font-size:14px;padding:10px 12px;border:0.5px solid #ccc;border-radius:10px;background:#fff;color:#1a1a1a;font-family:inherit;line-height:1.6;outline:none}
  .cv-badge{background:#E1F5EE;color:#0F6E56;border-radius:8px;padding:8px 14px;font-size:13px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
`

function MatchPill({ score }) {
  if (score === null) return null
  const cls = score >= 75 ? "match-pill match-high" : score >= 50 ? "match-pill match-mid" : "match-pill match-low"
  return <span className={cls}>{score}% match</span>
}

function JobCard({ job, score, isFav, onToggleFav, onClick }) {
  const logoBg = LOGO_COLORS[job.id % LOGO_COLORS.length]
  return (
    <div className={`job-card${isFav?" fav":""}`} onClick={() => onClick(job, score)}>
      <div className="job-card-top">
        <div style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
          <div className="job-logo" style={{ background:logoBg+"22", color:logoBg }}>{job.company.slice(0,2).toUpperCase()}</div>
          <div>
            <p className="job-title">{job.title}</p>
            <p className="job-company">{job.company}</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:6, alignItems:"center" }}>
          <MatchPill score={score} />
          <button className="fav-btn" onClick={e => { e.stopPropagation(); onToggleFav(job.id) }}>{isFav?"❤️":"🤍"}</button>
        </div>
      </div>
      <div className="job-tags">
        <span className={`tag tag-${job.sector==="farmacéutico"?"farm":"hosp"}`}>{job.sector}</span>
        <span className="tag tag-neutral">{job.area}</span>
        <span className="tag tag-neutral">{job.exp}</span>
        <span className="tag tag-remote">Remoto</span>
      </div>
      <div className="job-footer">
        <span className="salary">{job.salary}/año</span>
        <span style={{ fontSize:12, color:"#5f5e5a" }}>Ver detalles →</span>
      </div>
    </div>
  )
}

function Modal({ job, score, isFav, onToggleFav, onClose }) {
  const logoBg = LOGO_COLORS[job.id % LOGO_COLORS.length]
  return (
    <div className="modal-overlay" onClick={e => { if(e.target===e.currentTarget) onClose() }}>
      <div className="modal">
        <div className="modal-header">
          <div style={{ display:"flex", gap:12, alignItems:"center" }}>
            <div className="job-logo" style={{ background:logoBg+"22", color:logoBg, width:44, height:44 }}>{job.company.slice(0,2).toUpperCase()}</div>
            <div>
              <p style={{ margin:0, fontWeight:500, fontSize:16 }}>{job.title}</p>
              <p style={{ margin:0, fontSize:13, color:"#5f5e5a" }}>{job.company} · Remoto</p>
            </div>
          </div>
          <div style={{ display:"flex", gap:6, alignItems:"center" }}>
            <button className="fav-btn" style={{ fontSize:20 }} onClick={() => onToggleFav(job.id)}>{isFav?"❤️":"🤍"}</button>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>
        {score !== null && <div style={{ marginBottom:14 }}><MatchPill score={score} /></div>}
        <p style={{ fontSize:14, color:"#5f5e5a", marginBottom:16, lineHeight:1.7 }}>{job.desc}</p>
        <p className="section-label">Habilidades requeridas</p>
        <div className="skills-wrap" style={{ marginBottom:16 }}>{job.skills.map(s=><span key={s} className="skill-tag">{s}</span>)}</div>
        <p className="section-label">Salario estimado</p>
        <p style={{ margin:"0 0 20px", fontWeight:500, fontSize:15 }}>{job.salary}/año</p>
        <a href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title+" "+job.company)}&f_WT=2`}
          target="_blank" rel="noreferrer" className="primary-btn" style={{ display:"block", textAlign:"center", textDecoration:"none" }}>
          Buscar en LinkedIn →
        </a>
      </div>
    </div>
  )
}

export default function App({ session }) {
  const uid = session.user.id
  const userEmail = session.user.email

  const [tab, setTab]               = useState("search")
  const [query, setQuery]           = useState("")
  const [sector, setSector]         = useState("Todos")
  const [area, setArea]             = useState("Todas")
  const [exp, setExp]               = useState("Todos")
  const [selected, setSelected]     = useState(null)
  const [profile, setProfile]       = useState(null)
  const [uploading, setUploading]   = useState(false)
  const [uploadMsg, setUploadMsg]   = useState("")
  const [profileText, setProfileText] = useState("")
  const [favs, setFavs]             = useState([])
  const [alertEmail, setAlertEmail] = useState(userEmail)
  const [alertSector, setAlertSector] = useState("Todos")
  const [alertArea, setAlertArea]   = useState("Todas")
  const [alertExp, setAlertExp]     = useState("Todos")
  const [alertResult, setAlertResult] = useState(null)
  const [copied, setCopied]         = useState(false)
  const [cvUrl, setCvUrl]           = useState(null)
  const fileRef = useRef()

  // Cargar datos del usuario desde Supabase
  useEffect(() => {
    async function load() {
      const [{ data: prof }, { data: favData }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', uid).single(),
        supabase.from('favorites').select('job_id').eq('user_id', uid)
      ])
      if (prof) { setProfile(prof); setCvUrl(prof.cv_url) }
      if (favData) setFavs(favData.map(f => f.job_id))
    }
    load()
  }, [uid])

  const toggleFav = async (jobId) => {
    const isFav = favs.includes(jobId)
    setFavs(prev => isFav ? prev.filter(f=>f!==jobId) : [...prev, jobId])
    if (isFav) {
      await supabase.from('favorites').delete().eq('user_id', uid).eq('job_id', jobId)
    } else {
      await supabase.from('favorites').insert({ user_id: uid, job_id: jobId })
    }
  }

  const calcScore = useCallback((job) => {
    if (!profile) return null
    const skills = (profile.skills||[]).map(s=>s.toLowerCase())
    const expMap = { Junior:1, Mid:2, Senior:3 }
    let s = 0
    const matched = job.skills.filter(sk=>skills.some(us=>sk.toLowerCase().includes(us)||us.includes(sk.toLowerCase())))
    s += Math.min(60, matched.length*15)
    const ul=expMap[profile.experience]||1, jl=expMap[job.exp]||1
    if(ul>=jl) s+=30; else if(ul===jl-1) s+=15
    if(profile.sector && job.sector===profile.sector) s+=10
    return Math.min(100,s)
  },[profile])

  const filtered = JOBS.filter(j => {
    const q=query.toLowerCase()
    return (!q||j.title.toLowerCase().includes(q)||j.company.toLowerCase().includes(q)||j.skills.some(s=>s.includes(q)))
      &&(sector==="Todos"||j.sector===sector)&&(area==="Todas"||j.area===area)&&(exp==="Todos"||j.exp===exp)
  }).map(j=>({job:j,score:calcScore(j)})).sort((a,b)=>(b.score||0)-(a.score||0))

  const favJobs = JOBS.filter(j=>favs.includes(j.id)).map(j=>({job:j,score:calcScore(j)}))

  async function saveProfile(parsed, cvPath) {
    const row = { id: uid, ...parsed, cv_url: cvPath || cvUrl, updated_at: new Date().toISOString() }
    await supabase.from('profiles').upsert(row)
    setProfile(row)
  }

  async function processProfile(content, isFile, base64, file) {
    if (!API_KEY) { setUploadMsg("Añade VITE_ANTHROPIC_API_KEY en tu .env"); return }
    setUploading(true); setUploadMsg("Analizando con IA...")
    try {
      // Subir CV a Supabase Storage si es archivo
      let cvPath = null
      if (isFile && file) {
        const path = `${uid}/${Date.now()}_${file.name}`
        const { error } = await supabase.storage.from('cvs').upload(path, file, { upsert: true })
        if (!error) { cvPath = path; setCvUrl(path) }
      }

      const userContent = isFile
        ? [{ type:"document", source:{ type:"base64", media_type:"application/pdf", data:base64 }},{ type:"text", text:`Extrae del CV. Solo JSON sin markdown:\n{"name":"","email":"","experience":"Junior|Mid|Senior","sector":"farmacéutico|hospitalario|otro","skills":[],"summary":""}` }]
        : `Extrae del texto. Solo JSON sin markdown:\n{"name":"","email":"","experience":"Junior|Mid|Senior","sector":"farmacéutico|hospitalario|otro","skills":[],"summary":""}\n\n${content}`

      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-api-key":API_KEY, "anthropic-version":"2023-06-01", "anthropic-dangerous-direct-browser-access":"true" },
        body:JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, messages:[{role:"user",content:userContent}] })
      })
      const data = await res.json()
      const text = data.content?.find(b=>b.type==="text")?.text||"{}"
      const parsed = JSON.parse(text.replace(/```json|```/g,"").trim())
      await saveProfile(parsed, cvPath)
      setUploadMsg(`Perfil guardado: ${parsed.name||"Listo"}`)
      setTab("search")
    } catch { setUploadMsg("Error al procesar.") }
    setUploading(false)
  }

  function handleUpload(e) {
    const file=e.target.files[0]; if(!file) return
    const reader=new FileReader()
    reader.onload=ev=>processProfile(null,true,ev.target.result.split(",")[1],file)
    reader.readAsDataURL(file)
  }

  async function downloadCv() {
    if (!cvUrl) return
    const { data } = await supabase.storage.from('cvs').createSignedUrl(cvUrl, 60)
    if (data?.signedUrl) window.open(data.signedUrl)
  }

  async function deleteCv() {
    if (!cvUrl) return
    await supabase.storage.from('cvs').remove([cvUrl])
    setCvUrl(null)
    await supabase.from('profiles').update({ cv_url: null }).eq('id', uid)
  }

  function generateAlert() {
    const matches = JOBS.filter(j=>(alertSector==="Todos"||j.sector===alertSector)&&(alertArea==="Todas"||j.area===alertArea)&&(alertExp==="Todos"||j.exp===alertExp))
    const lines = matches.map(j=>`• ${j.title} en ${j.company} (${j.exp}) — ${j.salary}/año`).join("\n")
    const text = `Hola,\n\nAquí tienes las ofertas remotas del sector ${alertSector==="Todos"?"farmacéutico y hospitalario":alertSector}:\n\n${lines||"No se encontraron ofertas."}\n\nTodas las posiciones son 100% remotas.\n\n¡Buena suerte!`
    setAlertResult({ text, count:matches.length })
    supabase.from('alerts').upsert({ user_id:uid, email:alertEmail, sector:alertSector, area:alertArea, exp:alertExp })
  }

  function copyAlert() {
    navigator.clipboard.writeText(alertResult.text).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000) })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
  }

  const TABS = [
    { id:"search",    label:"Ofertas" },
    { id:"favs",      label:"Favoritos", count:favs.length },
    { id:"alerts",    label:"Alertas" },
    { id:"profile",   label:"Mi perfil" },
    { id:"platforms", label:"Plataformas" },
  ]

  return (
    <>
      <style>{css}</style>
      <div className="app">
        <div className="hero">
          <h1>Empleo Remoto en Salud</h1>
          <p>Sector farmacéutico y hospitalario · Solo posiciones 100% remotas</p>
          <div className="hero-stats">
            <div className="hero-stat"><span>{JOBS.length}</span>ofertas</div>
            <div className="hero-stat"><span>{favs.length}</span>favoritos</div>
            <div className="hero-stat"><span>2</span>sectores</div>
          </div>
          <div className="hero-user">
            <p>{userEmail}</p>
            <button className="logout-btn" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </div>

        <div className="tabs">
          {TABS.map(({id,label,count})=>(
            <button key={id} className={`tab${tab===id?" active":""}`} onClick={()=>setTab(id)}>
              {label}{count>0&&<span className="badge">{count}</span>}
            </button>
          ))}
        </div>

        {tab==="search" && (
          <div>
            {profile && (
              <div className="active-bar">
                <span style={{ fontSize:13, color:"#185FA5" }}>Perfil activo: <strong>{profile.name}</strong></span>
                <button onClick={()=>setTab("profile")} style={{ background:"none",border:"none",fontSize:12,color:"#185FA5",cursor:"pointer",padding:0 }}>Editar →</button>
              </div>
            )}
            <div className="search-bar">
              <svg className="search-icon" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 3a6 6 0 100 12A6 6 0 009 3zM1 9a8 8 0 1114.32 4.906l3.387 3.387a1 1 0 01-1.414 1.414l-3.387-3.387A8 8 0 011 9z" clipRule="evenodd"/></svg>
              <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Cargo, empresa o habilidad..." />
            </div>
            <div className="filters">
              <select value={sector} onChange={e=>setSector(e.target.value)}>{SECTORS.map(s=><option key={s}>{s}</option>)}</select>
              <select value={area} onChange={e=>setArea(e.target.value)}>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
              <select value={exp} onChange={e=>setExp(e.target.value)}>{EXPS.map(x=><option key={x}>{x}</option>)}</select>
            </div>
            <p className="results-label">{filtered.length} oferta{filtered.length!==1?"s":""} encontrada{filtered.length!==1?"s":""}</p>
            <div className="job-grid">
              {filtered.map(({job,score})=>(
                <JobCard key={job.id} job={job} score={score} isFav={favs.includes(job.id)} onToggleFav={toggleFav} onClick={(j,s)=>setSelected({job:j,score:s})} />
              ))}
            </div>
          </div>
        )}

        {tab==="favs" && (
          <div>
            {favJobs.length===0 ? (
              <div className="empty-state">
                <div style={{ fontSize:40 }}>🤍</div>
                <p>Aún no tienes favoritos.<br/>Pulsa el corazón en cualquier oferta para guardarla.</p>
              </div>
            ) : (
              <>
                <p className="results-label">{favJobs.length} oferta{favJobs.length!==1?"s guardadas":" guardada"}</p>
                <div className="job-grid">
                  {favJobs.map(({job,score})=>(
                    <JobCard key={job.id} job={job} score={score} isFav={true} onToggleFav={toggleFav} onClick={(j,s)=>setSelected({job:j,score:s})} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {tab==="alerts" && (
          <div>
            <div className="alert-card">
              <h3>Configurar alerta de empleo</h3>
              <label className="form-label">Tu correo electrónico</label>
              <div className="form-row" style={{ marginBottom:14 }}>
                <input type="email" value={alertEmail} onChange={e=>setAlertEmail(e.target.value)} placeholder="tu@correo.com" />
              </div>
              <label className="form-label">Filtros</label>
              <div className="form-row">
                <select value={alertSector} onChange={e=>setAlertSector(e.target.value)}>{SECTORS.map(s=><option key={s}>{s}</option>)}</select>
                <select value={alertArea} onChange={e=>setAlertArea(e.target.value)}>{AREAS.map(a=><option key={a}>{a}</option>)}</select>
                <select value={alertExp} onChange={e=>setAlertExp(e.target.value)}>{EXPS.map(x=><option key={x}>{x}</option>)}</select>
              </div>
              <button className="primary-btn" onClick={generateAlert}>Generar alerta</button>
            </div>
            {alertResult && (
              <div className="alert-card">
                <p className="section-label">{alertResult.count} oferta{alertResult.count!==1?"s":""} encontrada{alertResult.count!==1?"s":""}</p>
                <div className="alert-result">{alertResult.text}</div>
                <div className="copy-row">
                  <button className="secondary-btn" onClick={copyAlert}>{copied?"¡Copiado!":"Copiar texto"}</button>
                  {alertEmail && (
                    <button className="primary-btn" style={{ flex:1 }} onClick={()=>{
                      const sub=encodeURIComponent("Alertas de empleo remoto — Salud")
                      const body=encodeURIComponent(alertResult.text)
                      window.open(`mailto:${alertEmail}?subject=${sub}&body=${body}`)
                    }}>Enviar a {alertEmail} →</button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {tab==="profile" && (
          <div>
            {profile ? (
              <div>
                <div className="profile-card">
                  <div style={{ display:"flex",gap:14,alignItems:"center",marginBottom:12 }}>
                    <div className="avatar">{(profile.name||"?").split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase()}</div>
                    <div>
                      <p style={{ margin:0,fontWeight:500,fontSize:16 }}>{profile.name||"Sin nombre"}</p>
                      <p style={{ margin:0,fontSize:13,color:"#5f5e5a" }}>{profile.email||userEmail}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:14,color:"#5f5e5a",margin:"0 0 10px",lineHeight:1.6 }}>{profile.summary}</p>
                  <div style={{ display:"flex",gap:8,marginBottom:10 }}>
                    <span className="tag tag-farm">{profile.experience}</span>
                    <span className={`tag tag-${profile.sector==="farmacéutico"?"farm":"hosp"}`}>{profile.sector}</span>
                  </div>
                  <p className="section-label">Habilidades</p>
                  <div className="skills-wrap">{(profile.skills||[]).map(s=><span key={s} className="skill-tag">{s}</span>)}</div>
                </div>
                {cvUrl ? (
                  <div className="cv-badge">
                    <span>CV subido y almacenado de forma segura</span>
                    <div style={{ display:"flex",gap:8 }}>
                      <button className="secondary-btn" onClick={downloadCv} style={{ padding:"4px 12px",fontSize:12 }}>Descargar</button>
                      <button className="secondary-btn" onClick={deleteCv} style={{ padding:"4px 12px",fontSize:12,color:"#A32D2D" }}>Eliminar</button>
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize:13,color:"#5f5e5a",marginBottom:12 }}>No tienes CV subido todavía.</p>
                )}
                <button className="secondary-btn" onClick={async()=>{ setProfile(null); await supabase.from('profiles').delete().eq('id',uid) }}>Eliminar perfil</button>
              </div>
            ) : (
              <div>
                <div className="upload-area" onClick={()=>fileRef.current?.click()}>
                  <div style={{ fontSize:32,marginBottom:8 }}>📄</div>
                  <p style={{ margin:0,fontWeight:500,fontSize:15 }}>Sube tu CV en PDF</p>
                  <p style={{ margin:"4px 0 0",fontSize:13,color:"#5f5e5a" }}>Se almacena cifrado y solo tú puedes acceder a él</p>
                </div>
                <input ref={fileRef} type="file" accept="application/pdf" style={{ display:"none" }} onChange={handleUpload} />
                <div className="divider">o escribe tu perfil</div>
                <textarea value={profileText} onChange={e=>setProfileText(e.target.value)} rows={5} placeholder="Ej: Farmacéutica con 5 años en farmacovigilancia. Manejo Argus Safety, ICH, inglés avanzado..." style={{ marginBottom:12 }} />
                <button className="primary-btn" onClick={()=>processProfile(profileText,false)} disabled={uploading||!profileText.trim()}>
                  {uploading?"Procesando...":"Analizar con IA →"}
                </button>
                {!API_KEY && <p style={{ fontSize:12,color:"#D85A30",marginTop:10 }}>Añade VITE_ANTHROPIC_API_KEY en tu .env para activar el análisis con IA.</p>}
              </div>
            )}
            {uploadMsg&&<p style={{ fontSize:13,color:"#0F6E56",marginTop:12 }}>{uploadMsg}</p>}
          </div>
        )}

        {tab==="platforms" && (
          <div>
            <p style={{ fontSize:14,color:"#5f5e5a",marginBottom:20 }}>Accede a otras plataformas con búsquedas preconfiguradas para el sector.</p>
            {profile && (
              <div style={{ background:"linear-gradient(90deg,#E6F1FB,#E1F5EE)",border:"0.5px solid #B5D4F4",borderRadius:12,padding:"12px 16px",marginBottom:20 }}>
                <p className="section-label" style={{ marginBottom:8 }}>Tu perfil para copiar</p>
                <p style={{ margin:0,fontSize:13,lineHeight:1.8 }}>
                  <strong>Nombre:</strong> {profile.name}<br/>
                  <strong>Nivel:</strong> {profile.experience}<br/>
                  <strong>Habilidades:</strong> {(profile.skills||[]).join(", ")}<br/>
                  <strong>Resumen:</strong> {profile.summary}
                </p>
              </div>
            )}
            <div style={{ display:"grid",gap:10 }}>
              {PLATFORMS.map(p=>(
                <div key={p.name} className="platform-card">
                  <div className="plat-icon" style={{ background:p.bg }}>{p.name.slice(0,2)}</div>
                  <div>
                    <p style={{ margin:0,fontWeight:500,fontSize:15 }}>{p.name}</p>
                    <p style={{ margin:0,fontSize:12,color:"#5f5e5a" }}>Remoto · farmacéutico / hospitalario</p>
                  </div>
                  <a href={p.url} target="_blank" rel="noreferrer" className="plat-link">Abrir →</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {selected && (
          <Modal job={selected.job} score={selected.score} isFav={favs.includes(selected.job.id)} onToggleFav={toggleFav} onClose={()=>setSelected(null)} />
        )}
      </div>
    </>
  )
}
