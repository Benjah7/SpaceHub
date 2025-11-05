import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import { ApiError } from '../utils/apiResponse';

const prisma = new PrismaClient();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export class CloudinaryService {
    /**
     * Upload property images
     */
    static async uploadPropertyImages(
        files: Express.Multer.File[],
        propertyId: number,
        ownerId: number
    ) {
        // Verify property ownership
        const property = await prisma.property.findUnique({
            where: { id: propertyId }
        });

        if (!property) {
            throw new ApiError(404, 'Property not found');
        }

        if (property.ownerId !== ownerId) {
            throw new ApiError(403, 'Not authorized');
        }

        // Upload images to Cloudinary
        const uploadPromises = files.map(async (file, index) => {
            const result = await cloudinary.uploader.upload(
                `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
                {
                    folder: `space-hub/properties/${propertyId}`,
                    transformation: [
                        { width: 1200, height: 900, crop: 'fill', quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                }
            );

            // Check if this is the first image (make it primary)
            const existingImages = await prisma.propertyImage.count({
                where: { propertyId }
            });

            return prisma.propertyImage.create({
                data: {
                    url: result.secure_url,
                    publicId: result.public_id,
                    propertyId,
                    isPrimary: existingImages === 0 && index === 0
                }
            });
        });

        const images = await Promise.all(uploadPromises);

        return images;
    }

    /**
     * Delete property image
     */
    static async deletePropertyImage(imageId: number, ownerId: number) {
        // Get image with property
        const image = await prisma.propertyImage.findUnique({
            where: { id: imageId },
            include: { property: true }
        });

        if (!image) {
            throw new ApiError(404, 'Image not found');
        }

        if (image.property.ownerId !== ownerId) {
            throw new ApiError(403, 'Not authorized');
        }

        // Delete from Cloudinary
        if (image.publicId) {
            await cloudinary.uploader.destroy(image.publicId);
        }

        // Delete from database
        await prisma.propertyImage.delete({
            where: { id: imageId }
        });

        // If deleted image was primary, make another image primary
        if (image.isPrimary) {
            const remainingImage = await prisma.propertyImage.findFirst({
                where: { propertyId: image.propertyId }
            });

            if (remainingImage) {
                await prisma.propertyImage.update({
                    where: { id: remainingImage.id },
                    data: { isPrimary: true }
                });
            }
        }

        return { message: 'Image deleted successfully' };
    }

    /**
     * Set primary image
     */
    static async setPrimaryImage(imageId: number, ownerId: number) {
        // Get image with property
        const image = await prisma.propertyImage.findUnique({
            where: { id: imageId },
            include: { property: true }
        });

        if (!image) {
            throw new ApiError(404, 'Image not found');
        }

        if (image.property.ownerId !== ownerId) {
            throw new ApiError(403, 'Not authorized');
        }

        // Update all images for this property
        await prisma.$transaction([
            // Set all images to non-primary
            prisma.propertyImage.updateMany({
                where: { propertyId: image.propertyId },
                data: { isPrimary: false }
            }),
            // Set selected image to primary
            prisma.propertyImage.update({
                where: { id: imageId },
                data: { isPrimary: true }
            })
        ]);

        return { message: 'Primary image updated' };
    }

    /**
     * Upload profile image
     */
    static async uploadProfileImage(file: Express.Multer.File, userId: number) {
        // Get existing profile image
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { profileImage: true }
        });

        // Delete old image from Cloudinary if exists
        if (user?.profileImage) {
            const publicId = this.extractPublicId(user.profileImage);
            if (publicId) {
                await cloudinary.uploader.destroy(publicId).catch(err => {
                    console.error('Failed to delete old profile image:', err);
                });
            }
        }

        // Upload new image
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: `space-hub/profiles/${userId}`,
                transformation: [
                    { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' },
                    { fetch_format: 'auto' }
                ]
            }
        );

        // Update user profile
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { profileImage: result.secure_url },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true
            }
        });

        return updatedUser;
    }

    /**
     * Upload document
     */
    static async uploadDocument(
        file: Express.Multer.File,
        userId: number,
        documentType: string,
        propertyId?: number
    ) {
        const result = await cloudinary.uploader.upload(
            `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
            {
                folder: `space-hub/documents/${userId}`,
                resource_type: 'raw'
            }
        );

        const document = await prisma.document.create({
            data: {
                filename: file.originalname,
                url: result.secure_url,
                publicId: result.public_id,
                type: documentType,
                userId,
                propertyId
            }
        });

        return document;
    }

    /**
     * Extract public ID from Cloudinary URL
     */
    private static extractPublicId(url: string): string | null {
        const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
        return matches ? matches[1] : null;
    }
}