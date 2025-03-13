import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { mockOrders } from "./mockData";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Printer,
} from "lucide-react";

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch order details
    setTimeout(() => {
      const foundOrder = mockOrders.find((o) => o.id === orderId);
      setOrder(foundOrder || null);
      setLoading(false);
    }, 500);
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The order you're looking for doesn't exist or you don't have
                permission to view it.
              </p>
              <Button asChild>
                <Link to="/dashboard/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" asChild>
          <Link to="/dashboard/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {order.status === "completed" && (
            <Button size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Details</CardTitle>
            <CardDescription>
              Information about your translation order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order ID:</span>
                <span className="font-medium">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>{order.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(order.status)}`}
                >
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Document Type:</span>
                <span>{order.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Source Language:</span>
                <span>{order.sourceLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Target Language:</span>
                <span>{order.targetLanguage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Level:</span>
                <span>{order.serviceLevel}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${(order.total / 1.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax (8%):</span>
                <span>${(order.total - order.total / 1.08).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total:</span>
                <span>${order.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Delivery Method:
                  </span>
                  <span>Digital Delivery</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>
                    {JSON.parse(localStorage.getItem("user") || "{}").email ||
                      "user@example.com"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Estimated Delivery:
                  </span>
                  <span>{order.estimatedDelivery || "May 15, 2023"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center p-3 border rounded-md">
                  <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">Original Document</p>
                    <p className="text-xs text-muted-foreground">
                      Uploaded on {order.date}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                {order.status === "completed" && (
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Translated Document</p>
                      <p className="text-xs text-muted-foreground">
                        Completed on {order.completedDate || "May 15, 2023"}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {order.status === "completed" && (
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-green-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Certificate of Accuracy
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Certified translation certificate
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                If you have any questions about this order, our support team is
                here to help.
              </p>
              <Button variant="outline" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
