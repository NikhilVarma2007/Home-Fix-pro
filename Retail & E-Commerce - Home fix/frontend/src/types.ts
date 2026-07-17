export interface User {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  addresses: Address[];
}

export interface Address {
  id: string;
  label: string;
  full: string;
  lat: number;
  lng: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  services: Service[];
}

export interface Service {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  priceUnit: string;
  description: string;
  estimatedTime: string;
}

export interface Professional {
  id: string;
  name: string;
  avatar: string;
  category: string;
  services: string[];
  rating: number;
  reviewCount: number;
  experience: number;
  tier: 'platinum' | 'gold' | 'silver';
  verified: boolean;
  priceRange: string;
  about: string;
  portfolio: string[];
  availability: string;
  location: string;
  distance: string;
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  beforeImage?: string;
  afterImage?: string;
}

export interface Booking {
  id: string;
  serviceId: string;
  serviceName: string;
  categoryId: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  customerId: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  scheduledDate: string;
  scheduledTime: string;
  price: number;
  address: Address;
  notes: string;
  progressPhotos: ProgressPhoto[];
  paymentStatus: 'pending' | 'advance_paid' | 'completed';
  paymentAmount: number;
  createdAt: string;
}

export interface ProgressPhoto {
  id: string;
  stage: string;
  image: string;
  caption: string;
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  type: 'text' | 'image';
}

export interface ChatThread {
  id: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar: string;
  serviceName: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  messages: ChatMessage[];
}

export interface AppState {
  currentView: string;
  previousView: string | null;
  navigationParams: Record<string, any>;
  authRole: 'customer' | 'service' | 'admin' | null;
  authProfile: {
    name: string;
    phone: string;
    businessName?: string;
    profession?: string;
    language?: 'en' | 'hi' | 'te';
    experience?: string;
    serviceArea?: string;
  } | null;
  user: User | null;
  isAuthenticated: boolean;
  categories: ServiceCategory[];
  professionals: Professional[];
  bookings: Booking[];
  chatThreads: ChatThread[];
  selectedCategory: string | null;
  selectedProfessional: string | null;
  selectedBooking: string | null;
  selectedChat: string | null;
  searchQuery: string;
  activeFilters: {
    category: string | null;
    priceRange: [number, number] | null;
    rating: number | null;
    availability: string | null;
  };
  showSOS: boolean;
  isLaunchAnimationComplete: boolean;
  themeMode: 'day' | 'night';
  toast: { message: string; type: 'default' | 'success' | 'error' } | null;
}

export type AppAction =
  | { type: 'NAVIGATE'; view: string; params?: Record<string, any> }
  | { type: 'SYNC_ROUTE'; view: string; params?: Record<string, any> }
  | { type: 'GO_BACK' }
  | {
      type: 'HYDRATE_APP_DATA';
      data: Pick<AppState, 'user' | 'categories' | 'professionals' | 'bookings' | 'chatThreads'>;
    }
  | {
      type: 'LOGIN';
      role: 'customer' | 'service' | 'admin';
      name: string;
      phone: string;
      businessName?: string;
      profession?: string;
      language?: 'en' | 'hi' | 'te';
      experience?: string;
      serviceArea?: string;
    }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; user: User }
  | { type: 'SET_CATEGORIES'; categories: ServiceCategory[] }
  | { type: 'SET_PROFESSIONALS'; professionals: Professional[] }
  | { type: 'SET_BOOKINGS'; bookings: Booking[] }
  | { type: 'ADD_BOOKING'; booking: Booking }
  | { type: 'UPDATE_BOOKING'; booking: Booking }
  | { type: 'SET_CHAT_THREADS'; threads: ChatThread[] }
  | { type: 'ADD_MESSAGE'; threadId: string; message: ChatMessage }
  | { type: 'SET_SELECTED_CATEGORY'; categoryId: string | null }
  | { type: 'SET_SELECTED_PROFESSIONAL'; professionalId: string | null }
  | { type: 'SET_SELECTED_BOOKING'; bookingId: string | null }
  | { type: 'SET_SELECTED_CHAT'; chatId: string | null }
  | { type: 'SET_SEARCH_QUERY'; query: string }
  | { type: 'SET_FILTERS'; filters: Partial<AppState['activeFilters']> }
  | { type: 'TOGGLE_SOS'; show: boolean }
  | { type: 'SET_LAUNCH_COMPLETE' }
  | { type: 'SET_THEME_MODE'; themeMode: 'day' | 'night' }
  | { type: 'SHOW_TOAST'; message: string; toastType: 'default' | 'success' | 'error' }
  | { type: 'HIDE_TOAST' };

export interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (view: string, params?: Record<string, any>) => void;
  goBack: () => void;
  login: (
    role: 'customer' | 'service' | 'admin',
    name: string,
    phone: string,
    businessName?: string,
    options?: {
      profession?: string;
      language?: 'en' | 'hi' | 'te';
      experience?: string;
      serviceArea?: string;
    },
  ) => Promise<void>;
  logout: () => void;
}
