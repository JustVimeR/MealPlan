"use client";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { startOfWeekISO } from "../../../lib/week";
import { CAT_ORDER } from "../../../lib/categories";

function useQueryParam(name, fallback) {
	const params =
		typeof window !== "undefined"
			? new URLSearchParams(window.location.search)
			: null;
	return params?.get(name) || fallback;
}

export default function ShoppingListPage() {
	const qc = useQueryClient();
	const week = useQueryParam("week", startOfWeekISO());
	const [hideChecked, setHideChecked] = useState(false);

	const list = useQuery({
		queryKey: ["shopping-list", week],
		queryFn: () => api(`/shopping-lists/${week}`),
	});

	const patch = useMutation({
		mutationFn: ({ itemId, body }) =>
			api(`/shopping-lists/${week}/items/${itemId}`, { method: "PATCH", body }),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["shopping-list", week] }),
	});

	const clear = useMutation({
		mutationFn: () =>
			api(`/shopping-lists/${week}/clear-checked`, { method: "POST" }),
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: ["shopping-list", week] }),
	});

	const grouped = useMemo(() => {
		const data = list.data?.items ?? [];
		const filtered = hideChecked ? data.filter((i) => !i.checked) : data;

		// group by category
		const map = new Map();
		for (const it of filtered) {
			const cat = (it.ingredient?.category || "other").toLowerCase();
			if (!map.has(cat)) map.set(cat, []);
			map.get(cat).push(it);
		}

		// order categories
		const cats = Array.from(map.keys());
		cats.sort((a, b) => {
			const ia = CAT_ORDER.indexOf(a);
			const ib = CAT_ORDER.indexOf(b);
			if (ia !== -1 && ib !== -1) return ia - ib;
			if (ia !== -1) return -1;
			if (ib !== -1) return 1;
			return a.localeCompare(b);
		});

		// sort inside category by name
		const result = cats.map((cat) => {
			const items = map
				.get(cat)
				.slice()
				.sort((a, b) => {
					const an =
						a.ingredientName ?? a.ingredient?.name ?? String(a.ingredientId);
					const bn =
						b.ingredientName ?? b.ingredient?.name ?? String(b.ingredientId);
					return an.localeCompare(bn);
				});
			return { cat, items };
		});

		return result;
	}, [list.data, hideChecked]);

	return (
		<div className="grid gap-4">
			{/* Toolbar */}
			<div className="flex items-center justify-between no-print">
				<div className="text-lg font-semibold">Shopping list</div>
				<div className="flex items-center gap-2">
					<div className="px-3 py-2 border rounded">{week}</div>
					<label className="flex items-center gap-2 text-sm">
						<input
							type="checkbox"
							checked={hideChecked}
							onChange={(e) => setHideChecked(e.target.checked)}
						/>
						Hide checked
					</label>
					<button className="btn btn-ghost" onClick={() => window.print()}>
						Print
					</button>
					<button
						className="btn btn-primary"
						onClick={() => clear.mutate()}
						disabled={clear.isPending}
					>
						Clear checked
					</button>
				</div>
			</div>

			{list.isLoading && <div>Loading…</div>}
			{list.isError && (
				<div className="text-red-600">{String(list.error?.message)}</div>
			)}

			{list.data && (
				<>
					{/* Empty state */}
					{(!list.data.items || list.data.items.length === 0) && (
						<div className="text-sm text-zinc-500">
							Список порожній. Згенеруйте його в Planner.
						</div>
					)}

					{/* Grouped view */}
					<div className="print-columns">
						{grouped.map((group) => (
							<div
								key={group.cat}
								className="print-group mb-4 break-inside-avoid"
							>
								<h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-600 mb-1">
									{group.cat}
								</h3>
								<div className="grid gap-2">
									{group.items.map((it, index) => {
										const name =
											it.ingredientName ??
											it.ingredient?.name ??
											String(it.ingredientId);
										return (
											<div
												key={it._id ?? `${group.cat}-${index}`}
												className="card p-2 flex items-center justify-between print-item"
											>
												<div className="flex items-center gap-3">
													<input
														type="checkbox"
														checked={!!it.checked}
														onChange={(e) =>
															patch.mutate({
																itemId: String(it._id),
																body: { checked: e.target.checked, index },
															})
														}
													/>
													<div>
														<div className="font-medium leading-tight">
															{name}
														</div>
														{it.note ? (
															<div className="text-xs text-zinc-500">
																{it.note}
															</div>
														) : null}
													</div>
												</div>
												<div className="text-sm text-zinc-700 print-qty">
													{it.totalQty} {it.unit}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	);
}
