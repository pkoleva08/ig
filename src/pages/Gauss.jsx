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
  const [useRHS, setUseRHS] = useState(false); // включване на вектор b (RHS)
  const [bVector, setBVector] = useState(createEmptyB(3)); // вектор на свободните членове
  const [resultMatrix, setResultMatrix] = useState(null);        // горно-триъгълна матрица
  const [steps, setSteps] = useState([]);       // стъпки от елиминацията
  const [solution, setSolution] = useState(null); // решения на системата
  const [error, setError] = useState('');       // съобщение за грешка

  function createEmptyMatrix(r, c) {
    return Array.from({ length: r }, () => Array(c).fill(''));
  }

  function createEmptyB(r) {
    return Array.from({ length: r }, () => '');
  }

  // помощни функции за форматиране и snapshot
  function formatNum(n, decimals = 6) {
    if (typeof n !== 'number') n = Number(n);
    if (!isFinite(n)) return 'NaN';
    // премахваме ненужни нули, но запазваме някаква прегледност
    return Number(n.toFixed(decimals)).toString();
  }

  function formatRow(row, colsCount) {
    const entries = row.slice(0, colsCount).map((v) => formatNum(v, 3).padStart(8, ' '));
    const rhs = row[colsCount] !== undefined ? formatNum(row[colsCount], 3).padStart(8, ' ') : '';
    return '[ ' + entries.join(' ') + ' | ' + rhs.trim() + ' ]';
  }

  function formatAugMatrix(aug, colsCount) {
    return aug.map((r, i) => `R${i + 1}: ${formatRow(r, colsCount)}`).join('\n');
  }

  const handleResize = (newRows, newCols) => {
    const r = Math.max(1, Math.min(10, Number(newRows) || 1));
    const c = Math.max(1, Math.min(10, Number(newCols) || 1));
    setRows(r);
    setCols(c);

    setMatrix((prev) => {
      const next = createEmptyMatrix(r, c);
      for (let i = 0; i < Math.min(r, prev.length); i++) {
        for (let j = 0; j < Math.min(c, (prev[0] || []).length); j++) {
          next[i][j] = prev[i][j];
        }
      }
      return next;
    });

    setBVector((prev) => {
      const next = createEmptyB(r);
      for (let i = 0; i < Math.min(r, prev.length); i++) {
        next[i] = prev[i];
      }
      return next;
    });

    setResultMatrix(null);
    setSteps([]);
    setSolution(null);
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
    setSolution(null);
    setError('');
  };

  const handleBChange = (rIndex, value) => {
    setBVector((prev) => {
      const copy = [...prev];
      copy[rIndex] = value;
      return copy;
    });
    setResultMatrix(null);
    setSteps([]);
    setSolution(null);
    setError('');
  };

  const handleReset = () => {
    setMatrix(createEmptyMatrix(rows, cols));
    setResultMatrix(null);
    setSteps([]);
    setBVector(createEmptyB(rows));
    setSolution(null);
    setError('');
  };

  // Гаусова елиминация до горно-триъгълна матрица и (опционално) решение Ax = b
  const handleGaussianElimination = () => {
    setError('');
    setResultMatrix(null);
    setSteps([]);
    setSolution(null);

    try {
      const EPS = 1e-10;
      const r = rows;
      const c = cols;

      // превръщаме в числова матрица и вектор b
      const a = matrix.map((row) =>
        row.map((val) => {
          const num = Number(val);
          return isNaN(num) ? 0 : num;
        })
      );

      const b = bVector.map((val) => {
        const num = Number(val);
        return isNaN(num) ? 0 : num;
      });

      // една допълнителна колона за RHS, за удобство при елиминация
      const aug = a.map((row, i) => [...row, useRHS ? b[i] : 0]);

      // Детайлни стъпки
      const detailedSteps = [];

      // Начална snapshot
      detailedSteps.push('Начална разширена матрица:');
      detailedSteps.push(formatAugMatrix(aug, c));

      let row = 0;
      const pivotRowForCol = Array(c).fill(-1);

      for (let col = 0; col < c && row < r; col++) {
        // търсим pivot с максимална абсолютна стойност в текущата колона
        let pivotRow = row;
        let maxVal = Math.abs(aug[row][col]);

        for (let i = row + 1; i < r; i++) {
          const val = Math.abs(aug[i][col]);
          if (val > maxVal) {
            maxVal = val;
            pivotRow = i;
          }
        }

        if (maxVal < EPS) {
          // колона с нулев pivot – прескачаме
          detailedSteps.push(`Колона ${col + 1}: няма ненулев pivot (всички елементи ≈ 0), прескачаме.`);
          continue;
        }

        detailedSteps.push(`Колона ${col + 1}: избираме pivot от R${pivotRow + 1} (стойност = ${formatNum(aug[pivotRow][col], 6)})`);

        // разменяме редове при нужда
        if (pivotRow !== row) {
          const temp = aug[row];
          aug[row] = aug[pivotRow];
          aug[pivotRow] = temp;
          detailedSteps.push(`Разменяме редове: R${row + 1} <-> R${pivotRow + 1}`);
          detailedSteps.push('Матрица след размяната:');
          detailedSteps.push(formatAugMatrix(aug, c));
        }

        pivotRowForCol[col] = row;

        // опция: нормализираме pivot ред (не е задължително, но помага при записи)
        const pivotValue = aug[row][col];
        if (Math.abs(pivotValue - 1) > EPS) {
          // запазваме несъвсем-нормализирана форма, но можем да показваме нормализиран ред като стъпка
          const normalizedRow = aug[row].map((val) => val / pivotValue);
          detailedSteps.push(
            `Нормализираме R${row + 1} по pivot (${formatNum(pivotValue, 6)}): R${row + 1} := R${row + 1} / ${formatNum(pivotValue, 6)}`
          );
          detailedSteps.push(`R${row + 1} (нормализирана): ${formatRow(normalizedRow, c)}`);
          // НЕ присвояваме на aug[row] — продължаваме с оригиналните числа за точност
        } else {
          detailedSteps.push(`Pivot в R${row + 1} вече е 1.`);
        }

        // елиминираме елементите под pivot-а
        for (let i = row + 1; i < r; i++) {
          const factor = aug[i][col] / aug[row][col];
          if (Math.abs(factor) < EPS) {
            detailedSteps.push(`R${i + 1}: вече 0 под pivot (фактор ≈ 0), няма нужда от промяна.`);
            continue;
          }

          detailedSteps.push(
            `Елиминиране: R${i + 1} := R${i + 1} - (${formatNum(factor, 6)}) * R${row + 1}`
          );

          for (let j = col; j <= c; j++) {
            aug[i][j] = aug[i][j] - factor * aug[row][j];
            if (Math.abs(aug[i][j]) < EPS) aug[i][j] = 0; // чистим числов шум
          }

          detailedSteps.push(`R${i + 1} (нов): ${formatRow(aug[i], c)}`);
        }

        detailedSteps.push(`Матрица след елиминиране на колона ${col + 1}:`);
        detailedSteps.push(formatAugMatrix(aug, c));

        row++;
      }

      // проверка за несъвместима система (0 ... 0 | nonzero)
      let inconsistent = false;
      for (let i = 0; i < r; i++) {
        let allZero = true;
        for (let j = 0; j < c; j++) {
          if (Math.abs(aug[i][j]) > EPS) {
            allZero = false;
            break;
          }
        }
        if (allZero && Math.abs(aug[i][c]) > EPS && useRHS) {
          inconsistent = true;
          break;
        }
      }

      if (inconsistent) {
        setResultMatrix(aug.map((row) => row.slice(0, c)));
        detailedSteps.push('Системата е несъвместима (ред от вида [0 ... 0 | nonzero]).');
        setSteps(detailedSteps);
        setError('Системата няма решение (несъвместима).');
        return;
      }

      // обратно заместване, ако сме дали RHS
      let solutionVec = null;
      if (useRHS) {
        solutionVec = Array(c).fill(0);
        // определяме ранг и дали има свободни променливи
        const rank = pivotRowForCol.reduce((acc, p) => (p >= 0 ? acc + 1 : acc), 0);
        const infinite = rank < c;

        detailedSteps.push(`Ранг на матрицата: ${rank}. ${infinite ? 'Има свободни променливи (безброй решения).' : 'Еднозначно решение.'}`);

        // ще връщаме решение дори при свободни променливи: задаваме ги на 0 (частично решение)
        for (let v = c - 1; v >= 0; v--) {
          const pv = pivotRowForCol[v];
          if (pv === -1) {
            // свободна променлива
            solutionVec[v] = 0;
            detailedSteps.push(`x${v + 1} е свободна променлива (взета = 0).`);
            continue;
          }

          let rhs = aug[pv][c];
          let sum = 0;
          const terms = [];
          for (let j = v + 1; j < c; j++) {
            if (Math.abs(aug[pv][j]) > EPS) {
              terms.push(`${formatNum(aug[pv][j], 6)}*x${j + 1}`);
              sum += aug[pv][j] * solutionVec[j];
            }
          }

          const coeff = aug[pv][v];
          if (Math.abs(coeff) < EPS) {
            if (Math.abs(rhs - sum) < EPS) {
              solutionVec[v] = 0;
              detailedSteps.push(`Равенство в ред R${pv + 1} e 0 = 0 -> x${v + 1} свободна (взета = 0).`);
            } else {
              detailedSteps.push(`Равенство в ред R${pv + 1} -> 0 = ${formatNum(rhs - sum, 6)} -> несъвместимо.`);
              setError('Системата няма решение (несъвместима).');
              setSteps(detailedSteps);
              return;
            }
          } else {
            const expr = terms.length ? `${rhs.toFixed(6)} - (${terms.join(' + ')})` : `${rhs.toFixed(6)}`;
            solutionVec[v] = (rhs - sum) / coeff;
            detailedSteps.push(`За x${v + 1} (ред R${pv + 1}): ${coeff.toFixed(6)}*x${v + 1} + (${terms.join(' + ') || '0'}) = ${formatNum(rhs, 6)}`);
            detailedSteps.push(`-> x${v + 1} = (${formatNum(rhs, 6)} - ${formatNum(sum, 6)}) / ${formatNum(coeff, 6)} = ${formatNum(solutionVec[v], 6)}`);
          }
        }

        if (infinite) {
          detailedSteps.push('Показано е частично решение: свободните променливи са приети = 0.');
        }

        detailedSteps.push('Решение (вектор x): ' + solutionVec.map((v, i) => `x${i + 1}=${formatNum(v, 6)}`).join(', '));
      } else {
        detailedSteps.push('Не е зададен вектор b, показваме само горно-триъгълна матрица.');
      }

      // форматираме резултатната горно-триъгълна матрица за визуализация (без RHS)
      setResultMatrix(aug.map((row) => row.slice(0, c)));
      setSteps(detailedSteps);
      setSolution(solutionVec);
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
        метода на Гаус. Можете да включите вектор на свободните членове (b) за решаване на система Ax=b.
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
        <div className="flex items-center gap-2">
          <input
            id="useRHS"
            type="checkbox"
            checked={useRHS}
            onChange={(e) => {
              setUseRHS(e.target.checked);
              setSolution(null);
              setResultMatrix(null);
              setSteps([]);
              setError('');
            }}
            className="w-4 h-4"
          />
          <label htmlFor="useRHS" className="text-sm text-gray-700 dark:text-gray-300">Включи вектор b (RHS)</label>
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
        <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 text-center">Входна матрица A {useRHS ? '(и b)' : ''}</h3>
        <div className="overflow-x-auto pb-4">
          <div
            className="grid gap-2 mx-auto w-fit p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700"
            style={{ gridTemplateColumns: `repeat(${cols + (useRHS ? 1 : 0)}, minmax(80px, 1fr))` }}
          >
            {matrix.map((rowArr, rIndex) => (
              <React.Fragment key={`row-${rIndex}`}>
                {rowArr.map((value, cIndex) => (
                  <input
                    key={`a-${rIndex}-${cIndex}`}
                    type="number"
                    value={value}
                    onChange={(e) => handleCellChange(rIndex, cIndex, e.target.value)}
                    step="any"
                    className="w-full p-2 text-center rounded border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                ))}
                {useRHS && (
                  <input
                    key={`b-${rIndex}`}
                    type="number"
                    value={bVector[rIndex]}
                    onChange={(e) => handleBChange(rIndex, e.target.value)}
                    step="any"
                    className="w-full p-2 text-center rounded border border-red-300 dark:border-red-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white shadow-sm"
                  />
                )}
              </React.Fragment>
            ))}
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Резултатна матрица */}
        {resultMatrix && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit lg:col-span-1">
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

        {/* Решения (ако има) */}
        {solution && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Решения (x)
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 font-mono text-sm">
              {solution.map((val, idx) => (
                <div key={idx} className="mb-2 text-gray-700 dark:text-gray-300">
                  x{idx + 1} = {Number(val).toFixed(6)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Стъпки на елиминацията */}
        {steps.length > 0 && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 h-fit lg:col-span-1">
            <h3 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-300 border-b pb-2 border-gray-100 dark:border-gray-700">
              Стъпки на елиминацията
            </h3>
            <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg h-64 overflow-y-auto border border-gray-200 dark:border-gray-700 font-mono text-sm">
              {steps.map((s, idx) => (
                <div key={idx} className="mb-2 text-gray-700 dark:text-gray-300 pb-2 border-b border-gray-200 dark:border-gray-700/50 last:border-0 last:pb-0 whitespace-pre">
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