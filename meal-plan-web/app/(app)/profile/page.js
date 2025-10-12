"use client";
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";

const TAGS = [
	"vegan",
	"vegetarian",
	"pescetarian",
	"keto",
	"halal",
	"kosher",
	"gluten-free",
	"dairy-free",
];

const ALLERGENS = [
	"gluten",
	"peanut",
	"tree-nut",
	"soy",
	"egg",
	"milk",
	"fish",
	"shellfish",
	"sesame",
];

function Chip({ active, onClick, children }) {
	return (
		<button
			type="button"
			onClick={onClick}
			className={`rounded-xl px-3 py-1 text-sm border transition ${
				active
					? "bg-zinc-900 text-white border-zinc-900"
					: "bg-white border-zinc-200 hover:bg-zinc-50"
			}`}
		>
			{children}
		</button>
	);
}

export default function ProfilePage() {
	const qc = useQueryClient();
	const me = useQuery({ queryKey: ["me"], queryFn: () => api("/users/me") });

	const [state, setState] = useState({
		displayName: "",
		avatarUrl: "",
		calorieTarget: 0,
		protein: 0,
		fat: 0,
		carb: 0,
		units: "metric",
		weekStart: "monday",
		theme: "system",
		dietary: [],
		allergens: [],
	});

	useEffect(() => {
		if (!me.data) return;
		setState((s) => ({
			...s,
			displayName: me.data.displayName ?? "",
			avatarUrl: me.data.avatarUrl ?? "",
			calorieTarget: me.data.calorieTarget ?? 0,
			protein: me.data.macroTargets?.protein ?? 0,
			fat: me.data.macroTargets?.fat ?? 0,
			carb: me.data.macroTargets?.carb ?? 0,
			units: me.data.preferences?.units ?? "metric",
			weekStart: me.data.preferences?.weekStart ?? "monday",
			theme: me.data.preferences?.theme ?? "system",
			dietary: me.data.preferences?.dietary ?? [],
			allergens: me.data.preferences?.allergens ?? [],
		}));
	}, [me.data]);

	const save = useMutation({
		mutationFn: () => api("/users/me", { method: "PATCH", body: state }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
	});

	const kcalFromMacros = useMemo(() => {
		// 4 kcal/g для P і C, 9 kcal/g для F
		return Math.round(state.protein * 4 + state.carb * 4 + state.fat * 9);
	}, [state.protein, state.carb, state.fat]);

	const syncMacrosWithCalories = () => {
		// просте авто-розбиття: 30/30/40 (P/F/C) від calorieTarget
		const kcal = Math.max(0, Number(state.calorieTarget) || 0);
		setState((s) => ({
			...s,
			protein: Math.round((kcal * 0.3) / 4),
			fat: Math.round((kcal * 0.3) / 9),
			carb: Math.round((kcal * 0.4) / 4),
		}));
	};

	const toggleIn = (key, val) => {
		setState((s) => {
			const arr = new Set(s[key]);
			if (arr.has(val)) arr.delete(val);
			else arr.add(val);
			return { ...s, [key]: Array.from(arr) };
		});
	};

	return (
		<div className="grid gap-6">
			<div className="flex items-center justify-between">
				<div className="text-lg font-semibold">Profile</div>
				<button
					className="btn btn-primary"
					disabled={save.isPending}
					onClick={() => save.mutate()}
				>
					Save
				</button>
			</div>

			{/* Header card */}
			<div className="card p-4 flex items-center gap-4">
				<img
					src={
						state.avatarUrl ||
						`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
							state.displayName || (me.data?.email ?? "U")
						)}`
					}
					alt=""
					className="h-16 w-16 rounded-2xl border border-zinc-200 object-cover bg-white"
				/>
				<div className="grid gap-2 flex-1">
					<div className="grid sm:grid-cols-2 gap-2">
						<div>
							<div className="text-xs text-zinc-500 mb-1">Display name</div>
							<input
								className="input"
								value={state.displayName}
								onChange={(e) =>
									setState({ ...state, displayName: e.target.value })
								}
							/>
						</div>
						<div>
							<div className="text-xs text-zinc-500 mb-1">Avatar URL</div>
							<input
								className="input"
								placeholder="https://…"
								value={state.avatarUrl}
								onChange={(e) =>
									setState({ ...state, avatarUrl: e.target.value })
								}
							/>
						</div>
					</div>
					<div className="text-xs text-zinc-500">{me.data?.email}</div>
				</div>
			</div>

			{/* Goals */}
			<div className="card p-4">
				<div className="font-medium mb-3">Nutrition goals</div>
				<div className="grid sm:grid-cols-4 gap-3">
					<div>
						<div className="text-xs text-zinc-500 mb-1">Daily calories</div>
						<div className="flex gap-2">
							<input
								type="number"
								className="input"
								value={state.calorieTarget}
								onChange={(e) =>
									setState({
										...state,
										calorieTarget: Number(e.target.value || 0),
									})
								}
							/>
							<button
								className="btn"
								onClick={syncMacrosWithCalories}
								title="Split calories into macros"
							>
								Auto
							</button>
						</div>
					</div>
					<div>
						<div className="text-xs text-zinc-500 mb-1">Protein (g)</div>
						<input
							type="number"
							className="input"
							value={state.protein}
							onChange={(e) =>
								setState({ ...state, protein: Number(e.target.value || 0) })
							}
						/>
					</div>
					<div>
						<div className="text-xs text-zinc-500 mb-1">Fat (g)</div>
						<input
							type="number"
							className="input"
							value={state.fat}
							onChange={(e) =>
								setState({ ...state, fat: Number(e.target.value || 0) })
							}
						/>
					</div>
					<div>
						<div className="text-xs text-zinc-500 mb-1">Carbs (g)</div>
						<input
							type="number"
							className="input"
							value={state.carb}
							onChange={(e) =>
								setState({ ...state, carb: Number(e.target.value || 0) })
							}
						/>
					</div>
				</div>
				<div className="mt-2 text-xs text-zinc-600">
					From macros: <span className="font-medium">{kcalFromMacros}</span>{" "}
					kcal/day
				</div>
			</div>

			{/* Preferences */}
			<div className="card p-4 grid gap-4">
				<div className="font-medium">Preferences</div>
				<div className="grid sm:grid-cols-3 gap-3">
					<div>
						<div className="text-xs text-zinc-500 mb-1">Units</div>
						<select
							className="input"
							value={state.units}
							onChange={(e) => setState({ ...state, units: e.target.value })}
						>
							<option value="metric">Metric (g, ml)</option>
							<option value="imperial">Imperial (oz, fl oz)</option>
						</select>
					</div>
					<div>
						<div className="text-xs text-zinc-500 mb-1">Week starts</div>
						<select
							className="input"
							value={state.weekStart}
							onChange={(e) =>
								setState({ ...state, weekStart: e.target.value })
							}
						>
							<option value="monday">Monday</option>
							<option value="sunday">Sunday</option>
						</select>
					</div>
					<div>
						<div className="text-xs text-zinc-500 mb-1">Theme</div>
						<select
							className="input"
							value={state.theme}
							onChange={(e) => setState({ ...state, theme: e.target.value })}
						>
							<option value="system">System</option>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</div>
				</div>
			</div>

			{/* Dietary */}
			<div className="card p-4 grid gap-3">
				<div className="font-medium">Dietary preferences</div>
				<div className="flex flex-wrap gap-2">
					{TAGS.map((t) => (
						<Chip
							key={t}
							active={state.dietary.includes(t)}
							onClick={() => toggleIn("dietary", t)}
						>
							{t}
						</Chip>
					))}
				</div>
			</div>

			{/* Allergens */}
			<div className="card p-4 grid gap-3">
				<div className="font-medium">Allergens</div>
				<div className="flex flex-wrap gap-2">
					{ALLERGENS.map((t) => (
						<Chip
							key={t}
							active={state.allergens.includes(t)}
							onClick={() => toggleIn("allergens", t)}
						>
							{t}
						</Chip>
					))}
				</div>
			</div>
		</div>
	);
}
