"use client";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import IngredientPicker from "./IngredientPicker";
import IngredientForm from "./IngredientForm";

export default function RecipeForm({ onClose }) {
	const qc = useQueryClient();
	const [title, setTitle] = useState("");
	const [minutes, setMinutes] = useState("");
	const [servings, setServings] = useState("2");
	const [tags, setTags] = useState("");
	const [items, setItems] = useState([
		{ ingredient: null, qty: "", unit: "g" },
	]);
	const [showNewIng, setShowNewIng] = useState(false);

	const create = useMutation({
		mutationFn: (payload) => api("/recipes", { method: "POST", body: payload }),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["recipes"] });
			onClose?.();
		},
	});

	function addItem() {
		setItems((prev) => [...prev, { ingredient: null, qty: "", unit: "g" }]);
	}
	function patchItem(i, patch) {
		setItems((prev) =>
			prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it))
		);
	}
	function removeItem(i) {
		setItems((prev) => prev.filter((_, idx) => idx !== i));
	}

	return (
		<div className="card p-4">
			<div className="text-base font-semibold mb-3">New recipe</div>

			<div className="grid gap-3">
				<div>
					<label className="text-sm">Title</label>
					<input
						className="input mt-1"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
						placeholder="Tomato Pasta"
					/>
				</div>

				<div className="grid grid-cols-3 gap-3">
					<div>
						<label className="text-sm">Minutes</label>
						<input
							className="input mt-1"
							type="number"
							value={minutes}
							onChange={(e) => setMinutes(e.target.value)}
							placeholder="20"
						/>
					</div>
					<div>
						<label className="text-sm">Servings</label>
						<input
							className="input mt-1"
							type="number"
							value={servings}
							onChange={(e) => setServings(e.target.value)}
							placeholder="2"
						/>
					</div>
					<div>
						<label className="text-sm">Tags (comma)</label>
						<input
							className="input mt-1"
							value={tags}
							onChange={(e) => setTags(e.target.value)}
							placeholder="quick, dinner"
						/>
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between mb-2">
						<div className="text-sm font-medium">Items</div>
						<button className="btn btn-ghost" onClick={addItem}>
							+ add
						</button>
						<div className="flex gap-2">
							<button className="btn btn-ghost" onClick={addItem}>
								+ add line
							</button>
							<button
								className="btn btn-ghost"
								onClick={() => setShowNewIng(true)}
							>
								+ new ingredient
							</button>
						</div>
					</div>

					<div className="grid gap-2">
						{items.map((it, i) => (
							<div key={i} className="grid grid-cols-12 gap-2">
								<div className="col-span-6">
									<IngredientPicker
										value={it.ingredient}
										onChange={(ing) =>
											patchItem(i, {
												ingredient: ing,
												unit: ing?.unit || it.unit,
											})
										}
									/>
								</div>
								<input
									className="input col-span-3"
									placeholder="qty"
									type="number"
									value={it.qty}
									onChange={(e) => patchItem(i, { qty: e.target.value })}
								/>
								<select
									className="input col-span-2"
									value={it.unit}
									onChange={(e) => patchItem(i, { unit: e.target.value })}
								>
									<option value="g">g</option>
									<option value="ml">ml</option>
									<option value="pcs">pcs</option>
								</select>
								<button
									className="col-span-1 text-red-500"
									onClick={() => removeItem(i)}
								>
									✕
								</button>
							</div>
						))}
					</div>
				</div>

				<div className="flex gap-2">
					<button
						className="btn btn-primary"
						onClick={() =>
							create.mutate({
								title,
								minutes: minutes ? Number(minutes) : undefined,
								servings: servings ? Number(servings) : 2,
								tags: tags
									? tags
											.split(",")
											.map((s) => s.trim())
											.filter(Boolean)
									: [],
								items: items
									.filter((it) => it.ingredient?._id && it.qty && it.unit)
									.map((it) => ({
										ingredientId: it.ingredient._id,
										qty: Number(it.qty),
										unit: it.unit,
									})),
							})
						}
						disabled={create.isPending || !title}
					>
						{create.isPending ? "Saving..." : "Save"}
					</button>
					<button className="btn btn-ghost" onClick={onClose}>
						Cancel
					</button>
				</div>

				{create.isError && (
					<div className="text-sm text-red-600">
						{String(create.error?.message || "Error")}
					</div>
				)}

				{showNewIng && (
					<div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
						<div className="w-full max-w-2xl card p-4">
							<div className="flex items-center justify-between mb-3">
								<div className="text-base font-semibold">New ingredient</div>
								<button
									onClick={() => setShowNewIng(false)}
									className="text-zinc-500"
								>
									✕
								</button>
							</div>
							<IngredientForm onSuccess={() => setShowNewIng(false)} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
