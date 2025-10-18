"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";

export default function AuthLayout({ children }) {
	const router = useRouter();

	const me = useQuery({
		queryKey: ["me"],
		queryFn: () => api("/users/me"),
		retry: false,
	});

	useEffect(() => {
		if (me.status === "success" && me.data?.email) {
			router.replace("/planner");
		}
	}, [me.status, me.data, router]);
	return <>{children}</>;
}
