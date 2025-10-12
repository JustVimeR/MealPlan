"use client";
import { usePathname } from "next/navigation";

export default function Nav() {
	const pathname = usePathname();

	if (pathname === "/login" || pathname === "/register") return null;

	return (
		<nav className="flex gap-3 text-sm">
			<a className="hover:underline" href="/recipes">
				Recipes
			</a>
			<a className="hover:underline" href="/library">
				Library
			</a>
			<a className="hover:underline" href="/ingredients">
				Ingredients
			</a>
			<a className="hover:underline" href="/planner">
				Planner
			</a>
			<a className="hover:underline" href="/shopping-list">
				Shopping list
			</a>
			<a className="hover:underline" href="/profile">
				Profile
			</a>
		</nav>
	);
}
