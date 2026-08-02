import { type User } from "@homerepair/data";

export default async function ConsoleHome() {
    let users: User[] = [];
    let dbError: string | null = null;

    return (
        <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
            <h1>Console</h1>
            {dbError ? (
                <p>{dbError}</p>
            ) : (
                <ul>
                    {users.map((u) => (
                        <li key={u.id}>{u.email}</li>
                    ))}
                </ul>
            )}
        </main>
    );
}
