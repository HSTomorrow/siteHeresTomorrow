# Guia de Deployment - HeresTomorrow no fly.io

## Status Atual
✅ **Código está pronto para deployment no fly.io**

## Pré-requisitos
- CLI do `flyctl` instalado
- Conta no fly.io
- Login realizado: `flyctl auth login`

## Deploy Rápido

### Opção 1: Atualizar App Existente
```bash
# Fazer deploy na app existente (siteherestomorrow)
flyctl deploy -a siteherestomorrow
```

### Opção 2: Criar Nova App
```bash
# Criar nova app do zero
flyctl launch

# Quando perguntar:
# - App name: siteherestomorrow
# - Region: gru (São Paulo)
# - Database? No
# - Deploy? Yes
```

## Após o Deploy

### Acessar a aplicação
```bash
# Abrir no navegador
flyctl open -a siteherestomorrow

# Ou manualmente: https://siteherestomorrow.fly.dev
```

### Monitorar logs
```bash
# Ver logs em tempo real
flyctl logs -a siteherestomorrow

# Ver últimas 100 linhas
flyctl logs -a siteherestomorrow -n 100
```

### Status da aplicação
```bash
# Ver informações gerais
flyctl status -a siteherestomorrow

# Ver máquinas
flyctl machines list -a siteherestomorrow
```

## Troubleshooting

### Se a aplicação não subir:
1. Verificar logs: `flyctl logs -a siteherestomorrow`
2. Reiniciar máquina: `flyctl machines restart <machine-id>`
3. Aumentar timeout do health check no `fly.toml`

### Se o CSS/design não aparecer:
- Verificar se arquivos estáticos estão sendo servidos (pasta `dist/spa`)
- Verificar logs do servidor para erros de path

### Se houver erro de porta:
- A porta 8080 é configurada internamente
- fly.io mapeia automaticamente para 80/443

## Configuração Importante

### Variáveis de Ambiente
```bash
# Definir variáveis se necessário
flyctl secrets set CHAVE=valor -a siteherestomorrow

# Ver variáveis atuais
flyctl secrets list -a siteherestomorrow
```

### Customizar Domínio
```bash
# Adicionar domínio customizado (ex: herestomorrow.com)
flyctl certs add herestomorrow.com -a siteherestomorrow

# Listar certificados
flyctl certs list -a siteherestomorrow
```

## Stack Utilizado
- **Node.js**: 22 (Alpine Linux)
- **Frontend**: React + Vite (SPA)
- **Backend**: Express.js
- **CSS**: Tailwind CSS
- **Linguagens**: Português, Inglês, Espanhol, Italiano, Francês

## Estrutura do Deploy
```
Dockerfile (multi-stage build)
├── Builder Stage
│   ├── Instala dependências
│   ├── Faz build do frontend (Vite)
│   ├── Faz build do backend (Express)
│   └── node_modules completo
│
└── Runtime Stage
    ├── Node 22 Alpine (pequeno)
    ├── node_modules de produção
    ├── dist/spa (frontend compilado)
    ├── dist/server (servidor compilado)
    └── public (assets estáticos)
```

## Performance
- **Tamanho da imagem**: ~500MB (otimizado com Alpine)
- **Startup time**: ~3-5 segundos
- **Health check**: TCP na porta 8080
- **Grace period**: 45 segundos para inicialização

## Próximos Passos Opcionais
1. Configurar domínio customizado
2. Adicionar CORS policies específicas
3. Implementar caching de assets
4. Configurar auto-scaling

## Links Úteis
- fly.io Dashboard: https://fly.io/apps/siteherestomorrow
- fly.io Docs: https://fly.io/docs/
- CLI Docs: https://fly.io/docs/reference/flyctl-commands/
