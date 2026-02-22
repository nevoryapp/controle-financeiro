# FinMEI Dashboard

Sistema de controle financeiro para Microempreendedores Individuais (MEI/CNPJ).

## 🚀 Funcionalidades

- **Resumo Geral**: Visualização rápida de entradas, saídas e saldo do mês
- **Lançamentos**: Gerenciamento de transações com upload de notas fiscais
- **Débitos Recorrentes**: Controle de assinaturas e contas fixas mensais
- **Lembrete DAS MEI**: Alerta automático para pagamento do DAS (dia 20)
- **Notas Fiscais**: Galeria de documentos anexados
- **Links Úteis**: Acesso rápido a portais do governo e Sebrae

## 🛠️ Tecnologias

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** (componentes)
- **Supabase** (Auth, Database, Storage)
- **Recharts** (gráficos)
- **Lucide React** (ícones)

## 📋 Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com) (plano gratuito)

## 🔧 Configuração

### 1. Clone o repositório

```bash
cd "controle financeiro"
npm install
```

### 2. Configure o Supabase

1. Acesse [supabase.com](https://supabase.com) e crie um novo projeto
2. Vá em **Settings > API** e copie:
   - Project URL
   - anon public key

3. Crie um arquivo `.env.local` na raiz do projeto:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 3. Configure o Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Cole e execute o conteúdo do arquivo `supabase/schema.sql`

### 4. Configure o Storage

1. No Supabase, vá em **Storage**
2. Crie um novo bucket chamado `notas-fiscais`
3. Configure como **privado**
4. Em **Policies**, adicione as políticas do arquivo `supabase/schema.sql` (seção de Storage)

### 5. Configure o Google OAuth (opcional)

1. No Supabase, vá em **Authentication > Providers**
2. Ative o provider **Google**
3. Configure suas credenciais do Google Cloud Console

## 🚀 Executando

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build

# Iniciar produção
npm start
```

Acesse [http://localhost:3000](http://localhost:3000)

## 📱 Mobile-First

O FinMEI Dashboard foi projetado para funcionar perfeitamente em dispositivos móveis:
- Menu lateral responsivo
- Botão flutuante para adicionar lançamentos
- Interface adaptada para telas pequenas

## 🔒 Segurança

- **Row Level Security (RLS)**: Cada usuário só acessa seus próprios dados
- **Autenticação**: Email/senha + Google OAuth via Supabase Auth
- **Arquivos privados**: Notas fiscais protegidas por políticas de storage

## 📊 Estrutura do Projeto

```
src/
├── app/
│   ├── auth/callback/route.ts    # Callback OAuth
│   ├── dashboard/page.tsx        # Página principal
│   ├── globals.css               # Estilos globais
│   ├── layout.tsx                # Layout raiz
│   └── page.tsx                  # Página de login
├── components/
│   ├── auth-provider.tsx         # Contexto de autenticação
│   ├── dashboard/                # Componentes do dashboard
│   └── ui/                       # Componentes shadcn/ui
├── hooks/
│   └── use-toast.ts              # Hook de notificações
├── lib/
│   ├── data.ts                   # Dados estáticos (links, categorias)
│   ├── supabase.ts               # Cliente Supabase
│   └── utils.ts                  # Funções utilitárias
└── types/
    └── database.ts               # Tipos TypeScript
```

## 🎨 Personalização

### Cores

As cores podem ser personalizadas em `src/app/globals.css`:

```css
:root {
  --primary: 142.1 76.2% 36.3%;    /* Verde principal */
  --destructive: 0 84.2% 60.2%;     /* Vermelho para saídas */
  --success: 142.1 76.2% 36.3%;     /* Verde para entradas */
}
```

### Links Úteis

Os links podem ser editados em `src/lib/data.ts`.

## 📝 Licença

MIT

---

Desenvolvido com ❤️ para MEIs brasileiros
