import KDSSidebar from "./components/KDSSidebar";

export default function KDSLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)] font-sans text-[var(--color-text-primary)]">

      {/* SIDEBAR */}
      <KDSSidebar />

      {/* PAGE CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">

        {children}

      </div>

    </div>
  );
}