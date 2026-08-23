import mongoose from 'mongoose';

export const getTransactionSession = async () => {
    try {
        const isMasterResult = await mongoose.connection.db.command({ isMaster: 1 });
        const supportsTransactions = !!isMasterResult.setName;
        if (supportsTransactions) {
            const session = await mongoose.startSession();
            return session;
        }
    } catch (e) {
        console.warn("Could not check replica set status, falling back to session-less mode:", e.message);
    }
    return null;
};
