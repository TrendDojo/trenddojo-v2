"use client";

import { useState } from "react";
import Link from "next/link";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    
    // Simulate signup process
    try {
      // In a real app, this would call your authentication API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUserInfo({ name, email });
      setIsSuccess(true);
      
    } catch (error) {
      // Handle error state here
      console.error("Signup failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show success screen after signup
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="bg-green-900/20 border border-green-700 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
            <div className="text-green-400 text-3xl">✓</div>
          </div>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Welcome to TrendDojo, {userInfo.name}!
            </h1>
            <p className="text-gray-400">
              Your free trial has started successfully
            </p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">What&apos;s Next?</h3>
            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
                <span className="text-gray-300">Check your email ({userInfo.email}) for verification</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
                <span className="text-gray-300">Complete your profile setup</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
                <span className="text-gray-300">Start with our position calculator</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              href="/demo"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Try the Demo
            </Link>
            <Link
              href="/"
              className="block w-full border border-slate-600 hover:border-slate-500 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-6">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            Start Your Free Trial
          </h1>
          <p className="text-gray-400">
            Join thousands of traders using systematic discipline
          </p>
        </div>
        
        <div className="bg-slate-800 p-8 rounded-xl border border-slate-700">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Create a secure password"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                placeholder="Your full name"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white py-3 px-4 rounded-lg font-semibold transition-colors duration-200"
            >
              {isSubmitting ? "Creating Account..." : "Start Free Trial"}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{" "}
              <a href="/login" className="text-blue-400 hover:text-blue-300">
                Sign in
              </a>
            </p>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-700">
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our Terms of Service and Privacy Policy.
              Your free trial includes full access for 14 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}