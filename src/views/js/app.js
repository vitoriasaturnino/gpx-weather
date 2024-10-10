import StateService from './data/states.js';
import CityService from './data/cities.js';

class MapController {
  constructor(containerId) {
    this.map = new ol.Map({
      target: containerId,
      layers: [
        new ol.layer.Tile({
          source: new ol.source.OSM(),
        }),
      ],
      view: new ol.View({
        center: ol.proj.fromLonLat([-51.9253, -14.235]),
        zoom: 4,
      }),
    });
  }

  updateMap(coordinates) {
    this.map.getView().setCenter(ol.proj.fromLonLat(coordinates));
    this.map.getView().setZoom(12);
  }
}

class WeatherService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.geoApiKey = '0b696f84c6de101cf0f2b3c8b1a666b3'; // Sua API Key para geoencoding
  }

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

class UIController {
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

  async loadStates() {
    const states = await this.stateService.getStates();
    states.forEach(state => {
      const option = document.createElement('option');
      option.value = state.code;
      option.textContent = state.name;
      this.stateSelect.appendChild(option);
    });
  }

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
