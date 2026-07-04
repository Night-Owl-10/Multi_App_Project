import { AuthenticateWithRedirectCallback } from "@clerk/react";

function SsoCallback() {
    return <AuthenticateWithRedirectCallback />;
}

export default SsoCallback;