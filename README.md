# GPX Weather - Previsão do Tempo

Este projeto é uma aplicação web de previsão do tempo que permite aos usuários consultar a previsão dos próximos 3 dias, utilizando a API **HG Brasil Weather** e a API do **IBGE** para listar estados e cidades. O mapa interativo é implementado com **OpenLayers**.

## Requisitos Mínimos

- **Node.js**: v20.18.0
- **NPM**: v10.2.4 ou superior
- **Git**: Para clonar o repositório

## Configuração do Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/gpx-weather.git
```

### 2. Instale as dependências

Navegue até a pasta do projeto clonado e instale as dependências:

```bash
cd gpx-weather
npm install
```

### 3. Configuração das variáveis de ambiente

- Renomeie o arquivo `.env-sample` para `.env`:

  ```bash
  mv .env-sample .env
  ```

- Abra o arquivo `.env` e insira suas **API Keys** da **HG Brasil Weather** e outras chaves necessárias:

  ```
  HG_WEATHER_API_KEY=
  GEO_API_KEY=
  ```

### 4. Executando o projeto

Para iniciar o servidor, utilize o seguinte comando:

```bash
npm start
```

A aplicação estará rodando em [http://localhost:3000](http://localhost:3000).

### 5. Executando testes

#### Testes E2E

Para rodar os testes de ponta a ponta (E2E) com **Cypress**, execute o seguinte comando:

```bash
npm run dev
npx cypress open
```

## Funcionalidades

- Consulta de previsão do tempo para uma cidade escolhida.
- Exibição de previsão para os próximos 3 dias.
- Mapa interativo utilizando **OpenLayers**.
- Cache de requisições à API para evitar exceder o limite de 10 requisições diárias da API gratuita.

## Tecnologias Utilizadas

- **Node.js**
- **Express**
- **OpenLayers**
- **HG Brasil Weather API**
- **IBGE API**
- **JavaScript (ESModules)**
- **Cypress** (testes E2E)
