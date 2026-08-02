/**
 * Embeddable portal loader.
 *
 * Clients embed:
 *
 *   <script src="https://portal.example.com/loader.js"
 *           data-client-id="abc123" defer></script>
 *   <div id="homerepair-portal"></div>
 *
 * It finds the mount point and injects the portal iframe.
 *
 * This file is the source of truth. Run `pnpm build:loader` to regenerate the
 * minified `public/loader.js` that clients actually load.
 */

interface ResizeMessage {
    type: "portal:resize";
    height: number;
}

const iframeId = "homerepair-portal-iframe";

class HomeRepair {
    open() {
        const iframe = document.getElementById(iframeId);
        if (!iframe) {
            console.error(`Failed to find iframe with ID: ${iframeId}`);
            return;
        }
        if (iframe.style.visibility === "hidden") {
            iframe.style.visibility = "visible";
            iframe.style.zIndex = "9999";
        } else {
            iframe.style.visibility = "hidden";
            iframe.style.zIndex = "0";
        }
    }
}

(window as any).homerepair = new HomeRepair();

(function () {
    const script = document.currentScript as HTMLScriptElement | null;
    const clientId = script && script.getAttribute("data-client-id");
    if (!script || !clientId) {
        console.error("[portal] missing data-client-id attribute");
        return;
    }

    const origin = new URL(script.src).origin;

    function mount(): void {
        const container = document.getElementById("homerepair-portal");
        if (!container) {
            console.error(
                "[portal] no element with id 'homerepair-portal' found",
            );
            return;
        }

        const iframe = document.createElement("iframe");
        iframe.id = "homerepair-portal-iframe";
        iframe.src = origin + "/?clientId=" + encodeURIComponent(clientId!);
        iframe.style.border = "0";
        iframe.style.width = "100vw";
        iframe.style.height = "100%";
        iframe.style.position = "fixed";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.right = "0";
        iframe.style.left = "0";
        iframe.style.visibility = "hidden";
        iframe.style.zIndex = "0";

        iframe.setAttribute("title", "Customer Portal");
        container.appendChild(iframe);

        // //Let the iframe request height changes via postMessage.
        // window.addEventListener("message", function (event: MessageEvent) {
        //     if (event.origin !== origin) return;
        //     if (isResizeMessage(event.data)) {
        //         iframe.style.height = event.data.height + "px";
        //     }
        // });

        window.addEventListener("message", (event: MessageEvent) => {
            if (event.origin !== origin) return;
            if (event.data === "close") (window as any).homerepair.open();
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", mount);
    } else {
        mount();
    }
})();
