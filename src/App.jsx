import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import AddListing from './pages/AddListing';
import ListingDetail from './pages/ListingDetail';
import RequestFlow from './pages/RequestFlow';
import Profile from './pages/Profile';
import AuthPage from './pages/AuthPage';
import MediatorDashboard from './pages/MediatorDashboard';
import PostNeed from './pages/PostNeed';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" replace /> : <AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="add" element={<AddListing />} />
          <Route path="post-need" element={<PostNeed />} />
          <Route path="listing/:id" element={<ListingDetail />} />
          <Route path="request/:id" element={<RequestFlow />} />
          <Route path="profile" element={<Profile />} />
          <Route path="mediator" element={<MediatorDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

import { RoleProvider } from './contexts/RoleContext';

function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppRoutes />
      </RoleProvider>
    </AuthProvider>
  );
}

export default App;
