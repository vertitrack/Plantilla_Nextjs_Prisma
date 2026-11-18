import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "JustWork",
	description:
		"Copiloto de búsqueda de empleo con IA: evalúa vacantes, adapta tu CV y responde formularios.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="es"
			className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<body className="flex min-h-full flex-col">
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					{children}
					<Toaster richColors />
				</ThemeProvider>
			</body>
		</html>
	);
}
