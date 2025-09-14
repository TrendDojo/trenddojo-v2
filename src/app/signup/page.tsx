"use client";

import { useState } from "react";
import Link from "next/link";
import { Panel, Alert, Card } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { theme } from "@/lib/theme";

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
              <Link
                href="/demo"
                className={`block w-full ${theme.buttons.primary}`}
              >
                Try the Demo
              </Link>
              <Link
                href="/"
                className={`block w-full ${theme.buttons.ghost}`}
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Start Your Free Trial
            </h1>
            <p className="dark:text-gray-400 text-gray-600">
              Join thousands of traders using systematic discipline
            </p>
          </div>
          
          <Panel variant="default" padding="xl" rounded="xl">
            {error && (
              <Alert intent="danger" className="mb-6">
                <p className="dark:text-red-300 text-red-700 text-sm">{error}</p>
                <Link href="/login" className="text-red-200 hover:text-red-100 underline text-sm mt-2 inline-block">
                  Sign in to existing account
                </Link>
              </Alert>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium dark:text-white text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  disabled={isSubmitting}
                  className={theme.inputs.base}
                  placeholder="John Doe"
                />
              </div>

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
                  placeholder="Create a strong password"
                  minLength={8}
                />
                <p className="mt-2 text-xs dark:text-gray-400 text-gray-600">
                  Minimum 8 characters
                </p>
              </div>
              
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  disabled={isSubmitting}
                  className="w-4 h-4 bg-slate-700/50 rounded focus:ring-2 focus:ring-blue-500 accent-blue-600 mt-1"
                />
                <label htmlFor="terms" className="ml-2 text-sm dark:text-gray-400 text-gray-600">
                  I agree to the{" "}
                  <Link href="/terms" className="text-blue-400 hover:text-blue-300">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-400 hover:text-blue-300">
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
                Start Free Trial
              </Button>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t dark:border-slate-700 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 dark:bg-slate-800/50 bg-white dark:text-gray-400 text-gray-600">Or continue with</span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant="secondary"
                  fullWidth
                >
                  Google
                </Button>
                <Button
                  type="button"
                  disabled={isSubmitting}
                  variant="secondary"
                  fullWidth
                >
                  GitHub
                </Button>
              </div>
              
              <p className="mt-6 text-center dark:text-gray-400 text-gray-600 text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300">
                  Sign in
                </Link>
              </p>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}