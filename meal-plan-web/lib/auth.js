export function getToken() {
	if (typeof window === "undefined") return null;
	return localStorage.getItem("mp_token");
}
export function setToken(token) {
	if (typeof window === "undefined") return;
	if (token) localStorage.setItem("mp_token", token);
	else localStorage.removeItem("mp_token");
}
