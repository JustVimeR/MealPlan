import "./globals.css";
import QueryProvider from "../components/QueryProvider";

export const metadata = {
	title: "MealPlan",
	description: "Планувальник харчування",
};

export default function RootLayout({ children }) {
	return (
		<html lang="uk">
			<body>
				<QueryProvider>
					<header className="border-b">
						<div className="container-1100 flex items-center justify-between py-3">
							<div className="font-semibold">🥗 MealPlan</div>
							<nav className="flex gap-3 text-sm">
								<a className="hover:underline" href="/recipes">
									Recipes
								</a>
								<a className="hover:underline" href="/ingredients">
									Ingredients
								</a>
								<span className="text-zinc-300">|</span>
								<a
									className="hover:underline opacity-60 pointer-events-none"
									title="soon"
								>
									Planner
								</a>
								<a
									className="hover:underline opacity-60 pointer-events-none"
									title="soon"
								>
									Shopping list
								</a>
							</nav>
						</div>
					</header>
					<main className="container-1100 py-6">{children}</main>
				</QueryProvider>
			</body>
		</html>
	);
}
