import React from 'react'

export default function OtpEmail({ otp = "123456" }) {
    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-6">
            <div className="w-full max-w-xl bg-white rounded-xl shadow-lg overflow-hidden">
                {/* HEADER */}
                <div className="bg-linear-to-br from-[#761be6] to-[#441851]/70 text-center py-6">
                    <h1 className="text-white font-semibold text-2xl sm:text-3xl">
                        Welcome to Qubey
                    </h1>
                </div>

                {/* BODY */}
                <div className="pt-8 px-8 pb-6 text-center text-gray-700">
                    <h2 className="text-xl font-semibold text-gray-800">
                        Verify Your Email Address
                    </h2>

                    <p className="mt-3 text-sm font-medium text-gray-700">
                        Enter the verification code below to complete your sign-in.
                    </p>
                    <p className="mt-1 text-sm font-medium text-gray-600">
                        This code will expire in 10 minutes
                    </p>

                    {/* OTP BOX */}
                    <div className="my-6 inline-block px-8 py-4 text-3xl tracking-[8px] font-semibold bg-purple-50 border border-dashed border-purple-700 rounded-lg text-purple-700">
                        {otp}
                    </div>

                    <p className="text-sm text-gray-700 bg-gray-100 p-3 rounded-lg shadow-md">
                        <span className='text-purple-700 font-semibold'>Security Tip: </span> If you did not request this, Please ignore this email.
                        Never share your verification codes with anyone.
                    </p>

                    <p className="mt-6 text-sm text-gray-600">
                        Having Trouble? Contact us through
                        <a href='mailto:support@qubey.com' className='text-purple-600'> Email </a>
                        for support.
                    </p>
                </div>

                {/* Footer */}
                <div className="text-center border-t border-gray-200 text-sm text-gray-700 py-6 bg-gray-100">
                    © {new Date().getFullYear()} Qubey. All rights reserved.
                </div>
            </div>
        </div>
    )
}
