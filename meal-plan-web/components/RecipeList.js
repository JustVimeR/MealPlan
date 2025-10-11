"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useState } from "react";
import RecipeForm from "./RecipeForm";

export default function RecipeList() {
	const qc = useQueryClient();
	const [q, setQ] = useState("");
	const [showNew, setShowNew] = useState(false);

	const recipes = useQuery({
		queryKey: ["recipes", q],
		queryFn: () => api(`/recipes${q ? `?q=${encodeURIComponent(q)}` : ""}`),
	});

	const del = useMutation({
		mutationFn: (id) => api(`/recipes/${id}`, { method: "DELETE" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
	});

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Recipes</div>
				<div className="flex gap-2">
					<input
						className="input w-64"
						placeholder="Search..."
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
					<button className="btn btn-primary" onClick={() => setShowNew(true)}>
						+ New
					</button>
				</div>
			</div>

			{showNew && (
				<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
					<div className="w-full max-w-2xl">
						<RecipeForm onClose={() => setShowNew(false)} />
					</div>
				</div>
			)}

			<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
				{recipes.isLoading && <div>Loading…</div>}
				{recipes.isError && (
					<div className="text-red-600">{String(recipes.error?.message)}</div>
				)}
				{Array.isArray(recipes.data) && recipes.data.length === 0 && (
					<div className="text-sm text-zinc-500">
						Немає рецептів. Додайте перший!
					</div>
				)}
				{Array.isArray(recipes.data) &&
					recipes.data.map((r) => (
						<div key={r._id} className="card p-4 flex flex-col gap-2">
							<div className="flex items-start justify-between">
								<div className="font-medium">{r.title}</div>
								<button
									className="text-red-500 text-sm"
									onClick={() => del.mutate(r._id)}
								>
									Delete
								</button>
							</div>
							<div className="text-sm text-zinc-500">
								{r.minutes ? `${r.minutes} min · ` : ""}
								{r.servings ?? 2} servings
							</div>
							{r.tags?.length ? (
								<div className="flex gap-1 flex-wrap">
									{r.tags.map((t, i) => (
										<span key={i} className="badge">
											{t}
										</span>
									))}
								</div>
							) : null}
							<div className="text-xs text-zinc-400 mt-2">
								Items: {r.items?.length ?? 0}
							</div>
						</div>
					))}
			</div>
		</div>
	);
}
