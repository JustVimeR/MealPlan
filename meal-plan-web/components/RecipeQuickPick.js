"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export default function RecipeQuickPick({ value, onSelect }) {
	const [q, setQ] = useState("");
	const list = useQuery({
		queryKey: ["recipes", q],
		queryFn: () => api(`/recipes${q ? `?q=${encodeURIComponent(q)}` : ""}`),
		staleTime: 15_000,
	});

	return (
		<div className="card p-3">
			<div className="text-sm font-medium mb-2">Pick recipe</div>
			<input
				className="input mb-2"
				placeholder="Search…"
				value={q}
				onChange={(e) => setQ(e.target.value)}
			/>
			<div className="grid gap-1 max-h-72 overflow-auto">
				{list.isLoading && <div className="text-sm">Loading…</div>}
				{Array.isArray(list.data) &&
					list.data.map((r) => (
						<button
							key={r._id}
							className="text-left px-3 py-2 hover:bg-zinc-50 rounded"
							onClick={() => onSelect(r)}
						>
							<div className="text-sm">{r.title}</div>
							<div className="text-xs text-zinc-500">
								{r.minutes ?? 20} min · {r.servings ?? 2} servings
							</div>
						</button>
					))}
			</div>
		</div>
	);
}
