import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { createAdminUser } from "../../lib/admin-user";
import { toast } from "../ui/use-toast";

export default function CreateAdminUserForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await createAdminUser(email, password, {
        full_name: name,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Admin user created",
        description: `Successfully created admin user: ${email}`,
        variant: "default",
      });

      // Reset form
      setEmail("");
      setPassword("");
      setName("");

      console.log("Created admin user:", data.user);
    } catch (error: any) {
      toast({
        title: "Error creating admin user",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      console.error("Error creating admin user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle>Create Admin User</CardTitle>
        <CardDescription>
          Create users with administrative privileges
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Admin User"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Admin User"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Note: This creates a user with administrative privileges. Use with
        caution.
      </CardFooter>
    </Card>
  );
}
