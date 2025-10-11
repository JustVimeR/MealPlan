"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { DAYS, MEALS, startOfWeekISO } from "../../../lib/week";
import RecipeQuickPick from "../../../components/RecipeQuickPick";
import Link from "next/link";

export default function PlannerPage() {
	const qc = useQueryClient();
	const [week, setWeek] = useState(startOfWeekISO());
	const plan = useQuery({
		queryKey: ["meal-plan", week],
		queryFn: () => api(`/meal-plans/${week}`),
	});

	const save = useMutation({
		mutationFn: (days) =>
			api(`/meal-plans/${week}`, { method: "PUT", body: { days } }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-plan", week] }),
	});

	const gen = useMutation({
		mutationFn: () =>
			api(`/shopping-lists/${week}/generate`, { method: "POST" }),
	});

	const [editing, setEditing] = useState(null);
	const [servingsDraft, setServingsDraft] = useState(2);

	const days = useMemo(() => plan.data?.days ?? Array(7).fill({}), [plan.data]);

	function setSlot(dayIdx, meal, recipe) {
		const next = days.map((d, i) =>
			i === dayIdx
				? {
						...d,
						[meal]: {
							recipeId: recipe._id,
							servings: servingsDraft || (recipe.servings ?? 2),
						},
				  }
				: d
		);
		save.mutate(next);
		setEditing(null);
	}
	function clearSlot(dayIdx, meal) {
		const { [meal]: _, ...rest } = days[dayIdx] || {};
		const next = days.map((d, i) => (i === dayIdx ? rest : d));
		save.mutate(next);
	}

	function shiftWeek(delta) {
		const d = new Date(week);
		d.setDate(d.getDate() + delta * 7);
		setWeek(d.toISOString().slice(0, 10));
	}

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Planner</div>
				<div className="flex items-center gap-2">
					<button className="btn btn-ghost" onClick={() => shiftWeek(-1)}>
						← Prev
					</button>
					<div className="px-3 py-2 border rounded">{week}</div>
					<button className="btn btn-ghost" onClick={() => shiftWeek(1)}>
						Next →
					</button>
					<Link
						href={`/shopping-list?week=${week}`}
						className="btn btn-primary"
					>
						Open shopping list
					</Link>
					<button
						className="btn btn-primary"
						onClick={() => gen.mutate()}
						disabled={gen.isPending}
					>
						{gen.isPending ? "Generating…" : "Generate list"}
					</button>
				</div>
			</div>

			<div className="overflow-x-auto">
				<table className="w-full border-separate border-spacing-2">
					<thead>
						<tr>
							<th className="w-24 text-left text-sm text-zinc-500">Day</th>
							{MEALS.map((m) => (
								<th
									key={m}
									className="text-left text-sm text-zinc-500 capitalize"
								>
									{m}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{DAYS.map((d, di) => (
							<tr key={d}>
								<td className="text-sm font-medium">{d}</td>
								{MEALS.map((m) => {
									const slot = days?.[di]?.[m];
									return (
										<td key={`${di}:${m}`}>
											<div className="card p-2 min-h-20">
												{slot ? (
													<div className="flex items-start justify-between gap-3">
														<div className="text-sm break-words">
															<span className="block text-zinc-500 capitalize">
																{m}
															</span>
															<span className="font-medium">
																{slot.title ?? ""}
															</span>
															<span className="text-xs text-zinc-500 block">
																servings: {slot.servings}
															</span>
														</div>
														<button
															className="text-red-500 text-sm"
															onClick={() => clearSlot(di, m)}
														>
															✕
														</button>
													</div>
												) : (
													<button
														className="text-sm text-zinc-500"
														onClick={() => {
															setEditing({ dayIdx: di, meal: m });
															setServingsDraft(2);
														}}
													>
														+ Add {m}
													</button>
												)}
											</div>
										</td>
									);
								})}
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{editing && (
				<div
					className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
					onMouseDown={() => setEditing(null)}
				>
					<div
						className="w-full max-w-xl"
						onMouseDown={(e) => e.stopPropagation()}
					>
						<div className="card p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="text-base font-semibold">
									Select recipe ({DAYS[editing.dayIdx]} / {editing.meal})
								</div>
								<button
									className="text-zinc-500"
									onClick={() => setEditing(null)}
								>
									✕
								</button>
							</div>
							<div className="mb-2">
								<label className="text-sm">Servings</label>
								<input
									className="input mt-1 w-28"
									type="number"
									value={servingsDraft}
									onChange={(e) =>
										setServingsDraft(Number(e.target.value || 2))
									}
								/>
							</div>
							<RecipeQuickPick
								onSelect={(r) => setSlot(editing.dayIdx, editing.meal, r)}
							/>
							<div className="text-xs text-zinc-500 mt-2">
								Порада: додай рецепти на сторінці{" "}
								<a className="underline" href="/recipes">
									Recipes
								</a>
							</div>
						</div>
					</div>
				</div>
			)}

			{save.isError && (
				<div className="text-sm text-red-600">
					Save error: {String(save.error?.message)}
				</div>
			)}
			{plan.isError && (
				<div className="text-sm text-red-600">
					Load error: {String(plan.error?.message)}
				</div>
			)}
		</div>
	);
}
