export default function AuthLayout({ children }) {
	return (
		<div className="min-h-dvh  text-zinc-900">
			<main className="mx-auto max-w-screen-sm px-4 py-10">{children}</main>
		</div>
	);
}
