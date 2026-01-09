import { prisma } from "@/lib/prisma";
import type { Prisma } from "./generated/prisma";
import { Customer, Simulation } from "./generated/prisma";
import { normalizePhoneNumber } from "@/lib/phone";

export type CustomerRecord = Customer & {
    spouseAge?: number | null;
    hasExistingBuilding?: boolean | null;
    hasLandBudget?: boolean | null;
    landBudget?: number | null;
    usesAdditionalInsulation?: boolean | null;
    simulations?: Simulation[];
};

export interface CustomerCreateInput {
    name: string;
    email?: string;
    phone?: string;
    postalCode?: string;
    baseAddress?: string;
    detailAddress?: string;
    age?: number;
    hasSpouse?: boolean;
    spouseName?: string;
    spouseAge?: number;
    ownIncome?: number;
    spouseIncome?: number;
    ownLoanPayment?: number;
    spouseLoanPayment?: number;
    downPayment?: number;
    wishMonthlyPayment?: number;
    wishPaymentYears?: number;
    usesBonus?: boolean;
    bonusPayment?: number;
    hasLand?: boolean;
    hasExistingBuilding?: boolean;
    hasLandBudget?: boolean;
    landBudget?: number;
    usesTechnostructure?: boolean;
    usesAdditionalInsulation?: boolean;
    inputMode?: "web" | "inperson";
    webCompleted?: boolean;
    inPersonCompleted?: boolean;
}

export interface CustomerUpdateInput {
    name?: string;
    email?: string;
    phone?: string | null;
    postalCode?: string;
    baseAddress?: string;
    detailAddress?: string;
    age?: number;
    hasSpouse?: boolean;
    spouseName?: string;
    spouseAge?: number;
    ownIncome?: number;
    spouseIncome?: number;
    ownLoanPayment?: number;
    spouseLoanPayment?: number;
    downPayment?: number;
    wishMonthlyPayment?: number;
    wishPaymentYears?: number;
    usesBonus?: boolean;
    bonusPayment?: number;
    hasLand?: boolean;
    hasExistingBuilding?: boolean;
    hasLandBudget?: boolean;
    landBudget?: number;
    usesTechnostructure?: boolean;
    usesAdditionalInsulation?: boolean;
    webCompleted?: boolean;
    inPersonCompleted?: boolean;
}

const normalizePhoneForStorage = (value?: string | null): string | null | undefined => {
    if (value === undefined) return undefined;
    const digits = normalizePhoneNumber(value ?? "");
    return digits ? digits : null;
};

// 顧客作成
export async function createCustomer(input: CustomerCreateInput): Promise<CustomerRecord> {
    return await prisma.customer.create({
        data: {
            name: input.name,
            email: input.email,
            phone: normalizePhoneForStorage(input.phone),
            postalCode: input.postalCode,
            baseAddress: input.baseAddress,
            detailAddress: input.detailAddress,
            age: input.age,
            hasSpouse: input.hasSpouse,
            spouseName: input.spouseName,
            spouseAge: input.spouseAge,
            ownIncome: input.ownIncome,
            spouseIncome: input.spouseIncome,
            ownLoanPayment: input.ownLoanPayment,
            spouseLoanPayment: input.spouseLoanPayment,
            downPayment: input.downPayment,
            wishMonthlyPayment: input.wishMonthlyPayment,
            wishPaymentYears: input.wishPaymentYears,
            usesBonus: input.usesBonus,
            bonusPayment: input.bonusPayment ?? 0,
            hasLand: input.hasLand,
            hasExistingBuilding: input.hasExistingBuilding,
            hasLandBudget: input.hasLandBudget,
            landBudget: input.landBudget,
            usesTechnostructure: input.usesTechnostructure,
            usesAdditionalInsulation: input.usesAdditionalInsulation,
            inputMode: input.inputMode || "web",
            webCompleted: input.webCompleted ?? (input.inputMode === "web"),
            inPersonCompleted: input.inPersonCompleted ?? false,
        },
    });
}

// 顧客更新
export async function updateCustomer(
    id: string,
    input: CustomerUpdateInput
): Promise<CustomerRecord> {
    const normalizedPhone = normalizePhoneForStorage(input.phone);
    const data: CustomerUpdateInput & { phone?: string | null } = {
        ...input,
        ...(normalizedPhone !== undefined ? { phone: normalizedPhone } : {}),
    };
    return await prisma.customer.update({
        where: { id },
        data,
    });
}

// ID で顧客取得
export async function getCustomerById(
    id: string,
    options?: { includeDeleted?: boolean }
): Promise<CustomerRecord | null> {
    const includeDeleted = options?.includeDeleted ?? false;
    return await prisma.customer.findFirst({
        where: {
            id,
            ...(includeDeleted ? {} : { deletedAt: null }),
        },
        include: {
            simulations: {
                orderBy: { createdAt: "desc" },
                take: 5,
            },
        },
    });
}

// 名前で顧客検索（対面入力用）
export async function findCustomersByName(name: string): Promise<CustomerRecord[]> {
    return await prisma.customer.findMany({
        where: {
            deletedAt: null,
            name: {
                contains: name,
                mode: "insensitive",
            },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
    });
}

// 名前・メールアドレスで顧客検索（対面入力用）
export async function findCustomersByNameOrEmail(query: string, limit = 5): Promise<CustomerRecord[]> {
    return await prisma.customer.findMany({
        where: {
            deletedAt: null,
            inPersonCompleted: false,
            OR: [
                {
                    name: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
                {
                    email: {
                        contains: query,
                        mode: "insensitive",
                    },
                },
            ],
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

// 最新の顧客を取得（デフォルト表示用）
export async function getRecentCustomers(limit: number = 5): Promise<CustomerRecord[]> {
    return await prisma.customer.findMany({
        where: {
            deletedAt: null,
            inPersonCompleted: false,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
    });
}

// 全顧客一覧取得（管理画面用）
export async function getAllCustomers(limit = 50, offset = 0): Promise<{
    customers: CustomerRecord[];
    total: number;
}> {
    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where: { deletedAt: null },
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                simulations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        }),
        prisma.customer.count({ where: { deletedAt: null } }),
    ]);

    return { customers, total };
}

// 管理画面用の顧客一覧（検索・ページング）
export async function getAdminCustomers(options?: {
    query?: string;
    limit?: number;
    offset?: number;
}): Promise<{ customers: CustomerRecord[]; total: number }> {
    const limit = options?.limit ?? 10;
    const offset = options?.offset ?? 0;
    const query = options?.query?.trim();
    const phoneQuery = query ? normalizePhoneNumber(query) : "";
    const orConditions: Prisma.CustomerWhereInput[] = [];

    if (query) {
        orConditions.push(
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } }
        );
    }
    if (phoneQuery) {
        orConditions.push({ phone: { contains: phoneQuery } });
    }

    const where: Prisma.CustomerWhereInput = orConditions.length
        ? { deletedAt: null, OR: orConditions }
        : { deletedAt: null };

    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where,
            orderBy: { createdAt: "desc" },
            take: limit,
            skip: offset,
        }),
        prisma.customer.count({ where }),
    ]);

    return { customers, total };
}

// 削除済み顧客一覧取得（管理画面用）
export async function getDeletedCustomers(limit = 50, offset = 0): Promise<{
    customers: CustomerRecord[];
    total: number;
}> {
    const [customers, total] = await Promise.all([
        prisma.customer.findMany({
            where: { deletedAt: { not: null } },
            orderBy: { deletedAt: "desc" },
            take: limit,
            skip: offset,
            include: {
                simulations: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        }),
        prisma.customer.count({ where: { deletedAt: { not: null } } }),
    ]);

    return { customers, total };
}

// 顧客削除
export async function deleteCustomer(id: string): Promise<void> {
    await prisma.customer.update({
        where: { id },
        data: { deletedAt: new Date() },
    });
}

// 顧客復元
export async function restoreCustomer(id: string): Promise<void> {
    await prisma.customer.update({
        where: { id },
        data: { deletedAt: null },
    });
}
