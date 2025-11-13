import React, { useEffect, useMemo, useState } from "react";
import "./Avg.css";

const API_BASE = "http://localhost:3001";

const formatAverage = (value) => {
    if (value === null || value === undefined) {
        return "--";
    }
    const numberValue = Number(value);
    return Number.isFinite(numberValue) ? numberValue.toFixed(2) : "--";
};

const Avg = ({ user }) => {
    const [entries, setEntries] = useState([]);
    const [formValues, setFormValues] = useState({
        studentName: "",
        test1: "",
        test2: "",
    });
    const [formError, setFormError] = useState("");
    const [serverMessage, setServerMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const canSubmit = useMemo(() => {
        const hasStudent = Boolean((formValues.studentName || "").trim());
        const hasScores =
            Boolean(formValues.test1) && Boolean(formValues.test2) && !submitting;
        return Boolean(user) && hasStudent && hasScores;
    }, [
        user,
        formValues.studentName,
        formValues.test1,
        formValues.test2,
        submitting,
    ]);

    useEffect(() => {
        if (!user) {
            setEntries([]);
            return;
        }

        const controller = new AbortController();

        async function fetchScores() {
            setLoading(true);
            setServerMessage("");
            try {
                const response = await fetch(
                    `${API_BASE}/avg-scores?username=${encodeURIComponent(
                        user.username
                    )}`,
                    { signal: controller.signal }
                );

                const data = await response.json().catch(() => null);

                if (!response.ok) {
                    const message = (data && data.message) || "Failed to load scores.";
                    throw new Error(message);
                }

                if (!Array.isArray(data)) {
                    throw new Error("Unexpected response shape from server.");
                }

                setEntries(data);
            } catch (error) {
                if (error.name !== "AbortError") {
                    setServerMessage(
                        error.message || "Unable to load scores from the server."
                    );
                }
            } finally {
                setLoading(false);
            }
        }

        fetchScores();

        return () => controller.abort();
    }, [user]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormValues((prev) => ({ ...prev, [name]: value }));
    };

    const validateForm = () => {
        setFormError("");
        if (!user) {
            setFormError("Log in to submit results.");
            return false;
        }

        const trimmedName = (formValues.studentName || "").trim();
        if (!trimmedName) {
            setFormError("Student name is required.");
            return false;
        }

        const parsedTest1 = Number(formValues.test1);
        const parsedTest2 = Number(formValues.test2);

        if (!Number.isFinite(parsedTest1) || !Number.isFinite(parsedTest2)) {
            setFormError("Scores must be valid numbers.");
            return false;
        }

        return { trimmedName, parsedTest1, parsedTest2 };
    };

    const handleAddEntry = async (event) => {
        event.preventDefault();
        const validation = validateForm();
        if (!validation) {
            return;
        }

        setSubmitting(true);
        setServerMessage("");

        try {
            const response = await fetch(`${API_BASE}/avg-scores`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    username: user.username,
                    studentName: validation.trimmedName,
                    scoreTest1: validation.parsedTest1,
                    scoreTest2: validation.parsedTest2,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setServerMessage(
                    data.message ||
                    "Failed to save score. Ensure the database schema supports student names."
                );
                return;
            }

            setEntries((prev) => [data, ...prev]);
            setFormValues({ studentName: "", test1: "", test2: "" });
            setFormError("");
            setServerMessage("Score saved successfully.");
        } catch (error) {
            setServerMessage("Unable to reach the server.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleRemoveEntry = async (id) => {
        if (!user) {
            setServerMessage("Log in to manage scores.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/avg-scores/${id}?username=${encodeURIComponent(
                    user.username
                )}`,
                { method: "DELETE" }
            );

            if (response.status === 204) {
                setEntries((prev) => prev.filter((entry) => entry.id !== id));
                setServerMessage("Score removed.");
            } else if (response.status === 404) {
                setServerMessage("Score not found.");
            } else {
                const data = await response.json();
                setServerMessage(data.message || "Failed to delete score.");
            }
        } catch (error) {
            setServerMessage("Unable to reach the server.");
        }
    };

    return (
        <div className="avg-page">
            <h1>Резултати</h1>

            {!user && (
                <p className="avg-info">
                    Трябва да влезете в акаунта си, за да добавяте и управлявате резултати.
                </p>
            )}

            <form className="avg-form" onSubmit={handleAddEntry}>
                <input
                    className="avg-input"
                    name="studentName"
                    type="text"
                    placeholder="Ученик"
                    value={formValues.studentName}
                    onChange={handleChange}
                    disabled={submitting}
                />
                <input
                    className="avg-input-score"
                    name="test1"
                    type="number"
                    placeholder="Резултат от тест 1"
                    value={formValues.test1}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={submitting}
                />
                <input
                    className="avg-input-score"
                    name="test2"
                    type="number"
                    placeholder="Резултат от тест 2"
                    value={formValues.test2}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    disabled={submitting}
                />
                <button type="submit" className="avg-button" disabled={!canSubmit}>
                    {submitting ? "Запазва..." : "Запази резултата"}
                </button>
            </form>

            {formError && <p className="avg-error">{formError}</p>}
            {serverMessage && <p className="avg-message">{serverMessage}</p>}

            {loading ? (
                <p className="avg-info">Зарежда резултатите...</p>
            ) : (
                <table className="avg-table" border="1" cellPadding="10" cellSpacing="0">
                    <thead>
                        <tr>
                            <th>Студент</th>
                            <th>Тест 1</th>
                            <th>Тест 2</th>
                            <th>Средно</th>
                        </tr>
                    </thead>
                    <tbody>
                        {entries.length === 0 ? (
                            <tr>
                                <td colSpan="4">Няма записани резултати.</td>
                            </tr>
                        ) : (
                            entries.map((entry) => (
                                <tr key={entry.id}>
                                    <td>{entry.studentName || "—"}</td>
                                    <td>{entry.scoreTest1}</td>
                                    <td>{entry.scoreTest2}</td>
                                    <td className="avg-average-cell">
                                        <span>{formatAverage(entry.averageScore)}</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveEntry(entry.id)}
                                            disabled={!user || submitting}
                                        >
                                            Премахни
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Avg;
