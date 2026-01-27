export const healthCheck = (req,res) => {
    res.status(200).json({
        status: 'Ok',
        message: 'Server is healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
};