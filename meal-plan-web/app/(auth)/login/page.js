"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { setToken } from "../../../lib/auth";
import {
	Mail,
	Lock,
	ArrowRight,
	CheckCircle2,
	AlertCircle,
} from "lucide-react";

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
		<div className="relative min-h-dvh overflow-hidden">
			{/* фон + декор */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-emerald-300/40 to-cyan-400/30 blur-3xl" />
				<div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-fuchsia-300/40 to-indigo-400/30 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.06),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_50%)]" />
			</div>

			<div className="relative mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
				{/* Ліва панель (бренд/прев'ю) */}
				<div className="hidden items-center justify-center p-10 lg:flex">
					<div className="max-w-sm">
						<div className="mb-6 flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
								<CheckCircle2 className="h-5 w-5" />
							</div>
							<div>
								<div className="text-2xl font-semibold tracking-tight">
									MealPlan
								</div>
								<div className="text-sm text-zinc-600">
									Планувальник харчування
								</div>
							</div>
						</div>

						<h1 className="mb-3 text-3xl font-semibold leading-tight">
							Повертай контроль над харчуванням
						</h1>
						<p className="text-sm leading-relaxed text-zinc-600">
							Плануй меню, підраховуй калорії та формуй список покупок в один
							клік. Швидко, красиво, інтуїтивно.
						</p>

						<div className="mt-8 grid gap-3 text-sm">
							<div className="flex items-center gap-2">
								<div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-700 grid place-items-center">
									<span className="text-xs">✓</span>
								</div>
								Власні рецепти та інгредієнти
							</div>
							<div className="flex items-center gap-2">
								<div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-700 grid place-items-center">
									<span className="text-xs">✓</span>
								</div>
								Розумний планувальник тижня
							</div>
							<div className="flex items-center gap-2">
								<div className="h-6 w-6 rounded-lg bg-emerald-500/10 text-emerald-700 grid place-items-center">
									<span className="text-xs">✓</span>
								</div>
								Автогенерація списку покупок
							</div>
						</div>
					</div>
				</div>

				{/* Права панель (форма) */}
				<div className="flex items-center justify-center p-6">
					<div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
						<div className="mb-4">
							<div className="text-xl font-semibold">Вхід</div>
							<div className="text-sm text-zinc-600">
								Раді знову бачити! Увійди, щоб продовжити.
							</div>
						</div>

						{err && (
							<div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
								<div className="min-w-0 break-words">{err}</div>
							</div>
						)}

						<label className="mb-1 block text-xs font-medium text-zinc-700">
							Email
						</label>
						<div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 focus-within:border-zinc-900">
							<Mail className="h-4 w-4 text-zinc-500" />
							<input
								className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
								placeholder="you@example.com"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								onKeyDown={onKeyDown}
							/>
						</div>

						<label className="mb-1 block text-xs font-medium text-zinc-700">
							Пароль
						</label>
						<div className="mb-4 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 focus-within:border-zinc-900">
							<Lock className="h-4 w-4 text-zinc-500" />
							<input
								className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
								type="password"
								placeholder="••••••••"
								autoComplete="current-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								onKeyDown={onKeyDown}
							/>
						</div>

						<button
							className="btn btn-primary mb-2 w-full"
							onClick={submit}
							disabled={pending || !email || !password}
						>
							{pending ? (
								"Signing in…"
							) : (
								<span className="inline-flex items-center gap-2">
									Sign in <ArrowRight className="h-4 w-4" />
								</span>
							)}
						</button>

						<div className="mt-4 text-center text-sm text-zinc-600">
							Немає акаунта?{" "}
							<Link
								href="/register"
								className="font-medium text-zinc-900 underline underline-offset-4"
							>
								Зареєструватися
							</Link>
						</div>

						<div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

						<div className="mt-3 text-center text-[11px] text-zinc-500">
							Продовжуючи, ви погоджуєтесь з нашими умовами використання.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
