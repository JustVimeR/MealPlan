"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { useState } from "react";

function Card({ children }) {
	return <div className="card p-4 flex flex-col gap-2">{children}</div>;
}

export default function LibraryPage() {
	const qc = useQueryClient();
	const [q, setQ] = useState("");

	const me = useQuery({ queryKey: ["me"], queryFn: () => api("/users/me") });

	const list = useQuery({
		queryKey: ["public", q],
		queryFn: () =>
			api(`/recipes/public${q ? `?q=${encodeURIComponent(q)}` : ""}`),
	});

	const fork = useMutation({
		mutationFn: (id) => api(`/recipes/${id}/fork`, { method: "POST" }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["recipes"] }),
	});

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold">Public Library</h1>
				<div className="flex items-center gap-2">
					<input
						className="input"
						placeholder="Search…"
						value={q}
						onChange={(e) => setQ(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{(list.data ?? []).map((r) => {
					const isMine = me.data && String(me.data._id) === String(r.ownerId);
					return (
						<Card key={r._id}>
							<div className="flex items-start justify-between gap-2">
								<div className="font-medium">{r.title}</div>
								<div className="flex items-center gap-2">
									{isMine ? (
										<span className="text-xs rounded-full px-2 py-0.5 bg-zinc-900 text-white">
											My
										</span>
									) : null}
								</div>
							</div>
							<div className="text-xs text-zinc-500">
								{r.tags?.length ? r.tags.join(" · ") : "No tags"}
							</div>

							<div className="mt-2 flex items-center justify-between">
								<div className="text-xs text-zinc-500">
									Servings: {r.servings ?? "—"}
								</div>

								{/* 🔒 Ховаємо Fork для своїх рецептів */}
								{isMine ? (
									<button
										className="btn btn-ghost"
										disabled
										title="This is your recipe"
									>
										It’s mine
									</button>
								) : (
									<button
										className="btn btn-primary"
										onClick={() => fork.mutate(r._id)}
										disabled={fork.isPending}
									>
										Fork
									</button>
								)}
							</div>
						</Card>
					);
				})}
			</div>
		</div>
	);
}
