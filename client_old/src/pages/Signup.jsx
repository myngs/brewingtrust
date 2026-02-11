import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      username: form.username.value,
      email: form.email.value,
      password: form.password.value,
      confirmPassword: form.confirmPassword.value
    };

    const res = await fetch("http://localhost:3000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (!res.ok) {
      setError(result.message);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="container">
      <h2>Sign Up</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>Username</label>
        <input name="username" required />

        <label>Email</label>
        <input type="email" name="email" required />

        <label>Password</label>
        <input type="password" name="password" required />

        <label>Confirm Password</label>
        <input type="password" name="confirmPassword" required />

        <button>Create Account</button>
      </form>

      <p className="switch">
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </p>
    </div>
  );
}
