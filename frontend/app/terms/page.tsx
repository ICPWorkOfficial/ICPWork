import Link from 'next/link';
import Image from 'next/image';

export default function TermsPage() {
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
        <h1 className="text-3xl font-semibold mb-4">Terms & Conditions</h1>
        <p className="text-lg text-gray-700 mb-6">
          Simple, secure, and transparent workflows for clients and freelancers. These terms describe expectations for using ICP Work.
        </p>

        <div className="space-y-6">
          <h2 className="text-xl font-medium">Acceptance</h2>
          <p className="text-gray-700">By using ICP Work you agree to these terms. Please read them carefully.</p>

          <h2 className="text-xl font-medium">Accounts</h2>
          <p className="text-gray-700">Account holders are responsible for maintaining the security of their accounts and for all activities that occur under their account.</p>

          <h2 className="text-xl font-medium">Projects & Services</h2>
          <p className="text-gray-700">Clients post projects and define deliverables. Freelancers submit proposals and deliver work as agreed in the contract.</p>

          <h2 className="text-xl font-medium">Escrow & Payments</h2>
          <p className="text-gray-700">Payments are handled through escrow contracts. Release of funds follows the milestones and completion rules agreed by the parties.</p>

          <h2 className="text-xl font-medium">Dispute Resolution</h2>
          <p className="text-gray-700">In case of disputes, parties should attempt to resolve them through the platform's mediation tools.</p>
        </div>

        <hr className="my-8" />

        <section className="space-y-6">
          <h3 className="text-2xl font-semibold">ICP Work flow summary</h3>
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

        <div className="mt-10 flex gap-4">
          
          
        </div>
      </section>
    </main>
  );
}
