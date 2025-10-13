import { NextResponse } from "next/server";
import { findIntake } from "@/lib/intake-store";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const record = await findIntake(params.id);

    if (!record) {
        return NextResponse.json(
            { error: { code: "NOT_FOUND", message: "intake_not_found" } },
            { status: 404, headers: { "Cache-Control": "no-store" } }
        );
    }

    const payload = {
        id: record.id,
        created_at: record.createdAt.toISOString(),
        updated_at: record.updatedAt.toISOString(),
        consent: record.consent,
        customer_name: record.customerName,
        phone: record.phone,
        email: record.email,
        address: record.address,
        annual_income: record.annualIncome,
        budget_total: record.budgetTotal,
        project_type: record.projectType,
        from: record.from,
        status: record.status,
        form_version: record.formVersion,
    };

    return NextResponse.json(payload, {
        headers: { "Cache-Control": "no-store" },
    });
}
