"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "../lib/api";
import { CAT_ORDER } from "../lib/categories";

export default function IngredientForm({ onSuccess, compact = false }) {
	const qc = useQueryClient();
	const [name, setName] = useState("");
	const [unit, setUnit] = useState("g");
	const [category, setCategory] = useState("other");
	const [kcal, setKcal] = useState("");
	const [p, setP] = useState("");
	const [f, setF] = useState("");
	const [c, setC] = useState("");

	const create = useMutation({
		mutationFn: () =>
			api("/ingredients", {
				method: "POST",
				body: {
					name,
					unit,
					category,
					kcalPer100: kcal ? Number(kcal) : undefined,
					proteinPer100: p ? Number(p) : undefined,
					fatPer100: f ? Number(f) : undefined,
					carbPer100: c ? Number(c) : undefined,
				},
			}),
		onSuccess: (data) => {
			qc.invalidateQueries({ queryKey: ["ingredients"] });
			onSuccess?.(data);
			setName("");
			setUnit("g");
			setCategory("other");
			setKcal("");
			setP("");
			setF("");
			setC("");
		},
	});

	const Form = (
		<div className={compact ? "" : "card p-4"}>
			{!compact && (
				<div className="text-base font-semibold mb-3">New ingredient</div>
			)}
			<div className="grid gap-3">
				<div>
					<label className="text-sm">Name</label>
					<input
						className="input mt-1"
						value={name}
						onChange={(e) => setName(e.target.value)}
						placeholder="Tomato"
					/>
				</div>
				<div className="grid grid-cols-3 gap-3">
					<div>
						<label className="text-sm">Unit</label>
						<select
							className="input mt-1"
							value={unit}
							onChange={(e) => setUnit(e.target.value)}
						>
							<option value="g">g</option>
							<option value="ml">ml</option>
							<option value="pcs">pcs</option>
						</select>
					</div>
					<div className="col-span-2">
						<label className="text-sm">Category</label>
						<select
							className="input mt-1"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
						>
							{CAT_ORDER.map((cat) => (
								<option key={cat} value={cat}>
									{cat}
								</option>
							))}
							+{" "}
						</select>
					</div>
				</div>
				<div className="grid grid-cols-4 gap-3">
					<div>
						<label className="text-sm">kcal/100</label>
						<input
							className="input mt-1"
							type="number"
							value={kcal}
							onChange={(e) => setKcal(e.target.value)}
						/>
					</div>
					<div>
						<label className="text-sm">P/100</label>
						<input
							className="input mt-1"
							type="number"
							value={p}
							onChange={(e) => setP(e.target.value)}
						/>
					</div>
					<div>
						<label className="text-sm">F/100</label>
						<input
							className="input mt-1"
							type="number"
							value={f}
							onChange={(e) => setF(e.target.value)}
						/>
					</div>
					<div>
						<label className="text-sm">C/100</label>
						<input
							className="input mt-1"
							type="number"
							value={c}
							onChange={(e) => setC(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex gap-2">
					<button
						className="btn btn-primary"
						disabled={!name || create.isPending}
						onClick={() => create.mutate()}
					>
						{create.isPending ? "Saving..." : "Save"}
					</button>
				</div>
				{create.isError && (
					<div className="text-sm text-red-600">
						{String(create.error?.message || "Error")}
					</div>
				)}
			</div>
		</div>
	);

	return Form;
}
