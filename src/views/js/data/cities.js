class CityService {
  constructor() {
    this.baseUrl = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/';
  }

  async getCities(stateCode) {
    const url = `${this.baseUrl}${stateCode}/municipios?orderBy=nome`;
    const response = await fetch(url);
    const data = await response.json();

    return data.map(city => city.nome);
  }
}

export default CityService;
