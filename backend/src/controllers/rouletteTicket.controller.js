/* =============================================================================
   rouletteTicket.controller.js — Golden Ticket VIP (HMAC-signed, short-lived)
   ES Modules — no require()
============================================================================= */

import crypto from 'crypto';
import { ok, badRequest } from '../utils/response.js';

const SECRET  = process.env.TICKET_SECRET ?? 'bartender-ticket-secret';
const TTL_MS  = 30 * 60 * 1000; // 30 minutes

/**
 * Produce an HMAC-SHA256 hex signature for the given payload object.
 * The payload is deterministically serialised via JSON.stringify.
 */
function sign(payload) {
  return crypto
    .createHmac('sha256', SECRET)
    .update(JSON.stringify(payload))
    .digest('hex');
}

// ── POST /roulette/generate-ticket ────────────────────────────────────────
/**
 * Body: { drinkId, rarity, drinkName?, tableId? }
 * Returns: { ticket: string (JSON), expiresAt: number (ms timestamp) }
 */
export async function generateTicket(req, res) {
  const { drinkId, rarity, drinkName, tableId } = req.body;

  if (!drinkId || !rarity) {
    return badRequest(res, 'drinkId y rarity son requeridos');
  }

  const now     = Date.now();
  const payload = {
    drinkId,
    drinkName: drinkName ?? '',
    rarity,
    tableId:   tableId ?? null,
    iat:       now,
    exp:       now + TTL_MS,
  };

  const sig = sign(payload);

  return ok(res, {
    ticket:    JSON.stringify({ ...payload, sig }),
    expiresAt: payload.exp,
  });
}

// ── POST /roulette/redeem-ticket ──────────────────────────────────────────
/**
 * Body: { ticket: string (JSON produced by generateTicket) }
 * Returns: { valid: true, drink: { id, name, rarity } }
 */
export async function redeemTicket(req, res) {
  const { ticket } = req.body;

  if (!ticket) {
    return badRequest(res, 'ticket requerido');
  }

  try {
    const parsed = JSON.parse(ticket);
    const { sig, ...payload } = parsed;

    // Expiry check
    if (Date.now() > payload.exp) {
      return badRequest(res, 'Ticket expirado');
    }

    // Signature verification (timing-safe comparison)
    const expected = sign(payload);
    const sigBuf   = Buffer.from(sig,      'hex');
    const expBuf   = Buffer.from(expected, 'hex');

    if (
      sigBuf.length !== expBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expBuf)
    ) {
      return badRequest(res, 'Ticket inválido');
    }

    return ok(res, {
      valid: true,
      drink: {
        id:     payload.drinkId,
        name:   payload.drinkName,
        rarity: payload.rarity,
      },
    });
  } catch {
    return badRequest(res, 'Ticket malformado');
  }
}
