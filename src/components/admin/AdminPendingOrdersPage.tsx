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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { mockOrders } from "../dashboard/mockData";
import { Search, CheckCircle, Clock, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const AdminPendingOrdersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState(mockOrders);

  // Filter only pending and processing orders
  const pendingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "processing",
  );

  const filteredOrders = pendingOrders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.documentType.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
  };

  const handleStartProcessing = (orderId) => {
    setOrders(
      orders.map((order) =>
        order.id === orderId ? { ...order, status: "processing" } : order,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pending Orders</h1>
        <div className="text-sm text-muted-foreground">
          {pendingOrders.length} orders requiring attention
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders.filter((o) => o.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders.filter((o) => o.status === "processing").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3 days</div>
            <p className="text-xs text-muted-foreground">For standard orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="relative w-full">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search pending orders..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
              <TableHead>Priority</TableHead>
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
                  No pending orders found
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
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.serviceLevel === "Expedited" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {order.serviceLevel}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/admin/orders/${order.id}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">View</span>
                        </Link>
                      </Button>
                      {order.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleStartProcessing(order.id)}
                        >
                          <Clock className="h-4 w-4" />
                          <span className="sr-only">Start Processing</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleCompleteOrder(order.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="sr-only">Complete</span>
                      </Button>
                    </div>
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

export default AdminPendingOrdersPage;
