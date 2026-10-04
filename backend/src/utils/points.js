import UserPoints from "../models/UserPoints.js";

export async function addPoints(userId, amount, description = '', refId = null, refModel = null) {
  if (!userId || amount <= 0) return null;
  return UserPoints.findOneAndUpdate(
    { user: userId },
    {
      $inc:  { balance: amount, totalEarned: amount },
      $push: { movements: { type: 'earn', amount, description, ref: refId, refModel } },
    },
    { upsert: true, new: true }
  );
}

export async function deductPoints(userId, amount, description = '', refId = null, refModel = null) {
  const doc = await UserPoints.findOne({ user: userId });
  if (!doc || doc.balance < amount) throw new Error("Saldo de puntos insuficiente");
  doc.balance       -= amount;
  doc.totalRedeemed += amount;
  doc.movements.push({ type: 'redeem', amount: -amount, description, ref: refId, refModel });
  if (doc.movements.length > 100) doc.movements = doc.movements.slice(-100);
  return doc.save();
}
