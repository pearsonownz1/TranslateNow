import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "./lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Toaster } from "./components/ui/toaster";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Home from "./components/home";
import LandingPage from "./components/landing/LandingPage";
import CheckoutLayout from "./components/checkout/CheckoutLayout";
import { loadStripe } from '@stripe/stripe-js'; // Import loadStripe
import { Elements } from '@stripe/react-stripe-js'; // Import Elements provider

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
const OrderConfirmation = lazy( // Keep this for now, might reuse later or remove
  () => import("./components/checkout/OrderConfirmation"),
);
const PaymentSuccessPage = lazy( // Import the new success page
  () => import("./components/checkout/PaymentSuccessPage"),
);

// Lazy load page components
const PricingPage = lazy(() => import("./components/pricing/PricingPage"));
const SolutionsPage = lazy(() => import("./components/solutions/SolutionsPage"));
// Lazy load the new solution pages
const ImmigrationPage = lazy(() => import("./components/solutions/ImmigrationPage"));
const LegalPage = lazy(() => import("./components/solutions/LegalPage"));
const AcademicPage = lazy(() => import("./components/solutions/AcademicPage"));
const BusinessPage = lazy(() => import("./components/solutions/BusinessPage"));
const PersonalPage = lazy(() => import("./components/solutions/PersonalPage"));

const ResourcesPage = lazy(
  () => import("./components/resources/ResourcesPage"),
);
const ContactPage = lazy(() => import("./components/contact/ContactPage"));
const LoginPage = lazy(() => import("./components/auth/LoginPage"));
const RegisterPage = lazy(() => import("./components/auth/RegisterPage"));
const CallbackPage = lazy(() => import("./components/auth/CallbackPage"));
const EmailVerifiedPage = lazy(() => import("./components/auth/EmailVerifiedPage")); // Import the new page
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
const SettingsPage = lazy(() => import("./components/dashboard/SettingsPage")); // Import SettingsPage


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

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

import { ContactFormValues } from "./components/checkout/ContactInfoStep";
// Import the specific types needed from DocumentAndLanguageStep
import { DocumentLanguageData, UploadedFile } from "./components/checkout/DocumentAndLanguageStep";
import { ServiceOptionsData } from "./components/checkout/ServiceOptionsStep";
import { DeliveryOptionsData } from "./components/checkout/DeliveryOptionsStep";

// Define and export a type for the overall order data
export interface OrderData {
  contactInfo?: ContactFormValues;
  documentLanguage?: DocumentLanguageData; // This now contains files: UploadedFile[]
  serviceOptions?: ServiceOptionsData;
  deliveryOptions?: DeliveryOptionsData;
  // Add fields for payment step if needed
}

// Load Stripe outside of component render to avoid recreating on every render
// Use Vite env var for publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


// Define a component to handle checkout logic including navigation
const CheckoutFlow = () => {
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState<OrderData>({});
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true); // Add loading state for session check

 useEffect(() => {
    setLoadingSession(true);
    // Fetch session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      // If logged in, pre-populate contact info and potentially skip first step
      if (session?.user) {
        const contactInfo = {
          fullName: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || session.user.email || '', // Construct full name
          email: session.user.email || '',
        };
         // Only set if not already set (e.g., user went back)
        setOrderData(prev => ({
            ...prev,
            contactInfo: prev.contactInfo || contactInfo
        }));
        // Check if we are on the base checkout route and should redirect
        if (window.location.pathname === '/checkout' || window.location.pathname === '/checkout/') {
             console.log("User logged in, skipping contact step.");
             navigate("/checkout/document-language", { replace: true });
        }
      }
      setLoadingSession(false); // Session check complete
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  // Define navigation handlers
  const handleContactNext = (data: ContactFormValues) => { // Use specific type
    console.log("Contact Info Data:", data);
    setOrderData(prev => ({ ...prev, contactInfo: data })); // Store contact info
    navigate("/checkout/document-language");
  };

  // Updated to accept and store data
  const handleDocumentLanguageNext = (data: DocumentLanguageData) => {
    console.log("Document/Language Data:", data);
    // Note: Storing the File object in state might have implications if you need serialization (e.g., Redux).
    // For component state, it's generally fine. Consider uploading the file here or in PaymentStep
    // and storing a URL/identifier instead if needed long-term before payment.
    setOrderData(prev => ({ ...prev, documentLanguage: data }));
    navigate("/checkout/service");
  };

  // Updated to accept and store data
  const handleServiceNext = (data: ServiceOptionsData) => {
    console.log("Service Options Data:", data);
    setOrderData(prev => ({ ...prev, serviceOptions: data }));
    navigate("/checkout/delivery");
  };
  const handleServiceBack = () => navigate("/checkout/document-language");

  // Updated to accept and store data
  const handleDeliveryNext = (data: DeliveryOptionsData) => {
    console.log("Delivery Options Data:", data);
    setOrderData(prev => ({ ...prev, deliveryOptions: data }));
    navigate("/checkout/payment");
  };
  const handleDeliveryBack = () => navigate("/checkout/service");

  // Updated to save order before navigating
  const handlePaymentComplete = async () => { // Made async
    console.log("Payment complete callback received. Attempting to save order...");
    const savedOrderData = await saveOrder(); // Call saveOrder and wait for result (order object or false)

    if (savedOrderData) { // Check if saveOrder returned the saved order object (truthy)
      console.log("Order saved successfully. Navigating to success page.");
      // Navigate to the new success page
      navigate("/checkout/success"); // Changed from /confirmation
      setOrderData({}); // Clear the order data after successful navigation
      // No need to return savedOrderData here as navigation handles the next step
    } else {
      console.error("Order save failed or did not return data. Staying on payment page.");
      // Optionally show an error message to the user here using a toast or alert
      // Indicate failure if needed by the calling component (PaymentStep)
      // For now, we just log the error and stay on the page.
    }
    // Note: We removed the return statements from inside the if/else
    // as the primary action is navigation or staying put.
  };
  const handlePaymentBack = () => navigate("/checkout/delivery");

  // Function to save the order (called from handlePaymentComplete)
  const saveOrder = async () => {
    if (!session?.user) {
      console.error("No user session found. Cannot save order.");
      // Handle error appropriately - maybe redirect to login?
      return;
    }
    if (!orderData.contactInfo /* Add checks for other required data */) {
       console.error("Incomplete order data. Cannot save order.");
       // Handle error - maybe show a message to the user
       return false; // Indicate failure
    }
    // Add checks for other required data fields from previous steps
    if (!orderData.documentLanguage || !orderData.serviceOptions || !orderData.deliveryOptions) {
        console.error("Incomplete order data (missing doc/lang, service, or delivery). Cannot save order.");
        return false; // Indicate failure
    }


    console.log("Attempting to save order:", { userId: session.user.id, ...orderData });

    // **IMPORTANT**: Map orderData state to your actual 'orders' table columns
    // Calculate the final price based on selections
    const { total } = calculateTotal(orderData); // Calculate total price

    // Log the document language data before accessing it
    console.log("Document Language Data in saveOrder:", orderData.documentLanguage);

    // Calculate document_id before creating the object
    const docIdToInsert = orderData.documentLanguage.files[0]?.storagePath || null; // Use first file's path, handle empty array
    console.log("Value being used for document_id:", docIdToInsert); // Log the value being inserted

    const orderToInsert = {
      user_id: session.user.id,
      email: orderData.contactInfo.email, // Can assume contactInfo exists due to check above
      full_name: orderData.contactInfo.fullName,
      document_type: orderData.documentLanguage.documentType,
      source_language: orderData.documentLanguage.sourceLanguage,
      target_language: orderData.documentLanguage.targetLanguage,
      // Map the array of successful file uploads (e.g., store their storage paths)
      // Adjust based on how you want to store multiple file references in your DB
      // Option 1: Store as JSON array of paths (if column type is jsonb) - Ensure storagePath is set!
      document_paths: orderData.documentLanguage.files.map(f => f.storagePath).filter(Boolean),
      document_id: docIdToInsert, // Use the calculated value
      // Option 2: Store as comma-separated string (less flexible)
      // document_paths_csv: orderData.documentLanguage.files.map(f => f.storagePath).filter(Boolean).join(','),
      // Option 3: If you have a separate related table for documents, insert records there.

      service_level: orderData.serviceOptions.serviceId,
      delivery_option: orderData.deliveryOptions.deliveryId,
      status: 'pending', // Initial status
      total_price: total, // Add calculated total price
      // Add any other relevant fields from your DB schema
    };

    const { data, error } = await supabase
      .from('orders') // **Ensure this is your correct table name**
      .insert([orderToInsert])
      .select(); // Optionally select the inserted data

    if (error) {
      console.error("Error saving order:", error);
      // Handle error - show message to user, maybe don't navigate
      // Example: toast({ title: "Error", description: "Could not save your order.", variant: "destructive" });
      return false; // Indicate failure
    } else {
      console.log("Order saved successfully:", data);
      const savedOrder = data[0];

      // After successful save, trigger the confirmation email API call
      // We don't need to wait for the email to send before proceeding
      fetch('/api/send-order-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: savedOrder.id, // Pass the actual saved order ID
          customerEmail: savedOrder.email, // Pass customer email
          orderDetails: orderData, // Pass the collected order details for the email body
          totalPrice: calculateTotal(orderData).total // Corrected function name
        }),
      })
      .then(async (res) => {
          if (!res.ok) {
              const errorData = await res.json();
              console.error("Failed to send confirmation email:", errorData);
          } else {
              console.log("Confirmation email API call successful.");
          }
      })
      .catch(emailError => {
          console.error("Error calling confirmation email API:", emailError);
      });


      // Optionally clear orderData state here
      // setOrderData({});
      return savedOrder; // Return the saved order data
    }
  };

  // Helper function to calculate total price (needed for email)
  // TODO: Refactor this to be shared with PaymentStep or move to a utility file
  const calculateTotal = (data: OrderData): { subtotal: number, tax: number, total: number, amountInCents: number } => {
      let subtotal = 0;
      const PRICES = { // Duplicated from PaymentStep - refactor needed
          document: { standard: 50, certificate: 75, legal: 100, medical: 120, technical: 90 },
          service: { standard: 0, expedited: 30, certified: 50 },
          delivery: { digital: 0, physical: 20, 'expedited-physical': 35 },
          taxRate: 0.08,
      };
      const docType = data.documentLanguage?.documentType as keyof typeof PRICES.document | undefined;
      if (docType && PRICES.document[docType] !== undefined) subtotal += PRICES.document[docType];
      const serviceId = data.serviceOptions?.serviceId as keyof typeof PRICES.service | undefined;
      if (serviceId && PRICES.service[serviceId] !== undefined) subtotal += PRICES.service[serviceId];
      const deliveryId = data.deliveryOptions?.deliveryId as keyof typeof PRICES.delivery | undefined;
      if (deliveryId && PRICES.delivery[deliveryId] !== undefined) subtotal += PRICES.delivery[deliveryId];
      const tax = subtotal * PRICES.taxRate;
      const total = subtotal + tax;
      const amountInCents = Math.round(total * 100);
      return { subtotal, tax, total, amountInCents };
  };


  // Render loading indicator while checking session
  if (loadingSession) {
     return (
       <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Adjust height as needed */}
         <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
       </div>
     );
  }

  return (
    // Wrap the routes with the Stripe Elements provider
    <Elements stripe={stripePromise}>
      <Routes>
        {/* Checkout routes using the new layout */}
        <Route element={<CheckoutLayout />}>
          {/* Conditionally render ContactInfoStep only if not logged in, or handle redirect above */}
         {/* The redirect in useEffect should handle skipping this for logged-in users */}
        <Route index element={<ContactInfoStep onNext={handleContactNext} defaultValues={orderData.contactInfo} />} />
        <Route
          path="document-language"
          element={<DocumentAndLanguageStep onNext={handleDocumentLanguageNext} defaultValues={orderData.documentLanguage} />}
        />
        <Route
          path="service"
          element={<ServiceOptionsStep onNext={handleServiceNext} onBack={handleServiceBack} defaultValues={orderData.serviceOptions} />}
        />
        <Route
          path="delivery"
          element={<DeliveryOptionsStep onNext={handleDeliveryNext} onBack={handleDeliveryBack} defaultValues={orderData.deliveryOptions} />}
        />
        <Route
          path="payment"
          // Pass relevant orderData down to PaymentStep for calculation/display
           element={<PaymentStep orderData={orderData} onComplete={handlePaymentComplete} onBack={handlePaymentBack} />}
         />
         {/* <Route path="confirmation" element={<OrderConfirmation />} />  // Comment out or remove old confirmation route */}
         <Route path="success" element={<PaymentSuccessPage />} /> {/* Add route for the new success page */}
       </Route>
     </Routes>
   </Elements>
  );
};


function App() {
  return (
    <Router>
      <React.Suspense
        fallback={
            <div className="flex items-center justify-center min-h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Remove incorrect /checkout route */}
            <Route path="/pricing" element={<PricingPage />} />
            {/* Keep the main /solutions route */}
            <Route path="/solutions" element={<SolutionsPage />} />
            {/* Add routes for individual solution pages */}
            <Route path="/solutions/immigration" element={<ImmigrationPage />} />
            <Route path="/solutions/legal" element={<LegalPage />} />
            <Route path="/solutions/academic" element={<AcademicPage />} />
            <Route path="/solutions/business" element={<BusinessPage />} />
            <Route path="/solutions/personal" element={<PersonalPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route path="/email-verified" element={<EmailVerifiedPage />} /> {/* Add route for email verification page */}
            <Route path="/quote" element={<QuotePage />} />

            {/* Dashboard routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardHome />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="orders/:orderId" element={<OrderDetailsPage />} />
              <Route path="settings" element={<SettingsPage />} /> {/* Add route for SettingsPage */}
              {/* Add routes for Billing, Support etc. if needed */}
            </Route>

            {/* Admin routes */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="pending-orders" element={<AdminPendingOrdersPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="orders/:orderId" element={<AdminOrderDetailsPage />} />
            </Route>

            {/* Use the CheckoutFlow component for checkout routes */}
            <Route path="/checkout/*" element={<CheckoutFlow />} />

          </Routes>
          <Toaster />
        </React.Suspense>
      </Router>
  );
}

export default App;
