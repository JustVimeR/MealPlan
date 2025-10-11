export default function Home() {
	return (
		<div className="card p-6">
			<div className="text-lg font-semibold mb-1">
				Ласкаво просимо до MealPlan
			</div>
			<p className="text-sm text-zinc-600">
				Перейдіть до розділу Recipes, щоб додати перші рецепти.
			</p>
			<a href="/recipes" className="btn btn-primary inline-block mt-4">
				Go to Recipes
			</a>
		</div>
	);
}
