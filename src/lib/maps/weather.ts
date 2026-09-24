export type WeatherSnapshot = {
  celsius: number;
  summary: string;
  travel: string;
  source: "configured" | "unavailable";
};

export type WeatherProvider = {
  current(lat: number, lng: number): Promise<WeatherSnapshot | null>;
};

export const weatherProvider: WeatherProvider = {
  async current() {
    if (!process.env.NEXT_PUBLIC_WEATHER_PROVIDER) return null;
    return null;
  },
};
