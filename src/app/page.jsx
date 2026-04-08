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

// Os 6 nichos principais com emoji, label e chave interna
const NICHOS_PRINCIPAIS = [
  { key: "Genérico",        label: "🛒 Genérico",         emoji: "🛒" },
  { key: "Casa e Cozinha",  label: "🏠 Casa e Cozinha",   emoji: "🏠" },
  { key: "Infantil",        label: "👶 Infantil",          emoji: "👶" },
  { key: "Pet",             label: "🐾 Pet",               emoji: "🐾" },
  { key: "Eletrônico",      label: "📱 Eletrônico",        emoji: "📱" },
  { key: "Saúde e Beleza",  label: "✨ Saúde e Beleza",   emoji: "✨" },
];

// Mapeamento dos 18 nichos originais para os 6 principais (para o scoring)
const NICHO_PARA_PRINCIPAL = {
  "🏠 Casa e Decoração":        "Casa e Cozinha",
  "🍳 Cozinha e Utensílios":    "Casa e Cozinha",
  "🔨 Ferramentas e Construção":"Genérico",
  "👗 Moda Feminina":           "Saúde e Beleza",
  "👔 Moda Masculina":          "Genérico",
  "💍 Joias e Acessórios":      "Saúde e Beleza",
  "✨ Beleza e Cuidados":       "Saúde e Beleza",
  "💊 Saúde e Bem-estar":       "Saúde e Beleza",
  "🏋️ Fitness":                 "Saúde e Beleza",
  "🐾 Pet":                     "Pet",
  "👶 Bebês e Infantil":        "Infantil",
  "🎁 Presentes e Gadgets":     "Genérico",
  "📱 Eletrônicos":             "Eletrônico",
  "🎮 Games e Acessórios":      "Eletrônico",
  "📚 Livros e Papelaria":      "Genérico",
  "🚗 Automotivo":              "Genérico",
  "⚽ Esportes":                "Saúde e Beleza",
  "🌿 Viagem e Outdoor":        "Genérico",
};


// ─── Base de Nomes de Loja ────────────────────────────────────────────────────
const NOMES_BASE = {
  "Genérico": [
    "Velari","Nexora","Lumiva","Krath","Zyntex","Bravio","Fluxe","Orbia","Trevo","Quria",
    "Mavex","Solari","Driva","Praxis","Nuvelo","Veltrix","Zenvy","Orvion","Lummix","Vantix",
    "Zorix","Elora Shop","Bravon","Novara","Trivon","Axion Store","Vexon","Omnix","Zafira Shop",
    "Valora","Xentra","Lunex","Evora Market","Klyra","Verdan","Lumera","Zorin","Tavira","Monvix",
    "Elvera","Clyra","Ravion","Norix","Selkar","Vantara","Ornix","Delvora","Zyraen","Nexval",
    "Alvion","Corvix","Livara","Brenza","Omvera",
  ],
  "Casa e Cozinha": [
    "NordenCasa","Casaviva","Vivlar","Domicio","Aconchego","Arrumar","Casart","Lereno","Ninho",
    "Habitat","Organizo","Morada","Conforto","Larium","Casarão","Pracasa","Vivenzo","Dominus",
    "Arredo","Ornare","CasaViva","Larix","CozyHaus","Domora","CasaBella Store","Vivenda Shop",
    "Homefy Brasil","Casa Nobre","UrbanLar","Casa Lumi","Lar Essence","Domus Store","Casa Primeira",
    "VivaCasa Store","CasaZen","Habitare","Domari","Almare","Vivaro","Serena Casa","Nivara Home",
    "Casavon","Morada Viva","Brisara","Ateliar","Dovika Home","Harmoni Lar","Levora Casa",
    "Ornama","Essenza Home","Casalume","Belmor",
  ],
  "Infantil": [
    "Mimmo","Pequenus","Broto","Crescer","Infantio","Nininho","Fofolete","Pimpolho","Crescendo",
    "Mimos","Infantia","MiniMundo","BabyNest","MiniVille","Bebê Encanto","TinyJoy","Mundo do Bebê",
    "MiniLove Store","BabyLume","Doce Infância","Kidora","Pequeno Reino","BabyAura","Encanto Kids",
    "MiniDreams","Bebê Feliz Store","Lunini","Mimora","Ninaro","Bellupi","Doce Ninho","Pequenna",
    "Nuvini","Minora","Bambeli","Encanti","Meluki","Pipori","Ninara","Tutiê","Fabulim","Leleva",
  ],
  "Pet": [
    "Patinhas","Focinhos","Peludos","Latidos","Auau","Miado","Petizo","Bichano","Petvida",
    "Zoomart","Petcare","Focinho","Animais","PetVibe","MundoPet","PetLovers Shop","AmigoPet",
    "PetEssence","Patinhas Store","PetClub Brasil","PetAura","Universo Pet","PetJoy","PetPrime",
    "Dog & Cat Store","PetVille","PetZen","MeuPet Shop","PetHouse","Patutti","Zorpet","Bichara",
    "Petuni","Auvri","Mivika","Pattly","Rabito","Focara","Laturi Pet","Bichito","Cãolume",
    "Petlune","Miocca","Uivara","Patavie",
  ],
  "Eletrônico": [
    "Techvibe","Gadgetix","Pixelmart","Voltex","Digitalix","Techzone","Neontech","Bytemart",
    "Plugado","Conecta","Techflow","Gridtech","Nextech","Digistore","Techfy","NexTech Store",
    "TechZone Brasil","Digital Hub","Smartix","TechNova","Eletronix","FutureTech","TechPrime",
    "InovaTech Store","TechWave","GearUp Store","Voltix","HyperTech","TechCore","MaxTech",
    "Vortek","Nexvolt","Cytron","Voltara","Zentryx","Tekaro","Lumitek","Axtron","Novatek",
    "Trionyx","Veltek","Kronix","Zetron","Omnitek","Valtryx","Synkar",
  ],
  "Saúde e Beleza": [
    "Glowup","Radiante","Brilhar","Vivabem","Saudare","Belezura","Florescer","Renovar","Vitalix",
    "Pureza","Essenzia","Naturalis","Harmonia","Equilibra","Biozen","Vitalife","Serenare","Luminare",
    "Belleza Store","Aura Beauty","VivaSkin","GlowUp Store","Essence Beauty","DermaLux","Beautyfy",
    "Pele & Vida","SkinAura","Beauty Prime","Glow Essence","VitaBella","SkinLab Store","Pure Beauty",
    "Lumina Beauty","BelleAura","Luméa","Belvra","Vitaria","Dermeva","Alunna Beauty","Serenitá",
    "Vivelle","Aurena","Belthéa","Luminé","Ravela","Dermora","Celinea","Velune","Pureva",
  ],
};

const sugerirNomes = (nicho) => {
  // Pega nomes do nicho principal + alguns genéricos
  const doNicho = NOMES_BASE[nicho] || [];
  const genericos = nicho !== "Genérico" ? NOMES_BASE["Genérico"] : [];
  const pool = [...doNicho, ...genericos];
  // Embaralha e retorna 10
  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10).map(nome => ({
    nome,
    explicacao: nicho !== "Genérico" && doNicho.includes(nome)
      ? `Nome criado para o nicho de ${nicho}`
      : "Nome versátil, funciona para múltiplos nichos",
  }));
};

const NICHOS_OPCOES = [
  "🏠 Casa e Decoração","🍳 Cozinha e Utensílios","🔨 Ferramentas e Construção",
  "👗 Moda Feminina","👔 Moda Masculina","💍 Joias e Acessórios",
  "✨ Beleza e Cuidados","💊 Saúde e Bem-estar","🏋️ Fitness",
  "🐾 Pet","👶 Bebês e Infantil","🎁 Presentes e Gadgets",
  "📱 Eletrônicos","🎮 Games e Acessórios","📚 Livros e Papelaria",
  "🚗 Automotivo","⚽ Esportes","🌿 Viagem e Outdoor",
];

// Matriz de pontuação: cada resposta adiciona pontos aos nichos
const calcularNichos = (statusAmoroso, filhos, pets, exercicios, nichosIdent) => {
  const score = { "Genérico": 0, "Casa e Cozinha": 0, "Infantil": 0, "Pet": 0, "Eletrônico": 0, "Saúde e Beleza": 0 };

  // Status amoroso
  if (statusAmoroso === "Solteiro(a)") {
    score["Saúde e Beleza"] += 2; score["Genérico"] += 1;
  } else if (statusAmoroso === "Namorando") {
    score["Saúde e Beleza"] += 1; score["Genérico"] += 2;
  } else if (statusAmoroso === "Casado(a)") {
    score["Casa e Cozinha"] += 2; score["Infantil"] += 1;
  } else if (statusAmoroso === "Divorciado(a)") {
    score["Saúde e Beleza"] += 2;
  }

  // Filhos
  if (filhos === "Não tenho, mas venderia") {
    score["Infantil"] += 2;
  } else if (filhos === "Tenho e venderia") {
    score["Infantil"] += 5; score["Casa e Cozinha"] += 1;
  }

  // Pets
  if (pets === "Não tenho, mas venderia") {
    score["Pet"] += 2;
  } else if (pets === "Tenho e venderia") {
    score["Pet"] += 5;
  }

  // Exercícios
  if (exercicios === "Às vezes") {
    score["Saúde e Beleza"] += 1;
  } else if (exercicios === "Regularmente") {
    score["Saúde e Beleza"] += 3;
  } else if (exercicios === "Atleta") {
    score["Saúde e Beleza"] += 5;
  }

  // Chips clicáveis — peso maior por ser intenção explícita
  // Mapeia os 18 nichos originais para os 6 principais
  nichosIdent.forEach(nicho => {
    const principal = NICHO_PARA_PRINCIPAL[nicho] || "Genérico";
    if (score[principal] !== undefined) score[principal] += 8;
  });

  // Genérico só aparece se não houver pontuação dominante em outro nicho
  // (não recebe ponto base — aparece raramente)

  // Ordena e retorna top 3
  return Object.entries(score)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([key, pts], i) => ({
      nome: key,
      pontuacao: pts,
      is_principal: i === 0,
      justificativa: gerarJustificativa(key, { statusAmoroso, filhos, pets, exercicios }),
      exemplo_produto: exemplosProduto[key],
    }));
};

const gerarJustificativa = (nicho, perfil) => {
  const map = {
    "Genérico": "Ótimo para quem quer começar sem se prender a um único segmento, testando produtos de diversas categorias.",
    "Casa e Cozinha": "Produtos de casa têm alta demanda recorrente e ticket médio atrativo. Ideal para quem quer uma loja estável.",
    "Infantil": "Pais compram com frequência e sem hesitar quando o produto resolve uma dor real. Alta fidelização.",
    "Pet": "Donos de pets gastam com consistência e emoção. Um dos nichos com maior lealdade de cliente.",
    "Eletrônico": "Alta demanda, produtos virais e margens interessantes para quem sabe selecionar bem.",
    "Saúde e Beleza": "Nicho em crescimento constante. Produtos de autocuidado têm altíssimo giro e boa margem.",
  };
  return map[nicho] || "Nicho com boa demanda e potencial de escala.";
};

const exemplosProduto = {
  "Genérico": "Organizadores multifuncionais, gadgets virais",
  "Casa e Cozinha": "Utensílios inovadores, organizadores de gaveta",
  "Infantil": "Brinquedos educativos, itens de segurança para bebê",
  "Pet": "Comedouros automáticos, roupinhas e acessórios",
  "Eletrônico": "Cabos magnéticos, suportes para celular, fones",
  "Saúde e Beleza": "Massageadores, skincare, acessórios fitness",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatBRPhone = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (!digits.length) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
};

const callClaude = async (prompt, maxTokens = 1500) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
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

// ─── Base de Coleções e Produtos ─────────────────────────────────────────────
const COLECOES_BASE = {
  "Casa e Cozinha": [
    {
      "nome": "Decoração e Ambientes",
      "produtos": [
        {
          "nome": "Quadro decorativo com moldura",
          "descricao": "Arte moderna para sala ou quarto",
          "motivo_apelo": "Personalização do lar, presente fácil"
        },
        {
          "nome": "Vaso de cerâmica minimalista",
          "descricao": "Vaso para plantas ou decoração seca",
          "motivo_apelo": "Alta demanda, tendência constante"
        },
        {
          "nome": "Espelho redondo com moldura dourada",
          "descricao": "Espelho decorativo para parede",
          "motivo_apelo": "Viral em redes sociais, alto ticket"
        },
        {
          "nome": "Luminária de mesa com cabo USB",
          "descricao": "Luz ambiente para home office ou quarto",
          "motivo_apelo": "Funcional e decorativo"
        },
        {
          "nome": "Tapete antiderrapante sala/quarto",
          "descricao": "Tapete macio com estampa neutra",
          "motivo_apelo": "Recorrente, boa margem"
        }
      ]
    },
    {
      "nome": "Cozinha e Utensílios",
      "produtos": [
        {
          "nome": "Jogo de facas inox com suporte",
          "descricao": "Kit 5 peças com cabo ergonômico",
          "motivo_apelo": "Essencial na cozinha, presente popular"
        },
        {
          "nome": "Tábua de corte com sulcos",
          "descricao": "Tábua de bambu ou plástico resistente",
          "motivo_apelo": "Alta rotatividade, preço acessível"
        },
        {
          "nome": "Organizador de temperos giratório",
          "descricao": "Suporte para potes de especiarias",
          "motivo_apelo": "Viral no TikTok, resolve problema real"
        },
        {
          "nome": "Formas de silicone para bolo",
          "descricao": "Kit formas antiaderentes coloridas",
          "motivo_apelo": "Pico em datas comemorativas"
        },
        {
          "nome": "Garrafa térmica 1 litro inox",
          "descricao": "Mantém temperatura por 12h",
          "motivo_apelo": "Uso diário, recorrente"
        }
      ]
    },
    {
      "nome": "Cama e Banho",
      "produtos": [
        {
          "nome": "Jogo de cama 300 fios casal",
          "descricao": "Lençol com elástico + fronhas",
          "motivo_apelo": "Compra recorrente, ticket médio alto"
        },
        {
          "nome": "Toalha de banho felpuda premium",
          "descricao": "Toalha 100% algodão absorvente",
          "motivo_apelo": "Recompra constante"
        },
        {
          "nome": "Travesseiro cervical viscoelástico",
          "descricao": "Travesseiro ergonômico para dormir",
          "motivo_apelo": "Apelo de saúde + conforto"
        },
        {
          "nome": "Organizador de banheiro 3 peças",
          "descricao": "Porta sabonete, escova e copo",
          "motivo_apelo": "Barato, fácil de vender em kit"
        },
        {
          "nome": "Aromatizador de ambiente elétrico",
          "descricao": "Difusor ultrassônico com LED",
          "motivo_apelo": "Presente muito pedido"
        }
      ]
    },
    {
      "nome": "Organização da Casa",
      "produtos": [
        {
          "nome": "Caixas organizadoras com tampa",
          "descricao": "Kit caixas empilháveis para armário",
          "motivo_apelo": "Tendência organização, viral"
        },
        {
          "nome": "Cabide de veludo antideslizante",
          "descricao": "Pack 10 cabides slim premium",
          "motivo_apelo": "Compra em quantidade, boa margem"
        },
        {
          "nome": "Organizador de gaveta modular",
          "descricao": "Divisórias ajustáveis para gavetas",
          "motivo_apelo": "Soluciona dor real cotidiana"
        },
        {
          "nome": "Suporte de parede para panelas",
          "descricao": "Rack metálico com ganchos",
          "motivo_apelo": "Organização funcional + estética"
        },
        {
          "nome": "Cesto de roupa dobrável",
          "descricao": "Cesto com tampa e alças",
          "motivo_apelo": "Necessidade básica, recorrente"
        }
      ]
    },
    {
      "nome": "Iluminação e Ambientação",
      "produtos": [
        {
          "nome": "Fita LED RGB 5 metros",
          "descricao": "Fita colorida com controle remoto",
          "motivo_apelo": "Viral, jovens e gamers"
        },
        {
          "nome": "Abajur de tecido com base dourada",
          "descricao": "Luminária de mesa estilo moderno",
          "motivo_apelo": "Decoração fácil, presente seguro"
        },
        {
          "nome": "Vela aromática em pote de vidro",
          "descricao": "Vela perfumada 40h de queima",
          "motivo_apelo": "Presente muito popular, margem alta"
        },
        {
          "nome": "Luminária de parede arandela",
          "descricao": "Arandela moderna para corredor ou quarto",
          "motivo_apelo": "Alto ticket, diferenciado"
        }
      ]
    },
    {
      "nome": "Jardinagem e Plantas",
      "produtos": [
        {
          "nome": "Kit ferramentas de jardinagem mini",
          "descricao": "Pazinha, garfo e regador pequeno",
          "motivo_apelo": "Presente para quem ama plantas"
        },
        {
          "nome": "Regador de inox com bico fino",
          "descricao": "Regador elegante para plantas de interior",
          "motivo_apelo": "Estético, muito fotografado"
        },
        {
          "nome": "Suporte de parede para vasos",
          "descricao": "Suporte metálico para 3 vasos",
          "motivo_apelo": "Tendência jardim vertical"
        },
        {
          "nome": "Terra adubada para vasos 5L",
          "descricao": "Substrato rico para plantas em geral",
          "motivo_apelo": "Consumível, compra recorrente"
        }
      ]
    }
  ],
  "Pet": [
    {
      "nome": "Alimentação e Hidratação",
      "produtos": [
        {
          "nome": "Comedouro automático programável",
          "descricao": "Dispensa ração em horários definidos",
          "motivo_apelo": "Resolve dor real, ticket alto"
        },
        {
          "nome": "Bebedouro fonte circulante",
          "descricao": "Fonte com filtro para cães e gatos",
          "motivo_apelo": "Saúde do pet, muito compartilhado"
        },
        {
          "nome": "Bowl de inox duplo com suporte",
          "descricao": "Comedouro elevado para cães médios/grandes",
          "motivo_apelo": "Saúde postural, presente popular"
        },
        {
          "nome": "Tapete higiênico descartável",
          "descricao": "Pack 30 unidades absorventes",
          "motivo_apelo": "Consumível recorrente"
        }
      ]
    },
    {
      "nome": "Cama e Conforto",
      "produtos": [
        {
          "nome": "Cama pet redonda pelúcia",
          "descricao": "Cama macia lavável tamanho M/G",
          "motivo_apelo": "Dono compra com emoção"
        },
        {
          "nome": "Manta quentinha para pet",
          "descricao": "Cobertor soft para cachorro ou gato",
          "motivo_apelo": "Inverno = pico de vendas"
        },
        {
          "nome": "Casinha de madeira pintada",
          "descricao": "Casinha com telhado decorativo",
          "motivo_apelo": "Alto ticket, presente especial"
        },
        {
          "nome": "Almofada terapêutica para pet",
          "descricao": "Almofada com efeito calmante",
          "motivo_apelo": "Nicho de bem-estar animal em alta"
        }
      ]
    },
    {
      "nome": "Higiene e Banho",
      "produtos": [
        {
          "nome": "Luva de escovação silicone",
          "descricao": "Remove pelos soltos no banho",
          "motivo_apelo": "Barato, resolve problema real"
        },
        {
          "nome": "Shampoo seco para pets",
          "descricao": "Limpeza sem água entre banhos",
          "motivo_apelo": "Praticidade, recorrente"
        },
        {
          "nome": "Kit tesoura arredondada grooming",
          "descricao": "Tesoura segura para tosa em casa",
          "motivo_apelo": "Economia na tosa profissional"
        },
        {
          "nome": "Toalha de microfibra para pet",
          "descricao": "Toalha absorvente tamanho G",
          "motivo_apelo": "Necessidade pós-banho"
        }
      ]
    },
    {
      "nome": "Passeio e Acessórios",
      "produtos": [
        {
          "nome": "Coleira regulável com guia retrátil",
          "descricao": "Guia 5m com trava de segurança",
          "motivo_apelo": "Essencial, boa margem"
        },
        {
          "nome": "Peitoral ergonômico anti-puxão",
          "descricao": "Peitoral acolchoado com fivelas",
          "motivo_apelo": "Tendência saúde postural animal"
        },
        {
          "nome": "Bolsa de transporte para pets",
          "descricao": "Bag para pets até 8kg",
          "motivo_apelo": "Viagem e transporte, alto ticket"
        },
        {
          "nome": "Sapato protetor para cães",
          "descricao": "Kit 4 sapatinhos antiderrapantes",
          "motivo_apelo": "Viral, engajamento alto nas redes"
        },
        {
          "nome": "Mochila bolha transparente",
          "descricao": "Mochila com janela para gatos",
          "motivo_apelo": "Muito viral, ticket alto"
        }
      ]
    },
    {
      "nome": "Brinquedos e Entretenimento",
      "produtos": [
        {
          "nome": "Brinquedo interativo recheável",
          "descricao": "Kong ou similar para ração/petisco",
          "motivo_apelo": "Recomendado por veterinários"
        },
        {
          "nome": "Arranhador para gatos com sisal",
          "descricao": "Torre multinível com brinquedo",
          "motivo_apelo": "Necessidade real para gatos"
        },
        {
          "nome": "Bola de borracha maciça",
          "descricao": "Bola resistente para cães de todos os portes",
          "motivo_apelo": "Barato, reposição frequente"
        },
        {
          "nome": "Laser interativo automático",
          "descricao": "Ponteiro laser giratório para gatos",
          "motivo_apelo": "Presente divertido, viral"
        }
      ]
    }
  ],
  "Infantil": [
    {
      "nome": "Banho e Cuidados do Bebê",
      "produtos": [
        {
          "nome": "Banheira dobrável com suporte",
          "descricao": "Banheira ergonômica 0-12 meses",
          "motivo_apelo": "Necessidade essencial, presente chá de bebê"
        },
        {
          "nome": "Kit higiene bebê 6 peças",
          "descricao": "Escova, pente, tesoura, termômetro",
          "motivo_apelo": "Kit presente perfeito"
        },
        {
          "nome": "Toalha com capuz bordada",
          "descricao": "Toalha felpuda 100% algodão",
          "motivo_apelo": "Presente clássico chá de bebê"
        },
        {
          "nome": "Hidratante corporal hipoalergênico",
          "descricao": "Loção suave para pele do bebê",
          "motivo_apelo": "Consumível recorrente"
        }
      ]
    },
    {
      "nome": "Brinquedos e Desenvolvimento",
      "produtos": [
        {
          "nome": "Tapete de atividades com arco",
          "descricao": "Tapete educativo 0-12 meses",
          "motivo_apelo": "Estimulação sensorial, presente chá"
        },
        {
          "nome": "Blocos de montar grandes",
          "descricao": "Lego duplo compatível 50 peças",
          "motivo_apelo": "Clássico, recompra constante"
        },
        {
          "nome": "Carrinho de boneca dobrável",
          "descricao": "Carrinho para bonecas até 50cm",
          "motivo_apelo": "Presente favorito meninas 2-5 anos"
        },
        {
          "nome": "Pista de carrinhos com looping",
          "descricao": "Pista flexível com 2 carros",
          "motivo_apelo": "Presente favorito meninos 3-7 anos"
        },
        {
          "nome": "Quebra-cabeça educativo em madeira",
          "descricao": "Formas geométricas e animais",
          "motivo_apelo": "Desenvolvimento cognitivo, preferido por pais"
        }
      ]
    },
    {
      "nome": "Berçário e Sono",
      "produtos": [
        {
          "nome": "Móbile musical para berço",
          "descricao": "Móbile com projetor de estrelas",
          "motivo_apelo": "Presente chá de bebê top 1"
        },
        {
          "nome": "Saco de dormir bebê 0-6m",
          "descricao": "Manta saco quentinha com zíper",
          "motivo_apelo": "Segurança no sono, demanda constante"
        },
        {
          "nome": "Monitor de bebê com câmera",
          "descricao": "Babá eletrônica com visão noturna",
          "motivo_apelo": "Alto ticket, presente de chá premium"
        },
        {
          "nome": "Travesseiro anti-refluxo",
          "descricao": "Almofada posicionadora para bebê",
          "motivo_apelo": "Dor real dos pais, vende muito"
        }
      ]
    },
    {
      "nome": "Segurança do Bebê",
      "produtos": [
        {
          "nome": "Grade proteção escada/porta",
          "descricao": "Portão retrátil de segurança",
          "motivo_apelo": "Necessidade real, sem substituto"
        },
        {
          "nome": "Protetor de quina de mesa",
          "descricao": "Kit 8 protetores de espuma",
          "motivo_apelo": "Barato, pack aumenta ticket"
        },
        {
          "nome": "Trava de segurança para armário",
          "descricao": "Kit 12 travas magnéticas",
          "motivo_apelo": "Preocupação de todo pai/mãe"
        },
        {
          "nome": "Assento de banho para bebê",
          "descricao": "Cadeirinha com ventosas para banheiro",
          "motivo_apelo": "Segurança + praticidade"
        }
      ]
    },
    {
      "nome": "Brinquedos e Hobbies Infantis",
      "produtos": [
        {
          "nome": "Kit pintura e desenho infantil",
          "descricao": "Tintas laváveis + pincel + avental",
          "motivo_apelo": "Criatividade, presente escolar"
        },
        {
          "nome": "Massinha de modelar 12 cores",
          "descricao": "Argila não tóxica com moldes",
          "motivo_apelo": "Clássico, reposição frequente"
        },
        {
          "nome": "Slime kit faça você mesmo",
          "descricao": "Kit glitter + cola + borax + potes",
          "motivo_apelo": "Viral entre crianças 6-12 anos"
        },
        {
          "nome": "Telescópio infantil educativo",
          "descricao": "Telescópio 70mm para crianças",
          "motivo_apelo": "Ciência e curiosidade, presente diferenciado"
        }
      ]
    }
  ],
  "Saúde e Beleza": [
    {
      "nome": "Cuidados com a Pele",
      "produtos": [
        {
          "nome": "Sérum vitamina C 30ml",
          "descricao": "Sérum clareador com ácido hialurônico",
          "motivo_apelo": "Skincare em alta, recompra frequente"
        },
        {
          "nome": "Protetor solar FPS 50 facial",
          "descricao": "Protetor oil-free toque seco",
          "motivo_apelo": "Uso diário obrigatório, recorrente"
        },
        {
          "nome": "Máscara facial de argila",
          "descricao": "Máscara purificante para poros",
          "motivo_apelo": "Self-care, presente popular"
        },
        {
          "nome": "Rolo de quartzo rosa facial",
          "descricao": "Massageador facial anti-inchaço",
          "motivo_apelo": "Viral no TikTok, margem alta"
        },
        {
          "nome": "Esfoliante corporal açúcar",
          "descricao": "Esfoliante suavizante para todo corpo",
          "motivo_apelo": "Skincare corporal em crescimento"
        }
      ]
    },
    {
      "nome": "Maquiagem",
      "produtos": [
        {
          "nome": "Paleta de sombras 18 cores",
          "descricao": "Tons neutros e coloridos matte/shimmer",
          "motivo_apelo": "Alto valor percebido, presente fácil"
        },
        {
          "nome": "Base líquida cobertura média",
          "descricao": "Base longa duração com FPS 15",
          "motivo_apelo": "Produto básico, recompra certa"
        },
        {
          "nome": "Kit pincéis maquiagem 12 peças",
          "descricao": "Pincéis profissionais em estojo",
          "motivo_apelo": "Presente popular, durável"
        },
        {
          "nome": "Máscara de cílios volumizadora",
          "descricao": "Rímel preto à prova d'água",
          "motivo_apelo": "Consumível diário, alta rotatividade"
        }
      ]
    },
    {
      "nome": "Cuidados com o Cabelo",
      "produtos": [
        {
          "nome": "Máscara de hidratação profunda",
          "descricao": "Tratamento 500g para cabelos danificados",
          "motivo_apelo": "Recompra mensal garantida"
        },
        {
          "nome": "Escova elétrica secadora 2 em 1",
          "descricao": "Brush rotativa com íon de cerâmica",
          "motivo_apelo": "Alto ticket, muito desejada"
        },
        {
          "nome": "Óleo de argan marroquino",
          "descricao": "Finalizador 60ml para todos os tipos",
          "motivo_apelo": "Produto cult, margem excelente"
        },
        {
          "nome": "Difusor para secador cachos",
          "descricao": "Bocal difusor universal para cachos",
          "motivo_apelo": "Nicho cachos em explosão"
        },
        {
          "nome": "Chapinha titânio profissional",
          "descricao": "Prancha 230°C com display digital",
          "motivo_apelo": "Alto ticket, presente premium"
        }
      ]
    },
    {
      "nome": "Perfumes e Fragrâncias",
      "produtos": [
        {
          "nome": "Perfume árabe concentrado 10ml",
          "descricao": "Óleo perfumado de longa duração",
          "motivo_apelo": "Alta margem, muito compartilhado"
        },
        {
          "nome": "Home spray ambiente 200ml",
          "descricao": "Aromatizador para tecidos e ambientes",
          "motivo_apelo": "Presente seguro, recompra"
        },
        {
          "nome": "Difusor de varetas premium",
          "descricao": "Kit com óleo essencial + 8 varetas",
          "motivo_apelo": "Decoração + aroma, alto percebido"
        }
      ]
    },
    {
      "nome": "Suplementos e Saúde",
      "produtos": [
        {
          "nome": "Colágeno hidrolisado em pó",
          "descricao": "Colágeno tipo 1 e 3, 300g",
          "motivo_apelo": "Beleza de dentro, demanda explosiva"
        },
        {
          "nome": "Vitamina C efervescente",
          "descricao": "Imunidade, caixa 10 tubos",
          "motivo_apelo": "Consumível recorrente, presente prático"
        },
        {
          "nome": "Whey protein 900g",
          "descricao": "Proteína concentrada sabor chocolate",
          "motivo_apelo": "Fitness em alta, recompra mensal"
        },
        {
          "nome": "Termogênico em cápsulas",
          "descricao": "Cafeína + extrato verde 60 cápsulas",
          "motivo_apelo": "Emagrecimento sempre em alta"
        }
      ]
    },
    {
      "nome": "Esportes e Lazer",
      "produtos": [
        {
          "nome": "Colchonete yoga antiderrapante",
          "descricao": "Tapete 6mm com alça de transporte",
          "motivo_apelo": "Yoga e pilates em crescimento"
        },
        {
          "nome": "Garrafa squeeze 700ml com marcação",
          "descricao": "Squeeze motivacional com horários",
          "motivo_apelo": "Viral, presente prático"
        },
        {
          "nome": "Corda de pular speed jump",
          "descricao": "Corda com rolamento e alça ergonômica",
          "motivo_apelo": "CrossFit popular, barato"
        },
        {
          "nome": "Faixa elástica resistida kit 5",
          "descricao": "Elásticos de resistência variada",
          "motivo_apelo": "Treino em casa, pós-pandemia"
        },
        {
          "nome": "Luva de academia couro sintético",
          "descricao": "Luva com proteção de pulso",
          "motivo_apelo": "Acessório essencial musculação"
        }
      ]
    },
    {
      "nome": "Cuidados Masculinos",
      "produtos": [
        {
          "nome": "Kit barba completo 5 peças",
          "descricao": "Pente, tesoura, cera, óleo e escova",
          "motivo_apelo": "Presente masculino certeiro"
        },
        {
          "nome": "Aparador de pelos corporal",
          "descricao": "Depilador à prova d'água USB",
          "motivo_apelo": "Higiene masculina em alta"
        },
        {
          "nome": "Hidratante facial masculino FPS 30",
          "descricao": "Creme leve sem oleosidade",
          "motivo_apelo": "Skincare masculino explodindo"
        },
        {
          "nome": "Perfume masculino nacional 100ml",
          "descricao": "Eau de toilette com notas amadeiradas",
          "motivo_apelo": "Presente masculino popular"
        }
      ]
    }
  ],
  "Eletrônico": [
    {
      "nome": "Celulares e Acessórios",
      "produtos": [
        {
          "nome": "Cabo magnético 3 em 1 LED",
          "descricao": "USB-C, Lightning e micro USB, 1.2m",
          "motivo_apelo": "Viral, barato, compra compulsiva"
        },
        {
          "nome": "Capinha com MagSafe para iPhone",
          "descricao": "Case transparente com anel magnético",
          "motivo_apelo": "Alta demanda iPhone, margem boa"
        },
        {
          "nome": "Suporte veicular magnético",
          "descricao": "Suporte para painel com imã forte",
          "motivo_apelo": "Necessidade real motoristas"
        },
        {
          "nome": "Película de vidro temperado 9H",
          "descricao": "Kit 2 películas com aplicador",
          "motivo_apelo": "Reposição frequente, barato"
        },
        {
          "nome": "Carregador portátil 10000mAh",
          "descricao": "Power bank slim com 2 USB + USB-C",
          "motivo_apelo": "Presente prático sempre pedido"
        }
      ]
    },
    {
      "nome": "Áudio e Entretenimento",
      "produtos": [
        {
          "nome": "Fone Bluetooth TWS sem fio",
          "descricao": "Earbuds com cancelamento de ruído",
          "motivo_apelo": "Muito desejado, gift popular"
        },
        {
          "nome": "Caixinha de som Bluetooth portátil",
          "descricao": "Speaker à prova d'água 10W",
          "motivo_apelo": "Presente certeiro qualquer ocasião"
        },
        {
          "nome": "Headphone over-ear dobrável",
          "descricao": "Fone com bass boost e microfone",
          "motivo_apelo": "Home office e games, demanda alta"
        },
        {
          "nome": "Microfone condensador USB",
          "descricao": "Mic para streaming e calls",
          "motivo_apelo": "Criadores de conteúdo, nicho crescendo"
        }
      ]
    },
    {
      "nome": "Eletrodomésticos Inteligentes",
      "produtos": [
        {
          "nome": "Fritadeira elétrica air fryer 4L",
          "descricao": "Sem óleo, timer digital",
          "motivo_apelo": "Produto do momento, alto ticket"
        },
        {
          "nome": "Liquidificador portátil USB",
          "descricao": "Mini blender para vitaminas e sucos",
          "motivo_apelo": "Viral no TikTok, muito compartilhado"
        },
        {
          "nome": "Chaleira elétrica com temperatura",
          "descricao": "Chaleira 1.5L com display LED",
          "motivo_apelo": "Presente prático, alto percebido"
        },
        {
          "nome": "Ventilador de mesa silencioso USB",
          "descricao": "Mini fan com 3 velocidades",
          "motivo_apelo": "Verão = pico de vendas"
        }
      ]
    },
    {
      "nome": "Tecnologia e Gadgets",
      "produtos": [
        {
          "nome": "Hub USB-C 7 em 1",
          "descricao": "Adaptador com HDMI, USB e SD card",
          "motivo_apelo": "Essencial para notebooks modernos"
        },
        {
          "nome": "Webcam Full HD 1080p",
          "descricao": "Câmera com microfone integrado",
          "motivo_apelo": "Home office consolidado"
        },
        {
          "nome": "Mouse sem fio silencioso",
          "descricao": "Mouse 2.4GHz recarregável USB-C",
          "motivo_apelo": "Necessidade home office, presente"
        },
        {
          "nome": "Suporte ergonômico para notebook",
          "descricao": "Suporte ajustável em alumínio",
          "motivo_apelo": "Saúde postural, home office"
        },
        {
          "nome": "Rastreador GPS compacto",
          "descricao": "Localizador para chaves/bolsa/mochila",
          "motivo_apelo": "Segurança, presente criativo"
        }
      ]
    }
  ],
  "Genérico": [
    {
      "nome": "Casa e Cozinha Essenciais",
      "produtos": [
        {
          "nome": "Organizador de gaveta modular",
          "descricao": "Divisórias ajustáveis para gavetas",
          "motivo_apelo": "Soluciona dor real cotidiana"
        },
        {
          "nome": "Jogo de facas inox com suporte",
          "descricao": "Kit 5 peças com cabo ergonômico",
          "motivo_apelo": "Essencial na cozinha, presente popular"
        },
        {
          "nome": "Tapete antiderrapante multiuso",
          "descricao": "Tapete macio para sala ou quarto",
          "motivo_apelo": "Recorrente, boa margem"
        }
      ]
    },
    {
      "nome": "Pet Essenciais",
      "produtos": [
        {
          "nome": "Cama pet redonda pelúcia",
          "descricao": "Cama macia lavável tamanho M/G",
          "motivo_apelo": "Dono compra com emoção"
        },
        {
          "nome": "Coleira regulável com guia retrátil",
          "descricao": "Guia 5m com trava de segurança",
          "motivo_apelo": "Essencial, boa margem"
        },
        {
          "nome": "Brinquedo interativo recheável",
          "descricao": "Kong ou similar para petisco",
          "motivo_apelo": "Recomendado por veterinários"
        }
      ]
    },
    {
      "nome": "Infantil Essenciais",
      "produtos": [
        {
          "nome": "Blocos de montar grandes",
          "descricao": "Lego duplo compatível 50 peças",
          "motivo_apelo": "Clássico, recompra constante"
        },
        {
          "nome": "Kit pintura e desenho infantil",
          "descricao": "Tintas laváveis + pincel + avental",
          "motivo_apelo": "Criatividade, presente escolar"
        },
        {
          "nome": "Protetor de quina de mesa",
          "descricao": "Kit 8 protetores de espuma",
          "motivo_apelo": "Preocupação de todo pai/mãe"
        }
      ]
    },
    {
      "nome": "Tecnologia do Dia a Dia",
      "produtos": [
        {
          "nome": "Cabo magnético 3 em 1 LED",
          "descricao": "USB-C, Lightning e micro USB",
          "motivo_apelo": "Viral, barato, compra compulsiva"
        },
        {
          "nome": "Carregador portátil 10000mAh",
          "descricao": "Power bank slim com 2 portas",
          "motivo_apelo": "Presente prático sempre pedido"
        },
        {
          "nome": "Fone Bluetooth TWS sem fio",
          "descricao": "Earbuds com cancelamento de ruído",
          "motivo_apelo": "Gift popular qualquer ocasião"
        }
      ]
    },
    {
      "nome": "Saúde e Beleza Básicos",
      "produtos": [
        {
          "nome": "Rolo de quartzo rosa facial",
          "descricao": "Massageador facial anti-inchaço",
          "motivo_apelo": "Viral no TikTok, margem alta"
        },
        {
          "nome": "Garrafa squeeze motivacional",
          "descricao": "Squeeze 700ml com marcação de horas",
          "motivo_apelo": "Viral, presente prático"
        },
        {
          "nome": "Máscara facial de argila",
          "descricao": "Máscara purificante para poros",
          "motivo_apelo": "Self-care, presente popular"
        }
      ]
    },
    {
      "nome": "Brinquedos e Hobbies",
      "produtos": [
        {
          "nome": "Quebra-cabeça 1000 peças adulto",
          "descricao": "Paisagens e obras de arte",
          "motivo_apelo": "Hobby família, presente clássico"
        },
        {
          "nome": "Baralho personalizado temático",
          "descricao": "Cartas ilustradas edição especial",
          "motivo_apelo": "Presente criativo, margem alta"
        },
        {
          "nome": "Kit pintura em tela para adultos",
          "descricao": "Tela + tintas + pincéis + modelo",
          "motivo_apelo": "Self-care criativo em alta"
        },
        {
          "nome": "Cubo mágico profissional",
          "descricao": "Speed cube 3x3 magnético",
          "motivo_apelo": "Viral sempre, todas as idades"
        }
      ]
    }
  ]
};

const sugerirColecoes = (nicho) => {
  const colecoes = COLECOES_BASE[nicho] || COLECOES_BASE["Genérico"];
  // Embaralha e retorna todas as coleções do nicho
  return [...colecoes].sort(() => Math.random() - 0.5);
};


// ─── Matriz de Análise de Nome ────────────────────────────────────────────────

const PALAVRAS_RUINS = [
  "top","mega","super","ultra","max","plus","pro","best","loja","shop","store",
  "brasil","brazil","online","oficial","promo","oferta","barato","desconto",
  "compras","vendas","produto","produtos",
];

const PADROES_SATURADOS = [
  /store$/i, /shop$/i, /brasil$/i, /brazil$/i, /online$/i,
  /top\w*/i, /mega\w*/i, /\d/, // contém número
];

const COMBOS_DIFICEIS = /[bcdfghjklmnpqrstvwxyz]{4,}/i; // 4+ consoantes seguidas

const contarSilabas = (nome) => {
  const s = nome.toLowerCase().replace(/[^a-záéíóúàâêôãõü]/g, "");
  const vogais = s.match(/[aáéíóúàâêôãõü]/gi);
  return vogais ? vogais.length : 1;
};

const analisarNome = (nome, nicho) => {
  const limpo = nome.trim();
  const semEspacos = limpo.replace(/\s+/g, "");
  const lower = limpo.toLowerCase();
  const criterios = [];

  // 1. Pronunciabilidade
  const temCombosDificeis = COMBOS_DIFICEIS.test(semEspacos);
  criterios.push({
    nome: "Pronunciabilidade",
    descricao: "Fácil de falar em voz alta",
    passou: !temCombosDificeis && semEspacos.length >= 4,
    detalhe: temCombosDificeis ? "Muitas consoantes seguidas — difícil de pronunciar" : "Soa natural",
  });

  // 2. Tamanho ideal
  const tamanho = semEspacos.length;
  const tamanhoOk = tamanho >= 4 && tamanho <= 16;
  criterios.push({
    nome: "Tamanho",
    descricao: "Entre 4 e 16 caracteres",
    passou: tamanhoOk,
    detalhe: !tamanhoOk
      ? tamanho < 4 ? "Nome muito curto" : "Nome muito longo — difícil de lembrar"
      : `${tamanho} caracteres — ideal`,
  });

  // 3. Sem palavras genéricas/ruins
  const temPalavraRuim = PALAVRAS_RUINS.some(p => lower.includes(p));
  criterios.push({
    nome: "Originalidade",
    descricao: "Sem termos genéricos ou saturados",
    passou: !temPalavraRuim,
    detalhe: temPalavraRuim
      ? "Contém termos comuns que enfraquecem a marca (ex: top, mega, shop, brasil)"
      : "Sem termos genéricos",
  });

  // 4. Sem padrões saturados
  const temPadrao = PADROES_SATURADOS.some(p => p.test(limpo));
  criterios.push({
    nome: "Diferenciação",
    descricao: "Foge dos padrões saturados do mercado",
    passou: !temPadrao,
    detalhe: temPadrao
      ? "Termina em Store/Shop, contém número ou segue padrão muito comum"
      : "Nome diferenciado",
  });

  // 5. Teste do Instagram (parece username?)
  const palavras = limpo.split(/\s+/);
  const pareceUsername = palavras.length <= 2 && semEspacos.length <= 15;
  criterios.push({
    nome: "Teste do Instagram",
    descricao: "Funciona como @username",
    passou: pareceUsername,
    detalhe: pareceUsername
      ? "Funciona bem como @ nas redes sociais"
      : "Nome muito longo para ser um @ eficiente",
  });

  // 6. Percepção de marca (não parece camelô)
  const temUpperCaseAleatorio = /[a-z][A-Z][a-z]/.test(nome) === false;
  const semNumeros = !/\d/.test(limpo);
  const semCaracteresEstranhos = !/[!@#$%^&*()_+=\[\]{};':"\|,.<>\/?]/.test(limpo);
  const pareceEmpresa = semNumeros && semCaracteresEstranhos;
  criterios.push({
    nome: "Aparência de Marca",
    descricao: "Parece empresa real, não improvisada",
    passou: pareceEmpresa,
    detalhe: !pareceEmpresa
      ? "Contém números ou caracteres especiais que passam aparência amadora"
      : "Visual de marca profissional",
  });

  // 7. Escalabilidade (não é muito específico)
  const PRODUTOS_ESPECIFICOS = [
    "escova","cadeira","mesa","roupa","sapato","brinquedo","celular","fone",
    "perfume","creme","shampoo","pet","gato","cachorro","bebe","criança",
  ];
  const muitoEspecifico = PRODUTOS_ESPECIFICOS.some(p => lower.includes(p));
  criterios.push({
    nome: "Escalabilidade",
    descricao: "Não limita o crescimento da loja",
    passou: !muitoEspecifico,
    detalhe: muitoEspecifico
      ? "Nome muito ligado a um produto específico — dificulta expansão"
      : "Permite vender múltiplos produtos no futuro",
  });

  // Score final
  const aprovados = criterios.filter(c => c.passou).length;
  const score = Math.round((aprovados / criterios.length) * 10);

  let classificacao, cor;
  if (score >= 9) { classificacao = "Nome Forte 🔥"; cor = "#22c55e"; }
  else if (score >= 7) { classificacao = "Nome Bom ✅"; cor = "#86efac"; }
  else if (score >= 5) { classificacao = "Nome Fraco ⚠️"; cor = "#eab308"; }
  else { classificacao = "Reconsidere ❌"; cor = "#ef4444"; }

  return { criterios, score, classificacao, cor };
};


// ─── Paleta de Cores por Nicho ────────────────────────────────────────────────

const PALETAS_BASE = {
  "Casa e Cozinha": [
    { primaria: { nome: "Terracota", h: 15, s: 65, l: 45 }, secundaria: { nome: "Bege Claro", h: 35, s: 40, l: 92 }, significado: "Aconchego e calor humano — transmite lar e conforto, ideal para produtos domésticos." },
    { primaria: { nome: "Verde Musgo", h: 95, s: 35, l: 32 }, secundaria: { nome: "Off White", h: 50, s: 20, l: 95 }, significado: "Natureza e equilíbrio — passa sensação de produto natural e de qualidade." },
    { primaria: { nome: "Azul Navy", h: 220, s: 55, l: 28 }, secundaria: { nome: "Dourado", h: 42, s: 75, l: 62 }, significado: "Sofisticação e confiança — posicionamento premium para produtos de casa." },
  ],
  "Pet": [
    { primaria: { nome: "Laranja Vibrante", h: 28, s: 90, l: 52 }, secundaria: { nome: "Branco Puro", h: 0, s: 0, l: 100 }, significado: "Energia e alegria — remete à vitalidade dos pets e ao vínculo afetivo com os donos." },
    { primaria: { nome: "Verde Fresco", h: 142, s: 55, l: 38 }, secundaria: { nome: "Bege Neutro", h: 38, s: 30, l: 88 }, significado: "Saúde e bem-estar animal — transmite cuidado e produtos naturais para pets." },
    { primaria: { nome: "Azul Céu", h: 200, s: 70, l: 50 }, secundaria: { nome: "Amarelo Suave", h: 48, s: 85, l: 68 }, significado: "Leveza e diversão — ideal para brinquedos e acessórios para animais." },
  ],
  "Infantil": [
    { primaria: { nome: "Rosa Suave", h: 340, s: 70, l: 70 }, secundaria: { nome: "Branco Leitoso", h: 0, s: 0, l: 98 }, significado: "Delicadeza e cuidado — transmite segurança e carinho para produtos de bebê." },
    { primaria: { nome: "Azul Bebê", h: 205, s: 65, l: 72 }, secundaria: { nome: "Branco", h: 0, s: 0, l: 100 }, significado: "Calma e confiança — cor clássica para produtos infantis que passam tranquilidade." },
    { primaria: { nome: "Amarelo Alegre", h: 45, s: 95, l: 62 }, secundaria: { nome: "Branco", h: 0, s: 0, l: 100 }, significado: "Alegria e criatividade — estimula a curiosidade e o desenvolvimento infantil." },
  ],
  "Saúde e Beleza": [
    { primaria: { nome: "Nude Rosado", h: 15, s: 45, l: 78 }, secundaria: { nome: "Dourado Elegante", h: 40, s: 70, l: 55 }, significado: "Elegância e feminilidade — posicionamento premium para beleza e autocuidado." },
    { primaria: { nome: "Rosa Millennial", h: 345, s: 55, l: 72 }, secundaria: { nome: "Branco Puro", h: 0, s: 0, l: 100 }, significado: "Modernidade e frescor — transmite tendência e leveza para produtos de beleza." },
    { primaria: { nome: "Verde Sage", h: 140, s: 28, l: 52 }, secundaria: { nome: "Off White", h: 50, s: 15, l: 96 }, significado: "Natural e saudável — ideal para suplementos, skincare natural e bem-estar." },
  ],
  "Eletrônico": [
    { primaria: { nome: "Preto Profundo", h: 220, s: 15, l: 10 }, secundaria: { nome: "Azul Neon", h: 210, s: 100, l: 60 }, significado: "Tecnologia e poder — visual escuro com destaque neon, referência do universo tech." },
    { primaria: { nome: "Cinza Moderno", h: 215, s: 12, l: 28 }, secundaria: { nome: "Verde Electric", h: 145, s: 90, l: 52 }, significado: "Modernidade e inovação — combina neutralidade com destaque vibrante." },
    { primaria: { nome: "Preto Fosco", h: 0, s: 0, l: 8 }, secundaria: { nome: "Dourado Tech", h: 42, s: 80, l: 58 }, significado: "Premium e sofisticação — posicionamento de gadgets de alto valor." },
  ],
  "Genérico": [
    { primaria: { nome: "Preto Elegante", h: 220, s: 10, l: 12 }, secundaria: { nome: "Verde Vibrante", h: 142, s: 70, l: 45 }, significado: "Versátil e marcante — combinação forte que funciona para qualquer categoria de produto." },
    { primaria: { nome: "Branco Limpo", h: 0, s: 0, l: 97 }, secundaria: { nome: "Azul Confiança", h: 215, s: 75, l: 42 }, significado: "Clareza e profissionalismo — transmite confiança para lojas multi-produto." },
    { primaria: { nome: "Cinza Neutro", h: 210, s: 8, l: 35 }, secundaria: { nome: "Laranja Energia", h: 25, s: 88, l: 55 }, significado: "Equilíbrio e dinamismo — neutro com destaque energético, apelo amplo." },
  ],
};

// Gera variação sutil baseada no nome da loja (0-1)
const variacaoDoNome = (nome) => {
  const str = nome.toLowerCase().replace(/[^a-z]/g, "");
  if (!str) return 0;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  return (hash % 100) / 100; // 0.00 a 0.99
};

// Converte HSL para HEX
const hslToHex = (h, s, l) => {
  s /= 100; l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};

const gerarPaleta = (nicho, nomeLoja) => {
  const paletas = PALETAS_BASE[nicho] || PALETAS_BASE["Genérico"];
  const variacao = variacaoDoNome(nomeLoja);

  return paletas.map((paleta) => {
    // Aplica variação sutil: ±8 graus no hue, ±4% na saturação, ±3% na luminosidade
    const ajusteH = Math.round((variacao - 0.5) * 16); // -8 a +8
    const ajusteS = Math.round((variacao - 0.5) * 8);  // -4 a +4
    const ajusteL = Math.round((variacao - 0.5) * 6);  // -3 a +3

    const hP = (paleta.primaria.h + ajusteH + 360) % 360;
    const sP = Math.min(100, Math.max(5, paleta.primaria.s + ajusteS));
    const lP = Math.min(95, Math.max(5, paleta.primaria.l + ajusteL));

    const hS = (paleta.secundaria.h + ajusteH + 360) % 360;
    const sS = Math.min(100, Math.max(0, paleta.secundaria.s + ajusteS));
    const lS = Math.min(99, Math.max(5, paleta.secundaria.l + ajusteL));

    return {
      cor_primaria: {
        nome: paleta.primaria.nome,
        hex: hslToHex(hP, sP, lP),
      },
      cor_secundaria: {
        nome: paleta.secundaria.nome,
        hex: hslToHex(hS, sS, lS),
      },
      significado: paleta.significado,
    };
  });
};


// Mapeamento nicho → slug da URL
const NICHO_SLUG = {
  "Genérico":        "generic",
  "Casa e Cozinha":  "house",
  "Infantil":        "children",
  "Pet":             "pet",
  "Eletrônico":      "eletronic",
  "Saúde e Beleza":  "healthandbeauty",
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
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 15, fontWeight: 600 }}>{label}</label>}
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
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 15, fontWeight: 600 }}>{label}</label>}
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
    {label && <label style={{ display: "block", color: "#aaa", marginBottom: 6, fontSize: 15, fontWeight: 600 }}>{label}</label>}
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
  const [interesses, setInteresses] = useState(""); // mantido para KYC mas não usado na análise
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

  // Etapa 6 — cores selecionadas para URL
  const [corSelecionada1, setCorSelecionada1] = useState("");
  const [corSelecionada2, setCorSelecionada2] = useState("");

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
      whatsapp: `${pais.dial}${whatsapp.replace(/\D/g, "")}`.trim(),
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

  const avancarEtapa2 = () => {
    if (!statusAmoroso || !filhos || !pets || !exercicios || nichosIdent.length === 0) {
      showToast("Responda todas as perguntas.", "error"); return;
    }
    // Cálculo local — sem IA
    const resultado = calcularNichos(statusAmoroso, filhos, pets, exercicios, nichosIdent);
    setNichos(resultado);
    // Pré-carrega nomes do nicho principal (sem IA)
    const nichoTop = resultado[0]?.nome || "Genérico";
    setNomesLoja(sugerirNomes(nichoTop));
    upsertLead({ etapa_concluida: "2 - Perfil" });
    setEtapa(3);
  };

  const avancarEtapa3 = () => {
    if (!selectedNiche) { showToast("Selecione um nicho.", "error"); return; }
    // Sem IA — usa base local
    const resultado = sugerirColecoes(selectedNiche.nome);
    setColecoes(resultado);
    upsertLead({ etapa_concluida: "3 - Nicho", nicho_escolhido: selectedNiche.nome });
    setEtapa(3.5);
  };

  const verificarNome = () => {
    if (!nomeLoja.trim()) { showToast("Digite um nome.", "error"); return; }
    const analise = analisarNome(nomeLoja, selectedNiche?.nome || "Genérico");
    setDominioStatus(analise);
    upsertLead({ etapa_concluida: "4 - Nome", nome_loja: nomeLoja });
  };

  const avancarEtapa5 = () => {
    const combinacoes = gerarPaleta(selectedNiche?.nome || "Genérico", nomeLoja);
    setPaletaCores({ combinacoes });
    upsertLead({ etapa_concluida: "5 - Cores", nome_loja: nomeLoja });
    setEtapa(5);
  };

  const finalizar = async () => {
    upsertLead({ etapa_concluida: "6 - Concluído", nome_loja: nomeLoja });
    setEtapa(6);
    // Enviar para Google Sheets apenas ao finalizar
    try {
      const url = process.env.NEXT_PUBLIC_SHEETS_WEBHOOK;
      if (url) {
        const lead = {
          data: new Date().toLocaleString("pt-BR"),
          nome, email,
          whatsapp: `${pais.dial}${whatsapp.replace(/\D/g, "")}`.trim(),
          pais: pais.name, idade,
          conhecimento_dropshipping: conhecimento, objetivo,
          genero_vida_amorosa: statusAmoroso, filhos, pets,
          exercicios_fisicos: exercicios, assuntos_interesse: interesses,
          nichos_identificacao: nichosIdent.join(", "),
          nicho_escolhido: selectedNiche?.nome || "",
          nome_loja: nomeLoja,
          etapa_concluida: "6 - Concluído",
        };
        fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead), mode: "no-cors" });
      }
    } catch(e) {}
  };

  const gerarPDF = () => {
    const loadAndGenerate = () => {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210, H = 297, mg = 18, col = W - mg * 2;
      let y = mg;

      const newPage = () => {
        doc.addPage(); y = mg;
        doc.setFillColor(8,8,8); doc.rect(0,0,W,H,'F');
        doc.setFillColor(22,163,74); doc.rect(0,0,W,1.5,'F');
      };
      const chk = (n=10) => { if (y+n > H-mg-10) newPage(); };
      const hexRgb = (hex) => {
        const h = hex.replace('#','');
        return [parseInt(h.slice(0,2),16), parseInt(h.slice(2,4),16), parseInt(h.slice(4,6),16)];
      };

      const sectionHeader = (title, emoji) => {
        chk(14);
        doc.setFillColor(22,40,28); doc.roundedRect(mg, y, col, 11, 2, 2, 'F');
        doc.setTextColor(34,197,94); doc.setFont('helvetica','bold'); doc.setFontSize(11);
        doc.text((emoji ? emoji + '  ' : '') + title, mg+5, y+7.5);
        y += 17;
      };

      // ── CAPA ──────────────────────────────────────────────────────────────────
      doc.setFillColor(8,8,8); doc.rect(0,0,W,H,'F');
      doc.setFillColor(22,163,74); doc.rect(0,0,W,6,'F');
      doc.setFillColor(22,163,74); doc.rect(0,H-6,W,6,'F');

      // Título
      doc.setTextColor(255,255,255); doc.setFont('helvetica','bold'); doc.setFontSize(34);
      doc.text('Guia de Nichos', W/2, 68, {align:'center'});
      doc.setFontSize(12); doc.setTextColor(134,239,172);
      doc.text('Seu plano personalizado de e-commerce', W/2, 80, {align:'center'});

      // Card resumo
      doc.setFillColor(18,18,18); doc.roundedRect(mg, 96, col, 88, 5, 5, 'F');
      doc.setDrawColor(34,197,94); doc.setLineWidth(0.5); doc.roundedRect(mg,96,col,88,5,5,'S');
      doc.setTextColor(34,197,94); doc.setFont('helvetica','bold'); doc.setFontSize(8);
      doc.text('SEU RESUMO', mg+8, 108);

      const scoreInfo = dominioStatus ? dominioStatus.score + '/10' : '-';
      const resumoItems = [
        ['Nome', nome||'-'],
        ['Nicho Escolhido', selectedNiche?.nome||'-'],
        ['Nome da Loja', nomeLoja||'-'],
        ['Score do Nome', scoreInfo],
        ['Data', new Date().toLocaleDateString('pt-BR')],
      ];
      resumoItems.forEach(([k,v],i) => {
        const ry = 116 + i*13;
        doc.setTextColor(70,70,70); doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.text(k.toUpperCase(), mg+8, ry);
        doc.setTextColor(220,220,220); doc.setFontSize(10); doc.setFont('helvetica','bold'); doc.text(String(v), mg+8, ry+6);
      });

      doc.setTextColor(40,40,40); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
      doc.text('Gerado pelo Guia de Nichos', W/2, H-12, {align:'center'});

      // ── P2: NICHOS ────────────────────────────────────────────────────────────
      newPage();
      sectionHeader('Nichos Recomendados', null);

      nichos.forEach((nicho, i) => {
        const isSel = nicho === selectedNiche;
        chk(36);
        const cardH = 32;
        if (isSel) {
          doc.setFillColor(15,35,20); doc.roundedRect(mg, y, col, cardH, 3, 3, 'F');
          doc.setDrawColor(34,197,94); doc.setLineWidth(0.5); doc.roundedRect(mg,y,col,cardH,3,3,'S');
          doc.setFillColor(34,197,94); doc.roundedRect(mg+5, y+4, 46, 5, 2, 2, 'F');
          doc.setTextColor(0,0,0); doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.text('ESCOLHIDO', mg+7, y+8);
        } else {
          doc.setFillColor(18,18,18); doc.roundedRect(mg, y, col, cardH, 3, 3, 'F');
          doc.setDrawColor(40,40,40); doc.setLineWidth(0.3); doc.roundedRect(mg,y,col,cardH,3,3,'S');
        }
        doc.setTextColor(isSel ? 255 : 180, isSel ? 255 : 180, isSel ? 255 : 180);
        doc.setFontSize(12); doc.setFont('helvetica','bold');
        doc.text((i===0 ? '1. ' : i===1 ? '2. ' : '3. ') + nicho.nome, mg+5, y + (isSel ? 16 : 12));
        doc.setTextColor(120,120,120); doc.setFontSize(8); doc.setFont('helvetica','normal');
        const jLines = doc.splitTextToSize(nicho.justificativa||'', col-12);
        doc.text(jLines[0], mg+5, y + (isSel ? 22 : 18));
        doc.setTextColor(34,197,94); doc.setFontSize(7.5);
        doc.text('Produto exemplo: ' + (nicho.exemplo_produto||''), mg+5, y+28);
        y += cardH + 6;
      });

      // ── P3: NOME DA LOJA + SCORE ───────────────────────────────────────────────
      newPage();
      sectionHeader('Nome da Loja', null);

      // Nome em destaque
      chk(26);
      doc.setFillColor(15,30,18); doc.roundedRect(mg, y, col, 24, 3, 3, 'F');
      doc.setDrawColor(34,197,94); doc.setLineWidth(0.5); doc.roundedRect(mg,y,col,24,3,3,'S');
      doc.setTextColor(134,239,172); doc.setFontSize(7.5); doc.setFont('helvetica','bold'); doc.text('NOME ESCOLHIDO', mg+6, y+6);
      doc.setTextColor(255,255,255); doc.setFontSize(22); doc.text(nomeLoja||'-', mg+6, y+18);
      y += 30;

      // Score
      if (dominioStatus?.criterios) {
        chk(20);
        // Score box
        const scoreColor = dominioStatus.score >= 9 ? [34,197,94] : dominioStatus.score >= 7 ? [134,239,172] : dominioStatus.score >= 5 ? [234,179,8] : [239,68,68];
        doc.setFillColor(18,18,18); doc.roundedRect(mg, y, col, 16, 3, 3, 'F');
        doc.setFillColor(...scoreColor); doc.roundedRect(mg, y, 36, 16, 3, 0, 'F'); doc.rect(mg+30, y, 6, 16, 'F');
        doc.setTextColor(0,0,0); doc.setFontSize(18); doc.setFont('helvetica','bold');
        doc.text(dominioStatus.score+'/10', mg+4, y+11);
        doc.setTextColor(...scoreColor); doc.setFontSize(11); doc.setFont('helvetica','bold');
        doc.text(dominioStatus.classificacao.replace(/[🔥✅⚠️❌]/g,'').trim(), mg+42, y+10);
        y += 22;

        // Critérios em 2 colunas
        chk(16);
        doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text('ANÁLISE DO NOME', mg, y); y += 6;

        const half = (col-4)/2;
        dominioStatus.criterios.forEach((crit, i) => {
          if (i%2===0) chk(14);
          const xo = i%2===0 ? mg : mg+half+4;
          const corBg = crit.passou ? [13,30,18] : [30,13,13];
          const corBorda = crit.passou ? [34,197,94] : [239,68,68];
          doc.setFillColor(...corBg); doc.roundedRect(xo, y, half, 12, 2, 2, 'F');
          doc.setDrawColor(...corBorda); doc.setLineWidth(0.3); doc.roundedRect(xo,y,half,12,2,2,'S');
          doc.setTextColor(crit.passou ? 34 : 239, crit.passou ? 197 : 68, crit.passou ? 94 : 68);
          doc.setFontSize(7); doc.setFont('helvetica','bold');
          doc.text((crit.passou ? '✓ ' : '✗ ') + crit.nome, xo+4, y+5);
          doc.setTextColor(120,120,120); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(crit.detalhe||'', half-8)[0], xo+4, y+9.5);
          if (i%2===1) y += 15;
        });
        if (dominioStatus.criterios.length%2!==0) y += 15;
        y += 4;
      }

      // Aviso domínio
      chk(30);
      doc.setFillColor(25,20,8); doc.roundedRect(mg, y, col, 28, 3, 3, 'F');
      doc.setDrawColor(234,179,8); doc.setLineWidth(0.3); doc.roundedRect(mg,y,col,28,3,3,'S');
      doc.setTextColor(234,179,8); doc.setFontSize(8); doc.setFont('helvetica','bold'); doc.text('ANTES DE DECIDIR:', mg+5, y+7);
      doc.setTextColor(180,180,180); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
      doc.text('Google e redes sociais: pesquise se ha concorrentes com nome similar.', mg+5, y+14);
      doc.text('Dominio: verifique .com e .com.br no GoDaddy (godaddy.com) ou Registro.br', mg+5, y+20);
      doc.text('Instagram e TikTok: confirme se o @ esta disponivel.', mg+5, y+26);
      y += 34;

      // Nomes sugeridos
      if (nomesLoja.length) {
        chk(14);
        doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text('OUTROS NOMES SUGERIDOS', mg, y); y += 6;
        const half2 = (col-4)/2;
        nomesLoja.slice(0,10).forEach((item,i) => {
          if (i%2===0) chk(13);
          const xo = i%2===0 ? mg : mg+half2+4;
          doc.setFillColor(18,18,18); doc.roundedRect(xo, y, half2, 11, 2, 2, 'F');
          doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text(item.nome, xo+4, y+5);
          doc.setTextColor(80,80,80); doc.setFontSize(6.5); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(item.explicacao||'', half2-8)[0], xo+4, y+9);
          if (i%2===1) y += 14;
        });
        if (nomesLoja.length%2!==0) y += 14;
      }

      // ── P4: PALETA DE CORES ───────────────────────────────────────────────────
      newPage();
      sectionHeader('Paleta de Cores', null);

      (paletaCores?.combinacoes||[]).forEach((combo,i) => {
        chk(58);
        const cp = combo?.cor_primaria?.hex||'#4B5563';
        const cs = combo?.cor_secundaria?.hex||'#FFFFFF';
        const [pr,pg,pb] = hexRgb(cp);
        const [sr,sg,sb] = hexRgb(cs);

        doc.setFillColor(18,18,18); doc.roundedRect(mg, y, col, 52, 3, 3, 'F');
        doc.setDrawColor(40,40,40); doc.setLineWidth(0.3); doc.roundedRect(mg,y,col,52,3,3,'S');
        doc.setTextColor(70,70,70); doc.setFontSize(8); doc.setFont('helvetica','bold');
        doc.text('OPCAO ' + (i+1), mg+5, y+7);

        const sw = (col-18)/2;

        // Swatch Primária
        doc.setFillColor(pr,pg,pb); doc.roundedRect(mg+5, y+10, sw, 16, 2, 2, 'F');
        doc.setTextColor(130,130,130); doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.text('COR PRINCIPAL', mg+5, y+30);
        doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text(combo.cor_primaria?.nome||'', mg+5, y+36);
        doc.setFillColor(12,12,12); doc.roundedRect(mg+5, y+38, sw/2-2, 6, 1, 1, 'F');
        doc.setTextColor(150,150,150); doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.text(cp, mg+7, y+42.5);

        // Swatch Secundária
        const x2 = mg+5+sw+8;
        doc.setFillColor(sr,sg,sb); doc.roundedRect(x2, y+10, sw, 16, 2, 2, 'F');
        doc.setTextColor(130,130,130); doc.setFontSize(7); doc.setFont('helvetica','bold'); doc.text('COR SECUNDARIA', x2, y+30);
        doc.setTextColor(200,200,200); doc.setFontSize(9); doc.setFont('helvetica','bold'); doc.text(combo.cor_secundaria?.nome||'', x2, y+36);
        doc.setFillColor(12,12,12); doc.roundedRect(x2, y+38, sw/2-2, 6, 1, 1, 'F');
        doc.setTextColor(150,150,150); doc.setFontSize(7.5); doc.setFont('helvetica','normal'); doc.text(cs, x2+2, y+42.5);

        // Significado
        doc.setTextColor(90,90,90); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
        const sigLines = doc.splitTextToSize(combo.significado||'', col-10);
        doc.text(sigLines[0], mg+5, y+49);
        y += 58;
      });

      // ── P5+: COLEÇÕES ─────────────────────────────────────────────────────────
      newPage();
      sectionHeader('Colecoes e Produtos Sugeridos', null);

      (colecoes||[]).forEach((coll) => {
        chk(14);
        doc.setFillColor(20,18,35); doc.roundedRect(mg, y, col, 11, 2, 2, 'F');
        doc.setTextColor(167,139,250); doc.setFontSize(10); doc.setFont('helvetica','bold');
        doc.text(coll.nome, mg+5, y+7.5); y += 14;

        (coll.produtos||[]).forEach((prod, pi) => {
          chk(19);
          doc.setFillColor(14,14,22); doc.roundedRect(mg+3, y, col-3, 17, 1, 1, 'F');
          doc.setTextColor(210,210,210); doc.setFontSize(9); doc.setFont('helvetica','bold');
          doc.text((pi+1)+'. '+prod.nome, mg+7, y+6);
          doc.setTextColor(110,110,110); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
          doc.text(doc.splitTextToSize(prod.descricao||'', col-18)[0], mg+7, y+11);
          doc.setTextColor(99,102,241); doc.setFontSize(7);
          doc.text('Apelo: '+(prod.motivo_apelo||''), mg+7, y+15.5);
          y += 20;
        });
        y += 6;
      });

      // ── RODAPÉ ────────────────────────────────────────────────────────────────
      const total = doc.getNumberOfPages();
      for (let p=1; p<=total; p++) {
        doc.setPage(p);
        doc.setFillColor(12,12,12); doc.rect(0,H-9,W,9,'F');
        doc.setTextColor(45,45,45); doc.setFontSize(7); doc.setFont('helvetica','normal');
        doc.text('Guia de Nichos', mg, H-4);
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

      case 2: {
        const OptionGroup = ({ label, value, onChange, options }) => (
          <div style={{ marginBottom: 22 }}>
            <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, marginBottom: 10 }}>{label}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {options.map(opt => {
                const sel = value === opt.value;
                return (
                  <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
                    style={{
                      padding: "13px 16px", borderRadius: 12, cursor: "pointer", fontFamily: "inherit",
                      fontSize: 14, fontWeight: sel ? 700 : 400, textAlign: "left",
                      border: sel ? "1.5px solid #22c55e" : "1px solid rgba(255,255,255,0.12)",
                      background: sel ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.04)",
                      color: sel ? "#22c55e" : "#ccc", transition: "all 0.15s",
                    }}>
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        );

        return (
          <Card>
            <StepHeader icon="🎯" title="Seu Perfil de Vida" subtitle="Suas respostas definem o melhor nicho para você" />
            <div style={pad}>
              <OptionGroup label="Status amoroso" value={statusAmoroso} onChange={setStatusAmoroso}
                options={[{value:"Solteiro(a)",label:"Solteiro(a)"},{value:"Namorando",label:"Namorando"},{value:"Casado(a)",label:"Casado(a)"},{value:"Divorciado(a)",label:"Divorciado(a)"}]} />

              <OptionGroup label="Você tem filhos?" value={filhos} onChange={setFilhos}
                options={[
                  {value:"Não tenho",label:"Não tenho filhos"},
                  {value:"Não tenho, mas venderia",label:"Não tenho, mas venderia nesse nicho"},
                  {value:"Tenho e venderia",label:"Tenho e venderia nesse nicho"},
                  {value:"Tenho e não venderia",label:"Tenho e não venderia nesse nicho"},
                ]} />

              <OptionGroup label="Você tem pets?" value={pets} onChange={setPets}
                options={[
                  {value:"Não tenho",label:"Não tenho pets"},
                  {value:"Não tenho, mas venderia",label:"Não tenho, mas venderia nesse nicho"},
                  {value:"Tenho e venderia",label:"Tenho e venderia nesse nicho"},
                  {value:"Tenho e não venderia",label:"Tenho e não venderia nesse nicho"},
                ]} />

              <OptionGroup label="Pratica exercícios físicos?" value={exercicios} onChange={setExercicios}
                options={[{value:"Não pratico",label:"Não pratico"},{value:"Às vezes",label:"Às vezes"},{value:"Regularmente",label:"Regularmente"},{value:"Atleta",label:"Sou muito dedicado(a)"}]} />

              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <label style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>Com qual nicho você mais se identifica?</label>
                  <span style={{ color: "#22c55e", fontSize: 13, fontWeight: 700, background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", padding: "2px 10px", borderRadius: 20 }}>{nichosIdent.length}/4</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {NICHOS_OPCOES.map((n) => {
                    const sel = nichosIdent.includes(n);
                    return (
                      <button key={n} type="button" onClick={() => toggleNicho(n)}
                        style={{
                          padding: "10px 18px", borderRadius: 50, fontSize: 14, fontWeight: 600,
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
                <p style={{ color: "#666", fontSize: 12, marginTop: 10 }}>Selecione até 4 — isso aumenta o peso desses nichos na sua análise</p>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <GhostBtn onClick={() => setEtapa(1.5)}>← Voltar</GhostBtn>
                <PrimaryBtn onClick={avancarEtapa2} disabled={!statusAmoroso || !filhos || !pets || !exercicios || nichosIdent.length === 0}>
                  Ver minha análise →
                </PrimaryBtn>
              </div>
            </div>
          </Card>
        );
      }

      case 3: return (
        <Card>
          <StepHeader icon="✨" title="Nichos Recomendados" subtitle="Selecione o nicho que mais te atrai" />
          <div style={pad}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
              {nichos.map((nicho, i) => {
                const sel = selectedNiche === nicho;
                return (
                  <div key={i} onClick={() => { setSelectedNiche(nicho); setExpandedIdx(expandedIdx === i ? null : i); setNomesLoja(sugerirNomes(nicho.nome)); }}
                    style={{ border: `1px solid ${sel ? "#22c55e" : "#222"}`, borderRadius: 14, padding: "16px 20px", cursor: "pointer", transition: "all 0.15s", background: sel ? "rgba(34,197,94,0.05)" : "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        {nicho.is_principal && <span style={{ fontSize: 10, background: "#22c55e", color: "#000", padding: "2px 8px", borderRadius: 20, fontWeight: 800 }}>⭐ RECOMENDADO</span>}
                        <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{nicho.nome}</span>
                      </div>
                      <span style={{ color: "#555", fontSize: 12, flexShrink: 0 }}>{expandedIdx === i ? "▲" : "▼"}</span>
                    </div>
                    {expandedIdx === i && (
                      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                        <p style={{ color: "#bbb", fontSize: 14, marginBottom: 8, lineHeight: 1.6 }}>{nicho.justificativa}</p>
                        <p style={{ color: "#22c55e", fontSize: 14 }}>🛍️ <strong>Exemplo:</strong> {nicho.exemplo_produto}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <GhostBtn onClick={() => setEtapa(2)}>← Voltar</GhostBtn>
              <PrimaryBtn onClick={avancarEtapa3} disabled={!selectedNiche}>
                Ver Coleções e Produtos →
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
                <h3 style={{ color: "#a78bfa", fontWeight: 700, fontSize: 16, marginBottom: 12 }}>{col.nome}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {col.produtos.map((prod, j) => (
                    <div key={j} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 9, padding: "10px 14px" }}>
                      <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{prod.nome}</p>
                      <p style={{ color: "#bbb", fontSize: 13, marginTop: 4, lineHeight: 1.5 }}>{prod.descricao}</p>
                      <p style={{ color: "#818cf8", fontSize: 13, marginTop: 5 }}>💡 {prod.motivo_apelo}</p>
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
                <p style={{ color: "#aaa", fontSize: 12, fontWeight: 700, marginBottom: 10, textTransform: "uppercase", letterSpacing: 0.5 }}>Sugestões da IA</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {nomesLoja.map((item, i) => (
                    <button key={i} type="button" onClick={() => { setNomeLoja(item.nome); setDominioStatus(null); }}
                      style={{ padding: "14px 16px", borderRadius: 10, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s", border: nomeLoja === item.nome ? "1.5px solid #22c55e" : "1px solid #333", background: nomeLoja === item.nome ? "rgba(34,197,94,0.1)" : "rgba(255,255,255,0.06)", color: "#fff" }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{item.nome}</p>
                      <p style={{ fontSize: 13, color: "#aaa", marginTop: 4, lineHeight: 1.5 }}>{item.explicacao}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <TextInput label="Nome escolhido (ou escreva o seu)" value={nomeLoja} onChange={(v) => { setNomeLoja(v); setDominioStatus(null); }} placeholder="Ex: Velari, NordenCasa..." />
            <PrimaryBtn onClick={verificarNome} disabled={!nomeLoja.trim()} style={{ marginBottom: 16 }}>
              Analisar Nome
            </PrimaryBtn>

            {dominioStatus && (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

                {/* Score */}
                <div style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${dominioStatus.cor}44`, borderRadius: 14, padding: "18px 20px", textAlign: "center" }}>
                  <p style={{ color: "#aaa", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Score do Nome</p>
                  <div style={{ fontSize: 48, fontWeight: 900, color: dominioStatus.cor, lineHeight: 1 }}>{dominioStatus.score}<span style={{ fontSize: 20, color: "#555" }}>/10</span></div>
                  <p style={{ color: dominioStatus.cor, fontWeight: 700, fontSize: 16, marginTop: 8 }}>{dominioStatus.classificacao}</p>
                </div>

                {/* Critérios */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {dominioStatus.criterios.map((crit, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12, background: "rgba(255,255,255,0.03)", border: `1px solid ${crit.passou ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`, borderRadius: 10, padding: "12px 14px" }}>
                      <span style={{ fontSize: 18, flexShrink: 0, marginTop: 1 }}>{crit.passou ? "✅" : "❌"}</span>
                      <div>
                        <p style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{crit.nome}</p>
                        <p style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{crit.detalhe}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Aviso fixo domínio */}
                <div style={{ background: "rgba(234,179,8,0.06)", border: "1px solid rgba(234,179,8,0.2)", borderRadius: 12, padding: "14px 16px" }}>
                  <p style={{ color: "#eab308", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>⚠️ Antes de decidir, verifique:</p>
                  <p style={{ color: "#ccc", fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
                    🔍 <strong>Google e redes sociais</strong> — pesquise o nome e veja se há concorrentes diretos ou marcas similares já estabelecidas.
                  </p>
                  <p style={{ color: "#ccc", fontSize: 13, marginBottom: 6, lineHeight: 1.5 }}>
                    🌐 <strong>Domínio</strong> — verifique se <strong>.com</strong> e <strong>.com.br</strong> estão disponíveis no <a href="https://www.godaddy.com" target="_blank" rel="noopener noreferrer" style={{ color: "#eab308" }}>GoDaddy</a> ou <a href="https://registro.br" target="_blank" rel="noopener noreferrer" style={{ color: "#eab308" }}>Registro.br</a>.
                  </p>
                  <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.5 }}>
                    📱 <strong>@ nas redes</strong> — confira se o @ está livre no Instagram e TikTok antes de se comprometer com o nome.
                  </p>
                </div>

                <PrimaryBtn onClick={avancarEtapa5}>
                  Definir Cores da Loja →
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
                <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #333", borderRadius: 14, padding: 20, marginBottom: 16 }}>
                  <p style={{ color: "#888", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Opção {i + 1}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                    {[{ label: "Cor Principal (fundo)", cor: combo.cor_primaria, hex: cp }, { label: "Cor Secundária (texto)", cor: combo.cor_secundaria, hex: cs }].map((item) => (
                      <div key={item.label}>
                        <p style={{ color: "#aaa", fontSize: 13, marginBottom: 8 }}>{item.label}</p>
                        <div style={{ height: 56, borderRadius: 8, background: item.hex, border: "1px solid #2a2a2a", marginBottom: 8 }} />
                        <p style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>{item.cor?.nome}</p>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                          <code style={{ background: "#1a1a1a", padding: "5px 10px", borderRadius: 6, fontSize: 13, color: "#aaa", border: "1px solid #333" }}>{item.hex}</code>
                          <button type="button" onClick={() => copiar(item.hex)} style={{ background: "none", border: "none", cursor: "pointer", color: "#555", fontSize: 14 }}>📋</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: cp, borderRadius: 8, padding: "10px 16px", textAlign: "center", marginBottom: 10 }}>
                    <p style={{ color: cs, fontWeight: 600, fontSize: 14 }}>Prévia: texto sobre o fundo</p>
                  </div>
                  <p style={{ color: "#bbb", fontSize: 14, lineHeight: 1.6 }}>💬 {combo.significado}</p>
                </div>
              );
            })}
            <PrimaryBtn onClick={finalizar}>Ver Resumo Final →</PrimaryBtn>
          </div>
        </Card>
      );

      case 6: {
        // Pré-preenche com as cores da paleta escolhida (primeira combinação)
        const c1Default = paletaCores?.combinacoes?.[0]?.cor_primaria?.hex || "#22c55e";
        const c2Default = paletaCores?.combinacoes?.[0]?.cor_secundaria?.hex || "#ffffff";
        const cor1 = corSelecionada1 || c1Default;
        const cor2 = corSelecionada2 || c2Default;

        const nichoSlug = NICHO_SLUG[selectedNiche?.nome] || "generic";
        const urlParams = new URLSearchParams({
          name: nome || "",
          storeName: nomeLoja || "",
          niche: nichoSlug,
          color1: cor1,
          color2: cor2,
        });
        const urlSolicitacao = `https://loja.alynnegustavo.com.br/?${urlParams.toString()}`;

        return (
          <Card style={{ background: "linear-gradient(135deg, rgba(5,46,22,0.97), rgba(15,52,30,0.97))", border: "2px solid rgba(34,197,94,0.3)" }}>
            <div style={{ padding: "40px 36px 44px", textAlign: "center" }}>
              <div style={{ fontSize: 52, marginBottom: 12 }}>🎉</div>
              <h2 style={{ color: "#fff", fontSize: 26, fontWeight: 900, marginBottom: 10 }}>Análise Completa!</h2>
              <p style={{ color: "#86efac", fontSize: 14, lineHeight: 1.7, margin: "0 auto 20px" }}>
                Seu guia está pronto. Escolha as cores da sua loja e solicite agora!
              </p>

              {/* Resumo */}
              <div style={{ background: "rgba(0,0,0,0.3)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
                <p style={{ color: "#22c55e", fontWeight: 800, marginBottom: 10, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>📋 Seu Resumo</p>
                {[["🎯 Nicho", selectedNiche?.nome], ["🏷️ Nome da loja", nomeLoja], ["🎨 Paleta de cores", "Definida ✓"], ["🛍️ Coleções", `${colecoes?.length || 0} coleções geradas`]].map(([k,v]) => (
                  <div key={k} style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: 6, marginBottom: 6 }}>
                    <span style={{ color: "#6ee7b7", fontSize: 12 }}>{k}</span>
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700, maxWidth: "55%", textAlign: "right" }}>{v}</span>
                  </div>
                ))}
              </div>

              {/* Seletor de cores */}
              <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 12, padding: "16px 20px", marginBottom: 20, textAlign: "left" }}>
                <p style={{ color: "#22c55e", fontWeight: 800, marginBottom: 14, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>🎨 Escolha as Cores da Loja</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {/* Cor 1 */}
                  <div>
                    <p style={{ color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Cor Principal</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ position: "relative", width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #444", flexShrink: 0 }}>
                        <div style={{ width: "100%", height: "100%", background: cor1 }} />
                        <input type="color" value={cor1}
                          onChange={(e) => setCorSelecionada1(e.target.value)}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{cor1.toUpperCase()}</p>
                        <p style={{ color: "#666", fontSize: 11 }}>clique para trocar</p>
                      </div>
                    </div>
                  </div>
                  {/* Cor 2 */}
                  <div>
                    <p style={{ color: "#aaa", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Cor Secundária</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ position: "relative", width: 44, height: 44, borderRadius: 10, overflow: "hidden", border: "2px solid #444", flexShrink: 0 }}>
                        <div style={{ width: "100%", height: "100%", background: cor2 }} />
                        <input type="color" value={cor2}
                          onChange={(e) => setCorSelecionada2(e.target.value)}
                          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0, cursor: "pointer" }} />
                      </div>
                      <div>
                        <p style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{cor2.toUpperCase()}</p>
                        <p style={{ color: "#666", fontSize: 11 }}>clique para trocar</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div style={{ marginTop: 14, borderRadius: 8, padding: "12px 16px", background: cor1, textAlign: "center" }}>
                  <p style={{ color: cor2, fontWeight: 700, fontSize: 14 }}>Prévia: {nomeLoja || "Sua Loja"}</p>
                </div>
              </div>

              {/* Botão PDF */}
              <button type="button" onClick={gerarPDF}
                style={{ width: "100%", border: "none", borderRadius: 12, padding: "15px 24px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "linear-gradient(135deg, #22c55e, #16a34a)", color: "#000", fontFamily: "inherit", marginBottom: 12, boxShadow: "0 8px 24px rgba(34,197,94,0.3)" }}>
                ⬇ Baixar PDF Completo
              </button>

              {/* Botão Solicitar Loja */}
              <a href={urlSolicitacao} target="_blank" rel="noopener noreferrer"
                style={{ width: "100%", border: "2px solid #22c55e", borderRadius: 12, padding: "15px 24px", fontWeight: 800, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "transparent", color: "#22c55e", fontFamily: "inherit", textDecoration: "none", boxSizing: "border-box" }}>
                🚀 Solicitar Minha Loja
              </a>
            </div>
          </Card>
        );
      }

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
          <p style={{ color: "#888", fontSize: 14, marginTop: 6 }}>Análise personalizada com inteligência artificial</p>
        </div>

        <ProgressBar etapa={etapa} />

        <div style={{ maxWidth: 580, margin: "0 auto" }}>
          {renderStep()}
        </div>


      </div>
    </>
  );
}
