import Link from 'next/link';
import Image from 'next/image';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <header className="border-b py-6">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold">
            <div className="flex items-center gap-2">
                      <Image
                        src="/logo.svg"
                        alt="ICPWork logo"
                        width={150}
                        height={150}
                      />
                    </div>
          </Link>
           <nav className="flex items-center gap-4 text-sm">
            <Link href="/login?user=client" className="inline-block px-6 py-3 bg-black text-white rounded-full">Join ICP Work</Link>
            <Link href="/docs" className="inline-block px-6 py-3 border border-gray-200 rounded-full">Documentation →</Link>
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
        <p className="text-lg text-gray-700 mb-6">
          Simple, secure, and transparent workflows for clients and freelancers. We respect your privacy and
          are committed to protecting personal information collected through ICP Work.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6"> 
          <div className="space-y-4">
            <h2 className="text-xl font-medium">What we collect</h2>
            <p className="text-gray-700">We collect only the data necessary to provide the platform: profile details, project and payment information, and optional portfolio content. Authentication is performed using Internet Identity for secure, pseudonymous sign-in where available.</p>

            <h2 className="text-xl font-medium">How we use data</h2>
            <p className="text-gray-700">Data is used to facilitate project posting, freelancer selection, contract and escrow flows, and to improve the product. We never sell personal information to third parties.</p>

            <h2 className="text-xl font-medium">Security</h2>
            <p className="text-gray-700">We use industry-standard controls to protect data in transit and at rest. Escrow and contract operations are executed through smart contracts for transparency.</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium">Retention & access</h2>
            <p className="text-gray-700">You can request account data export or deletion. Some records (for compliance and payment reconciliation) may be retained as required by law.</p>

            <h2 className="text-xl font-medium">Choices</h2>
            <p className="text-gray-700">You control your public profile and portfolio. Notification and email preferences can be managed in account settings.</p>

            <h2 className="text-xl font-medium">Contact</h2>
            <p className="text-gray-700">Questions about privacy can be sent to privacy@icpwork.example (replace with your support address).</p>
          </div>
        </div>

        <hr className="my-8" />

        <section className="space-y-6">
          <h3 className="text-2xl font-semibold">How ICP Work flows operate</h3>
          <ol className="space-y-4 list-decimal list-inside text-gray-800">
            <li>
              <strong>Registration & Profile Setup</strong>
              <div className="text-gray-700">Register using Internet Identity for secure, anonymous authentication.</div>
            </li>
            <li>
              <strong>Project Posting</strong>
              <div className="text-gray-700">Define project requirements, budget, and deadlines.</div>
            </li>
            <li>
              <strong>Freelancer Selection</strong>
              <div className="text-gray-700">Review proposals and communicate with potential freelancers.</div>
            </li>
            <li>
              <strong>Contract & Escrow</strong>
              <div className="text-gray-700">Smart contract creation and secure fund deposit.</div>
            </li>
            <li>
              <strong>Work Review & Payment</strong>
              <div className="text-gray-700">Review deliverables and trigger automatic payment release.</div>
            </li>
          </ol>
        </section>

      
      </section>
    </main>
  );
}
