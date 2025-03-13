import React, { useState } from "react";
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
import { Search, MoreHorizontal, UserCog, Mail, Ban, Eye } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "John Smith",
    email: "john@example.com",
    date: "May 22, 2023",
    orders: 3,
    status: "active",
  },
  {
    id: 2,
    name: "Maria Rodriguez",
    email: "maria@example.com",
    date: "May 21, 2023",
    orders: 1,
    status: "active",
  },
  {
    id: 3,
    name: "David Chen",
    email: "david@example.com",
    date: "May 20, 2023",
    orders: 5,
    status: "active",
  },
  {
    id: 4,
    name: "Sophia Kim",
    email: "sophia@example.com",
    date: "May 19, 2023",
    orders: 2,
    status: "active",
  },
  {
    id: 5,
    name: "Alex Johnson",
    email: "alex@example.com",
    date: "May 18, 2023",
    orders: 0,
    status: "inactive",
  },
  {
    id: 6,
    name: "Emma Wilson",
    email: "emma@example.com",
    date: "May 17, 2023",
    orders: 7,
    status: "active",
  },
  {
    id: 7,
    name: "Michael Brown",
    email: "michael@example.com",
    date: "May 16, 2023",
    orders: 4,
    status: "active",
  },
  {
    id: 8,
    name: "Olivia Davis",
    email: "olivia@example.com",
    date: "May 15, 2023",
    orders: 2,
    status: "active",
  },
  {
    id: 9,
    name: "James Miller",
    email: "james@example.com",
    date: "May 14, 2023",
    orders: 1,
    status: "inactive",
  },
  {
    id: 10,
    name: "Ava Garcia",
    email: "ava@example.com",
    date: "May 13, 2023",
    orders: 3,
    status: "active",
  },
];

const AdminUsersPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState(mockUsers);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const toggleUserStatus = (userId) => {
    setUsers(
      users.map((user) =>
        user.id === userId
          ? {
              ...user,
              status: user.status === "active" ? "inactive" : "active",
            }
          : user,
      ),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Button>Add New User</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            Export Users
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Orders</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="font-medium">{user.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.date}</TableCell>
                  <TableCell>{user.orders}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}
                    >
                      {user.status.charAt(0).toUpperCase() +
                        user.status.slice(1)}
                    </span>
                  </TableCell>
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
                          <Eye className="mr-2 h-4 w-4" />
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserCog className="mr-2 h-4 w-4" />
                          Edit User
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => toggleUserStatus(user.id)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {user.status === "active"
                            ? "Deactivate"
                            : "Activate"}{" "}
                          User
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

export default AdminUsersPage;
