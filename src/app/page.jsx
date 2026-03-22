"use client";
import { useState, useEffect, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAISES = [
  { code: "BR", name: "Brasil", dial: "+55", flag: "🇧🇷", mask: "(XX) XXXXX-XXXX", digits: 11 },
  { code: "US", name: "EUA", dial: "+1", flag: "🇺🇸", mask: "", digits: null },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹", mask: "", digits: null },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷", mask: "", digits: null },
  { code: "MX", name: "México", dial: "+52", flag: "🇲🇽", mask: "", digits: null },
  { code: "CO", name: "Colômbia", dial: "+57", flag: "🇨🇴", mask: "", digits: null },
  { code: "CL", name: "Chile", dial: "+56", flag: "🇨🇱", mask: "", digits: null },
  { code: "PE", name: "Peru", dial: "+51", flag: "🇵🇪", mask: "", digits: null },
  { code: "ES", name: "Espanha", dial: "+34", flag: "🇪🇸", mask: "", digits: null },
  { code: "IT", name: "Itália", dial: "+39", flag: "🇮🇹", mask: "", digits: null },
  { code: "DE", name: "Alemanha", dial: "+49", flag: "🇩🇪", mask: "", digits: null },
  { code: "FR", name: "França", dial: "+33", flag: "🇫🇷", mask: "", digits: null },
  { code: "GB", name: "Reino Unido", dial: "+44", flag: "🇬🇧", mask: "", digits: null },
  { code: "OTHER", name: "Outro", dial: "+", flag: "🌍", mask: "", digits: null },
];

const NICHOS_OPCOES = [
  "🏠 Casa e Decoração","🍳 Cozinha e Utensílios","🔨 Ferramentas e Construção",
  "👗 Moda Feminina","👔 Moda Masculina","💍 Joias e Acessórios",
  "✨ Beleza e Cuidados","💊 Saúde e Bem-estar","🏋️ Fitness",
  "🐾 Pet","👶 Bebês e Infantil","🎁 Presentes e Gadgets",
  "📱 Eletrônicos","🎮 Games e Acessórios","📚 Livros e Papelaria",
  "🚗 Automotivo","⚽ Esportes","🌿 Viagem e Outdoor",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBRPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits.length) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
};

const callClaude = async (prompt, maxTokens = 4000) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20251001",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.map((b) => b.text || "").join("") || "";
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("JSON não encontrado na resposta");
  return JSON.parse(match[0]);
};

const exportLeadsCSV = (leads) => {
  if (!leads.length) return;
  const headers = [
    "Data","Nome","Email","WhatsApp","País","Idade","Conhecimento Dropshipping",
    "Objetivo","Status Amoroso","Filhos","Pets","Exercícios","Interesses",
    "Nichos Identificação","Nicho Escolhido","Nome Loja","Etapa Concluída"
  ];
  const rows = leads.map(l => [
    l.data, l.nome, l.email, l.whatsapp, l.pais,
    l.idade, l.conhecimento_dropshipping, l.objetivo,
    l.genero_vida_amorosa, l.filhos, l.pets, l.exercicios_fisicos,
    l.assuntos_interesse, l.nichos_identificacao,
    l.nicho_escolhido, l.nome_loja, l.etapa_concluida
  ].map(v => `"${(v||"").toString().replace(/"/g,'""')}"`));
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `leads_guia_nichos_${new Date().toISOString().split("T")[0]}.csv`;
  a.click(); URL.revokeObjectURL(url);
};

// ─── UI Components ────────────────────────────────────────────────────────────

const Card = ({ children, style = {} }) => (
  <div style={{
    background: "rgba(13,13,13,0.97)", border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20, overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,0.6)", ...style
  }}>
    {children}
  </div>
);

const PrimaryBtn = ({ children, onClick, disabled, style = {} }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    style={{
      width: "100%", border: "none", borderRadius: 12, padding: "14px 24px",
      fontWeight: 700, fontSize: 15, cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
      transition: "opacity 0.2s", opacity: disabled ? 0.4 : 1,
      background: disabled ? "#2a2a2a" : "linear-gradient(135deg, #22c55e, #16a34a)",
      color: disabled ? "#666" : "#000", fontFamily: "inherit", ...style
    }}
  >
    {children}
  </button>
);

const GhostBtn = ({ children, onClick, style = {} }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      border: "1px solid #2a2a2a", borderRadius: 12, padding: "14px 20px",
      fontWeight: 600, fontSize: 14, cursor: "pointer", background: "transparent",
      color: "#666", fontFamily: "inherit", transition: "opacity 0.2s",
      whiteSpace: "nowrap", ...style
    }}
  >
    {children}
  </button>
);

const TextInput = ({ label, value, onChange, placeholder, type = "text", error }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{label}</label>}
    <input
      type={type} value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%", background: "rgba(255,255,255,0.05)", border: `1px solid ${error ? "#ef4444" : "rgba(255,255,255,0.12)"}`,
        borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none",
        boxSizing: "border-box", fontFamily: "inherit",
      }}
    />
    {error && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 4 }}>{error}</p>}
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{label}</label>}
    <textarea
      value={value} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} rows={3}
      style={{
        width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none",
        boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
      }}
    />
  </div>
);

const DropSelect = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom: 16 }}>
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>{label}</label>}
    <select
      value={value} onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%", background: "#111", border: "1px solid rgba(255,255,255,0.12)",
        borderRadius: 10, padding: "12px 16px", color: value ? "#fff" : "#555",
        fontSize: 15, outline: "none", boxSizing: "border-box", cursor: "pointer", fontFamily: "inherit",
      }}
    >
      <option value="">Selecione...</option>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  </div>
);

const Loader = ({ text = "Processando..." }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    <div style={{
      width: 18, height: 18, border: "2px solid rgba(34,197,94,0.3)", borderTopColor: "#22c55e",
      borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0,
    }} />
    <span style={{ fontSize: 14 }}>{text}</span>
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", top: 20, right: 20, zIndex: 9999,
      background: type === "error" ? "#dc2626" : "#16a34a",
      color: "#fff", padding: "12px 20px", borderRadius: 12,
      fontWeight: 600, fontSize: 14, boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
      maxWidth: 340, fontFamily: "inherit",
    }}>
      {msg}
    </div>
  );
};

const StepHeader = ({ icon, title, subtitle }) => (
  <div style={{ padding: "40px 40px 8px", textAlign: "center" }}>
    <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
    <h2 style={{ color: "#fff", fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{title}</h2>
    {subtitle && <p style={{ color: "#666", fontSize: 14 }}>{subtitle}</p>}
  </div>
);

const ProgressBar = ({ etapa }) => {
  const steps = [
    { num: 1, label: "Contato" }, { num: 2, label: "Perfil" }, { num: 3, label: "Nicho" },
    { num: 4, label: "Produtos" }, { num: 5, label: "Nome" }, { num: 6, label: "Cores" },
    { num: 7, label: "Pronto!" },
  ];
  const etapaToStep = (e) => {
    if (e >= 6) return 7;
    if (e >= 5) return 6;
    if (e >= 4) return 5;
    if (e >= 3.5) return 4;
    if (e >= 3) return 3;
    if (e >= 1.5) return 2;
    return 1;
  };
  const cur = etapaToStep(etapa);
  return (
    <div style={{ maxWidth: 660, margin: "0 auto 28px", padding: "0 12px" }}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((step, i) => (
          <div key={step.num} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : "0 0 auto" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center",
                justifyContent: "center", fontWeight: 700, fontSize: 12, transition: "all 0.3s",
                background: cur >= step.num ? "linear-gradient(135deg,#22c55e,#16a34a)" : "rgba(255,255,255,0.06)",
                color: cur >= step.num ? "#000" : "#555",
                boxShadow: cur >= step.num ? "0 0 10px rgba(34,197,94,0.35)" : "none",
                border: cur >= step.num ? "none" : "1px solid #2a2a2a",
              }}>
                {cur > step.num ? "✓" : step.num}
              </div>
              <span style={{ fontSize: 9, marginTop: 4, color: cur >= step.num ? "#22c55e" : "#444", fontWeight: cur >= step.num ? 700 : 400, whiteSpace: "nowrap" }}>
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, margin: "15px 4px 0", background: cur > step.num ? "#22c55e" : "rgba(255,255,255,0.07)", transition: "all 0.3s" }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Admin Panel ──────────────────────────────────────────────────────────────

const AdminPanel = ({ leads, onClose }) => (
  <div style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.95)", zIndex: 1000,
    display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "inherit",
  }}>
    <div style={{ padding: "20px 28px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", flexShrink: 0 }}>
      <div>
        <h2 style={{ color: "#fff", fontSize: 20, fontWeight: 800 }}>📊 Base de Leads</h2>
        <p style={{ color: "#555", fontSize: 13 }}>{leads.length} lead{leads.length !== 1 ? "s" : ""} capturado{leads.length !== 1 ? "s" : ""}</p>
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        {leads.length > 0 && (
          <button type="button" onClick={() => exportLeadsCSV(leads)}
            style={{ padding: "8px 16px", background: "#22c55e", color: "#000", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            ⬇ Exportar CSV
          </button>
        )}
        <button type="button" onClick={onClose}
          style={{ padding: "8px 16px", background: "#1a1a1a", color: "#aaa", border: "1px solid #2a2a2a", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
          Fechar
        </button>
      </div>
    </div>
    <div style={{ flex: 1, overflow: "auto", padding: 20 }}>
      {leads.length === 0 ? (
        <div style={{ textAlign: "center", color: "#444", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
          <p>Nenhum lead capturado ainda.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...leads].reverse().map((lead, i) => (
            <div key={i} style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{lead.nome}</span>
                  <span style={{ background: "rgba(34,197,94,0.15)", color: "#22c55e", fontSize: 10, padding: "2px 8px", borderRadius: 20, fontWeight: 800 }}>
                    {lead.etapa_concluida}
                  </span>
                </div>
                <span style={{ color: "#444", fontSize: 12 }}>{lead.data}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))", gap: 8 }}>
                {[
                  ["📧", "Email", lead.email],
                  ["📱", "WhatsApp", lead.whatsapp],
                  ["🌍", "País", lead.pais],
                  ["🎂", "Idade", lead.idade],
                  ["🎓", "Conhecimento", lead.conhecimento_dropshipping],
                  ["💡", "Objetivo", lead.objetivo],
                  ["💑", "Status", lead.genero_vida_amorosa],
                  ["👶", "Filhos", lead.filhos],
                  ["🐾", "Pets", lead.pets],
                  ["🎯", "Nicho", lead.nicho_escolhido],
                  ["🏷️", "Loja", lead.nome_loja],
                ].filter(([,,v]) => v).map(([icon, k, v]) => (
                  <div key={k} style={{ background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                    <p style={{ color: "#444", fontSize: 10, marginBottom: 2 }}>{icon} {k}</p>
                    <p style={{ color: "#bbb", fontSize: 12, wordBreak: "break-word" }}>{v}</p>
                  </div>
                ))}
              </div>
              {lead.nichos_identificacao && (
                <div style={{ marginTop: 10, background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ color: "#444", fontSize: 10, marginBottom: 3 }}>🏷 NICHOS DE IDENTIFICAÇÃO</p>
                  <p style={{ color: "#bbb", fontSize: 12 }}>{lead.nichos_identificacao}</p>
                </div>
              )}
              {lead.assuntos_interesse && (
                <div style={{ marginTop: 8, background: "#1a1a1a", borderRadius: 8, padding: "8px 12px" }}>
                  <p style={{ color: "#444", fontSize: 10, marginBottom: 3 }}>💬 INTERESSES</p>
                  <p style={{ color: "#bbb", fontSize: 12 }}>{lead.assuntos_interesse}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function GuiaDeNichos() {
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const adminTimer = useRef(null);

  // Leads em memória
  const [leads, setLeads] = useState([]);

  // Etapa 1
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [pais, setPais] = useState(PAISES[0]);
  const [paisOpen, setPaisOpen] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const paisRef = useRef(null);

  // Etapa 1.5
  const [idade, setIdade] = useState("");
  const [conhecimento, setConhecimento] = useState("");
  const [objetivo, setObjetivo] = useState("");

  // Etapa 2
  const [statusAmoroso, setStatusAmoroso] = useState("");
  const [filhos, setFilhos] = useState("");
  const [pets, setPets] = useState("");
  const [exercicios, setExercicios] = useState("");
  const [interesses, setInteresses] = useState("");
  const [nichosIdent, setNichosIdent] = useState([]);

  // Etapa 3
  const [nichos, setNichos] = useState([]);
  const [nomesLoja, setNomesLoja] = useState([]);
  const [selectedNiche, setSelectedNiche] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);

  // Etapa 3.5
  const [colecoes, setColecoes] = useState([]);

  // Etapa 4
  const [nomeLoja, setNomeLoja] = useState("");
  const [dominioStatus, setDominioStatus] = useState(null);

  // Etapa 5
  const [paletaCores, setPaletaCores] = useState(null);

  const showToast = (msg, type = "success") => setToast({ msg, type });

  // Fecha dropdown país ao clicar fora
  useEffect(() => {
    const h = (e) => { if (paisRef.current && !paisRef.current.contains(e.target)) setPaisOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  // Triple-click no título abre admin
  const handleTitleClick = () => {
    const n = adminClicks + 1;
    setAdminClicks(n);
    clearTimeout(adminTimer.current);
    if (n >= 3) { setShowAdmin(true); setAdminClicks(0); return; }
    adminTimer.current = setTimeout(() => setAdminClicks(0), 1500);
  };

  const upsertLead = (extra = {}) => {
    const lead = {
      data: new Date().toLocaleString("pt-BR"),
      nome, email,
      whatsapp: `${pais.dial} ${whatsapp}`.trim(),
      pais: pais.name, idade,
      conhecimento_dropshipping: conhecimento, objetivo,
      genero_vida_amorosa: statusAmoroso, filhos, pets,
      exercicios_fisicos: exercicios, assuntos_interesse: interesses,
      nichos_identificacao: nichosIdent.join(", "),
      nicho_escolhido: selectedNiche?.nome || "",
      nome_loja: nomeLoja,
      etapa_concluida: String(etapa),
      ...extra,
    };
    setLeads(prev => {
      const idx = prev.findIndex(l => l.email === email);
      if (idx >= 0) { const next = [...prev]; next[idx] = lead; return next; }
      return [...prev, lead];
    });
  };

  const handlePhoneChange = (value) => {
    if (pais.code === "BR") {
      const fmt = formatBRPhone(value);
      setWhatsapp(fmt);
      const d = fmt.replace(/\D/g,"");
      setPhoneError(d.length > 0 && d.length < 11 ? "Número inválido. Use (XX) XXXXX-XXXX" : "");
    } else {
      setWhatsapp(value);
      setPhoneError("");
    }
  };

  const toggleNicho = (n) => {
    if (nichosIdent.includes(n)) setNichosIdent(nichosIdent.filter(x => x !== n));
    else if (nichosIdent.length < 4) setNichosIdent([...nichosIdent, n]);
  };

  // ── Handlers ──────────────────────────────────────────────────────────────

  const avancarEtapa1 = () => {
    if (!nome.trim()) { showToast("Digite seu nome.", "error"); return; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { showToast("E-mail inválido.", "error"); return; }
    if (!whatsapp.trim()) { showToast("Digite seu WhatsApp.", "error"); return; }
    if (pais.code === "BR" && whatsapp.replace(/\D/g,"").length !== 11) {
      setPhoneError("Número inválido. Use (XX) XXXXX-XXXX"); return;
    }
    upsertLead({ etapa_concluida: "1 - Contato" });
    setEtapa(1.5);
  };

  const avancarEtapa15 = () => {
    if (!idade || !conhecimento || !objetivo) { showToast("Responda todas as perguntas.", "error"); return; }
    upsertLead({ etapa_concluida: "1.5 - Demográfico" });
    setEtapa(2);
  };

  const avancarEtapa2 = async () => {
    if (!statusAmoroso || !filhos || !pets || !exercicios || !interesses.trim() || nichosIdent.length === 0) {
      showToast("Responda todas as perguntas.", "error"); return;
    }
    setLoading(true);
    try {
      const prompt = `Você é especialista em dropshipping. Analise o perfil e retorne APENAS JSON válido, sem markdown nem texto extra.

Perfil:
- Status amoroso: ${statusAmoroso}
- Filhos: ${filhos}
- Pet: ${pets}
- Exercícios: ${exercicios}
- Interesses redes sociais: ${interesses}
- Nichos de identificação: ${nichosIdent.join(", ")}

TAREFA 1: Sugira 4 nichos. Use SOMENTE estes 6 principais: Genérica, Casa e Cozinha, Infantil, Pet, Eletrônico, Saúde e Beleza. Formato: "Subnicho (Nicho Principal)". O primeiro deve ter is_principal:true, os outros false. Campos: nome, justificativa, exemplo_produto, is_principal.

TAREFA 2: Crie 10 nomes de loja. 5 MARCA FORTE (curtos, inventados, sonoros) + 5 MARCA PREMIUM (elegantes). Evite nomes genéricos. Campos: nome, explicacao.

Retorne APENAS este JSON:
{"nichos":[{"nome":"...","justificativa":"...","exemplo_produto":"...","is_principal":true}],"nomes_loja":[{"nome":"...","explicacao":"..."}]}`;

      const res = await callClaude(prompt);
      setNichos(Array.isArray(res.nichos) ? res.nichos : []);
      setNomesLoja(Array.isArray(res.nomes_loja) ? res.nomes_loja : []);
      upsertLead({ etapa_concluida: "2 - Perfil" });
      setEtapa(3);
    } catch (err) {
      showToast("Erro ao analisar perfil. Tente novamente.", "error");
    }
    setLoading(false);
  };

  const avancarEtapa3 = async () => {
    if (!selectedNiche) { showToast("Selecione um nicho.", "error"); return; }
    setLoading(true);
    try {
      const prompt = `Você é especialista em dropshipping. Para o nicho: "${selectedNiche.nome}".

Crie 5 coleções temáticas para uma loja de dropshipping. Para cada coleção, sugira entre 5 e 8 produtos.

Responda SOMENTE com JSON válido, sem texto antes ou depois, sem markdown:
{"colecoes":[{"nome":"Nome da Colecao","produtos":[{"nome":"Nome do Produto","descricao":"Descricao breve","motivo_apelo":"Por que vende bem"}]}]}`;

      const res = await callClaude(prompt, 6000);
      setColecoes(Array.isArray(res.colecoes) ? res.colecoes : []);
      upsertLead({ etapa_concluida: "3 - Nicho", nicho_escolhido: selectedNiche.nome });
      setEtapa(3.5);
    } catch (err) {
      showToast("Erro ao gerar coleções. Tente novamente.", "error");
    }
    setLoading(false);
  };

  const verificarNome = async () => {
    if (!nomeLoja.trim()) { showToast("Digite um nome.", "error"); return; }
    setDominioStatus(null);
    setLoading(true);
    try {
      const prompt = `Analise o nome de loja "${nomeLoja}" para e-commerce no nicho "${selectedNiche?.nome || "geral"}". Retorne APENAS JSON válido.

{"pontos_positivos":["..."],"pontos_atencao":["..."],"conflitos":[{"nome":"...","tipo":"...","descricao":"..."}],"sugestoes_alternativas":[{"nome":"...","motivo":"..."}]}`;

      const res = await callClaude(prompt);
      setDominioStatus(res);
      upsertLead({ etapa_concluida: "4 - Nome", nome_loja: nomeLoja });
    } catch (err) {
      showToast("Erro ao verificar nome. Tente novamente.", "error");
    }
    setLoading(false);
  };

  const avancarEtapa5 = async () => {
    setLoading(true);
    try {
      const prompt = `Especialista em branding. Sugira 3 combinações de cores para a loja "${nomeLoja}" no nicho "${selectedNiche?.nome}". Retorne APENAS JSON válido.

{"combinacoes":[{"cor_primaria":{"nome":"...","hex":"#XXXXXX"},"cor_secundaria":{"nome":"...","hex":"#XXXXXX"},"significado":"..."}]}`;

      const res = await callClaude(prompt);
      setPaletaCores(res);
      upsertLead({ etapa_concluida: "5 - Cores", nome_loja: nomeLoja });
      setEtapa(5);
    } catch (err) {
      showToast("Erro ao gerar paleta. Tente novamente.", "error");
    }
    setLoading(false);
  };

  const finalizar = () => {
    upsertLead({ etapa_concluida: "6 - Concluído", nome_loja: nomeLoja });
    setEtapa(6);
  };

  const gerarPDF = () => {
    const loadAndGenerate = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297, mg = 18;
      const col = W - mg * 2;
      let y = mg;

      const newPage = () => { doc.addPage(); y = mg; doc.setFillColor(8,8,8); doc.rect(0,0,W,H,'F'); doc.setFillColor(22,163,74); doc.rect(0,0,W,1.5,'F'); };
      const chk = (n=10) => { if (y+n > H-mg) newPage(); };

      const sectionHeader = (title) => {
        chk(14);
        doc.setFillColor(22,40,28); doc.roundedRect(mg, y, col, 10, 2, 2, 'F');
        doc.setTextColor(34,197,94); doc.setFont('helvetica','bold'); doc.setFontSize(11);
        doc.text(title, mg+5, y+7); y += 16;
      };

      const hexRgb = (hex) => [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];

      // ── CAPA ──────────────────────────────────────────────────────────────
      doc.setFillColor(8,8,8); doc.rect(0,0,W,H,'F');
      doc.setFillColor(22,163,74); doc.rect(0,0,W,5,'F');
      doc.setFillColor(22,163,74); doc.rect(0,H-5,W,5,'F');

      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(32);
      doc.text('Guia de Nichos', W/2, 70, {align:'center'});
      doc.setFontSize(13); doc.setTextColor(134,239,172);
      doc.text('Análise personalizada de e-commerce com IA', W/2, 82, {align:'center'});

      doc.setFillColor(18,18,18); doc.roundedRect(mg, 100, col, 80, 5, 5, 'F');
      doc.setDrawColor(34,197,94); doc.setLineWidth(0.5); doc.roundedRect(mg,100,col,80,5,5,'S');

      doc.setTextColor(34,197,94); doc.setFont('helvetica','bold'); doc.setFontSize(9);
      doc.text('SEU RESUMO', mg+8, 113);

      const items = [['Nome', nome||'-'], ['Nicho', selectedNiche?.nome||'-'], ['Loja', nomeLoja||'-'], ['Data', new Date().toLocaleDateString('pt-BR')]];
      items.forEach(([k,v],i) => {
        const ry = 122 + i*14;
        doc.setTextColor(80,80,80); doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.text(k, mg+8, ry);
        doc.setTextColor(220,220,220); doc.setFontSize(11); doc.setFont('helvetica','bold'); doc.text(v, mg+8, ry+7);
      });

      doc.setTextColor(50,50,50); doc.setFontSize(8); doc.setFont('helvetica','normal');
      doc.text('Gerado pelo Guia de Nichos', W/2, H-10, {align:'center'});

      // ── P2: NICHO ──────────────────────────────────────────────────────────
      newPage();
      sectionHeader('Nicho Recomendado');

      if (selectedNiche) {
        chk(42);
        doc.setFillColor(15,30,18); doc.roundedRect(mg, y, col, 40, 3, 3, 'F');
        doc.setDrawColor(34,197,94); doc.setLineWidth(0.4); doc.roundedRect(mg,y,col,40,3,3,'S');
        if (selectedNiche.is_principal) {
          doc.setFillColor(34,197,94); doc.roundedRect(mg+5, y+5, 42, 5, 2, 2, 'F');
          doc.setTextColor(0,0,0); doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.text('RECOMENDADO', mg+7, y+9);
        }
        doc.setTextColor(255,255,255); doc.setFontSize(14); doc.setFont('helvetica','bold'); doc.text(selectedNiche.nome, mg+5, y+18);
        doc.setTextColor(150,150,150); doc.setFontSize(8.5); doc.setFont('helvetica','normal');
        const jLines = doc.splitTextToSize(selectedNiche.justificativa||'', col-10);
        doc.text(jLines.slice(0,2), mg+5, y+26);
        doc.setTextColor(34,197,94); doc.setFontSize(8.5);
        doc.text('Exemplo: '+(selectedNiche.exemplo_produto||''), mg+5, y+36);
        y += 48;
      }

      if (nichos.filter(n=>n!==selectedNiche).length) {
        chk(12); doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text('OUTRAS OPÇÕES ANALISADAS', mg, y); y += 6;
        nichos.filter(n=>n!==selectedNiche).forEach(n => {
          chk(16);
          doc.setFillColor(18,18,18); doc.roundedRect(mg, y, col, 14, 2, 2, 'F');
          doc.setTextColor(200,200,200); doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.text(n.nome, mg+5, y+6);
          doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(n.justificativa||'', col-10)[0], mg+5, y+11);
          y += 17;
        });
      }

      // ── P3: NOME DA LOJA ───────────────────────────────────────────────────
      newPage();
      sectionHeader('Nome da Loja');

      chk(24);
      doc.setFillColor(15,30,18); doc.roundedRect(mg, y, col, 22, 3, 3, 'F');
      doc.setDrawColor(34,197,94); doc.setLineWidth(0.5); doc.roundedRect(mg,y,col,22,3,3,'S');
      doc.setTextColor(134,239,172); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('NOME ESCOLHIDO', mg+5, y+6);
      doc.setTextColor(255,255,255); doc.setFontSize(20); doc.text(nomeLoja||'-', mg+5, y+17);
      y += 30;

      if (dominioStatus?.pontos_positivos?.length) {
        chk(10); doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('PONTOS POSITIVOS', mg, y); y += 5;
        dominioStatus.pontos_positivos.forEach(p => {
          chk(8); doc.setFillColor(13,22,13); doc.roundedRect(mg, y, col, 7, 1, 1, 'F');
          doc.setTextColor(134,239,172); doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.text('+ '+p, mg+3, y+5); y += 9;
        }); y += 4;
      }
      if (dominioStatus?.pontos_atencao?.length) {
        chk(10); doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('PONTOS DE ATENÇÃO', mg, y); y += 5;
        dominioStatus.pontos_atencao.forEach(p => {
          chk(8); doc.setFillColor(25,20,10); doc.roundedRect(mg, y, col, 7, 1, 1, 'F');
          doc.setTextColor(234,179,8); doc.setFontSize(8); doc.setFont('helvetica','normal'); doc.text('! '+p, mg+3, y+5); y += 9;
        }); y += 4;
      }
      if (nomesLoja.length) {
        chk(12); doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('NOMES SUGERIDOS PELA IA', mg, y); y += 6;
        const half = (col-4)/2;
        nomesLoja.slice(0,10).forEach((item,i) => {
          if (i%2===0) { chk(14); }
          const xo = i%2===0 ? mg : mg+half+4;
          doc.setFillColor(18,18,18); doc.roundedRect(xo, y, half, 12, 2, 2, 'F');
          doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text(item.nome, xo+4, y+5);
          doc.setTextColor(80,80,80); doc.setFontSize(7); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(item.explicacao||'', half-8)[0], xo+4, y+10);
          if (i%2===1) y += 14;
        });
        if (nomesLoja.length%2!==0) y += 14;
      }

      // ── P4: PALETA DE CORES ────────────────────────────────────────────────
      newPage();
      sectionHeader('Paleta de Cores');

      (paletaCores?.combinacoes||[]).forEach((combo,i) => {
        chk(60);
        const cp = combo?.cor_primaria?.hex||'#4B5563';
        const cs = combo?.cor_secundaria?.hex||'#FFFFFF';
        const [pr,pg,pb] = hexRgb(cp), [sr,sg,sb] = hexRgb(cs);

        doc.setFillColor(18,18,18); doc.roundedRect(mg, y, col, 54, 3, 3, 'F');
        doc.setDrawColor(40,40,40); doc.setLineWidth(0.3); doc.roundedRect(mg,y,col,54,3,3,'S');
        doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('OPÇÃO '+(i+1), mg+5, y+7);

        const sw = (col-18)/2;
        // Swatch primária
        doc.setFillColor(pr,pg,pb); doc.roundedRect(mg+5, y+11, sw, 16, 2, 2, 'F');
        doc.setTextColor(130,130,130); doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.text('COR PRINCIPAL', mg+5, y+31);
        doc.setTextColor(190,190,190); doc.setFontSize(8.5); doc.text(combo.cor_primaria?.nome||'', mg+5, y+37);
        doc.setTextColor(80,80,80); doc.setFontSize(8); doc.text(cp, mg+5, y+43);
        // Swatch secundária
        const x2 = mg+5+sw+8;
        doc.setFillColor(sr,sg,sb); doc.roundedRect(x2, y+11, sw, 16, 2, 2, 'F');
        doc.setTextColor(130,130,130); doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.text('COR SECUNDÁRIA', x2, y+31);
        doc.setTextColor(190,190,190); doc.setFontSize(8.5); doc.text(combo.cor_secundaria?.nome||'', x2, y+37);
        doc.setTextColor(80,80,80); doc.setFontSize(8); doc.text(cs, x2, y+43);
        // Significado
        doc.setTextColor(80,80,80); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
        doc.text(doc.splitTextToSize(combo.significado||'', col-10)[0], mg+5, y+51);
        y += 61;
      });

      // ── P5+: COLEÇÕES ──────────────────────────────────────────────────────
      newPage();
      sectionHeader('Coleções e Produtos Sugeridos');

      (colecoes||[]).forEach((coll) => {
        chk(14);
        doc.setFillColor(20,18,35); doc.roundedRect(mg, y, col, 10, 2, 2, 'F');
        doc.setTextColor(167,139,250); doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.text(coll.nome, mg+5, y+7); y += 13;
        (coll.produtos||[]).forEach((prod,pi) => {
          chk(20);
          doc.setFillColor(14,14,20); doc.roundedRect(mg+3, y, col-3, 18, 1, 1, 'F');
          doc.setTextColor(210,210,210); doc.setFontSize(9); doc.setFont('helvetica','bold');
          doc.text((pi+1)+'. '+prod.nome, mg+7, y+6);
          doc.setTextColor(100,100,100); doc.setFontSize(8); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(prod.descricao||'', col-18)[0], mg+7, y+12);
          doc.setTextColor(99,102,241); doc.setFontSize(7.5);
          doc.text(doc.splitTextToSize('Apelo: '+(prod.motivo_apelo||''), col-18)[0], mg+7, y+17);
          y += 21;
        }); y += 5;
      });

      // Rodapé em todas as páginas
      const total = doc.getNumberOfPages();
      for (let p=1; p<=total; p++) {
        doc.setPage(p);
        doc.setFillColor(12,12,12); doc.rect(0,H-9,W,9,'F');
        doc.setTextColor(45,45,45); doc.setFontSize(7); doc.setFont('helvetica','normal');
        doc.text('Guia de Nichos  |  Analise com Inteligencia Artificial', mg, H-4);
        doc.text('Pag. '+p+' / '+total, W-mg, H-4, {align:'right'});
      }

      const filename = 'Guia_Nichos_'+(nomeLoja||'minha_loja').replace(/\s+/g,'_')+'.pdf';
      doc.save(filename);
      showToast('PDF baixado com sucesso!');
    };

    if (window.jspdf) { loadAndGenerate(); return; }
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = loadAndGenerate;
    s.onerror = () => showToast('Erro ao carregar jsPDF.', 'error');
    document.head.appendChild(s);
  };


  const copiar = (hex) => {
    if (navigator.clipboard) navigator.clipboard.writeText(hex).then(() => showToast(`${hex} copiado!`));
    else showToast("Código: " + hex);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  const pad = { padding: "24px 36px 36px" };

  const renderStep = () => {
    switch (etapa) {

      case 1: return (
        <Card>
          <StepHeader icon="👤" title="Seus Dados de Contato" subtitle="Vamos começar com suas informações básicas" />
          <div style={pad}>
            <TextInput label="Nome completo" value={nome} onChange={setNome} placeholder="João Silva" />
            <TextInput label="E-mail" type="email" value={email} onChange={setEmail} placeholder="joao@email.com" />

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 13, fontWeight: 600 }}>WhatsApp</label>
              <div style={{ display: "flex", gap: 8 }}>
                <div ref={paisRef} style={{ position: "relative", flexShrink: 0 }}>
                  <button type="button" onClick={() => setPaisOpen(!paisOpen)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: "12px 14px", color: "#fff", cursor: "pointer", fontSize: 14, fontFamily: "inherit" }}>
                    {pais.flag} {pais.dial} ▾
                  </button>
                  {paisOpen && (
                    <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 200, background: "#141414", border: "1px solid #2a2a2a", borderRadius: 12, minWidth: 200, maxHeight: 240, overflowY: "auto", boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}>
                      {PAISES.map((p) => (
                        <button key={p.code} type="button"
                          onClick={() => { setPais(p); setPaisOpen(false); setWhatsapp(""); setPhoneError(""); }}
                          style={{ width: "100%", padding: "10px 16px", background: pais.code === p.code ? "rgba(34,197,94,0.1)" : "transparent", border: "none", color: "#ddd", cursor: "pointer", textAlign: "left", fontSize: 13, fontFamily: "inherit" }}>
                          {p.flag} {p.name} <span style={{ color: "#555" }}>{p.dial}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input type="tel" value={whatsapp} onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder={pais.mask || "Número de WhatsApp"}
                  style={{ flex: 1, background: "rgba(255,255,255,0.05)", border: `1px solid ${phoneError ? "#ef4444" : "rgba(255,255,255,0.12)"}`, borderRadius: 10, padding: "12px 16px", color: "#fff", fontSize: 15, outline: "none", fontFamily: "inherit" }}
                />
              </div>
              {phoneError && <p style={{ color: "#ef4444", fontSize: 12, marginTop: 5 }}>{phoneError}</p>}
            </div>

            <PrimaryBtn onClick={avancarEtapa1}>Continuar →</PrimaryBtn>
          </div>
        </Card>
      );

      case 1.5: {
        const OptionGrid = ({ cols = 2, options, selected, onSelect }) => (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 10, marginBottom: 28 }}>
            {options.map((opt) => {
              const sel = selected === opt.value;
              return (
                <button key={opt.value} type="button" onClick={() => onSelect(opt.value)}
                  style={{
                    padding: "16px 14px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                    fontSize: 14, fontWeight: sel ? 700 : 500, textAlign: "center",
                    border: sel ? "1.5px solid #22c55e" : "1px solid rgba(255,255,255,0.1)",
                    background: sel ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                    color: sel ? "#22c55e" : "#aaa", transition: "all 0.15s",
                    outline: "none",
                  }}>
                  {opt.label}
                </button>
              );
            })}
          </div>
        );
        return (
          <Card>
            <StepHeader icon="📋" title="Perfil Demográfico" subtitle="Algumas informações rápidas para personalizar sua experiência" />
            <div style={pad}>
              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Sua idade:</p>
              <OptionGrid cols={2} selected={idade} onSelect={setIdade}
                options={[{value:"18-29",label:"18-29 anos"},{value:"30-39",label:"30-39 anos"},{value:"40-49",label:"40-49 anos"},{value:"50+",label:"+ de 50 anos"}]} />

              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Qual seu nível de conhecimento sobre dropshipping?</p>
              <OptionGrid cols={1} selected={conhecimento} onSelect={setConhecimento}
                options={[{value:"Começando agora",label:"Começando agora"},{value:"Já tenho loja mas ainda não vendo",label:"Já tenho loja mas ainda não vendo"},{value:"Já vendo e quero escalar",label:"Já vendo e quero escalar"}]} />

              <p style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>Qual é o seu principal objetivo?</p>
              <OptionGrid cols={1} selected={objetivo} onSelect={setObjetivo}
                options={[{value:"Fazer uma Renda Extra",label:"Fazer uma Renda Extra"},{value:"Sair do CLT e me dedicar 100% para isso",label:"Sair do CLT e me dedicar 100% para isso"},{value:"Ganhar muito dinheiro e conquistar minha liberdade financeira",label:"Ganhar muito dinheiro e conquistar minha liberdade financeira"}]} />

              <div style={{ display: "flex", gap: 10 }}>
                <GhostBtn onClick={() => setEtapa(1)}>← Voltar</GhostBtn>
                <PrimaryBtn onClick={avancarEtapa15} disabled={!idade || !conhecimento || !objetivo}>Continuar →</PrimaryBtn>
              </div>
            </div>
          </Card>
        );
      }

      case 2: return (
        <Card>
          <StepHeader icon="🎯" title="Seu Perfil de Vida" subtitle="Quanto mais honesto, melhor será a análise" />
          <div style={pad}>
            <DropSelect label="Status amoroso" value={statusAmoroso} onChange={setStatusAmoroso}
              options={[{value:"Solteiro(a)",label:"Solteiro(a)"},{value:"Namorando",label:"Namorando"},{value:"Casado(a)",label:"Casado(a)"},{value:"Divorciado(a)",label:"Divorciado(a)"}]} />
            <DropSelect label="Você tem filhos?" value={filhos} onChange={setFilhos}
              options={[{value:"Não tenho",label:"Não tenho filhos"},{value:"1 filho",label:"1 filho"},{value:"2 filhos",label:"2 filhos"},{value:"3 ou mais",label:"3 ou mais filhos"}]} />
            <DropSelect label="Você tem pets?" value={pets} onChange={setPets}
              options={[{value:"Não tenho",label:"Não tenho pets"},{value:"Cachorro",label:"Cachorro(s)"},{value:"Gato",label:"Gato(s)"},{value:"Outros",label:"Outros animais"}]} />
            <DropSelect label="Pratica exercícios físicos?" value={exercicios} onChange={setExercicios}
              options={[{value:"Não pratico",label:"Não pratico"},{value:"Às vezes",label:"Às vezes"},{value:"Regularmente",label:"Regularmente"},{value:"Atleta",label:"Sou muito dedicado(a)"}]} />
            <TextArea label="O que mais curte nas redes sociais?" value={interesses} onChange={setInteresses} placeholder="Ex: decoração, culinária, moda, fitness..." />

            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <label style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Nichos com que mais se identifica</label>
                <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 10px", borderRadius: 20 }}>{nichosIdent.length}/4</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {NICHOS_OPCOES.map((n) => {
                  const sel = nichosIdent.includes(n);
                  return (
                    <button key={n} type="button" onClick={() => toggleNicho(n)}
                      style={{
                        padding: "10px 16px", borderRadius: 50, fontSize: 13, fontWeight: 600,
                        cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                        border: sel ? "1.5px solid #22c55e" : "1.5px solid rgba(255,255,255,0.15)",
                        background: sel ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                        color: sel ? "#22c55e" : "#ccc",
                        boxShadow: sel ? "0 0 0 3px rgba(34,197,94,0.12)" : "none",
                      }}>
                      {n}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <GhostBtn onClick={() => setEtapa(1.5)}>← Voltar</GhostBtn>
              <PrimaryBtn onClick={avancarEtapa2} disabled={loading}>
                {loading ? <Loader text="Analisando perfil..." /> : "Gerar minha análise →"}
              </PrimaryBtn>
            </div>
          </div>
        </Card>
      );

      case 3: return (
        <Card>
          <StepHeader icon="✨" title="Nichos Recomendados" subtitle="Selecione o nicho que mais te atrai" />
          <div style={pad}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {nichos.map((nicho, i) => {
                const sel = selectedNiche === nicho;
                return (
                  <div key={i} onClick={() => { setSelectedNiche(nicho); setExpandedIdx(expandedIdx === i ? null : i); }}
                    style={{ border: `1px solid ${sel ? "#22c55e" : "#222"}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer", transition: "all 0.15s", background: sel ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {nicho.is_principal && <span style={{ fontSize: 10, background: "#22c55e", color: "#000", padding: "2px 8px", borderRadius: 20, fontWeight: 800 }}>⭐ RECOMENDADO</span>}
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>{nicho.nome}</span>
                      </div>
                      <span style={{ color: "#555", fontSize: 12, flexShrink: 0 }}>{expandedIdx === i ? "▲" : "▼"}</span>
                    </div>
                    {expandedIdx === i && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                        <p style={{ color: "#888", fontSize: 13, marginBottom: 8, lineHeight: 1.5 }}>{nicho.justificativa}</p>
                        <p style={{ color: "#22c55e", fontSize: 13 }}>🛍️ <strong>Exemplo:</strong> {nicho.exemplo_produto}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <GhostBtn onClick={() => setEtapa(2)}>← Voltar</GhostBtn>
              <PrimaryBtn onClick={avancarEtapa3} disabled={!selectedNiche || loading}>
                {loading ? <Loader text="Gerando coleções..." /> : "Ver Coleções e Produtos →"}
              </PrimaryBtn>
            </div>
          </div>
        </Card>
      );

      case 3.5: return (
        <Card>
          <StepHeader icon="🛍️" title="Coleções e Produtos" subtitle={selectedNiche?.nome} />
          <div style={pad}>
            {colecoes.map((col, i) => (
              <div key={i} style={{ marginBottom: 14, background: "rgba(99,102,241,0.05)", border: "1px solid rgba(99,102,241,0.14)", borderRadius: 14, padding: "16px 18px" }}>
                <h3 style={{ color: "#a78bfa", fontWeight: 700, fontSize: 14, marginBottom: 10 }}>{col.nome}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {col.produtos.map((prod, j) => (
                    <div key={j} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: "10px 14px" }}>
                      <p style={{ color: "#e2e8f0", fontWeight: 600, fontSize: 13 }}>{prod.nome}</p>
                      <p style={{ color: "#777", fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>{prod.descricao}</p>
                      <p style={{ color: "#818cf8", fontSize: 11, marginTop: 4 }}>💡 {prod.motivo_apelo}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ display: "flex", gap: 10 }}>
              <GhostBtn onClick={() => { setEtapa(3); setColecoes([]); }}>← Voltar</GhostBtn>
              <PrimaryBtn onClick={() => { upsertLead({ etapa_concluida: "3.5 - Coleções" }); setEtapa(4); }}>Escolher Nome da Loja →</PrimaryBtn>
            </div>
          </div>
        </Card>
      );

      case 4: return (
        <Card>
          <StepHeader icon="🏷️" title="Nome da Sua Loja" subtitle="Use uma sugestão ou crie o seu próprio" />
          <div style={pad}>
            {nomesLoja.length > 0 && (
              <div style={{ marginBottom: 20 }}>
                <p style={{ color: "#555", fontSize: 11, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Sugestões da IA</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {nomesLoja.map((item, i) => (
                    <button key={i} type="button" onClick={() => { setNomeLoja(item.nome); setDominioStatus(null); }}
                      style={{ padding: "12px 14px", borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s", border: nomeLoja === item.nome ? "1px solid #22c55e" : "1px solid #222", background: nomeLoja === item.nome ? "rgba(34,197,94,0.07)" : "rgba(255,255,255,0.03)", color: "#fff" }}>
                      <p style={{ fontWeight: 700, fontSize: 14 }}>{item.nome}</p>
                      <p style={{ fontSize: 11, color: "#555", marginTop: 3, lineHeight: 1.4 }}>{item.explicacao}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <TextInput label="Nome escolhido (ou escreva o seu)" value={nomeLoja} onChange={(v) => { setNomeLoja(v); setDominioStatus(null); }} placeholder="Ex: Velari, NordenCasa..." />
            <PrimaryBtn onClick={verificarNome} disabled={loading || !nomeLoja.trim()} style={{ marginBottom: 16 }}>
              {loading ? <Loader text="Verificando..." /> : "Verificar Nome"}
            </PrimaryBtn>

            {dominioStatus && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {dominioStatus.pontos_positivos?.length > 0 && (
                  <div style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 12, padding: 14 }}>
                    <p style={{ color: "#22c55e", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>✅ Pontos Positivos</p>
                    {dominioStatus.pontos_positivos.map((p, i) => <p key={i} style={{ color: "#888", fontSize: 13, marginBottom: 3 }}>• {p}</p>)}
                  </div>
                )}
                {dominioStatus.pontos_atencao?.length > 0 && (
                  <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.15)", borderRadius: 12, padding: 14 }}>
                    <p style={{ color: "#eab308", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>⚠️ Pontos de Atenção</p>
                    {dominioStatus.pontos_atencao.map((p, i) => <p key={i} style={{ color: "#888", fontSize: 13, marginBottom: 3 }}>• {p}</p>)}
                  </div>
                )}
                {dominioStatus.conflitos?.length > 0 && (
                  <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 12, padding: 14 }}>
                    <p style={{ color: "#ef4444", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>🔴 Conflitos</p>
                    {dominioStatus.conflitos.map((c, i) => (
                      <div key={i} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", marginBottom: 6 }}>
                        <p style={{ color: "#ddd", fontWeight: 600, fontSize: 13 }}>{c.nome}</p>
                        <p style={{ color: "#666", fontSize: 11 }}>{c.tipo} — {c.descricao}</p>
                      </div>
                    ))}
                  </div>
                )}
                {dominioStatus.sugestoes_alternativas?.length > 0 && (
                  <div style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 12, padding: 14 }}>
                    <p style={{ color: "#818cf8", fontWeight: 700, marginBottom: 8, fontSize: 13 }}>💡 Alternativas</p>
                    {dominioStatus.sugestoes_alternativas.map((s, i) => (
                      <button key={i} type="button" onClick={() => { setNomeLoja(s.nome); setDominioStatus(null); }}
                        style={{ width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid #222", borderRadius: 8, padding: "10px 12px", marginBottom: 6, cursor: "pointer", textAlign: "left", color: "#fff", fontFamily: "inherit" }}>
                        <p style={{ fontWeight: 700, fontSize: 13 }}>{s.nome}</p>
                        <p style={{ fontSize: 11, color: "#666" }}>{s.motivo}</p>
                      </button>
                    ))}
                  </div>
                )}
                <p style={{ color: "#444", fontSize: 11, padding: "8px 12px", background: "rgba(255,255,255,0.02)", borderRadius: 8 }}>
                  ⚠️ Confirme disponibilidade em sites de registro (.com.br, .com) antes de decidir.
                </p>
                <PrimaryBtn onClick={avancarEtapa5} disabled={loading}>
                  {loading ? <Loader text="Gerando paleta..." /> : "Definir Cores da Loja →"}
                </PrimaryBtn>
              </div>
            )}

            {!dominioStatus && (
              <GhostBtn onClick={() => setEtapa(3.5)} style={{ width: "100%", marginTop: 4 }}>← Voltar</GhostBtn>
            )}
          </div>
        </Card>
      );

      case 5: return (
        <Card>
          <StepHeader icon="🎨" title="Paleta de Cores" subtitle="Sugestão personalizada para o seu nicho" />
          <div style={pad}>
            {(paletaCores?.combinacoes || []).map((combo, i) => {
              const cp = combo?.cor_primaria?.hex || "#4B5563";
              const cs = combo?.cor_secundaria?.hex || "#FFFFFF";
              return (
                <div key={i} style={{ background: "rgba(255,255,255,0.02)", border: "1px solid #1a1a1a", borderRadius: 14, padding: 18, marginBottom: 14 }}>
                  <p style={{ color: "#444", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Opção {i + 1}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[{ label: "Cor Principal (fundo)", cor: combo.cor_primaria, hex: cp }, { label: "Cor Secundária (texto)", cor: combo.cor_secundaria, hex: cs }].map((item) => (
                      <div key={item.label}>
                        <p style={{ color: "#555", fontSize: 11, marginBottom: 6 }}>{item.label}</p>
                        <div style={{ height: 56, borderRadius: 8, background: item.hex, border: "1px solid #2a2a2a", marginBottom: 8 }} />
                        <p style={{ color: "#ccc", fontSize: 13, fontWeight: 600 }}>{item.cor?.nome}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <code style={{ background: "#111", padding: "3px 8px", borderRadius: 5, fontSize: 12, color: "#777", border: "1px solid #222" }}>{item.hex}</code>
                          <button type="button" onClick={() => copiar(item.hex)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14 }}>📋</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: cp, borderRadius: 8, padding: "10px 16px", textAlign: "center", marginBottom: 10 }}>
                    <p style={{ color: cs, fontWeight: 600, fontSize: 14 }}>Prévia: texto sobre o fundo</p>
                  </div>
                  <p style={{ color: "#555", fontSize: 12, lineHeight: 1.5 }}>💬 {combo.significado}</p>
                </div>
              );
            })}
            <PrimaryBtn onClick={finalizar}>Ver Resumo Final →</PrimaryBtn>
          </div>
        </Card>
      );

      case 6: return (
        <Card style={{ background: "linear-gradient(135deg, rgba(5,46,22,0.97), rgba(15,52,30,0.97))", border: "2px solid rgba(34,197,94,0.3)" }}>
          <div style={{ padding: "48px 36px 44px", textAlign: "center" }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Análise Completa!</h2>
            <p style={{ color: "#86efac", fontSize: 14, lineHeight: 1.7, maxWidth: 380, margin: "0 auto 20px" }}>
              Seu guia está pronto. Baixe o PDF com todos os detalhes do seu nicho, nome de loja e identidade visual.
            </p>

            {/* Resumo */}
            <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 24, textAlign: "left" }}>
              <p style={{ color: "#22c55e", fontWeight: 800, marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>📋 Seu Resumo</p>
              {[["🎯 Nicho", selectedNiche?.nome], ["🏷️ Nome da loja", nomeLoja], ["🎨 Paleta de cores", "Definida ✓"], ["🛍️ Coleções", `${colecoes?.length || 0} coleções geradas`]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6, marginBottom: 6 }}>
                  <span style={{ color: "#6ee7b7", fontSize: 12 }}>{k}</span>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, maxWidth: "55%", textAlign: "right" }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Botão PDF */}
            <button type="button" onClick={gerarPDF}
              style={{ width: "100%", border: "none", borderRadius: 12, padding: "16px 24px", fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#000", fontFamily: "inherit", marginBottom: 12, boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
              ⬇ Baixar PDF Completo
            </button>

            <p style={{ color: "#4ade80", fontSize: 12, opacity: 0.7 }}>
              Nossa equipe pode te contatar no WhatsApp para os próximos passos! 🚀
            </p>
          </div>
        </Card>
      );

      default: return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin { to { transform: rotate(360deg); } }
        input::placeholder, textarea::placeholder { color: #3a3a3a; }
        select option { background: #111; color: #fff; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 3px; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#080808", padding: "28px 14px 60px", fontFamily: "'Inter', sans-serif" }}>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
        {showAdmin && <AdminPanel leads={leads} onClose={() => setShowAdmin(false)} />}

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-block", background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: 20, padding: "5px 14px", marginBottom: 10 }}>
            <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: 1.2 }}>✦ Guia de Nichos</span>
          </div>
          <h1 onClick={handleTitleClick} style={{ color: "#fff", fontSize: 28, fontWeight: 900, letterSpacing: -0.5, cursor: "default", userSelect: "none" }}>
            Descubra seu <span style={{ color: "#22c55e" }}>Nicho Ideal</span>
          </h1>
          <p style={{ color: "#3a3a3a", fontSize: 13, marginTop: 6 }}>Análise personalizada com inteligência artificial</p>
        </div>

        <ProgressBar etapa={etapa} />

        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          {renderStep()}
        </div>

        <div style={{ textAlign: "center", marginTop: 36, color: "#2a2a2a", fontSize: 11 }}>
          {leads.length > 0 && <span style={{ color: "#333" }}>{leads.length} lead{leads.length > 1 ? "s" : ""} capturado{leads.length > 1 ? "s" : ""} • </span>}
          Clique 3× no título para acessar o painel de leads
        </div>
      </div>
    </>
  );
}
