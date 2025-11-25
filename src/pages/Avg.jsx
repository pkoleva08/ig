import React, { useEffect, useMemo, useState } from "react";

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
        } catch {
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
        } catch {
            setServerMessage("Unable to reach the server.");
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 dark:text-white">Резултати</h1>

            {!user && (
                <div className="p-4 mb-6 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg text-center">
                    Трябва да влезете в акаунта си, за да добавяте и управлявате резултати.
                </div>
            )}

            <form
                className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg mb-8 border border-gray-100 dark:border-gray-700"
                onSubmit={handleAddEntry}
            >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <input
                        name="studentName"
                        type="text"
                        placeholder="Ученик"
                        value={formValues.studentName}
                        onChange={handleChange}
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                    <input
                        name="test1"
                        type="number"
                        placeholder="Резултат от тест 1"
                        value={formValues.test1}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                    <input
                        name="test2"
                        type="number"
                        placeholder="Резултат от тест 2"
                        value={formValues.test2}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        disabled={submitting}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                    />
                </div>
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className="w-full py-2 px-4 bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {submitting ? "Запазва..." : "Запази резултата"}
                </button>
            </form>

            {formError && <p className="text-red-500 text-center mb-4">{formError}</p>}
            {serverMessage && (
                <p className={`text-center mb-4 ${serverMessage.includes("successfully") || serverMessage.includes("removed") ? "text-green-500" : "text-red-500"}`}>
                    {serverMessage}
                </p>
            )}

            {loading ? (
                <p className="text-center text-gray-500">Зарежда резултатите...</p>
            ) : (
                <div className="overflow-x-auto rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <table className="w-full bg-white dark:bg-gray-800 text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-300">
                                <th className="p-4 font-semibold border-b border-gray-200 dark:border-gray-700">Студент</th>
                                <th className="p-4 font-semibold border-b border-gray-200 dark:border-gray-700">Тест 1</th>
                                <th className="p-4 font-semibold border-b border-gray-200 dark:border-gray-700">Тест 2</th>
                                <th className="p-4 font-semibold border-b border-gray-200 dark:border-gray-700">Средно</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {entries.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="p-8 text-center text-gray-500 dark:text-gray-400">
                                        Няма записани резултати.
                                    </td>
                                </tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                        <td className="p-4 text-gray-800 dark:text-gray-200">{entry.studentName || "—"}</td>
                                        <td className="p-4 text-gray-800 dark:text-gray-200">{entry.scoreTest1}</td>
                                        <td className="p-4 text-gray-800 dark:text-gray-200">{entry.scoreTest2}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-between gap-4">
                                                <span className="font-bold text-gray-800 dark:text-gray-200">{formatAverage(entry.averageScore)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEntry(entry.id)}
                                                    disabled={!user || submitting}
                                                    className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Премахни
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Avg;
