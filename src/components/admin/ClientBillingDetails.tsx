import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, Inbox, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Define types (adjust based on your actual data)
interface ClientUser {
    id: string;
    email?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        company_name?: string;
        billing_email?: string;
    };
    // Add other fields if needed
}

interface QuoteRequest {
    id: string; // or number
    created_at: string;
    applicant_name?: string;
    country_of_education?: string;
    degree_received?: string;
    // Add other relevant fields
}

const ClientBillingDetails = () => {
    const { userId } = useParams<{ userId: string }>(); // Get client ID from URL
    const { toast } = useToast();
    const [client, setClient] = useState<ClientUser | null>(null);
    const [unbilledQuotes, setUnbilledQuotes] = useState<QuoteRequest[]>([]);
    const [loadingClient, setLoadingClient] = useState(true);
    const [loadingQuotes, setLoadingQuotes] = useState(true);
    const [error, setError] = useState<string | null>(null); // General error for the component
    const [quotesError, setQuotesError] = useState<string | null>(null); // Add state for quote fetching errors
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [isSyncingCustomer, setIsSyncingCustomer] = useState(false); // Loading state for sync button
    const [syncError, setSyncError] = useState<string | null>(null); // Error specific to sync action

    const quoteFee = 50; // Example fee - fetch from config/DB ideally

    useEffect(() => {
        const fetchData = async () => {
            if (!userId) {
                setError("Client ID not found in URL.");
                setLoadingClient(false);
                setLoadingQuotes(false);
                return;
            }

            setLoadingClient(true);
            setLoadingQuotes(true);
            setError(null);

            try {
                // Fetch Client Info using the secure Edge Function
                console.log(`Invoking get-user-details for userId: ${userId}`);
                // Get current session token for auth
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError || !session?.access_token) {
                    throw new Error("Could not get admin session token to fetch user details.");
                }

                const { data: clientData, error: functionError } = await supabase.functions.invoke('get-user-details', {
                    body: { userId },
                    headers: { Authorization: `Bearer ${session.access_token}` } // Pass auth token
                });

                if (functionError) {
                    console.error("Error invoking get-user-details function:", functionError);
                    let errorMessage = functionError.message;
                    try {
                        // Attempt to parse a more specific error message if the function returned one
                        const parsedError = JSON.parse(functionError.context?.responseText || '{}');
                        if (parsedError.error) errorMessage = parsedError.error;
                    } catch (parseErr) { /* Ignore parsing error */ }
                    throw new Error(`Failed to fetch client details: ${errorMessage}`);
                }

                // Check if the function returned valid user data
                if (!clientData || typeof clientData !== 'object' || !clientData.id) {
                    console.error("Invalid data received from get-user-details function:", clientData);
                    throw new Error("Client not found or function returned invalid data.");
                }

                console.log("Successfully fetched client details:", clientData);
                setClient(clientData as ClientUser);
                // setLoadingClient(false); // Set loading false after successful fetch

                // Fetch Unbilled Quotes (only after client is confirmed)
                const { data: quotesData, error: quotesError } = await supabase
                    .from('api_quote_requests') // Target the correct table
                    .select('id, created_at, applicant_name, country_of_education, degree_received') // Keep relevant fields
                    .eq('user_id', userId) // Filter by user
                    .eq('status', 'completed') // Filter by completed status
                    // TODO (Optional Refinement): Add '.is('invoice_id', null)' if an invoice_id column exists
                    .order('created_at', { ascending: true });

                if (quotesError) {
                    // Update error message for clarity
                    throw new Error(`Failed to fetch unbilled API quote requests: ${quotesError.message}`);
                }
                // Update log message for clarity
                console.log(`Fetched ${quotesData?.length || 0} unbilled API quote requests.`);
                setUnbilledQuotes(quotesData || []);

            } catch (err: any) {
                console.error("Error fetching client billing data:", err);
                setError(err.message || "Failed to load billing details.");
                setClient(null); // Clear client on error
                setUnbilledQuotes([]); // Clear quotes on error
            } finally {
                setLoadingClient(false); // Ensure loading states are always updated
                setLoadingQuotes(false);
            }
        };

        fetchData();
    }, [userId]); // Re-run if userId changes

    const handleGenerateInvoice = async () => {
        if (!client || !userId || unbilledQuotes.length === 0) return;

        setIsGeneratingInvoice(true);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
             if (!session?.access_token) {
                throw new Error("Admin session not found.");
            }

            const response = await fetch('/api/admin/generate-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ clientId: userId }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || `Failed to generate invoice (status: ${response.status})`);
            }

            toast({
                title: "Invoice Generated Successfully",
                description: result.message || `Invoice ${result.invoiceId} sent.`,
            });

            setUnbilledQuotes([]); // Clear the list immediately

        } catch (err: any) {
            console.error("Error generating invoice:", err);
            setError(`Invoice Generation Failed: ${err.message}`);
            toast({
                title: "Invoice Generation Failed",
                description: err.message || "An unexpected error occurred.",
                variant: "destructive",
            });
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const handleSyncCustomer = async () => {
        if (!client || !userId) return;

        setIsSyncingCustomer(true);
        setSyncError(null);
        setError(null);

        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session?.access_token) {
                throw new Error("Admin session not found.");
            }

            const response = await fetch('/api/admin/sync-invoiced-customer', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ clientId: userId }),
            });

             // Check if response is ok before trying to parse JSON
            if (!response.ok) {
                 let errorMsg = `Failed to sync customer (status: ${response.status})`;
                 try {
                     const errResult = await response.json();
                     errorMsg = errResult.error || errResult.details || errorMsg;
                 } catch (e) {
                     // If parsing fails, use the status text
                     errorMsg = `${errorMsg}: ${response.statusText}`;
                 }
                 throw new Error(errorMsg);
            }

            // Only parse JSON if response is ok
            const result = await response.json();

            toast({
                title: "Customer Sync Successful",
                description: result.message || `Customer ${result.customerExisted ? 'found' : 'created'} on Invoiced.com (ID: ${result.invoicedCustomerId}).`,
            });

        } catch (err: any) {
             console.error("Error syncing Invoiced.com customer:", err);
             const errMsg = err.message || "An unexpected error occurred during customer sync.";
             setSyncError(errMsg);
             toast({
                title: "Customer Sync Failed",
                description: errMsg,
                variant: "destructive",
            });
        } finally {
            setIsSyncingCustomer(false);
        }
    };

     // Helper function to format date
    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
            });
        } catch (e) {
            console.error("Error formatting date:", dateString, e);
            return 'Invalid Date';
        }
    };

    const totalOutstanding = unbilledQuotes.length * quoteFee;

    // Combined Loading State Check
    if (loadingClient) { // Only show initial client loading
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Show critical error if client fetch failed
    if (error && !client) {
         return (
           <div className="p-4">
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading Client Data</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           </div>
         );
    }

    // Should not happen if loading/error handled, but good fallback
    if (!client) {
        return <div className="p-4 text-center">Client data could not be loaded.</div>;
    }

    // Determine client name and billing email (add fallbacks)
    const clientName = client.user_metadata?.company_name || `${client.user_metadata?.first_name || ''} ${client.user_metadata?.last_name || ''}`.trim() || client.email || 'N/A';
    const billingEmail = client.user_metadata?.billing_email || client.email || 'N/A';


    return (
        <div className="space-y-6">
            {/* Display general errors that might occur after initial load */}
             {error && (
                 <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                 </Alert>
             )}

            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p><strong>Client Name:</strong> {clientName}</p>
                    <p><strong>User ID:</strong> {client.id}</p>
                    <p><strong>Billing Contact Email:</strong> {billingEmail}</p>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSyncCustomer}
                        disabled={isSyncingCustomer}
                        className="mt-2"
                    >
                        {isSyncingCustomer && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sync/Create Invoiced.com Customer
                    </Button>
                    {syncError && (
                         <p className="text-xs text-red-600 mt-1">{syncError}</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>Unbilled Quote Requests</CardTitle>
                            <CardDescription>API quote requests awaiting invoice generation.</CardDescription>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button disabled={unbilledQuotes.length === 0 || isGeneratingInvoice}>
                                    {isGeneratingInvoice && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Generate Invoice ({unbilledQuotes.length})
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Invoice Generation</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Generate and send an invoice for {unbilledQuotes.length} quote requests totaling ${totalOutstanding.toFixed(2)} to {billingEmail}?
                                    This action cannot be undone.
                                </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleGenerateInvoice}>Confirm & Send</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardHeader>
                <CardContent>
                    {loadingQuotes ? (
                         <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : quotesError ? (
                         <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error Loading Quotes</AlertTitle>
                            <AlertDescription>{quotesError}</AlertDescription>
                         </Alert>
                    ): unbilledQuotes.length === 0 ? (
                        <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                            <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-4 text-sm text-gray-600">No unbilled quote requests found for this client.</p>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant Name</TableHead>
                                        <TableHead>Degree</TableHead>
                                        <TableHead>Country</TableHead>
                                        <TableHead>Requested Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {unbilledQuotes.map((quote) => (
                                        <TableRow key={quote.id}>
                                            <TableCell>{quote.applicant_name || 'N/A'}</TableCell>
                                            <TableCell>{quote.degree_received || 'N/A'}</TableCell>
                                            <TableCell>{quote.country_of_education || 'N/A'}</TableCell>
                                            <TableCell>{formatDate(quote.created_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                            <div className="mt-4 text-right font-semibold">
                                Total Outstanding: ${totalOutstanding.toFixed(2)} ({unbilledQuotes.length} requests @ ${quoteFee}/request)
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

             <Card>
                <CardHeader>
                    <CardTitle>Invoice History</CardTitle>
                     <CardDescription>Previously generated invoices for this client.</CardDescription>
                </CardHeader>
                 <CardContent>
                    {/* TODO: Fetch and display past invoices linked to this client */}
                     <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-4 text-sm text-gray-600">No invoice history available yet.</p>
                    </div>
                 </CardContent>
            </Card>

        </div>
    );
};

export default ClientBillingDetails;
