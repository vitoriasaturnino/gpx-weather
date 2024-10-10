class StateService {
  constructor() {
    this.baseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
  }

  async getStates() {
    const url = `${this.baseUrl}?orderBy=nome`;
    const response = await fetch(url);
    const data = await response.json();

    return data.map(state => ({
      code: state.sigla,
      name: state.nome,
    }));
  }
}

export default StateService;
