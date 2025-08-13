import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Welcome from './components/auth/Welcome';
import Login from './components/auth/Login';
import SellerDashboard from './components/dashboard/seller/SellerDashboard';
import ForgotPassword from './components/auth/ForgotPassword';
import Properties from './components/properties/Properties';
import Booking from './components/booking/Booking';
import Contact from './components/Contact';
import Clients from './components/clients/Clients';
import Messages from './components/messages/Messages';
import AccountManagement from './components/accounts/AccountManagement';
import Reports from './components/reports/Reports';
import { Toaster } from './components/ui/Toaster';
import './App.css';
import './components/ui/uiComponents.css';
import SellerLayout from './components/layout/SellerLayout';
import BuyerLayout from './components/layout/BuyerLayout';
import SellerRegistration from './components/sellers/SellerRegistration';
import SellerDetails from './components/sellers/SellerDetails';
import BuyerDashboard from './components/dashboard/buyer/BuyerDashboard';
import Favorites from './components/buyer/Favorites';
import SavedSearches from './components/buyer/SavedSearches';
import Profile from './components/buyer/Profile';
import Register from './components/auth/Register';
import BookingsList from './components/bookings/BookingsList';
import AdminLayout from './components/dashboard/Dashboard';
import DashboardHome from './components/dashboard/DashboardHome';

// Configure React Router v7 future flags
const routerConfig = {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
};

function App() {
  return (
    <UserProvider>
      <Router future={routerConfig.future}>
        <Toaster />
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />

          {/* Admin Dashboard Routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardHome />} />
            <Route path="properties" element={<Properties />} />
            <Route path="booking/:id" element={<Booking />} />
            <Route path="booking" element={<Booking />} />
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<Clients />} />
            <Route path="messages" element={<Messages />} />
            <Route path="messages/:id" element={<Messages />} />
            <Route path="accounts" element={<AccountManagement />} />
            <Route path="accounts/:id" element={<AccountManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:reportId" element={<Reports />} />
            <Route path="sellers" element={<SellerRegistration />} />
            <Route path="sellers/:id" element={<SellerDetails />} />
          </Route>

          {/* Seller Dashboard Routes */}
          <Route path="/seller/*" element={
            <ProtectedRoute allowedRoles={['seller']}>
              <SellerLayout>
                <Routes>
                  <Route index element={<SellerDashboard />} />
                  <Route path="dashboard" element={<SellerDashboard />} />
                  <Route path="properties" element={<Properties />} />
                  <Route path="inquiries" element={<Messages />} />
                  <Route path="analytics" element={<Reports />} />
                  <Route path="settings" element={<AccountManagement />} />
                  <Route path="bookings" element={<BookingsList />} />
                  <Route path="properties/:propertyId/bookings" element={<BookingsList propertyId=":propertyId" />} />
                </Routes>
              </SellerLayout>
            </ProtectedRoute>
          } />

          {/* Buyer Dashboard Routes */}
          <Route path="/buyer" element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerLayout />
            </ProtectedRoute>
          }>
            <Route index element={<BuyerDashboard />} />
            <Route path="dashboard" element={<BuyerDashboard />} />
            <Route path="properties" element={<Properties />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="saved-searches" element={<SavedSearches />} />
            <Route path="profile" element={<Profile />} />
            <Route path="bookings" element={<BookingsList />} />
          </Route>

          {/* Catch-all redirects */}
          <Route path="/properties" element={<Navigate to="/dashboard/properties" replace />} />
          <Route path="/reports" element={<Navigate to="/dashboard/reports" replace />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;