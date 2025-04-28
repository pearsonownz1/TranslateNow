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
import { Eye, Loader2 } from "lucide-react"; // Import Loader2
import { Link } from "react-router-dom";
import { format } from 'date-fns'; // For date formatting

// Define the type for an order based on your Supabase table structure
interface Order {
  id: string; // Or number, depending on your schema
  order_number: string;
  created_at: string;
  full_name: string;
  email: string;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled'; // Example statuses
  // Add other relevant fields: document_type, source_language, target_language, etc.
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('orders') // Your orders table name
        .select('*') // Select all columns or specify needed ones
        .order('created_at', { ascending: false }); // Order by creation date

      if (error) {
        console.error("Error fetching orders:", error);
        setError("Failed to fetch orders. Please try again.");
      } else {
        setOrders(data || []);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const getStatusBadgeVariant = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'secondary';
      case 'processing': return 'default';
      case 'completed': return 'default'; // Use 'default' variant for completed status
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Orders</h1>

      {loading && (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2">Loading orders...</span>
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
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                    No orders found.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number}</TableCell>
                    <TableCell>{format(new Date(order.created_at), 'PPpp')}</TableCell> {/* Format date */}
                    <TableCell>{order.full_name}</TableCell>
                    <TableCell>{order.email}</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(order.status)} className="capitalize">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/orders/${order.id}`}> {/* Link to detail page */}
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {/* Add more actions like Edit, Cancel etc. */}
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

export default AdminOrdersPage;
