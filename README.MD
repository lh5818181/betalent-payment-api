# 💳 BeTalent — Multi-Gateway Payment API

<p align="center">
  <img alt="AdonisJS" src="https://img.shields.io/badge/AdonisJS-5E45FF?style=for-the-badge&logo=adonisjs&logoColor=white"/>
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white"/>
  <img alt="Docker" src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white"/>
  <img alt="Tests" src="https://img.shields.io/badge/Tests-50%2F50%20passing-brightgreen?style=for-the-badge"/>
</p>

---

## 📋 Sobre o Projeto

API RESTful de gerenciamento de pagamentos multi-gateway desenvolvida como solução para o **Teste Prático Back-end BeTalent**.

O sistema processa pagamentos através de múltiplos gateways de forma resiliente: ao realizar uma compra, a cobrança é tentada no gateway de maior prioridade. Em caso de falha, o sistema tenta automaticamente o próximo gateway disponível. Apenas se todos os gateways falharem o erro é retornado ao cliente.

### ✨ Destaques

- **Fallback automático** entre gateways por ordem de prioridade
- **Arquitetura modular** — novos gateways podem ser adicionados sem alterar o código existente
- **TDD** — 50 testes funcionais passando
- **Cálculo de valor via backend** — o cliente informa produtos e quantidades, o valor é calculado pelo servidor
- **Segurança** — apenas os 4 últimos dígitos do cartão são armazenados
- **Docker Compose** — ambiente completo com um único comando

---

## 🛠 Tecnologias Utilizadas

| Tecnologia | Versão | Função |
|---|---|---|
| [AdonisJS](https://adonisjs.com/) | v6 | Framework Node.js |
| [TypeScript](https://www.typescriptlang.org/) | v5 | Linguagem |
| [MySQL](https://www.mysql.com/) | 8.0 | Banco de dados |
| [Lucid ORM](https://lucid.adonisjs.com/) | v21 | ORM para banco de dados |
| [VineJS](https://vinejs.dev/) | v2 | Validação de dados |
| [Japa](https://japa.dev/) | v3 | Framework de testes |
| [Docker](https://www.docker.com/) | — | Containerização |
| [Axios](https://axios-http.com/) | v1 | Cliente HTTP para gateways |

---

## 📦 Requisitos

Para rodar o projeto localmente sem Docker:

- **Node.js** >= 20
- **npm** >= 10
- **MySQL** >= 8.0

Para rodar com Docker:

- **Docker** >= 24
- **Docker Compose** >= 2

---

## 🚀 Como Instalar e Rodar

### Opção 1 — Com Docker (recomendado)

```bash
# 1. Clone o repositório
git clone https://github.com/lh5818181/betalent-payment-api.git
cd betalent-payment-api/adonisjs-app

# 2. Copie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Suba todos os containers (MySQL + App + Gateways Mock)
docker-compose up -d

# 4. Execute as migrations e o seeder
docker-compose exec app node ace migration:run
docker-compose exec app node ace db:seed
```

A API estará disponível em `http://localhost:3333`.

---

### Opção 2 — Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/lh5818181/betalent-payment-api.git
cd betalent-payment-api/adonisjs-app

# 2. Instale as dependências
npm install

# 3. Copie e configure o arquivo de variáveis de ambiente
cp .env.example .env
```

**Configure o `.env` com suas credenciais do MySQL:**

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_DATABASE=betalent_db
```

```bash
# 4. Suba os mocks dos gateways
docker run -d -p 3001:3001 -p 3002:3002 matheusprotzen/gateways-mock

# 5. Execute as migrations e o seeder
node ace migration:run
node ace db:seed

# 6. Inicie o servidor
node ace serve --watch
```

A API estará disponível em `http://localhost:3333`.

---

### Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|---|---|---|
| `PORT` | Porta da aplicação | `3333` |
| `HOST` | Host da aplicação | `localhost` |
| `APP_KEY` | Chave secreta da aplicação | `gerada automaticamente` |
| `DB_HOST` | Host do MySQL | `127.0.0.1` |
| `DB_PORT` | Porta do MySQL | `3306` |
| `DB_USER` | Usuário do MySQL | `root` |
| `DB_PASSWORD` | Senha do MySQL | `root` |
| `DB_DATABASE` | Nome do banco | `betalent_db` |

---

## 🛣 Rotas da API

### Rotas Públicas

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/signup` | Criar conta |
| `POST` | `/api/v1/auth/login` | Login |
| `POST` | `/payments` | Realizar pagamento |

### Rotas Privadas (requerem `Authorization: Bearer <token>`)

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/v1/auth/logout` | Logout |
| `GET` | `/api/v1/account/profile` | Ver perfil |
| `GET` | `/products` | Listar produtos |
| `GET` | `/products/:id` | Detalhe do produto |
| `POST` | `/products` | Criar produto |
| `PUT` | `/products/:id` | Atualizar produto |
| `DELETE` | `/products/:id` | Deletar produto |
| `GET` | `/clients` | Listar clientes |
| `GET` | `/clients/:id` | Detalhe do cliente com compras |
| `GET` | `/transactions` | Listar transações |
| `GET` | `/transactions/:id` | Detalhe da transação |
| `GET` | `/gateways` | Listar gateways |
| `PATCH` | `/gateways/:id/toggle` | Ativar/desativar gateway |
| `PATCH` | `/gateways/:id/priority` | Alterar prioridade do gateway |

---

### Exemplos de Requisição

#### POST /api/v1/auth/signup
```json
{
  "fullName": "João Silva",
  "email": "joao@email.com",
  "password": "senha123",
  "passwordConfirmation": "senha123"
}
```
**Resposta 201:**
```json
{
  "data": {
    "token": "oat_xxx...",
    "user": { "id": 1, "fullName": "João Silva", "email": "joao@email.com" }
  }
}
```

---

#### POST /payments
```json
{
  "clientId": 1,
  "products": [
    { "id": 1, "quantity": 2 },
    { "id": 2, "quantity": 1 }
  ],
  "cardNumber": "5569000000006063",
  "cvv": "010"
}
```
**Resposta 201:**
```json
{
  "status": "paid",
  "amount": 38000,
  "gateway": "Gateway 1",
  "transactionId": 1
}
```

---

#### PATCH /gateways/:id/priority
```json
{
  "priority": 2
}
```

---

### Códigos de Resposta

| Código | Descrição |
|---|---|
| `200` | Sucesso |
| `201` | Criado com sucesso |
| `401` | Não autenticado |
| `404` | Recurso não encontrado |
| `422` | Erro de validação |
| `400` | Pagamento recusado em todos os gateways |

---

## 🏗 Arquitetura e Decisões Técnicas

### Estrutura do Projeto

```
adonisjs-app/
├── app/
│   ├── controllers/          # Camada HTTP — recebe e responde requisições
│   │   ├── payments_controller.ts
│   │   ├── products_controller.ts
│   │   ├── clients_controller.ts
│   │   ├── transactions_controller.ts
│   │   ├── gateways_controller.ts
│   │   ├── access_token_controller.ts
│   │   └── new_account_controller.ts
│   ├── models/               # Models Lucid ORM
│   │   ├── user.ts
│   │   ├── client.ts
│   │   ├── product.ts
│   │   ├── transaction.ts
│   │   └── gateway.ts
│   ├── services/
│   │   └── payment_service.ts  # Lógica de negócio dos pagamentos
│   └── validators/           # Validação com VineJS
├── database/
│   ├── migrations/           # Estrutura do banco
│   └── seeders/              # Dados iniciais (gateways e produtos)
├── start/
│   └── routes.ts             # Definição de todas as rotas
└── tests/
    └── functional/           # 50 testes funcionais
```

---

### Multi-Gateway — Como Funciona

O sistema busca os gateways ativos ordenados por prioridade e tenta cada um em sequência:

```
Requisição de pagamento
        │
        ▼
┌───────────────┐     sucesso    ┌─────────────────┐
│   Gateway 1   │ ─────────────▶ │ Salva no banco  │
│  (prioridade 1)│               │ Retorna 201     │
└───────────────┘                └─────────────────┘
        │ falha
        ▼
┌───────────────┐     sucesso    ┌─────────────────┐
│   Gateway 2   │ ─────────────▶ │ Salva no banco  │
│  (prioridade 2)│               │ Retorna 201     │
└───────────────┘                └─────────────────┘
        │ falha
        ▼
  Retorna 400
```

Para adicionar um novo gateway basta inserir um registro na tabela `gateways` e implementar o método correspondente no `PaymentService`. Nenhuma outra parte do código precisa ser alterada.

---

### Segurança

- Senhas armazenadas com hash via **scrypt** (padrão do AdonisJS)
- Apenas os **4 últimos dígitos** do cartão são persistidos no banco
- Autenticação via **Access Tokens** (opaque tokens) com expiração
- Rotas privadas protegidas pelo middleware `auth`
- Credenciais dos gateways armazenadas apenas no código do service, nunca expostas nas respostas

---

## 🧪 Testes

O projeto utiliza **TDD** com o framework **Japa**, integrado ao AdonisJS. São **50 testes funcionais** cobrindo todos os endpoints da API.

### Executar os Testes

```bash
# Rodar todos os testes
node ace test functional

# Rodar testes de um módulo específico
node ace test functional --files="tests/functional/payments"
node ace test functional --files="tests/functional/auth"
node ace test functional --files="tests/functional/products"
node ace test functional --files="tests/functional/clients"
node ace test functional --files="tests/functional/transactions"
node ace test functional --files="tests/functional/gateways"
```

### Cobertura dos Testes

| Módulo | Testes | Cenários cobertos |
|---|---|---|
| **Auth** | 9 | Signup, login, logout, validações |
| **Payments** | 8 | Gateway 1, fallback Gateway 2, falha total, validações |
| **Products** | 10 | CRUD completo, autenticação, 404 |
| **Clients** | 5 | Listagem, detalhe com transações, 404 |
| **Transactions** | 10 | Listagem, detalhe, cardLastNumbers, 404 |
| **Gateways** | 8 | Toggle, prioridade, ordenação, 404 |
| **Total** | **50** | **50/50 passando ✅** |

### Estratégia de Testes

- Cada teste roda dentro de uma **transação global** que é revertida ao final — o banco nunca fica sujo entre testes
- Testes de autenticação usam emails únicos por teste para evitar conflitos
- O `dns.setDefaultResultOrder('ipv4first')` garante conexão IPv4 com os gateways no Windows/Node 18+
- Os testes de pagamento fazem chamadas reais aos gateways mock — é necessário que os containers estejam rodando

### Pré-requisitos para rodar os testes

```bash
# Os containers precisam estar no ar
docker-compose up -d

# Verificar se os gateways estão acessíveis
curl http://localhost:3001
curl http://localhost:3002
```
---

## ✅ O que foi Implementado

### Nível 2 — Completo

- [x] Valor da compra calculado via backend (produtos × quantidades)
- [x] Suporte a múltiplos produtos por pedido
- [x] Gateways com autenticação (Bearer token e headers)
- [x] Fallback automático entre gateways por prioridade
- [x] CRUD de produtos
- [x] Listagem de clientes e detalhe com histórico de compras
- [x] Listagem de transações e detalhe
- [x] Ativar/desativar gateway
- [x] Alterar prioridade de gateway
- [x] Autenticação via Access Tokens
- [x] Validação de dados com VineJS
- [x] TDD com 50 testes funcionais passando
- [x] Docker Compose com MySQL, aplicação e mock dos gateways
- [x] Apenas os 4 últimos dígitos do cartão são armazenados
- [x] README detalhado

### Pendente (Nível 3)

- [ ] Roles de usuário (ADMIN, MANAGER, FINANCE, USER)
- [ ] CRUD de usuários com validação por roles
- [ ] Reembolso de transação junto ao gateway

---

## 🗄 Estrutura do Banco de Dados

```
users               clients
─────────           ───────
id                  id
full_name           name
email               email
password            created_at
created_at          updated_at
updated_at
                    transactions
gateways            ────────────
────────            id
id                  client_id (FK)
name                gateway_id (FK)
is_active           external_id
priority            status
created_at          amount
updated_at          card_last_numbers
                    created_at
products            updated_at
────────
id                  transaction_products
name                ────────────────────
amount              id
created_at          transaction_id (FK)
updated_at          product_id (FK)
                    quantity
```

---

## 📝 Considerações Finais

O projeto foi desenvolvido seguindo as boas práticas de desenvolvimento de APIs RESTful, com foco em:

- **Modularidade** — o sistema de gateways foi projetado para ser facilmente extensível. Adicionar um novo gateway requer apenas um novo método no `PaymentService` e um registro no banco, sem impacto no restante do código.

- **Confiabilidade** — o uso de transações de banco de dados garante que nenhum pagamento seja salvo parcialmente em caso de erro.

- **Segurança** — dados sensíveis como senha e número do cartão nunca são armazenados em texto puro ou de forma completa.

- **Qualidade** — TDD foi aplicado desde o início, garantindo que todas as funcionalidades estejam cobertas por testes automatizados.

---

## ⚠️ Observações Importantes

### Banco de Dados para Testes

Os testes funcionais utilizam transações globais que são revertidas ao final de cada teste, mantendo o banco limpo. No entanto, **se houver dados reais no banco** (criados via API manualmente), o rollback pode falhar por restrições de chave estrangeira.

**Recomendação:** Use um banco separado para testes criando um `.env.test`:
```env
DB_DATABASE=betalent_db_test
```

Ou limpe o banco antes de rodar os testes:
```sql
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE transaction_products;
TRUNCATE TABLE transactions;
TRUNCATE TABLE gateways;
TRUNCATE TABLE products;
TRUNCATE TABLE clients;
TRUNCATE TABLE users;
TRUNCATE TABLE auth_access_tokens;
SET FOREIGN_KEY_CHECKS = 1;
```

Depois rode o seeder novamente:
```bash
node ace db:seed
```

---

## 👨‍💻 Autor

Desenvolvido por **Luís Henrique** como solução para o Teste Prático Back-end BeTalent.
