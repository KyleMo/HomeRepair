"use client";
import { Session } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useContext } from "react";
import { OrganizationContext } from "./components/providers/OrganizationProvider";

export type ValidatedSession = Session & {
    user: {
        first_name: string;
        last_name: string;
        email: string;
        image?: string | null;
    };
};

export const useValidatedSession = (): ValidatedSession => {
    const session = useSession({
        required: true,
        onUnauthenticated() {
            redirect("/auth/log-in");
        },
    });

    if (session.status === "loading") {
        throw new Promise<void>(() => {});
    }

    const { user } = session.data;

    if (!user.email || !user.first_name) {
        redirect("/auth/log-in");
    }

    return {
        ...session.data,
        user: {
            ...user,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
    };
};

export const useOrganizations = () => {
    return useContext(OrganizationContext);
};
