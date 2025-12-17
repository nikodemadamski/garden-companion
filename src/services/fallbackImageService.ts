import { PlantCategory } from '../types/plant';

/**
 * Fallback image service for providing default plant images
 * when user photos are not available
 */

// Default category images from Unsplash with Irish gardening focus
const CATEGORY_FALLBACK_IMAGES: Record<PlantCategory, string[]> = {
  fruit: [
    'https://images.unsplash.com/photo-1589123053646-4e7197004540?auto=format&fit=crop&w=600&q=80', // Strawberries
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', // Apples
    'https://images.unsplash.com/photo-1577003833619-76bbd7f82948?auto=format&fit=crop&w=600&q=80', // Raspberries
    'https://images.unsplash.com/photo-1590736969955-71cc94901144?auto=format&fit=crop&w=600&q=80', // Blueberries
  ],
  vegetable: [
    'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=600&q=80', // Lettuce
    'https://images.unsplash.com/photo-1447175008436-054170c2e979?auto=format&fit=crop&w=600&q=80', // Carrots
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', // Potatoes
    'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80', // Kale
  ],
  herb: [
    'https://images.unsplash.com/photo-1462536943532-57a629f6cc60?auto=format&fit=crop&w=600&q=80', // Rosemary
    'https://images.unsplash.com/photo-1584278221574-990f45c7b8a7?auto=format&fit=crop&w=600&q=80', // Thyme
    'https://images.unsplash.com/photo-1618375569909-3c8616cf7733?auto=format&fit=crop&w=600&q=80', // Parsley
    'https://images.unsplash.com/photo-1628556270448-4d4e4148e1b1?auto=format&fit=crop&w=600&q=80', // Sage
  ],
  flower: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=600&q=80', // Chrysanthemums
    'https://images.unsplash.com/photo-1490750967868-88aa4486c946?auto=format&fit=crop&w=600&q=80', // Pansies
    'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80', // Daffodils
    'https://images.unsplash.com/photo-1520637836862-4d197d17c93a?auto=format&fit=crop&w=600&q=80', // Primroses
  ]
};

// Generic plant image for unknown categories
const GENERIC_PLANT_IMAGES = [
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1463320898675-b5f2b2c5dd91?auto=format&fit=crop&w=600&q=80'
];

// Placeholder image for when all else fails
const PLACEHOLDER_IMAGE = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yNTAgMjUwSDM1MFYzNTBIMjUwVjI1MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4PSIyODAiIHk9IjI4MCI+CjxwYXRoIGQ9Ik0yMCAzNkMxMC4wNTg5IDM2IDIgMjcuOTQxMSAyIDIwQzIgMTIuMDU4OSAxMC4wNTg5IDQgMjAgNEMyOS45NDExIDQgMzggMTIuMDU4OSAzOCAyMEMzOCAyNy45NDExIDI5Ljk0MTEgMzYgMjAgMzZaTTIwIDMwQzI2LjYyNzQgMzAgMzIgMjQuNjI3NCAzMiAyMEMzMiAxNS4zNzI2IDI2LjYyNzQgMTAgMjAgMTBDMTMuMzcyNiAxMCA4IDE1LjM3MjYgOCAyMEM4IDI0LjYyNzQgMTMuMzcyNiAzMCAyMCAzMFpNMjAgMjZDMTYuNjg2MyAyNiAxNCAyMy4zMTM3IDE0IDIwQzE0IDE2LjY4NjMgMTYuNjg2MyAxNCAyMCAxNEMyMy4zMTM3IDE0IDI2IDE2LjY4NjMgMjYgMjBDMjYgMjMuMzEzNyAyMy4zMTM3IDI2IDIwIDI2WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4KPC9zdmc+';

export interface FallbackImageOptions {
  category?: PlantCategory;
  species?: string;
  plantName?: string;
  preferredSize?: 'thumbnail' | 'medium' | 'large';
}

export class FallbackImageService {
  /**
   * Gets a fallback image URL for a plant
   */
  static getFallbackImage(options: FallbackImageOptions = {}): string {
    const { category, species, plantName } = options;

    try {
      // Try to get category-specific image
      if (category && CATEGORY_FALLBACK_IMAGES[category]) {
        const categoryImages = CATEGORY_FALLBACK_IMAGES[category];
        
        // Use plant name or species to consistently select the same image for the same plant
        const seed = this.generateSeed(plantName || species || '');
        const imageIndex = seed % categoryImages.length;
        
        return categoryImages[imageIndex];
      }

      // Fall back to generic plant images
      const seed = this.generateSeed(plantName || species || '');
      const imageIndex = seed % GENERIC_PLANT_IMAGES.length;
      
      return GENERIC_PLANT_IMAGES[imageIndex];
    } catch (error) {
      console.warn('Error getting fallback image:', error);
      return PLACEHOLDER_IMAGE;
    }
  }

  /**
   * Gets a fallback image from the Irish plant database
   */
  static async getFallbackFromDatabase(
    species?: string, 
    category?: PlantCategory
  ): Promise<string | null> {
    try {
      // Import the Irish plant database
      const { default: irishPlantDatabase } = await import('../data/irishPlantDatabase.json');
      
      // Try to find exact species match first
      if (species) {
        const exactMatch = irishPlantDatabase.find(plant => 
          plant.scientific_name.some(name => 
            name.toLowerCase().includes(species.toLowerCase())
          ) || plant.common_name.toLowerCase().includes(species.toLowerCase())
        );
        
        if (exactMatch && exactMatch.default_image) {
          return exactMatch.default_image;
        }
      }

      // Try to find category match
      if (category) {
        const categoryMatches = irishPlantDatabase.filter(plant => 
          plant.category === category
        );
        
        if (categoryMatches.length > 0) {
          // Select a random image from category matches
          const seed = this.generateSeed(species || category);
          const plantIndex = seed % categoryMatches.length;
          const selectedPlant = categoryMatches[plantIndex];
          
          if (selectedPlant.default_image) {
            return selectedPlant.default_image;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('Error getting fallback from database:', error);
      return null;
    }
  }

  /**
   * Gets the best available image for a plant
   * Priority: User photo > Database image > Category fallback > Generic fallback
   */
  static async getBestAvailableImage(options: {
    userPhotoUrl?: string;
    species?: string;
    category?: PlantCategory;
    plantName?: string;
  }): Promise<string> {
    const { userPhotoUrl, species, category, plantName } = options;

    // First priority: user photo
    if (userPhotoUrl) {
      const isValid = await this.validateImageUrl(userPhotoUrl);
      if (isValid) {
        return userPhotoUrl;
      }
    }

    // Second priority: database image
    const databaseImage = await this.getFallbackFromDatabase(species, category);
    if (databaseImage) {
      const isValid = await this.validateImageUrl(databaseImage);
      if (isValid) {
        return databaseImage;
      }
    }

    // Third priority: category fallback
    return this.getFallbackImage({ category, species, plantName });
  }

  /**
   * Validates if an image URL is accessible
   */
  static validateImageUrl(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      
      // Set a timeout to avoid hanging
      setTimeout(() => resolve(false), 5000);
      
      img.src = url;
    });
  }

  /**
   * Generates a consistent seed from a string for image selection
   */
  private static generateSeed(input: string): number {
    let hash = 0;
    if (input.length === 0) return hash;
    
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash);
  }

  /**
   * Preloads fallback images for better performance
   */
  static preloadFallbackImages(categories: PlantCategory[] = ['fruit', 'vegetable', 'herb', 'flower']): void {
    const imagesToPreload = new Set<string>();

    // Add category images
    categories.forEach(category => {
      if (CATEGORY_FALLBACK_IMAGES[category]) {
        CATEGORY_FALLBACK_IMAGES[category].forEach(url => imagesToPreload.add(url));
      }
    });

    // Add generic images
    GENERIC_PLANT_IMAGES.forEach(url => imagesToPreload.add(url));

    // Preload images
    imagesToPreload.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  }

  /**
   * Gets thumbnail version of an image URL
   */
  static getThumbnailUrl(originalUrl: string, size: number = 300): string {
    // For Unsplash images, modify the URL parameters
    if (originalUrl.includes('unsplash.com')) {
      const url = new URL(originalUrl);
      url.searchParams.set('w', size.toString());
      url.searchParams.set('h', size.toString());
      url.searchParams.set('fit', 'crop');
      return url.toString();
    }

    // For other images, return original (could be extended with other services)
    return originalUrl;
  }

  /**
   * Gets all available fallback images for a category
   */
  static getCategoryImages(category: PlantCategory): string[] {
    return CATEGORY_FALLBACK_IMAGES[category] || [];
  }

  /**
   * Gets a random fallback image from any category
   */
  static getRandomFallbackImage(): string {
    const allImages = [
      ...Object.values(CATEGORY_FALLBACK_IMAGES).flat(),
      ...GENERIC_PLANT_IMAGES
    ];
    
    const randomIndex = Math.floor(Math.random() * allImages.length);
    return allImages[randomIndex];
  }
}