import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { mockOrders } from "../dashboard/mockData";
import {
  ArrowLeft,
  Download,
  FileText,
  MessageSquare,
  Printer,
  CheckCircle,
  Clock,
  Upload,
  User,
  Bell,
} from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useToast } from "../ui/use-toast";
import AdminUploadTranslation from "./AdminUploadTranslation";

const AdminOrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState("");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [translatedDocument, setTranslatedDocument] = useState<File | null>(
    null,
  );
  const { toast } = useToast();

  useEffect(() => {
    // Simulate API call to fetch order details
    setTimeout(() => {
      const foundOrder = mockOrders.find((o) => o.id === orderId);
      setOrder(foundOrder || null);
      setLoading(false);
    }, 500);
  }, [orderId]);

  const handleCompleteOrder = () => {
    if (order) {
      const updatedOrder = {
        ...order,
        status: "completed",
        completedDate: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      };
      setOrder(updatedOrder);

      // Send notification to customer
      toast({
        title: "Order completed",
        description: `Order ${order.id} has been marked as completed and the customer has been notified.`,
      });

      // In a real app, this would trigger an email notification to the customer
      console.log(`Email notification sent to customer for order ${order.id}`);
    }
  };

  const handleStartProcessing = () => {
    if (order && order.status === "pending") {
      setOrder({
        ...order,
        status: "processing",
      });

      toast({
        title: "Order status updated",
        description: `Order ${order.id} is now being processed.`,
      });
    }
  };

  const handleUploadTranslation = (file: File) => {
    setTranslatedDocument(file);

    // If the order is not already completed, mark it as completed
    if (order.status !== "completed") {
      handleCompleteOrder();
    } else {
      toast({
        title: "Translation uploaded",
        description: `New translation has been uploaded for order ${order.id} and the customer has been notified.`,
      });
    }
  };

  const handleSaveNotes = () => {
    toast({
      title: "Notes saved",
      description: "Admin notes have been saved for this order.",
    });
  };

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
          <Link to="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
              <p className="text-muted-foreground mb-6">
                The order you're looking for doesn't exist.
              </p>
              <Button asChild>
                <Link to="/admin/orders">View All Orders</Link>
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
          <Link to="/admin/orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
        <div className="flex gap-2">
          {order.status === "pending" && (
            <Button onClick={handleStartProcessing}>
              <Clock className="mr-2 h-4 w-4" />
              Start Processing
            </Button>
          )}
          <Button onClick={() => setIsUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Translation
          </Button>
          {order.status !== "completed" && (
            <Button onClick={handleCompleteOrder}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Mark as Completed
            </Button>
          )}
        </div>
      </div>

      {/* Upload Translation Dialog */}
      <AdminUploadTranslation
        orderId={order.id}
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUploadComplete={handleUploadTranslation}
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Information about order {order.id}
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
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Document Type:</span>
                  <span>{order.documentType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Source Language:
                  </span>
                  <span>{order.sourceLanguage}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Target Language:
                  </span>
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

                {order.status === "completed" || translatedDocument ? (
                  <div className="flex items-center p-3 border rounded-md">
                    <FileText className="h-5 w-5 text-blue-600 mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Translated Document</p>
                      <p className="text-xs text-muted-foreground">
                        {translatedDocument
                          ? `Uploaded ${new Date().toLocaleDateString()}`
                          : `Completed on ${order.completedDate || "May 15, 2023"}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsUploadDialogOpen(true)}
                      >
                        <Upload className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center p-3 border border-dashed rounded-md">
                    <Upload className="h-5 w-5 text-muted-foreground mr-3" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Upload Translated Document
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Upload the completed translation
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      Upload
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
              <CardTitle>Admin Notes</CardTitle>
              <CardDescription>
                Internal notes about this order (not visible to customer)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add notes about this order..."
                className="min-h-[100px]"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveNotes}>
                Save Notes
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=John" />
                  <AvatarFallback>JS</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-muted-foreground">
                    john@example.com
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Customer Since:
                  </span>
                  <span className="text-sm">May 10, 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Orders:
                  </span>
                  <span className="text-sm">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Lifetime Value:
                  </span>
                  <span className="text-sm">$249.97</span>
                </div>
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/admin/users/1">
                    <User className="mr-2 h-4 w-4" />
                    View Customer Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

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
                  <span>john@example.com</span>
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
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link
                  to={`mailto:john@example.com?subject=Your Order ${order.id}`}
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Contact Customer
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Order Details
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="mr-2 h-4 w-4" />
                Send Notification to Customer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailsPage;
