"use client";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import IngredientForm from "../../../components/IngredientForm";
import useDebounce from "../../../lib/useDebounce";

export default function IngredientsPage() {
	const qc = useQueryClient();
	const [q, setQ] = useState("");
	const d = useDebounce(q, 250);
	const [showNew, setShowNew] = useState(false);

	const list = useQuery({
		queryKey: ["ingredients", d],
		queryFn: () => api(`/ingredients${d ? `?q=${encodeURIComponent(d)}` : ""}`),
	});

	const del = useMutation({
		mutationFn: (id) => api(`/ingredients/${id}`, { method: "DELETE" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["ingredients"] }),
	});

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Ingredients</div>
				<div className="flex gap-2">
					<input
						className="input w-64"
						placeholder="Search…"
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
					<div className="w-full max-w-2xl card p-4">
						<div className="flex items-center justify-between mb-3">
							<div className="text-base font-semibold">New ingredient</div>
							<button
								onClick={() => setShowNew(false)}
								className="text-zinc-500"
							>
								✕
							</button>
						</div>
						<IngredientForm onSuccess={() => setShowNew(false)} />
					</div>
				</div>
			)}

			<div className="grid gap-2">
				{list.isLoading && <div>Loading…</div>}
				{list.isError && (
					<div className="text-red-600">{String(list.error?.message)}</div>
				)}
				{Array.isArray(list.data) && list.data.length === 0 && (
					<div className="text-sm text-zinc-500">
						Список порожній. Додайте інгредієнт.
					</div>
				)}
				{Array.isArray(list.data) &&
					list.data.map((ing) => (
						<div
							key={ing._id}
							className="card p-3 flex items-center justify-between"
						>
							<div className="flex items-center gap-3">
								<div className="font-medium">{ing.name}</div>
								<span className="badge">{ing.unit}</span>
								<span className="text-xs text-zinc-500">{ing.category}</span>
							</div>
							<button
								className="text-red-500 text-sm"
								onClick={() => del.mutate(ing._id)}
							>
								Delete
							</button>
						</div>
					))}
			</div>
		</div>
	);
}
