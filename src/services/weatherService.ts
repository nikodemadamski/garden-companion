export interface WeatherData {
    temperature: number;
    rainSum24h: number;
    isRaining: boolean;
    locationName: string;
}

export interface HistoricalWeatherData {
    date: string;
    maxTemp: number;
    rainSum: number;
    weatherCode: number; // 0=Sun, 1-3=Cloud, >50=Rain
}

export async function fetchLocalWeather(latitude: number, longitude: number): Promise<WeatherData> {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,rain&daily=rain_sum&timezone=auto&forecast_days=1`
        );
        const data = await response.json();

        return {
            temperature: data.current.temperature_2m,
            isRaining: data.current.rain > 0,
            rainSum24h: data.daily.rain_sum[0],
            locationName: "Local Garden"
        };
    } catch (error) {
        console.error("Failed to fetch weather", error);
        return {
            temperature: 22,
            rainSum24h: 0,
            isRaining: false,
            locationName: "Local Garden (Offline)"
        };
    }
}

export async function fetchHistoricalWeather(latitude: number, longitude: number): Promise<HistoricalWeatherData[]> {
    try {
        // Calculate dates for last 7 days
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);

        const formatDate = (d: Date) => d.toISOString().split('T')[0];

        const response = await fetch(
            `https://archive-api.open-meteo.com/v1/archive?latitude=${latitude}&longitude=${longitude}&start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}&daily=temperature_2m_max,rain_sum,weather_code&timezone=auto`
        );
        const data = await response.json();

        if (!data.daily) return [];

        return data.daily.time.map((time: string, index: number) => ({
            date: time,
            maxTemp: data.daily.temperature_2m_max[index],
            rainSum: data.daily.rain_sum[index],
            weatherCode: data.daily.weather_code[index]
        }));
    } catch (error) {
        console.error("Failed to fetch historical weather", error);
        return [];
    }
}
