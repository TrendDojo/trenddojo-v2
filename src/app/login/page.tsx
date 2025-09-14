"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Panel, Alert } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { theme } from "@/lib/theme";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      
      if (result?.error) {
        setError("Invalid email or password. For development, use any email with password 'password123'");
      } else if (result?.ok) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError("An error occurred during sign in");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen dark:bg-slate-900 bg-gray-100">
      {/* Logo in top left */}
      <div className="absolute top-0 left-0 p-6">
        <Link href="/">
          <img 
            src="/assets/logos/td-logo-s.svg" 
            alt="TrendDojo" 
            className="h-8 w-auto"
          />
        </Link>
      </div>
      
      {/* Main content */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
              Sign In
            </h1>
            <p className="dark:text-gray-400 text-gray-600">
              Welcome back to TrendDojo
            </p>
          </div>
        
        <Panel variant="default" padding="xl" rounded="xl">
          {/* Development Mode Notice */}
          <Alert intent="info" className="mb-6">
            <p className="dark:text-blue-300 text-blue-700 text-sm">
              <strong>Development Mode:</strong> Sign in with any email and password "password123"
            </p>
          </Alert>
          
          {error && (
            <Alert intent="danger" className="mb-6">
              <p className="dark:text-red-300 text-red-700 text-sm">{error}</p>
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isSubmitting}
                className={theme.inputs.base}
                placeholder="your@email.com"
                defaultValue="test@example.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                disabled={isSubmitting}
                className={theme.inputs.base}
                placeholder="Enter your password"
                defaultValue="password123"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 bg-slate-700/50 rounded focus:ring-2 focus:ring-blue-500 accent-blue-600"
                />
                <span className="ml-2 text-sm dark:text-gray-400 text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-400 hover:text-blue-300">
                Forgot password?
              </a>
            </div>
            
            <Button
              type="submit"
              loading={isSubmitting}
              fullWidth
              variant="primary"
            >
              Sign In
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="dark:text-gray-400 text-gray-600 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                Start free trial
              </Link>
            </p>
          </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}