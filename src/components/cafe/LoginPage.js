import React, { useState } from 'react';
import axios from 'axios';
import '../../css/LoginPage.css';
import config from '../../env.json';

const host = config.REACT_APP_HOST_URL;

function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  function handleInputChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(host + `/auth/login`, formData);
      if (response.status != 200) {
        console.log(response.status);
      } else {
        localStorage.setItem("authToken", response.data);
        window.location.href = "/cafe/kitchen";
      }
    } catch (err) {
      setError('Неверное имя пользователя или пароль');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-container">
      <h2>Вход для сотрудников</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        <button
          type="submit"
          className="login-button"
          disabled={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}

export default LoginPage;