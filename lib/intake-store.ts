import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma";

export type ProjectType = "new" | "reform" | "warehouse";

export interface IntakeInsert {
    consent: boolean;
    customer_name: string;
    phone: string;
    email?: string;
    address?: string;
    annual_income?: number;
    budget_total?: number;
    project_type?: ProjectType;
    from?: string;
}

export interface IntakeListOptions {
    limit: number;
    cursor?: string;
}

export type IntakeRecord = Prisma.IntakeGetPayload<{
    select: {
        id: true;
        createdAt: true;
        updatedAt: true;
        consent: true;
        customerName: true;
        phone: true;
        email: true;
        address: true;
        annualIncome: true;
        budgetTotal: true;
        projectType: true;
        from: true;
        status: true;
        formVersion: true;
    };
}>;

export interface IntakeListResult {
    items: IntakeRecord[];
    nextCursor?: string;
}

export async function insertIntake(payload: IntakeInsert): Promise<IntakeRecord> {
    return prisma.intake.create({
        data: {
            consent: payload.consent,
            customerName: payload.customer_name,
            phone: payload.phone,
            email: payload.email,
            address: payload.address,
            annualIncome: payload.annual_income,
            budgetTotal: payload.budget_total,
            projectType: payload.project_type ?? undefined,
            from: payload.from,
            status: "new",
            formVersion: "v1",
        },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            consent: true,
            customerName: true,
            phone: true,
            email: true,
            address: true,
            annualIncome: true,
            budgetTotal: true,
            projectType: true,
            from: true,
            status: true,
            formVersion: true,
        },
    });
}

export async function listIntakes({ limit, cursor }: IntakeListOptions): Promise<IntakeListResult> {
    const pageSize = Math.max(1, Math.min(limit, 50));

    const items = await prisma.intake.findMany({
        take: pageSize + 1,
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: [
            { createdAt: "desc" },
            { id: "desc" },
        ],
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            consent: true,
            customerName: true,
            phone: true,
            email: true,
            address: true,
            annualIncome: true,
            budgetTotal: true,
            projectType: true,
            from: true,
            status: true,
            formVersion: true,
        },
    });

    let nextCursor: string | undefined;
    if (items.length > pageSize) {
        const nextItem = items.pop();
        nextCursor = nextItem?.id;
    }

    return {
        items,
        nextCursor,
    };
}

export async function findIntake(id: string): Promise<IntakeRecord | null> {
    return prisma.intake.findUnique({
        where: { id },
        select: {
            id: true,
            createdAt: true,
            updatedAt: true,
            consent: true,
            customerName: true,
            phone: true,
            email: true,
            address: true,
            annualIncome: true,
            budgetTotal: true,
            projectType: true,
            from: true,
            status: true,
            formVersion: true,
        },
    });
}
