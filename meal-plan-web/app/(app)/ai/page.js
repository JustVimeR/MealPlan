"use client";

import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../../../lib/api";
import { Sparkles, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function normalizeAI(text) {
	if (!text) return "";
	let t = text;

	t = t.replace(/(\*\*[^\*]+\*\*)\s*(?=\*|\-)/g, "$1\n");

	t = t.replace(/\s\*\s/g, "\n- ").replace(/^\*\s/gm, "- ");

	t = t.replace(/\n\s{2,}-\s/g, "\n- ");

	t = t.replace(/\. \*/g, ".\n- ");

	return t.trim();
}

function Bubble({ role, children }) {
	const mine = role === "user";
	return (
		<div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm
          ${
						mine
							? "bg-zinc-900 text-white rounded-tr-sm"
							: "bg-white border border-zinc-200 rounded-tl-sm"
					}
          prose prose-zinc prose-p:my-2 prose-ul:my-2 prose-li:my-0 prose-ol:my-2
          prose-headings:mt-3 prose-headings:mb-1 prose-strong:font-semibold
          ${mine ? "prose-invert" : ""}
        `}
			>
				<ReactMarkdown
					remarkPlugins={[remarkGfm]}
					components={{
						// робимо списки компактними
						ul: (props) => (
							<ul {...props} className="list-disc pl-5 space-y-1" />
						),
						ol: (props) => (
							<ol {...props} className="list-decimal pl-5 space-y-1" />
						),
						li: (props) => <li {...props} className="leading-normal" />,
						p: (props) => <p {...props} className="leading-normal" />,
					}}
				>
					{typeof children === "string" ? normalizeAI(children) : children}
				</ReactMarkdown>
			</div>
		</div>
	);
}

export default function AiChatPage() {
	const [messages, setMessages] = useState([
		{
			role: "assistant",
			content:
				"Привіт! Я допоможу спланувати тиждень, підібрати рецепти, порахувати калорії та скласти список покупок. Про що поговоримо?",
		},
	]);
	const [input, setInput] = useState("");
	const listRef = useRef(null);

	const ask = useMutation({
		mutationFn: (payload) => api("/ai/chat", { method: "POST", body: payload }),
		onSuccess: (res) => {
			setMessages((m) => [...m, { role: "assistant", content: res.text }]);
		},
	});

	useEffect(() => {
		listRef.current?.scrollTo({
			top: listRef.current.scrollHeight,
			behavior: "smooth",
		});
	}, [messages, ask.isPending]);

	const onSend = async () => {
		const text = input.trim();
		if (!text) return;
		const next = [...messages, { role: "user", content: text }];
		setMessages(next);
		setInput("");
		await ask.mutateAsync({ messages: next });
	};

	return (
		<div className="grid gap-4">
			<div className="flex items-center gap-2">
				<div className="h-7 w-7 rounded-xl bg-zinc-900 text-white grid place-items-center">
					<Sparkles className="h-4 w-4" />
				</div>
				<h1 className="text-lg font-semibold">AI Chat</h1>
			</div>

			<div className="card p-0 overflow-hidden">
				<div
					ref={listRef}
					className="h-[60dvh] overflow-y-auto p-4 space-y-3 bg-zinc-50"
				>
					{messages.map((m, i) => (
						<Bubble key={i} role={m.role}>
							{m.content}
						</Bubble>
					))}
					{ask.isPending ? <Bubble role="assistant">Думаю…</Bubble> : null}
				</div>

				{ask.isError && (
					<div className="border-t border-zinc-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
						{String(ask.error?.message || "AI is temporarily unavailable.")}
					</div>
				)}

				<div className="border-t border-zinc-200 p-2">
					<div className="flex items-center gap-2">
						<input
							className="input flex-1 h-10 text-sm"
							placeholder="Запитайте про рецепти, меню чи калорії…"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && onSend()}
						/>
						<button
							className="btn btn-primary h-10 px-3"
							onClick={onSend}
							disabled={ask.isPending || !input.trim()}
						>
							<Send className="h-4 w-4" />
						</button>
					</div>
				</div>
			</div>

			{/* підказки */}
			<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{[
					"Заплануй тиждень на 2200 ккал/день",
					"Підібрати 3 швидких вечері до 30 хв",
					"Зроби список покупок з моїх рецептів на 4 порції",
				].map((t, i) => (
					<button
						key={i}
						onClick={() => setInput(t)}
						className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left text-sm hover:bg-zinc-50"
					>
						{t}
					</button>
				))}
			</div>
		</div>
	);
}
