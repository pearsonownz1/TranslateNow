import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  ArrowRight,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { mockOrders } from "./mockData";
import { supabase } from "../../lib/supabase-client";

const DashboardHome = () => {
  const [user, setUser] = useState<any>(null);
  const [recentOrders, setRecentOrders] = useState(mockOrders.slice(0, 3));
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // If no user in localStorage, try to get from Supabase session
      const checkSession = async () => {
        try {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            setUser(data.session.user);
            localStorage.setItem("user", JSON.stringify(data.session.user));
          } else {
            navigate("/login");
          }
        } catch (error) {
          console.error("Error getting session:", error);
          navigate("/login");
        }
      };
      checkSession();
    }
  }, [navigate]);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/checkout">New Translation</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockOrders.length}</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockOrders.filter((order) => order.status === "processing")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated delivery in 2-3 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockOrders.filter((order) => order.status === "completed")
                  .length
              }
            </div>
            <p className="text-xs text-muted-foreground">
              All documents delivered
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saved Translations
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Drafts ready to submit
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="all">All Orders</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {recentOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle className="text-base">
                    {order.documentType}
                  </CardTitle>
                  <CardDescription>
                    {order.sourceLanguage} → {order.targetLanguage}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Order ID:
                      </span>
                      <span className="text-sm font-medium">{order.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Date:
                      </span>
                      <span className="text-sm font-medium">{order.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Status:
                      </span>
                      <span className="text-sm font-medium">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total:
                      </span>
                      <span className="text-sm font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link to={`/dashboard/orders/${order.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button variant="outline" asChild>
              <Link to="/dashboard/orders">View All Orders</Link>
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                View and manage all your translation orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard/orders">Go to Orders page</Link>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardHome;
