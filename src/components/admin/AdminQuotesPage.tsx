import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase"; // Assuming supabase client setup
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Mail } from "lucide-react"; // Import Loader2 and Mail
import { Link } from "react-router-dom";
import { format } from 'date-fns';
import { Zap } from "lucide-react"; // Import Zap icon for API source

// Combined interface for both web and API quotes
interface AdminQuoteItem {
  id: string;
  created_at: string;
  full_name: string; // Mapped from applicant_name for API quotes
  email: string | null; // API quotes might not have email initially
  document_details: string; // Combined field for document info
  languages: string; // Combined field for languages
  status: 'pending' | 'reviewed' | 'quoted' | 'rejected' | 'completed'; // Added 'completed' for API flow
  source: 'web' | 'api';
  // Add other potential common fields or source-specific ones if needed later
  // e.g., api_specific_data?: { country_of_education: string; degree_received: string; }
}


const AdminQuotesPage = () => {
  // State now holds the combined type
  const [allQuotes, setAllQuotes] = useState<AdminQuoteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch from 'quotes' (web requests)
        const { data: webQuotesData, error: webQuotesError } = await supabase
          .from('quotes')
          .select('*') // Select all needed fields
          .order('created_at', { ascending: false });

        if (webQuotesError) throw webQuotesError;

        // Fetch from 'api_quote_requests'
        const { data: apiQuotesData, error: apiQuotesError } = await supabase
          .from('api_quote_requests')
          .select('*') // Select all needed fields
          .order('created_at', { ascending: false });

        if (apiQuotesError) throw apiQuotesError;

        // Map web quotes
        const mappedWebQuotes: AdminQuoteItem[] = (webQuotesData || []).map(q => ({
          id: q.id,
          created_at: q.created_at,
          full_name: q.full_name,
          email: q.email,
          document_details: q.document_type, // Assuming document_type holds the main detail
          languages: `${q.source_language} → ${q.target_language}`,
          status: q.status,
          source: 'web',
        }));

        // Map API quotes
        const mappedApiQuotes: AdminQuoteItem[] = (apiQuotesData || []).map(q => ({
          id: q.id,
          created_at: q.created_at,
          full_name: q.applicant_name, // Map from applicant_name
          email: null, // API requests don't have email in this example
          document_details: `${q.degree_received} (${q.country_of_education})`, // Combine details
          languages: 'N/A', // API requests don't have languages in this example
          status: q.status, // Assuming status field exists and matches
          source: 'api',
        }));

        // Combine and sort
        const combinedQuotes = [...mappedWebQuotes, ...mappedApiQuotes];
        combinedQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        setAllQuotes(combinedQuotes);

      } catch (error: any) {
        console.error("Error fetching quote requests:", error);
        setError(`Failed to fetch quote requests: ${error.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllQuotes();
  }, []);

  // Update function signature to use the combined type
  const getStatusBadgeVariant = (status: AdminQuoteItem['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'quoted': return 'default'; // Using default, consider adding a 'success' variant
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Quote Requests</h1>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading quotes...</span>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Source</TableHead> {/* Added Source column */}
                <TableHead>Name</TableHead>
                <TableHead>Details</TableHead> {/* Renamed from Document/Languages */}
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allQuotes.length === 0 ? ( // Use allQuotes
                <TableRow>
                  {/* Adjust colSpan */}
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No quote requests found.
                  </TableCell>
                </TableRow>
              ) : (
                allQuotes.map((quote) => ( // Use allQuotes
                  <TableRow key={`${quote.source}-${quote.id}`}> {/* Ensure unique key */}
                    <TableCell>{format(new Date(quote.created_at), 'PP')}</TableCell>
                     <TableCell>
                       {quote.source === 'api' ? (
                         <Zap className="h-4 w-4 text-yellow-500 inline-block mr-1" /> // Removed title prop
                       ) : (
                         <span className="inline-block w-4 mr-1"></span> // Placeholder for alignment
                       )}
                       {quote.source === 'api' ? 'API' : 'Web'}
                     </TableCell>
                    <TableCell className="font-medium">{quote.full_name}</TableCell>
                    <TableCell>{quote.document_details}</TableCell> {/* Use combined details */}
                    {/* Removed Languages column as it's combined or N/A */}
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)} className="capitalize">
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1">
                       {/* Link might need adjustment based on source */}
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/quotes/${quote.id}?source=${quote.source}`}> {/* Pass source if needed */}
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {/* Conditionally render Mail button only if email exists */}
                      {quote.email && (
                         <Button variant="ghost" size="icon" asChild>
                           <a href={`mailto:${quote.email}`}>
                             <Mail className="h-4 w-4" />
                           </a>
                         </Button>
                      )}
                      {/* Add more actions like 'Create Quote', 'Reject' */}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
       {/* TODO: Add Pagination if needed */}
    </div>
  );
};

export default AdminQuotesPage;
