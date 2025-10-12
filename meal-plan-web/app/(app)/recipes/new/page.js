"use client";
import { useRouter } from "next/navigation";
import RecipeForm from "../../../../components/RecipeForm";

export default function NewRecipePage() {
	const router = useRouter();

	return (
		<div className="grid gap-4">
			<div className="flex items-center justify-between">
				<h1 className="text-lg font-semibold">Add Recipe</h1>
				<button className="btn" onClick={() => router.push("/recipes")}>
					Back
				</button>
			</div>

			<div className="card p-4">
				<RecipeForm onSuccess={() => router.push("/recipes")} />
			</div>
		</div>
	);
}
