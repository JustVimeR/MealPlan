const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";

export async function api(path, { method = "GET", body, headers } = {}) {
	const res = await fetch(`${API_BASE}${path}`, {
		method,
		headers: {
			"Content-Type": "application/json",
			...(headers || {}),
		},
		body: body ? JSON.stringify(body) : undefined,
		next: { revalidate: 0 },
	});
	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`API ${method} ${path} failed: ${res.status} ${text}`);
	}
	return res.json();
}
