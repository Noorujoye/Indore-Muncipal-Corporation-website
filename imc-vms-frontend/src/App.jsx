import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/common/ErrorBoundary';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import ContactSupport from './pages/ContactSupport';
import PublicGuidelines from './pages/PublicGuidelines';
import FAQ from './pages/FAQ';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import VendorRegistration from './pages/VendorRegistration';
import VendorLogin from './pages/auth/VendorLogin';
import IMCLogin from './pages/auth/IMCLogin';
import SetPassword from './pages/auth/SetPassword';
import VendorDashboardLayout from './components/layout/VendorDashboardLayout';
import VendorDashboard from './pages/dashboard/VendorDashboard';
import MyInvoices from './pages/dashboard/MyInvoices';
import CreateInvoice from './pages/dashboard/CreateInvoice';
import InvoiceDetail from './pages/dashboard/InvoiceDetail';
import VendorProfile from './pages/dashboard/VendorProfile';
import Helpdesk from './pages/dashboard/Helpdesk';

import IMCDashboardLayout from './components/layout/IMCDashboardLayout';
import IMCDashboard from './pages/imc/IMCDashboard';
import InvoicesQueue from './pages/imc/InvoicesQueue';
import InvoiceDecision from './pages/imc/InvoiceDecision';
import Reports from './pages/imc/Reports';
import VendorApproval from './pages/imc/VendorApproval';
import VendorDirectory from './pages/imc/VendorDirectory';
import InvoiceHistory from './pages/imc/InvoiceHistory';
import Guidelines from './pages/imc/Guidelines';

function App() {
  console.log("App Rendering");
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<ContactSupport />} />
          <Route path="/guidelines" element={<PublicGuidelines />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/vendor/register" element={<VendorRegistration />} />
          <Route path="/vendor/login" element={<VendorLogin />} />
          <Route path="/imc/login" element={<IMCLogin />} />
          <Route path="/set-password" element={<SetPassword />} />

          <Route path="/vendor" element={
            <ProtectedRoute allowedRoles={['VENDOR']}>
              <VendorDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<VendorDashboard />} />
            <Route path="invoices" element={<MyInvoices />} />
            <Route path="invoices/create" element={<CreateInvoice />} />
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            <Route path="profile" element={<VendorProfile />} />
            <Route path="helpdesk" element={<Helpdesk />} />
          </Route>

          <Route path="/imc" element={
            <ProtectedRoute allowedRoles={['CREATOR', 'VERIFIER', 'APPROVER']}>
              <IMCDashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<IMCDashboard />} />

            <Route path="queue" element={<InvoicesQueue />} />

            <Route path="vendors" element={
              <ProtectedRoute allowedRoles={['CREATOR']}>
                <VendorApproval />
              </ProtectedRoute>
            } />
            <Route path="directory" element={
              <ProtectedRoute allowedRoles={['CREATOR']}>
                <VendorDirectory />
              </ProtectedRoute>
            } />
            <Route path="reports" element={
              <ProtectedRoute allowedRoles={['CREATOR']}>
                <Reports />
              </ProtectedRoute>
            } />

            <Route path="returned" element={
              <ProtectedRoute allowedRoles={['VERIFIER']}>
                <InvoicesQueue filter="RETURNED" />
              </ProtectedRoute>
            } />
            <Route path="history" element={
              <ProtectedRoute allowedRoles={['VERIFIER', 'APPROVER']}>
                <InvoiceHistory />
              </ProtectedRoute>
            } />
            <Route path="guidelines" element={
              <ProtectedRoute allowedRoles={['VERIFIER', 'APPROVER']}>
                <Guidelines />
              </ProtectedRoute>
            } />

            <Route path="approved" element={
              <ProtectedRoute allowedRoles={['APPROVER']}>
                <InvoicesQueue filter="APPROVED" />
              </ProtectedRoute>
            } />
            <Route path="rejected" element={
              <ProtectedRoute allowedRoles={['APPROVER']}>
                <InvoicesQueue filter="REJECTED" />
              </ProtectedRoute>
            } />

            <Route path="invoices/:id" element={<InvoiceDecision />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

