"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { api } from "../../../lib/api";
import RecipeCard from "../../../components/RecipeCard";
import { useMemo } from "react";

export default function RecipesPage() {
	const qc = useQueryClient();
	const sp = useSearchParams();
	const q = (sp.get("q") || "").toLowerCase();

	const recipes = useQuery({
		queryKey: ["recipes"],
		queryFn: () => api("/recipes"),
	});

	const publish = useMutation({
		mutationFn: (id) => api(`/recipes/${id}/publish`, { method: "POST" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
	});

	const unpublish = useMutation({
		mutationFn: (id) => api(`/recipes/${id}/unpublish`, { method: "POST" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
	});

	const remove = useMutation({
		mutationFn: (id) => api(`/recipes/${id}`, { method: "DELETE" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
	});

	const list = useMemo(() => {
		const arr = recipes.data ?? [];
		if (!q) return arr;
		return arr.filter((r) => {
			const title = (r.title || "").toLowerCase();
			const tags = Array.isArray(r.tags) ? r.tags.join(" ").toLowerCase() : "";
			return title.includes(q) || tags.includes(q);
		});
	}, [recipes.data, q]);

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold">My recipes</h1>
				<a className="btn btn-primary" href="/recipes/new">
					New recipe
				</a>
			</div>

			{q ? (
				<div className="text-sm text-zinc-500">
					Пошук: <span className="font-medium text-zinc-900">{q}</span> •
					Знайдено: {list.length}
				</div>
			) : null}

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{list.map((r) => (
					<RecipeCard
						key={r._id}
						recipe={r}
						onPublish={(id) => publish.mutate(id)}
						onUnpublish={(id) => unpublish.mutate(id)}
						onDelete={(id) => remove.mutate(id)}
					/>
				))}
			</div>
		</div>
	);
}
