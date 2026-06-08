import { Router } from "express";
import { generateSitemap } from "../utils/seo/sitemapGenerator.js";
import { generateRobotsTxt } from "../utils/seo/robotsTxt.js";
import { generateMenuSchema, generateRestaurantSchema, generateOpenGraphTags } from "../utils/seo/schemaGenerator.js";
import Menu from "../models/Menu.js";
import { ok } from "../utils/response.js";

const router = Router();

/* =========================================================
   SITEMAP
========================================================= */
router.get("/sitemap.xml", async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const sitemap = await generateSitemap(baseUrl);
    
    res.header('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   ROBOTS.TXT
========================================================= */
router.get("/robots.txt", async (req, res, next) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const robotsTxt = generateRobotsTxt(baseUrl);
    
    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   SCHEMA.ORG FOR MENU
========================================================= */
router.get("/schema/menu/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const menu = await Menu.findOne({ slug, active: true, isPublic: true }).lean();
    
    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }
    
    const schema = generateMenuSchema(menu, baseUrl);
    
    res.header('Content-Type', 'application/ld+json');
    res.send(schema);
  } catch (error) {
    next(error);
  }
});

/* =========================================================
   OPEN GRAPH TAGS FOR MENU
========================================================= */
router.get("/og/menu/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    
    const menu = await Menu.findOne({ slug, active: true, isPublic: true }).lean();
    
    if (!menu) {
      return notFound(res, "Menú no encontrado");
    }
    
    const ogTags = generateOpenGraphTags(menu, baseUrl);
    
    return ok(res, ogTags);
  } catch (error) {
    next(error);
  }
});

export default router;
