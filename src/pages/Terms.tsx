import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-primary mb-8">Terms of Service</h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Just Ask April AI ("Service"), you accept and agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground mb-4">
              Just Ask April AI is an AI-powered communication improvement platform that helps users enhance their written and verbal communication skills. The Service includes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Text rewriting and communication improvement suggestions</li>
              <li>Voice practice and real-time conversation coaching</li>
              <li>Analytics and progress tracking</li>
              <li>Communication insights based on The Impact Language Method™</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Account Registration</h3>
            <p className="text-muted-foreground mb-4">
              To access certain features, you must create an account. You agree to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Account Termination</h3>
            <p className="text-muted-foreground">
              We reserve the right to suspend or terminate your account if you violate these Terms or engage in activities that harm the Service or other users.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Subscription Plans and Billing</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Free Plan</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>5 rewrites per day</li>
              <li>Basic features access</li>
              <li>Standard support</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Pro Plan</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mb-4">
              <li>Unlimited rewrites</li>
              <li>Voice practice features</li>
              <li>Advanced analytics dashboard</li>
              <li>Priority support</li>
              <li>Access to The Impact Playbook</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Payment Terms</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Pro subscriptions are billed monthly or annually</li>
              <li>Payment is processed through Stripe</li>
              <li>Subscriptions auto-renew unless cancelled</li>
              <li>Prices are subject to change with 30 days notice</li>
              <li>No refunds for partial months or unused services</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Cancellation</h3>
            <p className="text-muted-foreground">
              You may cancel your subscription at any time through your account settings or the Stripe customer portal. Access to Pro features will continue until the end of your current billing period.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-muted-foreground mb-4">You agree NOT to:</p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Use the Service for any illegal or unauthorized purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit viruses, malware, or harmful code</li>
              <li>Attempt to gain unauthorized access to the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Share your account credentials with others</li>
              <li>Use the Service to harass, abuse, or harm others</li>
              <li>Generate or submit hateful, discriminatory, or offensive content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Content and Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Your Content</h3>
            <p className="text-muted-foreground mb-4">
              You retain ownership of the content you submit to the Service. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Process and analyze your content to provide the Service</li>
              <li>Use aggregated, anonymized data to improve our AI models</li>
              <li>Store your content as necessary to provide the Service</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Our Intellectual Property</h3>
            <p className="text-muted-foreground">
              The Service, including The Impact Language Method™, its design, features, and functionality, are owned by Just Ask April AI and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or reverse engineer any part of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. AI-Generated Content</h2>
            <p className="text-muted-foreground mb-4">
              Our Service uses artificial intelligence to generate communication suggestions. You acknowledge that:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>AI-generated suggestions are not guaranteed to be error-free</li>
              <li>You are responsible for reviewing and editing all suggestions before use</li>
              <li>Suggestions should be adapted to your specific context</li>
              <li>We are not liable for outcomes resulting from using AI suggestions</li>
              <li>You should use professional judgment when implementing suggestions</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Disclaimers and Limitations</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Service Availability</h3>
            <p className="text-muted-foreground mb-4">
              We strive to maintain 99.9% uptime but do not guarantee uninterrupted access. The Service is provided "as is" without warranties of any kind.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Not Professional Advice</h3>
            <p className="text-muted-foreground mb-4">
              Just Ask April AI is a communication improvement tool, not a substitute for professional advice. For legal, medical, or other professional matters, consult qualified professionals.
            </p>

            <h3 className="text-xl font-semibold mb-3 mt-4">Limitation of Liability</h3>
            <p className="text-muted-foreground">
              To the maximum extent permitted by law, Just Ask April AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground">
              You agree to indemnify and hold harmless Just Ask April AI, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Data Privacy</h2>
            <p className="text-muted-foreground">
              Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. Please review our Privacy Policy to understand our data practices.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Your continued use of the Service after changes become effective constitutes acceptance of the modified Terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">12. Termination</h2>
            <p className="text-muted-foreground mb-4">
              Either party may terminate this agreement at any time:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>You:</strong> By closing your account through account settings</li>
              <li><strong>Us:</strong> With or without cause, with reasonable notice</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Upon termination, your right to access the Service ceases immediately. We may retain certain data as required by law or for legitimate business purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">13. Governing Law and Disputes</h2>
            <p className="text-muted-foreground mb-4">
              These Terms are governed by the laws of the United States, without regard to conflict of law provisions.
            </p>
            <h3 className="text-xl font-semibold mb-3 mt-4">Dispute Resolution</h3>
            <p className="text-muted-foreground">
              Any disputes arising from these Terms or the Service shall first be attempted to be resolved through good-faith negotiation. If unresolved after 30 days, disputes may be submitted to binding arbitration.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">14. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Severability:</strong> If any provision is found invalid, the remaining provisions remain in effect</li>
              <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Just Ask April AI</li>
              <li><strong>No Waiver:</strong> Failure to enforce any provision does not constitute a waiver</li>
              <li><strong>Assignment:</strong> You may not assign these Terms without our consent</li>
              <li><strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our control</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
            <p className="text-muted-foreground mb-4">
              For questions about these Terms, please contact us:
            </p>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Just Ask April AI</strong><br />
                Email: legal@justaskapril.com<br />
                Support: support@justaskapril.com
              </p>
            </div>
          </section>

          <div className="mt-12 p-6 bg-secondary/10 rounded-lg border border-secondary/20">
            <p className="text-sm text-muted-foreground">
              By using Just Ask April AI, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
