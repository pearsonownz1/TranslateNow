import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutLayout from './CheckoutLayout';
import { Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from 'uuid';

// --- Step Component Imports ---
import ContactInfoStep, { ContactFormValues } from './ContactInfoStep';
import ServiceSelectionStep from './ServiceSelectionStep';
import EvaluationOptionsStep, { EvaluationData } from './EvaluationOptionsStep'; // Re-added import
import EvaluationDocumentUploadStep, { UploadedEvalFile } from './EvaluationDocumentUploadStep'; // Re-added import
import DocumentAndLanguageStep, { DocumentLanguageData } from './DocumentAndLanguageStep';
import ServiceOptionsStep, { ServiceOptionsData } from './ServiceOptionsStep';
import DeliveryOptionsStep, { DeliveryOptionsData } from './DeliveryOptionsStep';
import PaymentStep from './PaymentStep';
import PaymentSuccessPage from './PaymentSuccessPage';

// --- Type Definitions ---
// Restore credential-evaluation to ServiceType
export type ServiceType = 'credential-evaluation' | 'certified-translation' | null;

// Re-added EvaluationData interface (it's also exported from EvaluationOptionsStep, but defining here for clarity might be okay or choose one source)
// Let's rely on the import from EvaluationOptionsStep for EvaluationData.

export interface CombinedOrderData {
  serviceType: ServiceType;
  contactInfo?: ContactFormValues;
  evaluationDetails?: EvaluationData & { evaluationDocs?: UploadedEvalFile[] }; // Re-added evaluationDetails, combining options and docs
  translationDetails?: {
    documentLanguage?: DocumentLanguageData;
    serviceOptions?: ServiceOptionsData;
    deliveryOptions?: DeliveryOptionsData;
  };
  paymentIntentId?: string;
  clientSecret?: string;
}

// --- Main Checkout Flow Component ---
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const CheckoutFlow = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState<Partial<CombinedOrderData>>({ serviceType: null });
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [isInitializingPayment, setIsInitializingPayment] = useState(false);
  const [paymentInitError, setPaymentInitError] = useState<string | null>(null);

  // Session handling
  useEffect(() => {
    setLoadingSession(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setOrderData(prev => ({
          ...prev,
          contactInfo: prev.contactInfo || {
            fullName: `${session.user.user_metadata?.first_name || ''} ${session.user.user_metadata?.last_name || ''}`.trim() || session.user.email || '',
             email: session.user.email || '',
           }
         }));
        // Removed the automatic navigation for logged-in users.
        // They should now land on the index route (ServiceSelectionStep) defined in the <Routes>.
       }
      setLoadingSession(false);
    });
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setSession(session);
       if (!session && window.location.pathname.startsWith('/checkout')) {
           navigate('/login', { replace: true });
       }
     });
     return () => subscription.unsubscribe();
  }, []); // Run only once on mount

  // --- Navigation Handlers ---

  // Service Selection (Now the first step for everyone)
  const handleServiceSelectionNext = (service: ServiceType) => {
     setOrderData(prev => ({ ...prev, serviceType: service }));
     // Restore credential-evaluation path
     if (service === 'credential-evaluation') {
         navigate("evaluation-options");
     } else if (service === 'certified-translation') {
         // Navigate to contact info (if logged out) or doc/lang (if logged in)
         if (!session?.user) {
             navigate("contact-info"); // New route for contact info
         } else {
             navigate("translation-document-language");
         }
     }
  };
  // Back from service selection should likely go to home or previous non-checkout page
  const handleServiceSelectionBack = () => navigate("/");


  // Contact Info (Only shown if logged out and chose translation)
  const handleContactNext = (data: ContactFormValues) => {
    setOrderData(prev => ({ ...prev, contactInfo: data }));
    // After contact info, always proceed to translation doc/lang step
    navigate("translation-document-language");
  };
   // Back from contact info goes to service selection
   const handleContactBack = () => navigate("/checkout");


  // Restore Evaluation Options and Docs handlers
  const handleEvaluationOptionsNext = (data: EvaluationData) => {
      // Combine options data with existing evaluationDetails (if any)
      setOrderData(prev => ({ ...prev, evaluationDetails: { ...prev.evaluationDetails, ...data } }));
      navigate("evaluation-documents");
  };
   // Back from evaluation options goes to service selection
   const handleEvaluationOptionsBack = () => navigate("/checkout");


   // Evaluation Docs
   const handleEvaluationDocsNext = (docs: UploadedEvalFile[]) => { // Use UploadedEvalFile type
       setOrderData(prev => ({
           ...prev,
           // Combine docs data with existing evaluationDetails
           evaluationDetails: { ...prev.evaluationDetails, evaluationDocs: docs }
       }));
       initializePayment(); // Proceed to payment initialization
   };
   // Back from evaluation docs goes to evaluation options
   const handleEvaluationDocsBack = () => navigate("/checkout/evaluation-options");


   // Translation Document & Language
   const handleTranslationDocumentLanguageNext = (data: DocumentLanguageData) => {
     setOrderData(prev => ({
         ...prev,
         translationDetails: { ...prev.translationDetails, documentLanguage: data }
     }));
     navigate("translation-service");
   };
   // Back from translation doc/lang depends on login status
   const handleTranslationDocumentLanguageBack = () => {
       if (!session?.user) {
           navigate("/checkout/contact-info"); // Logged out: back to contact
       } else {
           navigate("/checkout"); // Logged in: back to service selection
       }
   };


   // Translation Service Options
   const handleTranslationServiceNext = (data: ServiceOptionsData) => {
     setOrderData(prev => ({
         ...prev,
         translationDetails: { ...prev.translationDetails, serviceOptions: data }
     }));
     navigate("translation-delivery");
   };
   // Back from translation service goes to doc/lang
   const handleTranslationServiceBack = () => navigate("/checkout/translation-document-language");


   // Translation Delivery Options
   const handleTranslationDeliveryNext = (data: DeliveryOptionsData) => {
     setOrderData(prev => ({
         ...prev,
         translationDetails: { ...prev.translationDetails, deliveryOptions: data }
     }));
     initializePayment(); // Proceed to payment initialization
   };
   // Back from translation delivery goes to service options
   const handleTranslationDeliveryBack = () => navigate("/checkout/translation-service");


  // --- Payment Initialization ---
  // (Keep existing initializePayment function)
  const initializePayment = () => {
    console.log("Initializing payment for:", orderData.serviceType);
    setIsInitializingPayment(true);
    setPaymentInitError(null);
    setOrderData(prev => ({ ...prev, clientSecret: undefined }));

    // --- Calculate Amount ---
    // TODO: Move this pricing logic to a shared utility function
    let amountInCents = 0;
    const PRICES = { // Keep pricing definition consistent (matches PaymentStep)
        document: { standard: 50, certificate: 75, legal: 100, medical: 120, technical: 90 },
        service: { standard: 0, expedited: 30, certified: 50 },
        delivery: { digital: 0, physical: 20, 'expedited-physical': 35 },
        evaluation: { 'course-by-course': 150, 'document-by-document': 85 },
        processing: { standard: 0, expedited: 50 }
    };

    if (orderData.serviceType === 'credential-evaluation' && orderData.evaluationDetails) {
        const evalType = orderData.evaluationDetails.evaluationType;
        const procTime = orderData.evaluationDetails.processingTime;
        if (evalType && procTime && PRICES.evaluation[evalType] !== undefined && PRICES.processing[procTime] !== undefined) {
            amountInCents = (PRICES.evaluation[evalType] + PRICES.processing[procTime]) * 100;
        } else {
             setPaymentInitError("Cannot calculate price: Missing evaluation options.");
             setIsInitializingPayment(false);
             toast({ title: "Error", description: "Cannot calculate price: Missing evaluation options.", variant: "destructive" });
             return;
        }
    } else if (orderData.serviceType === 'certified-translation' && orderData.translationDetails) {
        let subtotal = 0;
        const docType = orderData.translationDetails.documentLanguage?.documentType as keyof typeof PRICES.document | undefined;
        const serviceId = orderData.translationDetails.serviceOptions?.serviceId as keyof typeof PRICES.service | undefined;
        const deliveryId = orderData.translationDetails.deliveryOptions?.deliveryId as keyof typeof PRICES.delivery | undefined;

        if (docType && PRICES.document[docType] !== undefined) subtotal += PRICES.document[docType];
        if (serviceId && PRICES.service[serviceId] !== undefined) subtotal += PRICES.service[serviceId];
        if (deliveryId && PRICES.delivery[deliveryId] !== undefined) subtotal += PRICES.delivery[deliveryId];

        if (!docType || !serviceId || !deliveryId) {
             setPaymentInitError("Cannot calculate price: Missing translation options.");
             setIsInitializingPayment(false);
             toast({ title: "Error", description: "Cannot calculate price: Missing translation options.", variant: "destructive" });
             return;
        }
        amountInCents = Math.round(subtotal * 100);
    } else {
        setPaymentInitError("Cannot initialize payment: Service type or required details missing.");
        setIsInitializingPayment(false);
        toast({ title: "Error", description: "Cannot initialize payment: Service type or required details missing.", variant: "destructive" });
        return;
    }

    if (amountInCents <= 0) {
        setPaymentInitError("Calculated amount is invalid.");
        setIsInitializingPayment(false);
        toast({ title: "Error", description: "Calculated amount is invalid.", variant: "destructive" });
        return;
    }
    // --- End Calculate Amount ---


    // Prepare payload for the API (expects amount and currency)
    const payload = {
        amount: amountInCents,
        currency: 'usd',
        // Optionally add description or metadata if the API supports it
        // description: `Order for ${orderData.serviceType}`,
         // metadata: { serviceType: orderData.serviceType }
     };

     // Correctly removed the large commented-out validation block.
     fetch('/api/create-payment-intent', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    })
    .then(async (res) => {
        if (!res.ok) {
             const errorData = await res.json().catch(() => ({ error: { message: 'Failed to parse error response' } }));
             throw new Error(errorData.error?.message || `Failed to create payment intent (${res.status})`);
        }
        return res.json();
     })
    .then((data) => {
        if (!data.clientSecret) { throw new Error('Client secret missing from server response.'); }
        setOrderData(prev => ({ ...prev, clientSecret: data.clientSecret }));
        setPaymentInitError(null);
        navigate("payment");
    })
    .catch((error) => {
        console.error("Error fetching client secret:", error);
        setPaymentInitError(error.message || "Failed to initialize payment.");
        toast({ title: "Payment Initialization Error", description: error.message, variant: "destructive" });
    })
    .finally(() => setIsInitializingPayment(false));
  };

  // --- Payment Completion & Order Saving ---
  const handlePaymentComplete = async () => {
    console.log("Unified Payment complete callback. Saving order...");
    const savedOrder = await saveOrder();
    if (savedOrder) {
        navigate("/checkout/success", { replace: true });
        setOrderData({ serviceType: null });
    } else {
        toast({ title: "Order Save Error", description: "Failed to save your order after payment. Please contact support.", variant: "destructive" });
    }
  };

  const saveOrder = async (): Promise<any> => {
      if (!session?.user || !orderData.serviceType) {
          console.error("User or service type missing for saving order.");
          return null;
      }
      console.log("Saving order for service type:", orderData.serviceType);

      let orderToInsert: { [key: string]: any } = {
          user_id: session.user.id,
          email: orderData.contactInfo?.email,
          full_name: orderData.contactInfo?.fullName,
          order_type: orderData.serviceType,
          status: 'pending',
          order_number: uuidv4(),
      };

      // Restore credential-evaluation condition for saving order
      if (orderData.serviceType === 'credential-evaluation' && orderData.evaluationDetails) {
          orderToInsert = {
              ...orderToInsert,
              evaluation_type: orderData.evaluationDetails.evaluationType,
              processing_time: orderData.evaluationDetails.processingTime,
              // special_instructions: orderData.evaluationDetails.specialInstructions, // Add if needed in DB
              document_paths: orderData.evaluationDetails.evaluationDocs?.map(doc => doc.storagePath || doc.file.name), // Save doc paths
              // TODO: Calculate and add subtotal/total for evaluation
          };
      } else if (orderData.serviceType === 'certified-translation' && orderData.translationDetails) {
           orderToInsert = {
               ...orderToInsert,
               document_type: orderData.translationDetails.documentLanguage?.documentType,
               source_language: orderData.translationDetails.documentLanguage?.sourceLanguage,
               target_language: orderData.translationDetails.documentLanguage?.targetLanguage,
               document_paths: orderData.translationDetails.documentLanguage?.files?.map(f => f.storagePath || f.file.name),
               service_level: orderData.translationDetails.serviceOptions?.serviceId,
               delivery_method: orderData.translationDetails.deliveryOptions?.deliveryId,
               // TODO: Calculate and add subtotal/total for translation
           };
      } else {
          // This condition means serviceType is null or details are missing
          console.error("Order data details missing for the selected service type during save.");
          return null;
      }

       orderToInsert.subtotal = orderToInsert.subtotal ?? 0;
       orderToInsert.total = orderToInsert.total ?? 0;
       orderToInsert.tax = orderToInsert.tax ?? 0;

      console.log("Attempting to insert order:", orderToInsert);
      const { data, error } = await supabase.from('orders').insert([orderToInsert]).select();

      if (error) {
          console.error("Error saving order to Supabase:", error);
          toast({ title: "Database Error", description: `Failed to save order: ${error.message}`, variant: "destructive" });
          return null;
      }
      console.log("Order saved successfully:", data);
      return data[0];
  };

  // --- Render Logic ---
  if (loadingSession) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  const elementsOptions = orderData.clientSecret ? { clientSecret: orderData.clientSecret, appearance: { theme: 'stripe' as const } } : undefined;

  return (
    // Use standard React Router v6 Layout Route pattern
    <Routes>
      <Route element={<CheckoutLayout />}> {/* Layout Route */}

        {/* Step 1: Service Selection (Index Route for ALL users) */}
        <Route
          index // Make this the index route
          element={
            <ServiceSelectionStep
              onNext={handleServiceSelectionNext}
              onBack={handleServiceSelectionBack} // Use updated back handler
              defaultService={orderData.serviceType}
            />
          }
        />

        {/* Step 2 (Conditional): Contact Info (if logged out, translation selected) */}
        <Route
          path="contact-info"
          element={
             // Render only if needed, or redirect if user logs in mid-flow?
             // For simplicity, assume user stays logged out if they reach this.
             <ContactInfoStep
               onNext={handleContactNext}
               // No onBack needed here as the component doesn't support it
               // Back navigation is handled by the next step's onBack
               defaultValues={orderData.contactInfo}
             />
          }
        />


        {/* --- Evaluation Path (Restored) --- */}
        <Route
          path="evaluation-options" // Keep path relative
          element={
            <EvaluationOptionsStep
              onNext={handleEvaluationOptionsNext}
              onBack={handleEvaluationOptionsBack} // Use updated back handler
              defaultValues={orderData.evaluationDetails} // Pass options part
            />
          }
        />
        <Route
          path="evaluation-documents" // Keep path relative
          element={
            <EvaluationDocumentUploadStep
              onNext={handleEvaluationDocsNext}
              onBack={handleEvaluationDocsBack} // Use updated back handler
              defaultFiles={orderData.evaluationDetails?.evaluationDocs} // Pass docs part
            />
          }
        />

        {/* --- Translation Path --- */}
        {/* Path starts after service selection or contact info */}
        <Route path="translation-document-language" element={<DocumentAndLanguageStep onNext={handleTranslationDocumentLanguageNext} onBack={handleTranslationDocumentLanguageBack} defaultValues={orderData.translationDetails?.documentLanguage} />} />
        <Route path="translation-service" element={<ServiceOptionsStep onNext={handleTranslationServiceNext} onBack={handleTranslationServiceBack} defaultValues={orderData.translationDetails?.serviceOptions} />} />
        <Route path="translation-delivery" element={<DeliveryOptionsStep onNext={handleTranslationDeliveryNext} onBack={handleTranslationDeliveryBack} defaultValues={orderData.translationDetails?.deliveryOptions} />} />

        {/* Step Final: Payment (Unified) */}
        <Route // Keep path relative
          path="payment"
          element={
            elementsOptions ? (
              <Elements stripe={stripePromise} options={elementsOptions}>
                <PaymentStep
                  orderData={orderData}
                  onComplete={handlePaymentComplete}
                  // Restore conditional back navigation for payment step
                  onBack={() => navigate(orderData.serviceType === 'credential-evaluation' ? '/checkout/evaluation-documents' : '/checkout/translation-delivery')}
                  isInitializing={isInitializingPayment}
                  initError={paymentInitError}
                />
              </Elements>
            ) : (
              <div className="p-6">
                 {isInitializingPayment && <div className="flex items-center justify-center py-4"><Loader2 className="h-8 w-8 animate-spin" /><p className="ml-2">Preparing payment...</p></div>}
                 {paymentInitError && !isInitializingPayment && <div className="text-red-600 bg-red-100 p-3 rounded-md"><p><strong>Error:</strong> {paymentInitError}</p><Button variant="link" onClick={() => navigate(-1)}>Go Back</Button></div>}
                 {!isInitializingPayment && !paymentInitError && <p>Initializing payment...</p>}
              </div>
            )
          }
        />

         {/* Step Final: Success Page */}
         <Route path="success" element={<PaymentSuccessPage />} />

      </Route> {/* End Layout Route */}
    </Routes>
  );
};

export default CheckoutFlow;
