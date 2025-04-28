import React, { useState, useEffect } from "react"; // Added useEffect
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
// import { mockOrders } from "./mockData"; // Removed mock data import
import { supabase } from "@/lib/supabase"; // Added Supabase client
import { Session } from "@supabase/supabase-js"; // Added Session type
import { Download, Eye, MoreHorizontal, Search, Loader2, AlertCircle } from "lucide-react"; // Added Loader2, AlertCircle

// Define an interface for your order structure (adjust based on your DB schema)
// This should ideally be shared, e.g., in src/types/index.ts
interface Order {
  id: string; // Or number
  documentType: string;
  sourceLanguage: string;
  targetLanguage: string;
  date: string; // Or Date object
  status: 'processing' | 'completed' | 'pending' | 'cancelled';
  total: number;
}


const OrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<Order[]>([]); // State for fetched orders
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<Session | null>(null); // Add session state

  useEffect(() => {
    const fetchSessionAndOrders = async () => {
      setLoading(true);
      setError(null);

      // 1. Get Session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      setSession(session); // Store session

      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setError("Could not load user session.");
        setLoading(false);
        return;
      }

      if (!session?.user) {
        console.log("No active session found.");
        setLoading(false);
        // ProtectedRoute should handle redirect
        return;
      }

      // 2. Fetch Orders
      // IMPORTANT: Adjust table/column names as needed
      const { data: fetchedOrders, error: ordersError } = await supabase
        .from('orders') // Replace 'orders' with your table name
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error("Error fetching orders:", ordersError);
        setError("Could not load your orders.");
      } else if (fetchedOrders) {
        // Map fetched data
        const mappedOrders: Order[] = fetchedOrders.map((dbOrder: any) => ({
          id: dbOrder.id,
          documentType: dbOrder.document_type || 'N/A',
          sourceLanguage: dbOrder.source_language || 'N/A',
          targetLanguage: dbOrder.target_language || 'N/A',
          date: new Date(dbOrder.created_at).toLocaleDateString(),
          status: dbOrder.status || 'pending',
          total: dbOrder.total_price || 0,
        }));
        setOrders(mappedOrders);
      }
      setLoading(false);
    };

    fetchSessionAndOrders();

    // Optional: Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
       setSession(session); // Update session state on change
       if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
         fetchSessionAndOrders(); // Refetch if needed
       }
    });

    return () => subscription.unsubscribe();
  }, []);


  const filteredOrders = orders.filter((order) => { // Filter fetched orders
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      order.id.toString().toLowerCase().includes(searchLower) || // Ensure ID is string for includes
      order.documentType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center space-x-2 p-10">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Loading orders...</span>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="text-center p-10 text-red-600">
        <AlertCircle className="mx-auto h-8 w-8 mb-2" />
        <p>{error}</p>
      </div>
    );
  }

  // No Session State (should be handled by layout/protected route, but good fallback)
  if (!session?.user) {
     return <div className="text-center p-10">Please log in to view your orders.</div>;
  }


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">My Orders</h1>
        <Button asChild>
          <Link to="/checkout">New Translation</Link>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Document Type</TableHead>
              <TableHead>Languages</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.date}</TableCell>
                  <TableCell>{order.documentType}</TableCell>
                  <TableCell>
                    {order.sourceLanguage} → {order.targetLanguage}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>${order.total.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Link
                            to={`/dashboard/orders/${order.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        {order.status === "completed" && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download translation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Link
                            to="/checkout"
                            className="flex items-center w-full"
                          >
                            Order similar
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default OrdersPage;
