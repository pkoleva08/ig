// Страница за представяне на матрица в горно-триъгълна форма (метод на Гаус)
import React, { useState } from 'react';
import { Box, TextField, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Gauss.css';

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
          logSteps.push(`Разменяме R${row + 1} и R${pivotRow + 1}`);
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
            `R${i + 1} = R${i + 1} - (${factor.toFixed(3)}) · R${row + 1}`
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
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{ mb: 2 }}
      >
        {t('back', { defaultValue: 'Назад' })}
      </Button>

      <Typography variant="h5" sx={{ mb: 1 }} className="page-title">
        Гаусов метод – представяне в горно-триъгълна форма
      </Typography>
      <Typography variant="body2" className="gauss-description">
        Въведете размерите и елементите на матрицата. Натиснете
        &nbsp;
        <b>„Преобразувай“</b>, за да получите горно-триъгълната матрица чрез
        метода на Гаус.
      </Typography>

      {/* Контроли за размерите */}
      <Box className="gauss-controls">
        <TextField
          label="Редове"
          type="number"
          value={rows}
          onChange={(e) => handleResize(e.target.value, cols)}
          size="small"
          inputProps={{ min: 1, max: 10 }}
        />
        <TextField
          label="Колони"
          type="number"
          value={cols}
          onChange={(e) => handleResize(rows, e.target.value)}
          size="small"
          inputProps={{ min: 1, max: 10 }}
        />
        <Button variant="outlined" onClick={handleReset}>
          Нулирай матрицата
        </Button>
      </Box>

      {/* Входна матрица */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
        Входна матрица A
      </Typography>
      <div className="matrix-wrapper">
        <div
          className="matrix-grid"
          style={{ '--cols': cols }}
        >
          {matrix.map((rowArr, rIndex) =>
            rowArr.map((value, cIndex) => (
              <TextField
                key={`${rIndex}-${cIndex}`}
                type="number"
                size="small"
                variant="outlined"
                value={value}
                onChange={(e) =>
                  handleCellChange(rIndex, cIndex, e.target.value)
                }
                className="matrix-cell-input"
                inputProps={{ step: 'any' }}
              />
            ))
          )}
        </div>
      </div>

      <Button
        variant="contained"
        fullWidth
        sx={{ mt: 2 }}
        onClick={handleGaussianElimination}
      >
        Преобразувай (метод на Гаус)
      </Button>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}

      {/* Резултатна матрица */}
      {resultMatrix && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Горно-триъгълна матрица U
          </Typography>
          <div className="result-matrix-wrapper">
            <table className="result-matrix-table">
              <tbody>
                {resultMatrix.map((rowArr, rIndex) => (
                  <tr key={rIndex}>
                    {rowArr.map((val, cIndex) => (
                      <td key={cIndex}>
                        {Number(val).toFixed(3)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Стъпки на елиминацията */}
      {steps.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
            Стъпки на елиминацията
          </Typography>
          <div className="steps-box">
            {steps.map((s, idx) => (
              <div key={idx} className="step-item">
                • {s}
              </div>
            ))}
          </div>
        </>
      )}
    </Box>
  );
};

export default Gauss;