"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import RecipeCard from "../../../components/RecipeCard";

export default function RecipesPage() {
	const qc = useQueryClient();

	const recipes = useQuery({
		queryKey: ["recipes", "withNutrition"],
		queryFn: () => api("/recipes?withNutrition=1"),
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

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">My Recipes</div>
				<div className="flex items-center gap-2">
					<a className="btn" href="/library">
						Public Library
					</a>
					<a className="btn btn-primary" href="/recipes/new">
						Add recipe
					</a>
				</div>
			</div>

			{recipes.isLoading && <div>Loading…</div>}
			{recipes.isError && (
				<div className="text-red-600">{String(recipes.error?.message)}</div>
			)}

			{recipes.data && recipes.data.length === 0 && (
				<div className="text-sm text-zinc-500">
					No recipes yet. Create your first one!
				</div>
			)}

			{recipes.data && recipes.data.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
					{recipes.data.map((r) => (
						<RecipeCard
							key={r._id}
							recipe={r}
							actions={
								<div className="flex items-center gap-2">
									{r.nutritionPerServing && (
										<span className="text-xs text-zinc-600">
											{Math.round(r.nutritionPerServing.kcal)} kcal/serv
										</span>
									)}

									{r.isPublic ? (
										<button
											className="btn btn-ghost"
											onClick={() => unpublish.mutate(r._id)}
											disabled={unpublish.isPending}
											title="Unpublish"
										>
											Unpublish
										</button>
									) : (
										<button
											className="btn btn-ghost"
											onClick={() => publish.mutate(r._id)}
											disabled={publish.isPending}
											title="Publish"
										>
											Publish
										</button>
									)}
									<button
										className="btn btn-ghost text-red-600"
										onClick={() => remove.mutate(r._id)}
										disabled={remove.isPending}
										title="Delete"
									>
										Delete
									</button>
								</div>
							}
						/>
					))}
				</div>
			)}
		</div>
	);
}
