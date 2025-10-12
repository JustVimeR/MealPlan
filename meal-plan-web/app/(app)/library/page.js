"use client";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import RecipeCard from "../../../components/RecipeCard";

export default function PublicLibraryPage() {
	const qc = useQueryClient();
	const [q, setQ] = useState("");

	const queryKey = useMemo(() => ["public-recipes", q], [q]);

	const recipes = useQuery({
		queryKey,
		queryFn: () =>
			api(`/recipes/public${q ? `?q=${encodeURIComponent(q)}` : ""}`),
	});

	const fork = useMutation({
		mutationFn: (id) => api(`/recipes/${id}/fork`, { method: "POST" }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["recipes"] });
			alert("Recipe forked into your library!");
		},
	});

	// ввічливий пошук: затримка 300мс
	useEffect(() => {
		const t = setTimeout(() => {
			qc.invalidateQueries({ queryKey });
		}, 300);
		return () => clearTimeout(t);
	}, [q, qc]); // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Public Library</div>
				<a className="btn" href="/recipes">
					My Recipes
				</a>
			</div>

			<div className="flex items-center gap-2">
				<input
					className="input w-full"
					placeholder="Search public recipes…"
					value={q}
					onChange={(e) => setQ(e.target.value)}
				/>
			</div>

			{recipes.isLoading && <div>Loading…</div>}
			{recipes.isError && (
				<div className="text-red-600">{String(recipes.error?.message)}</div>
			)}

			{recipes.data && recipes.data.length === 0 && (
				<div className="text-sm text-zinc-500">No public recipes yet.</div>
			)}

			{recipes.data && recipes.data.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{recipes.data.map((r) => (
						<RecipeCard
							key={r._id}
							recipe={r}
							actions={
								<button
									className="btn btn-primary"
									onClick={() => fork.mutate(r._id)}
									disabled={fork.isPending}
								>
									Fork
								</button>
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}
