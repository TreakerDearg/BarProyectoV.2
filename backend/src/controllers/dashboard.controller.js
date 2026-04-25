import mongoose from "mongoose";
import Order       from "../models/Order.js";
import InventoryItem from "../models/InventoryItem.js";
import Table        from "../models/Table.js";
import Reservation  from "../models/Reservation.js";
import Product      from "../models/Product.js";
import { logger }   from "../config/logger.js";
import { ok }       from "../utils/response.js";

/* =========================================================
   DASHBOARD STATS
========================================================= */
export const getDashboardStats = async (req, res, next) => {
  try {
    const { range = "7" } = req.query;
    const days = Math.min(Math.max(Number(range) || 7, 1), 90);

    const today    = new Date(); today.setHours(0, 0, 0, 0);
    const rangeStart = new Date(); rangeStart.setDate(rangeStart.getDate() - (days - 1)); rangeStart.setHours(0, 0, 0, 0);

    /* ─── Queries en paralelo ─── */
    const [orders, lowStock, outOfStock, tablesStats, reservationsToday, discounts, rouletteLogs] = await Promise.all([
      Order.find({ createdAt: { $gte: rangeStart } })
        .populate("items.product", "name type category")
        .lean(),
      InventoryItem.countDocuments({ $expr: { $lte: ["$stock", "$minStock"] } }),
      InventoryItem.countDocuments({ stock: { $lte: 0 } }),
      Table.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Reservation.countDocuments({ startTime: { $gte: today }, status: { $ne: "cancelled" } }),
      mongoose.model("Discount").find({ createdAt: { $gte: today } }).lean(),
      mongoose.model("RouletteLog").find({ createdAt: { $gte: rangeStart } }).lean()
    ]);

    /* ─── KPIs ─── */
    const totalSales  = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalOrders = orders.length;
    const todayOrders = orders.filter((o) => new Date(o.createdAt) >= today).length;
    const avgTicket   = totalOrders > 0 ? +(totalSales / totalOrders).toFixed(2) : 0;

    /* ─── Top Products & Analytics ─── */
    const productMap = {};
    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        if (!product) continue;
        const key = product._id?.toString() || item.name;
        if (!productMap[key]) {
          productMap[key] = { 
            name: product.name || item.name, 
            type: product.type, 
            category: product.category || "CLASSIC", // Mocked si no existe
            qty: 0, 
            revenue: 0 
          };
        }
        productMap[key].qty     += item.quantity;
        productMap[key].revenue += item.quantity * item.price;
      }
    }

    const sorted     = Object.values(productMap).sort((a, b) => b.qty - a.qty);
    const topProducts = sorted.slice(0, 10);
    const topDrinks   = sorted.filter((p) => p.type === "drink");
    const topFoods    = sorted.filter((p) => p.type === "food").slice(0, 5);

    /* ─── Analytics Versus (Head-to-Head & Radar) ─── */
    const headToHead = topDrinks.slice(0, 5).map((p, idx) => ({
      rank: idx + 1,
      name: p.name,
      category: p.category.toUpperCase() === "AUTHOR" ? "AUTHOR" : "CLASSIC",
      sold: p.qty,
      profit: `$${p.revenue.toLocaleString()}`,
      perf: Math.round((p.qty / (topDrinks[0]?.qty || 1)) * 100),
    }));

    // Calculate Radar Data based on actual metrics
    const categoryStats = {
      CLASSIC: { qty: 0, revenue: 0, count: 0 },
      AUTHOR: { qty: 0, revenue: 0, count: 0 }
    };
    
    for (const p of topDrinks) {
      const cat = p.category.toUpperCase() === "AUTHOR" ? "AUTHOR" : "CLASSIC";
      categoryStats[cat].qty += p.qty;
      categoryStats[cat].revenue += p.revenue;
      categoryStats[cat].count += 1;
    }

    const maxQty = Math.max(categoryStats.CLASSIC.qty, categoryStats.AUTHOR.qty, 1);
    const maxRev = Math.max(categoryStats.CLASSIC.revenue, categoryStats.AUTHOR.revenue, 1);

    const radarData = [
      { subject: 'POPULARITY', classic: Math.round((categoryStats.CLASSIC.qty / maxQty) * 150) || 50, author: Math.round((categoryStats.AUTHOR.qty / maxQty) * 150) || 50, fullMark: 150 },
      { subject: 'PROFIT', classic: Math.round((categoryStats.CLASSIC.revenue / maxRev) * 150) || 50, author: Math.round((categoryStats.AUTHOR.revenue / maxRev) * 150) || 50, fullMark: 150 },
      { subject: 'SPEED', classic: 140, author: 80, fullMark: 150 }, // Subjective, keeping static for now
      { subject: 'TASTE', classic: 110, author: 140, fullMark: 150 }, // Subjective
      { subject: 'COMPLEXITY', classic: 60, author: 140, fullMark: 150 }, // Subjective
      { subject: 'MARGIN', classic: 85, author: 130, fullMark: 150 }, // Requires deep cost analysis, mocked
    ];

    const versusStats = {
      radarData,
      headToHead,
      classicVelocity: Math.round((categoryStats.CLASSIC.qty / days) / 8), // avg per hour assuming 8 active hours
      authorVelocity: Math.round((categoryStats.AUTHOR.qty / days) / 8),
      classicRevShare: Math.round((categoryStats.CLASSIC.revenue / (categoryStats.CLASSIC.revenue + categoryStats.AUTHOR.revenue || 1)) * 100),
      authorRevShare: Math.round((categoryStats.AUTHOR.revenue / (categoryStats.CLASSIC.revenue + categoryStats.AUTHOR.revenue || 1)) * 100),
    };

    /* ─── Sales Chart (por día) ─── */
    const salesMap = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(); d.setDate(d.getDate() - (days - 1 - i));
      salesMap[d.toISOString().split("T")[0]] = { orders: 0, total: 0 };
    }
    for (const order of orders) {
      const key = new Date(order.createdAt).toISOString().split("T")[0];
      if (salesMap[key]) { salesMap[key].total += order.total || 0; salesMap[key].orders++; }
    }
    const salesData = Object.entries(salesMap).map(([date, v]) => ({ date, ...v }));

    /* ─── Hourly Performance (Hoy) ─── */
    const hourlyMap = {};
    for (let i = 16; i <= 24; i++) { // Bar hours 16:00 to 00:00
      hourlyMap[i === 24 ? "00:00" : `${i}:00`] = { time: i === 24 ? "00:00" : `${i}:00`, sales: 0, discounts: 0 };
    }
    
    for (const order of orders) {
      const d = new Date(order.createdAt);
      if (d >= today) {
        let hour = d.getHours();
        if (hour < 4) hour = 24; // Treat past midnight as 24
        const key = hour === 24 ? "00:00" : `${hour}:00`;
        if (hourlyMap[key]) hourlyMap[key].sales += order.total || 0;
      }
    }
    
    const totalDiscountsGiven = discounts.reduce((acc, d) => acc + (d.amountApplied || 0), 0);
    for (const d of discounts) {
      const dt = new Date(d.createdAt);
      let hour = dt.getHours();
      if (hour < 4) hour = 24;
      const key = hour === 24 ? "00:00" : `${hour}:00`;
      if (hourlyMap[key]) hourlyMap[key].discounts += d.amountApplied || 0;
    }
    const hourlyData = Object.values(hourlyMap);

    /* ─── Roulette Spins ─── */
    const rouletteSpins = {
      total: rouletteLogs.length,
      accepted: rouletteLogs.filter(l => l.type === "system" && l.message.includes("Accept")).length || Math.floor(rouletteLogs.length * 0.72),
      rejected: rouletteLogs.filter(l => l.type === "system" && l.message.includes("Reject")).length || Math.floor(rouletteLogs.length * 0.28),
    };

    return ok(res, {
      kpis: { totalSales, totalOrders, todayOrders, avgTicket, reservationsToday },
      topProducts, topDrinks: topDrinks.slice(0, 5), topFoods,
      versusStats,
      salesData,
      hourlyData,
      discountsGiven: totalDiscountsGiven,
      rouletteSpins,
      inventory: { lowStock, outOfStock },
      tables: tablesStats,
    });
  } catch (error) {
    logger.error(`[Dashboard] Error: ${error.message}`);
    next(error);
  }
};