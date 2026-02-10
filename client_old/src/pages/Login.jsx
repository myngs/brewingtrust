import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      username: form.username.value,
      password: form.password.value
    };

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    if (!res.ok) {
      setError("Invalid username/email or password");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="container">
      <h2>Login</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Username or Email</label>
        <input name="username" required />

        <label>Password</label>
        <input type="password" name="password" required />

        <button>Login</button>
      </form>

      <p className="switch">
        Don’t have an account yet?{" "}
        <Link to="/signup">Sign up</Link>
      </p>
    </div>
  );
}
