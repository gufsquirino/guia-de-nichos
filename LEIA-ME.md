# 🚀 Guia de Nichos — Como Publicar na Vercel

Siga este guia passo a passo. Não precisa saber programar!

---

## O que você vai precisar (tudo gratuito)

- Uma conta no **GitHub** → https://github.com
- Uma conta na **Vercel** → https://vercel.com
- Sua **chave de API da Anthropic** → https://console.anthropic.com

---

## PASSO 1 — Crie sua conta no GitHub

1. Acesse https://github.com e clique em **"Sign up"**
2. Crie sua conta (pode usar seu e-mail normal)
3. Confirme o e-mail

---

## PASSO 2 — Suba o projeto no GitHub

1. Ainda no GitHub, clique no botão **"+"** no canto superior direito
2. Clique em **"New repository"**
3. Em "Repository name" escreva: `guia-de-nichos`
4. Deixe marcado como **Public**
5. Clique em **"Create repository"**

Agora faça o upload dos arquivos:

6. Na página do repositório que criou, clique em **"uploading an existing file"**
7. Arraste TODA a pasta `guia-de-nichos` para a área de upload
8. Clique em **"Commit changes"**

---

## PASSO 3 — Crie sua conta na Vercel

1. Acesse https://vercel.com
2. Clique em **"Sign Up"**
3. Escolha **"Continue with GitHub"** (facilita a integração)
4. Autorize a Vercel a acessar seu GitHub

---

## PASSO 4 — Importe o projeto na Vercel

1. No painel da Vercel, clique em **"Add New..."** → **"Project"**
2. Você verá seu repositório `guia-de-nichos` listado
3. Clique em **"Import"** ao lado dele
4. Na tela seguinte, não mude nada — apenas clique em **"Deploy"**

A Vercel vai construir e publicar seu site automaticamente. Aguarde ~1 minuto.

---

## PASSO 5 — Adicionar sua chave de API (IMPORTANTE!)

Sem este passo o site não vai funcionar.

1. No painel da Vercel, clique no seu projeto `guia-de-nichos`
2. Clique em **"Settings"** (menu superior)
3. No menu lateral, clique em **"Environment Variables"**
4. Preencha assim:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** cole aqui sua chave (começa com `sk-ant-...`)
5. Clique em **"Save"**
6. Vá em **"Deployments"** → clique nos 3 pontinhos do último deploy → **"Redeploy"**

---

## Como obter sua chave da Anthropic

1. Acesse https://console.anthropic.com
2. Crie uma conta se não tiver
3. Vá em **"API Keys"** → **"Create Key"**
4. Copie a chave gerada (ela começa com `sk-ant-...`)
5. ⚠️ Guarde ela em lugar seguro — ela só aparece uma vez!

---

## Pronto! 🎉

Seu site estará disponível em um endereço tipo:
`https://guia-de-nichos.vercel.app`

Você pode compartilhar esse link com qualquer pessoa.

---

## Custos

| Serviço | Custo |
|---------|-------|
| GitHub  | Gratuito |
| Vercel  | Gratuito (até 100GB de banda/mês) |
| Anthropic | Pago por uso (~R$0,10 a R$0,30 por análise completa) |

💡 **Dica:** Coloque um limite de gastos na Anthropic em Settings → Billing → Usage Limits para não ter surpresas.

---

## Problemas comuns

**"Application error" no site**
→ Verifique se adicionou a variável `ANTHROPIC_API_KEY` corretamente e fez o redeploy.

**"Build failed" na Vercel**
→ Verifique se fez upload de todos os arquivos da pasta, incluindo a pasta `src/`.

**O site carrega mas a IA não responde**
→ Sua chave da Anthropic pode estar inválida ou sem créditos. Verifique em console.anthropic.com.
