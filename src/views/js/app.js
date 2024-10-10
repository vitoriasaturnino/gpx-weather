import StateService from './data/states.js';
import CityService from './data/cities.js';

/**
 * Classe responsável por controlar o mapa utilizando a biblioteca OpenLayers.
 */
class MapController {
  /**
   * Cria uma instância de MapController.
   *
   * @param {string} containerId - O ID do contêiner HTML onde o mapa será renderizado.
   */
  constructor(containerId) {
    this.map = new ol.Map({
      target: containerId,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-51.9253, -14.235]), // Coordenadas do Brasil
        zoom: 4,
      }),
    });
  }

  /**
   * Atualiza a posição do mapa com base nas coordenadas fornecidas.
   *
   * @param {Array<number>} coordinates - Um array contendo [longitude, latitude].
   */
  updateMap(coordinates) {
    this.map.getView().setCenter(ol.proj.fromLonLat(coordinates));
    this.map.getView().setZoom(12);
  }
}

/**
 * Classe responsável por lidar com as requisições de clima e geocodificação.
 */
class WeatherService {
  /**
   * Cria uma instância de WeatherService.
   *
   * @param {string} apiKey - A chave de API da HG Brasil para requisições de clima.
   */
  constructor(apiKey) {
    /**
     * Chave da API HG Brasil.
     * @type {string}
     */
    this.apiKey = apiKey;

    /**
     * Chave da API OpenWeather para geocodificação.
     * @type {string}
     */
    this.geoApiKey = '0b696f84c6de101cf0f2b3c8b1a666b3'; // Sua API Key para geoencoding
  }

  /**
   * Obtém as coordenadas de uma cidade usando a API OpenWeather.
   *
   * @param {string} city - Nome da cidade.
   * @returns {Promise<Array<number>>} Um array contendo [longitude, latitude] ou null se não encontrado.
   */
  async getCityCoordinates(city) {
    const cityName = `${city},BR`;
    const geoUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${this.geoApiKey}`;

    try {
      const response = await fetch(geoUrl);
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        return [lon, lat];
      } else {
        throw new Error('Cidade não encontrada');
      }
    } catch (error) {
      console.error('Erro ao buscar coordenadas da cidade:', error);
      return null;
    }
  }

  /**
   * Obtém os dados de clima para uma cidade específica.
   *
   * @param {string} city - Nome da cidade.
   * @returns {Promise<Object>} Os dados de clima ou null se houver erro.
   */
  async getWeatherData(city) {
    try {
      const response = await fetch(`/api/weather?city=${city}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erro ao buscar dados de clima:', error);
      return null;
    }
  }
}

/**
 * Classe responsável por controlar a interface de usuário (UI).
 */
class UIController {
  /**
   * Cria uma instância de UIController.
   *
   * @param {MapController} mapController - A instância de MapController.
   * @param {WeatherService} weatherService - A instância de WeatherService.
   * @param {StateService} stateService - A instância de StateService.
   * @param {CityService} cityService - A instância de CityService.
   */
  constructor(mapController, weatherService, stateService, cityService) {
    this.mapController = mapController;
    this.weatherService = weatherService;
    this.stateService = stateService;
    this.cityService = cityService;
    this.stateSelect = document.getElementById('state');
    this.citySelect = document.getElementById('city');
    this.climateField = document.getElementById('climate');
    this.maxField = document.getElementById('max');
    this.minField = document.getElementById('min');
    this.moonField = document.getElementById('moon');
    this.forecastContainer = document.getElementById('forecastContainer');

    this.loadStates();
    this.addEventListeners();
  }

  /**
   * Carrega os estados do Brasil no dropdown utilizando a StateService.
   */
  async loadStates() {
    const states = await this.stateService.getStates();
    states.forEach(state => {
      const option = document.createElement('option');
      option.value = state.code;
      option.textContent = state.name;
      this.stateSelect.appendChild(option);
    });
  }

  /**
   * Carrega as cidades de um estado selecionado no dropdown.
   *
   * @param {string} stateCode - Código do estado selecionado.
   */
  async loadCities(stateCode) {
    this.citySelect.innerHTML = '<option value="">Selecione a cidade</option>';
    const cities = await this.cityService.getCities(stateCode);
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      this.citySelect.appendChild(option);
    });
  }

  /**
   * Traduz as fases da lua do inglês para o português.
   *
   * @param {string} phase - Fase da lua em inglês.
   * @returns {string} A fase da lua traduzida ou o valor original se não for encontrado.
   */
  translateMoonPhase(phase) {
    const phases = {
      'new_moon': 'Lua Nova',
      'waxing_crescent': 'Crescente',
      'first_quarter': 'Quarto Crescente',
      'waxing_gibbous': 'Gibosa Crescente',
      'full_moon': 'Lua Cheia',
      'waning_gibbous': 'Gibosa Minguante',
      'last_quarter': 'Quarto Minguante',
      'waning_crescent': 'Minguante',
    };
    return phases[phase] || phase;
  }

  /**
   * Exibe a previsão do tempo para os próximos 3 dias.
   *
   * @param {Array<Object>} forecast - Array de objetos contendo a previsão do tempo.
   */
  displayForecast(forecast) {
    this.forecastContainer.innerHTML = '';

    forecast.slice(1, 4).forEach(day => {
      const forecastItem = document.createElement('div');
      forecastItem.classList.add('forecast-item');
      forecastItem.innerHTML = `
        <div class="forecast-date"><strong>Data:</strong> ${day.date}</div>
        <div class="forecast-temp"><strong>Temperatura Máxima:</strong> ${day.max}°C</div>
        <div class="forecast-temp"><strong>Temperatura Mínima:</strong> ${day.min}°C</div>
        <div class="forecast-condition"><strong>Condição:</strong> ${day.description}</div>
        <div class="forecast-rain"><strong>Chance de Chuva:</strong> ${day.rain_probability}%</div>
      `;
      this.forecastContainer.appendChild(forecastItem);
    });
  }

  /**
   * Adiciona os listeners de eventos para interações do usuário.
   */
  addEventListeners() {
    this.stateSelect.addEventListener('change', async () => {
      const stateCode = this.stateSelect.value;
      if (stateCode) {
        await this.loadCities(stateCode);
      }
    });

    document.getElementById('fetchWeather').addEventListener('click', async () => {
      const city = this.citySelect.value;
      if (!city) {
        alert('Por favor, selecione uma cidade');
        return;
      }

      const coordinates = await this.weatherService.getCityCoordinates(city);
      if (coordinates) {
        this.mapController.updateMap(coordinates);
      }

      const weatherData = await this.weatherService.getWeatherData(city);
      if (weatherData) {
        this.climateField.value = weatherData.description;
        this.maxField.value = `${weatherData.forecast[0].max}°C`;
        this.minField.value = `${weatherData.forecast[0].min}°C`;
        this.moonField.value = this.translateMoonPhase(weatherData.moon_phase);

        this.displayForecast(weatherData.forecast);
      }
    });
  }
}

// Instanciando os serviços e controladores
const mapController = new MapController('map');
const weatherService = new WeatherService();
const stateService = new StateService();
const cityService = new CityService();
const uiController = new UIController(mapController, weatherService, stateService, cityService);
