import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/Dialog";

type OtpProps = {
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    username?: string;
    title?: string;
    description?: string;

    onVerify: (code: string) => Promise<void>;
    onResend: () => Promise<void>;
};

function Otp({
    open,
    setOpen,
    username,
    title = "Verify your email",
    description = "Enter the 6-digit OTP sent to your email.",
    onVerify,
    onResend,
}: OtpProps) {

    const [code, setCode] = useState("");

    const [loading, setLoading] = useState(false);

    const [resending, setResending] = useState(false);

    const [seconds, setSeconds] = useState(60);

    useEffect(() => {
        if (!open) return;

        setCode("");
        setSeconds(60);

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }

                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [open]);

    async function handleVerify(
        e: React.FormEvent<HTMLFormElement>
    ) {
        e.preventDefault();

        if (code.length !== 6) {
            toast.error("Enter a valid 6 digit OTP.");
            return;
        }

        setLoading(true);

        try {
            await onVerify(code);
        } finally {
            setLoading(false);
        }
    }

    async function handleResend() {
        setResending(true);

        try {
            await onResend();

            toast.success("OTP sent successfully.");

            setSeconds(60);
        } finally {
            setResending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md">

                <div className="space-y-2 mb-5">
                    <DialogTitle>
                        {title}
                    </DialogTitle>

                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </div>

                <div className="space-y-5">

                    {username && (
                        <p className="text-sm">
                            Hi <strong>{username}</strong>
                        </p>
                    )}

                    <form
                        onSubmit={handleVerify}
                        className="space-y-4"
                    >

                        <input
                            type="text"
                            value={code}
                            onChange={(e) =>
                                setCode(
                                    e.target.value.replace(/\D/g, "")
                                )
                            }
                            maxLength={6}
                            placeholder="Enter OTP"
                            className="w-full rounded-md border px-4 py-3 text-center text-2xl tracking-[10px] outline-none"
                        />

                        <button
                            type="submit"
                            disabled={loading || code.length !== 6}
                            className="flex w-full items-center justify-center rounded-md bg-black px-4 py-3 text-white disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Verify OTP"
                            )}
                        </button>

                    </form>

                    <div className="text-center">

                        {seconds > 0 ? (
                            <p className="text-sm text-gray-500">
                                Resend OTP in {seconds}s
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={resending}
                                className="text-sm font-medium text-blue-600 hover:underline"
                            >
                                {resending
                                    ? "Sending..."
                                    : "Resend OTP"}
                            </button>
                        )}

                    </div>

                </div>

            </DialogContent>
        </Dialog>
    );
}

export default Otp;