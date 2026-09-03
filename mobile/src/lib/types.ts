/**
 * Response shapes for the mobile REST API (`/api/mobile/v1/*`).
 * Hand-synced with the route handlers under `app/api/mobile/v1` on the web side.
 * `number | null` on a limit means "unlimited" (Infinity serializes to null).
 */

export interface EntitlementSnapshot {
  plan: "FREE" | "PREMIUM";
  listingsMaxActive: number | null;
  studentsMaxActive: number | null;
  recurringLessons: boolean;
  advancedCalendar: boolean;
  advancedCrm: boolean;
  growthDashboard: boolean;
  commissionRate?: number;
}

export interface ProviderCard {
  id: string;
  displayName: string;
  headline: string | null;
  city: string | null;
  district: string | null;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  photoUrl: string | null;
  startingPrice: number | null;
  currency: string;
  categories: { name: string; slug: string }[];
  plan: "FREE" | "PREMIUM";
  languages?: string[];
  ratingAvg?: number | null;
  ratingCount?: number;
  yearsExperience?: number | null;
  promoted: boolean;
  favorited?: boolean;
  favoritedAt?: string;
}

export interface SearchResponse {
  results: ProviderCard[];
  total: number;
  page: number;
  pageSize: number;
  promotedIds: string[];
}

export interface Category {
  slug: string;
  name: string;
  group: string | null;
  icon: string | null;
}

export interface ProfileListing {
  id: string;
  kind: "SINGLE_LESSON" | "PACKAGE";
  title: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationMin: number | null;
  lessonCount: number | null;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  packageTerms: string | null;
}

export interface ProfileSlot {
  id: string;
  startsAt: string;
  endsAt: string;
}

export interface ProviderProfileDTO {
  id: string;
  displayName: string;
  headline: string | null;
  bio: string | null;
  city: string | null;
  district: string | null;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  photoUrl: string | null;
  startingPrice: number | null;
  currency: string;
  yearsExperience: number | null;
  languages: string[];
  ratingAvg: number | null;
  ratingCount: number;
  plan: "FREE" | "PREMIUM";
  promoted: boolean;
  favorited: boolean;
  categories: { name: string; slug: string }[];
  listings: ProfileListing[];
  availability: ProfileSlot[];
  lessonsBooked: number;
}

export interface ListingDetailDTO {
  id: string;
  kind: "SINGLE_LESSON" | "PACKAGE";
  title: string;
  description: string | null;
  priceAmount: number;
  currency: string;
  durationMin: number;
  lessonCount: number;
  deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  packageTerms: string | null;
  category: { name: string; slug: string } | null;
  provider: {
    id: string;
    displayName: string;
    photoUrl: string | null;
    city: string | null;
    currency: string;
    deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
  };
  availability: ProfileSlot[];
}

export interface StudentBookingDTO {
  id: string;
  reference: string;
  status: string;
  paymentStatus: string;
  scheduledAt: string | null;
  grossAmount: number;
  currency: string;
  listingId: string;
  listing: { title: string; kind: "SINGLE_LESSON" | "PACKAGE" };
  provider: { id: string; displayName: string; photoUrl: string | null } | null;
}

export interface StudentPackageDTO {
  id: string;
  title: string;
  provider: { id: string; displayName: string; photoUrl: string | null } | null;
  purchasedCount: number;
  consumedCount: number;
  remaining: number;
  progress: number;
  workspaceId: string | null;
}

export interface WorkspaceListItem {
  id: string;
  status: "ACTIVE" | "ARCHIVED";
  goal: string | null;
  role: "STUDENT" | "PROVIDER";
  provider: { id: string; displayName: string | null; photoUrl: string | null };
  student: { id: string; name: string | null };
  contextTitle: string | null;
  messageCount: number;
  taskCount: number;
  updatedAt: string;
}

export interface WorkspaceMessageDTO {
  id: string;
  body: string;
  senderId: string;
  senderName: string | null;
  mine: boolean;
  createdAt: string;
}

export interface WorkspaceTaskDTO {
  id: string;
  title: string;
  detail: string | null;
  status: "OPEN" | "SUBMITTED" | "DONE";
  dueAt: string | null;
  feedback: string | null;
}

export interface WorkspaceDTO {
  id: string;
  status: "ACTIVE" | "ARCHIVED";
  goal: string | null;
  viewerRole: "STUDENT" | "PROVIDER";
  provider: { id: string; displayName: string | null; photoUrl: string | null };
  student: { id: string; name: string | null };
  context: {
    title: string;
    lessonCount: number | null;
    purchasedCredits: number | null;
    consumedCredits: number | null;
  } | null;
  messages: WorkspaceMessageDTO[];
  tasks: WorkspaceTaskDTO[];
  notes: { id: string; body: string; createdAt: string }[];
  milestones: { id: string; title: string; reachedAt: string | null }[];
  resources: { id: string; title: string; url: string; kind: string }[];
}

export interface ProviderDashboardDTO {
  provider: { id: string; displayName: string | null; currency: string; published: boolean; plan: "FREE" | "PREMIUM" };
  entitlements: EntitlementSnapshot;
  today: {
    lessons: number;
    activeStudents: number;
    activeListings: number;
    revenue30dNet: number;
    revenue30dGross: number;
  };
  upcoming: { id: string; title: string; studentName: string | null; scheduledAt: string | null }[];
  recentPayments: {
    id: string;
    title: string;
    providerNet: number;
    platformCommission: number;
    currency: string;
    succeededAt: string | null;
  }[];
}

export interface ProviderListingRow {
  id: string;
  title: string;
  kind: "SINGLE_LESSON" | "PACKAGE";
  status: "ACTIVE" | "DRAFT" | "INACTIVE";
  priceAmount: number;
  currency: string;
  durationMin: number | null;
  lessonCount: number | null;
  bookings: number;
}

export interface ProviderListingsDTO {
  entitlements: EntitlementSnapshot;
  canActivateMore: boolean;
  listings: ProviderListingRow[];
}

export interface CrmStudentRow {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  status: "ACTIVE" | "INACTIVE" | "FORMER";
  labelColor: string | null;
  lessons: number;
  bookings: number;
  lastListing: string | null;
}

export interface CrmDTO {
  entitlements: EntitlementSnapshot;
  canAddActive: boolean;
  students: CrmStudentRow[];
}

export interface CalendarSlot {
  id: string;
  startsAt: string;
  endsAt: string;
  isBooked: boolean;
}

export interface CalendarLesson {
  id: string;
  startsAt: string;
  endsAt: string;
  status: string;
  studentName: string | null;
  labelColor: string | null;
}

export interface CalendarDTO {
  entitlements: EntitlementSnapshot;
  slots: CalendarSlot[];
  lessons: CalendarLesson[];
}

export interface EarningsSummary {
  currency: string;
  grossSales: number;
  platformCommission: number;
  processorFees: number;
  providerNet: number;
  refunded: number;
  pendingPayout: number;
  paidOut: number;
  currentPlan: "FREE" | "PREMIUM";
  currentCommissionRate: number;
  estimatedPremiumMonthlySaving: number;
}

export interface EarningsDTO {
  summary: EarningsSummary;
  premiumMonthlyPrice: number;
  premiumBreakEvenVolume: number;
  payouts: {
    id: string;
    status: string;
    amount: number;
    currency: string;
    periodStart: string;
    periodEnd: string;
    paidAt: string | null;
  }[];
}

export interface OnboardingDTO {
  provider: {
    displayName: string;
    headline: string | null;
    bio: string | null;
    city: string | null;
    district: string | null;
    deliveryMode: "ONLINE" | "IN_PERSON" | "BOTH";
    yearsExperience: number | null;
    languages: string[];
    published: boolean;
    onboardingStep: number;
    categorySlugs: string[];
  };
  hasActiveListing: boolean;
}

export interface PremiumStateDTO {
  plan: "FREE" | "PREMIUM";
  entitlements: EntitlementSnapshot;
  subscription: {
    status: string;
    interval: "MONTH" | "YEAR" | null;
    trialEndsAt: string | null;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  pricing: {
    monthly: number;
    yearly: number;
    trialDays: number;
    freeCommission: number;
    premiumCommission: number;
    breakEvenVolume: number;
  };
  billingProvider: "none" | "revenuecat";
}

export type RecommendationEventType =
  | "SWIPE_INTERESTED"
  | "SWIPE_SKIP"
  | "FAVORITE_ADD"
  | "FAVORITE_REMOVE"
  | "PROFILE_OPEN"
  | "SEARCH"
  | "CATEGORY_VIEW"
  | "CITY_VIEW"
  | "BOOKING_CREATED"
  | "PACKAGE_PURCHASED";
