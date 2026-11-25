import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// Icono para "Añadir a pantalla de inicio" en iOS (requiere PNG).
export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#171717",
			}}
		>
			<svg
				width="110"
				height="110"
				viewBox="0 0 24 24"
				fill="none"
				stroke="#fafafa"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				<path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
				<rect width="20" height="14" x="2" y="6" rx="2" />
			</svg>
		</div>,
		size,
	);
}
