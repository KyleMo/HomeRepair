"use client";
import {
    Button,
    CircularProgress,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

type Credentials = { email: string; password: string };

type UserData = {
    name: string;
    email: string;
    type: string[];
    orgId?: string;
};

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const [credentials, setCredentials] = useState<Credentials>({
        email: "",
        password: "",
    });

    const router = useRouter();

    const handleChange = (key: keyof Credentials, value: string) => {
        setError(undefined);
        setCredentials((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSignIn = async () => {
        try {
            if (credentials.email === "" || credentials.password === "") {
                return;
            }

            setLoading(true);
            const res = await signIn("credentials", {
                email: credentials.email,
                password: credentials.password,
                redirect: false,
            });
            console.log(res);
            setLoading(false);

            if (!res || !res.ok) {
                setError("Incorrect email or password.");
                return;
            }
        } catch (error) {
            console.log(error);
        }
    };

    // useEffect(() => {
    //     if (session.data?.user) {
    //         const user = session.data.user as UserData;
    //         const type = user.type;
    //         const orgId = user.orgId;
    //     }
    // }, [session.data]);

    return (
        <div
            style={{
                width: "100%",
                height: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    padding: 3,
                    margin: 3,
                    maxWidth: 300,
                    width: "100%",
                }}
            >
                <Stack useFlexGap spacing={2}>
                    <TextField
                        value={credentials.email}
                        size="small"
                        label="Email"
                        onChange={(e) => handleChange("email", e.target.value)}
                    />
                    <TextField
                        value={credentials.password}
                        label="Password"
                        size="small"
                        onChange={(e) =>
                            handleChange("password", e.target.value)
                        }
                        type="password"
                    />
                    {loading ? (
                        <CircularProgress size={18} />
                    ) : (
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={handleSignIn}
                            disabled={!!error}
                            sx={{ color: "white" }}
                        >
                            Sign In
                        </Button>
                    )}
                    {error && (
                        <Typography sx={{ color: "red" }}>{error}</Typography>
                    )}
                </Stack>
            </Paper>
        </div>
    );
};

export default Login;
