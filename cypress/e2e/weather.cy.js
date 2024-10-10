describe('Weather Forecast App', () => {
  beforeEach(() => {
    // Visita a página inicial da aplicação
    cy.visit('http://localhost:3000');
  });

  it('should load the page correctly', () => {
    // Verifica se o título da página está correto
    cy.title().should('eq', 'Weather Map');

    // Verifica se os dropdowns de estado e cidade estão presentes
    cy.get('#state').should('exist');
    cy.get('#city').should('exist');
  });

  it('should load states and cities dropdowns', () => {
    // Seleciona um estado e verifica se as cidades são carregadas corretamente
    cy.get('#state').select('SP'); // Seleciona o estado de São Paulo
    cy.get('#city').should('have.length.greaterThan', 1); // Verifica se mais de uma cidade foi carregada
  });

  it('should fetch and display weather data', () => {
    // Simula a seleção de um estado e uma cidade
    cy.get('#state').select('SP');
    cy.get('#city').select('São Paulo');

    // Clica no botão para buscar o clima
    cy.get('#fetchWeather').click();

    // Verifica se os dados de clima são exibidos
    cy.get('#climate').should('not.be.empty'); // Verifica se o campo de clima não está vazio
    cy.get('#max').should('not.be.empty'); // Verifica se o campo de temperatura máxima não está vazio
    cy.get('#min').should('not.be.empty'); // Verifica se o campo de temperatura mínima não está vazio
    cy.get('#moon').should('not.be.empty'); // Verifica se o campo de fase da lua não está vazio
  });

  it('should update the map with the correct coordinates', () => {
    // Simula a seleção de uma cidade e busca o clima
    cy.get('#state').select('SP');
    cy.get('#city').select('São Paulo');
    cy.get('#fetchWeather').click();

    // Verifica se o mapa foi atualizado com novas coordenadas
    cy.window().then(win => {
      const map = win.olMap; // Assume que você tenha exposto o mapa como 'olMap'
      const center = map.getView().getCenter();
      expect(center).to.not.deep.equal([-51.9253, -14.235]); // O mapa foi atualizado
    });
  });

  it('should display weather forecast for the next 3 days', () => {
    // Simula a seleção de um estado e uma cidade
    cy.get('#state').select('SP');
    cy.get('#city').select('São Paulo');
    cy.get('#fetchWeather').click();

    // Verifica se a previsão do tempo para os próximos 3 dias está sendo exibida
    cy.get('#forecastContainer .forecast-item').should('have.length', 3); // Deve ter 3 dias de previsão
  });
});
