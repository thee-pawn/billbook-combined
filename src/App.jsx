import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/login/Login';
import Main from '@components/main/Main';
import LandingPage from '@components/LandingPage';
import Services from '@components/services/Services';
import Products from '@components/products/Product';
import Home from '@components/Home';
import Profile from '@components/profile/Profile';
import BillingHistory from '@components/billing/BillingHistory';
import Expenses from '@components/expenses/Expenses';
import CustomerSupportWidget from '@components/support/Support';
import Billing from '@components/billing/Billing';
import Staff from '@components/staff/Staff';
import Analytics from '@components/analytics/Analytics';
import Integrations from '@components/integrations/Integrations';
import { AuthProvider } from '@components/login/AuthContext';
import { StoreProvider } from '@components/login/StoreContext';
import ProtectedRoute from '@components/login/ProtectedRoute';
import StoreSelection from '@components/login/StoreSelection';
import { NotificationProvider } from './contexts/NotificationContext';
import CustomerHistory from '@components/customers/CustomerHistory';
import Memberships from '@components/membership/Memberships';
import ProtectedLayout from '@components/main/Main';
import CustomerTable from '@components/customers/CustomerTable';
import Customers from '@components/customers/Customers';
import Lists from '@components/lists/Lists';
import Review from './components/reviews/Review';
import ReviewForm from './components/reviews/ReviewForm';

function App() {
  return (
    <Router>
      <AuthProvider>
        <StoreProvider>
          <NotificationProvider>
          <Routes>
            {/* Public Route: Anyone can access the login page */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />
            
            {/* Store Selection Route: Authenticated users who need to select a store */}
            <Route element={<ProtectedRoute requireStore={false} />}>
              <Route path="/select-store" element={<StoreSelection />} />
            </Route>
            
            {/* Protected Routes: Only logged-in users with a selected store can access these */}
            <Route element={<ProtectedRoute requireStore={true} />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/customers" element={<Customers />} />
                <Route path="/products" element={<Products />} />
                <Route path='/services' element={<Services/>}/>
                <Route path="/appointments" element={<Lists />} />
                <Route path='/home' element={<Home/>}/>
                <Route path='/profile' element={<Profile/>}/>
                <Route path="/invoices" element={<BillingHistory/>} />
                <Route path="/expenses" element={<Expenses />} />
                <Route path="/support" element={<CustomerSupportWidget />} />
                <Route path="/billing" element={<Billing />} />
                <Route path="/staff" element={<Staff />} />
                <Route path="/memberships" element={<Memberships />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/integrations" element={<Integrations />} />
                <Route path="/reviews" element={<Review />} />
              </Route>
            </Route>

            {/* Review Form Route - can be accessed with ID parameter */}
            
            {/* Optional: A fallback route to redirect to home if logged in, or login if not */}
            <Route path="*" element={<Navigate to="/home" />} />
          </Routes>
          </NotificationProvider>
        </StoreProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
