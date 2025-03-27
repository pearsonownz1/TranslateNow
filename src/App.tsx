import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";
import { auth0Config } from "./lib/auth0-config";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import routes from "tempo-routes";

// Lazy load checkout components
const ContactInfoStep = lazy(
  () => import("./components/checkout/ContactInfoStep"),
);
const DocumentAndLanguageStep = lazy(
  () => import("./components/checkout/DocumentAndLanguageStep"),
);
const ServiceOptionsStep = lazy(
  () => import("./components/checkout/ServiceOptionsStep"),
);
const DeliveryOptionsStep = lazy(
  () => import("./components/checkout/DeliveryOptionsStep"),
);
const PaymentStep = lazy(() => import("./components/checkout/PaymentStep"));
const OrderConfirmation = lazy(
  () => import("./components/checkout/OrderConfirmation"),
);

// Lazy load page components
const PricingPage = lazy(() => import("./components/pricing/PricingPage"));
const SolutionsPage = lazy(
  () => import("./components/solutions/SolutionsPage"),
);
const ResourcesPage = lazy(
  () => import("./components/resources/ResourcesPage"),
);
const ContactPage = lazy(() => import("./components/contact/ContactPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const RegisterPage = lazy(() => import("./components/auth/RegisterPage"));
const QuotePage = lazy(() => import("./components/quote/QuotePage"));

// Dashboard components
const DashboardLayout = lazy(
  () => import("./components/dashboard/DashboardLayout"),
);
const DashboardHome = lazy(
  () => import("./components/dashboard/DashboardHome"),
);
const OrdersPage = lazy(() => import("./components/dashboard/OrdersPage"));
const OrderDetailsPage = lazy(
  () => import("./components/dashboard/OrderDetailsPage"),
);

// Admin components
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const AdminOrdersPage = lazy(
  () => import("./components/admin/AdminOrdersPage"),
);
const AdminPendingOrdersPage = lazy(
  () => import("./components/admin/AdminPendingOrdersPage"),
);
const AdminUsersPage = lazy(() => import("./components/admin/AdminUsersPage"));
const AdminOrderDetailsPage = lazy(
  () => import("./components/admin/AdminOrderDetailsPage"),
);

function App() {
  return (
    <Auth0Provider {...auth0Config}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/checkout" element={<Home />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/solutions" element={<SolutionsPage />} />
          <Route path="/resources" element={<ResourcesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/quote" element={<QuotePage />} />

          {/* Dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:orderId" element={<OrderDetailsPage />} />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="orders" element={<AdminOrdersPage />} />
            <Route path="pending-orders" element={<AdminPendingOrdersPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="orders/:orderId" element={<AdminOrderDetailsPage />} />
          </Route>

          {/* Individual checkout steps */}
          <Route
            path="/contact-info"
            element={<ContactInfoStep onNext={() => {}} />}
          />
          <Route
            path="/document-language"
            element={<DocumentAndLanguageStep onNext={() => {}} />}
          />
          <Route
            path="/service"
            element={<ServiceOptionsStep onNext={() => {}} onBack={() => {}} />}
          />
          <Route
            path="/delivery"
            element={<DeliveryOptionsStep onNext={() => {}} onBack={() => {}} />}
          />
          <Route
            path="/payment"
            element={<PaymentStep onComplete={() => {}} onBack={() => {}} />}
          />
          <Route path="/confirmation" element={<OrderConfirmation />} />
          {import.meta.env.VITE_TEMPO === "true" && (
            <Route path="/tempobook/*" element={null} />
          )}
        </Routes>
      </Suspense>
    </Auth0Provider>
  );
}

export default App;
