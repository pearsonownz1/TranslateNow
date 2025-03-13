import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Bell, HelpCircle, LogOut, Settings, User, Shield } from "lucide-react";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Badge } from "../ui/badge";

interface AdminHeaderProps {
  user: {
    name: string;
    email: string;
  };
}

const AdminHeader = ({ user }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "New order received",
      message:
        "Order ORD-78901234 has been submitted and is awaiting processing.",
      time: "10 minutes ago",
      read: false,
    },
    {
      id: "2",
      title: "Order completed",
      message: "Order ORD-56789012 has been marked as completed.",
      time: "2 hours ago",
      read: true,
    },
    {
      id: "3",
      title: "Customer message",
      message: "John Smith has sent a message regarding order ORD-45678901.",
      time: "Yesterday",
      read: true,
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");

    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    // Redirect to login page
    navigate("/login");
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast({
      title: "Notifications marked as read",
      description: "All notifications have been marked as read.",
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-gray-900 text-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/admin" className="flex items-center">
              <Shield className="h-6 w-6 mr-2" />
              <span className="text-xl font-bold">TranslateNow Admin</span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-medium">Notifications</h4>
                  {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Mark all as read
                    </Button>
                  )}
                </div>
                <div className="max-h-80 overflow-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No notifications
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b last:border-0 ${!notification.read ? "bg-gray-50" : ""}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h5 className="font-medium text-sm">
                            {notification.title}
                          </h5>
                          <span className="text-xs text-muted-foreground">
                            {notification.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <div className="p-2 border-t text-center">
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link to="/admin/notifications">
                      View all notifications
                    </Link>
                  </Button>
                </div>
              </PopoverContent>
            </Popover>

            <Button variant="ghost" size="icon" className="text-white">
              <HelpCircle className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar>
                    <AvatarImage
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                    />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
