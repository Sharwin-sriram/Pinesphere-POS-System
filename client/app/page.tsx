"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLanding from "./dashboard/page";
import { authService } from "./lib/authService";
import { getRoleHomePath } from "./lib/authRoutes";

export default function Home() {
	const router = useRouter();

	useEffect(() => {
		if (!authService.isAuthenticated()) {
			return;
		}

		const roleHomePath = getRoleHomePath(authService.getUserRole());
		if (roleHomePath !== "/") {
			router.push(roleHomePath);
		}
	}, [router]);

	return <DashboardLanding />;
}
