import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';

export default function BookingSuccessPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-sm max-w-md w-full text-center border border-neutral-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-3 rounded-full">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Booking Confirmed!</h1>
        <p className="text-neutral-600 mb-8">
          Your deposit has been received and your appointment is confirmed. We look forward to seeing you.
        </p>
        
        <Link 
          href="/dashboard" 
          className="block w-full bg-neutral-900 text-white font-medium py-3 px-4 rounded-lg hover:bg-neutral-800 transition-colors"
        >
          Go to Dashboard
        </Link>
        <Link href="/" className="block mt-4 text-sm text-neutral-500 hover:text-neutral-900">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
