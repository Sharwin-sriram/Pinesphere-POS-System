"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function OTPVerificationModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] w-[400px] rounded-2xl p-6 animate-fade-in-up">
        <h2 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">
          OTP Verification
        </h2>

        <p className="text-sm text-[var(--color-text-secondary)] mb-5">
          Enter delivery OTP to verify order completion.
        </p>

        <input
          type="text"
          placeholder="Enter OTP"
          className="input-light mb-5"
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-secondary-light px-5"
          >
            Cancel
          </button>

          <button className="btn-light px-5">
            Verify OTP
          </button>
        </div>
      </div>
    </div>
  );
}