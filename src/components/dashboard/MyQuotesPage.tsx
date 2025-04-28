import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Import Link, useNavigate, useLocation
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap } from 'lucide-react'; // Added Zap icon
import { Button } from '@/components/ui/button';

// Define a unified structure for displaying quotes from either source
interface UserQuoteItem {
  id: string;
  created_at: string;
  details: string; // Combined field for languages or API request details
  status: 'pending' | 'reviewed' | 'quoted' | 'rejected' | 'converted_to_order' | 'completed' | 'failed'; // Combined statuses (ensure 'rejected' is handled if used for API)
  price?: number; // Only applicable for web quotes
  source: 'web' | 'api';
  // Fields for API quote response
  us_equivalent?: string;
  unable_to_provide?: boolean;
  rejection_reason?: string;
}

const MyQuotesPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation(); // Get location object
  // State now holds the combined type
  const [allUserQuotes, setAllUserQuotes] = useState<UserQuoteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Fetch user ID first
  useEffect(() => {
    const fetchUserId = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        toast({ title: "Error", description: "Could not fetch user session.", variant: "destructive" });
      } else if (session?.user) {
        setUserId(session.user.id);
      } else {
        console.warn("No active session found in MyQuotesPage.");
      }
    };
    fetchUserId();

    // Check for navigation state on initial load
    if (location.state?.quoteSubmitted) {
      toast({
        title: "Success",
        description: "Your quote request has been submitted.",
      });
      // Clear the state to prevent toast on refresh/revisit without new submission
      navigate(location.pathname, { replace: true, state: {} });
    }

  }, [toast, location, navigate]); // Add location and navigate to dependencies

  // Fetch quotes once user ID is available
  useEffect(() => {
    if (!userId) return;

    const fetchAllUserQuotes = async () => {
      setIsLoading(true);
      try {
        // Fetch web quotes
        const { data: webQuotes, error: webError } = await supabase
          .from('quotes')
          .select('id, created_at, source_language, target_language, status, price')
          .eq('user_id', userId);

        if (webError) throw webError;

        // Fetch API quotes linked to the user, including response fields (re-added)
        const { data: apiQuotes, error: apiError } = await supabase
          .from('api_quote_requests')
          .select('id, created_at, applicant_name, country_of_education, degree_received, status, us_equivalent, unable_to_provide, rejection_reason') // Re-added response fields
          .eq('user_id', userId); // Filter by the user ID associated with the API key

        if (apiError) throw apiError;

        // Map web quotes
        const mappedWebQuotes: UserQuoteItem[] = (webQuotes || []).map(q => ({
          id: q.id,
          created_at: q.created_at,
          details: `${q.source_language} to ${q.target_language}`,
          status: q.status,
          price: q.price,
          source: 'web',
        }));

        // Map API quotes
        const mappedApiQuotes: UserQuoteItem[] = (apiQuotes || []).map(q => ({
          id: q.id,
          created_at: q.created_at,
          details: `${q.degree_received} (${q.country_of_education})`, // Combine details for display
          status: q.status,
          price: undefined, // API quotes don't have a price in this context
          source: 'api',
          us_equivalent: q.us_equivalent, // Re-enabled response field
          unable_to_provide: q.unable_to_provide, // Re-enabled response field
          rejection_reason: q.rejection_reason, // Re-enabled response field
        }));

        // Combine and sort
        const combinedQuotes = [...mappedWebQuotes, ...mappedApiQuotes];
        combinedQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setAllUserQuotes(combinedQuotes);

      } catch (error: any) {
        console.error('Error fetching user quotes:', error);
        toast({
          title: 'Error',
          description: 'Could not fetch your quote requests.',
          variant: 'destructive',
        });
        setAllUserQuotes([]); // Clear quotes on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllUserQuotes();
  }, [userId, toast]);

  const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    } catch (e) {
        return "Invalid Date";
    }
  };

  // Update function signature to use the combined type and statuses
  const getStatusBadgeVariant = (status: UserQuoteItem['status']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'pending':
      case 'reviewed':
      case 'completed': // API quote completed status
        return 'secondary'; // Consider a different color for 'completed' if desired
      case 'quoted': // Web quote ready for payment
        return 'default';
      case 'converted_to_order': // Web quote paid
        return 'outline'; // Consider 'success' if you add it
      case 'rejected': // Web quote rejected
      case 'failed': // API quote processing failed
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  // Update function signature and add cases for API statuses
  const formatStatusText = (status: UserQuoteItem['status']): string => {
     switch (status?.toLowerCase()) {
       case 'pending': return 'Pending Review';
       case 'reviewed': return 'Under Review'; // Applies to both?
       case 'quoted': return 'Quote Ready'; // Web only
       case 'rejected': return 'Rejected'; // Web only
       case 'converted_to_order': return 'Order Placed'; // Web only
       case 'completed': return 'Completed'; // API only
       case 'failed': return 'Failed'; // API only
       default: return status?.toUpperCase() || 'UNKNOWN';
     }
  }

  const handlePayNow = (quoteId: string, price: number) => {
    console.log(`Navigating to payment for quote ${quoteId} with price ${price}`);
    // Navigate to a dedicated route for paying this specific quote
    navigate(`/checkout/pay-quote/${quoteId}`);
  };


  return (
    <div className="p-4 md:p-6 lg:p-8">
      {/* Header with Title and Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">My Quote Requests</h1>
        <Button asChild>
          <Link to="/dashboard/request-quote">Request New Quote</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Submitted Quotes</CardTitle> {/* This title might be redundant now */}
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
            </div>
          ) : allUserQuotes.length === 0 ? ( // Use allUserQuotes
            <p className="text-center text-gray-500 py-10">You haven't submitted any quote requests yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID / Source</TableHead> {/* Combined ID/Source */}
                  <TableHead>Date Submitted</TableHead>
                  <TableHead>Details</TableHead> {/* Renamed from Languages */}
                  <TableHead>Status</TableHead>
                  <TableHead>Response / Price</TableHead> {/* Updated Header */}
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUserQuotes.map((quote) => ( // Use allUserQuotes
                  <TableRow key={`${quote.source}-${quote.id}`}> {/* Ensure unique key */}
                    <TableCell className="font-medium">
                        {quote.id.substring(0, 8)}...
                        {quote.source === 'api' && <Zap className="h-3 w-3 inline-block ml-1 text-yellow-500" />} {/* Removed title prop */}
                    </TableCell>
                    <TableCell>{formatDate(quote.created_at)}</TableCell>
                    <TableCell>{quote.details}</TableCell> {/* Use combined details */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {formatStatusText(quote.status)}
                      </Badge>
                    </TableCell>
                    {/* Updated Cell for Response/Price */}
                    <TableCell className="text-sm">
                      {quote.source === 'web' && quote.status === 'quoted' && quote.price != null ? (
                        <span className="font-medium text-right block">${quote.price.toFixed(2)}</span>
                      ) : quote.source === 'api' && quote.status === 'completed' && quote.us_equivalent ? (
                        <span className="text-green-700">{quote.us_equivalent}</span>
                      ) : quote.source === 'api' && quote.status === 'rejected' && quote.unable_to_provide ? (
                        <span className="text-red-600" title={quote.rejection_reason || ''}>Rejected</span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                       {/* Pay button only shown for web quotes that are quoted and ready */}
                      {quote.source === 'web' && quote.status === 'quoted' && quote.price != null && (
                        <Button
                          size="sm"
                          onClick={() => handlePayNow(quote.id, quote.price!)}
                        >
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyQuotesPage;
