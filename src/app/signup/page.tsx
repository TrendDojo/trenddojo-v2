"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Alert, Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Input, Checkbox, FormField } from "@/components/ui/FormField";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  // Simulate a list of existing users (in real app, this would be a DB check)
  const existingEmails = ['test@example.com', 'demo@trenddojo.com', 'user@test.com'];

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    
    // Simulate signup process
    try {
      // In a real app, this would call your authentication API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for duplicate email (simulate API response)
      if (existingEmails.includes(email.toLowerCase()) || localStorage.getItem(`signup_${email}`)) {
        setError(`An account with ${email} already exists. Try signing in instead.`);
        return;
      }
      
      // Store signup locally to simulate persistence
      localStorage.setItem(`signup_${email}`, JSON.stringify({ name, email, signupDate: new Date().toISOString() }));
      
      setUserInfo({ name, email });
      setIsSuccess(true);
      
    } catch (error) {
      setError("Something went wrong. Please try again.");
      console.error("Signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success screen after signup
  if (isSuccess) {
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

        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center space-y-8">
            <div className="bg-emerald-900/20 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
              <div className="text-emerald-400 text-3xl">✓</div>
            </div>
            
            <div>
              <h1 className="text-3xl font-bold dark:text-white text-gray-900 mb-2">
                Welcome to TrendDojo, {userInfo.name}!
              </h1>
              <p className="dark:text-gray-400 text-gray-600">
                Your free trial has started successfully
              </p>
            </div>
            
            <Card>
              <h3 className="text-lg font-semibold dark:text-white text-gray-900 mb-4">What's Next?</h3>
              <div className="space-y-3 text-left">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                  <span className="dark:text-gray-300 text-gray-700">Check your email ({userInfo.email}) for verification</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                  <span className="dark:text-gray-300 text-gray-700">Complete your profile setup</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                  <span className="dark:text-gray-300 text-gray-700">Start with our position calculator</span>
                </div>
              </div>
            </Card>
            
            <div className="space-y-4">
              <Link href="/features" className="block">
                <Button
                  variant="primary"
                  fullWidth
                >
                  View Features
                </Button>
              </Link>
              <Link href="/" className="block">
                <Button
                  variant="ghost"
                  fullWidth
                >
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                Start Your Free Account
              </h1>
              <p className="dark:text-gray-400 text-gray-600">
                Experience the power of systematic trading
              </p>
            </div>
          </div>
          
          <Panel variant="default" padding="xl" rounded="xl">
            {error && (
              <Alert intent="error" className="mb-6">
                {error}{" "}
                <Link href="/login" className="underline hover:opacity-80">
                  Sign in to existing account
                </Link>
              </Alert>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <FormField label="Full Name" required>
                <Input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={isSubmitting}
                  placeholder="John Doe"
                />
              </FormField>

              <FormField label="Email Address" required>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  required
                  disabled={isSubmitting}
                  placeholder="your@email.com"
                />
              </FormField>

              <FormField label="Password" helper="Minimum 8 characters" required>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  required
                  disabled={isSubmitting}
                  placeholder="Create a strong password"
                  minLength={8}
                />
              </FormField>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  required
                  disabled={isSubmitting}
                  className="w-4 h-4 mt-1 rounded ring-1 ring-gray-200 dark:ring-slate-700 dark:bg-slate-900/50 bg-gray-50 dark:checked:bg-indigo-600 checked:bg-indigo-600 focus:ring-2 focus:ring-indigo-500"
                />
                <label htmlFor="terms" className="ml-2 text-sm dark:text-gray-400 text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:opacity-80">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:opacity-80">
                    Privacy Policy
                  </Link>
                </label>
              </div>
              
              <Button
                type="submit"
                loading={isSubmitting}
                fullWidth
                variant="primary"
              >
                Start Free Account
              </Button>
            </form>

            <p className="mt-6 text-center dark:text-gray-400 text-gray-600 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-indigo-600 dark:text-indigo-400 hover:opacity-80">
                Sign in
              </Link>
            </p>
          </Panel>
        </div>
      </div>
    </div>
  );
}