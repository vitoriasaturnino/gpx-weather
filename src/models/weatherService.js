import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

class WeatherService {
  constructor() {
    this.apiKey = process.env.HG_BRASIL_API_KEY;
    this.cache = {};
    this.cacheDuration = 24 * 60 * 60 * 1000;
  }

  getFromCache(city) {
    const cachedData = this.cache[city];
    if (!cachedData) return null;
    const now = new Date().getTime();
    if (now - cachedData.timestamp > this.cacheDuration) {
      delete this.cache[city];
      return null;
    }
    return cachedData.data;
  }

  saveToCache(city, data) {
    this.cache[city] = {
      timestamp: new Date().getTime(),
      data: data,
    };
  }

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
        this.saveToCache(city, data.results);
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
