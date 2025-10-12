import "./globals.css";
import QueryProvider from "../components/QueryProvider";
import Nav from "../components/Nav";
import Link from "next/link";

export const metadata = {
	title: "MealPlan",
	description: "Планувальник харчування",
};

export default function RootLayout({ children }) {
	return (
		<html lang="uk">
			<body>
				<QueryProvider>
					<header className="border-b bg-white">
						<div className="mx-auto container-1100 flex items-center justify-between px-4 py-3">
							<Link className="font-semibold" href="/">
								MealPlan
							</Link>
							<Nav />
						</div>
					</header>
					<main className="container-1100 py-6">{children}</main>
				</QueryProvider>
			</body>
		</html>
	);
}
