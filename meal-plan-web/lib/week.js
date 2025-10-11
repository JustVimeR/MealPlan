export function startOfWeekISO(date = new Date()) {
	const d = new Date(date);
	const day = (d.getDay() + 6) % 7; // 0=Mon
	d.setDate(d.getDate() - day);
	d.setHours(0, 0, 0, 0);
	return d.toISOString().slice(0, 10);
}
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const MEALS = ["breakfast", "lunch", "dinner", "snack"];
