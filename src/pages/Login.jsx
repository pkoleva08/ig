import React, { useState } from "react";
import "./Login.css";

const Login = ({ setUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMsg("");
    setSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setMsg("Login successful.");
      } else {
        setMsg(data.message || "Login failed.");
      }
    } catch (error) {
      setMsg("Unable to reach the server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Login Page</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={submitting}
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={submitting}
          autoComplete="current-password"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "..." : "Log in"}
        </button>
        {msg && <div>{msg}</div>}
      </form>
    </div>
  );
};

export default Login;
