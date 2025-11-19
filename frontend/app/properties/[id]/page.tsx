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
  CreditCard,
  Map as MapIcon,
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
import { PaymentModal } from '@/components/payment/PaymentModal';
import { PropertyMap } from '@/components/maps/PropertyMap';
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
  useLanguageStore();
  const { isAuthenticated, user } = useAuthStore();
  
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);
  
  const [inquiryForm, setInquiryForm] = useState({
    message: '',
    preferredViewingDate: '',
  });
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  useEffect(() => {
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
            limit: 3,
          });
          setSimilarProperties(similar.data.filter(p => p.id !== data.id));
        }

        // Check if favorited
        if (isAuthenticated) {
          try {
            const favorites = await apiClient.getFavorites();
            setIsFavorite(favorites.some(f => f.id === params.id));
          } catch (error) {
            // Ignore error
          }
        }
      } catch (error) {
        ErrorHandler.handle(error, 'Failed to load property');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, isAuthenticated]);

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to save favorites');
      router.push('/login');
      return;
    }

    try {
      if (isFavorite) {
        await apiClient.removeFavorite(params.id as string);
        setIsFavorite(false);
        toast.success('Removed from favorites');
      } else {
        await apiClient.addFavorite(params.id as string);
        setIsFavorite(true);
        toast.success('Added to favorites');
      }
    } catch (error) {
      ErrorHandler.handle(error);
    }
  };

  const handleInquiry = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to send inquiry');
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
        preferredViewingDate: inquiryForm.preferredViewingDate || undefined,
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

  const handlePaymentSuccess = () => {
    toast.success('Payment successful! The property owner will contact you shortly.');
    setShowPaymentModal(false);
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
            description="The property you're looking for doesn't exist or has been removed"
            actionLabel="Browse All Properties"
            actionHref="/listings"
          />
        </div>
      </div>
    );
  }

  const isOwner = user?.id === property.owner.id;

  return (
    <div className="min-h-screen bg-neutral-bg">
      <div className="container-custom py-xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          leftIcon={<ArrowLeft />}
          onClick={() => router.back()}
          className="mb-lg"
        >
          Back
        </Button>

        {/* Image Gallery */}
        <motion.div
          className="mb-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="relative h-96 rounded-lg overflow-hidden mb-md">
            {property.images.length > 0 ? (
              <>
                <Image
                  src={property.images[selectedImageIndex].url}
                  alt={property.title}
                  fill
                  className="object-cover"
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === 0 ? property.images.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setSelectedImageIndex(prev => 
                        prev === property.images.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full bg-neutral-border flex items-center justify-center">
                <MapPin className="w-20 h-20 text-neutral-text-tertiary" />
              </div>
            )}
          </div>

          {/* Thumbnail Grid */}
          {property.images.length > 1 && (
            <div className="grid grid-cols-4 gap-md">
              {property.images.slice(0, 4).map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-brand-primary'
                      : 'border-transparent hover:border-neutral-border'
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={`${property.title} - ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-xl">
            {/* Title & Location */}
            <div>
              <div className="flex items-start justify-between mb-md">
                <div className="flex-1">
                  <div className="flex items-center gap-md mb-2">
                    <Badge variant={property.status === 'AVAILABLE' ? 'success' : 'secondary'}>
                      {property.status}
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
                    leftIcon={<Heart className={isFavorite ? 'fill-current text-status-error' : ''} />}
                  />
                  <Button
                    variant="ghost"
                    size="md"
                    leftIcon={<Share2 />}
                  />
                </div>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-h1 font-bold text-brand-primary">
                  {formatCurrency(property.price)}
                </span>
                <span className="text-body text-neutral-text-secondary">/ month</span>
              </div>
            </div>

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
                      <span className="text-body">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Location Map */}
            <Card>
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-h2">Location</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<MapIcon />}
                  onClick={() => setShowMapModal(true)}
                >
                  View Full Map
                </Button>
              </div>
              <div className="h-64 rounded-lg overflow-hidden">
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
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* Action Card */}
            <Card>
              <h3 className="text-h3 mb-md">
                {isOwner ? 'Your Property' : 'Contact Property Owner'}
              </h3>
              
              {isOwner ? (
                <div className="space-y-md">
                  <Button
                    variant="primary"
                    fullWidth
                    href={`/dashboard/properties/${property.id}/edit`}
                  >
                    Edit Property
                  </Button>
                  <Button
                    variant="primary"
                    fullWidth
                    href="/dashboard/inquiries"
                  >
                    View Inquiries
                  </Button>
                </div>
              ) : (
                <div className="space-y-md">
                  {property.status === 'AVAILABLE' && (
                    <>
                      <Button
                        variant="primary"
                        fullWidth
                        leftIcon={<CreditCard className="w-5 h-5" />}
                        onClick={() => setShowPaymentModal(true)}
                      >
                        Pay Deposit
                      </Button>
                      <Button
                        variant="secondary"
                        fullWidth
                        leftIcon={<Mail className="w-5 h-5" />}
                        onClick={() => setShowInquiryModal(true)}
                      >
                        Send Inquiry
                      </Button>
                    </>
                  )}
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={<Phone className="w-5 h-5" />}
                    onClick={() => setShowContactModal(true)}
                  >
                    Contact Owner
                  </Button>
                </div>
              )}
            </Card>

            {/* Owner Card */}
            {!isOwner && (
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
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Inquiry Modal */}
      <Modal isOpen={showInquiryModal} onClose={() => setShowInquiryModal(false)}>
        <div className="p-lg">
          <h3 className="text-h3 mb-md">Send Inquiry</h3>
          <div className="space-y-md">
            <Textarea
              label="Message"
              placeholder="I'm interested in this property..."
              value={inquiryForm.message}
              onChange={(e) => setInquiryForm({ ...inquiryForm, message: e.target.value })}
              rows={5}
            />
            <Input
              type="date"
              label="Preferred Viewing Date (Optional)"
              value={inquiryForm.preferredViewingDate}
              onChange={(e) => setInquiryForm({ ...inquiryForm, preferredViewingDate: e.target.value })}
            />
            <div className="flex gap-md">
              <Button
                variant="outline"
                fullWidth
                onClick={() => setShowInquiryModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                fullWidth
                onClick={handleInquiry}
                isLoading={submittingInquiry}
              >
                Send Inquiry
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Contact Modal */}
      <Modal isOpen={showContactModal} onClose={() => setShowContactModal(false)}>
        <div className="p-lg">
          <h3 className="text-h3 mb-md">Contact Information</h3>
          <div className="space-y-md">
            <div className="flex items-center gap-md">
              <Mail className="w-5 h-5 text-neutral-text-secondary" />
              <span>{property.owner.email}</span>
            </div>
            {property.owner.phone && (
              <div className="flex items-center gap-md">
                <Phone className="w-5 h-5 text-neutral-text-secondary" />
                <span>{property.owner.phone}</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        property={property}
        paymentType="DEPOSIT"
        onSuccess={handlePaymentSuccess}
      />

      {/* Full Map Modal */}
      <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)} size="full">
        <div className="h-screen">
          <PropertyMap
            properties={[property]}
            center={{
              lat: property.location.lat,
              lng: property.location.lng,
            }}
            zoom={15}
            height="100vh"
          />
        </div>
      </Modal>
    </div>
  );
}