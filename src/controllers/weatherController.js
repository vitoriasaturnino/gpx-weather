import WeatherService from '../models/weatherService.js';

const getWeather = async (req, res) => {
  const city = req.query.city;
  if (!city) {
    return res.status(400).json({ error: 'Cidade é obrigatória' });
  }

  try {
    const weatherData = await WeatherService.getWeatherData(city);
    res.json(weatherData);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao obter dados de clima' });
  }
};

export default { getWeather };
