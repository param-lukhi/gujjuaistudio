'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  Package,
  User,
  Building,
  Mail,
  Phone,
  Check,
  Zap,
  ShieldCheck,
  ChevronRight,
  QrCode,
  Copy,
  CheckCheck,
  Smartphone,
  CreditCard,
  FileText,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { formatCurrencyINR } from '@/lib/utils';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

const UPI_ID = '9925263558@upi';
const UPI_PAYEE_NAME = 'Gujju AI Studio';
const WHATSAPP_SUPPORT_NUMBER = '919925263558';

const PACKAGES: Record<string, {
  name: string;
  badge: string;
  price: number;
  duration: string;
  desc: string;
  features: string[];
}> = {
  starter: {
    name: 'Starter AI Reel',
    badge: '🥉 Starter',
    price: 600,
    duration: 'Up to 15 Seconds',
    desc: 'Perfect for quick Instagram Reels & TikTok hooks with AI-generated visuals.',
    features: ['1080p HD Format', '1 AI Voiceover / Audio Sync', '48-hour delivery', '1 Revision'],
  },
  professional: {
    name: 'Professional Reel',
    badge: '🥈 Most Popular',
    price: 1200,
    duration: 'Up to 30 Seconds',
    desc: 'Cinematic AI model showcase with multiple scene transitions and high conversion script.',
    features: ['1080p HD Vertical 9:16', 'Cinematic Visual Transitions', 'Scriptwriting + Voiceover', '2 Revisions', 'Thumbnail Included'],
  },
  premium: {
    name: 'Premium Campaign',
    badge: '🥇 Premium Quality',
    price: 2300,
    duration: 'Up to 60 Seconds',
    desc: 'Full-length 4K commercial-grade AI ad with lifelike avatars, VFX, and multi-format exports.',
    features: ['4K Ultra HD Export', 'Multi-Angle AI Rendering', 'Professional Script + Voiceover', 'Unlimited Minor Revisions', 'Instagram + YouTube Format'],
  },
  custom: {
    name: 'Custom AI Commercial',
    badge: '🚀 Bespoke Brand',
    price: 3500,
    duration: 'Custom Length',
    desc: 'Tailored brand story with custom model training, multi-scene storyboarding, and voice cloning.',
    features: ['Custom AI Model & Styling', 'Multi-scene Storyboarding', 'Express 24-48h Delivery', 'Full Commercial Rights', 'Dedicated Creative Director'],
  }
};

const TIME_SLOTS = [
  { id: 'morning', label: '10:00 AM - 12:00 PM', period: 'Morning Slot' },
  { id: 'afternoon', label: '01:00 PM - 03:00 PM', period: 'Afternoon Slot' },
  { id: 'evening', label: '04:00 PM - 06:00 PM', period: 'Evening Slot' },
  { id: 'night', label: '07:00 PM - 09:00 PM', period: 'Night Slot' },
];

function BookingWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  const pkgFromUrl = searchParams.get('package') || 'professional';

  // Wizard Step: 1: Service, 2: Date & Slot, 3: Details & Uploads, 4: Confirm, 5: Payment, 6: Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedPackage, setSelectedPackage] = useState(pkgFromUrl);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(TIME_SLOTS[0].label);

  const [formData, setFormData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    productDescription: '',
    referenceLink: '',
  });

  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdBooking, setCreatedBooking] = useState<any>(null);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'GPAY' | 'PHONEPE' | 'PAYTM'>('UPI');
  const [upiTransactionId, setUpiTransactionId] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Auto-fill from session
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

  const activePackage = PACKAGES[selectedPackage] || PACKAGES.professional;

  // Dynamic UPI URL for QR code & Direct UPI intent
  const upiPayUrl = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${activePackage.price}&cu=INR&tn=${encodeURIComponent(`Booking - ${activePackage.name}`)}`;
  const qrCodeImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(upiPayUrl)}&margin=10`;

  // Copy UPI ID to clipboard
  const handleCopyUpi = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(UPI_ID);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  // Handle Image Upload (Project images)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls = [...uploadedImages];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const data = new FormData();
      data.append('file', file);

      try {
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: data,
        });
        const result = await res.json();
        if (result.url) {
          newUrls.push(result.url);
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

  // Handle Payment Screenshot Upload
  const handlePaymentProofUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProof(true);
    const data = new FormData();
    data.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const result = await res.json();
      if (result.url) {
        setPaymentProofUrl(result.url);
      }
    } catch (err) {
      console.error('Error uploading payment receipt:', err);
    } finally {
      setUploadingProof(false);
    }
  };

  // Submit Final Booking with Payment Verification
  const handleFinalSubmitWithPayment = async (isPaidViaUpi: boolean = true) => {
    if (!formData.name || !formData.email || !formData.phone || !formData.productDescription) {
      setError('Please complete all required fields.');
      setCurrentStep(3);
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      setError('Please select a booking date and time slot.');
      setCurrentStep(2);
      return;
    }

    if (isPaidViaUpi && !upiTransactionId.trim() && !paymentProofUrl) {
      setError('Please enter your 12-digit UPI UTR / Transaction Reference ID or upload a screenshot to confirm payment.');
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
          packageId: selectedPackage,
          packageName: `${activePackage.badge} - ${activePackage.name}`,
          price: activePackage.price,
          description: formData.productDescription,
          refLink: formData.referenceLink,
          imageUrls: uploadedImages,
          bookingDate: selectedDate,
          bookingTime: selectedTimeSlot,
          paymentStatus: isPaidViaUpi ? 'PENDING_VERIFICATION' : 'UNPAID',
          paymentRef: upiTransactionId.trim() || (isPaidViaUpi ? 'PAID_VIA_UPI_APP' : null),
          paymentProof: paymentProofUrl || null,
          paymentMethod: paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit booking.');
      } else {
        setCreatedBooking(data.booking);
        setCurrentStep(6); // Success step
      }
    } catch (err) {
      setError('Network connection error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Get minimum date (today)
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
              { num: 1, title: 'Service' },
              { num: 2, title: 'Date & Slot' },
              { num: 3, title: 'Details' },
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

      {/* STEP 1: SELECT SERVICE / PACKAGE */}
      {currentStep === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-brand-400" />
              1. Choose Your AI Reel Service
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Select the package that best fits your product reel requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(PACKAGES).map(([key, pkg]) => {
              const isSelected = selectedPackage === key;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedPackage(key)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                    isSelected
                      ? 'bg-brand-950/40 border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500/40'
                      : 'bg-surface-100/40 border-surface-200/60 hover:border-surface-200 hover:bg-surface-100/80'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-brand-500/20 text-brand-300 border border-brand-500/30 mb-2">
                        {pkg.badge}
                      </span>
                      <h3 className="font-bold text-white text-base">{pkg.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">{pkg.desc}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xl font-black text-brand-400">
                        {formatCurrencyINR(pkg.price)}
                      </span>
                      <p className="text-[10px] text-gray-500">{pkg.duration}</p>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-1.5 border-t border-surface-200/40 pt-3">
                    {pkg.features.map((feat, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-4 flex items-center justify-between">
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

      {/* STEP 2: SELECT DATE & TIME SLOT */}
      {currentStep === 2 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Calendar className="w-6 h-6 text-brand-400" />
              2. Select Booking Date & Time Slot
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Pick your preferred delivery initiation date and communication slot.
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
              Back
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

      {/* STEP 3: CLIENT & PROJECT DETAILS */}
      {currentStep === 3 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <User className="w-6 h-6 text-brand-400" />
              3. Client & Project Details
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Confirm your contact info and share your product details or script idea.
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
                  placeholder="Enter email"
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
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Product Description / AI Reel Requirements <span className="text-brand-400">*</span>
            </label>
            <textarea
              rows={3}
              required
              value={formData.productDescription}
              onChange={(e) => setFormData({ ...formData, productDescription: e.target.value })}
              placeholder="Tell us what product you are selling, preferred style (luxury, vibrant, fast-paced), target audience, and key highlights..."
              className="w-full p-4 rounded-xl bg-surface-100 border border-surface-200 text-white placeholder-gray-500 text-xs sm:text-sm focus:outline-none focus:border-brand-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase tracking-wider">
              Reference Reel or Competitor Video Link (Optional)
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                value={formData.referenceLink}
                onChange={(e) => setFormData({ ...formData, referenceLink: e.target.value })}
                placeholder="https://instagram.com/reel/... or Drive link"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-100 border border-surface-200 text-white text-xs sm:text-sm focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* Image / Product photo uploads */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider">
              Upload Product Images (Optional)
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
                <span className="text-xs font-semibold text-white">Click to upload product photos</span>
                <span className="text-[10px] text-gray-400">PNG, JPG, WebP up to 10MB</span>
              </label>
            </div>

            {uploading && (
              <p className="text-xs text-brand-400 flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-brand-400/30 border-t-brand-400 rounded-full animate-spin" />
                Uploading images...
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

          <div className="flex items-center justify-between pt-4 border-t border-surface-200/50">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-surface-100 border border-surface-200 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <button
              onClick={() => {
                if (!formData.name || !formData.email || !formData.phone || !formData.productDescription) {
                  setError('Please fill in all required fields.');
                  return;
                }
                setError('');
                setCurrentStep(4);
              }}
              className="btn-glow px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/30"
            >
              Review Booking
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM BOOKING */}
      {currentStep === 4 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-surface-200/80 shadow-2xl space-y-6 animate-in fade-in duration-200">
          <div className="border-b border-surface-200/50 pb-4">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              4. Review Booking Details
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 mt-1">
              Confirm your booking details before proceeding to the instant payment gateway.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service & Schedule summary */}
            <div className="space-y-4 p-5 rounded-2xl bg-surface-100/60 border border-surface-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-400">Package & Schedule</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Service:</span>
                  <span className="font-bold text-white">{activePackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Booking Date:</span>
                  <span className="font-bold text-brand-300">{selectedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time Slot:</span>
                  <span className="font-bold text-white">{selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between border-t border-surface-200/50 pt-2 text-base">
                  <span className="font-bold text-white">Total Amount:</span>
                  <span className="font-black text-emerald-400">{formatCurrencyINR(activePackage.price)}</span>
                </div>
              </div>
            </div>

            {/* Client info summary */}
            <div className="space-y-4 p-5 rounded-2xl bg-surface-100/60 border border-surface-200/60">
              <h3 className="text-xs font-bold uppercase tracking-wider text-accent-cyan">Client Contact</h3>
              <div className="space-y-2 text-xs sm:text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Client Name:</span>
                  <span className="font-bold text-white">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Business:</span>
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
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-xs text-gray-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-brand-400 shrink-0" />
            <span>
              In the next step, you can pay instantly via <strong>UPI, Google Pay, PhonePe, or Paytm QR</strong>. Instant verification & order confirmation will be generated.
            </span>
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
              onClick={() => {
                setError('');
                setCurrentStep(5); // Advance to Payment Gateway
              }}
              className="btn-glow px-8 py-3.5 rounded-xl text-sm font-bold text-white flex items-center gap-2 shadow-lg shadow-brand-500/40"
            >
              Proceed to Payment
              <CreditCard className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: DYNAMIC UPI QR & SECURE PAYMENT GATEWAY */}
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

      {/* STEP 6: BOOKING & PAYMENT SUCCESS SCREEN */}
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
              We have received your booking and UPI transaction details. Our creative director has assigned your project to the production queue.
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
              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}?text=${encodeURIComponent(`Hello Gujju AI Studio, I just completed booking and UPI payment for Ref: ${createdBooking?.bookingRef || 'GAS-BKG'} (UTR: ${upiTransactionId || 'Submitted'}). Please check!`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-all text-center flex items-center justify-center gap-2"
            >
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
            Choose your service, select preferred date & available time slot, and bring your product to life.
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
