import { NextResponse } from "next/server";
import { readJson, serverError, withAuth } from "@/lib/http";
import { deleteApplication, toId, updateApplication } from "@/lib/repository";

const notFound = () =>
	NextResponse.json({ error: "Postulación no encontrada" }, { status: 404 });

export const PATCH = withAuth(
	async (request: Request, ctx: RouteContext<"/api/applications/[id]">) => {
		try {
			const id = toId((await ctx.params).id);
			if (!id) return notFound();
			const application = await updateApplication(id, await readJson(request));
			return application ? NextResponse.json({ application }) : notFound();
		} catch (error) {
			return serverError(
				"PATCH /api/applications/[id]",
				error,
				"Error al actualizar postulación",
			);
		}
	},
);

export const DELETE = withAuth(
	async (_request: Request, ctx: RouteContext<"/api/applications/[id]">) => {
		try {
			const { id: rawId } = await ctx.params;
			const id = toId(rawId);
			if (!id) return notFound();
			await deleteApplication(id);
			return NextResponse.json({ success: true, id });
		} catch (error) {
			return serverError(
				"DELETE /api/applications/[id]",
				error,
				"Error al eliminar postulación",
			);
		}
	},
);
