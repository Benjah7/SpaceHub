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
import type { Property } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useLanguageStore } from '@/lib/store/language-store';
import toast from 'react-hot-toast';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguageStore();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [similarProperties, setSimilarProperties] = useState<Property[]>([]);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await apiClient.get<Property>(`/properties/${params.id}`);
        // setProperty(response.data);
        
        // Mock delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching property:', error);
        toast.error('Failed to load property details');
        setLoading(false);
      }
    };

    fetchProperty();
  }, [params.id]);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner w-12 h-12" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-3xl">
          <h2 className="text-h2 mb-md">Property Not Found</h2>
          <p className="text-body text-neutral-text-secondary mb-lg">
            The property you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.push('/listings')}>
            Browse Properties
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      {/* Back Button */}
      <div className="container-custom py-lg">
        <Button
          variant="text"
          onClick={() => router.back()}
          leftIcon={<ArrowLeft className="w-5 h-5" />}
        >
          Back to Listings
        </Button>
      </div>

      {/* Image Gallery */}
      <section className="bg-neutral-surface">
        <div className="container-custom py-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* Main Image */}
            <motion.div
              className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Image
                src={property.images[selectedImageIndex]?.url || '/placeholder.jpg'}
                alt={property.title}
                fill
                className="object-cover"
                priority
              />

              {/* Image Navigation */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/70 text-white rounded-full text-small">
                    {selectedImageIndex + 1} / {property.images.length}
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 right-4 flex gap-2">
                <button
                  onClick={handleShare}
                  className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="p-3 bg-white/90 rounded-full hover:bg-white transition-colors"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-status-error text-status-error' : ''
                    }`}
                  />
                </button>
              </div>
            </motion.div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-md">
              {property.images.map((image, index) => (
                <motion.button
                  key={image.id}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-24 rounded-lg overflow-hidden ${
                    selectedImageIndex === index
                      ? 'ring-4 ring-brand-primary'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Image
                    src={image.url}
                    alt={`${property.title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Property Details */}
      <section className="container-custom py-xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-xl">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between mb-md">
                <div>
                  <h1 className="text-h1 mb-2">{property.title}</h1>
                  <div className="flex items-center gap-md text-neutral-text-secondary">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-5 h-5" />
                      <span>{property.location.neighborhood}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-5 h-5" />
                      <span>{property.size} sqm</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {property.verified && (
                    <Badge variant="success">
                      <Check className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                  <Badge variant="success">{property.status}</Badge>
                </div>
              </div>

              <div className="bg-brand-accent/10 p-lg rounded-lg">
                <p className="text-h1 font-bold text-brand-accent mb-1">
                  {formatCurrency(property.price)}
                </p>
                <p className="text-body text-neutral-text-secondary">
                  per month
                </p>
              </div>
            </motion.div>

            {/* Description */}
            <Card>
              <h2 className="text-h2 mb-md">Description</h2>
              <p className="text-body text-neutral-text-secondary leading-relaxed">
                {property.description}
              </p>
            </Card>

            {/* Features */}
            <Card>
              <h2 className="text-h2 mb-md">Features & Amenities</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-md">
                {property.amenities.map((amenity) => (
                  <div
                    key={amenity.id}
                    className="flex items-center gap-2 text-body"
                  >
                    <Check className="w-5 h-5 text-status-success" />
                    <span>{amenity.name}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Property Details */}
            <Card>
              <h2 className="text-h2 mb-md">Property Details</h2>
              <div className="grid grid-cols-2 gap-lg">
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Property Type
                  </p>
                  <p className="text-body font-medium">{property.propertyType}</p>
                </div>
                <div>
                  <p className="text-small text-neutral-text-secondary mb-1">
                    Size
                  </p>
                  <p className="text-body font-medium">{property.size} sqm</p>
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
                    Listed On
                  </p>
                  <p className="text-body font-medium">
                    {formatDate(property.createdAt)}
                  </p>
                </div>
              </div>
            </Card>

            {/* Location Map - Placeholder */}
            <Card>
              <h2 className="text-h2 mb-md">Location</h2>
              <div className="bg-neutral-bg rounded-lg h-[400px] flex items-center justify-center">
                <p className="text-neutral-text-secondary">
                  Map integration coming soon
                </p>
              </div>
              <div className="mt-md">
                <p className="text-body font-medium">{property.location.address}</p>
                <p className="text-small text-neutral-text-secondary">
                  {property.location.neighborhood}, {property.location.city}
                </p>
              </div>
            </Card>
          </div>

          {/* Sidebar - Owner Card */}
          <div className="lg:col-span-1">
            <motion.div
              className="sticky top-20"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <div className="text-center mb-lg">
                  <div className="w-20 h-20 rounded-full bg-brand-primary/10 mx-auto mb-md flex items-center justify-center">
                    <span className="text-h1 text-brand-primary">
                      {property.owner.firstName[0]}{property.owner.lastName[0]}
                    </span>
                  </div>
                  <h3 className="text-h3 font-semibold">
                    {property.owner.firstName} {property.owner.lastName}
                  </h3>
                  <p className="text-small text-neutral-text-secondary">
                    Property Owner
                  </p>
                  {property.owner.verified && (
                    <Badge variant="info" className="mt-2">
                      <Check className="w-3 h-3 mr-1" />
                      Verified Owner
                    </Badge>
                  )}
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(property.owner.rating)
                            ? 'fill-brand-secondary text-brand-secondary'
                            : 'text-neutral-border'
                        }`}
                      />
                    ))}
                    <span className="text-small text-neutral-text-secondary ml-1">
                      ({property.owner.reviewCount})
                    </span>
                  </div>
                </div>

                <div className="space-y-md">
                  <Button
                    variant="primary"
                    fullWidth
                    onClick={() => setShowInquiryModal(true)}
                  >
                    Send Inquiry
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => setShowContactModal(true)}
                    leftIcon={<Phone className="w-5 h-5" />}
                  >
                    Contact Owner
                  </Button>
                  <Button
                    variant="secondary"
                    fullWidth
                    leftIcon={<Calendar className="w-5 h-5" />}
                  >
                    Schedule Visit
                  </Button>
                </div>

                <div className="mt-lg pt-lg border-t">
                  <p className="text-tiny text-neutral-text-secondary text-center">
                    Response time: Usually within 24 hours
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties.length > 0 && (
        <section className="bg-neutral-surface py-3xl">
          <div className="container-custom">
            <h2 className="text-h1 mb-xl">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
              {similarProperties.map((prop) => (
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  onClick={(p) => router.push(`/properties/${p.id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact Modal */}
      <Modal
        isOpen={showContactModal}
        onClose={() => setShowContactModal(false)}
        title="Contact Owner"
        description="Get in touch with the property owner"
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
        title="Send Inquiry"
        description="Send a message to the property owner"
      >
        <form className="space-y-md">
          <Input label="Your Name" type="text" required />
          <Input label="Email" type="email" required />
          <Input label="Phone" type="tel" required />
          <Textarea
            label="Message"
            placeholder="I'm interested in this property..."
            rows={5}
            required
            showCharCount
            maxLength={500}
          />
          <Button type="submit" variant="primary" fullWidth>
            Send Inquiry
          </Button>
        </form>
      </Modal>
    </div>
  );
}
