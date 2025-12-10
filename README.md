# Check&Go - Queue Management System

## 1. Visão Geral do Projeto

O **Check&Go** é um sistema de gestão de filas e senhas (Queue/Ticket Management System) implementado com uma arquitetura backend-heavy em Node.js/Express e um frontend leve em Vanilla JavaScript.

O sistema foi concebido para digitalizar o processo de atendimento ao público em lojas, permitindo aos utilizadores retirar senhas remotamente e acompanhar o tempo de espera em tempo real.

O projeto demonstra a implementação de:
- **Comunicação em Tempo Real** através de polling eficiente em rotas públicas e protegidas
- **Segurança de Nível Empresarial (RBAC)** com autenticação personalizada de dois fatores (Supabase Auth + Token de Sessão em DB) e filtragem de recursos
- **Arquitetura Modular** com camadas de acesso a dados (Operadores BD) e modelos de domínio bem definidos
- **Processo de Desenvolvimento Moderno** incluindo CI/CD com GitHub Actions e deploy serverless com Vercel

## 2. Tecnologias e Stack

| Categoria | Tecnologia | Justificativa de Uso |
|-----------|-----------|----------------------|
| **Backend / API** | Node.js (v20+), Express.js | Ambiente de execução performático e framework minimalista para API RESTful |
| **Base de Dados** | Supabase (PostgreSQL) | BaaS que providencia autenticação (Auth), PostgreSQL robusto, e capacidades de Realtime |
| **Autenticação** | Supabase Auth + JWT / UUID | Sistema de autenticação robusto com token de sessão único persistido na tabela users |
| **Deploy** | Vercel (Serverless Functions) | Plataforma para deploy contínuo da API Express como Serverless Function |
| **Frontend** | HTML5, CSS3, ES Modules (Vanilla JS) | Desenvolvimento focado na funcionalidade e portabilidade |
| **CI/CD** | GitHub Actions | Automatização do processo de teste de conexão com a base de dados |

## 3. Arquitetura do Sistema

### 3.1. Camada de Apresentação (Frontend - /public)
- Interface do Utilizador (HTML/CSS) e lógica de interação (JavaScript)
- Utiliza ES Modules para gerir estado de autenticação e roteamento por permissões
- Realiza polling contínuo para simular tempo real

### 3.2. Camada de Aplicação (Backend - app.js)
- Define todas as rotas da API RESTful
- Centraliza lógica de Segurança e Autorização através de middlewares
- Coordena as classes da Camada de Dados

### 3.3. Camada de Domínio e Dados (/modelos, /operadorBD)
- **Modelos**: Implementa classes de domínio para garantir integridade dos dados
- **Operadores BD**: Encapsula interações com o Supabase usando Service Role Key

## 4. Segurança e Autorização (RBAC)

### 4.1. Autenticação Personalizada
1. Login com email/password via Supabase Auth
2. Criação de Sessão DB com sessionToken (UUIDv4)
3. Armazenamento no localStorage do frontend

### 4.2. Controle de Acesso Baseado em Papéis
- **protegerRota**: Valida sessionToken contra tabela users
- **autorizarCargos**: Verifica permissões por role (Administrador, Gerente, Colaborador)

## 5. Funcionalidades Detalhadas

### Para o Utilizador Público

| Funcionalidade | Endpoint | Descrição |
|---|---|---|
| Pesquisa de Lojas | GET /lojas/publicas | Encontrar lojas por nome/morada |
| Escolher Serviço | GET /lojas/:id/servicos | Listar serviços ativos |
| Tirar Senha | POST /tirarSenha | Criar nova senha na fila |
| Acompanhar Fila | GET /fila/:loja_servico_id | Ver senha e contagem à frente |

### Para Colaboradores / Gerentes / Administradores

| Módulo | Funcionalidade | Papéis Permitidos |
|---|---|---|
| Fila Atendimento | Chamar Próximo | Colaborador, Gerente, Admin |
| Fila Atendimento | Concluir Senha | Colaborador, Gerente, Admin |
| CRUD Colaborador | Listar, Ver, Criar, Atualizar | Gerente, Admin |
| CRUD Loja | Listar, Ver, Atualizar | Gerente, Admin |
| CRUD Serviço | Listar, Criar, Atualizar, Apagar | Admin |

## 6. Processo de Desenvolvimento e Deploy

### 6.1. CI/CD com GitHub Actions
Automatiza testes de conectividade em cada push/pull_request

### 6.2. Configuração Serverless (Vercel)
Deploy simples e escalável via `vercel.json`

## Contribuições

| Dev | Responsabilidade |
|---|---|
| @Ricardolenovo153 | Backend Node.js, Supabase, CI/CD, GitHub Actions, Deploy, README, Frontend, RBAC  |
| @patricialuis1 | Documentação, Deploy Vercel, README, Correção de Bugs, Contribuições no Backend Node.js, Frontend |