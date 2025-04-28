import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
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
import { Eye, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { format } from 'date-fns';

// Interface for API quote requests (can be refined based on actual table columns)
interface ApiQuoteRequest {
  id: string;
  created_at: string;
  applicant_name: string;
  country_of_education: string;
  degree_received: string;
  status: 'pending' | 'reviewed' | 'completed' | 'failed';
  // Add other relevant fields like api_key_id, user_id if needed for display/logic
}

const AdminApiQuotesPage = () => {
  const [apiQuotes, setApiQuotes] = useState<ApiQuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApiQuotes = async () => {
      console.log("AdminApiQuotesPage: Starting fetchApiQuotes..."); // Log start
      setLoading(true);
      setError(null);
      try { // Wrap in try...catch for better client-side error logging
        const { data, error: fetchError } = await supabase
          .from('api_quote_requests')
          .select('*')
        .order('created_at', { ascending: false });

        if (fetchError) {
          // Throw the error to be caught by the catch block
          throw fetchError;
        }

        console.log("AdminApiQuotesPage: Data received from Supabase:", data); // Log raw data
        setApiQuotes(data || []);

      } catch (err: any) { // Catch any error during the fetch/process
          console.error("AdminApiQuotesPage: Error fetching API quote requests:", err);
          setError(`Failed to fetch API quote requests: ${err.message || 'Unknown error'}`);
          setApiQuotes([]); // Ensure state is empty on error
      } finally {
          console.log("AdminApiQuotesPage: fetchApiQuotes finished."); // Log end
          setLoading(false);
      }
    };

    fetchApiQuotes();
  }, []);

  // Status badge logic might differ slightly if statuses are different
  const getStatusBadgeVariant = (status: ApiQuoteRequest['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'reviewed': return 'default';
      case 'completed': return 'default'; // Map completed to default (or secondary if preferred)
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage API Quote Requests</h1>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading API quotes...</span>
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
                <TableHead>Applicant Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Degree</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiQuotes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No API quote requests found.
                  </TableCell>
                </TableRow>
              ) : (
                apiQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell>{format(new Date(quote.created_at), 'PP')}</TableCell>
                    <TableCell className="font-medium">{quote.applicant_name}</TableCell>
                    <TableCell>{quote.country_of_education}</TableCell>
                    <TableCell>{quote.degree_received}</TableCell>
                    <TableCell>
                      {/* Use appropriate badge variant */}
                      <Badge variant={getStatusBadgeVariant(quote.status)} className="capitalize">
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="space-x-1">
                      <Button variant="ghost" size="icon" asChild>
                        {/* Link to the details page, ensuring source=api is passed */}
                        <Link to={`/admin/quotes/${quote.id}?source=api`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {/* Add other relevant actions if needed */}
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

export default AdminApiQuotesPage;
