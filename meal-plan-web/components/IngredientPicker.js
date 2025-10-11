"use client";
import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import useDebounce from "../lib/useDebounce";

export default function IngredientPicker({
	value,
	onChange,
	placeholder = "Search ingredient…",
}) {
	// value: { _id, name, unit, category } | null
	const [q, setQ] = useState("");
	const debounced = useDebounce(q, 250);
	const [open, setOpen] = useState(false);
	const boxRef = useRef(null);

	const results = useQuery({
		queryKey: ["ingredients", debounced],
		queryFn: () =>
			api(
				`/ingredients${debounced ? `?q=${encodeURIComponent(debounced)}` : ""}`
			),
		staleTime: 15_000,
	});

	return (
		<div className="relative" ref={boxRef}>
			<div className="flex gap-2">
				<input
					className="input flex-1"
					placeholder={value?.name || placeholder}
					value={q}
					onChange={(e) => {
						setQ(e.target.value);
						setOpen(true);
					}}
					onFocus={() => setOpen(true)}
				/>
				{value && (
					<span className="px-2 text-xs rounded bg-zinc-100 border">
						{value.unit}
					</span>
				)}
				{value && (
					<button className="btn btn-ghost" onClick={() => onChange(null)}>
						Clear
					</button>
				)}
			</div>

			{open && (
				<div
					className="absolute z-50 mt-2 w-full max-h-72 overflow-auto rounded-lg border bg-white shadow"
					onMouseDown={(e) => e.preventDefault()} // не втрачати фокус при кліку
				>
					{results.isLoading && <div className="p-3 text-sm">Loading…</div>}
					{results.isError && (
						<div className="p-3 text-sm text-red-600">Error</div>
					)}
					{Array.isArray(results.data) && results.data.length === 0 && (
						<div className="p-3 text-sm text-zinc-500">Нічого не знайдено</div>
					)}
					{Array.isArray(results.data) &&
						results.data.map((it) => (
							<button
								key={it._id}
								className="block w-full text-left px-3 py-2 hover:bg-zinc-50"
								onClick={() => {
									onChange(it);
									setQ("");
									setOpen(false);
								}}
								title={it.category}
							>
								<div className="text-sm">{it.name}</div>
								<div className="text-xs text-zinc-500">
									{it.unit} · {it.category}
								</div>
							</button>
						))}
				</div>
			)}
		</div>
	);
}
