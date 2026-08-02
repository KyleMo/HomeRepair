"use client";

import { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { PropsWithChildren } from "react";

const UserSessionProvider = (
    props: PropsWithChildren & { session: Session },
) => {
    return (
        <SessionProvider session={props.session}>
            {props.children}
        </SessionProvider>
    );
};

export default UserSessionProvider;
