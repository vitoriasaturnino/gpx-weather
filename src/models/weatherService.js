import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Serviço responsável por buscar e armazenar dados de previsão do tempo.
 * Utiliza a API do HG Brasil para obter as informações climáticas.
 * Implementa um mecanismo de cache para reduzir o número de requisições à API.
 */
class WeatherService {
  /**
   * Cria uma instância de WeatherService.
   * Carrega a chave da API do arquivo .env e inicializa o cache.
   */
  constructor() {
    /**
     * Chave da API do HG Brasil carregada a partir do arquivo .env.
     * @type {string}
     */
    this.apiKey = process.env.HG_BRASIL_API_KEY;

    /**
     * Cache para armazenar os dados da previsão do tempo.
     * O cache utiliza o nome da cidade como chave.
     * @type {Object}
     */
    this.cache = {};

    /**
     * Duração do cache em milissegundos (24 horas).
     * @type {number}
     */
    this.cacheDuration = 24 * 60 * 60 * 1000; // 24 horas
  }

  /**
   * Obtém os dados da previsão do tempo do cache.
   * Verifica se os dados no cache ainda são válidos com base na duração do cache.
   *
   * @param {string} city - Nome da cidade.
   * @returns {Object|null} Os dados da previsão do tempo ou null se não estiver no cache ou estiver expirado.
   */
  getFromCache(city) {
    const cachedData = this.cache[city];
    if (!cachedData) return null;
    const now = new Date().getTime();
    if (now - cachedData.timestamp > this.cacheDuration) {
      delete this.cache[city]; // Remove dados expirados
      return null;
    }
    return cachedData.data;
  }

  /**
   * Salva os dados da previsão do tempo no cache.
   *
   * @param {string} city - Nome da cidade.
   * @param {Object} data - Dados da previsão do tempo para a cidade.
   */
  saveToCache(city, data) {
    this.cache[city] = {
      timestamp: new Date().getTime(),
      data: data,
    };
  }

  /**
   * Obtém os dados de previsão do tempo para uma cidade, utilizando o cache quando possível.
   * Caso os dados não estejam no cache ou estejam expirados, uma nova requisição à API do HG Brasil é feita.
   *
   * @param {string} city - Nome da cidade.
   * @returns {Promise<Object>} Dados da previsão do tempo.
   * @throws {Error} Se ocorrer um erro ao obter os dados da API.
   */
  async getWeatherData(city) {
    const cachedData = this.getFromCache(city);
    if (cachedData) {
      console.log(`Usando cache para a cidade: ${city}`);
      return cachedData;
    }

    try {
      const response = await fetch(
        `https://api.hgbrasil.com/weather?key=${this.apiKey}&city_name=${city}`
      );
      const data = await response.json();
      if (data && data.results) {
        this.saveToCache(city, data.results); // Salva no cache
        return data.results;
      }
      throw new Error('Erro ao obter dados de clima');
    } catch (error) {
      console.error('Erro ao buscar dados da API:', error);
      throw error;
    }
  }
}

export default new WeatherService();
