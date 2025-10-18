"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../../lib/auth";

export default function LoginPage() {
	const router = useRouter();
	const params = useSearchParams();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState("");
	const [pending, setPending] = useState(false);

	const nextUrl = params.get("next") || "/planner";

	async function submit() {
		if (pending) return;
		setErr("");
		setPending(true);
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);

			if (!res.ok) {
				let msg = "Login failed";
				try {
					const j = await res.json();
					msg = j?.message || msg;
				} catch {
					try {
						msg = await res.text();
					} catch {
						/* ignore */
					}
				}
				throw new Error(msg || `HTTP ${res.status}`);
			}

			const { accessToken } = await res.json();

			// зберігаємо JWT у localStorage (як і було раніше)
			setToken(accessToken);

			// редірект назад (next) або в /planner
			router.replace(nextUrl);
			router.refresh?.();
		} catch (e) {
			setErr(String(e?.message || e));
		} finally {
			setPending(false);
		}
	}

	function onKeyDown(e) {
		if (e.key === "Enter") submit();
	}

	return (
		<div className="max-w-sm mx-auto card p-6">
			<div className="text-lg font-semibold mb-3">Login</div>

			<input
				className="input mb-2"
				placeholder="Email"
				type="email"
				autoComplete="email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				onKeyDown={onKeyDown}
			/>
			<input
				className="input mb-3"
				type="password"
				placeholder="Password"
				autoComplete="current-password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
				onKeyDown={onKeyDown}
			/>

			<button
				className="btn btn-primary w-full"
				onClick={submit}
				disabled={pending || !email || !password}
			>
				{pending ? "Signing in…" : "Sign in"}
			</button>

			{err && <div className="text-sm text-red-600 mt-2">{err}</div>}

			<div className="text-sm mt-3">
				No account?{" "}
				<Link className="underline" href="/register">
					Register
				</Link>
			</div>
		</div>
	);
}
