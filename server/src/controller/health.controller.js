export const healthCheck = (req, res) => {
    res.status(200).json({
        status: "okay",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
};