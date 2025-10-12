"use client";
import { useState } from "react";
import { setToken } from "../../../lib/auth";

export default function LoginPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [err, setErr] = useState("");

	async function submit() {
		setErr("");
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE}/auth/login`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password }),
				}
			);
			if (!res.ok) throw new Error(await res.text());
			const { accessToken } = await res.json();
			setToken(accessToken);
			window.location.href = "/planner";
		} catch (e) {
			setErr(String(e));
		}
	}

	return (
		<div className="max-w-sm mx-auto card p-6">
			<div className="text-lg font-semibold mb-3">Login</div>
			<input
				className="input mb-2"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
			/>
			<input
				className="input mb-3"
				type="password"
				placeholder="Password"
				value={password}
				onChange={(e) => setPassword(e.target.value)}
			/>
			<button className="btn btn-primary w-full" onClick={submit}>
				Sign in
			</button>
			{err && <div className="text-sm text-red-600 mt-2">{err}</div>}
			<div className="text-sm mt-3">
				No account?{" "}
				<a className="underline" href="/register">
					Register
				</a>
			</div>
		</div>
	);
}
