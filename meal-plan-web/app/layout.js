import "./globals.css";
import QueryProvider from "../components/QueryProvider";
import { Suspense } from "react";

export const metadata = {
	title: "MealPlan",
	description: "Планувальник харчування",
};

export default function RootLayout({ children }) {
	return (
		<html lang="uk">
			<body className="min-h-dvh bg-zinc-50 text-zinc-900">
				<QueryProvider>
					<Suspense fallback={<div className="min-h-dvh" />}>
						{children}
					</Suspense>
				</QueryProvider>
			</body>
		</html>
	);
}
