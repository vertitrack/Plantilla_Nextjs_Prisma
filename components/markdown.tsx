import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

/** Renderiza Markdown generado por la IA con estilos sobrios. */
export function Markdown({
	children,
	className,
}: {
	children: string;
	className?: string;
}) {
	return (
		<div className={cn("markdown text-sm leading-relaxed", className)}>
			<ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
		</div>
	);
}
