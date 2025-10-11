"use client";
import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { startOfWeekISO } from "../../../lib/week";

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

	const data = list.data;

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Shopping list</div>
				<div className="flex items-center gap-2">
					<div className="px-3 py-2 border rounded">{week}</div>
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

			{data && (
				<div className="grid gap-2">
					{data.items?.length === 0 && (
						<div className="text-sm text-zinc-500">
							Список порожній. Згенеруйте його в Planner.
						</div>
					)}

					{data.items?.map((it) => (
						<div
							key={it._id}
							className="card p-3 flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<input
									type="checkbox"
									checked={!!it.checked}
									onChange={(e) =>
										patch.mutate({
											itemId: it._id,
											body: { checked: e.target.checked },
										})
									}
								/>
								<div className="font-medium">{it.ingredientId}</div>
								<div className="text-sm text-zinc-600">
									{it.totalQty} {it.unit}
								</div>
							</div>
							<input
								className="input w-60"
								placeholder="note…"
								defaultValue={it.note}
								onBlur={(e) =>
									patch.mutate({
										itemId: it._id,
										body: { note: e.target.value },
									})
								}
							/>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
