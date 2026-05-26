import KDSSidebar from "./components/KDSSidebar";

export default function KDSLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex bg-[#F5F7FB]">

      {/* SIDEBAR */}
      <KDSSidebar />

      {/* PAGE CONTENT */}
      <div className="flex-1 p-8">

        {children}

      </div>

    </div>
  );
}