import { api } from "./api";
import type {
  SearchResponse,
  Category,
  ProviderProfileDTO,
  ListingDetailDTO,
  StudentBookingDTO,
  StudentPackageDTO,
  ProviderCard,
  WorkspaceListItem,
  WorkspaceDTO,
  ProviderDashboardDTO,
  ProviderListingsDTO,
  CrmDTO,
  CalendarDTO,
  EarningsDTO,
  OnboardingDTO,
  PremiumStateDTO,
} from "./types";

export interface SearchFilters {
  q?: string;
  city?: string;
  category?: string;
  mode?: "ONLINE" | "IN_PERSON";
  language?: string;
  minRating?: number;
  minExperience?: number;
  listingKind?: "SINGLE_LESSON" | "PACKAGE";
  minPrice?: number;
  maxPrice?: number;
  sort?: "relevance" | "price_asc" | "price_desc" | "rating";
  page?: number;
  pageSize?: number;
}

export const queries = {
  categories: () => api<{ categories: Category[] }>("/categories", { auth: false }),

  search: (f: SearchFilters) =>
    api<SearchResponse>("/providers", {
      auth: false,
      query: {
        q: f.q,
        city: f.city,
        category: f.category,
        mode: f.mode,
        language: f.language,
        minRating: f.minRating,
        minExperience: f.minExperience,
        listingKind: f.listingKind,
        minPrice: f.minPrice,
        maxPrice: f.maxPrice,
        sort: f.sort,
        page: f.page,
        pageSize: f.pageSize,
      },
    }),

  provider: (id: string) => api<ProviderProfileDTO>(`/providers/${id}`, { auth: false }),
  listing: (id: string) => api<ListingDetailDTO>(`/listings/${id}`, { auth: false }),

  myBookings: () => api<{ bookings: StudentBookingDTO[] }>("/bookings"),
  myPackages: () => api<{ packages: StudentPackageDTO[] }>("/packages"),
  favorites: () => api<{ favorites: ProviderCard[] }>("/favorites"),
  toggleFavorite: (providerId: string) =>
    api<{ favorited: boolean }>("/favorites", { method: "POST", body: { providerId } }),

  workspaces: () => api<{ workspaces: WorkspaceListItem[] }>("/workspaces"),
  workspace: (id: string) => api<WorkspaceDTO>(`/workspaces/${id}`),
  postMessage: (id: string, body: string) =>
    api<{ id: string; createdAt: string }>(`/workspaces/${id}/messages`, {
      method: "POST",
      body: { body },
    }),
  createTask: (id: string, input: { title: string; detail?: string; dueAt?: string }) =>
    api<{ id: string }>(`/workspaces/${id}/tasks`, { method: "POST", body: input }),
  updateTask: (id: string, taskId: string, status: "OPEN" | "SUBMITTED" | "DONE") =>
    api<{ id: string; status: string }>(`/workspaces/${id}/tasks`, {
      method: "PATCH",
      body: { taskId, status },
    }),

  createBooking: (input: {
    listingId: string;
    availabilitySlotId?: string;
    scheduledAt?: string;
    idempotencyKey?: string;
  }) => api<{ id: string; reference: string; status: string }>("/bookings", { method: "POST", body: input }),
  payBooking: (id: string) =>
    api<{ ok: boolean; alreadySettled: boolean }>(`/bookings/${id}/pay`, { method: "POST", body: {} }),

  // Provider
  providerDashboard: () => api<ProviderDashboardDTO>("/provider/dashboard"),
  providerListings: () => api<ProviderListingsDTO>("/provider/listings"),
  createListing: (input: Record<string, unknown>) =>
    api<{ id: string; status: string }>("/provider/listings", { method: "POST", body: input }),
  setListingActive: (listingId: string, active: boolean) =>
    api<{ id: string; status: string }>("/provider/listings", {
      method: "PATCH",
      body: { listingId, active },
    }),
  crm: () => api<CrmDTO>("/provider/students"),
  addStudent: (input: { fullName: string; email?: string; phone?: string }) =>
    api<{ id: string }>("/provider/students", { method: "POST", body: input }),
  setStudentStatus: (studentId: string, status: "ACTIVE" | "INACTIVE" | "FORMER") =>
    api<{ id: string; status: string }>("/provider/students", {
      method: "PATCH",
      body: { studentId, status },
    }),
  calendar: () => api<CalendarDTO>("/provider/calendar"),
  addSlot: (startsAt: string, endsAt: string) =>
    api<{ id: string }>("/provider/calendar", { method: "POST", body: { startsAt, endsAt } }),
  createRecurring: (input: {
    studentId: string;
    weekday: number;
    startTime: string;
    durationMin: number;
    startDate: string;
    occurrences: number;
    listingId?: string;
  }) =>
    api<{ generated: number; skippedForConflict: number }>("/provider/calendar", {
      method: "PUT",
      body: input,
    }),
  earnings: () => api<EarningsDTO>("/provider/earnings"),
  onboarding: () => api<OnboardingDTO>("/provider/onboarding"),
  saveOnboarding: (input: Record<string, unknown>) =>
    api<{ ok: boolean }>("/provider/onboarding", { method: "PUT", body: input }),
  publishProfile: () => api<{ ok: boolean; published: boolean }>("/provider/onboarding", { method: "POST", body: {} }),
  premium: () => api<PremiumStateDTO>("/premium"),
  premiumAction: (action: "trial" | "subscribe" | "cancel", interval?: "MONTH" | "YEAR") =>
    api<{ ok: boolean }>("/premium", { method: "POST", body: { action, interval } }),

  updateName: (name: string) =>
    api<{ user: { id: string; name: string | null } }>("/me", { method: "PATCH", body: { name } }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api<{ ok: boolean; code?: string }>("/auth/password", {
      method: "POST",
      body: { action: "change", currentPassword, newPassword },
    }),
  resendVerification: () =>
    api<{ ok: boolean }>("/auth/password", {
      method: "POST",
      body: { action: "resend_verify" },
    }),
};
