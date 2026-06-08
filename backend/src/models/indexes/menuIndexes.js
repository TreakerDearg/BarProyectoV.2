/* =========================================================
   MONGODB INDEXES FOR MENU COLLECTION
========================================================= */
import Menu from "../Menu.js";

export const createMenuIndexes = async () => {
  try {
    // Index for slug lookups (unique)
    await Menu.collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
    
    // Index for active/public filtering
    await Menu.collection.createIndex({ active: 1, isPublic: 1 });
    
    // Index for featured menus
    await Menu.collection.createIndex({ featured: 1, active: 1 });
    
    // Index for type filtering
    await Menu.collection.createIndex({ type: 1, active: 1 });
    
    // Index for availability queries
    await Menu.collection.createIndex({ availableDays: 1, active: 1 });
    
    // Index for promotion dates
    await Menu.collection.createIndex({ promotedUntil: 1, active: 1 });
    
    // Index for price range queries
    await Menu.collection.createIndex({ minPrice: 1, maxPrice: 1 });
    
    // Index for search (name and description)
    await Menu.collection.createIndex({ name: "text", description: "text" });
    
    // Index for createdAt sorting
    await Menu.collection.createIndex({ createdAt: -1 });
    
    // Index for updatedAt sorting
    await Menu.collection.createIndex({ updatedAt: -1 });
    
    // Compound index for public menu queries
    await Menu.collection.createIndex({ isPublic: 1, active: 1, featured: 1 });
    
    console.log("Menu indexes created successfully");
  } catch (error) {
    if (error.code !== 85) { // Ignore "Index already exists" error
      console.error("Error creating menu indexes:", error);
    }
  }
};

export const dropMenuIndexes = async () => {
  try {
    await Menu.collection.dropIndexes();
    console.log("Menu indexes dropped successfully");
  } catch (error) {
    console.error("Error dropping menu indexes:", error);
  }
};
