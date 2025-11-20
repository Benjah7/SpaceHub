import { SearchCriteria } from '../types';
import { prisma } from '../utils/prisma';

export class SpatialService {
  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in meters
   */
  private static haversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  /**
   * Search properties within radius
   */
  static async searchByRadius(
    latitude: number,
    longitude: number,
    radiusKm: number,
    filters: SearchCriteria = {}
  ) {
    const radiusMeters = radiusKm * 1000;

    // Build WHERE conditions
    const whereClause: any = {
      status: 'AVAILABLE',
    };

    if (filters.propertyType) {
      whereClause.propertyType = filters.propertyType;
    }

    if (filters.minRent !== undefined) {
      whereClause.monthlyRent = { ...whereClause.monthlyRent, gte: filters.minRent };
    }

    if (filters.maxRent !== undefined) {
      whereClause.monthlyRent = { ...whereClause.monthlyRent, lte: filters.maxRent };
    }

    if (filters.neighborhood) {
      whereClause.neighborhood = filters.neighborhood;
    }

    // Get all matching properties
    const allProperties = await prisma.property.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            verificationStatus: true,
          },
        },
        images: {
          orderBy: { isPrimary: 'desc' },
        },
      },
    });

    // Calculate distances and filter
    const propertiesWithDistance = allProperties
      .map((p) => {
        const distance = this.haversineDistance(
          latitude,
          longitude,
          p.latitude,
          p.longitude
        );
        return {
          ...p,
          distance: Math.round(distance),
        };
      })
      .filter((p) => p.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance);

    // Paginate
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const paginatedProperties = propertiesWithDistance.slice(startIndex, endIndex);

    return {
      properties: paginatedProperties,
      pagination: {
        page,
        limit,
        total: propertiesWithDistance.length,
        totalPages: Math.ceil(propertiesWithDistance.length / limit),
      },
    };
  }

  /**
   * Search properties within bounding box
   */
  static async searchByBounds(
    minLat: number,
    minLng: number,
    maxLat: number,
    maxLng: number,
    filters: SearchCriteria = {}
  ) {
    const whereClause: any = {
      status: 'AVAILABLE',
      latitude: {
        gte: minLat,
        lte: maxLat,
      },
      longitude: {
        gte: minLng,
        lte: maxLng,
      },
    };

    if (filters.propertyType) {
      whereClause.propertyType = filters.propertyType;
    }

    if (filters.minRent !== undefined) {
      whereClause.monthlyRent = { ...whereClause.monthlyRent, gte: filters.minRent };
    }

    if (filters.maxRent !== undefined) {
      whereClause.monthlyRent = { ...whereClause.monthlyRent, lte: filters.maxRent };
    }

    const page = filters.page || 1;
    const limit = filters.limit || 20;

    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: whereClause,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
            },
          },
          images: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.property.count({ where: whereClause }),
    ]);

    return {
      properties,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get nearby properties
   */
  static async getNearbyProperties(
    propertyId: number,
    radiusKm: number = 5,
    limit: number = 10
  ) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { longitude: true, latitude: true },
    });

    if (!property) {
      return {
        properties: [],
        pagination: {
          page: 1,
          limit: limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return this.searchByRadius(property.latitude, property.longitude, radiusKm, {
      limit,
    });
  }

  /**
   * Calculate distance between two points
   */
  static async calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): Promise<number> {
    return Math.round(this.haversineDistance(lat1, lng1, lat2, lng2));
  }
}