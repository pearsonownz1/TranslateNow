import React from "react";
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
  BarChart,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  DollarSign,
} from "lucide-react";
import { mockOrders } from "../dashboard/mockData";

const AdminDashboard = () => {
  // Calculate some statistics
  const totalOrders = mockOrders.length;
  const pendingOrders = mockOrders.filter(
    (order) => order.status === "pending",
  ).length;
  const processingOrders = mockOrders.filter(
    (order) => order.status === "processing",
  ).length;
  const completedOrders = mockOrders.filter(
    (order) => order.status === "completed",
  ).length;
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  // Mock user count
  const userCount = 42;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <Button variant="outline">Export Reports</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Orders
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingOrders + processingOrders}
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} awaiting processing, {processingOrders} in
              progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              +5 new users this week
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              +18% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Orders</TabsTrigger>
          <TabsTrigger value="users">Recent Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Overview of the most recent translation orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.slice(0, 5).map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{order.id}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.documentType} ({order.sourceLanguage} →{" "}
                        {order.targetLanguage})
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${order.status === "completed" ? "bg-green-100 text-green-700" : order.status === "processing" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                      <span className="font-medium">
                        ${order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="/admin/orders">View All Orders</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Recent Users</CardTitle>
              <CardDescription>
                Recently registered users on the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Mock user data */}
                {[
                  {
                    id: 1,
                    name: "John Smith",
                    email: "john@example.com",
                    date: "May 22, 2023",
                    orders: 3,
                  },
                  {
                    id: 2,
                    name: "Maria Rodriguez",
                    email: "maria@example.com",
                    date: "May 21, 2023",
                    orders: 1,
                  },
                  {
                    id: 3,
                    name: "David Chen",
                    email: "david@example.com",
                    date: "May 20, 2023",
                    orders: 5,
                  },
                  {
                    id: 4,
                    name: "Sophia Kim",
                    email: "sophia@example.com",
                    date: "May 19, 2023",
                    orders: 2,
                  },
                  {
                    id: 5,
                    name: "Alex Johnson",
                    email: "alex@example.com",
                    date: "May 18, 2023",
                    orders: 0,
                  },
                ].map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between border-b pb-4"
                  >
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Joined: {user.date}
                      </span>
                      <span className="font-medium">{user.orders} orders</span>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <a href="/admin/users">View All Users</a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Overview</CardTitle>
              <CardDescription>
                Key performance metrics for the translation service
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <div className="text-center">
                  <BarChart className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">
                    Analytics visualization would appear here
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Languages</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Spanish → English</span>
                      <span>32%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>French → English</span>
                      <span>18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Chinese → English</span>
                      <span>14%</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Top Document Types</p>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Birth Certificates</span>
                      <span>28%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Legal Documents</span>
                      <span>22%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Academic Records</span>
                      <span>17%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
