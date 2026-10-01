import { withOrgAccess } from "@/lib/api";
import { NextResponse } from "next/server";

export const GET = withOrgAccess(async (_request) => {
    try {
        return NextResponse.json({
            data: "ok",
        });
    } catch (error) {
        return NextResponse.json(
            { error },
            {
                status: 500,
            },
        );
    }
});
