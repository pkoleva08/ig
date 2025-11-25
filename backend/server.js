//cd backend
//npx nodemon server.js

import express from "express";
import mysql from "mysql2";
import bcrypt from "bcrypt";
import cors from "cors";
//npx -y nodemon server.js
// Създаване на Express приложение  
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

const db = mysql.createPool({ // Настройки за връзка с MySQL база данни
  host: "localhost", // или друг хост, ако е необходимо
  user: "root", // потребителско име
  password: "", // парола
  database: "demo", // име на базата данни
});

const dbAsync = db.promise(); // Промис-базиран интерфейс за MySQL, за да използваме async/await

const respondWithDbError = (res, error, defaultMessage) => { // Унифицирана обработка на грешки от базата данни
  console.error(defaultMessage, error); // Логваме грешката в конзолата
  if (error && error.code === "ER_NO_SUCH_TABLE") { // Проверка за липсваща таблица
    return res.status(500).json({ // Връщаме съобщение за грешка
      message:
        "Required table is missing. Ensure the database schema has been applied.", // Проверете дали схемата на базата данни е приложена.
      code: error.code, // Връщаме кода на грешката
    });
  }
  return res.status(500).json({ message: defaultMessage }); // Връщаме общо съобщение за грешка
};

let hasStudentNameColumn = null; // Кеширане на състоянието дали колоната student_name съществува

const ensureStudentNameColumnFlag = async () => { // Функция за проверка дали колоната student_name съществува
  if (hasStudentNameColumn !== null) { // Ако вече сме проверили, връщаме кешираната стойност
    return hasStudentNameColumn; // Връщаме кешираната стойност
  }

  try {
    const [rows] = await dbAsync.query( // Изпълняваме заявка за проверка на колоната
      "SHOW COLUMNS FROM avg_scores LIKE 'student_name'" // Проверка за съществуването на колоната student_name
    ); // Изпълняваме заявка за проверка на колоната
    hasStudentNameColumn = rows.length > 0; // Ако има резултати, колоната съществува
    return hasStudentNameColumn; // Връщаме резултата
  } catch (error) { // Ако има грешка по време на заявката
    hasStudentNameColumn = null; // Нулираме кеша
    throw error; // Прехвърляме грешката нагоре
  }
};

const resetStudentNameColumnCache = () => { // Функция за нулиране на кеша
  hasStudentNameColumn = null; // Нулираме кешираната стойност
};

app.post("/register", async (req, res) => { // Регистрация на нов потребител
  const { username, email, password } = req.body; // Вземаме потребителското име, имейла и паролата от заявката
  if (!username || !email || !password) { // Проверка дали всички полета са попълнени
    return res // връщаме съобщение за грешка
      .status(400) // Лоша заявка
      .json({ message: "Username, email, and password are required." }); // Потребителско име, имейл и парола са задължителни.
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Хешираме паролата с bcrypt
    await dbAsync.query( // Вмъкваме новия потребител в базата данни
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)", //SQL заявка за вмъкване на нов потребител
      [username, email, hashedPassword] // Стойности за вмъкване
    );
    return res.status(201).json({ message: "Успешна регистрация" }); // Съобщение за успешна регистрация
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "Потребителското име или имейлът вече се използва." });
    }
    return respondWithDbError(
      res,
      error,
      "Грешка на сървъра по време на регистрацията."
    );
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Потребителското име и паролата са задължителни." });
  }

  try {
    const [rows] = await dbAsync.query(
      "SELECT id, username, email, password FROM users WHERE username = ?",
      [username]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: "Невалидно потребителско име или парола." });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Невалидно потребителско име или парола." });
    }

    return res.status(200).json({
      message: "Успешно влизане.",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    return respondWithDbError(res, error, "Грешка на сървъра по време на влизането.");
  }
});

app.get("/avg-scores", async (req, res) => {
  const { username } = req.query;
  if (!username) {
    return res.status(400).json({ message: "Потребителското име е задължително." });
  }

  try {
    const includeStudentName = await ensureStudentNameColumnFlag();
    const selectQuery = includeStudentName
      ? `SELECT a.id,
                u.username AS ownerUsername,
                a.student_name AS studentName,
                a.score_test1 AS scoreTest1,
                a.score_test2 AS scoreTest2,
                a.average_score AS averageScore,
                a.created_at AS createdAt
         FROM avg_scores a
         INNER JOIN users u ON a.user_id = u.id
         WHERE u.username = ?
         ORDER BY a.created_at DESC`
      : `SELECT a.id,
                u.username AS ownerUsername,
                NULL AS studentName,
                a.score_test1 AS scoreTest1,
                a.score_test2 AS scoreTest2,
                a.average_score AS averageScore,
                a.created_at AS createdAt
         FROM avg_scores a
         INNER JOIN users u ON a.user_id = u.id
         WHERE u.username = ?
         ORDER BY a.created_at DESC`;

    const [rows] = await dbAsync.query(selectQuery, [username]);

    return res.json(rows);
  } catch (error) {
    return respondWithDbError(
      res,
      error,
      "Грешка на сървъра по време на зареждане на резултатите."
    );
  }
});

app.post("/avg-scores", async (req, res) => {
  const { username, studentName, scoreTest1, scoreTest2 } = req.body;

  if (!username) {
    return res.status(400).json({ message: "Потребителското име е задължително." });
  }

  let includeStudentName;
  try {
    includeStudentName = await ensureStudentNameColumnFlag();
  } catch (error) {
    respondWithDbError(res, error, "Грешка на сървъра по време на валидиране на схемата.");
    return;
  }

  if (includeStudentName) {
    const trimmedStudentName = String(studentName || "").trim();
    if (!trimmedStudentName) {
      return res
        .status(400)
        .json({ message: "Името на ученика не може да бъде празно." });
    }
  } else if (studentName) {
    return res.status(500).json({
      message:
        "БОТОВОЕТЕ НА СМЪРТ",
    });
  }

  if (scoreTest1 === undefined || scoreTest2 === undefined) { // Проверка дали и двете оценки са предоставени
    return res.status(400).json({ message: "И двете оценки са задължителни." }); // Връщаме съобщение за грешка, ако някоя от оценките липсва
  }

  const parsedScore1 = Number(scoreTest1); // Преобразуваме оценките в числа
  const parsedScore2 = Number(scoreTest2); // Преобразуваме оценките в числа

  if (!Number.isFinite(parsedScore1) || !Number.isFinite(parsedScore2)) { // Проверка дали и двете оценки са валидни числа
    return res.status(400).json({ message: "Оценките трябва да бъдат валидни числа." }); // Връщаме съобщение за грешка, ако някоя от оценките не е валидно число
  }

  try {
    const [userRows] = await dbAsync.query(
      "SELECT id FROM users WHERE username = ?", // Заявка за получаване на потребителското ID по потребителско име
      [username] // Параметър за заявката
    );

    if (userRows.length === 0) { // Ако няма намерен потребител
      return res.status(404).json({ message: "Потребителят не е намерен." }); // Връщаме съобщение за грешка
    }

    const { id: userId } = userRows[0]; // Вземаме потребителското ID
    const averageScore = (parsedScore1 + parsedScore2) / 2; // Изчисляваме средната оценка

    let insertResult; // Резултат от вмъкването
    if (includeStudentName) { // Ако колоната student_name съществува
      const [result] = await dbAsync.query( // Вмъкваме нов запис с име на ученик
        `INSERT INTO avg_scores (user_id, student_name, score_test1, score_test2, average_score)
         VALUES (?, ?, ?, ?, ?)`, // SQL заявка за вмъкване на нов запис с име на ученик, оценки и средна оценка
        [
          userId, // Потребителско ID
          String(studentName || "").trim(), // Име на ученик, премахваме излишните интервали(.trim())
          parsedScore1, // Оценка от тест 1
          parsedScore2, // Оценка от тест 2
          averageScore, // Средна оценка
        ]
      );
      insertResult = result; // Запазваме резултата от вмъкването
    } else {
      const [result] = await dbAsync.query( // Вмъкваме нов запис без име на ученик
        `INSERT INTO avg_scores (user_id, score_test1, score_test2, average_score) 
         VALUES (?, ?, ?, ?)`, // SQL заявка за вмъкване на нов запис без име на ученик
        [userId, parsedScore1, parsedScore2, averageScore] // Параметри за заявката
      );
      insertResult = result; // Запазваме резултата от вмъкването
    }

    resetStudentNameColumnCache(); // Нулираме кеша за колоната student_name

    let includeStudentNameAfterInsert; // Проверка дали колоната student_name съществува след вмъкването
    try {
      includeStudentNameAfterInsert = await ensureStudentNameColumnFlag(); // Проверка дали колоната student_name съществува след вмъкването
    } catch (error) {
      respondWithDbError(res, error, "Server error while validating schema."); // Грешка на сървъра по време на валидиране на схемата.
      return;
    }

    const selectQuery = includeStudentNameAfterInsert // Ако колоната student_name съществува след вмъкването
      ? `SELECT a.id,
               u.username AS ownerUsername,
               a.student_name AS studentName,
               a.score_test1 AS scoreTest1,
               a.score_test2 AS scoreTest2,
               a.average_score AS averageScore,
               a.created_at AS createdAt
        FROM avg_scores a
        INNER JOIN users u ON a.user_id = u.id // вътрешно свързване с таблицата users с цел получаване на потребителското име на собственика
        WHERE a.id = ?` // SQL заявка за избор на новия запис
      : `SELECT a.id, 
               u.username AS ownerUsername,
               NULL AS studentName,
              //  a.score_test1 AS scoreTest1,
               a.score_test2 AS scoreTest2,
               a.average_score AS averageScore,
               a.created_at AS createdAt
        FROM avg_scores a
        INNER JOIN users u ON a.user_id = u.id
        WHERE a.id = ?`; // SQL заявка за избор на новия запис

    // Изпълняваме заявката за избор на новия запис
    const [rows] = await dbAsync.query(selectQuery, [insertResult.insertId]);

    return res.status(201).json(rows[0]); // Връщаме новия запис като отговор
  } catch (error) {
    return respondWithDbError(
      res,
      error,
      "Server error while saving score."
    );
  }
});

app.delete("/avg-scores/:id", async (req, res) => { // Изтриване на запис за средна оценка по ID
  const { username } = req.query; // Вземаме потребителското име от заявката
  const { id } = req.params; // Вземаме ID-то на записа от параметрите на заявката

  if (!username) {
    return res.status(400).json({ message: "Username is required." });
  }

  try {
    const [userRows] = await dbAsync.query(
      "SELECT id FROM users WHERE username = ?",
      [username]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    const { id: userId } = userRows[0];
    const [result] = await dbAsync.query(
      "DELETE FROM avg_scores WHERE id = ? AND user_id = ?",
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Score entry not found." });
    }

    return res.status(204).send();
  } catch (error) {
    return respondWithDbError(
      res,
      error,
      "Server error while deleting score."
    );
  }
});

app.listen(3001, () => {
  console.log("Сървъра работи на порт: 3001");
});
