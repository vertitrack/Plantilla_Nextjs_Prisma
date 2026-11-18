import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	experimental: {
		serverActions: {
			// Permite subir CVs en PDF (el límite por defecto es 1 MB).
			bodySizeLimit: "10mb",
		},
	},
};

export default nextConfig;
