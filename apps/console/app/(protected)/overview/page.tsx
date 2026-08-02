import { prisma } from "@homerepair/data";

const Overview = async () => {
    const companies = await prisma.company.findMany();

    return (
        <div>
            {companies.map((c) => {
                return <h1 key={c.id}>{c.name}</h1>;
            })}
        </div>
    );
};

export default Overview;
