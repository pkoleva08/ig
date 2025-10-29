import React from "react";
import "./Avg.css";

const initialStudents = [
    { id: 1, name: "Ivan Petrov", test1: 5.5, test2: 4.75 },
    { id: 2, name: "Maria Ivanova", test1: 6, test2: 5.8 },
];

function Avg() {
    const [students, setStudents] = React.useState(initialStudents);
    const [formValues, setFormValues] = React.useState({
        name: "",
        test1: "",
        test2: "",
    });
    const [error, setError] = React.useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddStudent = (event) => {
        event.preventDefault();

        const trimmedName = formValues.name.trim();
        const parsedTest1 = Number(formValues.test1);
        const parsedTest2 = Number(formValues.test2);

        if (!trimmedName) {
            setError("Please enter a student name.");
            return;
        }

        if (!Number.isFinite(parsedTest1) || !Number.isFinite(parsedTest2)) {
            setError("Test scores must be numeric values.");
            return;
        }

        {/* Създаване на нов ученик обект- const: кон */}
        const newStudent = {
            id: Date.now(),
            name: trimmedName,
            test1: parsedTest1,
            test2: parsedTest2,
        };

        {/* Добавяне на нов ученик към списъка */}
        setStudents((prev) => [...prev, newStudent]); {/* Изчистване на формуляра и грешките */}
        setFormValues({ name: "", test1: "", test2: "" }); {/* Изчистване на формуляра и грешките- празни стойности */}
        setError("");
    };

    {/* Премахване на ученик по ID */}
    const handleRemoveStudent = (id) => {
        setStudents((prev) => prev.filter((student) => student.id !== id));
    };

    {/* Изчисляване на средно аритметично */}
    const calcAverage = (test1, test2) => {
        const avg = (Number(test1) + Number(test2)) / 2;
        return Number.isFinite(avg) ? avg.toFixed(2) : "--";
    };

    return (
        <div className="avg-page">
            <h1>Средна стойност</h1>
            {/* формуляр за създаване на нов ученик и оценки */}
            <form className="avg-form" onSubmit={handleAddStudent}>
                <input
                    name="name"
                    type="text"
                    placeholder="Име на ученика"
                    value={formValues.name}
                    onChange={handleChange}
                />
                <input
                    name="test1"
                    type="number"
                    placeholder="Тест 1"
                    value={formValues.test1}
                    onChange={handleChange}
                    step="0.01"
                />
                <input
                    name="test2"
                    type="number"
                    placeholder="Тест 2"
                    value={formValues.test2}
                    onChange={handleChange}
                    step="0.01"
                />
                <button type="submit">Добави ученик</button>
            </form>

            {error && <p className="avg-error">{error}</p>}

            <table className="avg-table" border="1" cellPadding="10" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Ученик</th>
                        <th>Тест 1</th>
                        <th>Тест 2</th>
                        <th>Средно аритметично</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length === 0 ? (
                        <tr>
                            <td colSpan="5">Няма ученици. Добавете първия по-горе.</td>
                        </tr>
                    ) : (
                        students.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.test1}</td>
                                <td>{student.test2}</td>
                                <td>{calcAverage(student.test1, student.test2)}</td>
                                <td>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveStudent(student.id)}
                                    >
                                        Премахни
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}

export default Avg;
