import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom"; // Import useLocation
import { supabase } from "@/lib/supabase";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card"; // Added CardDescription
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Download, Send } from "lucide-react"; // Import Download, Send icons
import { format } from 'date-fns';

// Define interfaces for different quote types
interface WebQuote {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone_number?: string;
  document_type: string;
  source_language: string;
  target_language: string;
  turnaround_time: string;
  additional_notes?: string;
  status: 'pending' | 'reviewed' | 'quoted' | 'rejected';
  price?: number;
  file_path?: string;
  file_name?: string;
}

interface ApiQuote {
    id: string;
    created_at: string;
    api_key_id: string; // Foreign key to api_keys table
    user_id: string; // User associated with the API key
    applicant_name: string;
    country_of_education: string;
    degree_received: string;
    status: 'pending' | 'reviewed' | 'completed' | 'failed' | 'rejected'; // Added 'rejected' status
    us_equivalent?: string; // The field admin needs to fill
    unable_to_provide?: boolean; // New field
    rejection_reason?: string; // New field
    notes?: string; // Add notes field
    callback_url?: string; // Need to fetch this potentially via api_key_id relation
    // Add other relevant fields from api_quote_requests table
}

// Union type for the state
type QuoteDetails = (WebQuote & { source: 'web' }) | (ApiQuote & { source: 'api' });

const AdminQuoteDetailsPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const location = useLocation(); // Get location to read query params
  const { toast } = useToast();

  const [quoteDetails, setQuoteDetails] = useState<QuoteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [price, setPrice] = useState<string>(""); // Only for web quotes
  const [usEquivalent, setUsEquivalent] = useState<string>(""); // Only for API quotes
  const [unableToProvide, setUnableToProvide] = useState<boolean>(false); // New state for checkbox
  const [rejectionReason, setRejectionReason] = useState<string>(""); // New state for reason
  const [isSubmitting, setIsSubmitting] = useState(false); // Generic submitting state
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Determine source from query parameter
  const queryParams = new URLSearchParams(location.search);
  const source = queryParams.get('source') === 'api' ? 'api' : 'web'; // Default to 'web'

  // Function to generate signed URL for download
  const generateDownloadUrl = async (filePath: string) => {
      setDownloadError(null);
      // Assuming 'quote-documents' is your bucket name - CHANGE IF DIFFERENT
      const { data, error } = await supabase.storage
          .from('quote-documents')
          .createSignedUrl(filePath, 60 * 60); // URL valid for 1 hour

      if (error) {
          console.error('Error generating signed URL:', error);
          setDownloadError('Could not generate download link.');
          setDownloadUrl(null);
      } else {
          setDownloadUrl(data.signedUrl);
      }
  };


  useEffect(() => {
    const fetchQuoteDetails = async () => { // Renamed function
      if (!quoteId) {
        setError("Quote ID is missing.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setDownloadUrl(null); // Reset download URL on new quote load
      setDownloadError(null);

      const tableName = source === 'api' ? 'api_quote_requests' : 'quotes';
      const { data, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', quoteId)
        .maybeSingle(); // Use maybeSingle() for robustness here too

      if (fetchError) {
        // Log the raw error object for more details
        console.error(`Raw error fetching ${source} quote details (ID: ${quoteId}):`, fetchError);
        setError(`Failed to fetch ${source} quote details: ${fetchError.message}`); // Display the specific error message
        setQuoteDetails(null);
      } else if (data) {
        // Add the source property to the fetched data
        const details = { ...data, source } as QuoteDetails;
        setQuoteDetails(details);

        // Set initial state based on source and fetched data
        if (details.source === 'web' && details.price) {
          setPrice(details.price.toString());
        } else if (details.source === 'api' && details.us_equivalent) {
          setUsEquivalent(details.us_equivalent);
        }

        // Generate download URL only for web quotes with file_path
        if (details.source === 'web' && details.file_path) {
          generateDownloadUrl(details.file_path);
        }
      } else {
         setError(`Quote not found in ${tableName}.`);
         setQuoteDetails(null);
      }
      setLoading(false);
    };

    fetchQuoteDetails();
  }, [quoteId, source]); // Add source to dependency array

  // Handler for US Equivalent input (API quotes only)
  const handleUsEquivalentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { // Correct event type
      setUsEquivalent(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setPrice(value);
    }
  };

  // Renamed: Handles submitting price for WEB quotes
  const handleSubmitWebQuote = async () => {
    // Ensure it's a web quote and data exists
    if (!quoteDetails || quoteDetails.source !== 'web' || !price || isNaN(parseFloat(price))) {
      toast({
        title: "Invalid Data",
        description: "Cannot submit web quote. Ensure quote details are loaded and price is valid.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const quotePrice = parseFloat(price);

    const { error: updateError } = await supabase
      .from('quotes') // Target 'quotes' table
      .update({
        price: quotePrice,
        status: 'quoted',
      })
      .eq('id', quoteDetails.id);

    if (updateError) {
      console.error("Error updating web quote:", updateError);
      toast({
        title: "Update Failed",
        description: "Could not update the web quote price. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Web Quote Updated",
        description: `Price set to $${quotePrice.toFixed(2)} and status updated to 'quoted'.`,
      });
      // Send email only for web quotes
      await sendQuoteReadyEmail(quoteDetails.email, quoteDetails.id, quotePrice);
      // Update local state
      setQuoteDetails({ ...quoteDetails, price: quotePrice, status: 'quoted' });
    }
    setIsSubmitting(false);
  };

  // Handles submitting US Equivalent OR Rejection for API quotes
  const handleApiQuoteSubmit = async () => {
     if (!quoteDetails || quoteDetails.source !== 'api') {
       toast({ title: "Error", description: "Quote details not loaded correctly.", variant: "destructive" });
       return;
     }

     // Validation: Ensure either equivalent is provided OR rejection reason is provided
     if (!unableToProvide && !usEquivalent) {
       toast({ title: "Missing Information", description: "Please enter the US Equivalent.", variant: "destructive" });
       return;
     }
     if (unableToProvide && !rejectionReason) {
       toast({ title: "Missing Information", description: "Please provide a reason for being unable to provide equivalency.", variant: "destructive" });
       return;
     }

     setIsSubmitting(true);
     let callbackUrl: string | null = null;
     let webhookSecret: string | null = null;
     let updateError: any = null;
     let callbackError: string | null = null;

     try {
        // Ensure api_key_id exists before querying
        if (!quoteDetails?.api_key_id) {
            throw new Error("API Key ID is missing from the quote details.");
        }

        // 1. Fetch callback URL and secret associated with the API key
        // Use .limit(1).maybeSingle() for robust fetching of zero or one record
        const { data: apiKeyData, error: keyFetchError } = await supabase
            .from('api_keys')
            .select('callback_url, webhook_secret')
            .eq('id', quoteDetails.api_key_id)
            .limit(1) // Defensively limit to 1 row server-side
            .maybeSingle(); // Return null instead of error if 0 rows, still errors on >1 row *if* limit wasn't respected

        if (keyFetchError) {
            // Log the raw error for more details
            console.error("Raw keyFetchError:", keyFetchError);
            // Re-throw with a clearer message
            throw new Error(`Failed during API key details query: ${keyFetchError.message}`);
        }

        // Check if a key was actually found
        if (!apiKeyData) {
             // No key found
             throw new Error(`API key details not found for key ID: ${quoteDetails.api_key_id}`);
        }

        // Proceed using the found apiKeyData
        callbackUrl = apiKeyData.callback_url;
        webhookSecret = apiKeyData.webhook_secret;

        // Check if required callback info exists
        if (!callbackUrl || !webhookSecret) {
            console.warn(`Callback URL or Webhook Secret missing for API Key ID: ${quoteDetails.api_key_id}. Skipping callback.`);
            // Proceed with DB update but skip callback
         }

         // 2. Prepare update data based on whether rejecting or completing
         const updateData: Partial<ApiQuote> = unableToProvide
           ? {
               status: 'rejected', // New status for rejection
               unable_to_provide: true,
               rejection_reason: rejectionReason,
               us_equivalent: null, // Clear any previously entered equivalent
             }
           : {
               status: 'completed',
               us_equivalent: usEquivalent,
               unable_to_provide: false, // Explicitly set to false
               rejection_reason: null, // Clear any previously entered reason
             };

         // 3. Update the api_quote_requests table
         const { error: dbUpdateError } = await supabase
             .from('api_quote_requests')
             .update(updateData)
             .eq('id', quoteDetails.id);
            // Remove .select().maybeSingle() - just perform the update

        if (dbUpdateError) {
            updateError = dbUpdateError; // Store error to handle after finally block
            // Log the raw update error
            console.error("Raw dbUpdateError:", dbUpdateError);
            throw new Error(`Failed to update API quote request: ${dbUpdateError.message}`);
        }
        // If we reach here without an error, the update was successful

         // Update local state immediately after successful DB update
         const newStatus = unableToProvide ? 'rejected' : 'completed';
         setQuoteDetails({
             ...quoteDetails,
             ...updateData, // Apply the changes to local state
             status: newStatus, // Ensure status type matches
         });
         toast({
             title: unableToProvide ? "Quote Rejected" : "US Equivalent Saved",
             description: unableToProvide ? "Rejection reason saved successfully." : "The US Equivalent has been saved successfully.",
         });


         // 4. Trigger the callback if URL and secret exist
         if (callbackUrl && webhookSecret) {
             // Prepare payload based on outcome
             const callbackPayload = unableToProvide
               ? { // Rejection payload
                   quote_request_id: quoteDetails.id,
                   applicant_name: quoteDetails.applicant_name,
                   status: 'rejected',
                   unable_to_provide: true,
                   rejection_reason: rejectionReason,
                 }
               : { // Completion payload
                   quote_request_id: quoteDetails.id,
                   applicant_name: quoteDetails.applicant_name,
                   status: 'completed',
                   us_equivalent: usEquivalent,
                   unable_to_provide: false,
                 };

            const callbackResponse = await fetch('/api/send-partner-callback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callbackUrl,
                    webhookSecret,
                    payload: callbackPayload,
                }),
            });

            const callbackResult = await callbackResponse.json();

            if (!callbackResponse.ok || callbackResult.partner_status) { // Check for our API error OR partner endpoint error
                 console.error("Callback sending issue:", callbackResult);
                 callbackError = callbackResult.message || 'Callback sent, but partner endpoint responded with an error.'; // Store error
                 // Show a warning toast, but don't treat as a fatal error for the admin flow
                 toast({
                     title: "Callback Warning",
                     description: callbackError,
                     variant: "default", // Use default or a custom 'warning' variant
                     duration: 7000,
                 });
            } else {
                 toast({
                     title: "Partner Notified",
                     description: "Callback sent successfully to the partner.",
                 });
            }
        } else {
             toast({
                 title: "Callback Skipped",
                 description: "Callback URL or secret not configured for this API key.",
                 variant: "default",
                 duration: 7000,
             });
        }

     } catch (err) {
         // Log the entire error object for detailed inspection
         console.error("Full error object during API quote submission:", err);

         const message = err instanceof Error ? err.message : "An unexpected error occurred during submission.";
         // Keep logging the message for consistency, but the full object log is key
         console.error("Error submitting API quote (message only):", message);
         toast({
             title: "Submission Failed",
             description: message, // Keep showing the message in the UI toast
             variant: "destructive",
         });
         // If DB update failed, potentially revert local state if needed, though fetch on error might be better
         // Example: if (updateError) setQuoteDetails(prev => prev ? {...prev, status: 'pending', us_equivalent: ''} : null);
     } finally {
         setIsSubmitting(false);
     }
  };


  const sendQuoteReadyEmail = async (email: string, quoteId: string, price: number) => {
    // This function remains largely the same, only called by handleSubmitWebQuote
    try {
      const response = await fetch('/api/send-quote-ready-email', { // Corrected structure
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, quoteId, price }),
      });
      if (!response.ok) {
         const errorData = await response.json().catch(() => ({ message: 'Failed to send email notification.' }));
         throw new Error(errorData.message || 'Failed to send email notification.');
      }
      const result = await response.json();
      console.log("Quote ready email API call successful:", result.message);
      // No toast here, handled in handleSubmitWebQuote
    } catch (emailError: any) {
      console.error("Error calling send quote ready email API:", emailError);
      toast({ // Toast for email failure specifically
        title: "Email Notification Failed",
        description: emailError.message || "Could not send the quote ready notification email.",
        variant: "destructive",
      });
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading quote details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
        <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="ml-4">
          Go Back
        </Button>
      </div>
    );
  }

  // Use quoteDetails for checks
  if (!quoteDetails) {
     return (
       <div className="text-center py-10">
         <p className="text-muted-foreground">Quote not found.</p>
         <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
         </Button>
       </div>
     );
  }

  return (
    <div>
       <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="mb-4">
         <ArrowLeft className="mr-2 h-4 w-4" /> Back to Quotes
       </Button>
      {/* Add source indication */}
      <h1 className="text-3xl font-bold mb-1">Quote Request Details</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Source: <span className={`font-semibold ${source === 'api' ? 'text-yellow-600' : 'text-blue-600'}`}>{source.toUpperCase()}</span>
      </p>


      <div className="grid gap-6 md:grid-cols-2">
        {/* Request Info Card - Adjusted for both sources */}
        <Card>
          <CardHeader>
            <CardTitle>Request Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Request ID:</span>
              <span>{quoteDetails.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Date Submitted:</span>
              <span>{format(new Date(quoteDetails.created_at), 'PPpp')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Status:</span>
              <span className="capitalize font-semibold">{quoteDetails.status}</span>
            </div>
             {/* Show price only for web quotes */}
             {quoteDetails.source === 'web' && quoteDetails.price && (
               <div className="flex justify-between text-lg font-bold text-green-600">
                 <span className="font-medium text-muted-foreground">Quoted Price:</span>
                 <span>${quoteDetails.price.toFixed(2)}</span>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Applicant Info Card - Conditional Title and Content */}
        <Card>
          <CardHeader>
            {/* Title changes based on source */}
            <CardTitle>{quoteDetails.source === 'api' ? 'Applicant Information (API)' : 'Contact Information (Web)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Display name based on source */}
            <div className="flex justify-between">
              <span className="font-medium text-muted-foreground">Name:</span>
              <span>{quoteDetails.source === 'api' ? quoteDetails.applicant_name : quoteDetails.full_name}</span>
            </div>
            {/* Display email/phone only for web source */}
            {quoteDetails.source === 'web' && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <a href={`mailto:${quoteDetails.email}`} className="text-blue-600 hover:underline">{quoteDetails.email}</a>
                </div>
                {quoteDetails.phone_number && (
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Phone:</span>
                    <span>{quoteDetails.phone_number}</span>
                  </div>
                )}
              </>
            )}
             {/* Display API specific info */}
             {quoteDetails.source === 'api' && (
               <>
                 <div className="flex justify-between">
                   <span className="font-medium text-muted-foreground">Country of Education:</span>
                   <span>{quoteDetails.country_of_education}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="font-medium text-muted-foreground">Degree Received:</span>
                   <span>{quoteDetails.degree_received}</span>
                 </div>
               </>
             )}
          </CardContent>
        </Card>

        {/* Request Details Card - Conditional Content */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{quoteDetails.source === 'api' ? 'Request Details (API)' : 'Translation Details (Web)'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             {/* Web specific details */}
             {quoteDetails.source === 'web' && (
               <>
                 <div className="flex justify-between">
                   <span className="font-medium text-muted-foreground">Document Type:</span>
                   <span>{quoteDetails.document_type}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="font-medium text-muted-foreground">Languages:</span>
                   <span>{`${quoteDetails.source_language} → ${quoteDetails.target_language}`}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="font-medium text-muted-foreground">Desired Turnaround:</span>
                   <span>{quoteDetails.turnaround_time}</span>
                 </div>
                 {/* Display Download Link */}
                 {quoteDetails.file_path && (
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-medium text-muted-foreground">Uploaded File:</span>
                        {downloadUrl ? (
                            <Button variant="outline" size="sm" asChild>
                                <a href={downloadUrl} download={quoteDetails.file_name || 'download'}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download {quoteDetails.file_name || 'File'}
                                </a>
                            </Button>
                        ) : downloadError ? (
                             <span className="text-sm text-red-600">{downloadError}</span>
                        ) : (
                             <span className="text-sm text-muted-foreground">Generating link...</span>
                        )}
                    </div>
                 )}
                {quoteDetails.additional_notes && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-muted-foreground block mb-1">Additional Notes:</span>
                    <p className="text-sm bg-gray-50 p-3 rounded border">{quoteDetails.additional_notes}</p>
                  </div>
                )}
               </>
             )}
             {/* API specific details */}
             {quoteDetails.source === 'api' && (
               <>
                 <p className="text-sm text-muted-foreground">
                     This request was submitted via the Partner API. Please provide the US Equivalent or reject below.
                 </p>
                 {/* Display Customer Notes */}
                 {quoteDetails.notes && (
                   <div className="pt-2 border-t mt-4">
                     <span className="font-medium text-muted-foreground block mb-1">Customer Notes:</span>
                     <p className="text-sm bg-gray-50 p-3 rounded border">{quoteDetails.notes}</p>
                   </div>
                 )}
               </>
             )}
          </CardContent>
        </Card>

        {/* Conditional Action Card (Pricing or US Equivalent) */}
        {quoteDetails.source === 'web' ? (
            // Pricing Section Card (Web Quotes)
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Provide Quote Price</CardTitle>
                <CardDescription>Enter the price for this translation quote.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="price">Quote Price ($)</Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="Enter price e.g., 125.50"
                    value={price}
                    onChange={handlePriceChange}
                    disabled={isSubmitting || quoteDetails.status === 'quoted'}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleSubmitWebQuote} // Use specific handler
                  disabled={isSubmitting || !price || quoteDetails.status === 'quoted'}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {quoteDetails.status === 'quoted' ? 'Quote Submitted' : 'Submit Quote Price'}
                </Button>
              </CardFooter>
            </Card>
        ) : (
             // US Equivalent Section Card (API Quotes)
             <Card className="md:col-span-2">
               <CardHeader>
                 <CardTitle>Provide US Equivalent</CardTitle>
                 <CardDescription>Enter the US degree equivalency for this API request. This will trigger a callback to the partner.</CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
                 {/* US Equivalent Textarea */}
                 <div>
                   <Label htmlFor="usEquivalent">US Equivalent</Label>
                   <Textarea
                     id="usEquivalent"
                     placeholder="e.g., Bachelor's Degree in Engineering"
                     value={usEquivalent}
                     onChange={handleUsEquivalentChange}
                     disabled={isSubmitting || unableToProvide || ['completed', 'rejected', 'failed'].includes(quoteDetails.status)} // Disable if unable or already processed
                     rows={3}
                   />
                 </div>

                 {/* Unable to Provide Checkbox */}
                 <div className="flex items-center space-x-2 pt-4 border-t">
                   <Checkbox
                     id="unableToProvide"
                     checked={unableToProvide}
                     onCheckedChange={(checked) => setUnableToProvide(Boolean(checked))}
                     disabled={isSubmitting || ['completed', 'rejected', 'failed'].includes(quoteDetails.status)}
                   />
                   <Label htmlFor="unableToProvide" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                     Unable to Provide Equivalency
                   </Label>
                 </div>

                 {/* Rejection Reason Textarea (Conditional) */}
                 {unableToProvide && (
                   <div>
                     <Label htmlFor="rejectionReason">Reason</Label>
                     <Textarea
                       id="rejectionReason"
                       placeholder="Explain why equivalency cannot be provided..."
                       value={rejectionReason}
                       onChange={(e) => setRejectionReason(e.target.value)}
                       disabled={isSubmitting || ['completed', 'rejected', 'failed'].includes(quoteDetails.status)}
                       rows={3}
                       required={unableToProvide} // Make required if checkbox is checked
                     />
                   </div>
                 )}
               </CardContent>
               <CardFooter>
                 <Button
                   onClick={handleApiQuoteSubmit} // Use API handler
                   // Disable if submitting, or if already processed, or if rejecting without a reason
                   disabled={
                     isSubmitting ||
                     ['completed', 'rejected', 'failed'].includes(quoteDetails.status) ||
                     (unableToProvide && !rejectionReason) || // Must provide reason if rejecting
                     (!unableToProvide && !usEquivalent) // Must provide equivalent if not rejecting
                   }
                 >
                   {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                   {['completed', 'rejected', 'failed'].includes(quoteDetails.status)
                     ? 'Response Submitted'
                     : unableToProvide
                     ? 'Submit Rejection & Notify Partner'
                     : 'Submit US Equivalent & Notify Partner'}
                 </Button>
               </CardFooter>
             </Card>
        )}
      </div>
    </div>
  );
};

// Removed duplicated closing tags from previous faulty merge

export default AdminQuoteDetailsPage;
