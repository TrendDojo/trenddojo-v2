"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Panel, Alert } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox, FormField } from "@/components/ui/FormField";

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
    <div className="min-h-screen dark:bg-slate-900 bg-white">
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
          <div className="flex items-center gap-4 pl-6">
            {/* Logo Icon */}
            <img
              src="/assets/icons/trenddojo-plain-icon.svg"
              alt="TrendDojo"
              className="h-16 w-16 flex-shrink-0"
            />

            {/* Text Content Wrapper */}
            <div className="text-left">
              <h1 className="text-3xl font-bold dark:text-white text-gray-900">
                Sign In
              </h1>
              <p className="dark:text-gray-400 text-gray-600">
                Welcome back to TrendDojo
              </p>
            </div>
          </div>
        
        <Panel variant="default" padding="xl" rounded="xl">
          {/* Development Mode Notice */}
          <Alert intent="info" className="mb-6">
            <strong>Development Mode:</strong> Sign in with any email and password "password123"
          </Alert>

          {error && (
            <Alert intent="error" className="mb-6">
              {error}
            </Alert>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormField label="Email Address" required>
              <Input
                type="email"
                id="email"
                name="email"
                required
                disabled={isSubmitting}
                placeholder="your@email.com"
                defaultValue="test@example.com"
              />
            </FormField>

            <FormField label="Password" required>
              <Input
                type="password"
                id="password"
                name="password"
                required
                disabled={isSubmitting}
                placeholder="Enter your password"
                defaultValue="password123"
              />
            </FormField>
            
            <div className="flex items-center justify-between">
              <Checkbox
                label="Remember me"
              />
              <a href="#" className="text-sm text-indigo-600 dark:text-indigo-400 hover:opacity-80">
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
              <Link href="/signup" className="text-indigo-600 dark:text-indigo-400 hover:opacity-80">
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