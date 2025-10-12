"use client";

export default function RecipeCard({ recipe, actions, compact = false }) {
	const minutes = recipe.minutes ?? null;
	const servings = recipe.servings ?? null;
	const tags = Array.isArray(recipe.tags) ? recipe.tags : [];

	return (
		<div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-start justify-between gap-4">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<h3 className="text-base font-semibold truncate">{recipe.title}</h3>
						{recipe.isPublic ? (
							<span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 border border-emerald-200">
								Public
							</span>
						) : null}
					</div>
					<div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-zinc-600">
						{minutes != null && <span>⏱ {minutes} min</span>}
						{servings != null && <span>🍽 {servings} servings</span>}
					</div>
				</div>
				{actions}
			</div>

			{!compact && (
				<>
					{tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-2">
							{tags.map((t) => (
								<span
									key={t}
									className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs text-zinc-700"
								>
									#{t}
								</span>
							))}
						</div>
					)}
					{"items" in recipe &&
						Array.isArray(recipe.items) &&
						recipe.items.length > 0 && (
							<div className="mt-3 text-xs text-zinc-500 line-clamp-2">
								{recipe.items
									.slice(0, 4)
									.map((i) =>
										typeof i === "string" ? i : i.name ?? i.ingredientName ?? ""
									)
									.filter(Boolean)
									.join(" • ")}
								{recipe.items.length > 4 ? "…" : ""}
							</div>
						)}
				</>
			)}
		</div>
	);
}
