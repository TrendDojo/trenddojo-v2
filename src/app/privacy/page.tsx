"use client";

import { motion } from "framer-motion";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
          <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Personal Information</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Account information (name, email address, phone number)</li>
                <li>Payment information (processed securely through Airwallex)</li>
                <li>Identity verification documents (as required by financial regulations)</li>
                <li>Communication preferences and support interactions</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Trading Data</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Portfolio holdings and positions</li>
                <li>Trade history and transaction records</li>
                <li>Risk management settings and preferences</li>
                <li>Performance analytics and metrics</li>
                <li>Broker API credentials (encrypted and securely stored)</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Technical Information</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>IP addresses and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and feature interactions</li>
                <li>Performance and error logs</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. How We Use Your Information</h2>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Service Provision:</strong> Execute trades, manage positions, and provide trading analytics</li>
                <li><strong>Risk Management:</strong> Monitor portfolio risk and enforce safety limits</li>
                <li><strong>Compliance:</strong> Meet regulatory requirements for financial services</li>
                <li><strong>Account Security:</strong> Detect fraud and unauthorized access</li>
                <li><strong>Customer Support:</strong> Respond to inquiries and resolve issues</li>
                <li><strong>Product Improvement:</strong> Analyze usage to enhance features and performance</li>
                <li><strong>Communication:</strong> Send service updates, security alerts, and educational content</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Information Sharing</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">We Share Information With:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Broker Partners:</strong> To execute trades and manage positions on your behalf</li>
                <li><strong>Payment Processors:</strong> Airwallex and other payment providers for billing</li>
                <li><strong>Data Providers:</strong> Market data vendors for real-time pricing information</li>
                <li><strong>Service Providers:</strong> Cloud hosting, analytics, and security services</li>
                <li><strong>Regulatory Authorities:</strong> As required by financial regulations</li>
                <li><strong>Legal Compliance:</strong> When required by law or legal process</li>
              </ul>

              <div className="bg-warning/10 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-warning mb-2">Important Note:</h4>
                <p className="text-warning/80 text-sm">We never sell your personal information to third parties. All data sharing is strictly for service provision and regulatory compliance.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Data Security</h2>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Encryption:</strong> All data is encrypted in transit and at rest using industry-standard protocols</li>
                <li><strong>Access Controls:</strong> Strict authentication and authorization for all system access</li>
                <li><strong>Monitoring:</strong> 24/7 security monitoring and incident response procedures</li>
                <li><strong>Compliance:</strong> SOC 2 Type II and other security certifications</li>
                <li><strong>Broker Security:</strong> API keys are encrypted and never stored in plain text</li>
                <li><strong>Regular Audits:</strong> Independent security assessments and penetration testing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Your Rights and Choices</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">You Have the Right To:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data (subject to regulatory requirements)</li>
                <li><strong>Portability:</strong> Export your trading data in machine-readable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
              </ul>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Regulatory Limitations:</h4>
                <p className="text-blue-700 text-sm">Some data must be retained for regulatory compliance periods (typically 5-7 years for trading records). We will clearly identify any limitations when responding to deletion requests.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Data Retention</h2>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Account Information:</strong> Retained for the duration of your account plus 7 years</li>
                <li><strong>Trading Records:</strong> 7 years as required by financial regulations</li>
                <li><strong>Communications:</strong> 3 years for customer support purposes</li>
                <li><strong>Technical Logs:</strong> 90 days for security and performance monitoring</li>
                <li><strong>Marketing Data:</strong> Until you opt out or close your account</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. International Transfers</h2>
              <p className="text-slate-700 mb-4">
                Your information may be processed in countries other than your own. We ensure adequate protection through:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Standard Contractual Clauses for EU data transfers</li>
                <li>Adequacy decisions where available</li>
                <li>Binding Corporate Rules for intra-group transfers</li>
                <li>Certification schemes and codes of conduct</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-slate-700 mb-4">
                We use cookies and similar technologies for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Essential:</strong> Authentication and security features</li>
                <li><strong>Functional:</strong> User preferences and settings</li>
                <li><strong>Analytics:</strong> Usage patterns and performance metrics</li>
                <li><strong>Marketing:</strong> Relevant content and advertising (with consent)</li>
              </ul>
              <p className="text-slate-700">
                You can manage cookie preferences through your browser settings or our cookie management tool.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-slate-700">
                TrendDojo is not intended for individuals under 18 years of age. We do not knowingly collect personal information from children. If we discover that a child has provided us with personal information, we will delete it immediately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-700 mb-4">
                We may update this Privacy Policy periodically. We will notify you of material changes via:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Email notification to your registered address</li>
                <li>In-app notifications</li>
                <li>Website banners</li>
                <li>Updated &ldquo;Last modified&rdquo; date on this page</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Contact Us</h2>
              <p className="text-slate-700 mb-4">
                For questions about this Privacy Policy or to exercise your rights:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-700 mb-2"><strong>Email:</strong> privacy@trenddojo.com</p>
                <p className="text-slate-700 mb-2"><strong>Data Protection Officer:</strong> dpo@trenddojo.com</p>
                <p className="text-slate-700 mb-2"><strong>Mail:</strong> TrendDojo Privacy Team</p>
                <p className="text-slate-700">Response time: We aim to respond within 30 days (1 month for GDPR requests)</p>
              </div>
            </section>
          </div>
        </motion.div>
      </div>

      <MarketingFooter />
    </div>
  );
}