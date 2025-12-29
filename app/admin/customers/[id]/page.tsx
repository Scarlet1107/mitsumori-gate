import { notFound } from "next/navigation";
import { getCustomerById } from "@/lib/customer-store";
import { AdminCustomerDetail } from "./CustomerDetailClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const customer = await getCustomerById(id, { includeDeleted: true });

    if (!customer) {
        notFound();
    }

    const serializedCustomer = {
        ...customer,
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString(),
        deletedAt: customer.deletedAt ? customer.deletedAt.toISOString() : null,
        simulations: customer.simulations?.map(sim => ({
            id: sim.id,
            createdAt: sim.createdAt.toISOString(),
            wishLoanAmount: sim.wishLoanAmount,
            totalBudget: sim.totalBudget,
        })),
    };

    return <AdminCustomerDetail customer={serializedCustomer} />;
}
