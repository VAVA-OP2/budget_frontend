// src/components/Auth.js
import React, { useState } from 'react';
import { supabase } from '/supabaseClient';  
import { useNavigate } from 'react-router-dom'; 

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authType, setAuthType] = useState('login');
  const navigate = useNavigate(); // Navigointi hook

  const handleAuth = async () => {
    setLoading(true);
    try {
      let result;
      if (authType === 'login') {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) throw result.error;

      alert('Authentication successful!');
      
      // Kun kirjautuu niin Home-sivulle ohjautuu
      navigate('/home');
    } catch (error) {
      alert('Error: ' + error.message);
    }
    setLoading(false);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ padding: '50px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>{authType === 'login' ? 'Log in' : 'Sign up'}</h2>
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: '10px', padding: '8px', width: '100%' }}
        />
      </div>
      <div>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginBottom: '20px', padding: '8px', width: '100%' }}
        />
      </div>
      <button onClick={handleAuth} disabled={loading}>
        {loading ? 'Loading...' : authType === 'login' ? 'Log In' : 'Sign Up'}
      </button>
      <div style={{ marginTop: '20px' }}>
        <span>
          {authType === 'login' ? "Don't have an account?" : 'Already have an account?'}
        </span>
        <button
          onClick={() => setAuthType(authType === 'login' ? 'signup' : 'login')}
          style={{ marginLeft: '10px' }}
        >
          {authType === 'login' ? 'Sign Up' : 'Log In'}
        </button>
      </div>
    </div>
  );
};

export default Auth;
