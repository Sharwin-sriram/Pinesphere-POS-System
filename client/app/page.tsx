"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLanding from "./dashboard/page";
import { authService } from "./lib/authService";
import { getRoleHomePath } from "./lib/authRoutes";
import Topbar from "./components/dashboard/Topbar";
import Sidebar from "./components/dashboard/Sidebar";
import { CartProvider } from "./components/dashboard/CartContext";
import { Toaster } from "react-hot-toast";

export default function Home() {
	const router = useRouter();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	useEffect(() => {
		if (!authService.isAuthenticated()) {
			return;
		}

		const roleHomePath = getRoleHomePath(authService.getUserRole());
		if (roleHomePath !== "/") {
			router.push(roleHomePath);
		}
	}, [router]);

	return (
		<CartProvider>
			<div className="min-h-screen bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]">
				<Toaster
					position="top-center"
					reverseOrder={false}
					toastOptions={{
						duration: 3000,
						style: {
							background: "var(--color-bg-secondary)",
							color: "var(--color-text-primary)",
							border: "1px solid var(--color-border)",
							borderRadius: "var(--radius-lg)",
						},
					}}
				/>
				<Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
				<Topbar onMenuClick={() => setIsSidebarOpen(true)} />
				<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<DashboardLanding />
				</main>
			</div>
		</CartProvider>
	);
}
