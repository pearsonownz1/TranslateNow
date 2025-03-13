import React, { useState } from "react";
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
import { mockOrders } from "../dashboard/mockData";
import {
  Download,
  Eye,
  MoreHorizontal,
  Search,
  CheckCircle,
  Upload,
  Bell,
} from "lucide-react";
import { useToast } from "../ui/use-toast";
import AdminUploadTranslation from "./AdminUploadTranslation";

const AdminOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState(mockOrders);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.documentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.sourceLanguage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.targetLanguage.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleCompleteOrder = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: "completed",
              completedDate: new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              }),
            }
          : order,
      ),
    );

    toast({
      title: "Order completed",
      description: `Order ${orderId} has been marked as completed and the customer has been notified.`,
    });
  };

  const handleUploadTranslation = (file: File) => {
    if (selectedOrderId) {
      // Update the order status to completed
      setOrders(
        orders.map((order) =>
          order.id === selectedOrderId
            ? {
                ...order,
                status: "completed",
                completedDate: new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              }
            : order,
        ),
      );

      toast({
        title: "Translation uploaded",
        description: `Translation for order ${selectedOrderId} has been uploaded and the customer has been notified.`,
      });

      // Reset the selected order ID
      setSelectedOrderId(null);
    }
  };

  const openUploadDialog = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsUploadDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>
        <Button variant="outline">Export Orders</Button>
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

      {/* Upload Translation Dialog */}
      {selectedOrderId && (
        <AdminUploadTranslation
          orderId={selectedOrderId}
          isOpen={isUploadDialogOpen}
          onClose={() => setIsUploadDialogOpen(false)}
          onUploadComplete={handleUploadTranslation}
        />
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Customer</TableHead>
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
                  colSpan={8}
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
                  <TableCell>John Smith</TableCell>
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
                            to={`/admin/orders/${order.id}`}
                            className="flex items-center w-full"
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => openUploadDialog(order.id)}
                        >
                          <Upload className="mr-2 h-4 w-4" />
                          Upload translation
                        </DropdownMenuItem>
                        {order.status !== "completed" && (
                          <DropdownMenuItem
                            onClick={() => handleCompleteOrder(order.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as completed
                          </DropdownMenuItem>
                        )}
                        {order.status === "completed" && (
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Download translation
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem>
                          <Bell className="mr-2 h-4 w-4" />
                          Notify customer
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

export default AdminOrdersPage;
