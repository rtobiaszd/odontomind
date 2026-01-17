
# OdontoMind AI 🦷🤖

> Sistema Operacional Autônomo para Clínicas e Laboratórios de Odontologia, integrado com Gemini 3 Pro e Google Workspace.

## 🚀 Tecnologias
- **Frontend**: React 19 + Tailwind CSS
- **IA**: Google Gemini API (@google/genai)
- **Auth**: Google Identity Services (OAuth 2.0)
- **Voice**: Gemini Live API (Native Audio)
- **Sync**: Zero-Persistence Architecture (Cliente-side Encryption)

## 📁 Estrutura do Projeto
- `/components`: Módulos de UI (CRM, Dashboard, Agenda)
- `/types.ts`: Definições de contratos de dados (B2B SaaS)
- `/syncService.ts`: Lógica de sincronização com o Workspace do cliente
- `/geminiService.ts`: Integrações de processamento de linguagem natural

## 🛠 Configuração
1. Clone o repositório: `git clone https://github.com/rtobiaszd/odontomind.git`
2. Configure as variáveis de ambiente:
   - `API_KEY`: Sua chave do Google AI Studio
   - `GOOGLE_CLIENT_ID`: Seu Client ID do Google Cloud Console

## 🛡 Segurança & Compliance
O projeto foi desenhado sob a premissa de **Zero Data Persistence**. Os dados clínicos residem apenas no navegador do usuário e são sincronizados diretamente com o Google Drive/Workspace do cliente final, garantindo conformidade com LGPD e HIPAA.
