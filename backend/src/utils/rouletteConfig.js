import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(__dirname, "../config/rouletteConfig.json");

const DEFAULT_CONFIG = {
  pityThresholds: {
    RARE: 10,
    EPIC: 25,
    LEGENDARY: 50
  },
  pityBoostMultiplier: 10,
  rarityModifiers: {
    COMMON: 1.0,
    RARE: 0.5,
    EPIC: 0.2,
    LEGENDARY: 0.05
  },
  kpiMinScore: 80,
  kpiMaxMultiplier: 1.2
};

export const getRouletteConfig = () => {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const data = fs.readFileSync(CONFIG_PATH, "utf8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(data) };
    }
  } catch (error) {
    console.error("Error reading roulette config:", error);
  }
  
  // Return default and save it if possible
  saveRouletteConfig(DEFAULT_CONFIG);
  return DEFAULT_CONFIG;
};

export const saveRouletteConfig = (config) => {
  try {
    const dir = path.dirname(CONFIG_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), "utf8");
    return true;
  } catch (error) {
    console.error("Error saving roulette config:", error);
    return false;
  }
};
