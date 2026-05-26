import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-[var(--color-bg-primary)]">
      <Sidebar />

      <div className="ml-60 flex-1">
        <Navbar />

        <div className="mx-auto max-w-[1280px] p-8">{children}</div>
      </div>
    </div>
  );
}

export default MainLayout;
