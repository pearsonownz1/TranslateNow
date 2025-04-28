import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, AlertCircle } from 'lucide-react';
import StripePaymentForm from './StripePaymentForm'; // Reuse the Stripe form
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid'; // For generating order number

// Interface for the quote data needed on this page
interface QuoteDetails {
  id: string;
  created_at: string;
  price: number;
  status: string;
  source_language: string;
  target_language: string;
  document_type: string;
  user_id: string; // Keep this, might be useful for reference but not for insert
  document_paths: string[] | null; // Corrected: Fetch the document paths array
}

// Interface for the data needed by StripePaymentForm's onComplete
// This might need adjustment based on StripePaymentForm's actual implementation
interface PaymentCompletionData {
  // Define fields passed by StripePaymentForm upon successful payment
  // e.g., paymentIntentId, transactionId, etc.
  success: boolean;
}


const QuotePaymentStep = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [quote, setQuote] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    const fetchQuoteDetails = async () => {
      if (!quoteId) {
        setError("Quote ID is missing from URL.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('quotes')
        // Select necessary fields, including document_paths (Corrected)
        .select('id, created_at, price, status, source_language, target_language, document_type, user_id, document_paths')
        .eq('id', quoteId)
        .maybeSingle(); // Use maybeSingle to handle null case gracefully

      if (fetchError) {
        console.error("Error fetching quote details:", fetchError);
        setError("Failed to fetch quote details. Please try again.");
        setQuote(null);
      } else if (!data) {
        setError("Quote not found or you do not have permission to view it.");
        setQuote(null);
      } else if (data.status !== 'quoted' || !data.price) {
         // Ensure the quote is actually ready for payment
         setError("This quote is not ready for payment or does not have a price.");
         setQuote(null);
      }
       else {
        // We still store the fetched quote details
        setQuote(data as QuoteDetails);
      }
      setLoading(false);
    };

    fetchQuoteDetails();
  }, [quoteId]);

  // Function to convert the paid quote into an order
  const convertQuoteToOrder = async (paidQuote: QuoteDetails) => {
    setIsProcessingOrder(true);
    console.log("Converting quote to order:", paidQuote.id);

    // **Get the CURRENTLY authenticated user's ID, email, and metadata**
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
        console.error("Error fetching current user:", userError);
        toast({
            title: "Authentication Error",
            description: "Could not verify current user. Please log in again.",
            variant: "destructive",
        });
        setIsProcessingOrder(false);
        return false; // Indicate failure
    }
    const currentUserId = user.id;
    const currentUserEmail = user.email; // Get email from auth user
    // Construct full name from metadata, provide fallback
    const userMetaData = user.user_metadata || {};
    const firstName = userMetaData.first_name || '';
    const lastName = userMetaData.last_name || '';
    const currentUserFullName = `${firstName} ${lastName}`.trim() || currentUserEmail || 'N/A'; // Fallback

    console.log("Current authenticated user ID:", currentUserId);
    console.log("Current authenticated user Email:", currentUserEmail);
    console.log("Current authenticated user Name:", currentUserFullName);

    // **Get the actual document ID from the documents table using the path from the quote**
    let actualDocumentId: string | null = null;
    // Corrected: Use document_paths
    if (paidQuote.document_paths && Array.isArray(paidQuote.document_paths) && paidQuote.document_paths.length > 0) {
      const firstDocumentPath = paidQuote.document_paths[0];
      console.log("Fetching document ID for path:", firstDocumentPath);

      // ASSUMPTION: documents table has 'storage_path' column storing the path
      // Corrected: Query by 'file_path' column
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .select('id')
        .eq('file_path', firstDocumentPath) // Query by path using the correct column name
        .single(); // Expecting only one document per path

      if (docError || !docData) {
        console.error("Error fetching document ID from documents table:", docError);
        toast({
          title: "Document Link Error",
          description: `Could not find the document record for path: ${firstDocumentPath}. Cannot create order.`,
          variant: "destructive",
        });
        setIsProcessingOrder(false);
        return false; // Indicate failure
      }
      actualDocumentId = docData.id;
      console.log("Found document ID:", actualDocumentId);
    } else {
      // Corrected: Use document_paths
      console.error("No document path found in the quote details (document_paths).");
       toast({
         title: "Document Link Error",
         description: "Quote is missing document information. Cannot create order.",
         variant: "destructive",
       });
       setIsProcessingOrder(false);
       return false; // Indicate failure
    }

    // **Map quote details to order table columns**
    const orderToInsert = {
      order_number: uuidv4(), // Generate a new order number
      document_id: actualDocumentId, // <<< Use the actual ID fetched from documents table
      user_id: currentUserId, // **Use the ID of the currently logged-in user**
      email: currentUserEmail, // **Use email from authenticated user**
      full_name: currentUserFullName, // **Use name from authenticated user**
      document_type: paidQuote.document_type,
      source_language: paidQuote.source_language,
      target_language: paidQuote.target_language,
      service_level: 'standard', // Add default (required)
      delivery_method: 'digital', // Add default (required)
      // document_paths: paidQuote.document_paths, // Nullable, omit if not available from quote
      status: 'processing', // Or 'pending' depending on your workflow after payment
      subtotal: paidQuote.price, // Assuming price is the subtotal
      tax: 0, // Assuming no tax for quotes, adjust if needed
      total: paidQuote.price, // Total is the quoted price
      quote_id: paidQuote.id, // Link back to the original quote
      // Add any other necessary fields from your 'orders' table
    };

    // **Log right before insert**
    console.log(`Attempting to insert order with user_id: ${orderToInsert.user_id} (Type: ${typeof orderToInsert.user_id})`);
    console.log("Full order object:", orderToInsert);

    // Insert into orders table
    const { data: newOrder, error: insertError } = await supabase
      .from('orders')
      .insert([orderToInsert])
      .select()
      .single();

    if (insertError) {
      // Log the specific error message from Supabase
      console.error("Error creating order from quote:", insertError.message || insertError);
      toast({
        title: "Order Creation Failed",
        // Display the specific database error message in the toast
        description: `Could not create an order from this quote. Error: ${insertError.message}`,
        variant: "destructive",
      });
      setIsProcessingOrder(false);
      return false; // Indicate failure
    }

    // Optionally: Update the quote status to 'converted_to_order'
    const { error: updateQuoteError } = await supabase
      .from('quotes')
      .update({ status: 'converted_to_order' })
      .eq('id', paidQuote.id);

    if (updateQuoteError) {
      // Log the error but don't necessarily block success if order was created
      console.error("Error updating quote status after conversion:", updateQuoteError);
      toast({
          title: "Warning",
          description: "Order created, but failed to update original quote status.",
          variant: "default", // Use default or a warning variant
      });
    }

    console.log("Order created successfully from quote:", newOrder);
    setIsProcessingOrder(false);
    return true; // Indicate success
  };


  // Callback for StripePaymentForm on successful payment
  // Corrected signature: no arguments expected by StripePaymentForm's onSubmit
  const handlePaymentComplete = async () => {
    if (!quote) return; // Should not happen if button is enabled

    console.log("Quote payment successful via Stripe."); // Updated log message

    // Convert the quote to an order
    const orderCreated = await convertQuoteToOrder(quote);

    if (orderCreated) {
      // Navigate to a success page (could be the standard checkout success or a specific one)
      navigate("/checkout/success"); // Or a dedicated quote success page
    } else {
      // Error handled within convertQuoteToOrder, maybe add extra handling here if needed
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !quote) {
    return (
      <Card className="max-w-md mx-auto mt-10">
         <CardHeader className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
           <CardTitle className="mt-4">Error Loading Quote</CardTitle>
         </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">{error || "Could not load quote details."}</p>
          <Button variant="outline" onClick={() => navigate('/dashboard/my-quotes')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Quotes
          </Button>
        </CardContent>
      </Card>
    ); // Corrected closing parenthesis
  }


  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
       <Button variant="ghost" onClick={() => navigate('/dashboard/my-quotes')} className="mb-4">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Quotes
       </Button>
      <h1 className="text-3xl font-bold text-center mb-6">Pay Your Quote</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Quote ID:</span>
            <span className="font-medium">{quote.id.substring(0, 8)}...</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Date Quoted:</span>
            <span className="font-medium">{format(new Date(quote.created_at), 'PP')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service:</span>
            <span className="font-medium">Translation ({quote.source_language} to {quote.target_language})</span>
          </div>
          <div className="flex justify-between text-lg font-semibold pt-2 border-t mt-2">
            <span className="text-muted-foreground">Total Amount Due:</span>
            <span>${quote.price.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Stripe Payment Form */}
      {/* Pass amountInCents directly and use onSubmit */}
      <StripePaymentForm
        amountInCents={Math.round(quote.price * 100)} // Convert price to cents
        onSubmit={handlePaymentComplete}
        // Note: The isProcessing state will disable the button inside StripePaymentForm
      />
      {/* TODO: Consider adding a separate back button if needed, as StripePaymentForm doesn't seem to have one */}

    </div>
  );
};

export default QuotePaymentStep;
