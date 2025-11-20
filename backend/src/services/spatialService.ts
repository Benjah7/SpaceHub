import { SearchCriteria } from '../types';
import { prisma } from '../utils/prisma';

export class SpatialService {
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
    const conditions: string[] = ['p.status = \'AVAILABLE\''];
    const params: any[] = [longitude, latitude, radiusMeters];
    let paramIndex = 4;

    if (filters.propertyType) {
      conditions.push(`p."propertyType" = $${paramIndex}::"PropertyType"`);
      params.push(filters.propertyType);
      paramIndex++;
    }

    if (filters.minRent) {
      conditions.push(`p."monthlyRent" >= $${paramIndex}`);
      params.push(filters.minRent);
      paramIndex++;
    }

    if (filters.maxRent) {
      conditions.push(`p."monthlyRent" <= $${paramIndex}`);
      params.push(filters.maxRent);
      paramIndex++;
    }

    if (filters.neighborhood) {
      conditions.push(`p.neighborhood = $${paramIndex}`);
      params.push(filters.neighborhood);
      paramIndex++;
    }

    const whereClause = conditions.join(' AND ');

    // Execute spatial query
    const properties = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        p.*,
        ST_Distance(
          p.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
        ) as distance,
        (
          SELECT json_build_object(
            'id', u.id,
            'name', u.name,
            'verificationStatus', u."verificationStatus"
          )
          FROM users u
          WHERE u.id = p."ownerId"
        ) as owner,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'isPrimary', pi."isPrimary"
            ) ORDER BY pi."isPrimary" DESC
          )
          FROM property_images pi
          WHERE pi."propertyId" = p.id
        ) as images
      FROM properties p
      WHERE ${whereClause}
        AND ST_DWithin(
          p.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
      ORDER BY distance ASC
      LIMIT ${filters.limit || 20}
      OFFSET ${((filters.page || 1) - 1) * (filters.limit || 20)}
    `, ...params);

    // Get total count
    const countResult = await prisma.$queryRawUnsafe<[{ count: bigint }]>(`
      SELECT COUNT(*) as count
      FROM properties p
      WHERE ${whereClause}
        AND ST_DWithin(
          p.location,
          ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
          $3
        )
    `, ...params);

    const total = Number(countResult[0].count);

    return {
      properties: properties.map(p => ({
        ...p,
        distance: Math.round(p.distance), // meters
        images: p.images || []
      })),
      pagination: {
        page: filters.page || 1,
        limit: filters.limit || 20,
        total,
        totalPages: Math.ceil(total / (filters.limit || 20))
      }
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
    const properties = await prisma.$queryRawUnsafe<any[]>(`
      SELECT 
        p.*,
        (
          SELECT json_build_object(
            'id', u.id,
            'name', u.name
          )
          FROM users u
          WHERE u.id = p."ownerId"
        ) as owner,
        (
          SELECT json_agg(
            json_build_object(
              'id', pi.id,
              'url', pi.url,
              'isPrimary', pi."isPrimary"
            )
          )
          FROM property_images pi
          WHERE pi."propertyId" = p.id
        ) as images
      FROM properties p
      WHERE p.status = 'AVAILABLE'
        AND p.latitude BETWEEN $1 AND $2
        AND p.longitude BETWEEN $3 AND $4
      ${filters.propertyType ? `AND p."propertyType" = '${filters.propertyType}'::"PropertyType"` : ''}
      ${filters.minRent ? `AND p."monthlyRent" >= ${filters.minRent}` : ''}
      ${filters.maxRent ? `AND p."monthlyRent" <= ${filters.maxRent}` : ''}
      ORDER BY p."createdAt" DESC
      LIMIT ${filters.limit || 20}
      OFFSET ${((filters.page || 1) - 1) * (filters.limit || 20)}
    `, minLat, maxLat, minLng, maxLng);

    return properties.map(p => ({
      ...p,
      images: p.images || []
    }));
  }

  /**
   * Get nearby properties
   */
  static async getNearbyProperties(propertyId: number, radiusKm: number = 5, limit: number = 10) {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
      select: { longitude: true, latitude: true }
    });

    if (!property) {
      return {
        properties: [],
        pagination: {
          page: 1,
          limit: limit,
          total: 0,
          totalPages: 0
        }
      };
    }

    return this.searchByRadius(
      property.latitude,
      property.longitude,
      radiusKm,
      { limit }
    );
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
    const result = await prisma.$queryRaw<[{ distance: number }]>`
      SELECT ST_Distance(
        ST_SetSRID(ST_MakePoint(${lng1}, ${lat1}), 4326)::geography,
        ST_SetSRID(ST_MakePoint(${lng2}, ${lat2}), 4326)::geography
      ) as distance
    `;

    return Math.round(result[0].distance); // meters
  }
}