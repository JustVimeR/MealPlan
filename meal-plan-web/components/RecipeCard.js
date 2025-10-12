"use client";

export default function RecipeCard({
	recipe,
	onPublish,
	onUnpublish,
	onDelete,
}) {
	const r = recipe;
	const kcal = r?.nutritionPerServing?.kcal;

	return (
		<div className="card p-4 flex flex-col gap-3">
			{/* Заголовок */}
			<div>
				<div className="text-base font-medium leading-snug line-clamp-2 break-words">
					{r.title}
				</div>

				{/* Рядок бейджів — окремо від заголовка, щоб нічого не перекривати */}
				<div className="mt-1 flex flex-wrap items-center gap-2">
					{r.isPublic && (
						<span className="rounded-full bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5">
							Published
						</span>
					)}
					{typeof kcal === "number" && (
						<span className="rounded-full bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5">
							{Math.round(kcal)} kcal/serv
						</span>
					)}
					{r.minutes ? (
						<span className="rounded-full bg-zinc-100 text-zinc-700 text-xs px-2 py-0.5">
							{r.minutes} min
						</span>
					) : null}
					<span className="text-xs text-zinc-500">
						Servings: {r.servings ?? "—"}
					</span>
				</div>
			</div>

			{/* Теги */}
			<div className="text-xs text-zinc-500 line-clamp-2">
				{r.tags?.length ? r.tags.join(" · ") : "No tags"}
			</div>

			{/* Дії */}
			<div className="mt-1 flex flex-wrap items-center gap-2">
				{r.isPublic ? (
					<button className="btn btn-ghost" onClick={() => onUnpublish(r._id)}>
						Unpublish
					</button>
				) : (
					<button className="btn btn-ghost" onClick={() => onPublish(r._id)}>
						Publish
					</button>
				)}
				<button
					className="btn btn-ghost text-red-600"
					onClick={() => onDelete(r._id)}
				>
					Delete
				</button>
			</div>
		</div>
	);
}
