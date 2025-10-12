import Link from "next/link";
import {
	Utensils,
	CalendarDays,
	ShoppingCart,
	Carrot,
	Sparkles,
	ArrowRight,
	BookOpen,
} from "lucide-react";

export const metadata = { title: "MealPlan — Home" };

export default function Home() {
	return (
		<div className="space-y-12">
			{/* HERO */}
			<section className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-gradient-to-br from-white via-zinc-50 to-zinc-100 p-8 lg:p-12">
				<div className="max-w-3xl">
					<div className="inline-flex items-center gap-2 rounded-full bg-zinc-900 text-white px-3 py-1 text-xs">
						<Sparkles className="h-3.5 w-3.5" />
						<span>Плануй харчування без хаосу</span>
					</div>

					<h1 className="mt-4 text-3xl lg:text-4xl font-semibold tracking-tight">
						Ласкаво просимо до{" "}
						<span className="underline decoration-zinc-400/50">MealPlan</span>
					</h1>
					<p className="mt-3 text-zinc-600">
						Збирай рецепти, плануй тиждень і отримуй автоматичний список
						покупок. Менше рутини — більше смачних рішень для буднів.
					</p>

					<div className="mt-6 flex flex-wrap gap-3">
						<Link
							href="/recipes"
							className="btn btn-primary inline-flex items-center gap-2"
						>
							Додати рецепти <ArrowRight className="h-4 w-4" />
						</Link>
						<Link
							href="/planner"
							className="btn btn-ghost inline-flex items-center gap-2"
						>
							Відкрити Planner
						</Link>
					</div>
				</div>

				{/* декор */}
				<div className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-zinc-200/40 blur-3xl" />
			</section>

			{/* FEATURES */}
			<section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mx-8">
				<div className="card p-5">
					<div className="flex items-center gap-3">
						<Utensils className="h-5 w-5" />
						<h3 className="font-medium">Рецепти під рукою</h3>
					</div>
					<p className="mt-2 text-sm text-zinc-600">
						Зберігай власні рецепти або форкай з публічної бібліотеки. Теги,
						порції, інгредієнти — все структуровано.
					</p>
					<Link
						href="/recipes"
						className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
					>
						До рецептів <ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				<div className="card p-5">
					<div className="flex items-center gap-3">
						<CalendarDays className="h-5 w-5" />
						<h3 className="font-medium">Тижневий план</h3>
					</div>
					<p className="mt-2 text-sm text-zinc-600">
						Розкладай сніданок/обід/вечерю по днях. Контролюй калорії на порцію
						і загалом.
					</p>
					<Link
						href="/planner"
						className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
					>
						Відкрити Planner <ArrowRight className="h-4 w-4" />
					</Link>
				</div>

				<div className="card p-5">
					<div className="flex items-center gap-3">
						<ShoppingCart className="h-5 w-5" />
						<h3 className="font-medium">Авто-шопінг-лист</h3>
					</div>
					<p className="mt-2 text-sm text-zinc-600">
						Генеруй список покупок з урахуванням порцій та категорій. Відмічай
						покупки з телефону.
					</p>
					<Link
						href="/shopping-list"
						className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
					>
						Перейти до списку <ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</section>

			{/* HOW IT WORKS */}
			<section className="rounded-2xl border border-zinc-200 bg-white p-6 lg:p-8">
				<h2 className="text-lg font-semibold">Як це працює</h2>
				<div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<div className="rounded-xl border border-zinc-200 p-4">
						<div className="text-xs text-zinc-500">Крок 1</div>
						<div className="mt-1 font-medium">Додай інгредієнти</div>
						<p className="mt-1 text-sm text-zinc-600">
							Створюй власні або обирай з пошуку. Категорії допомагають при
							покупках.
						</p>
						<Link
							href="/ingredients"
							className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
						>
							Ingredients <Carrot className="h-4 w-4" />
						</Link>
					</div>
					<div className="rounded-xl border border-zinc-200 p-4">
						<div className="text-xs text-zinc-500">Крок 2</div>
						<div className="mt-1 font-medium">Збери рецепт</div>
						<p className="mt-1 text-sm text-zinc-600">
							Вкажи порції, час, та отримай харчову цінність на порцію.
						</p>
						<Link
							href="/recipes"
							className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
						>
							Recipes <Utensils className="h-4 w-4" />
						</Link>
					</div>
					<div className="rounded-xl border border-zinc-200 p-4">
						<div className="text-xs text-zinc-500">Крок 3</div>
						<div className="mt-1 font-medium">Сплануй тиждень</div>
						<p className="mt-1 text-sm text-zinc-600">
							Перетягуй страви у слоти: сніданок, обід, вечеря, перекуси.
						</p>
						<Link
							href="/planner"
							className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
						>
							Planner <CalendarDays className="h-4 w-4" />
						</Link>
					</div>
					<div className="rounded-xl border border-zinc-200 p-4">
						<div className="text-xs text-zinc-500">Крок 4</div>
						<div className="mt-1 font-medium">Отримай список</div>
						<p className="mt-1 text-sm text-zinc-600">
							Натисни “Generate shopping list” і вирушай за покупками.
						</p>
						<Link
							href="/shopping-list"
							className="mt-2 inline-flex items-center gap-2 text-sm text-zinc-900 hover:underline"
						>
							Shopping list <ShoppingCart className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* PUBLIC LIBRARY CTA */}
			<section className="mx-8 rounded-2xl border border-zinc-200 bg-zinc-900 text-white p-6 lg:p-8">
				<div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 text-sm text-zinc-300">
							<BookOpen className="h-4 w-4" />
							Публічна бібліотека
						</div>
						<h3 className="mt-1 text-xl font-semibold">
							Надихайся готовими ідеями
						</h3>
						<p className="mt-1 text-sm text-zinc-300">
							Переглядай публічні рецепти спільноти та форкай собі в один клік.
						</p>
					</div>
					<Link
						href="/library"
						className="inline-flex items-center gap-2 rounded-xl bg-white text-zinc-900 px-4 py-2 text-sm hover:bg-zinc-100"
					>
						Відкрити Library <ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			</section>
		</div>
	);
}
