import React, { useState } from 'react';
import "../App.css";
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from 'react-router-dom';

const BASE_URL = import.meta.env.API_URL;

function Signup() {
  const [channelName, setChannelName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleAvatar = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleCoverImage = (e) => {
    setCoverImage(e.target.files[0]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    formData.append("userName", channelName);
    formData.append("fullName", fullName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("avatar", avatar);
    formData.append("coverImage", coverImage);

    axios.post(`${BASE_URL}/api/user/register`, formData)
      .then(() => {
        toast.success("Successfully signed up!");
        setLoading(false);
        setTimeout(() => {
          navigate("/login");
        }, 2500);
      })
      .catch((err) => {
        const message = err.response?.data?.message || "Something went wrong";
        toast.error(message);
        setLoading(false);
      });
  };

  return (
    <div className='page'>
      <div className='container'>
        <form onSubmit={submitHandler}>
          <h2>Create Your Channel</h2>

          <label>
            Channel Name:
            <input
              onChange={(e) => setChannelName(e.target.value)}
              type='text'
              placeholder='Channel Name'
              required
            />
          </label>

          <label>
            Full Name:
            <input
              type='text'
              onChange={(e) => setFullName(e.target.value)}
              placeholder='Full Name'
              required
            />
          </label>

          <label>
            Email:
            <input
              onChange={(e) => setEmail(e.target.value)}
              type='email'
              placeholder='Email'
              required
            />
          </label>

          <label>
            Password:
            <input
              onChange={(e) => setPassword(e.target.value)}
              type='password'
              placeholder='Password'
              required
            />
          </label>

          <label>
            Avatar:
            <input
              onChange={handleAvatar}
              type='file'
              accept='image/*'
              required
            />
          </label>

          <label>
            Cover Image:
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImage}
              required
            />
          </label>

          <button
            disabled={loading}
            className={`${loading ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'cursor-pointer hover:opacity-90'}`}
            type='submit'
          >
            {loading ? (
              <i className="fa-solid fa-spinner fa-spin-pulse"></i>
            ) : (
              "Sign Up"
            )}
          </button>

          <p style={{ marginTop: '1rem', textAlign: 'center' }}>
            Already have a account?{" "}
            <Link to="/login" style={{ color: '#007bff', textDecoration: 'underline' }}>Login</Link>
          </p>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default Signup;
