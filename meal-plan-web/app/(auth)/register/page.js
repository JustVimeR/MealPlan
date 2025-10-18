"use client";

import { useState } from "react";
import Link from "next/link";
import { setToken } from "../../../lib/auth";
import { User, Mail, Lock, Sparkles, AlertCircle } from "lucide-react";

export default function RegisterPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [displayName, setDisplayName] = useState("");
	const [err, setErr] = useState("");

	async function submit() {
		setErr("");
		try {
			const res = await fetch(
				`${process.env.NEXT_PUBLIC_API_BASE}/auth/register`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ email, password, displayName }),
				}
			);
			if (!res.ok) throw new Error(await res.text());
			const { accessToken } = await res.json();

			setToken(accessToken);
			document.cookie = `mp_token=${accessToken}; Max-Age=604800; Path=/; SameSite=Lax`;

			window.location.href = "/planner";
		} catch (e) {
			setErr(String(e));
		}
	}

	return (
		<div className="relative min-h-dvh overflow-hidden">
			{/* фон + декор */}
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-gradient-to-br from-sky-300/40 to-violet-400/30 blur-3xl" />
				<div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-300/40 to-orange-300/30 blur-3xl" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(0,0,0,0.06),transparent_50%),radial-gradient(circle_at_bottom_right,rgba(0,0,0,0.06),transparent_50%)]" />
			</div>

			<div className="relative mx-auto grid min-h-dvh w-full max-w-6xl grid-cols-1 lg:grid-cols-2">
				{/* Ліва панель (бренд/слоган) */}
				<div className="hidden items-center justify-center p-10 lg:flex">
					<div className="max-w-sm">
						<div className="mb-6 flex items-center gap-3">
							<div className="grid h-10 w-10 place-items-center rounded-2xl bg-zinc-900 text-white shadow-lg shadow-zinc-900/20">
								<Sparkles className="h-5 w-5" />
							</div>
							<div>
								<div className="text-2xl font-semibold tracking-tight">
									MealPlan
								</div>
								<div className="text-sm text-zinc-600">
									Старт будь-якої корисної звички
								</div>
							</div>
						</div>

						<h1 className="mb-3 text-3xl font-semibold leading-tight">
							Створи акаунт за хвилину
						</h1>
						<p className="text-sm leading-relaxed text-zinc-600">
							Додавай свої рецепти, керуй тижневим меню та отримуй список
							покупок автоматично. Тримай харчування під контролем без таблиць і
							стресу.
						</p>
					</div>
				</div>

				{/* Права панель (форма) */}
				<div className="flex items-center justify-center p-6">
					<div className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white/80 p-6 shadow-xl backdrop-blur-sm">
						<div className="mb-4">
							<div className="text-xl font-semibold">Реєстрація</div>
							<div className="text-sm text-zinc-600">
								Створи обліковий запис, щоб розпочати.
							</div>
						</div>

						{err && (
							<div className="mb-3 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
								<AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
								<div className="min-w-0 break-words">{err}</div>
							</div>
						)}

						<label className="mb-1 block text-xs font-medium text-zinc-700">
							Ім’я/Нікнейм
						</label>
						<div className="mb-3 flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 focus-within:border-zinc-900">
							<User className="h-4 w-4 text-zinc-500" />
							<input
								className="w-full bg-transparent text-sm outline-none placeholder:text-zinc-400"
								placeholder="Jane Cooper"
								value={displayName}
								onChange={(e) => setDisplayName(e.target.value)}
							/>
						</div>

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
								placeholder="Мінімум 6 символів"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>

						<button className="btn btn-primary w-full" onClick={submit}>
							Створити акаунт
						</button>

						<div className="mt-4 text-center text-sm text-zinc-600">
							Вже з нами?{" "}
							<Link
								href="/login"
								className="font-medium text-zinc-900 underline underline-offset-4"
							>
								Увійти
							</Link>
						</div>

						<div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />

						<div className="mt-3 text-center text-[11px] text-zinc-500">
							Натискаючи “Створити акаунт”, ви погоджуєтесь з умовами
							використання.
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
