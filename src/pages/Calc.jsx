// Страница за преобразуване на число от една бройна система в друга
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Calc = () => {
  const { t } = useTranslation(); // Hook за превод на текстове
  const navigate = useNavigate(); // Hook за навигация между страниците
  const [inputValue, setInputValue] = useState(''); // Състояние за входното число
  const [fromBase, setFromBase] = useState(10); // Състояние за избраната изходна бройна система
  const [toBase, setToBase] = useState(2); // Състояние за избраната целева бройна система
  const [result, setResult] = useState(''); // Състояние за резултата от преобразуването
  const [error, setError] = useState(''); // Състояние за съобщения за грешки
  const bases = [2, 8, 10, 16]; // Поддържани бройни системи

  const handleConvert = () => {
    setError(''); // изчистване на предишни грешки
    setResult(''); // изчистване на предишния резултат
    try {
      if (!inputValue) { // Проверка за празен вход
        setError('Моля, въведете число.');
        return;
      }
      // Проверка за валидност на входа
      const decimalValue = parseInt(inputValue, fromBase);
      if (isNaN(decimalValue)) { // дали числото е валидно в избраната бройна система
        setError('Невалидно число за избраната бройна система.');
        return;
      }
      const convertedValue = decimalValue.toString(toBase).toUpperCase(); // Преобразуване
      setResult(convertedValue); // Задаване на резултата
    } catch (error) {
      setError('Грешка при преобразуването.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 mt-10">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="mr-2">←</span> {t('back', { defaultValue: 'Назад' })}
      </button>

      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
        Преобразуване на бройни системи
      </h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Число
          </label>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value.trim())}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
            placeholder="Въведете число..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              От
            </label>
            <select
              value={fromBase}
              onChange={(e) => setFromBase(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none"
            >
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Към
            </label>
            <select
              value={toBase}
              onChange={(e) => setToBase(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all appearance-none"
            >
              {bases.map((base) => (
                <option key={base} value={base}>
                  {base}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleConvert}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
        >
          Преобразувай
        </button>

        {error && (
          <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-center">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
            <div className="flex flex-col items-center gap-3">
              <span className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider font-semibold">Резултат</span>
              <div className="flex items-center gap-3 w-full justify-center">
                <span className="text-3xl font-mono font-bold text-gray-900 dark:text-white break-all">
                  {result}
                </span>
              </div>
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Копирай
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calc;