import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function JoinPage() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-white to-gray-100">
      {/* Navbar */}
      <header className="flex items-center justify-between w-full px-6 py-4 shadow-sm bg-white">
        {/* Logo */}
        <div className="flex items-center space-x-2">
          <Image
            src="/logo.svg"
            alt="ICPWork Logo"
            width={132}
            height={132}
            priority
          />
        </div>

        {/* Exit Button */}
        <Button
          variant="outline"
          className="rounded-full px-6 py-1 text-sm font-medium"
        >
          Exit
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-xl text-center space-y-6">
          {/* Title */}
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900">
            Join as a Client or Freelancer?
          </h2>

          {/* Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="cursor-pointer transition hover:shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">Client</h3>
                <p className="text-sm text-gray-600 mt-2">
                  I am a Client, want to hire someone.
                </p>
              </CardContent>
            </Card>

            <Card className="cursor-pointer transition hover:shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800">
                  Freelancer
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  I am a Freelancer, looking for some gigs and work.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Action Button */}
          <Button className="w-full md:w-auto rounded-2xl px-8 py-3 text-base font-medium">
            Apply As Freelancer
          </Button>

          {/* Login */}
          <p className="text-sm text-gray-600">
            Already Have an Account?{" "}
            <Link href="/login" className="text-green-600 hover:underline">
              LogIn
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
