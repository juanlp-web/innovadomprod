import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './contexts/AuthContext';

function TestComponent() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      <h1>Test Auth</h1>
      <p>User: {user ? user.name : 'No user'}</p>
      <p>Token: {user ? 'Yes' : 'No'}</p>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <TestComponent />
    </AuthProvider>
  );
}

export default App;
