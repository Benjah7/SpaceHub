'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  MapPin,
  Square,
  Calendar,
  Check,
  Share2,
  Heart,
  ArrowLeft,
  Phone,
  Mail,
  Star,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/language-store';
import { useAuthStore } from '@/lib/store/auth-store';
import { PROPERTY_TYPE_LABELS } from '@/types';
import type { Property } from '@/types';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguageStore();
  const { isAuthenticated } = useAuthStore();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  
  const [inquiryForm, setInquiryForm] = useState({
    message: '',
    preferredViewingDate: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;
      
      setLoading(true);
      try {
        const data = await apiClient.getPropertyById(params.id as string);
        
        if (data) {
          setProperty(data);
          
          // Fetch similar properties
          const similar = await apiClient.getProperties({
            propertyType: data.propertyType,
            limit: 3,
          });
          setSimilarProperties(similar.data.filter(p => p.id !== data.id));
        } else {
          toast.error('Property not found');
          router.push('/listings');
        }
      } catch (error) {
        ErrorHandler.handle(error, 'Failed to load property');
        router.push('/listings');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, router]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: property?.title,
          text: property?.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) {
      toast.error('Please login to add favorites');
      router.push('/login');
      return;
    }
    setIsFavorite(!isFavorite);
    toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleNextImage = () => {
    if (!property) return;
    setSelectedImageIndex((prev) =>
      prev === property.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    if (!property) return;
    setSelectedImageIndex((prev) =>
      prev === 0 ? property.images.length - 1 : prev - 1
    );
  };

  const handleSubmitInquiry = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to send inquiries');
      router.push('/login');
      return;
    }

    if (!inquiryForm.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSubmittingInquiry(true);
    try {
      await apiClient.createInquiry({
        propertyId: params.id as string,
        message: inquiryForm.message,
        preferredViewingDate: inquiryForm.preferredViewingDate,
      });

      toast.success('Inquiry sent successfully!');
      setShowInquiryModal(false);
      setInquiryForm({ message: '', preferredViewingDate: '' });
    } catch (error) {
      ErrorHandler.handle(error, 'Failed to send inquiry');
    } finally {
      setSubmittingInquiry(false);
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
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <EmptyState
            icon={MapPin}
            title="Property Not Found"
            description="The property you're looking for doesn't exist"
            actionLabel="Back to Listings"
            actionHref="/listings"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Back Button */}
      <div className="bg-neutral-surface border-b border-neutral-border py-md">
        <div className="container-custom">
          <Button
            variant="text"
            leftIcon={<ArrowLeft className="w-5 h-5" />}
            onClick={() => router.back()}
          >
            {t('common.back')}
          </Button>
        </div>
      </div>

      <div className="container-custom py-xl">
        {/* Image Gallery */}
        <motion.div
          className="mb-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="relative h-[400px] rounded-xl overflow-hidden mb-md">
            {property.images.length > 0 ? (
              <>
                <Image
                  src={property.images[selectedImageIndex]?.url || '/placeholder.jpg'}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-neutral-bg flex items-center justify-center">
                <p className="text-neutral-text-secondary">No images available</p>
              </div>
            )}
          </div>

          {/* Thumbnail Strip */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-md">
              {property.images.slice(0, 4).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 rounded-lg overflow-hidden ${
                    selectedImageIndex === index ? 'ring-2 ring-brand-primary' : ''
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${property.title} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-md">
                <div className="flex-1">
                  <h1 className="text-h1 mb-md">{property.title}</h1>
                  <div className="flex items-center gap-md text-body text-neutral-text-secondary mb-md">
                    <MapPin className="w-5 h-5" />
                    <span>{property.location.address}, {property.location.neighborhood}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Share2 className="w-4 h-4" />}
                    onClick={handleShare}
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-status-error' : ''}`} />}
                    onClick={handleToggleFavorite}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-md">
                <Badge>
                  {PROPERTY_TYPE_LABELS[property.propertyType]}
                </Badge>
                <Badge variant="success">{property.status}</Badge>
                {property.verified && (
                  <Badge variant="info">
                    <Check className="w-3 h-3 mr-1" />
                    {t('property.verified')}
                  </Badge>
                )}
              </div>
            </div>

            {/* Price */}
            <Card>
              <div className="text-h2 font-bold text-brand-primary">
                {formatCurrency(property.price)}
                <span className="text-body text-neutral-text-secondary font-normal">
                  {t('property.per_month')}
                </span>
              </div>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-h2 mb-md">{t('property.description')}</h2>
              <p className="text-body text-neutral-text-primary leading-relaxed">
                {property.description}
              </p>
            </Card>

            {/* Amenities */}
            {property.amenities.length > 0 && (
              <Card>
                <h2 className="text-h2 mb-md">{t('property.amenities')}</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                  {property.amenities.map((amenity) => (
                    <div key={amenity.id} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-brand-primary" />
                      <span>{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Property Details */}
            <Card>
              <h2 className="text-h2 mb-md">{t('property.details')}</h2>
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Property Type
                  </p>
                  <p className="text-body font-medium">
                    {PROPERTY_TYPE_LABELS[property.propertyType]}
                  </p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Size
                  </p>
                  <p className="text-body font-medium">{property.size} {t('property.sqm')}</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Available From
                  </p>
                  <p className="text-body font-medium">
                    {formatDate(property.availableFrom)}
                  </p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Views
                  </p>
                  <p className="text-body font-medium">{property.views}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* Contact Card */}
            <Card>
              <h3 className="text-h3 mb-md">Contact Property Owner</h3>
              <div className="space-y-md">
                <Button
                  variant="primary"
                  fullWidth
                  leftIcon={<Mail className="w-5 h-5" />}
                  onClick={() => setShowInquiryModal(true)}
                >
                  {t('inquiry.sendInquiry')}
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  leftIcon={<Phone className="w-5 h-5" />}
                  onClick={() => setShowContactModal(true)}
                >
                  {t('property.contact_owner')}
                </Button>
              </div>
            </Card>

            {/* Owner Card */}
            <Card>
              <h3 className="text-h3 mb-md">Property Owner</h3>
              <div className="flex items-center gap-md mb-md">
                <div className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center">
                  <span className="text-h3 font-bold text-brand-primary">
                    {property.owner.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-body font-semibold">{property.owner.name}</p>
                  {property.owner.verified && (
                    <p className="text-small text-status-success flex items-center gap-1">
                      <Check className="w-4 h-4" />
                      {t('property.verified')}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Similar Properties */}
        {similarProperties.length > 0 && (
          <div className="mt-3xl">
            <h2 className="text-h2 mb-lg">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {similarProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={() => router.push(`/properties/${prop.id}`)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Owner"
      >
        <div className="space-y-md">
          <div className="flex items-center gap-md p-md bg-neutral-bg rounded-lg">
            <Phone className="w-5 h-5 text-brand-primary" />
            <div>
              <p className="text-small text-neutral-text-secondary">Phone</p>
              <p className="text-body font-medium">{property.owner.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-md p-md bg-neutral-bg rounded-lg">
            <Mail className="w-5 h-5 text-brand-primary" />
            <div>
              <p className="text-small text-neutral-text-secondary">Email</p>
              <p className="text-body font-medium">{property.owner.email}</p>
            </div>
          </div>
        </div>
      </Modal>

      {/* Inquiry Modal */}
      <Modal
        isOpen={showInquiryModal}
        onClose={() => setShowInquiryModal(false)}
        title={t('inquiry.sendInquiry')}
      >
        <div className="space-y-md">
          <Textarea
            label={t('inquiry.yourMessage')}
            placeholder={t('inquiry.messagePlaceholder')}
            rows={5}
            required
            showCharCount
            maxLength={500}
            value={inquiryForm.message}
            onChange={(e) =>
              setInquiryForm({ ...inquiryForm, message: e.target.value })
            }
          />
          <Input
            type="date"
            label={t('inquiry.preferredViewingDate')}
            value={inquiryForm.preferredViewingDate}
            onChange={(e) =>
              setInquiryForm({ ...inquiryForm, preferredViewingDate: e.target.value })
            }
          />
          <Button
            variant="primary"
            fullWidth
            isLoading={submittingInquiry}
            onClick={handleSubmitInquiry}
          >
            {t('common.submit')}
          </Button>
        </div>
      </Modal>
    </div>
  );
}