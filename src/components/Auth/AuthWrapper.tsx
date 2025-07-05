import React, { useState } from 'react';
import Login from './Login';
import Register from './Register';

const AuthWrapper: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return isLogin ? (
    <Login onToggle={() => setIsLogin(false)} />
  ) : (
    <Register onToggle={() => setIsLogin(true)} />
  );
};

export default AuthWrapper;