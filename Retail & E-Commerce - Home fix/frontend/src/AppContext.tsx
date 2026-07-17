import React, { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { useLocation, useNavigate as useRouterNavigate } from 'react-router-dom';
import type { AppState, AppContextType, AppAction } from './types';
import { mockUser, mockCategories, mockProfessionals, mockBookings, mockChatThreads } from './data';
import { authenticateBackendSession, clearBackendAuthToken, fetchBootstrapData } from './lib/api';

const SESSION_STORAGE_KEY = 'retail-ecommerce-session';

type StoredSession = {
  role: 'customer' | 'service' | 'admin';
  name: string;
  phone: string;
  businessName?: string;
  profession?: string;
  language?: 'en' | 'hi' | 'te';
  experience?: string;
  serviceArea?: string;
};

function readStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

function writeStoredSession(session: StoredSession | null) {
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  } catch {
    return;
  }
}

const initialState: AppState = {
  currentView: 'login',
  previousView: null,
  navigationParams: {},
  authRole: null,
  authProfile: null,
  user: null,
  isAuthenticated: false,
  categories: mockCategories,
  professionals: mockProfessionals,
  bookings: mockBookings,
  chatThreads: mockChatThreads,
  selectedCategory: null,
  selectedProfessional: null,
  selectedBooking: null,
  selectedChat: null,
  searchQuery: '',
  activeFilters: {
    category: null,
    priceRange: null,
    rating: null,
    availability: null,
  },
  showSOS: false,
  isLaunchAnimationComplete: false,
  themeMode: 'night',
  toast: null,
};

const viewHistory: string[] = [];

const staticViewPaths: Record<string, string> = {
  login: '/login',
  home: '/',
  explore: '/explore',
  mybookings: '/bookings',
  chatlist: '/chat',
  profile: '/profile',
  'service-dashboard': '/service-dashboard',
  'admin-panel': '/admin',
};

function encodeRouteParam(value: unknown) {
  return encodeURIComponent(String(value || ''));
}

function appendSearchParams(path: string, params: Record<string, any> = {}, excludedKeys: string[] = []) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (excludedKeys.includes(key) || value === undefined || value === null || value === '') return;
    search.set(key, String(value));
  });

  const query = search.toString();
  return query ? `${path}?${query}` : path;
}

export function pathForView(view: string, params: Record<string, any> = {}) {
  switch (view) {
    case 'proprofile':
      return params.professionalId
        ? appendSearchParams(`/professionals/${encodeRouteParam(params.professionalId)}`, params, ['professionalId'])
        : '/professionals';
    case 'bookingflow':
      return params.professionalId
        ? appendSearchParams(`/professionals/${encodeRouteParam(params.professionalId)}/book`, params, ['professionalId'])
        : appendSearchParams('/book', params);
    case 'bookingdetail':
      return params.bookingId
        ? appendSearchParams(`/bookings/${encodeRouteParam(params.bookingId)}`, params, ['bookingId'])
        : appendSearchParams('/bookings/detail', params);
    case 'chatroom':
      return params.threadId
        ? appendSearchParams(`/chat/${encodeRouteParam(params.threadId)}`, params, ['threadId'])
        : appendSearchParams('/chat/room', params);
    default:
      return appendSearchParams(staticViewPaths[view] || '/', params);
  }
}

function parseSearchParams(search: string) {
  const params: Record<string, string> = {};
  new URLSearchParams(search).forEach((value, key) => {
    params[key] = value;
  });
  return params;
}

export function routeStateFromLocation(pathname: string, search: string) {
  const path = pathname.replace(/\/+$/, '') || '/';
  const searchParams = parseSearchParams(search);
  const professionalBookingMatch = path.match(/^\/professionals\/([^/]+)\/book$/);
  const professionalMatch = path.match(/^\/professionals\/([^/]+)$/);
  const bookingMatch = path.match(/^\/bookings\/([^/]+)$/);
  const chatMatch = path.match(/^\/chat\/([^/]+)$/);

  if (path === '/login') return { view: 'login', params: searchParams };
  if (path === '/' || path === '/home') return { view: 'home', params: searchParams };
  if (path === '/explore' || path === '/professionals') return { view: 'explore', params: searchParams };
  if (professionalBookingMatch) {
    return {
      view: 'bookingflow',
      params: { ...searchParams, professionalId: decodeURIComponent(professionalBookingMatch[1]) },
    };
  }
  if (professionalMatch) {
    return {
      view: 'proprofile',
      params: { ...searchParams, professionalId: decodeURIComponent(professionalMatch[1]) },
    };
  }
  if (path === '/book') return { view: 'bookingflow', params: searchParams };
  if (path === '/bookings') return { view: 'mybookings', params: searchParams };
  if (bookingMatch) {
    return {
      view: 'bookingdetail',
      params: { ...searchParams, bookingId: decodeURIComponent(bookingMatch[1]) },
    };
  }
  if (path === '/chat') return { view: 'chatlist', params: searchParams };
  if (chatMatch) {
    return {
      view: 'chatroom',
      params: { ...searchParams, threadId: decodeURIComponent(chatMatch[1]) },
    };
  }
  if (path === '/profile') return { view: 'profile', params: searchParams };
  if (path === '/service-dashboard') return { view: 'service-dashboard', params: searchParams };
  if (path === '/admin') return { view: 'admin-panel', params: searchParams };
  return { view: 'home', params: searchParams };
}

function areParamsEqual(left: Record<string, any>, right: Record<string, any>) {
  const leftKeys = Object.keys(left);
  const rightKeys = Object.keys(right);
  if (leftKeys.length !== rightKeys.length) return false;
  return leftKeys.every((key) => String(left[key]) === String(right[key]));
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE': {
      viewHistory.push(state.currentView);
      if (viewHistory.length > 10) viewHistory.shift();
      return {
        ...state,
        previousView: state.currentView,
        currentView: action.view,
        navigationParams: action.params || {},
      };
    }
    case 'SYNC_ROUTE':
      return {
        ...state,
        currentView: action.view,
        navigationParams: action.params || {},
      };
    case 'GO_BACK': {
      const prev = viewHistory.pop();
      return {
        ...state,
        currentView: prev || 'home',
        previousView: null,
        navigationParams: {},
      };
    }
    case 'HYDRATE_APP_DATA':
      return {
        ...state,
        user: state.isAuthenticated ? action.data.user : state.user,
        categories: action.data.categories,
        professionals: action.data.professionals,
        bookings: action.data.bookings,
        chatThreads: action.data.chatThreads,
      };
    case 'LOGIN':
      return {
        ...state,
        authRole: action.role,
        authProfile: {
          name: action.name,
          phone: action.phone,
          businessName: action.businessName,
          profession: action.profession,
          language: action.language || 'en',
          experience: action.experience,
          serviceArea: action.serviceArea,
        },
        user: mockUser,
        isAuthenticated: true,
        currentView: action.role === 'customer' ? 'explore' : action.role === 'service' ? 'service-dashboard' : 'admin-panel',
        navigationParams: {},
      };
    case 'LOGOUT':
      viewHistory.length = 0;
      return {
        ...state,
        authRole: null,
        authProfile: null,
        isAuthenticated: false,
        currentView: 'login',
        navigationParams: {},
      };
    case 'SET_USER':
      return { ...state, user: action.user, isAuthenticated: true };
    case 'SET_CATEGORIES':
      return { ...state, categories: action.categories };
    case 'SET_PROFESSIONALS':
      return { ...state, professionals: action.professionals };
    case 'SET_BOOKINGS':
      return { ...state, bookings: action.bookings };
    case 'ADD_BOOKING':
      return { ...state, bookings: [action.booking, ...state.bookings] };
    case 'UPDATE_BOOKING':
      return {
        ...state,
        bookings: state.bookings.map(b => b.id === action.booking.id ? action.booking : b),
      };
    case 'SET_CHAT_THREADS':
      return { ...state, chatThreads: action.threads };
    case 'ADD_MESSAGE': {
      const updatedThreads = state.chatThreads.map(t => {
        if (t.id === action.threadId) {
          const isFromUser = action.message.senderId === state.user?.id;
          return {
            ...t,
            messages: [...t.messages, action.message],
            lastMessage: action.message.text,
            lastMessageTime: action.message.timestamp,
            unread: isFromUser ? t.unread : t.unread + 1,
          };
        }
        return t;
      });
      return { ...state, chatThreads: updatedThreads };
    }
    case 'SET_SELECTED_CATEGORY':
      return { ...state, selectedCategory: action.categoryId };
    case 'SET_SELECTED_PROFESSIONAL':
      return { ...state, selectedProfessional: action.professionalId };
    case 'SET_SELECTED_BOOKING':
      return { ...state, selectedBooking: action.bookingId };
    case 'SET_SELECTED_CHAT':
      return { ...state, selectedChat: action.chatId };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.query };
    case 'SET_FILTERS':
      return { ...state, activeFilters: { ...state.activeFilters, ...action.filters } };
    case 'TOGGLE_SOS':
      return { ...state, showSOS: action.show };
    case 'SET_LAUNCH_COMPLETE':
      return { ...state, isLaunchAnimationComplete: true };
    case 'SET_THEME_MODE':
      return { ...state, themeMode: action.themeMode };
    case 'SHOW_TOAST':
      return { ...state, toast: { message: action.message, type: action.toastType } };
    case 'HIDE_TOAST':
      return { ...state, toast: null };
    default:
      return state;
  }
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const routerNavigate = useRouterNavigate();
  const [state, dispatch] = useReducer(appReducer, initialState, (baseState) => {
    const storedSession = readStoredSession();
    if (!storedSession) {
      return { ...baseState, isAuthenticated: false, currentView: 'login' };
    }

    return {
      ...baseState,
      authRole: storedSession.role,
      authProfile: storedSession,
      isAuthenticated: true,
      currentView: storedSession.role === 'customer' ? 'explore' : storedSession.role === 'service' ? 'service-dashboard' : 'admin-panel',
    };
  });

  useEffect(() => {
    let isCancelled = false;

    fetchBootstrapData()
      .then((data) => {
        if (!isCancelled) {
          dispatch({ type: 'HYDRATE_APP_DATA', data });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          dispatch({
            type: 'SHOW_TOAST',
            message: 'Using local demo data until Supabase is connected.',
            toastType: 'default',
          });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const navigate = useCallback((view: string, params?: Record<string, any>) => {
    dispatch({ type: 'NAVIGATE', view, params });
    routerNavigate(pathForView(view, params));
  }, [routerNavigate]);

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      routerNavigate(-1);
      return;
    }

    dispatch({ type: 'GO_BACK' });
    routerNavigate(pathForView('home'), { replace: true });
  }, [routerNavigate]);

  const login = useCallback(async (
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
  ) => {
    const session = { role, name, phone, businessName, ...options };
    const nextView = role === 'customer' ? 'explore' : role === 'service' ? 'service-dashboard' : 'admin-panel';
    writeStoredSession(session);
    await authenticateBackendSession(session).catch(() => undefined);
    dispatch({ type: 'LOGIN', role, name, phone, businessName, ...options });
    routerNavigate(pathForView(nextView), { replace: true });
  }, [routerNavigate]);

  const logout = useCallback(() => {
    writeStoredSession(null);
    clearBackendAuthToken();
    dispatch({ type: 'LOGOUT' });
    routerNavigate(pathForView('login'), { replace: true });
  }, [routerNavigate]);

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, goBack, login, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}

export function RouteStateSync({ children }: { children: React.ReactNode }) {
  const { state, dispatch } = useApp();
  const location = useLocation();
  const routeState = routeStateFromLocation(location.pathname, location.search);
  const isSynced = state.currentView === routeState.view && areParamsEqual(state.navigationParams, routeState.params);

  useEffect(() => {
    if (!isSynced) {
      dispatch({ type: 'SYNC_ROUTE', view: routeState.view, params: routeState.params });
    }
  }, [dispatch, isSynced, routeState.params, routeState.view]);

  return isSynced ? <>{children}</> : null;
}
