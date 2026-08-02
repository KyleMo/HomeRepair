"use client";
import Script from "next/script";

export default function PortalPreview() {
    return (
        <main style={{ padding: "2rem", fontFamily: "system-ui" }}>
            <h1>Portal Preview</h1>
            <div>
                <button
                    onClick={() => {
                        if (window && (window as any).homerepair) {
                            (window as any).homerepair.open();
                        }
                    }}
                >
                    Show
                </button>
            </div>
            <div>
                <Script
                    src="http://localhost:3001/loader.js"
                    data-client-id="abc123"
                    defer
                />
                <div id="homerepair-portal"></div>
            </div>
        </main>
    );
}
