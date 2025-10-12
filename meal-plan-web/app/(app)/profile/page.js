"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { setToken } from "../../../lib/auth";

export default function ProfilePage() {
	const qc = useQueryClient();
	const me = useQuery({ queryKey: ["me"], queryFn: () => api("/users/me") });
	const update = useMutation({
		mutationFn: (body) => api("/users/me", { method: "PATCH", body }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["me"] }),
	});

	if (me.isLoading) return <div>Loading…</div>;
	if (me.isError)
		return (
			<div className="card p-6">
				<div className="text-red-600">You must be logged in.</div>
				<a className="btn btn-primary mt-3" href="/login">
					Go to Login
				</a>
			</div>
		);

	const u = me.data;
	let dn = u.displayName ?? "";
	let ct = u.calorieTarget ?? "";

	return (
		<div className="max-w-md">
			<div className="card p-6">
				<div className="text-lg font-semibold mb-3">Profile</div>
				<div className="text-sm text-zinc-500 mb-4">{u.email}</div>

				<label className="text-sm">Display name</label>
				<input
					className="input mb-3"
					defaultValue={u.displayName ?? ""}
					onBlur={(e) => (dn = e.target.value)}
				/>

				<label className="text-sm">Calorie target (kcal/day)</label>
				<input
					className="input mb-4"
					type="number"
					defaultValue={u.calorieTarget ?? ""}
					onBlur={(e) => (ct = Number(e.target.value || 0))}
				/>

				<div className="flex gap-2">
					<button
						className="btn btn-primary"
						onClick={() =>
							update.mutate({ displayName: dn, calorieTarget: ct })
						}
					>
						Save
					</button>
					<button
						className="btn btn-ghost"
						onClick={() => {
							setToken(null);
							window.location.href = "/login";
						}}
					>
						Logout
					</button>
				</div>
			</div>
		</div>
	);
}
