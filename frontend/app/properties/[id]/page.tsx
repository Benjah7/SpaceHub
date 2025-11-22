'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  Check,
  Share2,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Calendar,
  Building2,
  Square,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS } from '@/types';
import type { Property } from '@/types';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  const isOwner = user?.id === property?.ownerId;

  useEffect(() => {
    fetchProperty();
  }, [params.id]);

  const fetchProperty = async () => {
    if (!params.id) return;
    
    setLoading(true);
    try {
      const data = await apiClient.getPropertyById(params.id as string);
      setProperty(data);

      // Fetch similar properties
      if (data) {
        const similar = await apiClient.getProperties({
          propertyType: data.propertyType,
          neighborhood: data.location?.neighborhood,
          limit: 3,
        });
        setSimilarProperties(similar.data.filter(p => p.id !== data.id));
      }

      // Check if favorited
      if (isAuthenticated) {
        try {
          const favorites = await apiClient.getFavorites();
          setIsFavorite(favorites.some(f => f.id === data.id));
        } catch (error) {
          // Ignore error
        }
      }
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to load property');
      router.push('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleContactOwner = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${params.id}`);
      return;
    }

    if (isOwner) {
      toast.error('You cannot message yourself');
      return;
    }

    try {
      const conversation = await apiClient.createConversation({
        participantId: property!.ownerId,
        propertyId: property!.id,
      });
      router.push(`/messages?conversation=${conversation.id}`);
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to start conversation');
    }
  };

  const handleScheduleViewing = () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${params.id}`);
      return;
    }

    if (isOwner) {
      toast.error('You cannot schedule a viewing for your own property');
      return;
    }

    setShowAppointmentModal(true);
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${params.id}`);
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.removeFavorite(property!.id);
        toast.success('Removed from favorites');
      } else {
        await apiClient.addFavorite(property!.id);
        toast.success('Added to favorites');
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      ErrorHandler.handle(error);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      // User cancelled
    }
  };

  const nextImage = () => {
    if (property?.images) {
      setSelectedImageIndex((prev) => 
        prev === property.images!.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (property?.images) {
      setSelectedImageIndex((prev) => 
        prev === 0 ? property.images!.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <PropertyDetailSkeleton />
        </div>
      </div>
    );
  }

  if (!property) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-lg">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          onClick={() => router.back()}
          className="mb-md"
        >
          Back
        </Button>

        {/* Image Gallery */}
        <div className="relative h-[400px] md:h-[600px] rounded-lg overflow-hidden mb-lg">
          {property.images && property.images.length > 0 ? (
            <>
              <Image
                src={property.images[selectedImageIndex].url}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {property.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-neutral-bg-secondary flex items-center justify-center">
              <Building2 className="w-16 h-16 text-neutral-text-tertiary" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Header */}
            <Card>
              <div className="flex items-start justify-between mb-md">
                <div>
                  <div className="flex items-center gap-sm mb-2">
                    <Badge variant={property.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </Badge>
                    {property.verified && (
                      <Badge variant="info">
                        <Check className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-h1 mb-2">{property.title}</h1>
                  <div className="flex items-center text-body text-neutral-text-secondary">
                    <MapPin className="w-5 h-5 mr-2" />
                    {property.location.address}, {property.location.neighborhood}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={handleFavorite}
                    leftIcon={
                      <Heart 
                        className={isFavorite ? 'fill-current text-status-error' : ''} 
                      />
                    }
                  />
                  <Button
                    variant="ghost"
                    size="md"
                    leftIcon={<Share2 />}
                    onClick={handleShare}
                  />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-h1 font-bold text-brand-primary">
                  {formatCurrency(property.price)}
                </span>
                <span className="text-body text-neutral-text-secondary">/ month</span>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-h2 mb-md">Description</h2>
              <p className="text-body text-neutral-text-secondary leading-relaxed">
                {property.description}
              </p>
            </Card>

            {/* Property Details */}
            <Card>
              <h2 className="text-h2 mb-md">Property Details</h2>
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">Type</p>
                  <p className="text-body font-medium">
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">Size</p>
                  <p className="text-body font-medium">{property.size} m²</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">Available From</p>
                  <p className="text-body font-medium">{formatDate(property.availableFrom)}</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">Views</p>
                  <p className="text-body font-medium">{property.views}</p>
                </div>
              </div>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <h2 className="text-h2 mb-md">Amenities</h2>
                <div className="grid grid-cols-2 gap-md">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-status-success" />
                      <span className="text-body">
                        {typeof amenity === 'string' ? amenity : amenity.name}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Location Map */}
            <Card>
              <h2 className="text-h2 mb-md">Location</h2>
              <div className="h-64 rounded-lg overflow-hidden mb-md">
                <PropertyMap
                  properties={[property]}
                  center={{
                    lat: property.location.lat,
                    lng: property.location.lng,
                  }}
                  zoom={15}
                  showSearch={false}
                  showRadius={false}
                  height="256px"
                />
              </div>
              <p className="text-body text-neutral-text-secondary">
                {property.location.neighborhood}, Nairobi
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* Action Card */}
            <Card>
              <h3 className="text-h3 mb-md">
                {isOwner ? 'Your Property' : 'Interested?'}
              </h3>
              
              {isOwner ? (
                <div className="space-y-md">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                  >
                    Edit Property
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    onClick={() => router.push('/dashboard/inquiries')}
                  >
                    View Inquiries
                  </Button>
                </div>
              ) : (
                <div className="space-y-md">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    leftIcon={<MessageSquare className="w-5 h-5" />}
                    onClick={handleContactOwner}
                  >
                    Contact Owner
                  </Button>
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    leftIcon={<Calendar className="w-5 h-5" />}
                    onClick={handleScheduleViewing}
                  >
                    Schedule Viewing
                  </Button>
                  <Button
                    variant="ghost"
                    size="md"
                    fullWidth
                    leftIcon={<Phone className="w-5 h-5" />}
                    onClick={() => setShowContactModal(true)}
                  >
                    Show Contact Info
                  </Button>
                </div>
              )}
            </Card>

            {/* Owner Card */}
            {!isOwner && property.owner && (
              <Card>
                <h3 className="text-h3 mb-md">Property Owner</h3>
                <div className="flex items-center gap-md">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                    <span className="text-h3 font-bold text-brand-primary">
                      {property.owner.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{property.owner.name}</p>
                    {property.owner.verified && (
                      <Badge variant="success" className="mt-1">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-2xl">
            <h2 className="text-h2 mb-lg">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {similarProperties.map(prop => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={() => router.push(`/properties/${prop.id}`)}
                  onContact={() => {}}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Appointment Modal */}
      {property && (
        <AppointmentModal
          isOpen={showAppointmentModal}
          onClose={() => setShowAppointmentModal(false)}
          property={property}
          onSuccess={() => {
            toast.success('Viewing request sent!');
            router.push('/appointments');
          }}
        />
      )}

      {/* Contact Modal */}
      <Modal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)}
        title="Contact Information"
      >
        <div className="space-y-md">
          <div className="flex items-center gap-md">
            <Mail className="w-5 h-5 text-neutral-text-secondary" />
            <span>{property.owner?.email}</span>
          </div>
          {property.owner?.phone && (
            <div className="flex items-center gap-md">
              <Phone className="w-5 h-5 text-neutral-text-secondary" />
              <span>{property.owner.phone}</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}