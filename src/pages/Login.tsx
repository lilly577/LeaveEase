import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Shield, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const loggedInRole = await login(email, password);
      toast({ title: "Welcome back!", description: "You have successfully logged in." });
      if (loggedInRole === "super_admin") {
        navigate("/super-admin/dashboard");
      } else if (loggedInRole === "hr_admin" || loggedInRole === "hr") {
        navigate("/hr/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch {
      toast({ title: "Error", description: "Invalid credentials", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-secondary text-secondary-foreground flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Clock className="h-10 w-10 text-primary" />
            <h1 className="text-3xl font-bold">LeaveEase</h1>
          </div>
          <p className="text-secondary-foreground/70">Staff Leave Management System</p>
        </div>
        
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Quick Leave Requests</h3>
              <p className="text-secondary-foreground/70">Submit and track your leave requests in real-time</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/20 rounded-lg">
              <Shield className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Secure & Confidential</h3>
              <p className="text-secondary-foreground/70">Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Team Coordination</h3>
              <p className="text-secondary-foreground/70">Stay updated with team schedules and announcements</p>
            </div>
          </div>
        </div>
        
        <p className="text-secondary-foreground/50 text-sm">(c) 2026 LeaveEase. All rights reserved.</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Go back to Home
          </Link>
          <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 lg:hidden">
              <Clock className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">LeaveEase</span>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to your account to continue</CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Create Account
                </Link>
              </p>
            </CardFooter>
          </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
