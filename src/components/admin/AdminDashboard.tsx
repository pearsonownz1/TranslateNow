import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { ShoppingCart, FileText, Users } from "lucide-react"; // Import icons

const AdminDashboard = () => {
  // Placeholder data - replace with actual data fetching later
  const stats = {
    totalOrders: 152,
    pendingQuotes: 15,
    totalUsers: 48,
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Total Orders Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +10% from last month
            </p>
          </CardContent>
        </Card>

        {/* Pending Quotes Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingQuotes}</div>
            <p className="text-xs text-muted-foreground">
              +5 since yesterday
            </p>
          </CardContent>
        </Card>

        {/* Total Users Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              +2 new users today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Add more sections later, e.g., recent activity, charts */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        {/* Placeholder for recent activity feed */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">Recent activity feed coming soon...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
