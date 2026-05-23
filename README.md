# Agende sua consulta

MVP SaaS mobile-first para profissionais autonomos venderem servicos por link publico de agendamento.

## Escopo Tecnico do MVP

- Dashboard do profissional: perfil, servicos, horarios de trabalho, agenda visual e metricas basicas.
- Link publico: escolha de servico, dia, horario livre, nome, WhatsApp e confirmacao.
- Anti-esquecimento: geracao de template de mensagem para WhatsApp no momento da confirmacao.
- Login por hierarquia: Administrador, Barbeiro e Usuario.
- Pagamento: agendamento com pagamento presencial e controle posterior de status pelo Admin/Barbeiro.
- Stack: Next.js App Router, TypeScript, Tailwind CSS, Prisma, SQLite local e NextAuth pronto para evoluir.

## Estrutura de Pastas

```txt
prisma/
  schema.prisma
src/
  app/
    agendamento/
      page.tsx
    [slug]/
      page.tsx
    dashboard/
      page.tsx
    login/
      page.tsx
    globals.css
    layout.tsx
    page.tsx
  components/
    auth/
      LoginPanel.tsx
    booking/
      PublicBookingPage.tsx
    dashboard/
      RoleDashboard.tsx
    ui/
      button.tsx
      input.tsx
  lib/
    mock-data.ts
    prisma.ts
    slots.ts
    utils.ts
  types/
    booking.ts
```

## Comandos

```bash
npm install
npm run prisma:generate
npm run dev
```

Use `DATABASE_URL="file:./dev.db"` no `.env` para rodar com SQLite local.

URL local estabilizada:

- `http://localhost:3002`

Fluxo principal:

- `/`: site unico. Mostra a pagina publica, abre login no proprio fluxo e exibe o dashboard conforme a hierarquia logada.
- `/login`: atalho tecnico para login.
- `/dashboard`: atalho tecnico para area interna.
- `/agendamento`: pagina publica de agendamento.
- `/joao-barber`: rota antiga mantida como compatibilidade.

Credenciais do MVP:

- Administrador: `admin` / `barber1`
- Barbeiro: `barber` / `barber`
- Usuario: `usuario` / `usuario`

Registro de usuarios:

- A tela de login possui a opcao `Registrar-se`.
- Novas contas entram com hierarquia padrao `Usuario`.
- Campos obrigatorios: login, senha, nome completo, apelido, celular com DDD e e-mail valido.
- O MVP envia confirmacao de e-mail via API route quando `RESEND_API_KEY` esta configurada.
- Sem `RESEND_API_KEY`, o envio fica simulado e mostra um link de confirmacao de teste.
- O Administrador ve as confirmacoes pendentes em `Administracao > Contas`.

Variaveis para envio real na Vercel:

```txt
RESEND_API_KEY=chave_da_resend
EMAIL_FROM="Agende sua consulta <noreply@seudominio.com>"
```

## Deploy na Vercel

O projeto ja esta preparado para deploy na Vercel.

Arquivos de deploy adicionados:

- `.gitignore`: ignora `node_modules`, caches do Next e variaveis locais.
- `.vercelignore`: evita enviar caches locais para a Vercel.
- `.env.example`: modelo de variaveis de ambiente.
- `vercel.json`: define Next.js, install e build command.

Passos recomendados:

```bash
git init
git add .
git commit -m "Preparar MVP para deploy na Vercel"
```

Depois:

1. Crie um repositorio no GitHub.
2. Envie este projeto para o repositorio.
3. Na Vercel, clique em `Add New > Project`.
4. Importe o repositorio.
5. Framework Preset: `Next.js`.
6. Build Command: `npm run build`.
7. Install Command: `npm install`.
8. Deploy.

Neste MVP, nenhum env obrigatorio e necessario para subir, pois os dados ainda usam mock/localStorage.
Quando conectar banco real, use PostgreSQL e configure `DATABASE_URL` na Vercel.
