"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import AppNav from "../../components/AppNav";

export default function AppLayout({ children }) {
	const router = useRouter();

	const me = useQuery({
		queryKey: ["me"],
		queryFn: () => api("/users/me"),
		retry: false,
	});

	useEffect(() => {
		if (me.status === "error") {
			const next = window.location.pathname + window.location.search;
			router.replace(`/login?next=${encodeURIComponent(next)}`);
		}
	}, [me.status, router]);

	if (me.isPending || me.status === "error") {
		return <div className="h-dvh" />;
	}

	return (
		<div className="h-dvh flex">
			<AppNav user={me.data}>{children}</AppNav>
		</div>
	);
}
