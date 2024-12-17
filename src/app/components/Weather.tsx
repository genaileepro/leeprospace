'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { WeatherData } from '../types/weather';

const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        if (!API_KEY) {
          throw new Error('API 키가 설정되지 않았습니다.');
        }

        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Seoul&units=metric&appid=${API_KEY}&lang=kr`
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('API 키가 유효하지 않거나 아직 활성화되지 않았습니다. (활성화까지 최대 2시간 소요)');
          }
          throw new Error(`날씨 정보를 가져오는데 실패했습니다. (상태 코드: ${response.status})`);
        }

        const data = await response.json();
        setWeather(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 1800000);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <motion.div
        className="bg-gradient-to-br from-red-900/20 to-red-800/20 p-6 rounded-2xl shadow-lg border border-red-800/50"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.h2 
          className="text-xl font-bold mb-2 text-red-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          날씨 정보 오류
        </motion.h2>
        <motion.p 
          className="text-red-300"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {error}
        </motion.p>
        <motion.p 
          className="text-sm text-red-400/80 mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          OpenWeatherMap API 키를 확인해주세요:{' '}
          <a
            href="https://home.openweathermap.org/api_keys"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-red-300"
          >
            API 키 관리
          </a>
        </motion.p>
      </motion.div>
    );
  }

  if (isLoading || !weather) {
    return (
      <motion.div
        className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-2 text-gray-400">서울 날씨</h2>
        <div className="space-y-2">
          <div className="animate-pulse bg-gray-700 h-8 w-32 rounded"></div>
          <div className="animate-pulse bg-gray-700 h-6 w-24 rounded"></div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-lg border border-gray-700"
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <motion.h2 
        className="text-lg font-semibold text-gray-400 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        서울 날씨
      </motion.h2>
      <div className="flex items-center">
        <motion.img
          src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
          alt={weather.weather[0].description}
          className="w-20 h-20"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        />
        <div className="ml-4">
          <motion.p 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            {Math.round(weather.main.temp)}°C
          </motion.p>
          <motion.p 
            className="text-gray-400 mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {weather.weather[0].description}
          </motion.p>
        </div>
      </div>
      <motion.div 
        className="mt-4 space-y-2 text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <p>체감온도: {Math.round(weather.main.feels_like)}°C</p>
        <p>최저/최고: {Math.round(weather.main.temp_min)}°C / {Math.round(weather.main.temp_max)}°C</p>
      </motion.div>
    </motion.div>
  );
} 