// Страница за преобразуване на число от една бройна система в друга
import React, { useState } from 'react';
import { Box, TextField, MenuItem, Button, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import './Calc.css';

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
    setError(''); // изчистване на предишни грешки, като започва ново преобразуване с празен статус
    setResult(''); // изчистване на предишния резултат, като започва ново преобразуване с празен резултат
    try {
      if (!inputValue) { // Проверка за празен вход- !inputValue - ако няма въведено число
        setError('Моля, въведете число.');
        return;
      }
      // Проверка за валидност на входа
      const decimalValue = parseInt(inputValue, fromBase);
      if (isNaN(decimalValue)) { // дали числото е валидно в избраната бройна система
        setError('Невалидно число за избраната бройна система.');
        return;
      }
      const convertedValue = decimalValue.toString(toBase).toUpperCase(); // Преобразуване на числото в целевата бройна система
      setResult(convertedValue); // Задаване на резултата като взима стойността на преобразуваното число- convertedValue
    } catch (error) {
      setError('Грешка при преобразуването.');
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 400, mx: 'auto' }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        {t('back', { defaultValue: 'Назад' })}
      </Button>
      <Typography variant="h5" sx={{ mb: 2 }} className='page-title'>
        Преобразуване на бройни системи
      </Typography>
      <TextField
        label="Число"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value.trim())}
        fullWidth
        sx={{ mb: 2 }}
      />
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          select
          label="От"
          value={fromBase}
          onChange={(e) => setFromBase(Number(e.target.value))}
          sx={{ flex: 1 }}
        >
          {bases.map((base) => (
            <MenuItem key={base} value={base}>
              {base}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Към"
          value={toBase}
          onChange={(e) => setToBase(Number(e.target.value))}
          sx={{ flex: 1 }}
        >
          {bases.map((base) => (
            <MenuItem key={base} value={base}>
              {base}
            </MenuItem>
          ))}
        </TextField>
      </Box>
      <Button variant="contained" onClick={handleConvert} fullWidth>
        Преобразувай
      </Button>
      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
      {result && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
          <Typography variant="h6" className='result-text'>
            Резултат: <b>{result}</b>
          </Typography>
          <Button
            className="copy-btn"
            size="small"
            onClick={() => navigator.clipboard.writeText(result)}
          >
            Копирай
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Calc;