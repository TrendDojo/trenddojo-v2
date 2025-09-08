"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import TrendDojoHeader from "@/components/ui/TrendDojoHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-slate-50">
      <TrendDojoHeader variant="internal" showBackButton={false} />

      <div className="container mx-auto px-6 py-12 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Terms of Service</h1>
          <p className="text-slate-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <div className="prose prose-slate max-w-none">
            {/* Critical Trading Disclaimer */}
            <div className="bg-red-50 border-l-4 border-red-400 p-6 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Trading Risk Warning</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p className="mb-2">
                      <strong>Trading involves substantial risk and is not suitable for all investors.</strong> 
                      You may lose some or all of your invested capital. Past performance does not guarantee future results.
                    </p>
                    <p>
                      TrendDojo provides tools and analytics but does not provide investment advice. 
                      All trading decisions remain your responsibility.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 mb-4">
                By accessing or using TrendDojo's services, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.
              </p>
              <p className="text-slate-700">
                These terms constitute a legal agreement between you and TrendDojo. Please read them carefully.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Service Description</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">What TrendDojo Provides:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Position Sizing Tools:</strong> Calculate appropriate position sizes based on risk tolerance</li>
                <li><strong>Risk Management:</strong> Portfolio-level risk monitoring and stop-loss automation</li>
                <li><strong>Trade Execution:</strong> Integration with broker APIs for systematic trade execution</li>
                <li><strong>Performance Analytics:</strong> Trade journaling, P&L tracking, and performance metrics</li>
                <li><strong>Market Data:</strong> Real-time and historical market data feeds</li>
                <li><strong>Strategy Tools:</strong> Pre-trade checklists and trade validation systems</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">What TrendDojo Does NOT Provide:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Investment advice or recommendations</li>
                <li>Guaranteed returns or profit assurances</li>
                <li>Direct handling of your funds or securities</li>
                <li>Tax, legal, or financial planning advice</li>
                <li>Insurance against trading losses</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. User Responsibilities</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">You Are Responsible For:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>All Trading Decisions:</strong> TrendDojo provides tools, not advice</li>
                <li><strong>Account Security:</strong> Maintaining secure login credentials and API keys</li>
                <li><strong>Regulatory Compliance:</strong> Following all applicable trading regulations</li>
                <li><strong>Accurate Information:</strong> Providing truthful and current account information</li>
                <li><strong>Risk Management:</strong> Setting appropriate risk limits and position sizes</li>
                <li><strong>Tax Obligations:</strong> Reporting and paying taxes on trading gains</li>
                <li><strong>Subscription Payments:</strong> Maintaining current payment information</li>
              </ul>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-amber-800 mb-2">Age and Eligibility:</h4>
                <p className="text-amber-700 text-sm">You must be at least 18 years old and legally eligible to trade securities in your jurisdiction. Some features may require additional verification or qualifications.</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Account Terms</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Account Creation:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>One account per person or legal entity</li>
                <li>Accurate and complete information required</li>
                <li>Identity verification may be required</li>
                <li>You may not share, transfer, or sell your account</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Account Security:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Use strong, unique passwords</li>
                <li>Enable two-factor authentication when available</li>
                <li>Notify us immediately of unauthorized access</li>
                <li>You are liable for all activity under your account</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Account Termination:</h3>
              <p className="text-slate-700 mb-2">We may suspend or terminate accounts for:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Violation of these terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment of subscription fees</li>
                <li>Regulatory requirements</li>
                <li>Extended inactivity (12+ months)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Subscription and Billing</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Subscription Tiers:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Free Tier:</strong> Basic features with usage limitations</li>
                <li><strong>Starter ($4.99/month):</strong> Enhanced features for casual traders</li>
                <li><strong>Professional ($14.99/month):</strong> Advanced tools for active traders</li>
                <li><strong>Elite ($39.99/month):</strong> Full feature set for professional traders</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Billing Terms:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Subscriptions renew automatically monthly or annually</li>
                <li>Payment processed via Airwallex and other approved providers</li>
                <li>Price changes require 30 days advance notice</li>
                <li>No refunds for partial months unless required by law</li>
                <li>Failed payments may result in service suspension</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Cancellation:</h3>
              <p className="text-slate-700">
                You may cancel your subscription at any time. Service continues until the end of the current billing period. 
                We do not provide refunds for unused portions of subscription periods.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Trading Disclaimers</h2>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-yellow-800 mb-2">No Investment Advice:</h4>
                <p className="text-yellow-700 text-sm">TrendDojo provides analytical tools and trade execution capabilities but does not provide investment advice, recommendations, or suggestions to buy or sell any securities.</p>
              </div>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Risk Acknowledgments:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Trading Risk:</strong> All trading involves risk of loss, including total loss of capital</li>
                <li><strong>Market Risk:</strong> Markets can be volatile and unpredictable</li>
                <li><strong>Systematic Risk:</strong> Automated systems can malfunction or produce unexpected results</li>
                <li><strong>Liquidity Risk:</strong> Some securities may be difficult to buy or sell</li>
                <li><strong>Technology Risk:</strong> System outages or delays may impact trading</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Performance Disclaimers:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Past performance does not guarantee future results</li>
                <li>Hypothetical or backtested results may not reflect actual trading</li>
                <li>Results may vary significantly between users</li>
                <li>Market conditions can change rapidly</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data and Privacy</h2>
              <p className="text-slate-700 mb-4">
                Your use of TrendDojo is subject to our <Link href="/privacy" className="text-trenddojo-purple-700 hover:underline">Privacy Policy</Link>, 
                which explains how we collect, use, and protect your information.
              </p>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Data Usage Rights:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>You retain ownership of your trading data</li>
                <li>We may use aggregated, anonymized data for research and improvement</li>
                <li>You can export your data at any time</li>
                <li>Data deletion is subject to regulatory retention requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Intellectual Property</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">TrendDojo's Rights:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>All software, algorithms, and content are proprietary to TrendDojo</li>
                <li>Trademarks, logos, and brand elements are protected</li>
                <li>You may not reverse engineer, copy, or redistribute our software</li>
                <li>API access is subject to separate terms and rate limits</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Your Rights:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Limited license to use our services for their intended purpose</li>
                <li>You own the trading strategies and decisions you create</li>
                <li>You may share performance results publicly (subject to accuracy requirements)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Service Availability</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Uptime and Performance:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>We target 99.5% uptime but do not guarantee continuous service</li>
                <li>Scheduled maintenance will be announced in advance when possible</li>
                <li>Market hours may affect data availability</li>
                <li>Third-party service outages may impact functionality</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Service Modifications:</h3>
              <p className="text-slate-700">
                We may modify, suspend, or discontinue features with reasonable notice. 
                Material changes to paid features will include transition periods or alternatives when feasible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Limitation of Liability</h2>
              
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-800 mb-2">Important Limitations:</h4>
                <p className="text-red-700 text-sm mb-2">
                  TrendDojo's liability is limited to the subscription fees paid in the 12 months preceding any claim. 
                  We are not liable for trading losses, missed opportunities, or consequential damages.
                </p>
                <p className="text-red-700 text-sm">
                  Some jurisdictions do not allow liability limitations for personal injury or certain types of damages. 
                  Check your local laws for applicable consumer protections.
                </p>
              </div>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Excluded Damages:</h3>
              <p className="text-slate-700 mb-2">We are not liable for:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Trading losses or missed profits</li>
                <li>Data loss or corruption (beyond reasonable backup efforts)</li>
                <li>Third-party service failures</li>
                <li>Force majeure events</li>
                <li>User error or misuse of services</li>
                <li>Regulatory changes affecting service availability</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-700 mb-4">
                You agree to indemnify and hold TrendDojo harmless from claims arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Your use of our services</li>
                <li>Your trading activities and decisions</li>
                <li>Violation of these terms</li>
                <li>Violation of applicable laws or regulations</li>
                <li>Infringement of third-party rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Dispute Resolution</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Governing Law:</h3>
              <p className="text-slate-700 mb-4">
                These terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Dispute Process:</h3>
              <ol className="list-decimal pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Direct Communication:</strong> Contact our support team first</li>
                <li><strong>Mediation:</strong> Good faith attempt at mediated resolution</li>
                <li><strong>Arbitration:</strong> Binding arbitration for claims over $10,000</li>
                <li><strong>Small Claims Court:</strong> Available for eligible claims under local limits</li>
              </ol>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Class Action Waiver:</h3>
              <p className="text-slate-700">
                Disputes must be resolved individually. You waive the right to participate in class actions, 
                except where prohibited by law.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Regulatory Compliance</h2>
              
              <h3 className="text-xl font-medium text-slate-800 mb-3">Financial Regulations:</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>TrendDojo operates as a technology service provider, not a financial advisor</li>
                <li>We may be required to report certain activities to regulators</li>
                <li>Users are responsible for compliance with local trading regulations</li>
                <li>Some features may not be available in all jurisdictions</li>
              </ul>

              <h3 className="text-xl font-medium text-slate-800 mb-3">Anti-Money Laundering:</h3>
              <p className="text-slate-700">
                We maintain AML and KYC procedures as required. Suspicious activities will be reported to appropriate authorities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Changes to Terms</h2>
              <p className="text-slate-700 mb-4">
                We may update these terms periodically. Material changes will be communicated via:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Email notification (30 days advance notice for material changes)</li>
                <li>In-app notifications</li>
                <li>Website announcements</li>
                <li>Updated effective date on this page</li>
              </ul>
              <p className="text-slate-700">
                Continued use of services after changes constitutes acceptance of updated terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. Contact Information</h2>
              <p className="text-slate-700 mb-4">
                For questions about these terms or our services:
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-slate-700 mb-2"><strong>Legal Team:</strong> legal@trenddojo.com</p>
                <p className="text-slate-700 mb-2"><strong>Customer Support:</strong> support@trenddojo.com</p>
                <p className="text-slate-700 mb-2"><strong>Compliance:</strong> compliance@trenddojo.com</p>
                <p className="text-slate-700">
                  <strong>Mail:</strong> TrendDojo Legal Department<br/>
                  [Complete Address]
                </p>
              </div>
            </section>

            <div className="bg-slate-100 rounded-lg p-6 mt-8">
              <p className="text-slate-600 text-sm text-center">
                By using TrendDojo, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      <MarketingFooter />
    </div>
  );
}