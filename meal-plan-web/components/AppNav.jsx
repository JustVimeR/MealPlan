"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
	CalendarDays,
	Utensils,
	Carrot,
	ShoppingCart,
	BookOpen,
	Plus,
	Search,
	Sparkles,
} from "lucide-react";
import { useState } from "react";

function NavItem({ href, icon: Icon, children }) {
	const pathname = usePathname();

	const active =
		pathname === href || (href !== "/" && pathname?.startsWith(href));
	return (
		<Link
			href={href}
			className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm transition
        ${
					active
						? "bg-zinc-900 text-white shadow-sm"
						: "text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
				}
      `}
		>
			<Icon
				className={`h-4 w-4 ${
					active ? "opacity-100" : "opacity-70 group-hover:opacity-100"
				}`}
			/>
			<span className="truncate">{children}</span>
		</Link>
	);
}

export default function AppNav({ user, children }) {
	const router = useRouter();
	const [query, setQuery] = useState("");

	const goSearch = (e) => {
		e?.preventDefault?.();
		const q = query.trim();
		router.push(q ? `/recipes?q=${encodeURIComponent(q)}` : "/recipes");
	};

	return (
		<div className="h-dvh w-full overflow-hidden grid grid-cols-1 lg:grid-cols-[18rem_1fr]">
			<aside
				aria-label="Sidebar"
				className="h-full border-r border-zinc-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60"
			>
				<div className="flex h-full flex-col">
					<div className="p-4 pb-2">
						<Link
							href="/"
							className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-zinc-100 transition"
						>
							<div className="h-7 w-7 rounded-xl bg-zinc-900 text-white grid place-items-center text-xs font-bold">
								MP
							</div>
							<div className="font-semibold tracking-tight">MealPlan</div>
						</Link>

						<form onSubmit={goSearch} className="relative mt-3">
							<Search className="h-4 w-4 text-zinc-400 absolute left-3 top-2.5" />
							<input
								className="w-full rounded-xl border border-zinc-200 bg-white pl-9 pr-9 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10"
								placeholder="Пошук рецептів…"
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Enter") goSearch(e);
								}}
							/>
							{query && (
								<button
									type="button"
									aria-label="Clear"
									onClick={() => setQuery("")}
									className="absolute right-2 top-2 h-7 px-2 rounded-md text-zinc-500 hover:bg-zinc-100"
								>
									×
								</button>
							)}
						</form>
					</div>

					<nav className="flex-1 min-h-0 overflow-y-auto p-4 pt-2 flex flex-col items-stretch gap-1.5">
						<NavItem href="/planner" icon={CalendarDays}>
							Planner
						</NavItem>
						<NavItem href="/recipes" icon={Utensils}>
							Recipes
						</NavItem>
						<NavItem href="/ingredients" icon={Carrot}>
							Ingredients
						</NavItem>
						<NavItem href="/shopping-list" icon={ShoppingCart}>
							Shopping list
						</NavItem>
						<NavItem href="/library" icon={BookOpen}>
							Public library
						</NavItem>
						<NavItem href="/ai" icon={Sparkles}>
							AI Chat
						</NavItem>
					</nav>

					<div className="p-4 border-t border-zinc-200 grid gap-2">
						<Link
							href="/recipes/new"
							className="flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm transition bg-zinc-900 text-white hover:bg-zinc-800"
						>
							<Plus className="h-4 w-4" />
							New recipe
						</Link>

						<Link
							href="/profile"
							className="flex items-center gap-3 rounded-xl px-3 py-2 border border-zinc-200 hover:bg-zinc-100 transition"
						>
							<img
								src={
									user?.avatarUrl ||
									`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
										user?.displayName || user?.email || "U"
									)}`
								}
								alt=""
								className="h-7 w-7 rounded-xl object-cover border border-zinc-200 bg-white"
							/>
							<div className="min-w-0">
								<div className="text-sm font-medium truncate">
									{user?.displayName || "Profile"}
								</div>
								<div className="text-xs text-zinc-500 truncate">
									{user?.email}
								</div>
							</div>
						</Link>
					</div>
				</div>
			</aside>

			<section className="min-h-0 overflow-y-auto">
				<div className="mx-auto max-w-screen-2xl p-4 lg:p-8">{children}</div>
			</section>
		</div>
	);
}
