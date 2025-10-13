import { NextResponse } from "next/server";
import { intakeSchema, IntakePayload } from "@/lib/validation";
import { insertIntake } from "@/lib/intake-store";

const ERROR_MAP: Record<string, { code: string; status: number }> = {
    consent_required: { code: "BAD_REQUEST", status: 400 },
    customer_name_required: { code: "BAD_REQUEST", status: 400 },
    phone_required: { code: "BAD_REQUEST", status: 400 },
    phone_invalid: { code: "BAD_REQUEST", status: 400 },
    email_invalid: { code: "BAD_REQUEST", status: 400 },
    address_required: { code: "BAD_REQUEST", status: 400 },
    number_invalid: { code: "BAD_REQUEST", status: 400 },
    project_type_invalid: { code: "BAD_REQUEST", status: 400 },
};

function mapErrorMessage(message: string) {
    return ERROR_MAP[message] ?? { code: "BAD_REQUEST", status: 400 };
}

function sanitize(payload: IntakePayload) {
    return {
        ...payload,
        annual_income:
            typeof payload.annual_income === "number"
                ? payload.annual_income
                : undefined,
        budget_total:
            typeof payload.budget_total === "number"
                ? payload.budget_total
                : undefined,
    };
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const parsed = intakeSchema.safeParse(json);

        if (!parsed.success) {
            const issue = parsed.error.issues[0];
            const { code, status } = mapErrorMessage(issue.message);
            return NextResponse.json(
                { error: { code, message: issue.message } },
                { status, headers: { "Cache-Control": "no-store" } }
            );
        }

        const sanitized = sanitize(parsed.data);
        const record = await insertIntake(sanitized);

        return NextResponse.json(
            {
                id: record.id,
                status: record.status,
                created_at: record.createdAt.toISOString(),
            },
            { headers: { "Cache-Control": "no-store" } }
        );
    } catch (error) {
        console.error("POST /api/intakes failed", error);
        return NextResponse.json(
            { error: { code: "INTERNAL", message: "internal_error" } },
            { status: 500, headers: { "Cache-Control": "no-store" } }
        );
    }
}
