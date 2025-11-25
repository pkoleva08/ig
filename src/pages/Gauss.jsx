// Страница за представяне на матрица в горно-триъгълна форма (метод на Гаус)
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const Gauss = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [rows, setRows] = useState(3);          // брой редове
  const [cols, setCols] = useState(3);          // брой колони
  const [matrix, setMatrix] = useState(createEmptyMatrix(3, 3)); // входна матрица
  const [resultMatrix, setResultMatrix] = useState(null);        // горно-триъгълна матрица
  const [steps, setSteps] = useState([]);       // стъпки от елиминацията
  const [error, setError] = useState('');       // съобщение за грешка

  function createEmptyMatrix(r, c) {
    return Array.from({ length: r }, () => Array(c).fill(''));
  }

  const handleResize = (newRows, newCols) => {
    const r = Math.max(1, Math.min(10, Number(newRows) || 1));
    const c = Math.max(1, Math.min(10, Number(newCols) || 1));
    setRows(r);
    setCols(c);

    setMatrix((prev) => {
      const next = createEmptyMatrix(r, c);
      for (let i = 0; i < Math.min(r, prev.length); i++) {
        for (let j = 0; j < Math.min(c, prev[0].length); j++) {
          next[i][j] = prev[i][j];
        }
      }
      return next;
    });

    setResultMatrix(null);
    setSteps([]);
    setError('');
  };

  const handleCellChange = (rIndex, cIndex, value) => {
    setMatrix((prev) => {
      const copy = prev.map((row) => [...row]);
      copy[rIndex][cIndex] = value;
      return copy;
    });
    setResultMatrix(null);
    setSteps([]);
    setError('');
  };

  const handleReset = () => {
    setMatrix(createEmptyMatrix(rows, cols));
    setResultMatrix(null);
    setSteps([]);
    setError('');
  };

  // Гаусова елиминация до горно-триъгълна матрица
  const handleGaussianElimination = () => {
    setError('');
    setResultMatrix(null);
    setSteps([]);

    try {
      const EPS = 1e-10;
      const r = rows;
      const c = cols;

      // превръщаме в числова матрица
      const a = matrix.map((row) =>
        row.map((val) => {
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        })
      );

      const logSteps = [];
      let row = 0;

      for (let col = 0; col < c && row < r; col++) {
        // търсим pivot с максимална абсолютна стойност в текущата колона
        let pivotRow = row;
        let maxVal = Math.abs(a[row][col]);

        for (let i = row + 1; i < r; i++) {
          const val = Math.abs(a[i][col]);
          if (val > maxVal) {
            maxVal = val;
            pivotRow = i;
          }
        }

        if (maxVal < EPS) {
          // колона с нулев pivot – прескачаме
          continue;
        }

        // разменяме редове при нужда
        if (pivotRow !== row) {
          const temp = a[row];
          a[row] = a[pivotRow];
          a[pivotRow] = temp;
          logSteps.push(`Разменяме R${row + 1} и R${pivotRow + 1} `);
        }

        // елиминираме елементите под pivot-а
        for (let i = row + 1; i < r; i++) {
          const factor = a[i][col] / a[row][col];
          if (Math.abs(factor) < EPS) continue;

          for (let j = col; j < c; j++) {
            a[i][j] = a[i][j] - factor * a[row][j];
            if (Math.abs(a[i][j]) < EPS) a[i][j] = 0; // чистим числов шум
          }

          logSteps.push(
            `R${i + 1} = R${i + 1} - (${factor.toFixed(3)}) · R${row + 1} `
          );
        }

        row++;
      }

      setResultMatrix(a);
      setSteps(logSteps);
    } catch (err) {
      console.error(err);
      setError('Възникна грешка при преобразуването.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="mr-2">←</span> {t('back', { defaultValue: 'Назад' })}
      </button>

      <h1 className="text-3xl font-bold text-center mb-4 text-gray-800 dark:text-white">
        Гаусов метод – представяне в горно-триъгълна форма
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
        Въведете размерите и елементите на матрицата. Натиснете
        <span className="font-bold mx-1">„Преобразувай“</span>, за да получите горно-триъгълната матрица чрез
        метода на Гаус.
      </p>

      {/* Контроли за размерите */}
      <div className="flex flex-wrap gap-4 justify-center items-end mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Редове</label>
          <input
            type="number"
            value={rows}
            onChange={(e) => handleResize(e.target.value, cols)}
            min="1"
            max="10"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Колони</label>
          <input
            type="number"
            value={cols}
            onChange={(e) => handleResize(rows, e.target.value)}
            min="1"
            max="10"
            className="w-24 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-center"
          />
        </div>
        <button
          onClick={handleReset}
          className="px-4 py-2 border border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium h-[42px]"
        >
          Нулирай матрицата
        </button>
      </div>

      {/* Входна матрица */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 text-center">Входна матрица A</h3>
        <div className="overflow-x-auto pb-4">
          <div
            className="grid gap-2 mx-auto w-fit p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(80px, 1fr))` }}
          >
            {matrix.map((rowArr, rIndex) =>
              rowArr.map((value, cIndex) => (
                <input
                  key={`${rIndex} -${cIndex} `}
                  type="number"
                  value={value}
                  onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                  step="any"
                  className="w-full p-2 text-center rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleGaussianElimination}
        className="w-full max-w-md mx-auto block py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 mb-8"
      >
        Преобразувай (метод на Гаус)
      </button>

      {error && (
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-center mb-8">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Резултатна матрица */}
        {resultMatrix && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Горно-триъгълна матрица U
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <tbody>
                  {resultMatrix.map((rowArr, rIndex) => (
                    <tr key={rIndex}>
                      {rowArr.map((val, cIndex) => (
                        <td
                          key={cIndex}
                          className="border border-gray-200 dark:border-gray-600 p-3 text-center font-mono text-gray-800 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/30 min-w-[60px]"
                        >
                          {Number(val).toFixed(3)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Стъпки на елиминацията */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Стъпки на елиминацията
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 font-mono text-sm">
              {steps.map((s, idx) => (
                <div key={idx} className="mb-2 text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700/50 last:border-0 last:pb-0">
                  • {s}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Gauss;