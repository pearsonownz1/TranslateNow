import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertCircle, Inbox, FileText } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Added Alert imports

// Define types (adjust based on your actual data)
interface ClientUser {
    id: string;
    email?: string;
    user_metadata?: {
        first_name?: string;
        last_name?: string;
        company_name?: string; // Assuming company name might be here
        billing_email?: string; // Assuming billing email might be here
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
    const [error, setError] = useState<string | null>(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

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
                // Fetch Client Info (using admin client for potentially sensitive info like billing email)
                // IMPORTANT: This requires admin privileges. Consider if a less privileged fetch is possible
                // or if this page should only display info already available to the logged-in admin.
                // Fetch Client Info using the secure Edge Function
                const { data: clientData, error: functionError } = await supabase.functions.invoke('get-user-details', {
                    body: { userId },
                });

                if (functionError) {
                    // Handle function errors (network, 403, 404, etc.)
                    console.error("Error invoking get-user-details function:", functionError);
                    let errorMessage = functionError.message;
                    try {
                        const parsedError = JSON.parse(functionError.context?.responseText || '{}');
                        if (parsedError.error) errorMessage = parsedError.error;
                    } catch (parseErr) { /* Ignore */ }
                    throw new Error(`Failed to fetch client details: ${errorMessage}`);
                }

                if (!clientData) throw new Error("Client not found or function returned no data.");
                setClient(clientData as ClientUser); // The function returns the user object directly
                setLoadingClient(false);

                // Fetch Unbilled Quotes (This part seems okay as it likely uses RLS based on user_id)
                const { data: quotesData, error: quotesError } = await supabase
                    .from('quote_requests')
                    .select('id, created_at, applicant_name, country_of_education, degree_received') // Select needed fields
                    .eq('user_id', userId)
                    .eq('billing_status', 'unbilled') // Filter by status
                    .order('created_at', { ascending: true }); // Oldest first for invoicing

                if (quotesError) throw new Error(`Failed to fetch unbilled quotes: ${quotesError.message}`);
                setUnbilledQuotes(quotesData || []);

            } catch (err: any) {
                console.error("Error fetching client billing data:", err);
                setError(err.message || "Failed to load billing details.");
                setClient(null);
                setUnbilledQuotes([]);
            } finally {
                setLoadingClient(false); // Ensure loading states are always updated
                setLoadingQuotes(false);
            }
        };

        fetchData();
    }, [userId]);

    const handleGenerateInvoice = async () => {
        if (!client || !userId || unbilledQuotes.length === 0) return;

        setIsGeneratingInvoice(true);
        setError(null); // Clear previous errors

        try {
            const { data: { session } } = await supabase.auth.getSession(); // Get current admin session
             if (!session?.access_token) {
                throw new Error("Admin session not found.");
            }

            // Call the backend API route we created
            const response = await fetch('/api/admin/generate-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`, // Pass admin token
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

            // Refresh unbilled quotes list after successful generation
            setUnbilledQuotes([]); // Clear the list immediately for better UX
            // Optionally re-fetch, though clearing might be sufficient if the user navigates away
            // const { data: updatedQuotesData, error: updatedQuotesError } = await supabase... (re-fetch logic)
            // if (!updatedQuotesError) setUnbilledQuotes(updatedQuotesData || []);


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

    if (loadingClient) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (error && !client) { // Show critical error if client couldn't be loaded
         return (
           <div className="p-4">
             <Alert variant="destructive">
               <AlertCircle className="h-4 w-4" />
               <AlertTitle>Error Loading Client</AlertTitle>
               <AlertDescription>{error}</AlertDescription>
             </Alert>
           </div>
         );
    }

    if (!client) {
        return <div className="p-4 text-center">Client not found.</div>; // Should not happen if loading/error handled
    }

    // Determine client name and billing email (add fallbacks)
    const clientName = client.user_metadata?.company_name || `${client.user_metadata?.first_name || ''} ${client.user_metadata?.last_name || ''}`.trim() || client.email || 'N/A';
    const billingEmail = client.user_metadata?.billing_email || client.email || 'N/A';


    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold tracking-tight">Billing Details: {clientName}</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent className="text-sm space-y-1">
                    <p><strong>Client Name:</strong> {clientName}</p>
                    <p><strong>User ID:</strong> {client.id}</p>
                    <p><strong>Billing Contact Email:</strong> {billingEmail}</p>
                    {/* Add more client details if available/needed */}
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
                     {/* Display API call error if any */}
                     {error && !loadingClient && !loadingQuotes && ( // Show error only after initial load attempts
                        <Alert variant="destructive" className="mt-4">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Error</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                     )}
                </CardHeader>
                <CardContent>
                    {loadingQuotes ? (
                         <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
                    ) : unbilledQuotes.length === 0 ? (
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
