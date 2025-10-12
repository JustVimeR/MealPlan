"use client";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import AppNav from "@/components/AppNav";

export default function AppLayout({ children }) {
	const me = useQuery({ queryKey: ["me"], queryFn: () => api("/users/me") });
	return <AppNav user={me.data}>{children}</AppNav>;
}
