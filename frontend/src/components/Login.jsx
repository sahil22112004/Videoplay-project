import React, { useState } from 'react';
import "../App.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from "react-redux";
import { loginSuccess } from '../store/auth/authslice.js';

const BASE_URL = import.meta.env.API_URL;

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    axios.post(`${BASE_URL}/api/user/login`, {
      email,
      password
    }, { withCredentials: true })
      .then((res) => {
        toast.success("Login successful!");
        const { accessToken, user } = res.data.data;

        dispatch(loginSuccess({
          token: accessToken,
          user: user,
        }));

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(user));

        setLoading(false);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Invalid credentials";
        toast.error(message);
        setLoading(false);
      });
  };

  const handleButtonClick = (e) => {
    if (loading) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  return (
    <div className='page'>
      <div className='container'>
        <form onSubmit={submitHandler}>
          <h2>Login to Your Account</h2>

          <label>
            Email:
            <input
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <label>
            Password:
            <input
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </label>

          <button
            type='submit'
            onClick={handleButtonClick}
            disabled={loading}
            className={`${loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:opacity-90'}`}
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin-pulse"></i>
            ) : (
              "Login"
            )}
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: '#007bff', textDecoration: 'underline' }}>Sign Up</Link>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={1000} />
    </div>
  );
}

export default Login;
