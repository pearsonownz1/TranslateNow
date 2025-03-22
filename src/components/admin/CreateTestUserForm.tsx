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
import { createUserWithoutRateLimit } from "../../lib/admin-auth";
import { toast } from "../ui/use-toast";

interface CreateTestUserFormProps {
  isAdmin?: boolean;
}

export default function CreateTestUserForm({
  isAdmin = false,
}: CreateTestUserFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { user } = await createUserWithoutRateLimit(email, password, {
        full_name: name,
        is_admin: isAdmin,
      });

      toast({
        title: "Test user created",
        description: `Successfully created user: ${email}`,
        variant: "default",
      });

      // Reset form
      setEmail("");
      setPassword("");
      setName("");

      console.log("Created test user:", user);
    } catch (error: any) {
      toast({
        title: "Error creating test user",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
      console.error("Error creating test user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-md">
      <CardHeader>
        <CardTitle>Create Test User</CardTitle>
        <CardDescription>
          Create test users without hitting Supabase rate limits
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
              placeholder="John Doe"
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
              placeholder="test@example.com"
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
              minLength={6}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Test User"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-sm text-gray-500">
        Note: This bypasses email confirmation and rate limits. For testing
        only.
      </CardFooter>
    </Card>
  );
}
