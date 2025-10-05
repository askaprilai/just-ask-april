import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const Privacy = () => {
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
          <h1 className="text-4xl font-bold text-primary mb-8">Privacy Policy</h1>
          
          <p className="text-sm text-muted-foreground mb-8">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
            <p className="text-muted-foreground">
              Just Ask April ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our communication improvement service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
            <h3 className="text-xl font-semibold mb-3 mt-4">Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Account Information:</strong> Email address, name, and authentication credentials when you create an account</li>
              <li><strong>Communication Content:</strong> Text you submit for improvement, including context about environment, desired outcomes, and emotions</li>
              <li><strong>Feedback:</strong> Ratings and feedback you provide on suggested improvements</li>
              <li><strong>Voice Data:</strong> Audio recordings when you use our voice practice features (processed in real-time and not stored)</li>
            </ul>

            <h3 className="text-xl font-semibold mb-3 mt-4">Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Usage Data:</strong> Information about how you interact with our service, including features used and time spent</li>
              <li><strong>Device Information:</strong> Browser type, operating system, IP address, and device identifiers</li>
              <li><strong>Analytics:</strong> Aggregated statistics about service usage and performance</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Delivery:</strong> To provide communication improvement suggestions and analyze your text</li>
              <li><strong>Personalization:</strong> To tailor suggestions based on your preferences and usage patterns</li>
              <li><strong>Service Improvement:</strong> To enhance our AI models and improve suggestion quality</li>
              <li><strong>Account Management:</strong> To maintain your account and provide customer support</li>
              <li><strong>Communication:</strong> To send service updates, security alerts, and respond to inquiries</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Storage and Security</h2>
            <p className="text-muted-foreground mb-4">
              We implement industry-standard security measures to protect your information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>All data is encrypted in transit using SSL/TLS protocols</li>
              <li>Data at rest is encrypted using AES-256 encryption</li>
              <li>Access to personal data is restricted to authorized personnel only</li>
              <li>Regular security audits and updates to our systems</li>
              <li>Secure cloud infrastructure with backup and redundancy</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              Your communication content is stored securely and used solely to provide you with improvement suggestions. We do not sell or share your content with third parties for marketing purposes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
            <p className="text-muted-foreground">
              We retain your information for as long as your account is active or as needed to provide you services. You may request deletion of your account and associated data at any time. Upon deletion request:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-4">
              <li>Your account will be deactivated immediately</li>
              <li>Personal data will be deleted within 30 days</li>
              <li>Aggregated, anonymized data may be retained for analytics</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Sharing of Information</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell your personal information. We may share information in limited circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Service Providers:</strong> Third-party vendors who perform services on our behalf (e.g., hosting, analytics)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights and safety</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              <li><strong>With Your Consent:</strong> When you explicitly authorize us to share specific information</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Your Rights and Choices</h2>
            <p className="text-muted-foreground mb-4">
              You have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Request a portable copy of your data</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Object:</strong> Object to certain processing of your information</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To exercise these rights, please contact us using the information provided below.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookies and Tracking</h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to maintain your session, remember your preferences, and analyze service usage. You can control cookie settings through your browser preferences. Essential cookies required for service functionality cannot be disabled.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Children's Privacy</h2>
            <p className="text-muted-foreground">
              Our service is not intended for users under 13 years of age. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us immediately.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">International Data Transfers</h2>
            <p className="text-muted-foreground">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may update this Privacy Policy periodically. We will notify you of material changes by posting the new policy on this page and updating the "Last Updated" date. Your continued use of the service after changes become effective constitutes acceptance of the revised policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-muted-foreground">
                <strong>Just Ask April</strong><br />
                Email: privacy@justaskapril.com<br />
                For data subject requests: privacy-requests@justaskapril.com
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;