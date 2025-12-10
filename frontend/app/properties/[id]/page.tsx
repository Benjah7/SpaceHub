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
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { AppointmentModal } from '@/components/appointments/AppointmentModal';
import { PropertyCard } from '@/components/property/PropertyCard';
import { PropertyDetailSkeleton } from '@/components/ui/Skeleton';
import { PropertyMap } from '@/components/maps/PropertyMap';
import { PropertyDocuments } from '@/components/documents/PropertyDocuments';
import { apiClient } from '@/lib/api-client';
import { ErrorHandler } from '@/lib/utils/error-handler';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth-store';
import { PROPERTY_TYPE_LABELS, PROPERTY_STATUS_LABELS, APPOINTMENT_STATUS_LABELS } from '@/types';
import type { Property, Inquiry, Appointment } from '@/types';
import toast from 'react-hot-toast';
import { PaymentModal } from '@/components/payment/PaymentModal';

// Journey stage type
type JourneyStage = 'discover' | 'inquired' | 'scheduled' | 'viewed' | 'ready-to-book';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Existing state
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPaymentType, setSelectedPaymentType] = useState<'DEPOSIT' | 'BOOKING' | 'RENT'>('BOOKING');
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  // NEW: User journey state
  const [userJourneyStage, setUserJourneyStage] = useState<JourneyStage>('discover');
  const [userInquiry, setUserInquiry] = useState<Inquiry | null>(null);
  const [userAppointment, setUserAppointment] = useState<Appointment | null>(null);

  const isOwner = user?.id === property?.ownerId;

  // Fetch property data (existing logic)
  useEffect(() => {
    const fetchProperty = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const data = await apiClient.getPropertyById(params.id as string);
        setProperty(data);

        // Fetch similar properties
        if (data.location.neighborhood) {
          const similar = await apiClient.getProperties({
            neighborhood: data.location.neighborhood,
            limit: 3,
          });
          setSimilarProperties(similar.data.filter(p => p.id !== data.id));
        }

        // Check if favorited
        if (isAuthenticated) {
          const favorites = await apiClient.getFavorites();
          setIsFavorite(favorites.some(f => f.id === data.id));
        }
      } catch (error) {
        ErrorHandler.handle(error, 'Failed to load property');
        router.push('/properties');
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id, isAuthenticated, router]);

  // NEW: Check user's journey stage with this property
  useEffect(() => {
    if (!isAuthenticated || !property || isOwner) return;

    async function checkUserJourney() {
      try {
        // Check if user has inquired about this property
        const inquiries = await apiClient.getMyInquiries();

        const inquiry = inquiries.find(inq => inq.propertyId === property!.id);
        setUserInquiry(inquiry || null);

        // Check if user has an appointment for this property
        const appointments = await apiClient.getAppointments();
        const appointment = appointments.find(
          apt => apt.propertyId === property!.id && apt.tenantId === user?.id
        );
        setUserAppointment(appointment || null);

        // Determine the user's current stage
        if (appointment?.status === 'COMPLETED') {
          setUserJourneyStage('viewed');
        } else if (appointment) {
          setUserJourneyStage('scheduled');
        } else if (inquiry) {
          setUserJourneyStage('inquired');
        } else {
          setUserJourneyStage('discover');
        }
      } catch (error) {
        console.error('Failed to check user journey:', error);
        // Fallback to discover stage on error
        setUserJourneyStage('discover');
      }
    }

    checkUserJourney();
  }, [isAuthenticated, property?.id, user?.id, isOwner]);

  // Existing handlers
  const handleSendMessage = async () => {
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

  const handlePayment = (type: 'DEPOSIT' | 'BOOKING' | 'RENT') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/properties/${params.id}`);
      return;
    }
    setSelectedPaymentType(type);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (paymentId: string) => {
    toast.success('Payment successful!');
    setShowPaymentModal(false);
    // Optionally update property status or navigate
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

  // Helper function for appointment badge variant
  const getAppointmentBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'CONFIRMED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'COMPLETED':
        return 'info';
      default:
        return 'info';
    }
  };

  // Helper function to format relative time
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'today';
    if (diffInDays === 1) return 'yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return formatDate(dateString);
  };

  // Helper function to format time from datetime
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // NEW: Render function for stage-based CTAs
  const renderStageBasedCTA = () => {
    if (!property) return null;

    // Stage 1: Discovery - Show primary engagement actions
    if (userJourneyStage === 'discover') {
      return (
        <Card>
          <h3 className="text-h3 mb-md">Interested in this property?</h3>
          <p className="text-body text-neutral-text-secondary mb-lg">
            Get started by contacting the owner or scheduling a viewing.
          </p>
          <div className="space-y-md">
            <Button
              variant="primary"
              fullWidth
              leftIcon={<MessageSquare className="w-5 h-5" />}
              onClick={handleSendMessage}
            >
              Contact Owner
            </Button>
            <Button
              variant="outline"
              fullWidth
              leftIcon={<Calendar className="w-5 h-5" />}
              onClick={handleScheduleViewing}
            >
              Schedule Viewing
            </Button>
          </div>
        </Card>
      );
    }

    // Stage 2: Inquired - Encourage scheduling appointment
    if (userJourneyStage === 'inquired' && userInquiry) {
      return (
        <Card>
          <h3 className="text-h3 mb-md">Next Steps</h3>
          <p className="text-body text-neutral-text-secondary mb-lg">
            You've contacted the owner. Schedule a viewing to see the property in person.
          </p>
          <Button
            variant="primary"
            fullWidth
            leftIcon={<Calendar className="w-5 h-5" />}
            onClick={handleScheduleViewing}
          >
            Schedule Property Viewing
          </Button>
          <p className="text-tiny text-neutral-text-tertiary mt-md text-center">
            Inquiry sent {formatRelativeTime(userInquiry.createdAt)}
          </p>
        </Card>
      );
    }

    // Stage 3: Scheduled - Show appointment details
    if (userJourneyStage === 'scheduled' && userAppointment) {
      return (
        <Card>
          <h3 className="text-h3 mb-md">Your Viewing Appointment</h3>
          <div className="p-md bg-brand-primary/10 rounded-lg mb-md">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span className="text-small font-semibold">
                {formatDate(userAppointment.scheduledDate)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-primary" />
              <span className="text-small font-semibold">
                {formatTime(userAppointment.scheduledDate)}
              </span>
            </div>
          </div>
          <Badge variant={getAppointmentBadgeVariant(userAppointment.status)}>
            {APPOINTMENT_STATUS_LABELS[userAppointment.status]}
          </Badge>
          {userAppointment.notes && (
            <p className="text-small text-neutral-text-secondary mt-md">
              Notes: {userAppointment.notes}
            </p>
          )}
          <div className="mt-lg p-md bg-neutral-bg rounded-lg border border-neutral-border">
            <p className="text-small text-neutral-text-secondary">
              💡 After your viewing is complete, we'll show you payment options to book this property.
            </p>
          </div>
        </Card>
      );
    }

    // Stage 4: Viewed - Decision time
    if (userJourneyStage === 'viewed') {
      return (
        <Card>
          <h3 className="text-h3 mb-md">How was your viewing?</h3>
          <p className="text-body text-neutral-text-secondary mb-lg">
            You've seen the property. Would you like to proceed with booking it?
          </p>
          <div className="space-y-md">
            <Button
              variant="primary"
              fullWidth
              onClick={() => setUserJourneyStage('ready-to-book')}
            >
              Yes, I Want to Book This Property
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push('/properties')}
            >
              No, I'll Keep Looking
            </Button>
          </div>
          <p className="text-tiny text-neutral-text-tertiary mt-md text-center">
            You can also save this property and decide later
          </p>
        </Card>
      );
    }

    // Stage 5: Ready to Book - Show payment options
    if (userJourneyStage === 'ready-to-book') {
      return (
        <Card>
          <h3 className="text-h3 mb-md">Complete Your Booking</h3>
          <p className="text-body text-neutral-text-secondary mb-lg">
            Choose a payment option to secure this property.
          </p>

          <div className="space-y-md">
            {/* Booking Fee - Highlighted as primary option */}
            <button
              onClick={() => handlePayment('BOOKING')}
              className="w-full flex justify-between items-center p-4 border-2 border-brand-primary bg-brand-primary/5 rounded-lg hover:bg-brand-primary/10 transition-all group"
            >
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-800">Booking Fee</p>
                  <Badge variant="info" className="text-xs">Recommended</Badge>
                </div>
                <p className="text-sm text-gray-600">Reserve this property now</p>
              </div>
              <p className="text-xl font-bold text-brand-primary group-hover:scale-105 transition-transform">
                KES 5,000
              </p>
            </button>

            {/* Security Deposit */}
            <button
              onClick={() => handlePayment('DEPOSIT')}
              className="w-full flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">Security Deposit</p>
                <p className="text-sm text-gray-500">Required before move-in</p>
              </div>
              <p className="text-xl font-bold text-gray-700">
                KES {(property.price * 2).toLocaleString()}
              </p>
            </button>

            {/* First Month Rent */}
            <button
              onClick={() => handlePayment('RENT')}
              className="w-full flex justify-between items-center p-4 border-2 border-gray-200 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
            >
              <div className="text-left">
                <p className="font-semibold text-gray-800">First Month Rent</p>
                <p className="text-sm text-gray-500">Pay your first month</p>
              </div>
              <p className="text-xl font-bold text-gray-700">
                KES {property.price.toLocaleString()}
              </p>
            </button>
          </div>

          <div className="mt-lg p-md bg-brand-primary/10 rounded-lg border border-brand-primary/20">
            <p className="text-tiny text-brand-primary font-medium">
              💡 Tip: Start with the booking fee to reserve the property while you arrange the full payment
            </p>
          </div>
        </Card>
      );
    }

    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-bg py-xl">
        <div className="container-custom">
          <PropertyDetailSkeleton />
        </div>
      </div>
    );
  }

  // Property not found
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
                          index === selectedImageIndex
                            ? 'bg-white'
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <Building2 className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            {/* Title and Actions */}
            <Card>
              <div className="flex items-start justify-between mb-md">
                <div className="flex-1">
                  <div className="flex items-center gap-md mb-2">
                    <h1 className="text-h1">{property.title}</h1>
                    {property.verified && (
                      <Badge variant="success">
                        <Check className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-neutral-text-secondary mb-md">
                    <MapPin className="w-4 h-4" />
                    <span className="text-body">{property.location.address}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleFavorite}
                    className={isFavorite ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-lg mb-lg">
                <div>
                  <p className="text-small text-neutral-text-secondary">Monthly Rent</p>
                  <p className="text-h2 text-brand-primary">{formatCurrency(property.price)}</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary">Size</p>
                  <p className="text-h3">{property.size} m²</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary">Type</p>
                  <p className="text-h3">{PROPERTY_TYPE_LABELS[property.propertyType]}</p>
                </div>
              </div>

              <Badge variant={property.status === 'AVAILABLE' ? 'success' : 'warning'}>
                {PROPERTY_STATUS_LABELS[property.status]}
              </Badge>
            </Card>

            {/* Description */}
            <Card>
              <h2 className="text-h2 mb-md">Description</h2>
              <p className="text-body text-neutral-text-secondary whitespace-pre-line">
                {property.description}
              </p>
            </Card>

            {/* Amenities */}
            {property.amenities && property.amenities.length > 0 && (
              <Card>
                <h2 className="text-h2 mb-md">Amenities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity.id}
                      className="flex items-center gap-2 p-2 bg-neutral-bg rounded"
                    >
                      <Check className="w-4 h-4 text-brand-primary" />
                      <span className="text-body">{amenity.name}</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Location Map */}
            <Card>
              <h2 className="text-h2 mb-md">Location</h2>
              <PropertyMap
                center={{
                  lat: property.location.lat,
                  lng: property.location.lng,
                }}
                properties={[property]}
              />
            </Card>

            {/* Documents */}
            {property && (
              <PropertyDocuments propertyId={property.id} isOwner={isOwner} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-lg">
            {/* NEW: Stage-Based CTA Section (Replaces static payment buttons) */}
            {!isOwner && renderStageBasedCTA()}

            {/* Action Buttons - Only show for tenants in early stages */}
            {!isOwner && userJourneyStage === 'discover' && (
              <Card>
                <h3 className="text-h3 mb-md">Quick Actions</h3>
                <div className="space-y-md">
                  <Button
                    variant="outline"
                    size="md"
                    fullWidth
                    leftIcon={<MessageSquare className="w-5 h-5" />}
                    onClick={handleSendMessage}
                  >
                    Send Message
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
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
              </Card>
            )}

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
              {similarProperties.map((prop) => (
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

      {/* Modals */}
      {property && (
        <>
          {/* Appointment Modal */}
          <AppointmentModal
            isOpen={showAppointmentModal}
            onClose={() => setShowAppointmentModal(false)}
            property={property}
            onSuccess={() => {
              toast.success('Viewing request sent!');
              setShowAppointmentModal(false);
            }}
          />

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

          {/* Payment Modal */}
          <PaymentModal
            isOpen={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            property={property}
            amount={
              selectedPaymentType === 'DEPOSIT'
                ? property.price * 2
                : selectedPaymentType === 'BOOKING'
                ? 5000
                : property.price
            }
            paymentType={selectedPaymentType}
            onSuccess={handlePaymentSuccess}
          />
        </>
      )}
    </div>
  );
}