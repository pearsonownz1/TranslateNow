import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase"; // Import Supabase client
import { Session, User as SupabaseUser } from "@supabase/supabase-js"; // Renamed User to avoid conflict
import { Button } from "@/components/ui/button";
import {
  User, // Keep this icon if used elsewhere, or remove if only for User type
  MapPin,
  CreditCard,
  FileText, // For Recent Orders icon
  Clipboard, // Corrected: Icon for Recent Quotes
  Inbox, // For empty state icon
  Loader2,
  AlertCircle,
  MessageSquareQuote, // Added for quote icon consistency if needed
} from "lucide-react";
import { Badge } from "@/components/ui/badge"; // Import Badge for status

// Define a type for the quote data (adjust based on your actual table columns)
interface QuoteRequest {
  id: string; // or number
  created_at: string;
  status: string;
  // Add other relevant fields like service_type, document_type etc. if needed
  service_type?: string;
}

// Basic card component structure (can be extracted later)
const DashboardCard = ({ title, children, className }: { title?: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-white rounded-xl shadow-sm p-6 ${className || ''}`}>
    {title && <h3 className="text-sm font-semibold text-gray-700 mb-4">{title}</h3>}
    {children}
  </div>
);

const DashboardHome = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true); // For session/user info loading
  const [error, setError] = useState<string | null>(null); // For session/user info error
  // State for recent quotes
  const [recentQuotes, setRecentQuotes] = useState<QuoteRequest[]>([]);
  const [quotesLoading, setQuotesLoading] = useState(true);
  const [quotesError, setQuotesError] = useState<string | null>(null);

  // TODO: Fetch recent orders data

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setQuotesLoading(true);
      setError(null);
      setQuotesError(null);

      // Fetch Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSession(session);

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setError("Could not load user session.");
        setLoading(false);
        setQuotesLoading(false);
        return;
      }

      if (session?.user) {
        const user = session.user;
        const email = user.email || "";
        // Set user name/email
        const firstName = user.user_metadata?.first_name;
        const lastName = user.user_metadata?.last_name;
        const name = (firstName && lastName)
                     ? `${firstName} ${lastName}`
                     : user.email?.split('@')[0]
                     || email;
        setUserName(name);
        setUserEmail(email);

        // --- Fetch Recent Quotes ---
        try {
          if (!user.id) {
            throw new Error("User ID not available in session.");
          }

          const { data: quotesData, error: quotesFetchError } = await supabase
            .from('quotes') // Changed table name to 'quotes'
            .select('id, created_at, status') // Select desired columns (removed service_type)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(3); // Limit to 3 recent quotes

          if (quotesFetchError) {
            throw quotesFetchError;
          }
          setRecentQuotes(quotesData || []);
        } catch (err: any) {
          console.error("Error fetching recent quotes:", err);
          setQuotesError(`Failed to load recent quotes: ${err.message}`);
          setRecentQuotes([]); // Clear quotes on error
        } finally {
          setQuotesLoading(false); // Mark quotes loading as complete
        }
        // --- End Fetch Recent Quotes ---

      } else {
        // This case should ideally be handled by DashboardLayout/ProtectedRoute redirecting
        console.log("No active session found in DashboardHome.");
        setError("No active session. Please log in.");
        setQuotesLoading(false); // Also stop quotes loading if no session
      }
      setLoading(false); // Mark session loading as complete
    };

    fetchData();

    // Listen for auth changes to update session info if needed
     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setSession(session);
        if (session?.user) {
          const email = session.user.email || "";
          const firstName = session.user.user_metadata?.first_name;
          const lastName = session.user.user_metadata?.last_name;
          const name = (firstName && lastName)
                       ? `${firstName} ${lastName}`
                       : session.user.email?.split('@')[0]
                       || email;
          setUserName(name);
          setUserEmail(email);
          // Optionally re-fetch quotes if needed on auth change, though maybe not necessary here
        } else {
         setUserName("");
         setUserEmail("");
         setRecentQuotes([]); // Clear quotes if user logs out
       }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Display loading state for session/user info
  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  // Display error state for session/user info
  if (error) {
    return (
      <div className="text-center p-10 text-red-600">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
    }

   // Fallback if session somehow becomes null after loading
   if (!session?.user) {
     return <div className="text-center p-10">Session expired. Please log in again.</div>;
   }

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

  // Helper function to get status badge variant
  const getStatusVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'secondary';
      case 'ready': return 'default'; // Assuming 'default' is visually distinct (e.g., blue/primary)
      case 'completed': return 'outline'; // Or another variant like success if you add one
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };


  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Message */}
      <h1 className="text-2xl font-semibold text-gray-800">
        Welcome back, {userName}!
      </h1>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column (Recent Orders & Quotes) */}
        <section className="lg:col-span-2 space-y-6">
          {/* Recent Orders Card - Placeholder */}
          <DashboardCard>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Recent orders</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                 <Link to="/dashboard/orders">View all</Link>
              </Button>
            </div>
            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
              <Inbox className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-sm text-gray-600">You don't have any orders yet!</p>
              <Button asChild className="mt-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2">
                <Link to="/checkout">Start an order</Link>
              </Button>
            </div>
            {/* TODO: Add logic to display actual recent orders */}
          </DashboardCard>

          {/* Recent Quotes Card - Updated */}
          <DashboardCard>
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center">
                 <Clipboard className="h-5 w-5 mr-2 text-gray-600" />
                 <h2 className="text-lg font-semibold text-gray-800">Recent quotes</h2>
               </div>
               <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/my-quotes">View all</Link>
               </Button>
             </div>

            {/* Conditional Rendering for Quotes */}
            {quotesLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : quotesError ? (
              <div className="text-center py-10 text-red-500">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>{quotesError}</p>
              </div>
            ) : recentQuotes.length === 0 ? (
              // Empty State
              <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-lg">
                <Inbox className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-4 text-sm text-gray-600">You don't have any quotes yet!</p>
                <Button asChild variant="outline" className="mt-6 rounded-full px-6 py-2">
                  <Link to="/dashboard/request-quote">Request a Quote</Link>
                </Button>
              </div>
            ) : (
              // List of Recent Quotes
              <ul className="space-y-3">
                {recentQuotes.map((quote) => (
                  <li key={quote.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-3">
                       <MessageSquareQuote className="h-5 w-5 text-blue-500 flex-shrink-0" />
                       <div>
                        <p className="text-sm font-medium text-gray-800">
                          Quote Request {/* Removed service type display */}
                        </p>
                        <p className="text-xs text-gray-500">
                          Requested on {formatDate(quote.created_at)}
                        </p>
                       </div>
                    </div>
                    <Badge variant={getStatusVariant(quote.status)} className="capitalize text-xs px-2 py-0.5">
                      {quote.status || 'Unknown'}
                    </Badge>
                    {/* Optional: Link to specific quote details if that page exists */}
                    {/* <Button variant="ghost" size="sm" asChild><Link to={`/dashboard/my-quotes/${quote.id}`}>View</Link></Button> */}
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </section>

        {/* Right Column (Info Cards) */}
        <aside className="space-y-6">
          {/* Account Settings Card */}
          <DashboardCard title="Account settings" className="p-4">
            <p className="text-xs text-gray-500 mb-3">Update your name, email, password and account preferences</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span className="font-medium text-gray-700">{userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-medium text-gray-700">{userEmail}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Password</span>
                <span className="font-medium text-gray-700">********</span>
              </div>
            </div>
             <Button variant="outline" size="sm" className="w-full mt-4" asChild>
               <Link to="/dashboard/settings">Edit Settings</Link>
             </Button>
          </DashboardCard>

          {/* Shipping Addresses Card */}
          <DashboardCard title="Shipping addresses" className="p-4">
             <p className="text-xs text-gray-500 mb-3">Add or edit your shipping addresses</p>
             <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                You don't have any saved addresses yet
             </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/dashboard/addresses">Manage Addresses</Link>
              </Button>
          </DashboardCard>

          {/* Payment Methods Card */}
          <DashboardCard title="Payment methods" className="p-4">
             <p className="text-xs text-gray-500 mb-3">Add or edit your payment methods</p>
             <div className="flex items-center text-sm text-gray-500">
                <CreditCard className="h-4 w-4 mr-2 flex-shrink-0" />
                You don't have any saved payment methods yet
             </div>
              <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                <Link to="/dashboard/payment-methods">Manage Payments</Link>
              </Button>
          </DashboardCard>
        </aside>

      </div>
    </div>
  );
};

export default DashboardHome;
