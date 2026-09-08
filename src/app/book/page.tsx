'use client';

import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { uploadMediaFile } from '@/lib/uploadClient';

import {
  Sparkles,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  Image as ImageIcon,
  Link as LinkIcon,
  AlertCircle,
  Package as PackageIcon,
  User,
  Building,
  Mail,
  Phone,
  Check,
  Zap,
  ShieldCheck,
  QrCode,
  Copy,
  CheckCheck,
  Smartphone,
  CreditCard,
  FileText,
  Loader2,
  Globe,
  Sliders,
  Send,
  Video,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const UPI_ID = '9925263558@upi';
const UPI_PAYEE_NAME = 'Gujju AI Studio';
const WHATSAPP_SUPPORT_NUMBER = '919925263558';

interface StandardPackage {
  name: string;
  badge: string;
  price: number;
  duration: string;
  desc: string;
  features: string[];
}

const STANDARD_PACKAGES: Record<string, StandardPackage> = {
  starter: {
    name: 'Starter Package',
    badge: '🥉 Starter',
    price: 600,
    duration: 'Up to 15 Seconds',
    desc: 'Perfect for quick Instagram Reels & TikTok hooks with AI-generated visuals.',
    features: [
      '1 AI Product Reel',
      'Up to 15 Seconds',
      '1 Revision',
      'Delivery in 2 Days',
      '1080p HD Vertical Reel Format',
      'E-commerce Product Highlight',
    ],
  },
  professional: {
    name: 'Professional Package',
    badge: '🥈 Most Popular',
    price: 1200,
    duration: 'Up to 30 Seconds Each',
    desc: 'Cinematic AI model showcase with multiple scene transitions and high conversion script.',
    features: [
      '1 AI Product Reel',
      'Up to 30 Seconds Each',
      'AI Voiceover (Hindi / English / Gujarati)',
      'Commercial Use License',
      '1 Revision',
      'Delivery in 2 Days',
      '4K Crisp Vertical Reel Format',
    ],
  },
  premium: {
    name: 'Premium Package',
    badge: '🥇 Premium Quality',
    price: 2300,
    duration: 'Up to 60 Seconds Each',
    desc: 'Full-length 4K commercial-grade AI ad with lifelike avatars, VFX, and multi-format exports.',
    features: [
      '1 AI Product Reel',
      'Up to 60 Seconds Each',
      'AI Voiceover',
      'Background Music',
      '1 Revision',
      'Delivery in 2 Days',
      'Cinematic AI VFX & Dynamic Scripting',
      'Full Commercial Rights',
    ],
  },
};

const TIME_SLOTS = [
  { id: 'morning', label: '10:00 AM - 12:00 PM', period: 'Morning Slot' },
  { id: 'afternoon', label: '01:00 PM - 03:00 PM', period: 'Afternoon Slot' },
  { id: 'evening', label: '04:00 PM - 06:00 PM', period: 'Evening Slot' },
  { id: 'night', label: '07:00 PM - 09:00 PM', period: 'Night Slot' },
];

const TARGET_PLATFORMS_LIST = [
  { id: 'Instagram Reels', label: 'Instagram Reels' },
  { id: 'YouTube Shorts', label: 'YouTube Shorts' },
  { id: 'Facebook Reels / Ads', label: 'Facebook Reels / Ads' },
  { id: 'Website / Landing Page', label: 'Website / Landing Page' },
  { id: 'Other', label: 'Other' },
];

const DELIVERY_PLATFORMS_LIST = [
  { id: 'WhatsApp', label: 'WhatsApp' },
  { id: 'Email', label: 'Email' },
  { id: 'Google Drive', label: 'Google Drive Link' },
  { id: 'WeTransfer', label: 'WeTransfer' },
  { id: 'Other', label: 'Other' },
];

const VIDEO_FORMATS = [
  { id: '9:16 Vertical Reel', label: '9:16 Vertical Reel (Instagram / Shorts / TikTok)', desc: 'Standard vertical reel format (1080x1920)' },
  { id: '16:9 Landscape', label: '16:9 Landscape (YouTube / TV / Website)', desc: 'Horizontal wide format (1920x1080)' },
  { id: '1:1 Square', label: '1:1 Square (Feed Post / Ad)', desc: 'Square format (1080x1080)' },
];

const VIDEO_STYLES = [
  { id: 'Cinematic Realistic AI', label: 'Cinematic Realistic AI', desc: 'Photorealistic AI actors, cinematic lighting & camera movement' },
  { id: '3D Animated Product', label: '3D Animated Product Showcase', desc: 'Futuristic floating 3D product renders & CGI effects' },
  { id: 'Trending Meme / Humor', label: 'Trending Meme / Humor Style', desc: 'Viral meme format, high-energy hooks & dynamic text' },
  { id: 'Hook & Storytelling', label: 'Hook & Storytelling Format', desc: 'Problem-solving narration, before/after demonstration' },
  { id: 'Luxury Minimalist Aesthetic', label: 'Luxury Minimalist Aesthetic', desc: 'High-end elegant aesthetic with smooth ambient pacing' },
  { id: 'Other / Custom', label: 'Other / Custom Style', desc: 'Specify your own custom aesthetic or style' },
];

function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();

  const pkgParam = searchParams.get('package');

  // Package Mode: 'standard' or 'custom'
  const [packageType, setPackageType] = useState<'standard' | 'custom'>(
    pkgParam === 'custom' ? 'custom' : 'standard'
  );

  // Standard package selection
  const [selectedStandardPkg, setSelectedStandardPkg] = useState<string>(
    pkgParam && STANDARD_PACKAGES[pkgParam] ? pkgParam : 'professional'
  );

  // Custom Package Builder Configuration
  const [customConfig, setCustomConfig] = useState({
    reelCount: 1,
    duration: 15 as 15 | 30 | 60,
    revisions: 1 as 1 | 2 | 99, // 99 for unlimited
    urgentDelivery: false,
  });

  // Calculate Custom Price
  const customCalculatedPrice = useMemo(() => {
    // Base 1st reel = 1000, additional = 600
    const baseReelsPrice = 1000 + (customConfig.reelCount - 1) * 600;
    
    // Duration adder per reel
    const durationAdderPerReel = customConfig.duration === 60 ? 500 : customConfig.duration === 30 ? 200 : 0;
    const totalDurationAdder = durationAdderPerReel * customConfig.reelCount;

    // Revision adder
    const revisionAdder = customConfig.revisions === 99 ? 800 : customConfig.revisions === 2 ? 300 : 0;

    // Urgent delivery
    const urgentAdder = customConfig.urgentDelivery ? 500 : 0;

    return baseReelsPrice + totalDurationAdder + revisionAdder + urgentAdder;
  }, [customConfig]);

  // If user arrived with a valid package param from pricing page (and not 'custom'), jump directly to Step 2
  const [currentStep, setCurrentStep] = useState(
    pkgParam && STANDARD_PACKAGES[pkgParam] ? 2 : 1
  );

  // Sync package query parameter changes
  useEffect(() => {
    if (pkgParam) {
      if (pkgParam === 'custom') {
        setPackageType('custom');
        setCurrentStep(1);
      } else if (STANDARD_PACKAGES[pkgParam]) {
        setPackageType('standard');
        setSelectedStandardPkg(pkgParam);
        setCurrentStep(2);
      }
    }
  }, [pkgParam]);

  // Step 2: Date & Time
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0].label);

  // Step 3: Client & Project Details
  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    websiteUrl: '',
    productDescription: '',
    targetPlatforms: ['Instagram Reels'] as string[],
    deliveryPlatform: 'WhatsApp',
    deliveryPlatformOther: '',
    videoFormat: '9:16 Vertical Reel',
    videoStyle: 'Cinematic Realistic AI',
    videoStyleCustom: '',
    referenceLink: '',
    deliveryRequirement: 'Standard (48-72 Hours)',
    additionalInstructions: '',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Step 5: Payment state
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Auto-fill from logged-in session
  useEffect(() => {
    if (session?.user) {
      setFormData((prev) => ({
        ...prev,
        name: prev.name || session.user?.name || '',
        email: prev.email || session.user?.email || '',
        phone: prev.phone || (session.user as any)?.phoneNumber || '',
        businessName: prev.businessName || (session.user as any)?.businessName || '',
      }));
    }
  }, [session]);

  // Compute Active Package Info
  const activePackage = useMemo(() => {
    if (packageType === 'custom') {
      const revisionText = customConfig.revisions === 99 ? 'Unlimited Revisions' : `${customConfig.revisions} Revision${customConfig.revisions > 1 ? 's' : ''}`;
      const deliveryText = customConfig.urgentDelivery ? 'Urgent 24-Hour Express' : 'Standard 48-72h Delivery';
      return {
        id: 'custom',
        name: `Custom Package (${customConfig.reelCount} Reel${customConfig.reelCount > 1 ? 's' : ''})`,
        badge: '✨ Custom Tailored',
        price: customCalculatedPrice,
        duration: `Up to ${customConfig.duration} Seconds Each`,
        desc: `Custom configuration of ${customConfig.reelCount} reel(s), ${customConfig.duration}s duration, with ${revisionText}.`,
        features: [
          `${customConfig.reelCount} AI Product Reel${customConfig.reelCount > 1 ? 's' : ''}`,
          `Up to ${customConfig.duration} Seconds Each`,
          revisionText,
          deliveryText,
          'Full Commercial Rights & 4K Output'
        ],
        customOptions: customConfig,
      };
    }
    const std = STANDARD_PACKAGES[selectedStandardPkg] || STANDARD_PACKAGES.professional;
    return {
      id: selectedStandardPkg,
      ...std,
      customOptions: null,
    };
  }, [packageType, selectedStandardPkg, customConfig, customCalculatedPrice]);

  // Dynamic UPI URL for QR code & Direct UPI intent
  const upiPayUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${activePackage.price}&cu=INR&tn=${encodeURIComponent(`Booking - ${activePackage.name}`)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiPayUrl)}&margin=10`;

  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Target Platform toggle
  const toggleTargetPlatform = (platform: string) => {
    setFormData((prev) => {
      const exists = prev.targetPlatforms.includes(platform);
      if (exists) {
        return { ...prev, targetPlatforms: prev.targetPlatforms.filter((p) => p !== platform) };
      } else {
        return { ...prev, targetPlatforms: [...prev.targetPlatforms, platform] };
      }
    });
  };

  // Upload Project Assets
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls = [...uploadedImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadMediaFile(file, { folder: 'booking_assets' });
        if (url) {
          newUrls.push(url);
        }
      } catch (err) {
        console.error('Error uploading file:', err);
      }
    }

    setUploadedImages(newUrls);
    setUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  // Upload Payment Screenshot
  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    try {
      const url = await uploadMediaFile(file, { folder: 'payment_proofs' });
      if (url) {
        setPaymentProofUrl(url);
      }
    } catch (err) {
      console.error('Error uploading payment receipt:', err);
    } finally {
      setUploadingProof(false);
    }
  };


  // Final Submission to API
  const handleFinalSubmitWithPayment = async (isPaidViaUpi: boolean = true) => {
    if (!formData.name || !formData.email || !formData.phone || !formData.productDescription) {
      setError('Please fill in all required client and project fields.');
      setCurrentStep(3);
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a booking date and time slot.');
      setCurrentStep(2);
      return;
    }

    if (formData.targetPlatforms.length === 0) {
      setError('Please select at least one Target Platform where you plan to post/use the video.');
      setCurrentStep(3);
      return;
    }

    if (isPaidViaUpi && !upiTransactionId.trim() && !paymentProofUrl) {
      setError('Please enter your 12-digit UPI UTR / Transaction ID or upload a payment screenshot.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          businessName: formData.businessName || formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          websiteUrl: formData.websiteUrl || null,
          packageId: activePackage.id,
          packageName: `${activePackage.badge} - ${activePackage.name}`,
          price: activePackage.price,
          description: formData.productDescription,
          targetPlatforms: formData.targetPlatforms,
          deliveryPlatform: formData.deliveryPlatform,
          deliveryPlatformOther: formData.deliveryPlatform === 'Other' ? formData.deliveryPlatformOther : null,
          videoFormat: formData.videoFormat,
          videoStyle: formData.videoStyle,
          videoStyleCustom: formData.videoStyle === 'Other / Custom' ? formData.videoStyleCustom : null,
          refLink: formData.referenceLink || null,
          imageUrls: uploadedImages,
          deliveryRequirement: activePackage.customOptions?.urgentDelivery ? 'Urgent (24 Hours)' : formData.deliveryRequirement,
          additionalInstructions: formData.additionalInstructions || null,
          customOptions: activePackage.customOptions ? JSON.stringify(activePackage.customOptions) : null,
          bookingDate: selectedDate,
          bookingTime: selectedTimeSlot,
          paymentStatus: isPaidViaUpi ? 'PENDING_VERIFICATION' : 'UNPAID',
          paymentRef: upiTransactionId.trim() || (isPaidViaUpi ? 'PAID_VIA_UPI_APP' : null),
          paymentProof: paymentProofUrl || null,
          paymentMethod: 'UPI',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit booking.');
      } else {
        setCreatedBooking(data.booking);
        setCurrentStep(6);
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Wizard Step Progress Tracker */}
      {currentStep <= 5 && (
        <div className="mb-8">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-200 -translate-y-1/2 z-0" />
            <div
              className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-brand-500 via-accent-cyan to-emerald-400 -translate-y-1/2 z-0 transition-all duration-300"
              style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
            />

            {[
              { num: 1, title: 'Package' },
              { num: 2, title: 'Date & Slot' },
              { num: 3, title: 'Project Details' },
              { num: 4, title: 'Review' },
              { num: 5, title: 'Payment' },
            ].map((step) => {
              const isCompleted = currentStep > step.num;
              const isCurrent = currentStep === step.num;
              return (
                <div key={step.num} className="relative z-10 flex flex-col items-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
                      isCompleted
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                        : isCurrent
                        ? 'bg-gradient-to-tr from-brand-600 to-accent-cyan text-white ring-4 ring-brand-500/20'
                        : 'bg-surface-100 text-gray-500 border border-surface-200'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                  </div>
                  <span className={`text-[11px] font-semibold mt-1.5 hidden sm:block ${isCurrent ? 'text-white' : 'text-gray-400'}`}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-400 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 1: SELECT OR CUSTOMIZE PACKAGE                          */}
      {/* ============================================================ */}
      {currentStep === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <PackageIcon className="w-6 h-6 text-brand-400" />
                1. Choose Your Package Type
              </h2>
              <p className="text-xs sm:text-sm text-gray-400 mt-1">
                Select a standard pricing plan or build a custom package tailored to your exact needs.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex p-1 rounded-xl bg-surface-100 border border-surface-200/80 shrink-0">
              <button
                type="button"
                onClick={() => setPackageType('standard')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  packageType === 'standard'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Standard Packages
              </button>
              <button
                type="button"
                onClick={() => setPackageType('custom')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                  packageType === 'custom'
                    ? 'bg-brand-600 text-white shadow-md'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Custom Package
              </button>
            </div>
          </div>

          {/* Tab 1: Standard Packages Grid */}
          {packageType === 'standard' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(STANDARD_PACKAGES).map(([key, pkg]) => {
                const isSelected = selectedStandardPkg === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedStandardPkg(key)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative flex flex-col justify-between ${
                      isSelected
                        ? 'bg-brand-950/40 border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/40'
                        : 'bg-surface-100/40 border-surface-200/60 hover:border-surface-200 hover:bg-surface-100/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
                            {pkg.badge}
                          </span>
                          <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                          <p className="text-xs text-gray-400 mt-1">{pkg.desc}</p>
                        </div>
                      </div>

                      <div className="mt-3 mb-3">
                        <span className="text-2xl font-black text-brand-400">
                          {formatCurrencyINR(pkg.price)}
                        </span>
                        <span className="text-[11px] text-gray-400 ml-1">/ reel</span>
                        <p className="text-[10px] text-gray-500">{pkg.duration}</p>
                      </div>

                      <ul className="space-y-1.5 border-t border-surface-200/40 pt-3">
                        {pkg.features.map((feat, i) => (
                          <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-200/30 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-400">
                        {isSelected ? '✓ Selected' : 'Click to select'}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-brand-400 bg-brand-500 text-white' : 'border-gray-500'}`}>
                        {isSelected && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Tab 2: Custom Package Configurator */}
          {packageType === 'custom' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div className="text-xs text-gray-300 leading-relaxed">
                  <strong>Custom Package Builder:</strong> Configure the exact number of AI Reels, duration per reel, revisions, and delivery turnaround. The price updates in real-time.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Number of Reels */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-200 uppercase tracking-wider">
                      Number of AI Reels
                    </label>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 font-extrabold text-sm border border-brand-500/40">
                      {customConfig.reelCount} {customConfig.reelCount === 1 ? 'Reel' : 'Reels'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={15}
                    value={customConfig.reelCount}
                    onChange={(e) => setCustomConfig({ ...customConfig, reelCount: parseInt(e.target.value) || 1 })}
                    className="w-full accent-brand-500 cursor-pointer h-2 bg-surface-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>1 Reel (Base ₹1,000)</span>
                    <span>15 Reels (Bulk)</span>
                  </div>
                </div>

                {/* 2. Duration per Reel */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                    Duration per Reel
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { sec: 15, label: '15 Sec', tag: 'Standard' },
                      { sec: 30, label: '30 Sec', tag: '+₹200/reel' },
                      { sec: 60, label: '60 Sec', tag: '+₹500/reel' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.sec}
                        onClick={() => setCustomConfig({ ...customConfig, duration: item.sec as any })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          customConfig.duration === item.sec
                            ? 'bg-brand-600/30 border-brand-400 text-white ring-2 ring-brand-500/30'
                            : 'bg-surface-100 border-surface-200/60 text-gray-300 hover:text-white hover:bg-surface-100/80'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-gray-400 block">{item.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Revisions Tier */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/50 border border-surface-200/60">
                  <label className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                    Revisions Included
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { val: 1, label: '1 Revision', tag: 'Included' },
                      { val: 2, label: '2 Revisions', tag: '+₹300' },
                      { val: 99, label: 'Unlimited', tag: '+₹800' },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setCustomConfig({ ...customConfig, revisions: item.val as any })}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          customConfig.revisions === item.val
                            ? 'bg-brand-600/30 border-brand-400 text-white ring-2 ring-brand-500/30'
                            : 'bg-surface-100 border-surface-200/60 text-gray-300 hover:text-white hover:bg-surface-100/80'
                        }`}
                      >
                        <span className="text-xs font-bold block">{item.label}</span>
                        <span className="text-[10px] text-gray-400 block">{item.tag}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Urgent 24-Hour Delivery Toggle */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface-100/50 border border-surface-200/60 flex flex-col justify-between">
                  <div>
                    <label className="text-xs font-bold text-gray-200 uppercase tracking-wider block">
                      Delivery Turnaround
                    </label>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Standard delivery is 48-72 hours. Need it rushed in 24 hours?
                    </p>
                  </div>

                  <label className="flex items-center justify-between p-2.5 rounded-xl bg-surface-100 border border-surface-200/80 cursor-pointer hover:border-brand-500/50 transition-all">
                    <div className="flex items-center gap-2">
                      <Zap className={`w-4 h-4 ${customConfig.urgentDelivery ? 'text-amber-400' : 'text-gray-500'}`} />
                      <span className="text-xs font-bold text-white">24-Hour Express Delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-amber-400 font-bold">+₹500</span>
                      <input
                        type="checkbox"
                        checked={customConfig.urgentDelivery}
                        onChange={(e) => setCustomConfig({ ...customConfig, urgentDelivery: e.target.checked })}
                        className="w-4 h-4 accent-brand-500 rounded cursor-pointer"
                      />
                    </div>
                  </label>
                </div>

              </div>

              {/* Dynamic Price Summary Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-brand-950/60 via-surface-100/80 to-brand-950/60 border border-brand-500/40 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-300">Custom Package Total</span>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                    {formatCurrencyINR(customCalculatedPrice)}
                  </div>
                  <p className="text-xs text-gray-400">
                    {customConfig.reelCount} Reel(s) • {customConfig.duration}s duration • {customConfig.revisions === 99 ? 'Unlimited' : customConfig.revisions} revision(s) • {customConfig.urgentDelivery ? '24h Express' : '48-72h Standard'}
                  </p>
                </div>
                <div className="text-xs text-gray-400 text-right hidden sm:block">
                  <span className="block font-semibold text-white">Full Commercial Rights Included</span>
                  <span className="text-[11px]">1080p / 4K UHD Render</span>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-surface-200/50">
            <button
              onClick={() => {
                setError('');
                setCurrentStep(2);
              }}
              className="btn-glow px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Continue to Date & Time
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 2: SELECT DATE & TIME SLOT                              */}
      {/* ============================================================ */}
      {currentStep === 2 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          
          {/* Selected Package Banner */}
          <div className="p-4 rounded-2xl bg-brand-950/60 border border-brand-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-brand-500/10">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-xl bg-brand-500/20 text-brand-300 font-extrabold text-xs border border-brand-500/30">
                {activePackage.badge}
              </span>
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base">{activePackage.name}</h3>
                <p className="text-[11px] text-gray-400">{activePackage.duration} • {activePackage.customOptions?.urgentDelivery ? '24-Hour Express' : '2-Day Turnaround'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-lg font-black text-emerald-400">{formatCurrencyINR(activePackage.price)}</span>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="px-3 py-1 rounded-xl bg-white/5 hover:bg-white/10 text-brand-300 hover:text-white text-xs font-semibold border border-brand-500/30 transition-all"
              >
                Change Package
              </button>
            </div>
          </div>

          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-400" />
              2. Select Booking Date & Time Slot
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Pick your preferred project initiation date and creative onboarding slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Select Booking Date <span className="text-brand-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  min={minDate}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-2xl bg-surface-100 border border-surface-200 text-white text-sm focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-gray-400">
                Selected: <strong className="text-brand-300">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>
              </p>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Select Available Time Slot <span className="text-brand-400">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedTimeSlot === slot.label;
                  return (
                    <button
                      type="button"
                      key={slot.id}
                      onClick={() => setSelectedTimeSlot(slot.label)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-brand-600/30 border-brand-400 text-white ring-2 ring-brand-500/30'
                          : 'bg-surface-100/60 border-surface-200/60 text-gray-300 hover:bg-surface-100 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{slot.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                      </div>
                      <span className="text-[10px] text-gray-400">{slot.period}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-200/50">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100 border border-surface-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Package
            </button>

            <button
              onClick={() => {
                if (!selectedDate || !selectedTimeSlot) {
                  setError('Please choose a date and time slot.');
                  return;
                }
                setError('');
                setCurrentStep(3);
              }}
              className="btn-glow px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Continue to Project Details
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 3: CLIENT & PROJECT DETAILS                             */}
      {/* ============================================================ */}
      {currentStep === 3 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-8 animate-in fade-in duration-200">
          
          {/* Section 1: Client Information */}
          <div className="space-y-4">
            <div className="border-b border-surface-200/50 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-400" />
                Client & Contact Information
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                We will use this information for order updates, script review, and support.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Your Full Name <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Business / Brand Name
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="e.g. Surat Fashion Hub"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Email Address <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  WhatsApp / Phone Number <span className="text-brand-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Website / Social Profile URL (Optional)
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.websiteUrl}
                    onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                    placeholder="https://yourbrand.com or instagram.com/brand"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Specifications & Video Details */}
          <div className="space-y-6 pt-2">
            <div className="border-b border-surface-200/50 pb-3">
              <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                <Video className="w-5 h-5 text-accent-cyan" />
                AI Reel Specifications & Requirements
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Tell us about your product, platforms, visual styles, and delivery preferences.
              </p>
            </div>

            {/* Product / Reel Description */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Product Description / Video Requirement <span className="text-brand-400">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={formData.productDescription}
                onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
                placeholder="Example: We sell handmade clay bottles and want a viral reel showing the water cooling process with traditional Indian aesthetic music and English/Hindi captions."
                className="w-full p-4 rounded-xl bg-surface-100 border border-surface-200 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
              />
            </div>

            {/* Target Platforms (Where client will publish) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Target Publishing Platform(s) <span className="text-brand-400">*</span>
                <span className="text-[10px] text-gray-400 lowercase font-normal ml-2">(Where will you publish/post this video?)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {TARGET_PLATFORMS_LIST.map((platform) => {
                  const isChecked = formData.targetPlatforms.includes(platform.id);
                  return (
                    <button
                      type="button"
                      key={platform.id}
                      onClick={() => toggleTargetPlatform(platform.id)}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isChecked
                          ? 'bg-brand-600/30 border-brand-400 text-white ring-1 ring-brand-500/40'
                          : 'bg-surface-100/60 border-surface-200/60 text-gray-400 hover:text-white hover:bg-surface-100'
                      }`}
                    >
                      <span className="text-xs font-semibold">{platform.label}</span>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${isChecked ? 'bg-brand-500 border-brand-400 text-white' : 'border-gray-600'}`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delivery Platform (Where studio delivers video to client) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                AI Reel Delivery Platform <span className="text-brand-400">*</span>
                <span className="text-[10px] text-gray-400 lowercase font-normal ml-2">(Where should we deliver your completed video files?)</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {DELIVERY_PLATFORMS_LIST.map((del) => {
                  const isSelected = formData.deliveryPlatform === del.id;
                  return (
                    <button
                      type="button"
                      key={del.id}
                      onClick={() => setFormData({ ...formData, deliveryPlatform: del.id })}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-brand-600/30 border-brand-400 text-white ring-1 ring-brand-500/40'
                          : 'bg-surface-100/60 border-surface-200/60 text-gray-400 hover:text-white hover:bg-surface-100'
                      }`}
                    >
                      <span className="text-xs font-semibold">{del.label}</span>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'bg-brand-500 border-brand-400 text-white' : 'border-gray-600'}`}>
                        {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              {formData.deliveryPlatform === 'Other' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={formData.deliveryPlatformOther}
                    onChange={(e) => setFormData({ ...formData, deliveryPlatformOther: e.target.value })}
                    placeholder="Specify other delivery platform (e.g. Telegram, Dropbox, Mega)"
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Video Format Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Video Format & Aspect Ratio
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {VIDEO_FORMATS.map((fmt) => {
                  const isSelected = formData.videoFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setFormData({ ...formData, videoFormat: fmt.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-600/25 border-brand-400 text-white ring-1 ring-brand-500/40'
                          : 'bg-surface-100/50 border-surface-200/60 text-gray-300 hover:bg-surface-100'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{fmt.label.split('(')[0]}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">{fmt.desc}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Style Selection */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Preferred AI Visual Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {VIDEO_STYLES.map((style) => {
                  const isSelected = formData.videoStyle === style.id;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setFormData({ ...formData, videoStyle: style.id })}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-brand-600/25 border-brand-400 text-white ring-1 ring-brand-500/40'
                          : 'bg-surface-100/50 border-surface-200/60 text-gray-300 hover:bg-surface-100'
                      }`}
                    >
                      <span className="text-xs font-bold block text-white">{style.label}</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5 line-clamp-2">{style.desc}</span>
                    </div>
                  );
                })}
              </div>

              {formData.videoStyle === 'Other / Custom' && (
                <div className="pt-2">
                  <input
                    type="text"
                    value={formData.videoStyleCustom}
                    onChange={(e) => setFormData({ ...formData, videoStyleCustom: e.target.value })}
                    placeholder="Describe your custom visual style preference..."
                    className="w-full px-4 py-2.5 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>

            {/* Reference Links & Upload Assets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Reference Video / Competitor Reel Link
                </label>
                <div className="relative">
                  <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={formData.referenceLink}
                    onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                    placeholder="https://instagram.com/reel/... or Google Drive"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                  Delivery Requirement Timeframe
                </label>
                <select
                  value={formData.deliveryRequirement}
                  onChange={(e) => setFormData({ ...formData, deliveryRequirement: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                >
                  <option value="Standard (48-72 Hours)">Standard Delivery (48 - 72 Hours)</option>
                  <option value="Urgent (24 Hours)">Urgent Delivery (Within 24 Hours)</option>
                  <option value="Flexible (Within 1 Week)">Flexible Timeline (Within 1 Week)</option>
                </select>
              </div>
            </div>

            {/* Product Photos Upload */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
                Upload Product Photos & Logo Assets (Optional)
              </label>
              <div className="border-2 border-dashed border-surface-200/80 rounded-2xl p-4 text-center bg-surface-100/40 hover:bg-surface-100/60 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  id="file-upload"
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-1.5">
                  <Upload className="w-6 h-6 text-brand-400" />
                  <span className="text-xs font-semibold text-white">Click to upload product photos / logo PNG</span>
                  <span className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB</span>
                </label>
              </div>

              {uploading && (
                <p className="text-xs text-brand-400 flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                  Uploading assets...
                </p>
              )}

              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {uploadedImages.map((url, i) => (
                    <div key={i} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-surface-200">
                      <img src={url} alt="upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 font-bold text-xs transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Additional Instructions */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                Additional Instructions / Voiceover Language Preference (Optional)
              </label>
              <textarea
                rows={2}
                value={formData.additionalInstructions}
                onChange={(e) => setFormData({ ...formData, additionalInstructions: e.target.value })}
                placeholder="e.g. Please use energetic Hindi voiceover with trendy Gujarati slang, include our brand logo at the top right..."
                className="w-full p-3 rounded-xl bg-surface-100 border border-surface-200 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-brand-500 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-200/50">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100 border border-surface-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Date & Slot
            </button>

            <button
              onClick={() => {
                if (!formData.name || !formData.email || !formData.phone || !formData.productDescription) {
                  setError('Please fill in your name, email, phone number, and product description.');
                  return;
                }
                if (formData.targetPlatforms.length === 0) {
                  setError('Please select at least one Target Platform.');
                  return;
                }
                setError('');
                setCurrentStep(4);
              }}
              className="btn-glow px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Review Booking Summary
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 4: REVIEW BOOKING DETAILS                               */}
      {/* ============================================================ */}
      {currentStep === 4 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              4. Review & Confirm Booking Specifications
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Please review your project details and pricing before proceeding to the secure UPI payment gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Box 1: Package & Financial Breakdown */}
            <div className="space-y-4 p-5 rounded-2xl bg-surface-100/60 border border-surface-200/60">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400 flex items-center gap-1.5">
                  <PackageIcon className="w-4 h-4" />
                  Selected Package & Schedule
                </h3>
                <span className="px-2 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 text-[10px] font-extrabold border border-brand-500/30">
                  {activePackage.badge}
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Package:</span>
                  <span className="font-bold text-white text-right">{activePackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-bold text-white">{activePackage.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking Date:</span>
                  <span className="font-bold text-brand-300">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Slot:</span>
                  <span className="font-bold text-white">{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Delivery Speed:</span>
                  <span className="font-bold text-amber-300">
                    {activePackage.customOptions?.urgentDelivery ? 'Urgent 24-Hour Express' : formData.deliveryRequirement}
                  </span>
                </div>

                <div className="flex justify-between border-t border-surface-200/50 pt-3 text-base">
                  <span className="font-bold text-white">Total Payable:</span>
                  <span className="font-black text-emerald-400 text-lg">{formatCurrencyINR(activePackage.price)}</span>
                </div>
              </div>
            </div>

            {/* Box 2: Client Contact Details */}
            <div className="space-y-4 p-5 rounded-2xl bg-surface-100/60 border border-surface-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-cyan flex items-center gap-1.5">
                <User className="w-4 h-4" />
                Client Contact Details
              </h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Name:</span>
                  <span className="font-bold text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Brand:</span>
                  <span className="font-bold text-white">{formData.businessName || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Email:</span>
                  <span className="font-bold text-white truncate max-w-[180px]">{formData.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Phone:</span>
                  <span className="font-bold text-white">{formData.phone}</span>
                </div>
                {formData.websiteUrl && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Website:</span>
                    <span className="font-bold text-brand-300 truncate max-w-[180px]">{formData.websiteUrl}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Box 3: Video Specifications & Target Platforms */}
            <div className="md:col-span-2 space-y-3 p-5 rounded-2xl bg-surface-100/40 border border-surface-200/60 text-xs">
              <h3 className="font-bold uppercase tracking-wider text-white text-[11px] flex items-center gap-1.5">
                <Video className="w-4 h-4 text-brand-400" />
                Project Specifications Breakdown
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-1">
                <div>
                  <span className="text-gray-400 block font-semibold">Target Publishing Platform(s):</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formData.targetPlatforms.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-brand-500/20 text-brand-300 font-medium text-[11px]">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold">Delivery Platform (Studio to Client):</span>
                  <span className="font-bold text-white mt-1 block">
                    {formData.deliveryPlatform === 'Other' ? `Other (${formData.deliveryPlatformOther || 'Custom'})` : formData.deliveryPlatform}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block font-semibold">Format & Style:</span>
                  <span className="font-bold text-white mt-1 block">
                    {formData.videoFormat} • {formData.videoStyle === 'Other / Custom' ? (formData.videoStyleCustom || 'Custom Style') : formData.videoStyle}
                  </span>
                </div>
              </div>

              <div className="border-t border-surface-200/40 pt-2.5">
                <span className="text-gray-400 block font-semibold">Project Requirements / Brief:</span>
                <p className="text-gray-200 mt-1 italic bg-[#080B11] p-3 rounded-xl border border-surface-200/50 leading-relaxed">
                  "{formData.productDescription}"
                </p>
              </div>

              {uploadedImages.length > 0 && (
                <div className="pt-1">
                  <span className="text-gray-400 block font-semibold">Attached Assets ({uploadedImages.length}):</span>
                  <div className="flex gap-2 mt-1">
                    {uploadedImages.map((url, i) => (
                      <img key={i} src={url} alt="asset" className="w-10 h-10 object-cover rounded-lg border border-surface-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Terms and Agreement Checkbox */}
          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/25 space-y-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-0.5 accent-brand-500 rounded cursor-pointer shrink-0"
              />
              <span className="text-xs text-gray-300 leading-relaxed">
                I agree to the <Link href="/terms" className="text-brand-400 underline font-semibold" target="_blank">Terms of Service</Link> and understand that production starts upon payment verification. All AI assets are created with full commercial broadcast rights.
              </span>
            </label>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-surface-200/50">
            <button
              onClick={() => setCurrentStep(3)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100 border border-surface-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit Details
            </button>

            <button
              disabled={!agreeTerms}
              onClick={() => {
                if (!agreeTerms) {
                  setError('Please agree to the Terms of Service to proceed.');
                  return;
                }
                setError('');
                setCurrentStep(5);
              }}
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Proceed to Payment
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 5: DYNAMIC UPI QR & PAYMENT GATEWAY                     */}
      {/* ============================================================ */}
      {currentStep === 5 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          
          {/* Header */}
          <div className="border-b border-surface-200/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[11px] font-bold text-emerald-300 mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                100% Secure UPI Payment Gateway
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <QrCode className="w-6 h-6 text-brand-400" />
                5. Scan & Pay via UPI
              </h2>
            </div>

            <div className="sm:text-right bg-surface-100/80 p-3 rounded-2xl border border-surface-200/60">
              <span className="text-[10px] text-gray-400 uppercase tracking-wider block font-semibold">Total Payable Amount</span>
              <span className="text-2xl font-black text-emerald-400">{formatCurrencyINR(activePackage.price)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            
            {/* Left: Dynamic QR Code Card (5 cols) */}
            <div className="md:col-span-5 flex flex-col items-center p-6 rounded-3xl bg-[#090D16] border border-surface-200/80 shadow-2xl text-center space-y-4">
              <div className="relative p-3 bg-white rounded-2xl shadow-xl shadow-black/50">
                <img
                  src={qrCodeImageUrl}
                  alt="UPI QR Code"
                  className="w-52 h-52 object-contain"
                />
                <div className="absolute inset-x-0 -bottom-3 flex justify-center">
                  <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider shadow-md">
                    Amount: {formatCurrencyINR(activePackage.price)}
                  </span>
                </div>
              </div>

              <div className="pt-2 w-full space-y-2">
                <p className="text-xs text-gray-300 font-medium">
                  Scan using any UPI App on your phone:
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                  <span className="px-2 py-1 rounded-lg bg-surface-100 border border-surface-200">GPay</span>
                  <span className="px-2 py-1 rounded-lg bg-surface-100 border border-surface-200">PhonePe</span>
                  <span className="px-2 py-1 rounded-lg bg-surface-100 border border-surface-200">Paytm</span>
                  <span className="px-2 py-1 rounded-lg bg-surface-100 border border-surface-200">BHIM</span>
                </div>
              </div>

              {/* UPI ID copy bar */}
              <div className="w-full p-2.5 rounded-xl bg-surface-100 border border-surface-200/70 flex items-center justify-between text-xs">
                <div className="truncate pr-2 text-left">
                  <span className="text-[10px] text-gray-400 block font-semibold">Studio UPI ID</span>
                  <span className="font-mono font-bold text-white">{UPI_ID}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/40 text-brand-300 border border-brand-500/30 text-xs font-bold flex items-center gap-1 transition-all shrink-0"
                >
                  {copiedUpi ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* 1-Click Pay on Mobile App Buttons */}
              <div className="w-full pt-1">
                <a
                  href={upiPayUrl}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <Smartphone className="w-4 h-4" />
                  Pay Directly in UPI App
                </a>
              </div>
            </div>

            {/* Right: Payment Confirmation Form (7 cols) */}
            <div className="md:col-span-7 space-y-5">
              
              <div className="p-4 rounded-2xl bg-surface-100/50 border border-surface-200/60 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-brand-400" />
                  Step-by-Step Payment Instructions:
                </h3>
                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Scan the dynamic QR code with Google Pay, PhonePe, or Paytm.</li>
                  <li>Complete the payment of <strong className="text-emerald-400">{formatCurrencyINR(activePackage.price)}</strong>.</li>
                  <li>Copy the <strong>12-digit UPI Reference Number / UTR</strong> from your payment receipt.</li>
                  <li>Enter the UTR below and click <strong>"Verify & Complete Booking"</strong>.</li>
                </ol>
              </div>

              {/* UTR Input Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    UPI Reference / UTR Number (12 Digits) <span className="text-brand-400">*</span>
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={upiTransactionId}
                      onChange={(e) => setUpiTransactionId(e.target.value)}
                      placeholder="e.g. 423589123456 or Transaction ID"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#080B11] border border-surface-200 text-white font-mono text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Found in payment details of your banking or UPI app after paying.
                  </p>
                </div>

                {/* Upload Payment Screenshot (Optional) */}
                <div>
                  <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
                    Upload Payment Screenshot (Optional)
                  </label>
                  
                  {!paymentProofUrl ? (
                    <div className="border border-dashed border-surface-200 rounded-xl p-3 text-center bg-surface-100/30 hover:bg-surface-100/50 transition-all">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePaymentProofUpload}
                        id="proof-upload"
                        className="hidden"
                      />
                      <label htmlFor="proof-upload" className="cursor-pointer flex items-center justify-center gap-2 text-xs font-semibold text-gray-300 hover:text-white">
                        <Upload className="w-4 h-4 text-brand-400" />
                        <span>{uploadingProof ? 'Uploading Receipt...' : 'Attach Payment Screenshot'}</span>
                      </label>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                      <div className="flex items-center gap-2 truncate">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate">Payment Screenshot Attached</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setPaymentProofUrl('')}
                        className="text-rose-400 hover:underline font-bold shrink-0 ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="button"
                    onClick={() => handleFinalSubmitWithPayment(true)}
                    disabled={submitting}
                    className="w-full btn-glow py-3.5 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-xl shadow-brand-500/30 disabled:opacity-50"
                  >
                    {submitting ? (
                      <span className="inline-flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifying Payment & Booking...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5 text-emerald-300" />
                        Submit Payment & Confirm Booking
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(4)}
                      className="text-gray-400 hover:text-white flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Back to Review
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFinalSubmitWithPayment(false)}
                      disabled={submitting}
                      className="text-brand-400 hover:underline font-semibold"
                    >
                      Pay Later / Verify on WhatsApp →
                    </button>
                  </div>
                </div>

              </div>

            </div>

          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* STEP 6: BOOKING SUCCESS SCREEN                               */}
      {/* ============================================================ */}
      {currentStep === 6 && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-surface-200/80 shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-2xl shadow-emerald-500/20">
            <CheckCircle2 className="w-10 h-10 animate-bounce" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider">
              Booking & Payment Received
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-white">
              Thank You! Your AI Reel is Booked.
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
              We have received your project requirements and payment details. Our creative team has queued your order for production.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-surface-100/80 border border-surface-200/80 text-left space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Booking Reference:</span>
              <span className="font-mono font-bold text-brand-400">{createdBooking?.bookingRef || 'GAS-BKG-CONFIRMED'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Selected Package:</span>
              <span className="font-bold text-white">{activePackage.name} ({formatCurrencyINR(activePackage.price)})</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Scheduled Date & Slot:</span>
              <span className="font-bold text-white">{selectedDate} • {selectedTimeSlot}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Delivery Platform:</span>
              <span className="font-bold text-white">
                {formData.deliveryPlatform === 'Other' ? (formData.deliveryPlatformOther || 'Custom Platform') : formData.deliveryPlatform}
              </span>
            </div>
            {upiTransactionId && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">UPI Ref / UTR:</span>
                <span className="font-mono font-bold text-emerald-400">{upiTransactionId}</span>
              </div>
            )}
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Payment Status:</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                {createdBooking?.paymentStatus === 'PAID' ? 'PAID' : 'PENDING VERIFICATION'}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              href="/dashboard/bookings"
              className="btn-glow w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Go to My Bookings
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(`Hello Gujju AI Studio, I just completed booking and UPI payment for Ref: ${createdBooking?.bookingRef || 'GAS-BKG'} (${activePackage.name}). Please check!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-center flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Confirm on WhatsApp →
            </a>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BookPage() {
  return (
    <main className="min-h-screen flex flex-col justify-between bg-[#080B11] text-white">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 w-full relative">
        <div className="absolute top-1/4 right-10 w-96 h-96 bg-brand-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent-cyan/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="text-center space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-brand-500/30 text-xs font-semibold text-brand-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Studio Booking Gateway</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Book Your <span className="text-gradient-blue">AI Video Reel</span>
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm max-w-xl mx-auto">
            Choose your standard or custom package, pick your schedule, and provide your project details to launch your viral campaign.
          </p>
        </div>

        <Suspense fallback={<div className="min-h-[400px]" />}>
          <BookingWizard />
        </Suspense>
      </div>

      <Footer />
    </main>
  );
}
