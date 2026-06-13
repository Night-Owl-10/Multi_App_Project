import Task from "../Model/taskModel";

export const clerkWebhook = async (req: any, res: any) => {
    try {
        console.log("Webhook received");
        const event = req.body;

        if (event.type === "user.deleted") {
            const clerkUserId = event.data.id;

            await Task.deleteMany({
                clerkId: clerkUserId
            });

            console.log(`Deleted tasks for ${clerkUserId}`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Webhook processing failed"
        });
    }
};