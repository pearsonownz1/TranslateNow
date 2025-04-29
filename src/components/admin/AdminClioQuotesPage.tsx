import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { supabase } from "@/lib/supabase"; // Assuming supabase client is exported from here
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming Shadcn UI table components
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // For error display
import { Terminal } from "lucide-react"; // Icon for error alert

// Define a type for the quote data (adjust based on your actual needs)
type ClioQuote = {
  id: number;
  created_at: string;
  user_id: string;
  status: string;
  clio_subject_id: string | null;
  clio_subject_type: string | null;
  client_name: string | null;
  client_email: string | null;
  subject_description: string | null;
};

const AdminClioQuotesPage = () => {
  const navigate = useNavigate(); // Hook for navigation
  const [clioQuotes, setClioQuotes] = useState<ClioQuote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClioQuotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from("clio_quotes") // Fetch from the correct table
          .select(
            `
            id,
            created_at,
            user_id,
            status,
            clio_subject_id,
            clio_subject_type,
            client_name,
            client_email,
            subject_description
          `
          ) // Select desired columns
          .order("created_at", { ascending: false }); // Order by creation date

        if (fetchError) {
          throw fetchError;
        }
        console.log("clio data mel", data);
        setClioQuotes(data || []);
      } catch (err: any) {
        console.error("Error fetching Clio quotes:", err);
        setError(
          err.message || "An unknown error occurred while fetching Clio quotes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchClioQuotes();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Clio Quotes</h1>

      {loading && <p>Loading Clio quotes...</p>}

      {error && (
        <Alert variant="destructive" className="mb-4">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!loading && !error && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Client Name</TableHead>
              <TableHead>Client Email</TableHead>
              <TableHead>Subject Type</TableHead>
              <TableHead>Subject Description</TableHead>
              {/* Add more headers as needed */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {clioQuotes.length > 0 ? (
              clioQuotes.map((quote) => (
                <TableRow
                  key={quote.id}
                  onClick={() => navigate(`/admin/clio-quotes/${quote.id}`)} // Navigate on click
                  className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800" // Add hover effect
                >
                  <TableCell>{quote.id}</TableCell>
                  <TableCell>
                    {new Date(quote.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{quote.status}</TableCell>
                  <TableCell>{quote.client_name || "-"}</TableCell>
                  <TableCell>{quote.client_email || "-"}</TableCell>
                  <TableCell>{quote.clio_subject_type || "-"}</TableCell>
                  <TableCell>{quote.subject_description || "-"}</TableCell>
                  {/* Add more cells corresponding to headers */}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No Clio quotes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default AdminClioQuotesPage;
