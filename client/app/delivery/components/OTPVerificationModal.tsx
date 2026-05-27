"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OTPVerificationModal({
  isOpen,
  onClose,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl p-6">
        <h2 className="text-2xl font-bold mb-4">
          OTP Verification
        </h2>

        <p className="text-gray-500 mb-5">
          Enter delivery OTP to verify order completion.
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border rounded-xl p-3 outline-none mb-5"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-200"
          >
            Cancel
          </button>

          <button className="px-5 py-2 rounded-xl bg-blue-600 text-white">
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}