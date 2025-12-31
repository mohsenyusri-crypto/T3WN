import { useState, useEffect, useRef, createContext, useContext, useCallback } from 'react';
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom';
import { FaTiktok } from 'react-icons/fa6';
import { FaArrowLeft, FaArrowRight, FaShoppingCart, FaStore, FaCommentDots, FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaPlus, FaMinus, FaBox, FaHistory, FaCheckCircle, FaTimes, FaShareAlt, FaHeart, FaThumbsUp, FaSearch } from 'react-icons/fa';
import Select from "react-select";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
if (typeof document !== "undefined") {
  const STYLE_ID = "t3wn-no-x-scroll";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html, body { width: 100%; max-width: 100%; margin: 0; overflow-x: clip; overflow-x: hidden; }
      #root { width: 100%; max-width: 100%; overflow-x: clip; overflow-x: hidden; }
      *, *::before, *::after { box-sizing: border-box; }
      img, video, canvas, svg, iframe { max-width: 100%; height: auto; }
      html, body { touch-action: pan-y; -webkit-overflow-scrolling: touch; }
      .t3wn-shift { animation: t3wnShift 220ms ease-out; }
      @keyframes t3wnShift {
        from { opacity: 0; transform: translateY(6px) scale(0.985); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
  document.documentElement.style.overflowX = "hidden";
  document.body.style.overflowX = "hidden";
  document.documentElement.style.overscrollBehaviorX = "none";
  document.body.style.overscrollBehaviorX = "none";
}
const getUserPhone = () => {
  const phone = localStorage.getItem("userPhone");
  if (!phone || phone === "—") return null;
  return phone.replace(/\D/g, "");
};
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const API_OPEN_BASE_URL = import.meta.env.VITE_API_OPEN_BASE_URL;
if (typeof L !== 'undefined') {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}
const countryloginOptions = [
  { value: "+973", label: "🇧🇭 Bahrain (+973)", iso: "BH", localLen: 8 },
  { value: "+965", label: "🇰🇼 Kuwait (+965)", iso: "KW", localLen: 8 },
  { value: "+968", label: "🇴🇲 Oman (+968)", iso: "OM", localLen: 8 },
  { value: "+974", label: "🇶🇦 Qatar (+974)", iso: "QA", localLen: 8 },
  { value: "+966", label: "🇸🇦 Saudi Arabia (+966)", iso: "SA", localLen: 9 },
  { value: "+971", label: "🇦🇪 United Arab Emirates (+971)", iso: "AE", localLen: 9 }
];
const countryloginOptionsAr = [
  { value: "+973", label: "🇧🇭 البحرين (+973)", iso: "BH", localLen: 8 },
  { value: "+965", label: "🇰🇼 الكويت (+965)", iso: "KW", localLen: 8 },
  { value: "+968", label: "🇴🇲 عمان (+968)", iso: "OM", localLen: 8 },
  { value: "+974", label: "🇶🇦 قطر (+974)", iso: "QA", localLen: 8 },
  { value: "+966", label: "🇸🇦 السعودية (+966)", iso: "SA", localLen: 9 },
  { value: "+971", label: "🇦🇪 الإمارات (+971)", iso: "AE", localLen: 9 }
];
const normalizeDigits = (s) => (s || "").replace(/[^\d]/g, "");
const geocodeAddress = async (query) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await response.json();
    if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon), displayName: data[0].display_name };
  } catch (e) {}
  return null;
};
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => { if (center) map.setView([center.lat, center.lng], zoom || map.getZoom()); }, [center, zoom, map]);
  return null;
};
const MapClickHandler = ({ onClick }) => {
  const map = useMap();
  useEffect(() => {
    if (!onClick) return;
    const handleClick = (e) => onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    map.on('click', handleClick);
    return () => { map.off('click', handleClick); };
  }, [map, onClick]);
  return null;
};
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isTouchDevice || isSmallScreen);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  return isMobile;
};
const DialPad = ({ value, onChange, maxLen = 8, group = true, isArabic = false }) => {
  const isMobile = useIsMobile();
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
  const add = (k) => { if (normalizeDigits(value).length < maxLen) onChange((normalizeDigits(value) + k).slice(0, maxLen)); };
  const back = () => onChange(normalizeDigits(value).slice(0, -1));
  const clear = () => onChange("");
  const format = (s) => {
    const clean = normalizeDigits(s);
    if (!group) return clean;
    return clean.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  };
  if (!isMobile) {
    return (
      <div className="space-y-2" dir={isArabic ? "rtl" : "ltr"}>
        <input
          type="tel"
          value={value}
          onChange={(e) => {
            const digits = normalizeDigits(e.target.value);
            if (digits.length <= maxLen) onChange(digits);
          }}
          placeholder={isArabic ? "أدخل الرقم" : "Enter number"}
          className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 outline-none transition shadow-sm text-center text-lg md:text-xl font-semibold tracking-widest"
          onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
          onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          maxLength={maxLen}
          inputMode="numeric"
        />
        <div className="text-xs md:text-sm text-gray-500 text-center">{normalizeDigits(value).length}/{maxLen} {isArabic ? "أرقام" : "digits"}</div>
      </div>
    );
  }

  return (
    <div className="space-y-2 md:space-y-3" dir={isArabic ? "rtl" : "ltr"}>
      <div className="w-full text-center text-xl md:text-2xl font-semibold tracking-widest py-2 md:py-3 border rounded-xl md:rounded-2xl bg-gray-50">{format(value) || "—"}</div>
      <div className="grid grid-cols-3 gap-2 md:gap-3">
        {keys.slice(0, 9).map(k => (<button key={k} type="button" onClick={() => add(k)} className="py-2.5 md:py-3 rounded-xl md:rounded-2xl border hover:bg-gray-50 text-lg md:text-xl shadow-sm active:scale-95 transition-transform">{k}</button>))}
        <button type="button" onClick={back} className="py-2.5 md:py-3 rounded-xl md:rounded-2xl border hover:bg-gray-50 text-lg md:text-xl active:scale-95 transition-transform">⌫</button>
        <button type="button" onClick={() => add("0")} className="py-2.5 md:py-3 rounded-xl md:rounded-2xl border hover:bg-gray-50 text-lg md:text-xl active:scale-95 transition-transform">0</button>
        <button type="button" onClick={clear} className="py-2.5 md:py-3 rounded-xl md:rounded-2xl border hover:bg-gray-50 text-xs md:text-sm active:scale-95 transition-transform">{isArabic ? "مسح" : "Clear"}</button>
      </div>
      <div className="text-xs md:text-sm text-gray-500 text-center">{normalizeDigits(value).length}/{maxLen} {isArabic ? "أرقام" : "digits"}</div>
    </div>
  );
};
const LangSwitch = ({ to, rtl = false }) => (
  <Link to={to} className={`inline-flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border text-xs md:text-sm bg-white/70 backdrop-blur hover:bg-white transition ${rtl ? "ml-auto" : "mr-auto"}`}>
    <span role="img" aria-hidden>🌐</span>{to === "/elogin" ? "English" : "عربي"}
  </Link>
);
const CloseButton = () => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)} className="inline-flex"><span className="bg-red-500 hover:bg-red-600 text-white w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl grid place-items-center text-base md:text-lg leading-none shadow transition">×</span></button>
  );
};
async function APIloginPost(path, body, token) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
    credentials: "include"
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
async function APIloginGet(path, token) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    credentials: "include"
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
const EtermsContent = () => (
  <div className="text-sm text-gray-700 space-y-4">
    <p>By using this service, you agree to our terms and conditions.</p>
    <p>Please read the terms carefully before proceeding.</p>
  </div>
);
const getAuthToken = () => localStorage.getItem("authToken");
const apiCall = async (url, options = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const response = await fetch(url, { ...options, headers, credentials: 'include' });
  if (!response.ok && response.status === 401) {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userPhone");
    throw new Error("Unauthorized");
  }
  return response;
};
const ToastContext = createContext(null);
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) return { showToast: (msg) => alert(msg) };
  return context;
};
const api = {
  getProducts: async () => {
    try { const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products`); if (!r.ok) throw new Error(); return await r.json(); } catch { return []; }
  },
  getProductBySku: async (productSku) => {
    try { const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products/${productSku}`); if (!r.ok) throw new Error(); return await r.json(); } catch { return null; }
  },
  getUserByPhone: async (phone) => {
    if (!phone) return null;
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/users/${phone}`); return await r.json(); } catch { return null; }
  },
  getUserCart: async (phone) => {
    if (!phone) return [];
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`); return await r.json(); } catch { return []; }
  },
  addToCart: async (phone, cartItem) => {
    if (!phone) throw new Error("Not authenticated");
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`, { method: 'POST', body: JSON.stringify(cartItem) });
    if (!r.ok) throw new Error(); return await r.json();
  },
  updateCartItem: async (id, cartItem) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${id}`, { method: 'PUT', body: JSON.stringify(cartItem) });
    if (!r.ok) throw new Error(); return await r.json();
  },
  removeFromCart: async (id) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(); return { success: true };
  },
  addInterest: async (phone, interestData) => {
    if (!phone) throw new Error("Not authenticated");
    const r = await apiCall(`${API_BASE_URL}/t3wn/interist/${phone}`, { method: 'POST', body: JSON.stringify(interestData) });
    if (!r.ok) throw new Error(); return await r.json();
  },
  getUserInterests: async (phone) => {
    if (!phone) return [];
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/interist/${phone}`); return await r.json(); } catch { return []; }
  },
  getUserProfile: async (phone) => {
    if (!phone) return null;
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/profile/${phone}`); return await r.json(); } catch { return null; }
  },
  getAllOrders: async () => {
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/order`); return await r.json(); } catch { return []; }
  },
  getOrdersByPhone: async (phone) => {
    if (!phone) return [];
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/order/${phone}`); return await r.json(); } catch { return []; }
  },
  getProductImage: (productSku, imageName) => `${API_OPEN_BASE_URL}/t3wn/products/${productSku}/${imageName}`,
  getFavoritesByPhone: async (phone) => {
    if (!phone) return [];
    try { const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}`); return await r.json(); } catch { return []; }
  },
  addToFavorites: async (phone, favoriteItem) => {
    if (!phone) throw new Error("Not authenticated");
    const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}`, { method: 'POST', body: JSON.stringify(favoriteItem) });
    if (!r.ok) throw new Error(); return await r.json();
  },
  removeFromFavorites: async (phone, id) => {
    if (!phone) throw new Error("Not authenticated");
    const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}/${id}`, { method: 'DELETE' });
    if (!r.ok) throw new Error(); return { success: true };
  }
};
const getAverageRating = (ratings) => {
  if (!ratings?.length) return 0;
  const total = ratings.reduce((s, r) => s + r.score, 0);
  return (total / ratings.length).toFixed(1);
};
const RatingStars = ({ score }) => {
  const full = Math.floor(score);
  const half = score % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <div className="flex">
      {[...Array(full)].map((_, i) => <span key={`f-${i}`} className="text-gray-600">★</span>)}
      {half && <span className="text-gray-300">★</span>}
      {[...Array(empty)].map((_, i) => <span key={`e-${i}`} className="text-gray-300">★</span>)}
    </div>
  );
};
const countryRates = {
  Oman: { symbol: "OMR", flag: "🇴🇲" }, Kuwait: { symbol: "KWD", flag: "🇰🇼" },
  Bahrain: { symbol: "BHD", flag: "🇧🇭" }, Qatar: { symbol: "QAR", flag: "🇶🇦" },
  UAE: { symbol: "AED", flag: "🇦🇪" }, Saudi: { symbol: "SAR", flag: "🇸🇦" }
};
const formatPhoneNumber = (phone) => {
  if (!phone) return '';
  const str = String(phone);
  const countryCodes = ['+973', '+965', '+968', '+974', '+966', '+971', '973', '965', '968', '974', '966', '971'];
  let cleaned = str;
  for (const code of countryCodes) { if (cleaned.startsWith(code)) { cleaned = cleaned.substring(code.length); break; } }
  return cleaned.trim();
};
const css = `.scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none}.scrollbar-hide::-webkit-scrollbar{display:none}`;
if (typeof document !== 'undefined' && !document.getElementById('scrollbar-hide-style')) {
  const s = document.createElement('style');
  s.id = 'scrollbar-hide-style';
  s.textContent = css;
  document.head.appendChild(s);
}
const normalizeUrl = (url) => {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (!/^https?:\/\//.test(trimmed)) return `https://${trimmed}`;
  return trimmed;
};
const apistoreview = {
  getAllProfiles: async () => {
    const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/profile`); if (!r.ok) throw new Error('Failed to fetch profiles'); return r.json();
  },
  getProfileByStoreName: async (storename) => {
    const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/profile/store/${storename}`); if (!r.ok) throw new Error('Failed to fetch profile'); return r.json();
  },
  getProfileByPhone: async (phone) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/profile/${phone}`); if (!r.ok) throw new Error('Failed to fetch profile'); return r.json();
  },
  getStoreLogo: (storelogo) => storelogo ? `${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${storelogo}` : null,
  getIntroImage: (introimage) => introimage ? `${API_OPEN_BASE_URL}/t3wn/profile/introimg/${introimage}` : null,
  getProducts: async () => {
    const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products`); if (!r.ok) throw new Error('Failed to fetch products'); return r.json();
  },
  getProductsByPhone: async (phone) => {
    const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products/${phone}`); if (!r.ok) throw new Error('Failed to fetch products'); return r.json();
  },
  getProductBySku: async (sku) => {
    const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products/${sku}`); if (!r.ok) throw new Error('Failed to fetch product'); return r.json();
  },
  getUserCart: async (phone) => {
    if (!phone) return [];
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`); if (!r.ok) { if (r.status === 404) return []; throw new Error('Failed to fetch cart'); } return r.json();
  },
  addToCart: async (phone, cartItem) => {
    if (!phone) throw new Error('Not authenticated');
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`, { method: 'POST', body: JSON.stringify(cartItem) });
    if (!r.ok) throw new Error('Failed to add to cart'); return r.json();
  },
  updateCartItem: async (id, cartItem) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${id}`, { method: 'PUT', body: JSON.stringify(cartItem) });
    if (!r.ok) throw new Error('Failed to update cart'); return r.json();
  },
  removeFromCart: async (id) => {
    const r = await fetch(`${API_BASE_URL}/t3wn/cart/${id}`, { method: 'DELETE' }); if (!r.ok) throw new Error('Failed to remove from cart'); return r.ok;
  },
  incrementStoreVisits: async (storename) => {
    const r = await fetch(`${API_BASE_URL}/t3wn/profile/store/${storename}`, { method: 'POST' }); if (!r.ok) throw new Error('Failed to increment store visits'); return r.json();
  },
  getCollectionsByPhone: async (phone) => {
    try {
      const r = await fetch(`${API_BASE_URL}/t3wn/collection/${encodeURIComponent(phone)}`);
      if (!r.ok) return [];
      return await r.json();
    } catch {
      return [];
    }
  },
  viewCollectionImageUrl: (collectionimg, v = 0) => collectionimg ? `${API_BASE_URL}/t3wn/collection/file/${encodeURIComponent(collectionimg)}?v=${v}` : null,
};
export const EStoreView = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userPhone = getUserPhone();
  const { showToast } = useToast();
  const { storename } = useParams();
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socialModal, setSocialModal] = useState({ open: false, url: '', platform: '' });
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupQuantity, setPopupQuantity] = useState(1);
  const [popupSelectedOptions, setPopupSelectedOptions] = useState({});
  const [popupImageIndex, setPopupImageIndex] = useState(0);
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    cardRadius: storeProfile?.cards?.borderRadius || '0.75rem',
    cardShadow: storeProfile?.cards?.shadow || '0 2px 6px rgba(0,0,0,0.08)',
    btnBg: storeProfile?.buttons?.backgroundColor || '#f97316',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  useEffect(() => {
    (async () => {
      if (userPhone) {
        try {
          const cart = await apistoreview.getUserCart(userPhone);
          setCartCount(cart.reduce((s, i) => s + i.qty, 0));
        } catch {
          setCartCount(0);
        }
        try {
          const u = await api.getUserByPhone(userPhone);
          setUser(u);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        setCartCount(0);
      }
    })();
  }, [userPhone]);
  const handleAddToCartClick = (p, e) => {
    e?.stopPropagation();
    if (!userPhone) { setShowLoginPopup(true); return; }
    setSelectedProduct(p);
    const init = {};
    p.variables?.forEach(v => { if (v.options && v.options.length > 0) { init[v.name] = v.options[0].value; } });
    setPopupSelectedOptions(init);
    setPopupQuantity(1);
    setShowAddProductPopup(true);
  };
  const getPopupInventory = () => {
    if (!selectedProduct || !selectedProduct.quantity || selectedProduct.quantity.length === 0) return 0;
    if (!selectedProduct.variables || selectedProduct.variables.length === 0) return 0;
    if (!popupSelectedOptions || Object.keys(popupSelectedOptions).length === 0) return 0;
    const match = selectedProduct.quantity.find(q => {
      if (!q.variables || q.variables.length === 0) return false;
      const ok = Object.entries(popupSelectedOptions).every(([name, val]) => {
        const def = selectedProduct.variables.find(vd => vd.name === name);
        if (!def) return false;
        const qv = q.variables.find(v => v.id === def.id);
        if (!qv) {
          const idx = selectedProduct.variables.findIndex(vd => vd.name === name);
          if (idx >= 0 && idx < q.variables.length) {
            const byPos = q.variables[idx];
            return byPos.valueqty === val;
          }
          return false;
        }
        return qv.valueqty === val;
      });
      return ok;
    });
    return match ? match.qty : 0;
  };
  const handleAddToCartFromPopup = async () => {
    if (!selectedProduct || !userPhone) return;
    try {
      const vars = Object.keys(popupSelectedOptions).map(name => {
        const variable = selectedProduct.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === popupSelectedOptions[name]);
        return {
          id: option?.id,
          name,
          value: popupSelectedOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || popupSelectedOptions[name]
        };
      });
      await api.addToCart(userPhone, {
        productsku: selectedProduct.productSku,
        price: selectedProduct.price,
        qty: popupQuantity,
        variables: vars
      });
      const cart = await api.getUserCart(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowAddProductPopup(false);
      showToast("Product successfully added to cart!", 'success');
    } catch (e) {
      if (e.message === "Not authenticated" || e.message === "Unauthorized") {
        setShowLoginPopup(true);
      } else {
        showToast("Failed to add product to cart", 'error');
      }
    }
  };
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true); setError(null);
        const decodedStorename = decodeURIComponent(storename || '');
        const profiles = await apistoreview.getAllProfiles();
        const cur = profiles.find((p) => p.store?.storename === decodedStorename || p.store?.storename?.toLowerCase() === decodedStorename.toLowerCase());
        if (!cur) { setError('Store not found'); return; }
        setStoreProfile(cur); setStoreInfo(cur.store);
        if (cur.phone) {
          const storeProducts = await apistoreview.getProductsByPhone(cur.phone);
          setProducts(storeProducts);
          try {
            const cols = await apistoreview.getCollectionsByPhone(cur.phone);
            setCollections(cols || []);
          } catch {}
        }
        const ord = await api.getAllOrders(); setOrders(ord);
        await apistoreview.incrementStoreVisits(decodedStorename);
      } catch (e) { setError('Failed to load store data'); } finally { setLoading(false); }
    };
    if (storename) run();
  }, [storename, userPhone]);
  const filteredProducts = products.filter((p) => {
    if (!p.active || !p.approved || !p.quantity?.some((v) => v.qty > 0)) return false;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q || (p.title || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q);
    const matchCat = selectedCategory === null || p.category === selectedCategory;
    const matchCollection = !selectedCollection || (selectedCollection.products || []).some(cp => (cp.productsku === p.productSku || cp.productsku === p.productsku));
    return matchSearch && matchCat && matchCollection;
  });
  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: theme.btnBg }}><FaShoppingCart size={24} className="text-white" /></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">Loading Store...</h3>
        <p className="text-gray-500 text-sm">Please wait while we fetch the store details</p>
      </div>
    </div>
  );

  if (error || !storeInfo || !storeProfile) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.btnBg }}><span className="text-white text-2xl">⚠️</span></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">Store Not Found</h3>
        <p className="text-gray-500 mb-6 text-sm">{error || "The store you're looking for doesn't exist or is temporarily unavailable."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
          style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
  const country = user?.country || 'Oman';
  const cr = countryRates[country] || countryRates.Oman;

  return (
    <>
      <div className="min-h-screen max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto" style={{ backgroundColor: theme.bg }}>
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-300 shadow-md" style={{ backgroundColor: theme.cardBg, color: theme.cardText }}>
          <div className="mx-auto px-4 md:px-6 lg:px-8 py-2 md:py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  {storeInfo.storelogo ? (
                    <img src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${storeInfo.storelogo}`} alt={storeInfo.storename} className="w-10 h-10 rounded-full object-cover border-2 border-gray-300" onError={(e) => e.target.style.display = 'none'} />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300"><FaStore className="text-gray-500" size={16} /></div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <h1 className="text-sm font-bold text-gray-800 leading-tight truncate">{storeInfo.storename}</h1>
              </div>
              <div className="flex items-center gap-2">
                {userPhone && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/en/cart'); }}
                      className="relative px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      <FaShoppingCart size={16} />
                      {cartCount > 0 && <span className="text-xs font-semibold">{cartCount}</span>}
                    </button>
                    <button
                      onClick={() => { navigate(`/en/chatstore/${storename}`); }}
                      className="px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      <FaCommentDots size={16} />
                      <span className="text-xs font-semibold">Chat</span>
                    </button>
                  </>
                )}
                <button onClick={() => navigate("/ar/" + storename)} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] text-gray-500 hover:bg-gray-50 flex items-center gap-1 shadow-sm">
                  {user?.country && countryRates[user.country]?.flag ? (
                    <>
                      <span className="text-base">{countryRates[user.country].flag}</span>
                      <span className="truncate max-w-[60px]">عربي</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🇸🇦</span>
                      <span>عربي</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700">
              {userPhone && user ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-500">Welcome</span>
                  <span className="font-semibold truncate">{user.name || "User"}</span>
                  <span className="text-gray-500">{formatPhoneNumber(user.phone)}</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/elogin")}
                  className="px-3 py-1.5 text-xs font-semibold transition rounded-full"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                >
                  Login / Sign up
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {(storeProfile.intro?.image || storeProfile.introimage) && (
            <div className="mb-6 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.btnBg}33` }}>
              <div className="flex flex-row">
                <div className="w-2/5 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={`${API_OPEN_BASE_URL}/t3wn/profile/introimg/${storeProfile.intro?.image || storeProfile.introimage}`}
                    alt="Store Banner"
                    className="w-full h-56 md:h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className="w-3/5 p-6 md:p-8 flex flex-col justify-center backdrop-blur-sm" style={{ backgroundColor: theme.cardBg }}>
                  <div className="inline-block mb-3">
                    <span className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-md" style={{ backgroundColor: theme.btnBg }}>STORE</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: theme.cardText }}>{storeProfile.intro?.title || 'Welcome'}</h2>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">{storeProfile.intro?.description || 'Discover amazing products'}</p>
                </div>
              </div>
            </div>
          )}
          {collections.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: theme.btnBg }}></span>
                  Collections
                </h3>
                {selectedCollection && (
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="text-xs font-semibold px-2 py-1 rounded-md transition"
                    style={{ color: theme.cardText, backgroundColor: theme.cardBg }}
                  >
                    Show All
                  </button>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {collections.map((col, idx) => {
                  const img = col.collectionImg || col.collectionimg;
                  const isSelected = selectedCollection?.id === col.id;
                  return (
                    <div
                      key={col.id || idx}
                      onClick={() => setSelectedCollection(isSelected ? null : col)}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                    >
                      <div
                        className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-br from-white to-gray-50"
                        style={isSelected ? { borderColor: theme.btnBg, boxShadow: `0 0 0 4px ${theme.btnBg}33` } : { borderColor: '#e5e7eb' }}
                        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.borderColor = '#e5e7eb'; }}
                      >
                        {img ? (
                          <img src={apistoreview.viewCollectionImageUrl(img)} alt={col.collectionName || col.collectionname} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.cardBg }}>
                            <FaStore className="text-gray-400" size={16} />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]" style={{ backgroundColor: `${theme.btnBg}33` }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transform scale-110" style={{ backgroundColor: theme.btnBg }}>
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </div>
                        )}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-100 hover:opacity-0'} bg-gradient-to-t from-black/10 to-transparent`}></div>
                      </div>
                      <p className={`text-[10px] font-semibold mt-2 text-center truncate w-20 transition-colors ${isSelected ? 'font-bold' : ''}`} style={{ color: isSelected ? theme.cardText : '#4b5563' }}>
                        {col.collectionName || col.collectionname}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: theme.cardText }}>{selectedCollection ? (selectedCollection.collectionName || selectedCollection.collectionname) : 'Products'}</h3>
              <span
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
              >
                {filteredProducts.length} items
              </span>
            </div>
            <div className="rounded-full border border-gray-200 px-3 py-1.5 flex items-center shadow-sm" style={{ backgroundColor: theme.cardBg, color: theme.cardText }}>
              <FaStore className="text-gray-400 mr-2" size={14} />
              <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="flex-1 bg-transparent text-sm focus:outline-none" />
            </div>
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {filteredProducts.map((p) => {
                  const firstImage = p.generalImages?.[0] || p.generalimages?.[0];
                  const imageUrl = firstImage ? `${API_OPEN_BASE_URL}/t3wn/products/${p.productSku}/${firstImage.img}` : null;
                  const price = p.price.toFixed(2);
                  const cardStyle = { backgroundColor: theme.cardBg, color: theme.cardText, borderRadius: theme.cardRadius, boxShadow: theme.cardShadow };
                  return (
                    <div
                      key={p.id || p.productSku}
                      className="group rounded-lg transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                      style={cardStyle}
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.btnBg}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {imageUrl ? (
                          <img src={imageUrl} alt={p.title} className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-300" onError={(e) => { e.target.style.display = 'none'; e.target.nextElementSibling.style.display = 'flex'; }} />
                        ) : null}
                        <div className={`w-full h-28 ${imageUrl ? 'hidden' : 'flex'} items-center justify-center bg-gray-100`}><span className="text-gray-400 text-[10px]">No Image</span></div>
                        <div className="absolute top-1.5 right-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-gray-200" style={{ color: theme.cardText }}>
                          <span className="text-[10px] font-bold" style={{ color: theme.cardText }}>{price} {cr.symbol}</span>
                        </div>
                        {p.ratings && p.ratings.length > 0 && (
                          <div className="absolute bottom-1.5 left-1.5 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                            <RatingStars score={getAverageRating(p.ratings)} />
                            <span className="text-[9px] font-semibold text-gray-700">({p.ratings.length})</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex-1 flex flex-col justify-between bg-white">
                        <div>
                          <h4 className="font-semibold text-xs mb-1.5 line-clamp-2 text-gray-900 leading-tight">{p.title}</h4>
                          {p.ratings && p.ratings.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setShowReviewsPopup(true); }}
                              className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer mb-1"
                            >
                              View {p.ratings.length} review{p.ratings.length > 1 ? 's' : ''}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs font-bold" style={{ color: theme.cardText }}>
                            {price} <span className="text-[8px] text-gray-500">{cr.symbol}</span>
                          </div>
                          <button onClick={(e) => handleAddToCartClick(p, e)} className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:scale-110 active:scale-95" style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}>
                            <FaShoppingCart size={11} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center"><FaShoppingCart size={28} className="text-gray-400" /></div>
                <h3 className="text-base font-semibold text-gray-600 mb-1">No Products Found</h3>
                <p className="text-gray-500 text-sm">This store doesn't have any products yet.</p>
              </div>
            )}
          </div>
        </div>
        {storeProfile.socialMedia && storeProfile.socialMedia.length > 0 && (
          <div className="mx-auto bg-white border-t border-gray-300 shadow-md">
            <div className="px-4 md:px-6 lg:px-8 py-4 md:py-6">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Follow Us</h3>
              <div className="flex justify-center gap-3">
                {storeProfile.socialMedia.map((s, i) => {
                  const safeUrl = normalizeUrl(s.url);
                  if (!safeUrl) return null;
                  const Icon = () => {
                    switch ((s.platform || '').toLowerCase()) {
                      case 'facebook': return <FaFacebook size={16} />;
                      case 'instagram': return <FaInstagram size={16} />;
                      case 'tiktok': return <FaTiktok size={16} />;
                      case 'youtube': return <FaYoutube size={16} />;
                      case 'x': return <FaTwitter size={16} />;
                      default: return null;
                    }
                  };
                  return (
                    <button key={i} onClick={() => setSocialModal({ open: true, url: safeUrl, platform: s.platform })} className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700" title={s.platform}>
                      <Icon />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLoginPopup(false)}>
          <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 max-w-sm md:max-w-md lg:max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">Login Required</h3>
              <p className="text-gray-600 mb-4">Please login to continue</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLoginPopup(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                <button
                  onClick={() => { setShowLoginPopup(false); navigate("/elogin"); }}
                  className="flex-1 px-4 py-2 rounded-lg transition"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddProductPopup && selectedProduct && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4" style={{ position: 'fixed' }} onClick={() => setShowAddProductPopup(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto mx-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">Add to Cart</h2>
              <button onClick={() => setShowAddProductPopup(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                {(selectedProduct.generalImages || selectedProduct.generalimages || []).length > 0 ? (
                  <>
                    <div className="bg-gray-50 rounded-lg overflow-hidden mb-2">
                      <SimpleImage
                        productSku={selectedProduct.productSku}
                        imageName={(selectedProduct.generalImages || selectedProduct.generalimages || [])[popupImageIndex]?.img}
                        alt={selectedProduct.title}
                        className="w-full h-64 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    {(selectedProduct.generalImages || selectedProduct.generalimages || []).length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {(selectedProduct.generalImages || selectedProduct.generalimages || []).map((img, i) => (
                          <SimpleImage
                            key={img.id || i}
                            productSku={selectedProduct.productSku}
                            imageName={img.img}
                            alt="thumbnail"
                            className="w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all flex-shrink-0"
                            style={
                              i === popupImageIndex
                                ? { borderColor: theme.btnBg, boxShadow: `0 0 0 2px ${theme.btnBg}55` }
                                : { borderColor: '#d1d5db' }
                            }
                            onMouseEnter={(e) => { if (i !== popupImageIndex) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                            onMouseLeave={(e) => { if (i !== popupImageIndex) e.currentTarget.style.borderColor = '#d1d5db'; }}
                            onClick={() => setPopupImageIndex(i)}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
              <h3 className="text-xl font-bold mb-2">{selectedProduct.title}</h3>
              <p className="text-gray-600 mb-4">{selectedProduct.discribtion || selectedProduct.description || ""}</p>
              {selectedProduct.variables?.map(v => (
                <div key={v.name} className="mb-4">
                  <h4 className="font-semibold mb-2">{v.name}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map(o => {
                      const active = popupSelectedOptions[v.name] === o.value;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setPopupSelectedOptions({ ...popupSelectedOptions, [v.name]: o.value })}
                          className="px-4 py-2 rounded-md border transition-colors"
                          style={active ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText } : { borderColor: '#d1d5db', backgroundColor: '#f3f4f6', color: theme.cardText }}
                        >
                          {o.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">Inventory: {getPopupInventory()} left</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={() => setPopupQuantity(Math.max(1, popupQuantity - 1))} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={popupQuantity <= 1}><FaMinus /></button>
                    <span className="px-4 py-1 border-x border-gray-300">{popupQuantity}</span>
                    <button onClick={() => setPopupQuantity(Math.min(getPopupInventory(), popupQuantity + 1))} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={popupQuantity >= getPopupInventory() || getPopupInventory() === 0}><FaPlus /></button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">Price:</span>
                <span className="text-xl font-bold" style={{ color: theme.cardText }}>{currencyCountry(selectedProduct.price, user?.country || "Oman")}</span>
              </div>
              <button
                onClick={handleAddToCartFromPopup}
                className="w-full py-3 rounded-lg font-semibold transition shadow-lg"
                style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}
      {socialModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-800 truncate">{socialModal.platform} Page</span>
              <button onClick={() => setSocialModal({ open: false, url: '', platform: '' })} className="p-1.5 rounded-full hover:bg-gray-100">✕</button>
            </div>
            <div className="w-full h-96 bg-gray-100">
              {socialModal.url && <iframe src={socialModal.url} title={socialModal.platform} className="w-full h-full border-0" />}
            </div>
          </div>
        </div>
      )}
      {showReviewsPopup && selectedProduct && (
        <ReviewsPopup
          product={selectedProduct}
          onClose={() => { setShowReviewsPopup(false); setSelectedProduct(null); }}
          isArabic={false}
        />
      )}
    </>
  );
};
export const AStoreView = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const [orders, setOrders] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const userPhone = getUserPhone();
  const { showToast } = useToast();
  const { storename } = useParams();
  const [storeInfo, setStoreInfo] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socialModal, setSocialModal] = useState({ open: false, url: '', platform: '' });
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showReviewsPopup, setShowReviewsPopup] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [popupQuantity, setPopupQuantity] = useState(1);
  const [popupSelectedOptions, setPopupSelectedOptions] = useState({});
  const [popupImageIndex, setPopupImageIndex] = useState(0);
  useEffect(() => {
    (async () => {
      if (userPhone) {
        try {
          const cart = await apistoreview.getUserCart(userPhone);
          setCartCount(cart.reduce((s, i) => s + i.qty, 0));
        } catch {
          setCartCount(0);
        }
        try {
          const u = await api.getUserByPhone(userPhone);
          setUser(u);
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
        setCartCount(0);
      }
    })();
  }, [userPhone]);
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const decodedStorename = decodeURIComponent(storename || '');
        const profiles = await apistoreview.getAllProfiles();
        const cur = profiles.find((p) =>
          p.store?.storename === decodedStorename ||
          p.store?.storename?.toLowerCase() === decodedStorename.toLowerCase()
        );
        if (!cur) {
          setError('المتجر غير موجود');
          return;
        }
        setStoreProfile(cur);
        setStoreInfo(cur.store);
        if (cur.phone) {
          const storeProducts = await apistoreview.getProductsByPhone(cur.phone);
          setProducts(storeProducts);
          try {
            const cols = await apistoreview.getCollectionsByPhone(cur.phone);
            setCollections(cols || []);
          } catch {}
        }
        const ord = await api.getAllOrders();
        setOrders(ord);
        await apistoreview.incrementStoreVisits(decodedStorename);
      } catch (e) {
        setError('فشل في تحميل بيانات المتجر');
      } finally {
        setLoading(false);
      }
    };
    if (storename) run();
  }, [storename, userPhone]);
  const handleAddToCartClick = (p, e) => {
    e?.stopPropagation();
    if (!userPhone) { setShowLoginPopup(true); return; }
    setSelectedProduct(p);
    const init = {};
    p.variables?.forEach(v => { if (v.options && v.options.length > 0) { init[v.name] = v.options[0].value; } });
    setPopupSelectedOptions(init);
    setPopupQuantity(1);
    setShowAddProductPopup(true);
  };
  const getPopupInventory = () => {
    if (!selectedProduct || !selectedProduct.quantity || selectedProduct.quantity.length === 0) return 0;
    if (!selectedProduct.variables || selectedProduct.variables.length === 0) return 0;
    if (!popupSelectedOptions || Object.keys(popupSelectedOptions).length === 0) return 0;
    const match = selectedProduct.quantity.find(q => {
      if (!q.variables || q.variables.length === 0) return false;
      const ok = Object.entries(popupSelectedOptions).every(([name, val]) => {
        const def = selectedProduct.variables.find(vd => vd.name === name);
        if (!def) return false;
        const qv = q.variables.find(v => v.id === def.id);
        if (!qv) {
          const idx = selectedProduct.variables.findIndex(vd => vd.name === name);
          if (idx >= 0 && idx < q.variables.length) {
            const byPos = q.variables[idx];
            return byPos.valueqty === val;
          }
          return false;
        }
        return qv.valueqty === val;
      });
      return ok;
    });
    return match ? match.qty : 0;
  };
  const handleAddToCartFromPopup = async () => {
    if (!selectedProduct || !userPhone) return;
    try {
      const vars = Object.keys(popupSelectedOptions).map(name => {
        const variable = selectedProduct.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === popupSelectedOptions[name]);
        return {
          id: option?.id,
          name,
          value: popupSelectedOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || popupSelectedOptions[name]
        };
      });
      await api.addToCart(userPhone, {
        productsku: selectedProduct.productSku,
        price: selectedProduct.price,
        qty: popupQuantity,
        variables: vars
      });
      const cart = await api.getUserCart(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowAddProductPopup(false);
      showToast("تم إضافة المنتج إلى السلة بنجاح!", 'success');
    } catch (e) {
      if (e.message === "Not authenticated" || e.message === "Unauthorized") {
        setShowLoginPopup(true);
      } else {
        showToast("فشل إضافة المنتج إلى السلة", 'error');
      }
    }
  };
  const filteredProducts = products.filter((p) => {
    if (!p.active || !p.approved || !p.quantity?.some((v) => v.qty > 0)) return false;
    const q = searchTerm.toLowerCase();
    const matchSearch = !q ||
      (p.atitle || '').toLowerCase().includes(q) ||
      (p.acategory || '').toLowerCase().includes(q);
    const matchCat = selectedCategory === null || p.category === selectedCategory;
    const matchCollection = !selectedCollection || (selectedCollection.products || []).some(cp => (cp.productsku === p.productSku || cp.productsku === p.productsku));
    return matchSearch && matchCat && matchCollection;
  });
  const getOrderCount = (productSku) => orders.reduce((total, order) => {
    const orderItems = order.orders || [];
    return total + orderItems.filter((item) =>
      item.productsku === productSku
    ).reduce((sum, item) => sum + (item.qty || 0), 0);
  }, 0);
  const formatOrderDisplay = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}ألف`;
    return count.toString();
  };
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    cardRadius: storeProfile?.cards?.borderRadius || '0.75rem',
    cardShadow: storeProfile?.cards?.shadow || '0 2px 6px rgba(0,0,0,0.08)',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center animate-pulse" style={{ backgroundColor: theme.btnBg }}><FaShoppingCart size={24} className="text-white" /></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">جاري تحميل المتجر...</h3>
        <p className="text-gray-500 text-sm">يرجى الانتظار بينما نقوم بجلب تفاصيل المتجر</p>
      </div>
    </div>
  );

  if (error || !storeInfo || !storeProfile) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center w-full mx-auto px-4 md:px-6 lg:px-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.btnBg }}><span className="text-white text-2xl">⚠️</span></div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">المتجر غير موجود</h3>
        <p className="text-gray-500 mb-6 text-sm">
          {error || "المتجر الذي تبحث عنه غير موجود أو غير متاح مؤقتًا."}
        </p>
        <button
          onClick={() => navigate(-1)}
          className="px-6 py-3 text-white rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl text-sm"
          style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
        >
          العودة للخلف
        </button>
      </div>
    </div>
  );
  const country = user?.country || 'Oman';
  const cr = countryRates[country] || countryRates.Oman;

  return (
    <>
      <div className="min-h-screen max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto" dir="rtl" style={{ backgroundColor: theme.bg }}>
        <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-300 shadow-md" style={{ backgroundColor: theme.cardBg, color: theme.cardText }}>
          <div className="mx-auto px-4 md:px-6 lg:px-8 py-2 md:py-3 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  {storeInfo.storelogo ? (
                    <img
                      src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${storeInfo.storelogo}`}
                      alt={storeInfo.astorename || storeInfo.storename}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-300"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-300">
                      <FaStore className="text-gray-500" size={16} />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                </div>
                <h1 className="text-sm font-bold text-gray-800 leading-tight truncate">{storeInfo.astorename || storeInfo.storename}</h1>
              </div>
              <div className="flex items-center gap-2">
                {userPhone && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/ar/cart'); }}
                      className="relative px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      <FaShoppingCart size={16} />
                      {cartCount > 0 && <span className="text-xs font-semibold">{cartCount}</span>}
                    </button>
                    <button
                      onClick={() => { navigate(`/ar/achatstore/${storename}`); }}
                      className="px-3 py-2 rounded-lg transition-all flex items-center gap-2"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      <FaCommentDots size={16} />
                      <span className="text-xs font-semibold">محادثة</span>
                    </button>
                  </>
                )}
                <button onClick={() => navigate("/en/" + storename)} className="px-2.5 py-1.5 bg-white border border-gray-200 rounded-full text-[11px] text-gray-500 hover:bg-gray-50 flex items-center gap-1 shadow-sm">
                  {user?.country && countryRates[user.country]?.flag ? (
                    <>
                      <span className="text-base">{countryRates[user.country].flag}</span>
                      <span className="truncate max-w-[60px]">English</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base">🇬🇧</span>
                      <span>English</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-700" dir="rtl">
              {userPhone && user ? (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-gray-500">مرحباً</span>
                  <span className="font-semibold truncate">{user.name || "مستخدم"}</span>
                  <span className="text-gray-500">{formatPhoneNumber(user.phone)}</span>
                </div>
              ) : (
                <button
                  onClick={() => navigate("/alogin")}
                  className="px-3 py-1.5 text-xs font-semibold transition rounded-full"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                >
                  تسجيل الدخول / إنشاء حساب
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
          {(storeProfile.intro?.image || storeProfile.introimage) && (
            <div className="mb-6 rounded-2xl shadow-xl overflow-hidden backdrop-blur-sm" style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.btnBg}33` }}>
              <div className="flex flex-row-reverse">
                <div className="w-2/5 flex-shrink-0 relative overflow-hidden">
                  <img
                    src={`${API_OPEN_BASE_URL}/t3wn/profile/introimg/${storeProfile.intro?.image || storeProfile.introimage}`}
                    alt="لافتة المتجر"
                    className="w-full h-56 md:h-64 object-cover transform hover:scale-105 transition-transform duration-500"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                </div>
                <div className="w-3/5 p-6 md:p-8 flex flex-col justify-center backdrop-blur-sm" dir="rtl" style={{ backgroundColor: theme.cardBg }}>
                  <div className="inline-block mb-3">
                    <span className="px-3 py-1 text-white text-xs font-bold rounded-full shadow-md" style={{ backgroundColor: theme.btnBg }}>المتجر</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold mb-3" style={{ color: theme.cardText }}>
                    {storeProfile.intro?.atitle || storeProfile.intro?.title || 'أهلاً بكم'}
                  </h2>
                  <p className="text-sm md:text-base text-gray-700 leading-relaxed font-medium">
                    {storeProfile.intro?.adescription || storeProfile.intro?.description || 'اكتشفوا منتجات رائعة'}
                  </p>
                </div>
              </div>
            </div>
          )}
          {collections.length > 0 && (
            <div className="mb-5">
              <div className="flex items-center justify-between mb-3" dir="rtl">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full" style={{ backgroundColor: theme.btnBg }}></span>
                  المجموعات
                </h3>
                {selectedCollection && (
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="text-xs font-semibold px-2 py-1 rounded-md transition"
                    dir="rtl"
                    style={{ color: theme.cardText, backgroundColor: theme.cardBg }}
                  >
                    عرض الكل
                  </button>
                )}
              </div>
              <div className="flex gap-3 overflow-x-auto pb-3 scrollbar-hide -mx-1 px-1">
                {collections.map((col, idx) => {
                  const img = col.collectionImg || col.collectionimg;
                  const isSelected = selectedCollection?.id === col.id;
                  return (
                    <div
                      key={col.id || idx}
                      onClick={() => setSelectedCollection(isSelected ? null : col)}
                      className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110' : 'hover:scale-105'}`}
                    >
                      <div
                        className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-lg bg-gradient-to-br from-white to-gray-50"
                        style={isSelected ? { borderColor: theme.btnBg, boxShadow: `0 0 0 4px ${theme.btnBg}33` } : { borderColor: '#e5e7eb' }}
                      >
                        {img ? (
                          <img src={apistoreview.viewCollectionImageUrl(img)} alt={col.acollectionName || col.acollectionname || col.collectionName || col.collectionname} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" onError={(e) => e.target.style.display = 'none'} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: theme.cardBg }}>
                            <FaStore className="text-gray-400" size={16} />
                          </div>
                        )}
                        {isSelected && (
                          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[1px]" style={{ backgroundColor: `${theme.btnBg}33` }}>
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shadow-lg transform scale-110" style={{ backgroundColor: theme.btnBg }}>
                              <span className="text-white text-xs font-bold">✓</span>
                            </div>
                          </div>
                        )}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-100 hover:opacity-0'} bg-gradient-to-t from-black/10 to-transparent`}></div>
                      </div>
                      <p className={`text-[10px] font-semibold mt-2 text-center truncate w-20 transition-colors ${isSelected ? 'font-bold' : ''}`} style={{ color: isSelected ? theme.cardText : '#4b5563' }}>
                        {col.acollectionName || col.acollectionname || col.collectionName || col.collectionname}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold" style={{ color: theme.cardText }}>{selectedCollection ? (selectedCollection.acollectionName || selectedCollection.acollectionname || selectedCollection.collectionName || selectedCollection.collectionname) : 'المنتجات'}</h3>
              <span
                className="px-3 py-1 text-sm font-medium rounded-full"
                style={{ backgroundColor: theme.cardBg, color: theme.cardText }}
              >
                {filteredProducts.length} عنصر
              </span>
            </div>

            <div className="rounded-full border border-gray-200 px-3 py-1.5 flex items-center shadow-sm" style={{ backgroundColor: theme.cardBg, color: theme.cardText }}>
              <FaStore className="text-gray-400 ml-2" size={14} />
              <input
                type="text"
                placeholder="البحث في المنتجات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-transparent text-sm focus:outline-none text-right"
                dir="rtl"
              />
            </div>

            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {filteredProducts.map((p) => {
                  const firstImage = p.generalImages?.[0] || p.generalimages?.[0];
                  const imageUrl = firstImage ?
                    `${API_OPEN_BASE_URL}/t3wn/products/${p.productSku}/${firstImage.img}` : null;
                  const price = p.price.toFixed(2);
                  const cardStyle = { backgroundColor: theme.cardBg, color: theme.cardText, borderRadius: theme.cardRadius, boxShadow: theme.cardShadow };

                  return (
                    <div
                      key={p.id || p.productSku}
                      className="group rounded-lg transition-all duration-300 overflow-hidden border border-gray-200 flex flex-col"
                      onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.btnBg}
                      onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                      style={cardStyle}
                    >
                      <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={p.atitle}
                            className="w-full h-28 object-cover group-hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextElementSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-28 ${imageUrl ? 'hidden' : 'flex'} items-center justify-center bg-gray-100`}>
                          <span className="text-gray-400 text-[10px]">لا توجد صورة</span>
                        </div>
                        <div className="absolute top-1.5 left-1.5 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md border border-gray-200" style={{ color: theme.cardText }}>
                          <span className="text-[10px] font-bold" style={{ color: theme.cardText }}>
                            {price} {cr.symbol}
                          </span>
                        </div>
                        {p.ratings && p.ratings.length > 0 && (
                          <div className="absolute bottom-1.5 right-1.5 bg-white/95 backdrop-blur-sm px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-0.5">
                            <RatingStars score={getAverageRating(p.ratings)} />
                            <span className="text-[9px] font-semibold text-gray-700">({p.ratings.length})</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2 flex-1 flex flex-col justify-between" style={{ color: theme.cardText }}>
                        <div>
                          <h4 className="font-semibold text-xs mb-1.5 line-clamp-2 text-gray-900 text-right leading-tight" dir="rtl">
                            {p.atitle}
                          </h4>
                          {p.ratings && p.ratings.length > 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedProduct(p); setShowReviewsPopup(true); }}
                              className="text-[10px] font-medium text-blue-600 hover:text-blue-700 hover:underline cursor-pointer mb-1"
                            >
                              عرض {p.ratings.length} مراجعة
                            </button>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                          <div className="text-xs font-bold" style={{ color: theme.cardText }}>
                            {price} <span className="text-[8px] text-gray-500">{cr.symbol}</span>
                          </div>
                          <button
                            onClick={(e) => handleAddToCartClick(p, e)}
                            className="px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition-all hover:scale-110 active:scale-95"
                            style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                          >
                            <FaShoppingCart size={11} className="text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10">
                <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <FaShoppingCart size={28} className="text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-600 mb-1">لم يتم العثور على منتجات</h3>
                <p className="text-gray-500 text-sm">هذا المتجر لا يحتوي على منتجات بعد.</p>
              </div>
            )}
          </div>
        </div>
        {storeProfile.socialMedia && storeProfile.socialMedia.length > 0 && (
          <div className="max-w-md mx-auto bg-white border-t border-gray-300 shadow-md" dir="rtl">
            <div className="px-4 py-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">تابعونا</h3>
              <div className="flex justify-center gap-3">
                {storeProfile.socialMedia.map((s, i) => {
                  const safeUrl = normalizeUrl(s.url);
                  if (!safeUrl) return null;
                  const Icon = () => {
                    switch ((s.platform || '').toLowerCase()) {
                      case 'facebook': return <FaFacebook size={16} />;
                      case 'instagram': return <FaInstagram size={16} />;
                      case 'tiktok': return <FaTiktok size={16} />;
                      case 'youtube': return <FaYoutube size={16} />;
                      case 'x': return <FaTwitter size={16} />;
                      default: return null;
                    }
                  };
                  return (
                    <button
                      key={i}
                      onClick={() => setSocialModal({ open: true, url: safeUrl, platform: s.platform })}
                      className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-gray-700"
                      title={s.platform}
                    >
                      <Icon />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
      {showLoginPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowLoginPopup(false)}>
          <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-8 max-w-sm md:max-w-md lg:max-w-lg w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <h3 className="text-xl font-bold mb-2">تسجيل الدخول مطلوب</h3>
              <p className="text-gray-600 mb-4">يرجى تسجيل الدخول للمتابعة</p>
              <div className="flex gap-2">
                <button onClick={() => setShowLoginPopup(false)} className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
                <button
                  onClick={() => { setShowLoginPopup(false); navigate("/alogin"); }}
                  className="flex-1 px-4 py-2 rounded-lg transition"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
                >
                  تسجيل الدخول
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showAddProductPopup && selectedProduct && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4" style={{ position: 'fixed' }} onClick={() => setShowAddProductPopup(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto mx-auto" onClick={e => e.stopPropagation()} dir="rtl">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">إضافة إلى السلة</h2>
              <button onClick={() => setShowAddProductPopup(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <div className="p-4">
              <div className="mb-4">
                {(selectedProduct.generalImages || selectedProduct.generalimages || []).length > 0 ? (
                  <>
                    <div className="bg-gray-50 rounded-lg overflow-hidden mb-2">
                      <SimpleImage
                        productSku={selectedProduct.productSku}
                        imageName={(selectedProduct.generalImages || selectedProduct.generalimages || [])[popupImageIndex]?.img}
                        alt={selectedProduct.atitle}
                        className="w-full h-64 object-contain"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    {(selectedProduct.generalImages || selectedProduct.generalimages || []).length > 1 && (
                      <div className="flex gap-2 overflow-x-auto pb-2">
                        {(selectedProduct.generalImages || selectedProduct.generalimages || []).map((img, i) => (
                          <SimpleImage
                            key={img.id || i}
                            productSku={selectedProduct.productSku}
                            imageName={img.img}
                            alt="thumbnail"
                            className={`w-16 h-16 object-cover rounded-lg border-2 cursor-pointer transition-all flex-shrink-0 ${
                              i === popupImageIndex
                                ? 'ring-2 shadow-md'
                                : 'border-gray-300'
                            }`}
                            onClick={() => setPopupImageIndex(i)}
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : null}
              </div>
              <h3 className="text-xl font-bold mb-2">{selectedProduct.atitle}</h3>
              <p className="text-gray-600 mb-4">{selectedProduct.adiscribtion}</p>
              {selectedProduct.variables?.map(v => (
                <div key={v.name} className="mb-4">
                  <h4 className="font-semibold mb-2">{v.aname}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map(o => {
                      const active = popupSelectedOptions[v.name] === o.value;
                      return (
                        <button
                          key={o.id}
                          onClick={() => setPopupSelectedOptions({ ...popupSelectedOptions, [v.name]: o.value })}
                          className="px-4 py-2 rounded-md border transition-colors"
                          style={active ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText } : { borderColor: '#d1d5db', backgroundColor: '#f3f4f6', color: theme.cardText }}
                        >
                          {o.avalue}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">المخزون: {getPopupInventory()} متبقي</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button onClick={() => setPopupQuantity(Math.max(1, popupQuantity - 1))} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={popupQuantity <= 1}><FaMinus /></button>
                    <span className="px-4 py-1 border-x border-gray-300">{popupQuantity}</span>
                    <button onClick={() => setPopupQuantity(Math.min(getPopupInventory(), popupQuantity + 1))} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={popupQuantity >= getPopupInventory() || getPopupInventory() === 0}><FaPlus /></button>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">السعر:</span>
                <span className="text-xl font-bold" style={{ color: theme.cardText }}>{currencyCountry(selectedProduct.price, user?.country || "Oman")}</span>
              </div>
              <button
                onClick={handleAddToCartFromPopup}
                className="w-full py-3 rounded-lg font-semibold transition shadow-lg"
                style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
              >
                إضافة إلى السلة
              </button>
            </div>
          </div>
        </div>
      )}
      {socialModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-2xl max-w-sm w-full mx-4 overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
              <span className="text-sm font-semibold text-gray-800 truncate">
                صفحة {socialModal.platform}
              </span>
              <button
                onClick={() => setSocialModal({ open: false, url: '', platform: '' })}
                className="p-1.5 rounded-full hover:bg-gray-100"
              >
                ✕
              </button>
            </div>
            <div className="w-full h-96 bg-gray-100">
              {socialModal.url && (
                <iframe
                  src={socialModal.url}
                  title={socialModal.platform}
                  className="w-full h-full border-0"
                />
              )}
            </div>
          </div>
        </div>
      )}
      {showReviewsPopup && selectedProduct && (
        <ReviewsPopup
          product={selectedProduct}
          onClose={() => { setShowReviewsPopup(false); setSelectedProduct(null); }}
          isArabic={true}
        />
      )}
    </>
  );
};
if (typeof document !== "undefined") {
  const STYLE_ID = "t3wn-no-x-scroll";
  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      html, body { width: 100%; max-width: 100%; margin: 0; overflow-x: clip; overflow-x: hidden; }
      #root { width: 100%; max-width: 100%; overflow-x: clip; overflow-x: hidden; }
      *, *::before, *::after { box-sizing: border-box; }
      img, video, canvas, svg, iframe { max-width: 100%; height: auto; }
      html, body { touch-action: pan-y; -webkit-overflow-scrolling: touch; }
      .t3wn-shift { animation: t3wnShift 220ms ease-out; }
      @keyframes t3wnShift {
        from { opacity: 0; transform: translateY(6px) scale(0.985); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
  }
}
const convertTo12Hour = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};
const apichat = {
  getChats: async () => {
    const response = await apiCall(`${API_BASE_URL}/t3wn/chat`);
    if (!response.ok) throw new Error('Failed to fetch chats');
    return await response.json();
  },
  postChatMessage: async (message) => {
    const response = await apiCall(`${API_BASE_URL}/t3wn/chat`, {
      method: 'POST',
      body: JSON.stringify(message)
    });
    if (!response.ok) throw new Error('Failed to send message');
    return await response.json();
  },
  getProfiles: async () => {
    const response = await fetch(`${API_OPEN_BASE_URL}/t3wn/profile`);
    return await response.json();
  },
  getStoreLogo: (storelogo) => storelogo ? `${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${storelogo}` : null
};
export const ChatStore = () => {
  const { storename } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const userPhone = getUserPhone();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fetchMessages = useCallback(async () => {
    if (!userPhone || !storeInfo) return;
    try {
      const allMessages = await apichat.getChats();
      const userPhoneNum = parseInt(userPhone);
      const storePhoneNum = parseInt(storeInfo.phone);
      const chatMessages = allMessages.filter(msg => (msg.fromphone === userPhoneNum && msg.tophone === storePhoneNum) || (msg.fromphone === storePhoneNum && msg.tophone === userPhoneNum));
      chatMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      const formattedMessages = chatMessages.map(msg => ({
        sender: msg.fromphone === userPhoneNum ? 'user' : 'store',
        msg: msg.msg,
        date: msg.date,
        hour: convertTo12Hour(msg.date)
      }));
      setMessages(formattedMessages);
    } catch (error) {}
  }, [userPhone, storeInfo]);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  useEffect(() => {
    if (!userPhone) { setLoading(false); return; }
    const fetchChatAndStoreInfo = async () => {
      try {
        const allProfiles = await apichat.getProfiles();
        const profile = allProfiles.find(p => p.store?.storename === storename);
        if (!profile) { setLoading(false); return; }
        setStoreInfo(profile);
        await fetchMessages();
      } catch (error) {} finally { setLoading(false); }
    };
    fetchChatAndStoreInfo();
  }, [storename, userPhone, fetchMessages]);
  useEffect(() => {
    if (!userPhone || !storeInfo || loading) return;
    const interval = setInterval(() => fetchMessages(), 2000);
    return () => clearInterval(interval);
  }, [userPhone, storeInfo, loading, fetchMessages]);
  const handleSendMessage = async () => {
    if (!userPhone) { navigate('/elogin'); return; }
    if (newMessage.trim() && storeInfo) {
      try {
        await apichat.postChatMessage({
          fromphone: parseInt(userPhone),
          tophone: parseInt(storeInfo.phone),
          msg: newMessage.trim()
        });
        setNewMessage('');
        await fetchMessages();
      } catch (error) {
        if (error.message === 'Unauthorized') navigate('/elogin');
      }
    }
  };
  const theme = {
    bg: storeInfo?.backgroundColor || '#f8fafc',
    btnBg: storeInfo?.buttons?.backgroundColor || '#2d3748',
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[100dvh]" style={{ backgroundColor: theme.bg }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" style={{ borderColor: theme.btnBg }}></div>
        <p className="text-gray-600 font-medium">Loading chat...</p>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-[100dvh] bg-gradient-to-br from-gray-50 via-gray-100 to-white justify-center z-50 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto">
      <div className="bg-gray-800 text-white px-4 md:px-6 lg:px-8 py-4 md:py-5 shadow-lg">
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FaArrowLeft size={20} /></button>
          <div className="flex-1 text-center ml-2">
            <h2 className="text-xl font-bold">{storeInfo?.store?.storename || 'Store'}</h2>
            <p className="text-gray-200 text-xs">Online</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-4 bg-gradient-to-b from-white/50 to-transparent">
        {messages.length > 0 ? (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {msg.sender === 'store' && <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">{storeInfo?.store?.storename?.charAt(0).toUpperCase() || 'S'}</div>}
                  <div className={`relative ${msg.sender === 'user' ? 'bg-gray-800 text-white rounded-2xl rounded-tr-none shadow-lg' : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-md border border-gray-200'} px-4 py-3`}>
                    <p className="text-sm leading-relaxed break-words">{msg.msg}</p>
                    <span className={`block text-xs mt-2 ${msg.sender === 'user' ? 'text-gray-300' : 'text-gray-500'}`}>{msg.hour}</span>
                    <div className={`absolute bottom-0 ${msg.sender === 'user' ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'} translate-y-1`}><div className={`${msg.sender === 'user' ? 'bg-gray-800' : 'bg-white border-l border-b border-gray-200'} w-3 h-3 transform rotate-45`}></div></div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.btnBg}33` }}>
              <svg className="w-10 h-10" style={{ color: theme.btnBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No messages yet</h3>
            <p className="text-gray-500 text-sm">Start the conversation</p>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 pr-12 bg-white border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm"
              style={{ borderColor: '#e5e7eb' }}
              onFocus={(e) => e.target.style.borderColor = theme.btnBg}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-full hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              style={{ backgroundColor: theme.btnBg }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export const AChatStore = () => {
  const { storename } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const userPhone = getUserPhone();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const fetchMessages = useCallback(async () => {
    if (!userPhone || !storeInfo) return;
    try {
      const allMessages = await apichat.getChats();
      const userPhoneNum = parseInt(userPhone);
      const storePhoneNum = parseInt(storeInfo.phone);
      const chatMessages = allMessages.filter(msg => (msg.fromphone === userPhoneNum && msg.tophone === storePhoneNum) || (msg.fromphone === storePhoneNum && msg.tophone === userPhoneNum));
      chatMessages.sort((a, b) => new Date(a.date) - new Date(b.date));
      const formattedMessages = chatMessages.map(msg => ({
        sender: msg.fromphone === userPhoneNum ? 'user' : 'store',
        msg: msg.msg,
        date: msg.date,
        hour: convertTo12Hour(msg.date)
      }));
      setMessages(formattedMessages);
    } catch (error) {}
  }, [userPhone, storeInfo]);
  useEffect(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  useEffect(() => {
    if (!userPhone) { setLoading(false); return; }
    const fetchChatAndStoreInfo = async () => {
      try {
        const allProfiles = await apichat.getProfiles();
        const profile = allProfiles.find(p => p.store?.storename === storename);
        if (!profile) { setLoading(false); return; }
        setStoreInfo(profile);
        await fetchMessages();
      } catch (error) {} finally { setLoading(false); }
    };
    fetchChatAndStoreInfo();
  }, [storename, userPhone, fetchMessages]);
  useEffect(() => {
    if (!userPhone || !storeInfo || loading) return;
    const interval = setInterval(() => fetchMessages(), 2000);
    return () => clearInterval(interval);
  }, [userPhone, storeInfo, loading, fetchMessages]);
  const handleSendMessage = async () => {
    if (!userPhone) { navigate('/alogin'); return; }
    if (newMessage.trim() && storeInfo) {
      try {
        await apichat.postChatMessage({
          fromphone: parseInt(userPhone),
          tophone: parseInt(storeInfo.phone),
          msg: newMessage.trim()
        });
        setNewMessage('');
        await fetchMessages();
      } catch (error) {
        if (error.message === 'Unauthorized') navigate('/alogin');
      }
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[100dvh]" style={{ backgroundColor: theme.bg }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-transparent mb-4" style={{ borderColor: theme.btnBg }}></div>
        <p className="text-gray-600 font-medium">جاري تحميل المحادثة...</p>
      </div>
    </div>
  );
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
  };

  return (
    <div className="flex flex-col h-[100dvh] justify-center z-50 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto" style={{ backgroundColor: theme.bg }}>
      <div className="text-white px-4 md:px-6 lg:px-8 py-4 md:py-5 shadow-lg" style={{ backgroundColor: theme.btnBg }}>
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FaArrowLeft size={20} /></button>
          <div className="flex-1 text-center ml-2">
            <h2 className="text-xl font-bold">{storeInfo?.store?.storename || 'المتجر'}</h2>
            <p className="text-xs opacity-80">متصل</p>
          </div>
          <div className="w-10"></div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 md:py-8 space-y-4 bg-gradient-to-b from-white/50 to-transparent">
        {messages.length > 0 ? (
          <>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex items-end space-x-2 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  {msg.sender === 'store' && <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: theme.btnBg }}>{storeInfo?.store?.storename?.charAt(0).toUpperCase() || 'م'}</div>}
                  <div className={`relative ${msg.sender === 'user' ? 'text-white rounded-2xl rounded-tr-none shadow-lg' : 'bg-white text-gray-800 rounded-2xl rounded-tl-none shadow-md border border-gray-200'} px-4 py-3`} style={msg.sender === 'user' ? { backgroundColor: theme.btnBg } : {}}>
                    <p className="text-sm leading-relaxed break-words">{msg.msg}</p>
                    <span className={`block text-xs mt-2 ${msg.sender === 'user' ? 'opacity-70' : 'text-gray-500'}`}>{msg.hour}</span>
                    <div className={`absolute bottom-0 ${msg.sender === 'user' ? 'right-0 translate-x-1' : 'left-0 -translate-x-1'} translate-y-1`}><div className={`w-3 h-3 transform rotate-45`} style={msg.sender === 'user' ? { backgroundColor: theme.btnBg } : { backgroundColor: '#ffffff', borderLeft: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}></div></div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: `${theme.btnBg}33` }}>
              <svg className="w-10 h-10" style={{ color: theme.btnBg }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">لا توجد رسائل بعد</h3>
            <p className="text-gray-500 text-sm">ابدأ المحادثة</p>
          </div>
        )}
      </div>
      <div className="border-t border-gray-200 bg-white/80 backdrop-blur-sm p-4">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="اكتب رسالتك..."
              className="w-full px-4 py-3 pr-12 bg-white border rounded-full focus:outline-none focus:ring-2 focus:border-transparent transition-all shadow-sm"
              style={{ borderColor: '#e5e7eb' }}
              onFocus={(e) => e.target.style.borderColor = theme.btnBg}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white rounded-full hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
              style={{ backgroundColor: theme.btnBg }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
const currencyCountry = (price, country) => {
  const rates = {Oman:1,Kuwait:1,Bahrain:1,Qatar:1,UAE:1,Saudi:1};
  if (rates[country]) return (price*rates[country]).toFixed(2)+" "+countryRates[country].symbol;
  return price.toFixed(2)+" USD";
};
const calculateDiscountedPrice = (price, discount) => (price*(1-discount/100)).toFixed(2);
if (typeof document !== 'undefined' && !document.getElementById('scrollbar-hide-style')) {
  const s = document.createElement('style'); s.id = 'scrollbar-hide-style'; s.textContent = css; document.head.appendChild(s);
}
const formatDate = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};
const formatTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};
const Popupshow = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10"><FaTimes /></button>
      <div className="flex-1 overflow-y-auto p-6">{children}</div>
    </div>
  </div>
);
const apicartService = {
  getUserByPhone: async (phone) => { const r = await apiCall(`${API_BASE_URL}/t3wn/users/${phone}`); if (!r.ok) throw new Error('User not found'); return r.json(); },
  getCartByPhone: async (phone) => { const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`); if (!r.ok) return []; return r.json(); },
  createCartItem: async (phone, data) => { const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`, { method: 'POST', body: JSON.stringify(data) }); return r.json(); },
  updateCartItem: async (phone, id, data) => { const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}/${id}`, { method: 'PUT', body: JSON.stringify(data) }); return r.json(); },
  deleteCartItem: async (phone, id) => { const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}/${id}`, { method: 'DELETE' }); return r.ok; },
  getAllGroups: async () => { const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/group`); if (!r.ok) return []; return r.json(); },
  getGroupsByPhone: async (phone) => { const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/group`); if (!r.ok) return []; const all = await r.json(); return all.filter(g => g.members?.some(m => String(m.phone || m.userphone || '') === String(phone))); },
  createGroup: async (phone, groupData) => { const r = await apiCall(`${API_BASE_URL}/t3wn/group/${phone}`, { method: 'POST', body: JSON.stringify(groupData) }); if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.json(); },
  joinGroup: async (phone, groupsku, memberData = {}) => { const r = await apiCall(`${API_BASE_URL}/t3wn/group/${phone}/${groupsku}`, { method: 'POST', body: JSON.stringify(memberData) }); if (!r.ok) throw new Error(`${r.status} ${await r.text()}`); return r.ok; },
  updateGroupMember: async (phone, groupsku, memberData) => { const r = await apiCall(`${API_BASE_URL}/t3wn/group/${phone}/${groupsku}`, { method: 'PUT', body: JSON.stringify(memberData) }); return r.ok; },
  deleteGroupMember: async (phone, groupsku) => { const r = await apiCall(`${API_BASE_URL}/t3wn/group/${phone}/${groupsku}`, { method: 'DELETE' }); return r.ok; },
  getOrdersByPhone: async (phone) => { try { const r = await apiCall(`${API_BASE_URL}/t3wn/order/${phone}`); if (!r.ok) return []; return r.json(); } catch { return []; } },
  createOrder: async (phone, orderData) => { const r = await apiCall(`${API_BASE_URL}/t3wn/order/${phone}`, { method: 'POST', body: JSON.stringify(orderData) }); if (!r.ok) throw new Error(`Failed to create order: ${r.statusText}`); return r.json(); },
  confirmDelivery: async (phone, id, ratingData = null) => { const r = await apiCall(`${API_BASE_URL}/t3wn/order/deliveryconfirm/${phone}/${id}`, { method: 'POST', body: JSON.stringify(ratingData || {}) }); if (!r.ok) throw new Error(`Failed to confirm delivery: ${r.statusText}`); return r.json(); },
  getProductBySku: async (sku) => { const r = await fetch(`${API_BASE_URL}/t3wn/products/${sku}`); if (!r.ok) throw new Error('Product not found'); return r.json(); },
  getProductImage: (sku, imageName) => `${API_BASE_URL}/t3wn/products/${sku}/${imageName}`,
  rateProduct: async (sku, score, phone, comment) => { const r = await apiCall(`${API_BASE_URL}/t3wn/products/${sku}/rate/${score}/${phone}/${encodeURIComponent(comment)}`, { method: 'POST' }); return r.ok; }
};
const buildSelectedVarMap = (vars) => {
  const out = {}; (vars || []).forEach((v) => {
    const name = (v?.name ?? v?.variableName ?? v?.key ?? "").toString().trim(); const valRaw = v?.value ?? v?.valueqty ?? v?.option ?? v?.optionValue; const val = valRaw === undefined || valRaw === null ? "" : String(valRaw).trim();
    if (name && val) out[name] = val;
  }); return out;
};
const computeMaxQtyForSelection = (product, selectedMap) => {
  if (!product) return 0; const qtyArr = product.quantity || []; if (!Array.isArray(qtyArr) || qtyArr.length === 0) return 0;
  const productVars = product.variables || []; const selectedKeys = selectedMap ? Object.keys(selectedMap) : [];
  if (!Array.isArray(productVars) || productVars.length === 0 || selectedKeys.length === 0) {
    return qtyArr.reduce((s, q) => s + (Number(q?.qty) || 0), 0);
  }
  const match = qtyArr.find((q) => {
    const qvars = q?.variables || []; return selectedKeys.every((name) => {
      const val = String(selectedMap[name]); const def = productVars.find((vd) => vd?.name === name); if (!def) return false;
      const qv = Array.isArray(qvars) ? qvars.find((v) => String(v?.id) === String(def?.id)) : null;
      if (qv && qv.valueqty !== undefined && qv.valueqty !== null) return String(qv.valueqty) === val;
      const idx = productVars.findIndex((vd) => vd?.name === name);
      if (idx >= 0 && Array.isArray(qvars) && idx < qvars.length) { const byPos = qvars[idx]; return String(byPos?.valueqty ?? "") === val; }
      return false;
    });
  }); return match ? Number(match?.qty) || 0 : 0;
};
const findQuantityId = (product, selectedMap) => {
  if (!product) return null; const qtyArr = product.quantity || []; if (!Array.isArray(qtyArr) || qtyArr.length === 0) return null;
  const productVars = product.variables || []; const selectedKeys = selectedMap ? Object.keys(selectedMap) : [];
  if (!Array.isArray(productVars) || productVars.length === 0 || selectedKeys.length === 0) {
    return qtyArr[0]?.id || null;
  }
  const match = qtyArr.find((q) => {
    const qvars = q?.variables || []; return selectedKeys.every((name) => {
      const val = String(selectedMap[name]); const def = productVars.find((vd) => vd?.name === name); if (!def) return false;
      const qv = Array.isArray(qvars) ? qvars.find((v) => String(v?.id) === String(def?.id)) : null;
      if (qv && qv.valueqty !== undefined && qv.valueqty !== null) return String(qv.valueqty) === val;
      const idx = productVars.findIndex((vd) => vd?.name === name);
      if (idx >= 0 && Array.isArray(qvars) && idx < qvars.length) { const byPos = qvars[idx]; return String(byPos?.valueqty ?? "") === val; }
      return false;
    });
  }); return match?.id || null;
};
const PaymentForm = ({ total, onComplete, selectedItems, userAuth, deliveryType = 'Office', deliverydetails = [], products = {}, onRefreshDeliveryDetails }) => {
  const PAYMENT_GATEWAY_DISABLED = false; const userCurrency = countryRates[userAuth?.country]?.symbol || 'USD';
  const [form, setForm] = useState({ card: '', expiry: '', cvv: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [done, setDone] = useState(false); const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const userPhone = getUserPhone(); const displayAmount = currencyCountry(total, userAuth?.country || 'UAE');
  const theme = {
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  const validateExpiryDate = (expiry) => {
    if (!expiry || expiry.length < 4) return false;
    const cleanExpiry = expiry.replace(/\D/g, ''); if (cleanExpiry.length !== 4) return false;
    const month = cleanExpiry.substring(0, 2); const year = cleanExpiry.substring(2, 4);
    const monthNum = parseInt(month, 10); const yearNum = parseInt(year, 10); if (monthNum < 1 || monthNum > 12) return false;
    const currentDate = new Date(); const currentYear = currentDate.getFullYear() % 100; const fullYear = 2000 + yearNum;
    const expiryDate = new Date(fullYear, monthNum - 1); const maxDate = new Date(currentDate.getFullYear() + 10, currentDate.getMonth()); const minDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
    if (expiryDate < minDate) return false; if (expiryDate > maxDate) return false; return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.card || form.card.replace(/\s/g, '').length < 13) { setError('Please enter a valid card number'); return; }
    const cleanExpiry = form.expiry.replace(/\D/g, ''); if (!validateExpiryDate(cleanExpiry)) { setError('Please enter a valid expiry date (must be in the future and within 10 years)'); return; }
    if (!form.cvv || form.cvv.length !== 3) { setError('Please enter a valid CVV (3 digits)'); return; }
    if (!selectedDeliveryAddress) { setError('Please select a delivery address'); return; }
    setLoading(true); setError(null);
    try {
      const selectedDetail = deliverydetails.find(d => d.id === selectedDeliveryAddress); let customerlocation = {};
      if (selectedDetail) {
        customerlocation = { customerphone: selectedDetail.deliveryphone, customername: selectedDetail.deliveryname, customerlocation: selectedDetail.deliverylocation };
      } else { customerlocation = { customerphone: userAuth.phone, customername: "", customerlocation: "" }; }
      const orderData = {
        orders: selectedItems.map(item => {
          const product = products[item.productsku]; const shopphone = product?.phone || item.shopphone || userAuth.phone;
          const orderItem = { id: item.id, shopphone: shopphone, productsku: item.productsku, price: item.price, qty: item.qty, discount: item.discount || 0, variables: (item.variables || []).map(v => ({ id: v.id, typename: v.name, atypename: v.aname || v.name, name: v.value, aname: v.avalue || v.value })) };
          if (item.affliate) orderItem.affliate = item.affliate; return orderItem;
        }),
        deliveryoption: "Dalilee", deliverytype: deliveryType, storepaid: false, storewithdraw: false, customerlocation: customerlocation,
        payment: { cardnumber: form.card.replace(/\s/g, ''), expirydate: form.expiry, cvv: form.cvv, value: total, currency: userCurrency }
      };
      await apicartService.createOrder(userAuth.phone, orderData);
      for (const item of selectedItems) {
        const product = products[item.productsku];
        if (product) {
          const selectedMap = buildSelectedVarMap(item.variables || []);
          const quantityId = findQuantityId(product, selectedMap);
          if (quantityId && item.qty) {
            try {
              await apiCall(`${API_BASE_URL}/t3wn/products/${item.productsku}/quantity/${quantityId}/qty/${item.qty}`, { method: 'DELETE' });
            } catch (e) {
              console.error('Failed to reduce product quantity:', e);
            }
          }
        }
      }
      setDone(true); setTimeout(() => onComplete(true), 1400);
    } catch (err) { setError('Payment failed. Please try again.'); } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">Payment Details</h2>
      </div>
      {done ? (
        <div className="text-center py-6">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Payment Successful!</h3>
          <p className="text-gray-600">Your order has been placed.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            {deliverydetails && deliverydetails.length > 0 ? (
              <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
                {deliverydetails.map((detail) => (
                  <div
                    key={detail.id}
                    onClick={() => setSelectedDeliveryAddress(detail.id)}
                    className="border-2 rounded-lg p-3 cursor-pointer transition-all"
                    style={selectedDeliveryAddress === detail.id ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22` } : { borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{detail.deliveryname}</div>
                        <div className="text-xs text-gray-600">Phone: {detail.deliveryphone}</div>
                        <div className="text-xs text-gray-500 mt-1">Location selected</div>
                      </div>
                      <div
                        className="ml-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={selectedDeliveryAddress === detail.id ? { borderColor: theme.btnBg, backgroundColor: theme.btnBg } : { borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                      >
                        {selectedDeliveryAddress === detail.id && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ( <p className="text-gray-500 text-sm mb-2">No delivery addresses</p> )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
            <input
              type="text"
              value={form.card.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)}
              onChange={(e) => setForm({ ...form, card: e.target.value.replace(/\s/g, '') })}
              placeholder="4242 4242 4242 4242"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              onFocus={(e) => e.target.style.borderColor = theme.btnBg}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
              <input
                type="text"
                value={form.expiry.replace(/[^0-9]/g, '').replace(/^(\d{2})(\d{0,2})/, (match, p1, p2) => p2 ? `${p1}/${p2}` : p1).slice(0, 5)}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '').slice(0, 4); setForm({ ...form, expiry: raw });
                  if (error && error.includes('expiry')) setError(null);
                }}
                onBlur={(e) => {
                  const expiry = form.expiry.replace(/\D/g, ''); if (expiry.length === 4) {
                    if (!validateExpiryDate(expiry)) setError('Expiry date must be in the future and within 10 years');
                    else if (error && error.includes('expiry')) setError(null);
                  }
                }}
                placeholder="12/25"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                onFocus={(e) => e.target.style.borderColor = theme.btnBg}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                value={form.cvv}
                maxLength={3}
                onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                placeholder="123"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                onFocus={(e) => e.target.style.borderColor = theme.btnBg}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
            <input readOnly value={displayAmount} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50" />
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-2">
            {PAYMENT_GATEWAY_DISABLED && ( <div className="mb-3 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-sm text-yellow-800 text-center">⚠️ Payment gateway is still under process</div> )}
            <button
              type="submit"
              disabled={PAYMENT_GATEWAY_DISABLED || loading || !form.card || !form.expiry || !form.cvv || !selectedDeliveryAddress}
              className="w-full py-3 rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            {error && <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          </div>
        </form>
      )}
    </div>
  );
};
const OrderItem = ({ order, onStatusChange, onRate, userCountry, userAuth, isHistory = false, theme = { btnBg: '#2d3748', btnText: '#ffffff', btnRadius: '9999px', btnShadow: '0 2px 6px rgba(0,0,0,0.12)', cardText: '#111827' } }) => {
  const isDelivered = order.status?.deliverd || order.deliverconfirmed; const isWaiting = order.status?.waiting;
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [showRate, setShowRate] = useState(false);
  const submitRating = async () => {
    if (rating <= 0) return;
    const ratingData = { rating, comment, productsku: order.productsku };
    try {
      await apicartService.confirmDelivery(userAuth?.phone, order.id, ratingData);
      onStatusChange(order.id, 'delivered'); onRate(order.productsku, rating, comment); setShowRate(false); setRating(0); setComment('');
    } catch { alert('Failed to confirm delivery. Please try again.'); }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">Order #{order.ordersku}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.date)} • {formatTime(order.date)}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={isDelivered ? { backgroundColor: '#d1fae5', color: '#065f46' } : isWaiting ? { backgroundColor: `${theme.btnBg}22`, color: theme.cardText } : { backgroundColor: '#dbeafe', color: '#1e40af' }}
        >
          {isDelivered ? 'Delivered' : isWaiting ? 'Pending' : 'Processing'}
        </span>
      </div>
      <div className="flex items-start">
        {order.productDetails?.generalimages?.[0]?.img ? (
          <img src={apicartService.getProductImage(order.productsku, order.productDetails.generalimages[0].img)} alt={order.productDetails?.title || 'Product'} className="w-16 h-16 object-cover rounded-lg mr-4" onError={(e) => { e.target.style.display='none';e.target.nextElementSibling.style.display='flex'}} />
        ) : null}
        <div className={`w-16 h-16 ${order.productDetails?.generalimages?.[0]?.img?'hidden':'flex'} items-center justify-center bg-gray-200 rounded-lg mr-4`}><span className="text-gray-400 text-xs">No Image</span></div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{order.productDetails?.title}</h4>
          <div className="text-sm text-gray-600 mt-1">
            {order.variables?.map((v, i) => <span key={i} className="mr-2">{v.name}: {v.value}</span>)}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700">
              {order.qty} × {currencyCountry(order.price, userCountry || 'UAE')}
              {!!order.discount && <span className="ml-1 text-purple-600">({order.discount}% off)</span>}
            </span>
            <span className="font-semibold">{currencyCountry(order.price * order.qty * (1 - (order.discount || 0) / 100), userCountry || 'UAE')}</span>
          </div>
        </div>
      </div>
      {order.status && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between mb-2 text-sm">
            {['waiting', 'process', 'shiped', 'deliverd'].map(s => (
              <span key={s} className={order.status[s] ? 'font-semibold' : 'text-gray-400'} style={order.status[s] ? { color: theme.cardText } : {}}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="h-2 rounded-full" style={{ backgroundColor: theme.btnBg, width: order.status.deliverd ? '100%' : order.status.shiped ? '75%' : order.status.process ? '50%' : '25%' }} />
          </div>
          {isWaiting && !isHistory && (
            <div className="mt-4">
              {!showRate ? (
                <button
                  onClick={() => setShowRate(true)}
                  className="w-full py-2 rounded-lg transition shadow-md"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                >
                  Rate & Confirm Delivery
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm mb-2 font-medium">Rate this product to confirm delivery:</p>
                  <div className="flex space-x-1 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)} className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition`}>★</button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitRating}
                      disabled={rating === 0}
                      className="flex-1 py-2 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      {rating === 0 ? 'Select a rating' : 'Confirm Delivery'}
                    </button>
                    <button onClick={() => { setShowRate(false); setRating(0); setComment(''); }} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export const Ecart = () => {
  const [cartItems, setCartItems] = useState([]); const [groups, setGroups] = useState([]); const [orders, setOrders] = useState([]); const [history, setHistory] = useState([]); const [selectedTab, setSelectedTab] = useState('cart'); const [userAuth, setUserAuth] = useState(null); const [showGroupPopup, setShowGroupPopup] = useState(false); const [groupName, setGroupName] = useState(''); const [groupLimit, setGroupLimit] = useState(3); const [selectedTime, setSelectedTime] = useState({ hours: 18, minites: 0 }); const [showPayment, setShowPayment] = useState(false); const [currentItem, setCurrentItem] = useState(null); const [selectedItems, setSelectedItems] = useState([]); const [products, setProducts] = useState({}); const [countdownTimes, setCountdownTimes] = useState({}); const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false); const [availableGroups, setAvailableGroups] = useState([]); const [deliveryType, setDeliveryType] = useState('Office'); const [deliverydetails, setDeliverydetails] = useState([]); const [storeProfile, setStoreProfile] = useState(null); const userPhone = getUserPhone(); const navigate = useNavigate(); const location = useLocation(); const hasAutoSelectedRef = useRef(false); const lastCartStateRef = useRef('');
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    cardRadius: storeProfile?.cards?.borderRadius || '0.75rem',
    cardShadow: storeProfile?.cards?.shadow || '0 2px 6px rgba(0,0,0,0.08)',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  const getCartItemSku = (item) => (item?.productsku || item?.productSku || item?.sku || null);
  const getKnownMaxQtySync = (item) => {
    const sku = getCartItemSku(item); if (!sku) return null; const p = products?.[String(sku).trim()]; if (!p) return null;
    const selectedMap = buildSelectedVarMap(item?.variables || []); return computeMaxQtyForSelection(p, selectedMap);
  };
  const loadProductIfMissing = async (sku) => {
    const key = String(sku || "").trim(); if (!key) return null; if (products?.[key]) return products[key];
    const p = await apicartService.getProductBySku(key).catch(() => null); if (p) setProducts((prev) => ({ ...(prev || {}), [key]: p })); return p;
  };
  const handleIncreaseCartQty = async (item) => {
    if (!userPhone) { navigate('/elogin'); return; } if (!item) return; const sku = getCartItemSku(item); if (!sku) return;
    const current = Math.max(1, Number(item?.qty) || 1); const product = await loadProductIfMissing(sku); if (!product) {
      const nextQty = current + 1; const updated = { ...item, qty: nextQty };
      try { await apicartService.updateCartItem(userPhone, item.id, updated); setCartItems((prev) => (prev || []).map((ci) => (ci.id === item.id ? updated : ci))); setSelectedItems((prev) => (prev || []).map((s) => (s.id === item.id ? { ...s, qty: nextQty } : s))); } catch (e) { alert('Failed to update quantity'); }
      return;
    }
    const selectedMap = buildSelectedVarMap(item?.variables || []); const max = computeMaxQtyForSelection(product, selectedMap); if (max <= 0 || current >= max) { alert('No more stock for this option'); return; }
    const nextQty = Math.min(max, current + 1); const updated = { ...item, qty: nextQty };
    try { await apicartService.updateCartItem(userPhone, item.id, updated); setCartItems((prev) => (prev || []).map((ci) => (ci.id === item.id ? updated : ci))); setSelectedItems((prev) => (prev || []).map((s) => (s.id === item.id ? { ...s, qty: nextQty } : s))); } catch (e) { alert('Failed to update quantity'); }
  };
  const loadCartData = useCallback(async () => {
    if (!userPhone) return;
    try {
      const user = await apicartService.getUserByPhone(userPhone); setUserAuth({ phone: userPhone, country: user.country }); setDeliverydetails(user.deliverydetails || []);
      const [cartData, groupData, orderData] = await Promise.all([ apicartService.getCartByPhone(userPhone), apicartService.getGroupsByPhone(userPhone), apicartService.getOrdersByPhone(userPhone) ]);
      setCartItems(cartData); setGroups(groupData); const act = [], hist = [];
      if (Array.isArray(orderData)) { orderData.forEach(o => (o.orders || []).forEach(it => (it.deliverconfirmed ? hist : act).push({ ...o, orders: [it] }))); }
      setOrders(act); setHistory(hist); const skuSet = new Set(); cartData.forEach(i => skuSet.add(i.productsku)); groupData.forEach(g => skuSet.add(g.productsku)); orderData.forEach(o => (o.orders || []).forEach(it => skuSet.add(it.productsku)));
      const results = await Promise.all(Array.from(skuSet).map(async sku => { try { return { sku, product: await apicartService.getProductBySku(sku) }; } catch { return { sku, product: null }; } }));
      const map = {}; results.forEach(({ sku, product }) => { if (product) map[sku] = product; }); setProducts(map);
    } catch (e) {}
  }, [userPhone]);
  useEffect(() => { if (!userPhone) { navigate('/elogin'); return; } loadCartData(); }, [userPhone, navigate, loadCartData]);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  useEffect(() => { if (!userPhone) return; const interval = setInterval(() => loadCartData(), 3000); return () => clearInterval(interval); }, [userPhone, loadCartData]);
  useEffect(() => {
    if (!groups.length) return; const t = setInterval(() => {
      const next = {}; groups.forEach(g => {
        if (!g.date || g.hour === undefined) return; const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now(); const key = g.groupsku || g.id; next[key] = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : "Expired";
      }); setCountdownTimes(next);
    }, 1000); return () => clearInterval(t);
  }, [groups]);
  useEffect(() => {
    const isCartRoute = location.pathname.includes('/cart'); if (!isCartRoute || !userPhone) { hasAutoSelectedRef.current = false; lastCartStateRef.current = ''; return; }
    if (cartItems.length === 0 && groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); return isMember && g.condition && !isGroupExpired(g); }).length === 0) return;
    const cartStateHash = `${cartItems.length}-${groups.length}-${cartItems.map(i => i.id).join(',')}-${groups.map(g => g.groupsku || g.id).join(',')}`; if (lastCartStateRef.current !== cartStateHash) { hasAutoSelectedRef.current = false; lastCartStateRef.current = cartStateHash; }
    if (hasAutoSelectedRef.current) return; const allSelected = [];
    groups.forEach(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!isMember) return; if (!g.condition) return; if (isGroupExpired(g)) return; if (cartItems.some(i => i.productsku === g.productsku)) return;
      const member = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); if (member) { const disc = Math.min(50, g.userlimit * 2); allSelected.push({ ...member, productsku: g.productsku, groupsku: g.groupsku, discount: disc, isGroup: true }); }
    });
    cartItems.forEach(item => { const g = getGroupDetails(item); const showGroupInfo = g && g.condition && !isGroupExpired(g); const discount = showGroupInfo ? getGroupDiscount(item) : 0; allSelected.push({ ...item, discount }); });
    if (allSelected.length > 0) { setSelectedItems(allSelected); hasAutoSelectedRef.current = true; }
  }, [location.pathname, cartItems, groups, userPhone, products]);
  const isGroupExpired = (g) => {
    if (!g?.date || g.hour === undefined) return false; const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0); return Date.now() > end.getTime();
  };
  const handleQuantityChange = async (item, delta) => {
    if (!userPhone) { navigate('/elogin'); return; } if (delta > 0) { await handleIncreaseCartQty(item); return; }
    const newQty = (item.qty || 0) + delta; if (newQty <= 0) {
      await apicartService.deleteCartItem(userPhone, item.id); setCartItems(prev => prev.filter(i => i.id !== item.id)); setSelectedItems(prev => prev.filter(s => s.id !== item.id));
    } else { const updated = { ...item, qty: newQty }; await apicartService.updateCartItem(userPhone, item.id, updated); setCartItems(prev => prev.map(i => (i.id === item.id ? updated : i))); setSelectedItems(prev => prev.map(s => (s.id === item.id ? { ...s, qty: newQty } : s))); }
  };
  const handleRemoveItem = async (item) => {
    if (!userPhone) { navigate('/elogin'); return; } await apicartService.deleteCartItem(userPhone, item.id); setCartItems(prev => prev.filter(i => i.id !== item.id)); setSelectedItems(prev => prev.filter(s => s.id !== item.id));
  };
  const handleGroupQuantityChange = async (groupsku, delta) => {
    if (!userPhone) { navigate('/elogin'); return; } const g = groups.find(x => x.groupsku === groupsku); if (!g) return; const me = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!me) return;
    const newQty = (me.qty || 0) + delta; if (newQty <= 0) return handleRemoveGroupMember(groupsku); const payload = { price: me.price, qty: newQty, variables: me.variables || [] };
    await apicartService.updateGroupMember(userPhone, groupsku, payload); setGroups(await apicartService.getGroupsByPhone(userPhone)); setSelectedItems(prev => prev.map(s => (s.groupsku === groupsku ? { ...s, qty: newQty } : s)));
  };
  const handleRemoveGroupMember = async (groupsku) => {
    if (!userPhone) { navigate('/elogin'); return; } await apicartService.deleteGroupMember(userPhone, groupsku); setGroups(await apicartService.getGroupsByPhone(userPhone)); setSelectedItems(prev => prev.filter(s => s.groupsku !== groupsku));
  };
  const handleCreateGroup = async () => {
    if (!userPhone) { navigate('/elogin'); return; } if (!groupName.trim()) return alert('Please enter a group name'); if (groupLimit < 2 || groupLimit > 25) return alert('Group limit must be between 2 and 25'); if (!currentItem?.productsku || !currentItem?.price || !currentItem?.qty) return alert('Missing product info');
    const payload = { productsku: currentItem.productsku, groupname: groupName, userlimit: groupLimit, hour: selectedTime.hours || 0, minite: selectedTime.minites || 0, members: [{ price: currentItem.price, qty: currentItem.qty, variables: (currentItem.variables || []).map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) }] };
    try {
      await apicartService.createGroup(userPhone, payload); await apicartService.deleteCartItem(userPhone, currentItem.id).catch(() => {}); setCartItems(await apicartService.getCartByPhone(userPhone)); setGroups(await apicartService.getGroupsByPhone(userPhone)); setShowGroupPopup(false); setGroupName(''); setGroupLimit(3); setSelectedTime({ hours: 18, minites: 0 }); alert('Group created successfully!');
    } catch (e) { alert(`Failed to create group: ${e.message || 'Unknown error'}`); }
  };
  const handleJoinGroup = async (groupsku) => {
    if (!userPhone) { navigate('/elogin'); return; } if (!currentItem?.price || !currentItem?.qty) return alert('Missing product info');
    const memberData = { price: currentItem.price, qty: currentItem.qty, variables: (currentItem.variables || []).map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) };
    try { await apicartService.joinGroup(userPhone, groupsku, memberData); await apicartService.deleteCartItem(userPhone, currentItem.id).catch(() => {}); setCartItems(await apicartService.getCartByPhone(userPhone)); setGroups(await apicartService.getGroupsByPhone(userPhone)); setShowJoinGroupPopup(false); setCurrentItem(null); alert('Successfully joined the group!'); } catch (e) { alert(`Failed to join group: ${e.message || 'Unknown error'}`); }
  };
  const loadAvailableGroups = async (sku) => {
    try { const all = await apicartService.getAllGroups(); setAvailableGroups(all.filter(g => g.productsku === sku && g.condition === false && g.userlimit > (g.members?.length || 0))); } catch (e) {}
  };
  const getVATRate = (country) => ({ Oman:5, Kuwait:0, Bahrain:10, Qatar:0, UAE:5, Saudi:15 }[country] || 5);
  const getDeliveryCost = (productCountry, deliveryType) => {
    const costs = { Oman: { Office: 1, Home: 2 }, Kuwait: { Office: 1, Home: 2 }, Bahrain: { Office: 1, Home: 2 }, Qatar: { Office: 10, Home: 20 }, UAE: { Office: 10, Home: 20 }, Saudi: { Office: 10, Home: 20 } };
    const countryCosts = costs[productCountry] || costs.UAE; return deliveryType === 'Office' ? countryCosts.Office : countryCosts.Home;
  };
  const calculateDeliveryPrice = (items, deliveryType = 'Office') => {
    if (!deliveryType || !items || items.length === 0) return 0; const firstItem = items[0]; const p = products[firstItem?.productsku]; const country = p?.country || userAuth?.country || 'UAE'; return getDeliveryCost(country, deliveryType);
  };
  const calculateSubtotal = () => selectedItems.reduce((t, it) => t + Number(calculateDiscountedPrice(it.price || 0, it.discount || 0)) * it.qty, 0);
  const calculateDiscount = () => selectedItems.reduce((t, it) => t + (it.price || 0) * (it.discount || 0) / 100 * it.qty, 0);
  const calculateVAT = () => {
    const vatRate = getVATRate(userAuth?.country || 'UAE');
    const base = calculateSubtotal() + calculateDeliveryPrice(selectedItems, deliveryType);
    if (vatRate === 5) {
      return base * 0.09 * 0.05;
    }
    return base * (vatRate / 100);
  };
  const calculateTotal = () => calculateSubtotal() + calculateDeliveryPrice(selectedItems, deliveryType) + calculateVAT();
  const getGroupDetails = (item) => groups.find(g => g.productsku === item.productsku);
  const getGroupDiscount = (item) => { const g = groups.find(x => x.productsku === item.productsku && x.condition); return g ? Math.min(50, g.userlimit * 2) : 0; };
  const handleCompletePayment = async () => {
    if (!userPhone) { navigate('/elogin'); return; }
    try {
      for (const it of selectedItems) { if (it.isGroup) await apicartService.deleteGroupMember(userPhone, it.groupsku); else await apicartService.deleteCartItem(userPhone, it.id); }
      const [cartData, groupData, orderData] = await Promise.all([ apicartService.getCartByPhone(userPhone), apicartService.getGroupsByPhone(userPhone), apicartService.getOrdersByPhone(userPhone) ]);
      setCartItems(cartData); setGroups(groupData); const act = [], hist = []; if (Array.isArray(orderData)) { orderData.forEach(o => (o.orders || []).forEach(it => (it.deliverconfirmed ? hist : act).push({ ...o, orders: [it] }))); }
      setOrders(act); setHistory(hist); setSelectedItems([]); setShowPayment(false); setSelectedTab('order');
    } catch { alert('Failed to complete payment cleanup.'); }
  };
  const handleStatusChange = async (orderId, status) => {
    if (!userPhone) { navigate('/elogin'); return; } if (status !== 'delivered') return;
    try {
      const payload = { deliverconfirmed: true, status: { process: true, shiped: true, waiting: false, deliverd: true } }; await apicartService.confirmDelivery(userPhone, orderId, payload);
      const move = orders.find(o => o.orders[0].id === orderId); if (move) {
        const updated = { ...move, orders: [{ ...move.orders[0], deliverconfirmed: true, status: { ...move.orders[0].status, deliverd: true } }] }; setHistory([updated, ...history]); setOrders(orders.filter(o => o.orders[0].id !== orderId));
      }
    } catch { alert('Failed to update order status'); }
  };
  const handleRateProduct = async (sku, rating, comment = "") => {
    try { await apicartService.rateProduct(sku, rating, userPhone, comment); setHistory(prev => prev.map(h => ({ ...h, orders: h.orders.map(it => (it.productsku === sku ? { ...it, rating, comment } : it)) }))); } catch {}
  };
  const shareGroupUrl = (sku) => { const url = `${window.location.origin}/en/product/${sku}`; navigator.clipboard.writeText(url); alert('Group link copied to clipboard!'); };
  const readyLabel = (ready) => ( <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ready ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ready ? 'Ready!' : 'Waiting...'}</div> );

  return (
    <div className="flex flex-col h-[100dvh] justify-center z-50 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto" style={{ backgroundColor: theme.bg }}>
      <div className="text-white px-4 md:px-6 lg:px-8 py-4 md:py-5 shadow-lg" style={{ backgroundColor: theme.btnBg }}>
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FaArrowLeft size={20} /></button>
          <div className="flex-1 text-center ml-2"><h1 className="text-2xl font-bold">Shopping Cart</h1>{userAuth && <p className="text-xs opacity-80">{userAuth.country}</p>}</div>
          <div className="w-10"></div>
        </div>
        <div className="flex justify-around mt-3 gap-1">
          {['cart', 'order', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className="py-1.5 px-3 rounded-lg flex items-center text-xs transition-all"
              style={selectedTab === tab ? { backgroundColor: theme.cardBg, color: theme.cardText, fontWeight: '600' } : { color: 'white', opacity: 0.8 }}
            >
              {tab === 'cart' && <FaShoppingCart className="mr-1.5 text-xs" />}{tab === 'order' && <FaBox className="mr-1.5 text-xs" />}{tab === 'history' && <FaHistory className="mr-1.5 text-xs" />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {selectedTab === 'cart' && !showPayment && (
            (cartItems.length === 0 && groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); return isMember && g.condition && !isGroupExpired(g); }).length === 0) ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-gray-300 text-4xl mx-auto" />
                <h3 className="text-base font-semibold mt-3">Your cart is empty</h3>
                <p className="text-gray-500 text-sm mt-1.5">Add some items to get started</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  {groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!isMember) return false; if (!g.condition) return false; if (isGroupExpired(g)) return false; return !cartItems.some(i => i.productsku === g.productsku); }).map(g => {
                    const product = products[g.productsku]; const member  = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); const disc    = Math.min(50, g.userlimit * 2); const gQty    = member?.qty || 0; const base    = member?.price || 0; const isSel   = selectedItems.some(s => s.groupsku === g.groupsku && s.isGroup); const total   = parseFloat(calculateDiscountedPrice(base, disc)) * gQty;
                    return (
                      <div key={g.groupsku} className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
                        <div className="flex items-start">
                          {product?.generalimages?.[0]?.img ? ( <img src={apicartService.getProductImage(g.productsku, product.generalimages[0].img)} alt={product?.title || 'Product'} className="w-20 h-20 object-cover rounded-lg mr-3" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} /> ) : null}
                          <div className={`w-20 h-20 ${product?.generalimages?.[0]?.img ? 'hidden' : 'flex'} items-center justify-center bg-gray-200 rounded-lg mr-3`}><span className="text-gray-400 text-[10px]">No Image</span></div>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center mb-1.5 p-1.5 rounded-lg transition-all ${isSel ? 'bg-green-50 border-2 border-green-400' : !g.condition ? 'bg-gray-50 border-2 border-gray-200 opacity-60' : 'bg-blue-50 border-2 border-blue-200 hover:border-blue-300'}`}>
                              <label className="flex items-center cursor-pointer w-full">
                                <input type="checkbox" checked={isSel} disabled={!g.condition} onChange={(e) => { if (e.target.checked) { if (g.condition) setSelectedItems(prev => [...prev, { ...member, productsku: g.productsku, groupsku: g.groupsku, discount: disc, isGroup: true }]); } else { setSelectedItems(prev => prev.filter(s => s.groupsku !== g.groupsku)); } }} className="mr-2 w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-1 focus:ring-green-500 disabled:opacity-50" />
                                <span className={`text-xs font-medium flex items-center ${isSel ? 'text-green-700' : !g.condition ? 'text-gray-500' : 'text-blue-700'}`}>
                                  {isSel ? (<><FaCheckCircle className="mr-1.5 text-green-600 text-xs" />Selected</>) : !g.condition ? (<>⏳ Waiting...</>) : (<>☑️ Select</>)}
                                </span>
                              </label>
                            </div>
                            <div className="flex justify-between items-start"><h3 className="font-semibold text-gray-800 text-sm truncate pr-2">{product?.title || 'Product'}</h3><button onClick={() => handleRemoveGroupMember(g.groupsku)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><FaTimes className="text-sm" /></button></div>
                            <div className="mt-1 text-xs text-gray-600">{member?.variables?.map((v, i) => <span key={i} className="mr-1.5">{v.name}: {v.value}</span>)}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button onClick={() => handleGroupQuantityChange(g.groupsku, -1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7" disabled={!g.condition}><FaMinus size={10} /></button>
                                <span className="px-2 py-1 text-xs">{gQty}</span>
                                <button onClick={() => handleGroupQuantityChange(g.groupsku, 1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7" disabled={!g.condition}><FaPlus size={10} /></button>
                              </div>
                              <div className="text-right"><div className={`text-xs ${disc > 0 ? 'text-purple-600 font-semibold' : 'font-semibold'}`}>{currencyCountry(disc > 0 ? total : base * gQty, userAuth?.country || 'UAE')}</div></div>
                            </div>
                            {!isGroupExpired(g) ? (
                              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 text-xs shadow-sm">
                                <div className="flex items-center justify-between mb-1"><div className="font-semibold text-purple-800 flex items-center text-xs">👥 {g.groupname}</div>{readyLabel(g.condition)}</div>
                                <div className="flex items-center justify-between mb-1"><div className="text-purple-600 text-[10px]">{g.condition ? 'Ready for checkout!' : `${g.members?.length || 0}/${g.userlimit} joined`}</div><div className="text-purple-700 font-bold text-xs">{g.userlimit * 2}% OFF</div></div>
                                {!g.condition && countdownTimes[g.groupsku || g.id] && ( <div className="text-purple-600 text-[10px] mb-1">⏰ Time left: {countdownTimes[g.groupsku || g.id]}</div> )}
                                {!g.condition && ( <button onClick={() => shareGroupUrl(g.productsku)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-[10px] py-1.5 px-2 rounded-lg transition-all">📤 Share Group Link</button> )}
                              </div>
                            ) : ( <div className="mt-2 bg-gray-100 border border-gray-200 rounded-lg p-2 text-xs opacity-60 text-center">⏰ This group has expired</div> )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {cartItems.map(item => {
                    const product = products[item.productsku]; const g = getGroupDetails(item); const showGroupInfo = g && g.condition && !isGroupExpired(g); const discount = showGroupInfo ? getGroupDiscount(item) : 0; const discounted = parseFloat(calculateDiscountedPrice(item.price || 0, discount)); const isSel = selectedItems.some(s => s.id === item.id && !s.isGroup);
                    return (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
                        <div className="flex items-start">
                          {product?.generalimages?.[0]?.img ? ( <img src={apicartService.getProductImage(item.productsku, product.generalimages[0].img)} alt={product?.title || 'Product'} className="w-20 h-20 object-cover rounded-lg mr-3" onError={(e) => { e.target.style.display='none';e.target.nextElementSibling.style.display='flex';}} /> ) : null}
                          <div className={`w-20 h-20 ${product?.generalimages?.[0]?.img?'hidden':'flex'} items-center justify-center bg-gray-200 rounded-lg mr-3`}><span className="text-gray-400 text-[10px]">No Image</span></div>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center mb-1.5 p-1.5 rounded-lg transition-all ${isSel ? 'bg-green-50 border-2 border-green-400' : 'bg-blue-50 border-2 border-blue-200 hover:border-blue-300'}`}>
                              <label className="flex items-center cursor-pointer w-full">
                                <input type="checkbox" checked={isSel} onChange={(e) => { if (e.target.checked) { setSelectedItems(prev => [...prev, { ...item, discount }]); } else { setSelectedItems(prev => prev.filter(s => s.id !== item.id)); } }} className="mr-2 w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-1 focus:ring-green-500" />
                                <span className={`text-xs font-medium flex items-center ${isSel ? 'text-green-700' : 'text-blue-700'}`}>{isSel ? (<><FaCheckCircle className="mr-1.5 text-green-600 text-xs" />Selected</>) : <>☑️ Select</>}</span>
                              </label>
                            </div>
                            <div className="flex justify-between items-start"><h3 className="font-semibold text-gray-800 text-sm truncate pr-2">{product?.title || 'Product'}</h3><button onClick={() => handleRemoveItem(item)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><FaTimes className="text-sm" /></button></div>
                            <div className="mt-1 text-xs text-gray-600">{item.variables?.map((v, i) => <span key={i} className="mr-1.5">{v.name}: {v.value}</span>)}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button onClick={() => handleQuantityChange(item, -1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7"><FaMinus size={10} /></button>
                                <span className="px-2 py-1 text-xs">{item.qty}</span>
                                <button onClick={(e) => { e?.stopPropagation?.(); handleIncreaseCartQty(item); }} disabled={(() => { const mx = getKnownMaxQtySync(item); const cur = Math.max(1, Number(item?.qty) || 1); return (mx !== null && mx > 0 && cur >= mx); })()} className="p-1 text-gray-600 hover:bg-gray-100 w-7 disabled:opacity-50 disabled:cursor-not-allowed"><FaPlus size={10} /></button>
                              </div>
                              <div className="text-right">{discount > 0 ? <div className="text-purple-600 font-semibold text-xs">{currencyCountry(discounted, userAuth?.country || 'UAE')}</div> : <div className="font-semibold text-xs">{currencyCountry(item.price || 0, userAuth?.country || 'UAE')}</div>}</div>
                            </div>
                            {showGroupInfo && (
                              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 text-xs shadow-sm">
                                <div className="flex items-center justify-between mb-1"><div className="font-semibold text-purple-800 flex items-center text-xs">👥 {g.groupname}</div>{readyLabel(g.condition)}</div>
                                <div className="flex items-center justify-between mb-1"><div className="text-purple-600 text-[10px]">Ready for checkout!</div><div className="text-purple-700 font-bold text-xs">{g.userlimit * 2}% OFF</div></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="sticky bottom-0 mt-3 p-3 bg-white border-t-2 border-gray-200 shadow-lg">
                  {selectedItems.length > 0 ? (<>
                      <div className="flex justify-between items-center mb-1.5"><span className="font-semibold text-sm">Subtotal ({selectedItems.length} items):</span><span className="font-bold text-sm">{currencyCountry(calculateSubtotal(), userAuth?.country || 'UAE')}</span></div>
                      {calculateDiscount() > 0 && ( <div className="flex justify-between items-center mb-1.5 text-green-600"><span className="text-xs">Discount:</span><span className="text-xs font-semibold">-{currencyCountry(calculateDiscount(), userAuth?.country || 'UAE')}</span></div> )}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-semibold text-gray-700">Delivery Type:</span></div>
                        <div className="flex gap-1.5 mb-1.5">
                          <button
                            onClick={() => setDeliveryType('Office')}
                            className="flex-1 py-1.5 px-2 rounded-lg border-2 transition-all text-xs"
                            style={deliveryType === 'Office' ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText, fontWeight: '600' } : { borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#4b5563' }}
                          >
                            Office
                          </button>
                          <button
                            onClick={() => setDeliveryType('Home')}
                            className="flex-1 py-1.5 px-2 rounded-lg border-2 transition-all text-xs"
                            style={deliveryType === 'Home' ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText, fontWeight: '600' } : { borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#4b5563' }}
                          >
                            Home
                          </button>
                        </div>
                        <div className="flex justify-between items-center"><span className="text-xs text-gray-600">Delivery Cost:</span><span className="text-xs font-semibold">{currencyCountry(calculateDeliveryPrice(selectedItems, deliveryType), userAuth?.country || 'UAE')}</span></div>
                      </div>
                      <div className="flex justify-between items-center mb-1.5"><span className="text-xs text-gray-600">VAT ({getVATRate(userAuth?.country || 'UAE')}%):</span><span className="text-xs">{currencyCountry(calculateVAT(), userAuth?.country || 'UAE')}</span></div>
                      <div className="flex justify-between items-center mb-3 font-bold text-sm border-t pt-1.5"><span>Grand Total:</span><span className="text-purple-600">{currencyCountry(calculateTotal(), userAuth?.country || 'UAE')}</span></div>
                    </>) : ( <div className="text-center py-3"><p className="text-gray-500 text-xs">Select items to checkout</p></div> )}
                  <button onClick={() => (selectedItems.length ? setShowPayment(true) : alert('Please select items to checkout'))} disabled={selectedItems.length === 0} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                    Proceed to Checkout {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                  </button>
                </div>
              </div>
            )
          )}
          {showPayment && ( <Popupshow onClose={() => setShowPayment(false)}><PaymentForm total={calculateTotal()} selectedItems={selectedItems} userAuth={userAuth} deliveryType={deliveryType} deliverydetails={deliverydetails} products={products} onRefreshDeliveryDetails={async () => { const user = await apicartService.getUserByPhone(userPhone); setDeliverydetails(user.deliverydetails || []); }} onComplete={(success) => (success ? handleCompletePayment() : setShowPayment(false))} /></Popupshow> )}
          {selectedTab === 'order' && !showPayment && (
            <div className="h-full flex flex-col">
              {orders.length === 0 ? ( <div className="text-center py-8"><FaBox className="text-gray-300 text-4xl mx-auto" /><h3 className="text-base font-semibold mt-3">No active orders</h3><p className="text-gray-500 text-sm mt-1.5">Your completed orders will appear here</p></div> ) : (
                <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                  {orders.map(o => { const sku = o.orders?.[0]?.productsku; if (!sku) return null; const product = products[sku]; if (!product) return null; return ( <OrderItem key={o.orders[0].id} order={{ ...o.orders[0], productDetails: product, ordersku: o.ordersku, date: o.date }} onStatusChange={handleStatusChange} onRate={handleRateProduct} userCountry={userAuth?.country} userAuth={userAuth} theme={theme} /> ); })}
                </div>
              )}
            </div>
          )}
          {selectedTab === 'history' && !showPayment && (
            <div className="h-full flex flex-col">
              {history.length === 0 ? ( <div className="text-center py-8"><FaHistory className="text-gray-300 text-4xl mx-auto" /><h3 className="text-base font-semibold mt-3">No order history</h3><p className="text-gray-500 text-sm mt-1.5">Your completed orders will appear here</p></div> ) : (
                <div className="flex-1 overflow-y-auto pr-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                  {history.map(h => { const p = products[h.orders[0].productsku]; return ( <OrderItem key={h.orders[0].id} order={{ ...h.orders[0], productDetails: p, ordersku: h.ordersku, date: h.date }} userCountry={userAuth?.country} isHistory userAuth={userAuth} onStatusChange={() => {}} onRate={() => {}} theme={theme} /> ); })}
                </div>
              )}
            </div>
          )}
        </div>
        {showGroupPopup && currentItem && ( <Popupshow onClose={() => setShowGroupPopup(false)}>
            <div className="flex justify-between items-center mb-3"><h2 className="text-base font-bold text-gray-800">Create Group</h2></div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Group Name</label><input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Summer Sale Group" className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">Number of Participants</label><div className="flex items-center"><input type="range" min="2" max="25" value={groupLimit} onChange={(e) => setGroupLimit(parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" /><span className="ml-3 w-8 text-center font-bold text-purple-700 text-sm">{groupLimit}</span></div><p className="text-xs text-gray-500 mt-1">Discount: {Math.min(50, groupLimit * 2)}% (2% per participant, max 50%)</p></div>
              <div><label className="block text-sm font-bold text-purple-600 text-center m-3">Select the deadline</label><div className="flex space-x-2"><select value={selectedTime.hours} onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })} className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{Array.from({ length: 24 }, (_, i) => i).map(h => ( <option key={h} value={h}>{String(h).padStart(2, '0')} Hours</option> ))}</select><span className="self-center text-sm">:</span><select value={selectedTime.minites} onChange={(e) => setSelectedTime({ ...selectedTime, minites: parseInt(e.target.value) })} className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{[0, 15, 30, 45, 59].map(m => ( <option key={m} value={m}>{String(m).padStart(2, '0')} Minutes</option> ))}</select></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setShowGroupPopup(false)} className="py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-300 transition">Cancel</button><button onClick={handleCreateGroup} className="py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-indigo-800 transition shadow-md">Create Group</button></div>
            </div>
          </Popupshow> )}
        {showJoinGroupPopup && currentItem && ( <Popupshow onClose={() => setShowJoinGroupPopup(false)}>
            <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">👥 Join a Group</h2></div>
            {availableGroups.length > 0 ? ( <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 mb-3"><p className="text-xs text-purple-700 font-medium">💰 Save up to {Math.min(50, availableGroups[0]?.userlimit * 2 || 0)}% by joining a group!</p></div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                  {availableGroups.sort((a, b) => (a.groupsku || '').localeCompare(b.groupsku || '')).map(g => {
                    const count = g.members?.length || 0; const disc = Math.min(50, g.userlimit * 2); const nameShort = (g.groupname || 'Group').split(' ').slice(0, 2).join(' ') + ((g.groupname || '').split(' ').length > 2 ? '...' : ''); let timeLeft = '—';
                    if (g.date && g.hour !== undefined && (g.minute !== undefined || g.minite !== undefined)) { const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0); const diff = end.getTime() - Date.now(); timeLeft = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : 'Expired'; }
                    return (
                      <div key={g.groupsku} className="bg-white border-2 border-purple-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all hover:border-purple-400">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1"><h3 className="font-bold text-gray-800 mb-1 text-sm">👥 {nameShort}</h3><div className="flex items-center gap-2 text-xs"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{disc}% OFF</span><span className="text-gray-600">{count}/{g.userlimit} members</span></div></div>
                          <div className="text-right"><div className="text-[10px] text-gray-500 mb-0.5">Time left</div><div className={`text-xs font-bold ${timeLeft === 'Expired' ? 'text-red-500' : 'text-purple-600'}`}>{timeLeft}</div></div>
                        </div>
                        <button onClick={() => handleJoinGroup(g.groupsku)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-xs hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">🚀 Join Now & Save {disc}%</button>
                      </div>
                    );
                  })}
                </div>
              </div> ) : ( <div className="text-center py-8"><div className="text-5xl mb-3">😔</div><p className="text-gray-600 font-medium text-sm">No available groups for this product.</p><p className="text-xs text-gray-500 mt-1.5">Create your own group to get started!</p></div> )}
            <div className="mt-4"><button onClick={() => setShowJoinGroupPopup(false)} className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-300 transition">Close</button></div>
          </Popupshow> )}
      </div>
    </div>
  );
};
const APaymentForm = ({ total, onComplete, selectedItems, userAuth, deliveryType = 'Office', deliverydetails = [], products = {}, onRefreshDeliveryDetails }) => {
  const PAYMENT_GATEWAY_DISABLED = false; const userCurrency = countryRates[userAuth?.country]?.symbol || 'USD';
  const [form, setForm] = useState({ card: '', expiry: '', cvv: '' }); const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [done, setDone] = useState(false); const [selectedDeliveryAddress, setSelectedDeliveryAddress] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const userPhone = getUserPhone(); const displayAmount = currencyCountry(total, userAuth?.country || 'UAE');
  const theme = {
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  const validateExpiryDate = (expiry) => {
    if (!expiry || expiry.length < 4) return false;
    const cleanExpiry = expiry.replace(/\D/g, ''); if (cleanExpiry.length !== 4) return false;
    const month = cleanExpiry.substring(0, 2); const year = cleanExpiry.substring(2, 4);
    const monthNum = parseInt(month, 10); const yearNum = parseInt(year, 10); if (monthNum < 1 || monthNum > 12) return false;
    const currentDate = new Date(); const currentYear = currentDate.getFullYear() % 100; const fullYear = 2000 + yearNum;
    const expiryDate = new Date(fullYear, monthNum - 1); const maxDate = new Date(currentDate.getFullYear() + 10, currentDate.getMonth()); const minDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
    if (expiryDate < minDate) return false; if (expiryDate > maxDate) return false; return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.card || form.card.replace(/\s/g, '').length < 13) { setError('الرجاء إدخال رقم بطاقة صالح'); return; }
    const cleanExpiry = form.expiry.replace(/\D/g, ''); if (!validateExpiryDate(cleanExpiry)) { setError('الرجاء إدخال تاريخ انتهاء صالح (يجب أن يكون في المستقبل وخلال 10 سنوات)'); return; }
    if (!form.cvv || form.cvv.length !== 3) { setError('الرجاء إدخال رمز CVV صالح (3 أرقام)'); return; }
    if (!selectedDeliveryAddress) { setError('الرجاء اختيار عنوان التسليم'); return; }
    setLoading(true); setError(null);
    try {
      const selectedDetail = deliverydetails.find(d => d.id === selectedDeliveryAddress); let customerlocation = {};
      if (selectedDetail) {
        customerlocation = { customerphone: selectedDetail.deliveryphone, customername: selectedDetail.deliveryname, customerlocation: selectedDetail.deliverylocation };
      } else { customerlocation = { customerphone: userAuth.phone, customername: "", customerlocation: "" }; }
      const orderData = {
        orders: selectedItems.map(item => {
          const product = products[item.productsku]; const shopphone = product?.phone || item.shopphone || userAuth.phone;
          const AorderItem = { id: item.id, shopphone: shopphone, productsku: item.productsku, price: item.price, qty: item.qty, discount: item.discount || 0, variables: (item.variables || []).map(v => ({ id: v.id, typename: v.name, atypename: v.aname || v.name, name: v.value, aname: v.avalue || v.value })) };
          if (item.affliate) AorderItem.affliate = item.affliate; return AorderItem;
        }),
        deliveryoption: "Dalilee", deliverytype: deliveryType, storepaid: false, storewithdraw: false, customerlocation: customerlocation,
        payment: { cardnumber: form.card.replace(/\s/g, ''), expirydate: form.expiry, cvv: form.cvv, value: total, currency: userCurrency }
      };
      await apicartService.createOrder(userAuth.phone, orderData);
      for (const item of selectedItems) {
        const product = products[item.productsku];
        if (product) {
          const selectedMap = buildSelectedVarMap(item.variables || []);
          const quantityId = findQuantityId(product, selectedMap);
          if (quantityId && item.qty) {
            try {
              await apiCall(`${API_BASE_URL}/t3wn/products/${item.productsku}/quantity/${quantityId}/qty/${item.qty}`, { method: 'DELETE' });
            } catch (e) {
              console.error('Failed to reduce product quantity:', e);
            }
          }
        }
      }
      setDone(true); setTimeout(() => onComplete(true), 1400);
    } catch (err) { setError('فشل الدفع. الرجاء المحاولة مرة أخرى.'); } finally { setLoading(false); }
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-xl font-bold text-gray-800">تفاصيل الدفع</h2>
      </div>
      {done ? (
        <div className="text-center py-6">
          <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">تم الدفع بنجاح!</h3>
          <p className="text-gray-600">تم تقديم طلبك.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pl-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">عنوان التسليم</label>
            {deliverydetails && deliverydetails.length > 0 ? (
              <div className="space-y-2 mb-2 max-h-48 overflow-y-auto">
                {deliverydetails.map((detail) => (
                  <div
                    key={detail.id}
                    onClick={() => setSelectedDeliveryAddress(detail.id)}
                    className="border-2 rounded-lg p-3 cursor-pointer transition-all"
                    style={selectedDeliveryAddress === detail.id ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22` } : { borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-semibold text-sm">{detail.deliveryname}</div>
                        <div className="text-xs text-gray-600">الهاتف: {detail.deliveryphone}</div>
                        <div className="text-xs text-gray-500 mt-1">الموقع المختار</div>
                      </div>
                      <div
                        className="mr-3 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={selectedDeliveryAddress === detail.id ? { borderColor: theme.btnBg, backgroundColor: theme.btnBg } : { borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                      >
                        {selectedDeliveryAddress === detail.id && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : ( <p className="text-gray-500 text-sm mb-2">لا توجد عناوين تسليم</p> )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">رقم البطاقة</label>
            <input
              type="text"
              value={form.card.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().slice(0, 19)}
              onChange={(e) => setForm({ ...form, card: e.target.value.replace(/\s/g, '') })}
              placeholder="4242 4242 4242 4242"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-left"
              dir="ltr"
              onFocus={(e) => e.target.style.borderColor = theme.btnBg}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الانتهاء (شهر/سنة)</label>
              <input type="text" value={form.expiry.replace(/[^0-9]/g, '').replace(/^(\d{2})(\d{0,2})/, (match, p1, p2) => p2 ? `${p1}/${p2}` : p1).slice(0, 5)} onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 4); setForm({ ...form, expiry: raw });
                if (error && error.includes('expiry')) setError(null);
              }} onBlur={(e) => {
                const expiry = form.expiry.replace(/\D/g, ''); if (expiry.length === 4) {
                  if (!validateExpiryDate(expiry)) setError('يجب أن يكون تاريخ الانتهاء في المستقبل وخلال 10 سنوات');
                  else if (error && error.includes('expiry')) setError(null);
                }
              }}
              placeholder="12/25"
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-left"
              dir="ltr"
              onFocus={(e) => e.target.style.borderColor = theme.btnBg}
            />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
              <input
                type="text"
                value={form.cvv}
                maxLength={3}
                onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                placeholder="123"
                required
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent text-left"
                dir="ltr"
                onFocus={(e) => e.target.style.borderColor = theme.btnBg}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
            <input readOnly value={displayAmount} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-left" dir="ltr" />
          </div>
          <div className="sticky bottom-0 bg-white pt-4 pb-2">
            {PAYMENT_GATEWAY_DISABLED && ( <div className="mb-3 p-3 bg-yellow-100 border border-yellow-400 rounded-lg text-sm text-yellow-800 text-center">⚠️ بوابة الدفع قيد المعالجة</div> )}
            <button
              type="submit"
              disabled={PAYMENT_GATEWAY_DISABLED || loading || !form.card || !form.expiry || !form.cvv || !selectedDeliveryAddress}
              className="w-full py-3 rounded-lg font-semibold transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
            >
              {loading ? 'جاري المعالجة...' : 'ادفع الآن'}
            </button>
            {error && <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
          </div>
        </form>
      )}
    </div>
  );
};
const AOrderItem = ({ order, onStatusChange, onRate, userCountry, userAuth, isHistory = false, theme = { btnBg: '#2d3748', btnText: '#ffffff', btnRadius: '9999px', btnShadow: '0 2px 6px rgba(0,0,0,0.12)', cardText: '#111827' } }) => {
  const isDelivered = order.status?.deliverd || order.deliverconfirmed; const isWaiting = order.status?.waiting;
  const [rating, setRating] = useState(0); const [comment, setComment] = useState(''); const [showRate, setShowRate] = useState(false);
  const submitRating = async () => {
    if (rating <= 0) return;
    const ratingData = { rating, comment, productsku: order.productsku };
    try {
      await apicartService.confirmDelivery(userAuth?.phone, order.id, ratingData);
      onStatusChange(order.id, 'delivered'); onRate(order.productsku, rating, comment); setShowRate(false); setRating(0); setComment('');
    } catch { alert('فشل تأكيد التسليم. الرجاء المحاولة مرة أخرى.'); }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4 shadow-sm" dir="rtl">
      <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-800">الطلب #{order.ordersku}</h3>
          <p className="text-sm text-gray-500">{formatDate(order.date)} • {formatTime(order.date)}</p>
        </div>
        <span
          className="px-3 py-1 rounded-full text-sm font-medium"
          style={isDelivered ? { backgroundColor: '#d1fae5', color: '#065f46' } : isWaiting ? { backgroundColor: `${theme.btnBg}22`, color: theme.cardText } : { backgroundColor: '#dbeafe', color: '#1e40af' }}
        >
          {isDelivered ? 'تم التسليم' : isWaiting ? 'قيد الانتظار' : 'قيد المعالجة'}
        </span>
      </div>
      <div className="flex items-start">
        {order.productDetails?.generalimages?.[0]?.img ? (
          <img src={apicartService.getProductImage(order.productsku, order.productDetails.generalimages[0].img)} alt={order.productDetails?.atitle || 'المنتج'} className="w-16 h-16 object-cover rounded-lg ml-4" onError={(e) => { e.target.style.display='none';e.target.nextElementSibling.style.display='flex'}} />
        ) : null}
        <div className={`w-16 h-16 ${order.productDetails?.generalimages?.[0]?.img?'hidden':'flex'} items-center justify-center bg-gray-200 rounded-lg ml-4`}><span className="text-gray-400 text-xs">لا توجد صورة</span></div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-800">{order.productDetails?.atitle}</h4>
          <div className="text-sm text-gray-600 mt-1">
            {order.variables?.map((v, i) => <span key={i} className="ml-2">{v.atypename}: {v.aname}</span>)}
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-gray-700">
              {order.qty} × {currencyCountry(order.price, userCountry || 'UAE')}
              {!!order.discount && <span className="mr-1 text-purple-600">({order.discount}% خصم)</span>}
            </span>
            <span className="font-semibold">{currencyCountry(order.price * order.qty * (1 - (order.discount || 0) / 100), userCountry || 'UAE')}</span>
          </div>
        </div>
      </div>
      {order.status && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex justify-between mb-2 text-sm">
            {['waiting', 'process', 'shiped', 'deliverd'].map(s => (
              <span key={s} className={order.status[s] ? 'font-semibold' : 'text-gray-400'} style={order.status[s] ? { color: theme.cardText } : {}}>{s === 'waiting' ? 'انتظار' : s === 'process' ? 'معالجة' : s === 'shiped' ? 'تم الشحن' : 'تم التسليم'}</span>
            ))}
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div className="h-2 rounded-full" style={{ backgroundColor: theme.btnBg, width: order.status.deliverd ? '100%' : order.status.shiped ? '75%' : order.status.process ? '50%' : '25%' }} />
          </div>
          {isWaiting && !isHistory && (
            <div className="mt-4">
              {!showRate ? (
                <button
                  onClick={() => setShowRate(true)}
                  className="w-full py-2 rounded-lg transition shadow-md"
                  style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                >
                  تقييم وتأكيد التسليم
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm mb-2 font-medium">قيم هذا المنتج لتأكيد التسليم:</p>
                  <div className="flex space-x-1 justify-center">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setRating(star)} className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500 transition`}>★</button>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تعليق (اختياري)</label>
                    <textarea
                      rows={3}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="شارك تجربتك..."
                      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                      onFocus={(e) => e.target.style.borderColor = theme.btnBg}
                      onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={submitRating}
                      disabled={rating === 0}
                      className="flex-1 py-2 rounded-lg transition shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
                    >
                      {rating === 0 ? 'اختر تقييماً' : 'تأكيد التسليم'}
                    </button>
                    <button onClick={() => { setShowRate(false); setRating(0); setComment(''); }} className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition">إلغاء</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export const Acart = () => {
  const [cartItems, setCartItems] = useState([]); const [groups, setGroups] = useState([]); const [orders, setOrders] = useState([]); const [history, setHistory] = useState([]); const [selectedTab, setSelectedTab] = useState('cart'); const [userAuth, setUserAuth] = useState(null); const [showGroupPopup, setShowGroupPopup] = useState(false); const [groupName, setGroupName] = useState(''); const [groupLimit, setGroupLimit] = useState(3); const [selectedTime, setSelectedTime] = useState({ hours: 18, minites: 0 }); const [showPayment, setShowPayment] = useState(false); const [currentItem, setCurrentItem] = useState(null); const [selectedItems, setSelectedItems] = useState([]); const [products, setProducts] = useState({}); const [countdownTimes, setCountdownTimes] = useState({}); const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false); const [availableGroups, setAvailableGroups] = useState([]); const [deliveryType, setDeliveryType] = useState('Office'); const [deliverydetails, setDeliverydetails] = useState([]); const [storeProfile, setStoreProfile] = useState(null); const userPhone = getUserPhone(); const navigate = useNavigate(); const location = useLocation(); const hasAutoSelectedRef = useRef(false); const lastCartStateRef = useRef('');
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    cardRadius: storeProfile?.cards?.borderRadius || '0.75rem',
    cardShadow: storeProfile?.cards?.shadow || '0 2px 6px rgba(0,0,0,0.08)',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  const getCartItemSku = (item) => (item?.productsku || item?.productSku || item?.sku || null);
  const getKnownMaxQtySync = (item) => {
    const sku = getCartItemSku(item); if (!sku) return null; const p = products?.[String(sku).trim()]; if (!p) return null;
    const selectedMap = buildSelectedVarMap(item?.variables || []); return computeMaxQtyForSelection(p, selectedMap);
  };
  const loadProductIfMissing = async (sku) => {
    const key = String(sku || "").trim(); if (!key) return null; if (products?.[key]) return products[key];
    const p = await apicartService.getProductBySku(key).catch(() => null); if (p) setProducts((prev) => ({ ...(prev || {}), [key]: p })); return p;
  };
  const handleIncreasACartQty = async (item) => {
    if (!userPhone) { navigate('/alogin'); return; } if (!item) return; const sku = getCartItemSku(item); if (!sku) return;
    const current = Math.max(1, Number(item?.qty) || 1); const product = await loadProductIfMissing(sku); if (!product) {
      const nextQty = current + 1; const updated = { ...item, qty: nextQty };
      try { await apicartService.updatACartItem(userPhone, item.id, updated); setCartItems((prev) => (prev || []).map((ci) => (ci.id === item.id ? updated : ci))); setSelectedItems((prev) => (prev || []).map((s) => (s.id === item.id ? { ...s, qty: nextQty } : s))); } catch (e) { alert('فشل تحديث الكمية'); }
      return;
    }
    const selectedMap = buildSelectedVarMap(item?.variables || []); const max = computeMaxQtyForSelection(product, selectedMap); if (max <= 0 || current >= max) { alert('لا يوجد مخزون إضافي لهذا الخيار'); return; }
    const nextQty = Math.min(max, current + 1); const updated = { ...item, qty: nextQty };
    try { await apicartService.updatACartItem(userPhone, item.id, updated); setCartItems((prev) => (prev || []).map((ci) => (ci.id === item.id ? updated : ci))); setSelectedItems((prev) => (prev || []).map((s) => (s.id === item.id ? { ...s, qty: nextQty } : s))); } catch (e) { alert('فشل تحديث الكمية'); }
  };
  const loadCartData = useCallback(async () => {
    if (!userPhone) return;
    try {
      const user = await apicartService.getUserByPhone(userPhone); setUserAuth({ phone: userPhone, country: user.country }); setDeliverydetails(user.deliverydetails || []);
      const [cartData, groupData, orderData] = await Promise.all([ apicartService.getCartByPhone(userPhone), apicartService.getGroupsByPhone(userPhone), apicartService.getOrdersByPhone(userPhone) ]);
      setCartItems(cartData); setGroups(groupData); const act = [], hist = [];
      if (Array.isArray(orderData)) { orderData.forEach(o => (o.orders || []).forEach(it => (it.deliverconfirmed ? hist : act).push({ ...o, orders: [it] }))); }
      setOrders(act); setHistory(hist); const skuSet = new Set(); cartData.forEach(i => skuSet.add(i.productsku)); groupData.forEach(g => skuSet.add(g.productsku)); orderData.forEach(o => (o.orders || []).forEach(it => skuSet.add(it.productsku)));
      const results = await Promise.all(Array.from(skuSet).map(async sku => { try { return { sku, product: await apicartService.getProductBySku(sku) }; } catch { return { sku, product: null }; } }));
      const map = {}; results.forEach(({ sku, product }) => { if (product) map[sku] = product; }); setProducts(map);
    } catch (e) {}
  }, [userPhone]);
  useEffect(() => { if (!userPhone) { navigate('/alogin'); return; } loadCartData(); }, [userPhone, navigate, loadCartData]);
  useEffect(() => { if (!userPhone) return; const interval = setInterval(() => loadCartData(), 3000); return () => clearInterval(interval); }, [userPhone, loadCartData]);
  useEffect(() => {
    if (!groups.length) return; const t = setInterval(() => {
      const next = {}; groups.forEach(g => {
        if (!g.date || g.hour === undefined) return; const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now(); const key = g.groupsku || g.id; next[key] = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : "انتهت";
      }); setCountdownTimes(next);
    }, 1000); return () => clearInterval(t);
  }, [groups]);
  useEffect(() => {
    const isCartRoute = location.pathname.includes('/cart'); if (!isCartRoute || !userPhone) { hasAutoSelectedRef.current = false; lastCartStateRef.current = ''; return; }
    if (cartItems.length === 0 && groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); return isMember && g.condition && !isGroupExpired(g); }).length === 0) return;
    const cartStateHash = `${cartItems.length}-${groups.length}-${cartItems.map(i => i.id).join(',')}-${groups.map(g => g.groupsku || g.id).join(',')}`; if (lastCartStateRef.current !== cartStateHash) { hasAutoSelectedRef.current = false; lastCartStateRef.current = cartStateHash; }
    if (hasAutoSelectedRef.current) return; const allSelected = [];
    groups.forEach(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!isMember) return; if (!g.condition) return; if (isGroupExpired(g)) return; if (cartItems.some(i => i.productsku === g.productsku)) return;
      const member = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); if (member) { const disc = Math.min(50, g.userlimit * 2); allSelected.push({ ...member, productsku: g.productsku, groupsku: g.groupsku, discount: disc, isGroup: true }); }
    });
    cartItems.forEach(item => { const g = getGroupDetails(item); const showGroupInfo = g && g.condition && !isGroupExpired(g); const discount = showGroupInfo ? getGroupDiscount(item) : 0; allSelected.push({ ...item, discount }); });
    if (allSelected.length > 0) { setSelectedItems(allSelected); hasAutoSelectedRef.current = true; }
  }, [location.pathname, cartItems, groups, userPhone, products]);
  const isGroupExpired = (g) => {
    if (!g?.date || g.hour === undefined) return false; const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0); return Date.now() > end.getTime();
  };
  const handleQuantityChange = async (item, delta) => {
    if (!userPhone) { navigate('/alogin'); return; } if (delta > 0) { await handleIncreasACartQty(item); return; }
    const newQty = (item.qty || 0) + delta; if (newQty <= 0) {
      await apicartService.deletACartItem(userPhone, item.id); setCartItems(prev => prev.filter(i => i.id !== item.id)); setSelectedItems(prev => prev.filter(s => s.id !== item.id));
    } else { const updated = { ...item, qty: newQty }; await apicartService.updatACartItem(userPhone, item.id, updated); setCartItems(prev => prev.map(i => (i.id === item.id ? updated : i))); setSelectedItems(prev => prev.map(s => (s.id === item.id ? { ...s, qty: newQty } : s))); }
  };
  const handleRemoveItem = async (item) => {
    if (!userPhone) { navigate('/alogin'); return; } await apicartService.deletACartItem(userPhone, item.id); setCartItems(prev => prev.filter(i => i.id !== item.id)); setSelectedItems(prev => prev.filter(s => s.id !== item.id));
  };
  const handleGroupQuantityChange = async (groupsku, delta) => {
    if (!userPhone) { navigate('/alogin'); return; } const g = groups.find(x => x.groupsku === groupsku); if (!g) return; const me = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!me) return;
    const newQty = (me.qty || 0) + delta; if (newQty <= 0) return handleRemoveGroupMember(groupsku); const payload = { price: me.price, qty: newQty, variables: me.variables || [] };
    await apicartService.updateGroupMember(userPhone, groupsku, payload); setGroups(await apicartService.getGroupsByPhone(userPhone)); setSelectedItems(prev => prev.map(s => (s.groupsku === groupsku ? { ...s, qty: newQty } : s)));
  };
  const handleRemoveGroupMember = async (groupsku) => {
    if (!userPhone) { navigate('/alogin'); return; } await apicartService.deleteGroupMember(userPhone, groupsku); setGroups(await apicartService.getGroupsByPhone(userPhone)); setSelectedItems(prev => prev.filter(s => s.groupsku !== groupsku));
  };
  const handleCreateGroup = async () => {
    if (!userPhone) { navigate('/alogin'); return; } if (!groupName.trim()) return alert('الرجاء إدخال اسم المجموعة'); if (groupLimit < 2 || groupLimit > 25) return alert('يجب أن يكون حد المجموعة بين 2 و 25'); if (!currentItem?.productsku || !currentItem?.price || !currentItem?.qty) return alert('معلومات المنتج مفقودة');
    const payload = { productsku: currentItem.productsku, groupname: groupName, userlimit: groupLimit, hour: selectedTime.hours || 0, minite: selectedTime.minites || 0, members: [{ price: currentItem.price, qty: currentItem.qty, variables: (currentItem.variables || []).map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) }] };
    try {
      await apicartService.createGroup(userPhone, payload); await apicartService.deletACartItem(userPhone, currentItem.id).catch(() => {}); setCartItems(await apicartService.getCartByPhone(userPhone)); setGroups(await apicartService.getGroupsByPhone(userPhone)); setShowGroupPopup(false); setGroupName(''); setGroupLimit(3); setSelectedTime({ hours: 18, minites: 0 }); alert('تم إنشاء المجموعة بنجاح!');
    } catch (e) { alert(`فشل إنشاء المجموعة: ${e.message || 'خطأ غير معروف'}`); }
  };
  const handleJoinGroup = async (groupsku) => {
    if (!userPhone) { navigate('/alogin'); return; } if (!currentItem?.price || !currentItem?.qty) return alert('معلومات المنتج مفقودة');
    const memberData = { price: currentItem.price, qty: currentItem.qty, variables: (currentItem.variables || []).map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) };
    try { await apicartService.joinGroup(userPhone, groupsku, memberData); await apicartService.deletACartItem(userPhone, currentItem.id).catch(() => {}); setCartItems(await apicartService.getCartByPhone(userPhone)); setGroups(await apicartService.getGroupsByPhone(userPhone)); setShowJoinGroupPopup(false); setCurrentItem(null); alert('تم الانضمام إلى المجموعة بنجاح!'); } catch (e) { alert(`فشل الانضمام إلى المجموعة: ${e.message || 'خطأ غير معروف'}`); }
  };
  const loadAvailableGroups = async (sku) => {
    try { const all = await apicartService.getAllGroups(); setAvailableGroups(all.filter(g => g.productsku === sku && g.condition === false && g.userlimit > (g.members?.length || 0))); } catch (e) {}
  };
  const getVATRate = (country) => ({ Oman:5, Kuwait:0, Bahrain:10, Qatar:0, UAE:5, Saudi:15 }[country] || 5);
  const getDeliveryCost = (productCountry, deliveryType) => {
    const costs = { Oman: { Office: 1, Home: 2 }, Kuwait: { Office: 1, Home: 2 }, Bahrain: { Office: 1, Home: 2 }, Qatar: { Office: 10, Home: 20 }, UAE: { Office: 10, Home: 20 }, Saudi: { Office: 10, Home: 20 } };
    const countryCosts = costs[productCountry] || costs.UAE; return deliveryType === 'Office' ? countryCosts.Office : countryCosts.Home;
  };
  const calculateDeliveryPrice = (items, deliveryType = 'Office') => {
    if (!deliveryType || !items || items.length === 0) return 0; const firstItem = items[0]; const p = products[firstItem?.productsku]; const country = p?.country || userAuth?.country || 'UAE'; return getDeliveryCost(country, deliveryType);
  };
  const calculateSubtotal = () => selectedItems.reduce((t, it) => t + Number(calculateDiscountedPrice(it.price || 0, it.discount || 0)) * it.qty, 0);
  const calculateDiscount = () => selectedItems.reduce((t, it) => t + (it.price || 0) * (it.discount || 0) / 100 * it.qty, 0);
  const calculateVAT = () => {
    const vatRate = getVATRate(userAuth?.country || 'UAE');
    const base = calculateSubtotal() + calculateDeliveryPrice(selectedItems, deliveryType);
    if (vatRate === 5) {
      return base * 0.09 * 0.05;
    }
    return base * (vatRate / 100);
  };
  const calculateTotal = () => calculateSubtotal() + calculateDeliveryPrice(selectedItems, deliveryType) + calculateVAT();
  const getGroupDetails = (item) => groups.find(g => g.productsku === item.productsku);
  const getGroupDiscount = (item) => { const g = groups.find(x => x.productsku === item.productsku && x.condition); return g ? Math.min(50, g.userlimit * 2) : 0; };
  const handleCompletePayment = async () => {
    if (!userPhone) { navigate('/alogin'); return; }
    try {
      for (const it of selectedItems) { if (it.isGroup) await apicartService.deleteGroupMember(userPhone, it.groupsku); else await apicartService.deletACartItem(userPhone, it.id); }
      const [cartData, groupData, orderData] = await Promise.all([ apicartService.getCartByPhone(userPhone), apicartService.getGroupsByPhone(userPhone), apicartService.getOrdersByPhone(userPhone) ]);
      setCartItems(cartData); setGroups(groupData); const act = [], hist = []; if (Array.isArray(orderData)) { orderData.forEach(o => (o.orders || []).forEach(it => (it.deliverconfirmed ? hist : act).push({ ...o, orders: [it] }))); }
      setOrders(act); setHistory(hist); setSelectedItems([]); setShowPayment(false); setSelectedTab('order');
    } catch { alert('فشل إكمال تنظيف الدفع.'); }
  };
  const handleStatusChange = async (orderId, status) => {
    if (!userPhone) { navigate('/alogin'); return; } if (status !== 'delivered') return;
    try {
      const payload = { deliverconfirmed: true, status: { process: true, shiped: true, waiting: false, deliverd: true } }; await apicartService.confirmDelivery(userPhone, orderId, payload);
      const move = orders.find(o => o.orders[0].id === orderId); if (move) {
        const updated = { ...move, orders: [{ ...move.orders[0], deliverconfirmed: true, status: { ...move.orders[0].status, deliverd: true } }] }; setHistory([updated, ...history]); setOrders(orders.filter(o => o.orders[0].id !== orderId));
      }
    } catch { alert('فشل تحديث حالة الطلب'); }
  };
  const handleRateProduct = async (sku, rating, comment = "") => {
    try { await apicartService.rateProduct(sku, rating, userPhone, comment); setHistory(prev => prev.map(h => ({ ...h, orders: h.orders.map(it => (it.productsku === sku ? { ...it, rating, comment } : it)) }))); } catch {}
  };
  const shareGroupUrl = (sku) => { const url = `${window.location.origin}/ar/product/${sku}`; navigator.clipboard.writeText(url); alert('تم نسخ رابط المجموعة!'); };
  const readyLabel = (ready) => ( <div className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${ready ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{ready ? 'جاهز!' : 'قيد الانتظار...'}</div> );

  return (
    <div className="flex flex-col h-[100dvh] justify-center z-50 max-w-sm mx-auto" dir="rtl" style={{ backgroundColor: theme.bg }}>
      <div className="text-white px-4 py-4 shadow-lg" style={{ backgroundColor: theme.btnBg }}>
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 hover:bg-white/20 rounded-full transition-colors"><FaArrowRight size={20} /></button>
          <div className="flex-1 text-center mr-2"><h1 className="text-2xl font-bold">سلة التسوق</h1>{userAuth && <p className="text-xs opacity-80">{userAuth.country}</p>}</div>
          <div className="w-10"></div>
        </div>
        <div className="flex justify-around mt-3 gap-1">
          {['cart', 'order', 'history'].map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className="py-1.5 px-3 rounded-lg flex items-center text-xs transition-all"
              style={selectedTab === tab ? { backgroundColor: theme.cardBg, color: theme.cardText, fontWeight: '600' } : { color: 'white', opacity: 0.8 }}
            >
              {tab === 'cart' && <FaShoppingCart className="ml-1.5 text-xs" />}{tab === 'order' && <FaBox className="ml-1.5 text-xs" />}{tab === 'history' && <FaHistory className="ml-1.5 text-xs" />}
              {tab === 'cart' ? 'السلة' : tab === 'order' ? 'الطلبات' : 'السجل'}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-3">
          {selectedTab === 'cart' && !showPayment && (
            (cartItems.length === 0 && groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); return isMember && g.condition && !isGroupExpired(g); }).length === 0) ? (
              <div className="text-center py-8">
                <FaShoppingCart className="text-gray-300 text-4xl mx-auto" />
                <h3 className="text-base font-semibold mt-3">سلة التسوق فارغة</h3>
                <p className="text-gray-500 text-sm mt-1.5">أضف بعض العناصر للبدء</p>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 overflow-y-auto pl-2" style={{ maxHeight: 'calc(100vh - 320px)' }}>
                  {groups.filter(g => { const isMember = g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)); if (!isMember) return false; if (!g.condition) return false; if (isGroupExpired(g)) return false; return !cartItems.some(i => i.productsku === g.productsku); }).map(g => {
                    const product = products[g.productsku]; const member  = g.members?.find(m => String(m.phone || m.userphone || '') === String(userPhone)); const disc    = Math.min(50, g.userlimit * 2); const gQty    = member?.qty || 0; const base    = member?.price || 0; const isSel   = selectedItems.some(s => s.groupsku === g.groupsku && s.isGroup); const total   = parseFloat(calculateDiscountedPrice(base, disc)) * gQty;
                    return (
                      <div key={g.groupsku} className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
                        <div className="flex items-start">
                          {product?.generalimages?.[0]?.img ? ( <img src={apicartService.getProductImage(g.productsku, product.generalimages[0].img)} alt={product?.atitle || 'المنتج'} className="w-20 h-20 object-cover rounded-lg ml-3" onError={(e) => { e.target.style.display='none'; e.target.nextElementSibling.style.display='flex'; }} /> ) : null}
                          <div className={`w-20 h-20 ${product?.generalimages?.[0]?.img ? 'hidden' : 'flex'} items-center justify-center bg-gray-200 rounded-lg ml-3`}><span className="text-gray-400 text-[10px]">لا توجد صورة</span></div>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center mb-1.5 p-1.5 rounded-lg transition-all ${isSel ? 'bg-green-50 border-2 border-green-400' : !g.condition ? 'bg-gray-50 border-2 border-gray-200 opacity-60' : 'bg-blue-50 border-2 border-blue-200 hover:border-blue-300'}`}>
                              <label className="flex items-center cursor-pointer w-full">
                                <input type="checkbox" checked={isSel} disabled={!g.condition} onChange={(e) => { if (e.target.checked) { if (g.condition) setSelectedItems(prev => [...prev, { ...member, productsku: g.productsku, groupsku: g.groupsku, discount: disc, isGroup: true }]); } else { setSelectedItems(prev => prev.filter(s => s.groupsku !== g.groupsku)); } }} className="ml-2 w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-1 focus:ring-green-500 disabled:opacity-50" />
                                <span className={`text-xs font-medium flex items-center ${isSel ? 'text-green-700' : !g.condition ? 'text-gray-500' : 'text-blue-700'}`}>
                                  {isSel ? (<><FaCheckCircle className="ml-1.5 text-green-600 text-xs" />محدد</>) : !g.condition ? (<>⏳ قيد الانتظار...</>) : (<>☑️ تحديد</>)}
                                </span>
                              </label>
                            </div>
                            <div className="flex justify-between items-start"><h3 className="font-semibold text-gray-800 text-sm truncate pl-2">{product?.atitle || 'المنتج'}</h3><button onClick={() => handleRemoveGroupMember(g.groupsku)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><FaTimes className="text-sm" /></button></div>
                            <div className="mt-1 text-xs text-gray-600">{member?.variables?.map((v, i) => <span key={i} className="ml-1.5">{v.aname}: {v.avalue}</span>)}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button onClick={() => handleGroupQuantityChange(g.groupsku, -1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7" disabled={!g.condition}><FaMinus size={10} /></button>
                                <span className="px-2 py-1 text-xs">{gQty}</span>
                                <button onClick={() => handleGroupQuantityChange(g.groupsku, 1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7" disabled={!g.condition}><FaPlus size={10} /></button>
                              </div>
                              <div className="text-left"><div className={`text-xs ${disc > 0 ? 'text-purple-600 font-semibold' : 'font-semibold'}`}>{currencyCountry(disc > 0 ? total : base * gQty, userAuth?.country || 'UAE')}</div></div>
                            </div>
                            {!isGroupExpired(g) ? (
                              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 text-xs shadow-sm">
                                <div className="flex items-center justify-between mb-1"><div className="font-semibold text-purple-800 flex items-center text-xs">👥 {g.groupname}</div>{readyLabel(g.condition)}</div>
                                <div className="flex items-center justify-between mb-1"><div className="text-purple-600 text-[10px]">{g.condition ? 'جاهز للدفع!' : `${g.members?.length || 0}/${g.userlimit} منضم`}</div><div className="text-purple-700 font-bold text-xs">{g.userlimit * 2}% خصم</div></div>
                                {!g.condition && countdownTimes[g.groupsku || g.id] && ( <div className="text-purple-600 text-[10px] mb-1">⏰ الوقت المتبقي: {countdownTimes[g.groupsku || g.id]}</div> )}
                                {!g.condition && ( <button onClick={() => shareGroupUrl(g.productsku)} className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white text-[10px] py-1.5 px-2 rounded-lg transition-all">📤 مشاركة رابط المجموعة</button> )}
                              </div>
                            ) : ( <div className="mt-2 bg-gray-100 border border-gray-200 rounded-lg p-2 text-xs opacity-60 text-center">⏰ انتهت صلاحية هذه المجموعة</div> )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {cartItems.map(item => {
                    const product = products[item.productsku]; const g = getGroupDetails(item); const showGroupInfo = g && g.condition && !isGroupExpired(g); const discount = showGroupInfo ? getGroupDiscount(item) : 0; const discounted = parseFloat(calculateDiscountedPrice(item.price || 0, discount)); const isSel = selectedItems.some(s => s.id === item.id && !s.isGroup);
                    return (
                      <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-3 mb-3 shadow-sm">
                        <div className="flex items-start">
                          {product?.generalimages?.[0]?.img ? ( <img src={apicartService.getProductImage(item.productsku, product.generalimages[0].img)} alt={product?.atitle || 'المنتج'} className="w-20 h-20 object-cover rounded-lg ml-3" onError={(e) => { e.target.style.display='none';e.target.nextElementSibling.style.display='flex';}} /> ) : null}
                          <div className={`w-20 h-20 ${product?.generalimages?.[0]?.img?'hidden':'flex'} items-center justify-center bg-gray-200 rounded-lg ml-3`}><span className="text-gray-400 text-[10px]">لا توجد صورة</span></div>
                          <div className="flex-1 min-w-0">
                            <div className={`flex items-center mb-1.5 p-1.5 rounded-lg transition-all ${isSel ? 'bg-green-50 border-2 border-green-400' : 'bg-blue-50 border-2 border-blue-200 hover:border-blue-300'}`}>
                              <label className="flex items-center cursor-pointer w-full">
                                <input type="checkbox" checked={isSel} onChange={(e) => { if (e.target.checked) { setSelectedItems(prev => [...prev, { ...item, discount }]); } else { setSelectedItems(prev => prev.filter(s => s.id !== item.id)); } }} className="ml-2 w-4 h-4 rounded border-2 border-gray-300 text-green-600 focus:ring-1 focus:ring-green-500" />
                                <span className={`text-xs font-medium flex items-center ${isSel ? 'text-green-700' : 'text-blue-700'}`}>{isSel ? (<><FaCheckCircle className="ml-1.5 text-green-600 text-xs" />محدد</>) : <>☑️ تحديد</>}</span>
                              </label>
                            </div>
                            <div className="flex justify-between items-start"><h3 className="font-semibold text-gray-800 text-sm truncate pl-2">{product?.atitle || 'المنتج'}</h3><button onClick={() => handleRemoveItem(item)} className="text-gray-400 hover:text-red-500 flex-shrink-0"><FaTimes className="text-sm" /></button></div>
                            <div className="mt-1 text-xs text-gray-600">{item.variables?.map((v, i) => <span key={i} className="ml-1.5">{v.aname}: {v.avalue}</span>)}</div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center border border-gray-300 rounded">
                                <button onClick={() => handleQuantityChange(item, -1)} className="p-1 text-gray-600 hover:bg-gray-100 w-7"><FaMinus size={10} /></button>
                                <span className="px-2 py-1 text-xs">{item.qty}</span>
                                <button onClick={(e) => { e?.stopPropagation?.(); handleIncreasACartQty(item); }} disabled={(() => { const mx = getKnownMaxQtySync(item); const cur = Math.max(1, Number(item?.qty) || 1); return (mx !== null && mx > 0 && cur >= mx); })()} className="p-1 text-gray-600 hover:bg-gray-100 w-7 disabled:opacity-50 disabled:cursor-not-allowed"><FaPlus size={10} /></button>
                              </div>
                              <div className="text-left">{discount > 0 ? <div className="text-purple-600 font-semibold text-xs">{currencyCountry(discounted, userAuth?.country || 'UAE')}</div> : <div className="font-semibold text-xs">{currencyCountry(item.price || 0, userAuth?.country || 'UAE')}</div>}</div>
                            </div>
                            {showGroupInfo && (
                              <div className="mt-2 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 text-xs shadow-sm">
                                <div className="flex items-center justify-between mb-1"><div className="font-semibold text-purple-800 flex items-center text-xs">👥 {g.groupname}</div>{readyLabel(g.condition)}</div>
                                <div className="flex items-center justify-between mb-1"><div className="text-purple-600 text-[10px]">جاهز للدفع!</div><div className="text-purple-700 font-bold text-xs">{g.userlimit * 2}% خصم</div></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="sticky bottom-0 mt-3 p-3 bg-white border-t-2 border-gray-200 shadow-lg">
                  {selectedItems.length > 0 ? (<>
                      <div className="flex justify-between items-center mb-1.5"><span className="font-semibold text-sm">المجموع ({selectedItems.length} عنصر):</span><span className="font-bold text-sm">{currencyCountry(calculateSubtotal(), userAuth?.country || 'UAE')}</span></div>
                      {calculateDiscount() > 0 && ( <div className="flex justify-between items-center mb-1.5 text-green-600"><span className="text-xs">الخصم:</span><span className="text-xs font-semibold">-{currencyCountry(calculateDiscount(), userAuth?.country || 'UAE')}</span></div> )}
                      <div className="mb-2">
                        <div className="flex justify-between items-center mb-1.5"><span className="text-xs font-semibold text-gray-700">نوع التسليم:</span></div>
                        <div className="flex gap-1.5 mb-1.5">
                          <button
                            onClick={() => setDeliveryType('Office')}
                            className="flex-1 py-1.5 px-2 rounded-lg border-2 transition-all text-xs"
                            style={deliveryType === 'Office' ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText, fontWeight: '600' } : { borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#4b5563' }}
                          >
                            المكتب
                          </button>
                          <button
                            onClick={() => setDeliveryType('Home')}
                            className="flex-1 py-1.5 px-2 rounded-lg border-2 transition-all text-xs"
                            style={deliveryType === 'Home' ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText, fontWeight: '600' } : { borderColor: '#d1d5db', backgroundColor: '#ffffff', color: '#4b5563' }}
                          >
                            المنزل
                          </button>
                        </div>
                        <div className="flex justify-between items-center"><span className="text-xs text-gray-600">تكلفة التسليم:</span><span className="text-xs font-semibold">{currencyCountry(calculateDeliveryPrice(selectedItems, deliveryType), userAuth?.country || 'UAE')}</span></div>
                      </div>
                      <div className="flex justify-between items-center mb-1.5"><span className="text-xs text-gray-600">الضريبة ({getVATRate(userAuth?.country || 'UAE')}%):</span><span className="text-xs">{currencyCountry(calculateVAT(), userAuth?.country || 'UAE')}</span></div>
                      <div className="flex justify-between items-center mb-3 font-bold text-sm border-t pt-1.5"><span>المجموع الكلي:</span><span className="text-purple-600">{currencyCountry(calculateTotal(), userAuth?.country || 'UAE')}</span></div>
                    </>) : ( <div className="text-center py-3"><p className="text-gray-500 text-xs">حدد العناصر للدفع</p></div> )}
                  <button onClick={() => (selectedItems.length ? setShowPayment(true) : alert('الرجاء تحديد العناصر للدفع'))} disabled={selectedItems.length === 0} className="w-full bg-purple-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed">
                    المتابعة للدفع {selectedItems.length > 0 ? `(${selectedItems.length})` : ''}
                  </button>
                </div>
              </div>
            )
          )}
          {showPayment && ( <Popupshow onClose={() => setShowPayment(false)}><APaymentForm total={calculateTotal()} selectedItems={selectedItems} userAuth={userAuth} deliveryType={deliveryType} deliverydetails={deliverydetails} products={products} onRefreshDeliveryDetails={async () => { const user = await apicartService.getUserByPhone(userPhone); setDeliverydetails(user.deliverydetails || []); }} onComplete={(success) => (success ? handleCompletePayment() : setShowPayment(false))} /></Popupshow> )}
          {selectedTab === 'order' && !showPayment && (
            <div className="h-full flex flex-col">
              {orders.length === 0 ? ( <div className="text-center py-8"><FaBox className="text-gray-300 text-4xl mx-auto" /><h3 className="text-base font-semibold mt-3">لا توجد طلبات نشطة</h3><p className="text-gray-500 text-sm mt-1.5">ستظهر طلباتك المكتملة هنا</p></div> ) : (
                <div className="flex-1 overflow-y-auto pl-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                  {orders.map(o => { const sku = o.orders?.[0]?.productsku; if (!sku) return null; const product = products[sku]; if (!product) return null; return ( <AOrderItem key={o.orders[0].id} order={{ ...o.orders[0], productDetails: product, ordersku: o.ordersku, date: o.date }} onStatusChange={handleStatusChange} onRate={handleRateProduct} userCountry={userAuth?.country} userAuth={userAuth} theme={theme} /> ); })}
                </div>
              )}
            </div>
          )}
          {selectedTab === 'history' && !showPayment && (
            <div className="h-full flex flex-col">
              {history.length === 0 ? ( <div className="text-center py-8"><FaHistory className="text-gray-300 text-4xl mx-auto" /><h3 className="text-base font-semibold mt-3">لا يوجد سجل طلبات</h3><p className="text-gray-500 text-sm mt-1.5">ستظهر طلباتك المكتملة هنا</p></div> ) : (
                <div className="flex-1 overflow-y-auto pl-2" style={{ maxHeight: 'calc(100vh - 250px)' }}>
                  {history.map(h => { const p = products[h.orders[0].productsku]; return ( <AOrderItem key={h.orders[0].id} order={{ ...h.orders[0], productDetails: p, ordersku: h.ordersku, date: h.date }} userCountry={userAuth?.country} isHistory userAuth={userAuth} onStatusChange={() => {}} onRate={() => {}} /> ); })}
                </div>
              )}
            </div>
          )}
        </div>
        {showGroupPopup && currentItem && ( <Popupshow onClose={() => setShowGroupPopup(false)}>
            <div className="flex justify-between items-center mb-3"><h2 className="text-base font-bold text-gray-800">إنشاء مجموعة</h2></div>
            <div className="space-y-3">
              <div><label className="block text-xs font-medium text-gray-700 mb-1">اسم المجموعة</label><input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="مجموعة تخفيضات الصيف" className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
              <div><label className="block text-xs font-medium text-gray-700 mb-1">عدد المشاركين</label><div className="flex items-center"><input type="range" min="2" max="25" value={groupLimit} onChange={(e) => setGroupLimit(parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" /><span className="mr-3 w-8 text-center font-bold text-purple-700 text-sm">{groupLimit}</span></div><p className="text-xs text-gray-500 mt-1">الخصم: {Math.min(50, groupLimit * 2)}% (2% لكل مشارك، الحد الأقصى 50%)</p></div>
              <div><label className="block text-sm font-bold text-purple-600 text-center m-3">اختر الموعد النهائي</label><div className="flex space-x-2"><select value={selectedTime.hours} onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })} className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{Array.from({ length: 24 }, (_, i) => i).map(h => ( <option key={h} value={h}>{String(h).padStart(2, '0')} ساعة</option> ))}</select><span className="self-center text-sm">:</span><select value={selectedTime.minites} onChange={(e) => setSelectedTime({ ...selectedTime, minites: parseInt(e.target.value) })} className="flex-1 p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{[0, 15, 30, 45, 59].map(m => ( <option key={m} value={m}>{String(m).padStart(2, '0')} دقيقة</option> ))}</select></div></div>
              <div className="mt-4 grid grid-cols-2 gap-3"><button onClick={() => setShowGroupPopup(false)} className="py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-300 transition">إلغاء</button><button onClick={handleCreateGroup} className="py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium text-sm hover:from-purple-700 hover:to-indigo-800 transition shadow-md">إنشاء مجموعة</button></div>
            </div>
          </Popupshow> )}
        {showJoinGroupPopup && currentItem && ( <Popupshow onClose={() => setShowJoinGroupPopup(false)}>
            <div className="flex justify-between items-center mb-4"><h2 className="text-base font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">👥 الانضمام إلى مجموعة</h2></div>
            {availableGroups.length > 0 ? ( <div className="space-y-3">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-2 mb-3"><p className="text-xs text-purple-700 font-medium">💰 وفر حتى {Math.min(50, availableGroups[0]?.userlimit * 2 || 0)}% بالانضمام إلى مجموعة!</p></div>
                <div className="space-y-2 max-h-96 overflow-y-auto pl-2">
                  {availableGroups.sort((a, b) => (a.groupsku || '').localeCompare(b.groupsku || '')).map(g => {
                    const count = g.members?.length || 0; const disc = Math.min(50, g.userlimit * 2); const nameShort = (g.groupname || 'المجموعة').split(' ').slice(0, 2).join(' ') + ((g.groupname || '').split(' ').length > 2 ? '...' : ''); let timeLeft = '—';
                    if (g.date && g.hour !== undefined && (g.minute !== undefined || g.minite !== undefined)) { const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0); const diff = end.getTime() - Date.now(); timeLeft = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : 'انتهت'; }
                    return (
                      <div key={g.groupsku} className="bg-white border-2 border-purple-200 rounded-xl p-3 shadow-md hover:shadow-lg transition-all hover:border-purple-400">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1"><h3 className="font-bold text-gray-800 mb-1 text-sm">👥 {nameShort}</h3><div className="flex items-center gap-2 text-xs"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{disc}% خصم</span><span className="text-gray-600">{count}/{g.userlimit} عضو</span></div></div>
                          <div className="text-right"><div className="text-[10px] text-gray-500 mb-0.5">الوقت المتبقي</div><div className={`text-xs font-bold ${timeLeft === 'انتهت' ? 'text-red-500' : 'text-purple-600'}`}>{timeLeft}</div></div>
                        </div>
                        <button onClick={() => handleJoinGroup(g.groupsku)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 rounded-lg font-semibold text-xs hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">🚀 انضم الآن ووفر {disc}%</button>
                      </div>
                    );
                  })}
                </div>
              </div> ) : ( <div className="text-center py-8"><div className="text-5xl mb-3">😔</div><p className="text-gray-600 font-medium text-sm">لا توجد مجموعات متاحة لهذا المنتج.</p><p className="text-xs text-gray-500 mt-1.5">أنشئ مجموعتك الخاصة للبدء!</p></div> )}
            <div className="mt-4"><button onClick={() => setShowJoinGroupPopup(false)} className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg font-medium text-sm hover:bg-gray-300 transition">إغلاق</button></div>
          </Popupshow> )}
      </div>
    </div>
  );
};
const normalizePhoneForLookup = (phone) => {
  if (!phone && phone !== 0) return null;
  const digits = String(phone).replace(/\D/g, "");
  return digits ? digits : null;
};
const candidatePhonesForUserLookup = (phone) => {
  const digits = normalizePhoneForLookup(phone);
  if (!digits) return [];
  const out = [digits];
  const codes = ["973", "965", "968", "974", "966", "971"];
  for (const c of codes) {
    if (digits.startsWith(c) && digits.length > c.length + 6) {
      out.push(digits.slice(c.length));
      break;
    }
  }
  if (digits.length > 8) out.push(digits.slice(-8));
  return Array.from(new Set(out)).filter(Boolean);
};
const pickUserDisplayName = (u) => {
  if (!u) return null;
  const direct = u.name || u.username || u.userName || u.fullName || u.fullname || u.displayName || u.displayname || null;
  const first = (u.firstName || u.firstname || "").toString().trim();
  const last = (u.lastName || u.lastname || "").toString().trim();
  const joined = [first, last].filter(Boolean).join(" ").trim();
  const out = direct || joined || null;
  if (!out) return null;
  const trimmed = String(out).trim();
  return trimmed ? trimmed : null;
};
const apiService = {
  getProductBySku: async (productSku) => {
    try {
      const r = await fetch(`${API_OPEN_BASE_URL}/t3wn/products/${productSku}`);
      if (!r.ok) throw new Error('المنتج غير موجود');
      return await r.json();
    } catch {
      return null;
    }
  },
  getProductImage: (productSku, imageName) => `${API_OPEN_BASE_URL}/t3wn/products/${productSku}/${imageName}`,
  getUserByPhone: async (phone) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/users/${phone}`);
    if (!r.ok) throw new Error('المستخدم غير موجود');
    return r.json();
  },
  getCartByPhone: async (phone) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`);
    if (!r.ok) throw new Error('عربة التسوق غير موجودة');
    return r.json();
  },
  addToCart: async (phone, cartItem) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/cart/${phone}`, {
      method: 'POST',
      body: JSON.stringify(cartItem)
    });
    if (!r.ok) throw new Error('فشل إضافة المنتج إلى عربة التسوق');
    return r.json();
  },
  getFavoritesByPhone: async (phone) => {
    if (!phone) return [];
    const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}`);
    if (!r.ok) return [];
    return r.json();
  },
  addToFavorites: async (phone, favoriteItem) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}`, {
      method: 'POST',
      body: JSON.stringify(favoriteItem)
    });
    if (!r.ok) throw new Error('فشل إضافة المنتج إلى المفضلة');
    return r.json();
  },
  removeFromFavorites: async (phone, id) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/favorites/${phone}/${id}`, {
      method: 'DELETE'
    });
    if (!r.ok) throw new Error('فشل إزالة المنتج من المفضلة');
    return r.ok;
  },
  getAllGroups: async () => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/group`);
    if (!r.ok) throw new Error('المجموعات غير موجودة');
    return r.json();
  },
  getVideosByPhone: async (phone) => {
    if (!phone) return [];
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/${phone}`);
    if (!r.ok) return [];
    return r.json();
  },
  getVideoBySku: async (videoSku) => {
    const r = await fetch(`${API_BASE_URL}/t3wn/shorts/video/${videoSku}`);
    if (!r.ok) throw new Error('الفيديو غير موجود');
    return r.blob();
  },
  getVideoByPhoneAndSku: async (ownerPhone, videoSku) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/${ownerPhone}/${videoSku}`);
    if (!r.ok) throw new Error('الفيديو غير موجود');
    return r.json();
  },
  incrementVideoViews: async (videoSku) => {
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/veiws/${videoSku}`, {
      method: 'POST'
    });
    if (!r.ok) throw new Error('فشل زيادة المشاهدات');
    return r.ok;
  },
  likeVideo: async (ownerPhone, videoSku) => {
    const userPhone = getUserPhone();
    if (!userPhone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/${ownerPhone}/likes/${videoSku}`, {
      method: 'POST'
    });
    if (!r.ok) throw new Error('فشل الإعجاب بالفيديو');
    return r.ok;
  },
  dislikeVideo: async (ownerPhone, videoSku) => {
    const userPhone = getUserPhone();
    if (!userPhone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/${ownerPhone}/dislikes/${videoSku}`, {
      method: 'POST'
    });
    if (!r.ok) throw new Error('فشل عدم الإعجاب بالفيديو');
    return r.ok;
  },
  addComment: async (ownerPhone, videoSku, comment, commenterPhone) => {
    const userPhone = commenterPhone || getUserPhone();
    if (!userPhone) throw new Error('لم يتم المصادقة');
    const cleanUser = normalizePhoneForLookup(userPhone) || String(userPhone);
    const encoded = encodeURIComponent(String(comment));
    const r = await apiCall(`${API_BASE_URL}/t3wn/shorts/${cleanUser}/comments/${videoSku}/comment/${encoded}`, {
      method: 'POST'
    });
    if (!r.ok) throw new Error('فشل إضافة التعليق');
    return true;
  },
  getProfileByPhone: async (phone) => {
    if (!phone) throw new Error('لم يتم المصادقة');
    const r = await apiCall(`${API_BASE_URL}/t3wn/profile/${phone}`);
    if (!r.ok) throw new Error('الملف الشخصي غير موجود');
    return r.json();
  },
  getUserByPhoneForReview: async (phone) => {
    if (!phone) return null;
    try {
      const r = await apiCall(`${API_BASE_URL}/t3wn/users/${phone}`);
      return r.ok ? await r.json() : null;
    } catch {
      return null;
    }
  }
};
const SimpleImage = ({ productSku, imageName, alt, className, onError, onLoad, onClick }) => {
  const imageUrl = apiService.getProductImage(productSku, imageName);
  return (
    <img
      src={imageUrl}
      alt={alt}
      className={className}
      onClick={onClick}
      onError={e => {
        e.target.style.display = 'none';
        if (onError) onError(e);
      }}
      onLoad={() => {
        if (onLoad) onLoad();
      }}
    />
  );
};
const ReviewsTab = ({ product }) => {
  const [userNames, setUserNames] = useState({});
  const userNameCacheRef = useRef({});
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const ratings = product?.ratings || [];
      const unique = Array.from(new Set(ratings.map(r =>
        normalizePhoneForLookup(r?.phone || r?.userphone || r?.userPhone)
      ).filter(Boolean)));
      const next = {};
      await Promise.all(unique.map(async (p) => {
        if (userNameCacheRef.current[p]) {
          next[p] = userNameCacheRef.current[p];
          return;
        }
        try {
          let resolvedName = null;
          const candidates = candidatePhonesForUserLookup(p);
          for (const cand of candidates) {
            const u = await apiService.getUserByPhoneForReview(String(cand));
            const nm = pickUserDisplayName(u);
            if (nm) {
              resolvedName = nm;
              break;
            }
          }
          const name = resolvedName || "مستخدم";
          userNameCacheRef.current[p] = name;
          next[p] = name;
        } catch {
          const fallback = "مستخدم";
          userNameCacheRef.current[p] = fallback;
          next[p] = fallback;
        }
      }));
      if (!cancelled) setUserNames(prev => ({ ...prev, ...next }));
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [product?.ratings]);

  return (
    <div>
      {product.ratings && product.ratings.length > 0 ? (
        product.ratings.map(review => {
          const p = normalizePhoneForLookup(review?.phone || review?.userphone || review?.userPhone);
          return (
            <div key={review.id} className="mb-4 p-3 border rounded-md border-gray-200 bg-gray-50">
              <p className="font-semibold">{(p && userNames[p]) || "مستخدم"}</p>
              <RatingStars score={review.score} />
              <p className="text-gray-700 mt-1">{review.comment}</p>
            </div>
          );
        })
      ) : (
        <p className="text-center py-8 text-gray-500">لا توجد مراجعات بعد.</p>
      )}
    </div>
  );
};
const ReviewsPopup = ({ product, onClose, isArabic = false }) => {
  const [userNames, setUserNames] = useState({});
  const [storeProfile, setStoreProfile] = useState(null);
  const userNameCacheRef = useRef({});
  const theme = {
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const ratings = product?.ratings || [];
      const unique = Array.from(new Set(ratings.map(r =>
        normalizePhoneForLookup(r?.phone || r?.userphone || r?.userPhone)
      ).filter(Boolean)));
      const next = {};
      await Promise.all(unique.map(async (p) => {
        if (userNameCacheRef.current[p]) {
          next[p] = userNameCacheRef.current[p];
          return;
        }
        try {
          let resolvedName = null;
          const candidates = candidatePhonesForUserLookup(p);
          for (const cand of candidates) {
            const u = await apiService.getUserByPhoneForReview(String(cand));
            const nm = pickUserDisplayName(u);
            if (nm) {
              resolvedName = nm;
              break;
            }
          }
          const name = resolvedName || (isArabic ? "مستخدم" : "User");
          userNameCacheRef.current[p] = name;
          next[p] = name;
        } catch {
          const fallback = isArabic ? "مستخدم" : "User";
          userNameCacheRef.current[p] = fallback;
          next[p] = fallback;
        }
      }));
      if (!cancelled) setUserNames(prev => ({ ...prev, ...next }));
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [product?.ratings, isArabic]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose} dir={isArabic ? "rtl" : "ltr"}>
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50 ${isArabic ? 'flex-row-reverse' : ''}`}>
          <div>
            <h2 className={`text-xl font-bold text-gray-900 ${isArabic ? 'text-right' : 'text-left'}`}>
              {isArabic ? (product?.atitle || 'مراجعات المنتج') : (product?.title || product?.atitle || 'Product Reviews')}
            </h2>
            <div className={`flex items-center gap-2 mt-1 ${isArabic ? 'flex-row-reverse' : ''}`}>
              <RatingStars score={getAverageRating(product?.ratings)} />
              <span className="text-sm text-gray-600">
                ({product?.ratings?.length || 0} {isArabic ? 'مراجعة' : 'reviews'})
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition">
            <FaTimes size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {product?.ratings && product.ratings.length > 0 ? (
            <div className="space-y-4">
              {product.ratings.map(review => {
                const p = normalizePhoneForLookup(review?.phone || review?.userphone || review?.userPhone);
                return (
                  <div key={review.id} className={`p-4 border rounded-lg border-gray-200 bg-gray-50 hover:bg-gray-100 transition ${isArabic ? 'text-right' : 'text-left'}`}>
                    <div className={`flex items-center justify-between mb-2 ${isArabic ? 'flex-row-reverse' : ''}`}>
                      <p className="font-semibold text-gray-900">{(p && userNames[p]) || (isArabic ? "مستخدم" : "User")}</p>
                      <RatingStars score={review.score} />
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 mt-2 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⭐</div>
              <p className="text-gray-500 text-lg">{isArabic ? 'لا توجد مراجعات بعد.' : 'No reviews yet.'}</p>
              <p className="text-gray-400 text-sm mt-2">{isArabic ? 'كن أول من يراجع هذا المنتج!' : 'Be the first to review this product!'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export const AProduct = () => {
  const { sku, afflitename: affiliateParam } = useParams();
  const [product, setProduct] = useState(null);
  const normalizeAffiliateName = (name) => {
    if (!name) return null;
    const trimmed = name.trim().toLowerCase();
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  };
  const afflitename = affiliateParam ? normalizeAffiliateName(affiliateParam) : null;
  const [selectedTypeOptions, setSelectedTypeOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [userCountry, setUserCountry] = useState('Oman');
  const [groups, setGroups] = useState([]);
  const [countdownTimes, setCountDownTimes] = useState({});
  const [popupCountdownTimes, setPopupCountdownTimes] = useState({});
  const [joinGroupCountdownTimes, setJoinGroupCountdownTimes] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inventoryKey, setInventoryKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [hasReviews, setHasReviews] = useState(false);
  const [hasShorts, setHasShorts] = useState(false);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupLimit, setGroupLimit] = useState(3);
  const [selectedTime, setSelectedTime] = useState({ hours: 18, minites: 0 });
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const userPhone = getUserPhone();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const getOrderCount = () => {
    const count = orders.reduce((total, order) => {
      const orderItems = order.orders || [];
      return total + orderItems.filter(item => item.productsku === sku).reduce((sum, item) => sum + (item.qty || 0), 0);
    }, 0);
    return count;
  };
  const formatOrderDisplay = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const pd = await apiService.getProductBySku(sku);
        setProduct(pd);
        setHasReviews(pd.ratings && pd.ratings.length > 0);
        const init = {};
        pd.variables?.forEach(v => {
          if (v.options && v.options.length > 0) init[v.name] = v.options[0].value;
        });
        setSelectedTypeOptions(init);
        if (userPhone) {
          try {
            const u = await apiService.getUserByPhone(userPhone);
            if (u?.country) setUserCountry(u.country);
          } catch {}
          try {
            const cart = await apiService.getCartByPhone(userPhone);
            setCartCount(cart.reduce((s, i) => s + i.qty, 0));
          } catch {}
          try {
            const favs = await apiService.getFavoritesByPhone(userPhone);
            setFavorites(favs.map(f => f.productsku));
          } catch {}
        } else {
          setUserCountry('Oman');
        }
        try {
          const gs = await apiService.getAllGroups();
          setGroups(gs.filter(g => (g.productSku === sku || g.productsku === sku)));
          await loadUserGroups(sku);
        } catch {}
        try {
          const vids = await apiService.getVideosByPhone(String(pd.phone));
          setHasShorts(vids && vids.length > 0);
        } catch {}
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [sku, userPhone]);
  useEffect(() => {
    const id = setInterval(() => {
      const next = {};
      groups.forEach(g => {
        const end = new Date(g.date);
        end.setHours(g.hour || 0, g.minute || 0, g.second || 0);
        const now = new Date();
        const left = end.getTime() - now.getTime();
        if (left > 0) {
          const h = Math.floor((left / (1000 * 60 * 60)) % 24);
          const m = Math.floor((left / 1000 / 60) % 60);
          const s = Math.floor((left / 1000) % 60);
          next[g.groupSku] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else {
          next[g.groupSku] = "منتهي";
        }
      });
      setCountDownTimes(next);
    }, 1000);
    return () => clearInterval(id);
  }, [groups]);
  useEffect(() => {
    if (!userGroups.length || !showAddProductPopup) return;
    const t = setInterval(() => {
      const next = {};
      userGroups.forEach(g => {
        if (!g.date || g.hour === undefined) return;
        const base = new Date(g.date);
        const minute = g.minute ?? g.minite ?? 0;
        const end = new Date(base);
        end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now();
        const key = g.groupsku || g.id;
        next[key] = diff > 0 ?
          `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` :
          "منتهي";
      });
      setPopupCountdownTimes(next);
    }, 1000);
    return () => clearInterval(t);
  }, [userGroups, showAddProductPopup]);
  useEffect(() => {
    if (!availableGroups.length || !showJoinGroupPopup) return;
    const t = setInterval(() => {
      const next = {};
      availableGroups.forEach(g => {
        if (!g.date || g.hour === undefined) return;
        const base = new Date(g.date);
        const minute = g.minute ?? g.minite ?? 0;
        const end = new Date(base);
        end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now();
        const key = g.groupsku || g.id;
        next[key] = diff > 0 ?
          `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` :
          "منتهي";
      });
      setJoinGroupCountdownTimes(next);
    }, 1000);
    return () => clearInterval(t);
  }, [availableGroups, showJoinGroupPopup]);
  const handleTypeChange = (typename, value) => {
    setSelectedTypeOptions(p => ({ ...p, [typename]: value }));
    setInventoryKey(k => k + 1);
  };
  const handleQuantityChange = (d) => {
    setQuantity(prev => {
      const n = prev + d;
      if (n < 1) return 1;
      if (n > inventory) return inventory;
      return n;
    });
  };
  const handleAddToCart = async () => {
    if (!product) return;
    if (!userPhone) {
      navigate('/alogin');
      return;
    }
    try {
      const vars = Object.keys(selectedTypeOptions).map(name => {
        const variable = product.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
        return {
          id: option?.id || null,
          name,
          value: selectedTypeOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || selectedTypeOptions[name]
        };
      });
      const cartItem = { productsku: product.productSku, price: product.price, qty: quantity, variables: vars };
      if (afflitename) {
        cartItem.affliate = afflitename;
      }
      await apiService.addToCart(userPhone, cartItem);
      const cart = await apiService.getCartByPhone(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowAddProductPopup(false);
      showToast('تمت إضافة المنتج إلى عربة التسوق بنجاح!', 'success');
    } catch (e) {
      if (e.message === 'لم يتم المصادقة') {
        navigate('/alogin');
      } else {
        showToast('فشل إضافة المنتج إلى عربة التسوق', 'error');
      }
    }
  };
  const handleAddFavorite = async () => {
    if (!product) return;
    if (!userPhone) {
      navigate('/alogin');
      return;
    }
    try {
      const isFavorite = favorites.includes(product.productSku);
      if (isFavorite) {
        const favId = (await apiService.getFavoritesByPhone(userPhone)).find(f => f.productsku === product.productSku)?.id;
        if (favId) {
          await apiService.removeFromFavorites(userPhone, favId);
          setFavorites(favorites.filter(f => f !== product.productSku));
          alert('تمت إزالة المنتج من المفضلة!');
        }
      } else {
        await apiService.addToFavorites(userPhone, { productsku: product.productSku });
        setFavorites([...favorites, product.productSku]);
        alert('تمت إضافة المنتج إلى المفضلة!');
      }
    } catch (e) {
      if (e.message === 'لم يتم المصادقة') {
        navigate('/alogin');
      } else {
        alert('فشل تحديث المفضلة');
      }
    }
  };
  const handleImageSelect = i => setCurrentImageIndex(i);
  const getCurrentImage = () => {
    const imgs = product.generalImages || product.generalimages || [];
    return imgs[currentImageIndex] || imgs[0];
  };
  const handleJoinGroup = async (groupSku) => {
    if (!userPhone) {
      navigate('/alogin');
      return;
    }
    try {
      const vars = Object.keys(selectedTypeOptions).map(name => {
        const variable = product.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
        return {
          id: option?.id,
          name,
          value: selectedTypeOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || selectedTypeOptions[name]
        };
      });
      let cartItemId = null;
      try {
        const cartItem = { productsku: product.productSku, price: product.price, qty: quantity, variables: vars };
        if (afflitename) {
          cartItem.affliate = afflitename;
        }
        await apiService.addToCart(userPhone, cartItem);
        const cart = await apiService.getCartByPhone(userPhone);
        const newItem = cart.find(item => item.productsku === product.productSku && item.qty === quantity && item.price === product.price);
        if (newItem) cartItemId = newItem.id;
      } catch (e) {
        alert('فشل إضافة المنتج إلى عربة التسوق');
        return;
      }
      const memberData = { price: product.price, qty: quantity, variables: vars.map(v => ({ name: v.name, value: v.value, aname: v.aname, avalue: v.avalue })) };
      if (afflitename) {
        memberData.affliate = afflitename;
      }
      await apicartService.joinGroup(userPhone, groupSku, memberData);
      if (cartItemId) {
        await apicartService.deleteCartItem(userPhone, cartItemId).catch(() => {});
      }
      const cart = await apiService.getCartByPhone(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowJoinGroupPopup(false);
      setShowAddProductPopup(false);
      await loadUserGroups(sku);
      const gs = await apiService.getAllGroups();
      setGroups(gs.filter(g => (g.productSku === sku || g.productsku === sku)));
      alert('تم الانضمام إلى المجموعة بنجاح!');
    } catch (e) {
      if (e.message === 'لم يتم المصادقة') {
        navigate('/alogin');
      } else {
        alert('فشل الانضمام إلى المجموعة');
      }
    }
  };
  const loadAvailableGroups = async (sku) => {
    try {
      const all = await apiService.getAllGroups();
      setAvailableGroups(all.filter(g =>
        (g.productSku === sku || g.productsku === sku) &&
        g.condition === false &&
        g.userlimit > (g.members?.length || 0)
      ));
    } catch (e) {}
  };
  const loadUserGroups = async (sku) => {
    try {
      const all = await apiService.getAllGroups();
      const userGroupsList = all.filter(g =>
        (g.productSku === sku || g.productsku === sku) &&
        g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone))
      );
      setUserGroups(userGroupsList);
    } catch (e) {}
  };
  const handleCreateGroup = async () => {
    if (!userPhone) {
      navigate('/alogin');
      return;
    }
    if (!groupName.trim()) return alert('الرجاء إدخال اسم المجموعة');
    if (groupLimit < 2 || groupLimit > 25) return alert('يجب أن يكون عدد المشاركين بين 2 و 25');
    if (!product?.productSku || !product?.price || !quantity) return alert('معلومات المنتج ناقصة');
    const vars = Object.keys(selectedTypeOptions).map(name => {
      const variable = product.variables.find(v => v.name === name);
      const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
      return {
        name,
        value: selectedTypeOptions[name],
        aname: variable?.aname || name,
        avalue: option?.avalue || selectedTypeOptions[name]
      };
    });
    const payload = {
      productsku: product.productSku,
      groupname: groupName,
      userlimit: groupLimit,
      hour: selectedTime.hours || 0,
      minite: selectedTime.minites || 0,
      members: [{ price: product.price, qty: quantity, variables: vars.map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) }]
    };
    if (afflitename) {
      payload.affliate = afflitename;
    }
    try {
      await apicartService.createGroup(userPhone, payload);
      setShowGroupPopup(false);
      setGroupName('');
      setGroupLimit(3);
      setSelectedTime({ hours: 18, minites: 0 });
      await loadUserGroups(product.productSku);
      alert('تم إنشاء المجموعة بنجاح!');
    } catch (e) {
      alert(`فشل إنشاء المجموعة: ${e.message || 'خطأ غير معروف'}`);
    }
  };
  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.atitle || 'تحقق من هذا المنتج';
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (e) {
        if (e.name !== 'AbortError') {
          try {
            await navigator.clipboard.writeText(url);
            alert('تم نسخ الرابط!');
          } catch {
            const t = document.createElement('textarea');
            t.value = url;
            document.body.appendChild(t);
            t.select();
            document.execCommand('copy');
            document.body.removeChild(t);
            alert('تم نسخ الرابط!');
          }
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط!');
      } catch {
        const t = document.createElement('textarea');
        t.value = url;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        alert('تم نسخ الرابط!');
      }
    }
  };

  if (loading) return <div className="p-4 text-center">جاري تحميل تفاصيل المنتج...</div>;
  if (error) return <div className="p-4 text-center text-red-500">خطأ: {error}</div>;
  if (!product) return <div className="p-4 text-center">المنتج غير موجود</div>;

  const getCurrentInventory = () => {
    if (!product.quantity || product.quantity.length === 0) return 0;
    if (!product.variables || product.variables.length === 0) return 0;
    if (!selectedTypeOptions || Object.keys(selectedTypeOptions).length === 0) return 0;
    const match = product.quantity.find(q => {
      if (!q.variables || q.variables.length === 0) return false;
      const ok = Object.entries(selectedTypeOptions).every(([name, val]) => {
        const def = product.variables.find(vd => vd.name === name);
        if (!def) return false;
        const qv = q.variables.find(v => v.id === def.id);
        if (!qv) {
          const idx = product.variables.findIndex(vd => vd.name === name);
          if (idx >= 0 && idx < q.variables.length) {
            const byPos = q.variables[idx];
            return byPos.valueqty === val;
          }
          return false;
        }
        return qv.valueqty === val;
      });
      return ok;
    });
    return match ? match.qty : 0;
  };
  const inventory = getCurrentInventory();
  const orderCount = getOrderCount();

  return (
    <div className='justify-center z-50 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto inset-x-0 bg-gray-50 min-h-screen'>
      <div className='bg-white sticky top-0 z-10 shadow-sm'>
        <div className="flex justify-between items-center px-4 md:px-6 lg:px-8 py-3 md:py-4 border-b border-gray-200">
          <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <FaArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="flex space-x-2">
            <button onClick={handleShare} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <FaShareAlt size={16} className="text-gray-700" />
            </button>
            <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/ar/cart'); }} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
              <FaShoppingCart size={16} className="text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'details' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`}
            style={activeTab === 'details' ? { borderBottomColor: '#374151' } : {}}
          >
            عرض
          </button>
          {hasReviews && (
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'reviews' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`}
              style={activeTab === 'reviews' ? { borderBottomColor: '#374151' } : {}}
            >
              التقييمات
            </button>
          )}
          {hasShorts && (
            <button
              onClick={() => setActiveTab('shorts')}
              className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'shorts' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`}
              style={activeTab === 'shorts' ? { borderBottomColor: '#374151' } : {}}
            >
              مقاطع قصيرة
            </button>
          )}
        </div>
      </div>

      <div className="px-4 pb-24">
        {activeTab === 'details' && (
          <>
            <div className="mb-3 mt-3">
              {(product.generalImages || product.generalimages)?.length > 0 ? (
                <>
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-2">
                    <SimpleImage
                      productSku={product.productSku}
                      imageName={getCurrentImage().img}
                      alt={product.atitle}
                      className="w-full h-80 object-contain"
                      onError={e => {
                        e.target.style.display = 'none';
                      }}
                      onLoad={() => {}}
                    />
                  </div>
                  <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                    {(product.generalImages || product.generalimages || []).map((img, i) => (
                      <SimpleImage
                        key={img.id}
                        productSku={product.productSku}
                        imageName={img.img}
                        alt="thumbnail"
                        className="w-14 h-14 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 flex-shrink-0"
                        style={
                          i === currentImageIndex
                            ? { borderColor: theme.btnBg, boxShadow: `0 0 0 2px ${theme.btnBg}55` }
                            : { borderColor: '#d1d5db' }
                        }
                        onMouseEnter={(e) => { if (i !== currentImageIndex) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                        onMouseLeave={(e) => { if (i !== currentImageIndex) e.currentTarget.style.borderColor = '#d1d5db'; }}
                        onClick={() => handleImageSelect(i)}
                        onError={e => {
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {}}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl mb-2 shadow-sm">
                  <span className="text-gray-500">لا توجد صور متاحة</span>
                </div>
              )}
            </div>

            <div className='bg-white rounded-xl p-4 mb-3 shadow-sm'>
              <div className='flex justify-between items-start mb-2'>
                <h1 className="text-xl font-bold text-gray-900 flex-1 pr-2">{product.atitle}</h1>
                <div className="flex items-center gap-1">
                  <RatingStars score={getAverageRating(product.ratings)} />
                  {orderCount > 0 && (
                    <span className="text-xs font-bold text-gray-700">({formatOrderDisplay(orderCount)})</span>
                  )}
                </div>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.adiscribtion || 'لا يوجد وصف متاح'}
              </p>
            </div>

            {product.variables?.length > 0 && (
              <div className="bg-white rounded-xl p-4 mb-1 shadow-sm">
                {product.variables.map(v => (
                  <div key={v.name} className="mb-4 last:mb-0">
                    <h3 className="font-semibold text-gray-800 mb-2.5 text-sm">{v.aname}:</h3>
                    <div className="flex flex-wrap gap-2">
                      {v.options.map(o => (
                        <button
                          key={o.id}
                          onClick={() => handleTypeChange(v.name, o.value)}
                          className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                            selectedTypeOptions[v.name] === o.value
                              ? 'border-gray-600 bg-gray-100 text-gray-800 shadow-sm'
                              : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'
                          }`}
                        >
                          {o.avalue}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
              <div className="flex items-center justify-between border-gray-100">
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    disabled={quantity <= 1}
                  >
                    <FaMinus size={14} />
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 font-semibold text-gray-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    disabled={quantity >= inventory || inventory === 0}
                  >
                    <FaPlus size={14} />
                  </button>
                </div>
                <div className="text-2xl font-bold" style={{ color: theme.cardText }}>
                  {currencyCountry(product.price, userCountry)}
                </div>
              </div>
            </div>
          </>
        )}
        {activeTab === 'reviews' && (
          <ReviewsTab product={product} />
        )}
      </div>

      {activeTab !== 'shorts' && (
        <div className="fixed bottom-0 left-0 right-0 max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto bg-white border-t border-gray-200 shadow-lg z-40">
          <div className="flex justify-around items-center py-2.5 md:py-3 px-2 md:px-4">
            <button
              onClick={handleAddFavorite}
              className={`flex flex-col items-center gap-0.5 ${favorites.includes(product?.productSku) ? 'text-red-600' : 'text-gray-600'} hover:text-red-600 transition`}
            >
              <FaHeart size={20} />
              <span className="text-[10px] font-medium">المفضلة</span>
            </button>

            <button
              onClick={async () => {
                if (!userPhone) {
                  navigate('/alogin');
                  return;
                }
                try {
                  const profile = await apiService.getProfileByPhone(String(product.phone));
                  navigate(`/ar/achatstore/${profile.store.storename}`);
                } catch (e) {}
              }}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition"
            >
              <FaCommentDots size={20} />
              <span className="text-[10px] font-medium">محادثة</span>
            </button>

            <button
              onClick={async () => {
                try {
                  const profile = await apiService.getProfileByPhone(String(product.phone));
                  navigate(`/ar/${profile.store.storename}`);
                } catch (e) {}
              }}
              className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition"
            >
              <FaStore size={20} />
              <span className="text-[10px] font-medium">المتجر</span>
            </button>

            <button
              onClick={async () => {
                setShowAddProductPopup(true);
                await loadUserGroups(sku);
              }}
              className="flex flex-col items-center px-5 py-2 rounded-xl transition shadow-lg hover:shadow-xl"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
            >
              <FaShoppingCart size={20} />
              <span className="text-[10px] font-bold">أضف إلى السلة</span>
            </button>
          </div>
        </div>
      )}
      {showAddProductPopup && product && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4"
          style={{ position: 'fixed' }}
          onClick={() => setShowAddProductPopup(false)}
        >
          <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
              <h2 className="text-lg font-bold">أضف إلى السلة</h2>
              <button onClick={() => setShowAddProductPopup(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <FaTimes />
              </button>
            </div>

            <div className="p-4">
              <h3 className="text-xl font-bold mb-2">{product.atitle}</h3>
              <p className="text-gray-600 mb-4">{product.adiscribtion || ''}</p>

              {product.variables?.map(v => (
                <div key={v.name} className="mb-4">
                  <h4 className="font-semibold mb-2">{v.aname}:</h4>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map(o => (
                      <button
                        key={o.id}
                        onClick={() => handleTypeChange(v.name, o.value)}
                        className="px-4 py-2 rounded-md border transition-colors"
                        style={
                          selectedTypeOptions[v.name] === o.value
                            ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText }
                            : { borderColor: '#d1d5db', backgroundColor: '#f3f4f6', color: theme.cardText }
                        }
                        onMouseEnter={(e) => { if (selectedTypeOptions[v.name] !== o.value) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                        onMouseLeave={(e) => { if (selectedTypeOptions[v.name] !== o.value) e.currentTarget.style.borderColor = '#d1d5db'; }}
                      >
                        {o.avalue}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mb-4">
                <div className="text-sm text-gray-600 mb-2">المخزون: {inventory} متبقي</div>
                <div className="flex items-center justify-between">
                  <span className="font-semibold">الكمية:</span>
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity <= 1}
                    >
                      <FaMinus />
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                      disabled={quantity >= inventory || inventory === 0}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>
              </div>

              {userGroups.length > 0 ? (
                userGroups.map(g => {
                  const isExpired = g.date && g.hour !== undefined && (() => {
                    const base = new Date(g.date);
                    const minute = g.minute ?? g.minite ?? 0;
                    const end = new Date(base);
                    end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
                    return Date.now() > end.getTime();
                  })();
                  if (isExpired) return null;

                  return (
                    <div
                      key={g.groupsku || g.id}
                      className="mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-purple-900 flex items-center gap-2">
                          <span className="text-lg">👥</span>
                          <span>{g.groupname}</span>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                          g.condition ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'
                        }`}>
                          {g.condition ? '✓ جاهز!' : '⏳ جاري الانتظار...'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-3 bg-white/60 rounded-lg p-2">
                        <div className="text-purple-700 text-sm font-medium">
                          {g.condition
                            ? '🎉 المجموعة جاهزة للدفع!'
                            : `👤 ${g.members?.length || 0}/${g.userlimit} أعضاء منضمين`}
                        </div>
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md">
                          {g.userlimit * 2}% خصم
                        </div>
                      </div>

                      {!g.condition && popupCountdownTimes[g.groupsku || g.id] && popupCountdownTimes[g.groupsku || g.id] !== 'منتهي' && (
                        <div className="bg-purple-100 border border-purple-300 rounded-lg p-2 mb-3">
                          <div className="text-purple-800 text-xs font-semibold flex items-center gap-1">
                            <span>⏰</span>
                            <span>
                              الوقت المتبقي: <span className="font-bold text-purple-900">{popupCountdownTimes[g.groupsku || g.id]}</span>
                            </span>
                          </div>
                        </div>
                      )}
                      {!g.condition && (
                        <button
                          onClick={() => {
                            const url = `${window.location.origin}/ar/product/${g.productsku || g.productSku || sku}`;
                            navigator.clipboard.writeText(url);
                            alert('تم نسخ رابط المجموعة إلى الحافظة!');
                          }}
                          className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                        >
                          <span>📤</span>
                          <span>مشاركة رابط المجموعة</span>
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="flex gap-3 mb-4">
                  <button
                    onClick={() => setShowGroupPopup(true)}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <span>➕</span>
                    <span>إنشاء مجموعة</span>
                    <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">وفر حتى 50%</span>
                  </button>
                  <button
                    onClick={() => {
                      loadAvailableGroups(sku);
                      setShowJoinGroupPopup(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"
                  >
                    <span>👥</span>
                    <span>الانضمام إلى مجموعة</span>
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold">السعر:</span>
                <span className="text-xl font-bold" style={{ color: theme.cardText }}>
                  {currencyCountry(product.price, userCountry)}
                </span>
              </div>

              <button
                onClick={handleAddToCart}
                className="w-full py-3 rounded-lg font-semibold transition shadow-lg"
                style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
              >
                أضف إلى السلة
              </button>
            </div>
          </div>
        </div>
      )}
      {showGroupPopup && product && (
        <Popupshow onClose={() => setShowGroupPopup(false)}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">إنشاء مجموعة</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">اسم المجموعة</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="مجموعة التخفيضات الصيفية"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">عدد المشاركين</label>
              <div className="flex items-center">
                <input
                  type="range"
                  min="2"
                  max="25"
                  value={groupLimit}
                  onChange={(e) => setGroupLimit(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
                <span className="ml-4 w-10 text-center font-bold text-purple-700">{groupLimit}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                الخصم: {Math.min(50, groupLimit * 2)}% (2% لكل مشارك، الحد الأقصى 50%)
              </p>
            </div>

            <div>
              <label className="block text-xl font-extrabold text-purple-600 text-center m-4">اختر الموعد النهائي</label>
              <div className="flex space-x-2">
                <select
                  value={selectedTime.hours}
                  onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {Array.from({ length: 24 }, (_, i) => i).map(h => (
                    <option key={h} value={h}>
                      {String(h).padStart(2, '0')} ساعة
                    </option>
                  ))}
                </select>
                <span className="self-center">:</span>
                <select
                  value={selectedTime.minites}
                  onChange={(e) => setSelectedTime({ ...selectedTime, minites: parseInt(e.target.value) })}
                  className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {[0, 15, 30, 45, 59].map(m => (
                    <option key={m} value={m}>
                      {String(m).padStart(2, '0')} دقيقة
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowGroupPopup(false)}
                className="py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreateGroup}
                className="py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-800 transition shadow-md"
              >
                إنشاء المجموعة
              </button>
            </div>
          </div>
        </Popupshow>
      )}
      {showJoinGroupPopup && product && (
        <Popupshow onClose={() => setShowJoinGroupPopup(false)}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              👥 الانضمام إلى مجموعة
            </h2>
          </div>

          {availableGroups.length > 0 ? (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-purple-700 font-medium">
                  💰 وفر حتى {Math.min(50, availableGroups[0]?.userlimit * 2 || 0)}% بالانضمام إلى مجموعة!
                </p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {availableGroups.sort((a, b) => (a.groupsku || '').localeCompare(b.groupsku || '')).map(g => {
                  const count = g.members?.length || 0;
                  const disc = Math.min(50, g.userlimit * 2);
                  const nameShort = (g.groupname || 'مجموعة').split(' ').slice(0, 2).join(' ') +
                    ((g.groupname || '').split(' ').length > 2 ? '...' : '');
                  const timeLeft = joinGroupCountdownTimes[g.groupsku || g.id] || '—';

                  return (
                    <div
                      key={g.groupsku}
                      className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:border-purple-400"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 mb-1">👥 {nameShort}</h3>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                              {disc}% خصم
                            </span>
                            <span className="text-gray-600">{count}/{g.userlimit} أعضاء</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500 mb-1">الوقت المتبقي</div>
                          <div className={`text-sm font-bold ${
                            timeLeft === 'منتهي' || timeLeft === '—' ? 'text-red-500' : 'text-purple-600'
                          }`}>
                            {timeLeft}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleJoinGroup(g.groupsku)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                      >
                        🚀 انضم الآن ووفر {disc}%
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">😔</div>
              <p className="text-gray-600 font-medium">لا توجد مجموعات متاحة لهذا المنتج.</p>
              <p className="text-sm text-gray-500 mt-2">أنشئ مجموعتك الخاصة للبدء!</p>
            </div>
          )}

          <div className="mt-6">
            <button
              onClick={() => setShowJoinGroupPopup(false)}
              className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              إغلاق
            </button>
          </div>
        </Popupshow>
      )}
    </div>
  );
};
export const EProduct = () => {
  const { sku, afflitename: affiliateParam } = useParams();
  const [product, setProduct] = useState(null);
  const [storeProfile, setStoreProfile] = useState(null);
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    cardBg: storeProfile?.cards?.backgroundColor || '#ffffff',
    cardText: storeProfile?.cards?.textColor || '#111827',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
    btnShadow: storeProfile?.buttons?.shadow || '0 2px 6px rgba(0,0,0,0.12)',
  };
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  const normalizeAffiliateName = (name) => {
    if (!name) return null;
    const trimmed = name.trim().toLowerCase();
    return trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
  };
  const afflitename = affiliateParam ? normalizeAffiliateName(affiliateParam) : null;
  const [selectedTypeOptions, setSelectedTypeOptions] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const [userCountry, setUserCountry] = useState('Oman');
  const [groups, setGroups] = useState([]);
  const [countdownTimes, setCountDownTimes] = useState({});
  const [popupCountdownTimes, setPopupCountdownTimes] = useState({});
  const [joinGroupCountdownTimes, setJoinGroupCountdownTimes] = useState({});
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [inventoryKey, setInventoryKey] = useState(0);
  const [favorites, setFavorites] = useState([]);
  const [orders, setOrders] = useState([]);
  const [hasReviews, setHasReviews] = useState(false);
  const [hasShorts, setHasShorts] = useState(false);
  const [showAddProductPopup, setShowAddProductPopup] = useState(false);
  const [showGroupPopup, setShowGroupPopup] = useState(false);
  const [showJoinGroupPopup, setShowJoinGroupPopup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupLimit, setGroupLimit] = useState(3);
  const [selectedTime, setSelectedTime] = useState({ hours: 18, minites: 0 });
  const [availableGroups, setAvailableGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const userPhone = getUserPhone();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const getOrderCount = () => {
    const count = orders.reduce((total, order) => {
      const orderItems = order.orders || [];
      return total + orderItems.filter(item => item.productsku === sku).reduce((sum, item) => sum + (item.qty || 0), 0);
    }, 0);
    return count;
  };
  const formatOrderDisplay = (count) => {
    if (!count || count === 0) return null;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count.toString();
  };
  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(null);
        const pd = await apiService.getProductBySku(sku);
        setProduct(pd);
        setHasReviews(pd.ratings && pd.ratings.length > 0);
        const init = {};
        pd.variables?.forEach(v => { if (v.options && v.options.length > 0) init[v.name] = v.options[0].value; });
        setSelectedTypeOptions(init);
        if (userPhone) {
          try {
            const u = await apiService.getUserByPhone(userPhone);
            if (u?.country) setUserCountry(u.country);
          } catch { }
          try {
            const cart = await apiService.getCartByPhone(userPhone);
            setCartCount(cart.reduce((s, i) => s + i.qty, 0));
          } catch { }
          try {
            const favs = await apiService.getFavoritesByPhone(userPhone);
            setFavorites(favs.map(f => f.productsku));
          } catch { }
        } else { setUserCountry('Oman'); }
        try {
          const gs = await apiService.getAllGroups();
          setGroups(gs.filter(g => (g.productSku === sku || g.productsku === sku)));
          await loadUserGroups(sku);
        } catch { }
        try {
          const vids = await apiService.getVideosByPhone(String(pd.phone));
          setHasShorts(vids && vids.length > 0);
        } catch { }
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    run();
  }, [sku, userPhone]);
  useEffect(() => {
    const id = setInterval(() => {
      const next = {};
      groups.forEach(g => {
        const end = new Date(g.date);
        end.setHours(g.hour || 0, g.minute || 0, g.second || 0);
        const now = new Date();
        const left = end.getTime() - now.getTime();
        if (left > 0) {
          const h = Math.floor((left / (1000 * 60 * 60)) % 24);
          const m = Math.floor((left / 1000 / 60) % 60);
          const s = Math.floor((left / 1000) % 60);
          next[g.groupSku] = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        } else next[g.groupSku] = "Expired";
      });
      setCountDownTimes(next);
    }, 1000);
    return () => clearInterval(id);
  }, [groups]);
  useEffect(() => {
    if (!userGroups.length || !showAddProductPopup) return;
    const t = setInterval(() => {
      const next = {};
      userGroups.forEach(g => {
        if (!g.date || g.hour === undefined) return;
        const base = new Date(g.date);
        const minute = g.minute ?? g.minite ?? 0;
        const end = new Date(base);
        end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now();
        const key = g.groupsku || g.id;
        next[key] = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : "Expired";
      });
      setPopupCountdownTimes(next);
    }, 1000);
    return () => clearInterval(t);
  }, [userGroups, showAddProductPopup]);
  useEffect(() => {
    if (!availableGroups.length || !showJoinGroupPopup) return;
    const t = setInterval(() => {
      const next = {};
      availableGroups.forEach(g => {
        if (!g.date || g.hour === undefined) return;
        const base = new Date(g.date);
        const minute = g.minute ?? g.minite ?? 0;
        const end = new Date(base);
        end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0);
        const diff = end.getTime() - Date.now();
        const key = g.groupsku || g.id;
        next[key] = diff > 0 ? `${String(Math.floor((diff / 36e5) % 24)).padStart(2, '0')}:${String(Math.floor((diff / 6e4) % 60)).padStart(2, '0')}:${String(Math.floor((diff / 1000) % 60)).padStart(2, '0')}` : "Expired";
      });
      setJoinGroupCountdownTimes(next);
    }, 1000);
    return () => clearInterval(t);
  }, [availableGroups, showJoinGroupPopup]);
  const handleTypeChange = (typename, value) => { setSelectedTypeOptions(p => ({ ...p, [typename]: value })); setInventoryKey(k => k + 1); };
  const handleQuantityChange = (d) => {
    setQuantity(prev => {
      const n = prev + d;
      if (n < 1) return 1;
      if (n > inventory) return inventory;
      return n;
    });
  };
  const handleAddToCart = async () => {
    if (!product) return;
    if (!userPhone) { navigate('/elogin'); return; }
    try {
      const vars = Object.keys(selectedTypeOptions).map(name => {
        const variable = product.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
        return {
          id: option?.id || null,
          name,
          value: selectedTypeOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || selectedTypeOptions[name]
        };
      });
      const cartItem = { productsku: product.productSku, price: product.price, qty: quantity, variables: vars };
      if (afflitename) { cartItem.affliate = afflitename; }
      await apiService.addToCart(userPhone, cartItem);
      const cart = await apiService.getCartByPhone(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowAddProductPopup(false);
      showToast('Product successfully added to cart!', 'success');
    } catch (e) { if (e.message === 'Not authenticated') { navigate('/elogin'); } else { showToast('Failed to add product to cart', 'error'); } }
  };
  const handleAddFavorite = async () => {
    if (!product) return;
    if (!userPhone) { navigate('/elogin'); return; }
    try {
      const isFavorite = favorites.includes(product.productSku);
      if (isFavorite) {
        const favId = (await apiService.getFavoritesByPhone(userPhone)).find(f => f.productsku === product.productSku)?.id;
        if (favId) {
          await apiService.removeFromFavorites(userPhone, favId);
          setFavorites(favorites.filter(f => f !== product.productSku));
          alert('Product removed from favorites!');
        }
      } else {
        await apiService.addToFavorites(userPhone, { productsku: product.productSku });
        setFavorites([...favorites, product.productSku]);
        alert('Product added to favorites!');
      }
    } catch (e) { if (e.message === 'Not authenticated') { navigate('/elogin'); } else { alert('Failed to update favorites'); } }
  };
  const handleImageSelect = i => setCurrentImageIndex(i);
  const getCurrentImage = () => {
    const imgs = product.generalImages || product.generalimages || [];
    return imgs[currentImageIndex] || imgs[0];
  };
  const handleJoinGroup = async (groupSku) => {
    if (!userPhone) { navigate('/elogin'); return; }
    try {
      const vars = Object.keys(selectedTypeOptions).map(name => {
        const variable = product.variables.find(v => v.name === name);
        const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
        return {
          id: option?.id,
          name,
          value: selectedTypeOptions[name],
          aname: variable?.aname || name,
          avalue: option?.avalue || selectedTypeOptions[name]
        };
      });
      let cartItemId = null;
      try {
        const cartItem = { productsku: product.productSku, price: product.price, qty: quantity, variables: vars };
        if (afflitename) { cartItem.affliate = afflitename; }
        await apiService.addToCart(userPhone, cartItem);
        const cart = await apiService.getCartByPhone(userPhone);
        const newItem = cart.find(item => item.productsku === product.productSku && item.qty === quantity && item.price === product.price);
        if (newItem) cartItemId = newItem.id;
      } catch (e) { alert('Failed to add product to cart'); return; }
      const memberData = { price: product.price, qty: quantity, variables: vars.map(v => ({ name: v.name, value: v.value, aname: v.aname, avalue: v.avalue })) };
      if (afflitename) { memberData.affliate = afflitename; }
      await apicartService.joinGroup(userPhone, groupSku, memberData);
      if (cartItemId) { await apicartService.deleteCartItem(userPhone, cartItemId).catch(() => { }); }
      const cart = await apiService.getCartByPhone(userPhone);
      setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      setShowJoinGroupPopup(false);
      setShowAddProductPopup(false);
      await loadUserGroups(sku);
      const gs = await apiService.getAllGroups();
      setGroups(gs.filter(g => (g.productSku === sku || g.productsku === sku)));
      alert('Successfully joined group!');
    } catch (e) { if (e.message === 'Not authenticated') { navigate('/elogin'); } else { alert('Failed to join group'); } }
  };
  const loadAvailableGroups = async (sku) => {
    try {
      const all = await apiService.getAllGroups();
      setAvailableGroups(all.filter(g => (g.productSku === sku || g.productsku === sku) && g.condition === false && g.userlimit > (g.members?.length || 0)));
    } catch (e) { }
  };
  const loadUserGroups = async (sku) => {
    try {
      const all = await apiService.getAllGroups();
      const userGroupsList = all.filter(g => (g.productSku === sku || g.productsku === sku) && g.members?.some(m => String(m.phone || m.userphone || '') === String(userPhone)));
      setUserGroups(userGroupsList);
    } catch (e) { }
  };
  const handleCreateGroup = async () => {
    if (!userPhone) { navigate('/elogin'); return; }
    if (!groupName.trim()) return alert('Please enter a group name');
    if (groupLimit < 2 || groupLimit > 25) return alert('Group limit must be between 2 and 25');
    if (!product?.productSku || !product?.price || !quantity) return alert('Missing product info');
    const vars = Object.keys(selectedTypeOptions).map(name => {
      const variable = product.variables.find(v => v.name === name);
      const option = variable?.options.find(o => o.value === selectedTypeOptions[name]);
      return {
        name,
        value: selectedTypeOptions[name],
        aname: variable?.aname || name,
        avalue: option?.avalue || selectedTypeOptions[name]
      };
    });
    const payload = { productsku: product.productSku, groupname: groupName, userlimit: groupLimit, hour: selectedTime.hours || 0, minite: selectedTime.minites || 0, members: [{ price: product.price, qty: quantity, variables: vars.map(v => ({ name: v.name, value: v.value, aname: v.aname || v.name, avalue: v.avalue || v.value })) }] };
    if (afflitename) { payload.affliate = afflitename; }
    try {
      await apicartService.createGroup(userPhone, payload);
      setShowGroupPopup(false);
      setGroupName('');
      setGroupLimit(3);
      setSelectedTime({ hours: 18, minites: 0 });
      await loadUserGroups(product.productSku);
      alert('Group created successfully!');
    } catch (e) { alert(`Failed to create group: ${e.message || 'Unknown error'}`); }
  };
  const handleShare = async () => {
    const url = window.location.href;
    const title = product?.title || 'Check out this product';
    if (navigator.share) {
      try { await navigator.share({ title, url }); }
      catch (e) {
        if (e.name !== 'AbortError') {
          try { await navigator.clipboard.writeText(url); alert('Link copied!'); }
          catch {
            const t = document.createElement('textarea');
            t.value = url;
            document.body.appendChild(t);
            t.select();
            document.execCommand('copy');
            document.body.removeChild(t);
            alert('Link copied!');
          }
        }
      }
    } else {
      try { await navigator.clipboard.writeText(url); alert('Link copied!'); }
      catch {
        const t = document.createElement('textarea');
        t.value = url;
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        document.body.removeChild(t);
        alert('Link copied!');
      }
    }
  };

  if (loading) return <div className="p-4 text-center">Loading product details...</div>;
  if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="p-4 text-center">Product not found</div>;

  const getCurrentInventory = () => {
    if (!product.quantity || product.quantity.length === 0) return 0;
    if (!product.variables || product.variables.length === 0) return 0;
    if (!selectedTypeOptions || Object.keys(selectedTypeOptions).length === 0) return 0;
    const match = product.quantity.find(q => {
      if (!q.variables || q.variables.length === 0) return false;
      const ok = Object.entries(selectedTypeOptions).every(([name, val]) => {
        const def = product.variables.find(vd => vd.name === name);
        if (!def) return false;
        const qv = q.variables.find(v => v.id === def.id);
        if (!qv) {
          const idx = product.variables.findIndex(vd => vd.name === name);
          if (idx >= 0 && idx < q.variables.length) {
            const byPos = q.variables[idx];
            return byPos.valueqty === val;
          }
          return false;
        }
        return qv.valueqty === val;
      });
      return ok;
    });
    return match ? match.qty : 0;
  };
  const inventory = getCurrentInventory();
  const orderCount = getOrderCount();

  return (<div className='justify-center z-50 max-w-sm mx-auto inset-x-0 bg-gray-50 min-h-screen'>
    <div className='bg-white sticky top-0 z-10 shadow-sm'>
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><FaArrowLeft size={18} className="text-gray-700" /></button>
        <div className="flex space-x-2">
          <button onClick={handleShare} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition"><FaShareAlt size={16} className="text-gray-700" /></button>
          <button type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate('/en/cart'); }} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
            <FaShoppingCart size={16} className="text-gray-700" />
            {cartCount > 0 && (<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">{cartCount}</span>)}
          </button>
        </div>
      </div>
      <div className="flex border-b border-gray-200">
        <button onClick={() => setActiveTab('details')} className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'details' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`} style={activeTab === 'details' ? { borderBottomColor: '#374151' } : {}}>View</button>
        {hasReviews && <button onClick={() => setActiveTab('reviews')} className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'reviews' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`} style={activeTab === 'reviews' ? { borderBottomColor: '#374151' } : {}}>Reviews</button>}
        {hasShorts && <button onClick={() => setActiveTab('shorts')} className={`flex-1 py-3 font-semibold text-sm transition-colors ${activeTab === 'shorts' ? 'text-gray-800 border-b-2 bg-gray-50' : 'text-gray-600 hover:text-gray-800'}`} style={activeTab === 'shorts' ? { borderBottomColor: '#374151' } : {}}>Shorts</button>}
      </div>
    </div>
    <div className="px-4 pb-24">
      {activeTab === 'details' && (<>
        <div className="mb-3 mt-3">
          {(product.generalImages || product.generalimages)?.length > 0 ? (<>
            <div className="bg-white rounded-xl overflow-hidden shadow-sm mb-2">
              <SimpleImage productSku={product.productSku} imageName={getCurrentImage().img} alt={product.title} className="w-full h-80 object-contain" onError={e => { e.target.style.display = 'none'; }} onLoad={() => { }} />
            </div>
            <div className="flex justify-center gap-2 overflow-x-auto pb-2">
              {(product.generalImages || product.generalimages || []).map((img, i) => (
                <SimpleImage
                  key={img.id}
                  productSku={product.productSku}
                  imageName={img.img}
                  alt="thumbnail"
                  className="w-14 h-14 object-cover rounded-lg border-2 cursor-pointer transition-all duration-200 flex-shrink-0"
                  style={
                    i === currentImageIndex
                      ? { borderColor: theme.btnBg, boxShadow: `0 0 0 2px ${theme.btnBg}55` }
                      : { borderColor: '#d1d5db' }
                  }
                  onMouseEnter={(e) => { if (i !== currentImageIndex) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                  onMouseLeave={(e) => { if (i !== currentImageIndex) e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onClick={() => handleImageSelect(i)}
                  onError={e => { e.target.style.display = 'none'; }}
                  onLoad={() => { }}
                />
              ))}
            </div>
          </>) : (<div className="w-full h-80 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl mb-2 shadow-sm"><span className="text-gray-500">No images available</span></div>)}
        </div>
        <div className='bg-white rounded-xl p-4 mb-3 shadow-sm'>
          <div className='flex justify-between items-start mb-2'>
            <h1 className="text-xl font-bold text-gray-900 flex-1 pr-2">{product.title}</h1>
            <div className="flex items-center gap-1">
              <RatingStars score={getAverageRating(product.ratings)} />
              {orderCount > 0 && (<span className="text-xs font-bold text-gray-700">({formatOrderDisplay(orderCount)})</span>)}
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">{product.discribtion || product.description || 'No description available'}</p>
        </div>
        {product.variables?.length > 0 && (
          <div className="bg-white rounded-xl p-4 mb-1 shadow-sm">
            {product.variables.map(v => (
              <div key={v.name} className="mb-4 last:mb-0">
                <h3 className="font-semibold text-gray-800 mb-2.5 text-sm">{v.name}:</h3>
                <div className="flex flex-wrap gap-2">
                  {v.options.map(o => (
                    <button key={o.id} onClick={() => handleTypeChange(v.name, o.value)} className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${selectedTypeOptions[v.name] === o.value ? 'border-gray-600 bg-gray-100 text-gray-800 shadow-sm' : 'border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 hover:bg-gray-100'}`}>{o.value}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="bg-white rounded-xl p-4 mb-3 shadow-sm">
          <div className="flex items-center justify-between border-gray-100">
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition" disabled={quantity <= 1}><FaMinus size={14} /></button>
              <span className="px-4 py-2 border-x border-gray-300 font-semibold text-gray-900 min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => handleQuantityChange(1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition" disabled={quantity >= inventory || inventory === 0}><FaPlus size={14} /></button>
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.cardText }}>{currencyCountry(product.price, userCountry)}</div>
          </div>
        </div>
      </>)}
      {activeTab === 'reviews' && (<ReviewsTab product={product} />)}
    </div>
    {activeTab !== 'shorts' && (<div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 shadow-lg z-40">
      <div className="flex justify-around items-center py-2.5 px-2">
        <button onClick={handleAddFavorite} className={`flex flex-col items-center gap-0.5 ${favorites.includes(product?.productSku) ? 'text-red-600' : 'text-gray-600'} hover:text-red-600 transition`}><FaHeart size={20} /><span className="text-[10px] font-medium">Favorite</span></button>
        <button onClick={async () => { if (!userPhone) { navigate('/elogin'); return; } try { const profile = await apiService.getProfileByPhone(String(product.phone)); navigate(`/en/chatstore/${profile.store.storename}`); } catch (e) { } }} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition"><FaCommentDots size={20} /><span className="text-[10px] font-medium">Chat</span></button>
        <button onClick={async () => { try { const profile = await apiService.getProfileByPhone(String(product.phone)); navigate(`/en/${profile.store.storename}`); } catch (e) { } }} className="flex flex-col items-center gap-0.5 text-gray-600 hover:text-blue-600 transition"><FaStore size={20} /><span className="text-[10px] font-medium">Store</span></button>
        <button
          onClick={async () => { setShowAddProductPopup(true); await loadUserGroups(sku); }}
          className="flex flex-col items-center px-5 py-2 rounded-xl transition shadow-lg hover:shadow-xl"
          style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
        >
          <FaShoppingCart size={20} />
          <span className="text-[10px] font-bold">Add to Cart</span>
        </button>
      </div>
    </div>)}
    {showAddProductPopup && product && (
      <div className="fixed top-0 left-0 right-0 bottom-0 z-50 bg-black/50 flex items-center justify-center p-4" style={{ position: 'fixed' }} onClick={() => setShowAddProductPopup(false)}>
        <div className="bg-white rounded-3xl w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto mx-auto" onClick={(e) => e.stopPropagation()}>
          <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
            <h2 className="text-lg font-bold">Add to Cart</h2>
            <button onClick={() => setShowAddProductPopup(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-bold mb-2">{product.title}</h3>
            <p className="text-gray-600 mb-4">{product.discribtion || product.description || ''}</p>
            {product.variables?.map(v => (
              <div key={v.name} className="mb-4">
                <h4 className="font-semibold mb-2">{v.name}:</h4>
                <div className="flex flex-wrap gap-2">
                  {v.options.map(o => (
                    <button
                      key={o.id}
                      onClick={() => handleTypeChange(v.name, o.value)}
                      className="px-4 py-2 rounded-md border transition-colors"
                      style={
                        selectedTypeOptions[v.name] === o.value
                          ? { borderColor: theme.btnBg, backgroundColor: `${theme.btnBg}22`, color: theme.cardText }
                          : { borderColor: '#d1d5db', backgroundColor: '#f3f4f6', color: theme.cardText }
                      }
                      onMouseEnter={(e) => { if (selectedTypeOptions[v.name] !== o.value) e.currentTarget.style.borderColor = theme.btnBg + '80'; }}
                      onMouseLeave={(e) => { if (selectedTypeOptions[v.name] !== o.value) e.currentTarget.style.borderColor = '#d1d5db'; }}
                    >
                      {o.value}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="mb-4">
              <div className="text-sm text-gray-600 mb-2">Inventory: {inventory} left</div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Quantity:</span>
                <div className="flex items-center border border-gray-300 rounded-md">
                  <button onClick={() => handleQuantityChange(-1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity <= 1}><FaMinus /></button>
                  <span className="px-4 py-1 border-x border-gray-300">{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)} className="p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50" disabled={quantity >= inventory || inventory === 0}><FaPlus /></button>
                </div>
              </div>
            </div>
            {userGroups.length > 0 ? userGroups.map(g => {
              const isExpired = g.date && g.hour !== undefined && (() => { const base = new Date(g.date); const minute = g.minute ?? g.minite ?? 0; const end = new Date(base); end.setHours(base.getHours() + g.hour, base.getMinutes() + minute, 0, 0); return Date.now() > end.getTime(); })();
              if (isExpired) return null;
              return (<div key={g.groupsku || g.id} className="mb-4 bg-gradient-to-r from-purple-50 via-pink-50 to-purple-50 border-2 border-purple-300 rounded-xl p-4 shadow-md hover:shadow-lg transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-purple-900 flex items-center gap-2"><span className="text-lg">👥</span><span>{g.groupname}</span></div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${g.condition ? 'bg-green-500 text-white' : 'bg-yellow-400 text-yellow-900'}`}>{g.condition ? '✓ Ready!' : '⏳ Waiting...'}</div>
                </div>
                <div className="flex items-center justify-between mb-3 bg-white/60 rounded-lg p-2">
                  <div className="text-purple-700 text-sm font-medium">{g.condition ? '🎉 Group is ready for checkout!' : `👤 ${g.members?.length || 0}/${g.userlimit} members joined`}</div>
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full font-bold text-sm shadow-md">{g.userlimit * 2}% OFF</div>
                </div>
                {!g.condition && popupCountdownTimes[g.groupsku || g.id] && popupCountdownTimes[g.groupsku || g.id] !== 'Expired' && (<div className="bg-purple-100 border border-purple-300 rounded-lg p-2 mb-3">
                  <div className="text-purple-800 text-xs font-semibold flex items-center gap-1"><span>⏰</span><span>Time left: <span className="font-bold text-purple-900">{popupCountdownTimes[g.groupsku || g.id]}</span></span></div>
                </div>)}
                {!g.condition && (<button onClick={() => { const url = `${window.location.origin}/en/product/${g.productsku || g.productSku || sku}`; navigator.clipboard.writeText(url); alert('Group link copied to clipboard!'); }} className="w-full bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"><span>📤</span><span>Share Group Link</span></button>)}
              </div>);
            }) : (<div className="flex gap-3 mb-4">
              <button onClick={() => setShowGroupPopup(true)} className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"><span>➕</span><span>Create Group</span><span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Save up to 50%</span></button>
              <button onClick={() => { loadAvailableGroups(sku); setShowJoinGroupPopup(true); }} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white text-sm font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-[1.02] flex items-center justify-center gap-2"><span>👥</span><span>Join Group</span></button>
            </div>)}
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold">Price:</span>
              <span className="text-xl font-bold" style={{ color: theme.cardText }}>{currencyCountry(product.price, userCountry)}</span>
            </div>
            <button
              onClick={handleAddToCart}
              className="w-full py-3 rounded-lg font-semibold transition shadow-lg"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius, boxShadow: theme.btnShadow }}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    )}
    {showGroupPopup && product && (<Popupshow onClose={() => setShowGroupPopup(false)}>
      <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Create Group</h2></div>
      <div className="space-y-4">
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label><input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Summer Sale Group" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent" /></div>
        <div><label className="block text-sm font-medium text-gray-700 mb-1">Number of Participants</label>
          <div className="flex items-center"><input type="range" min="2" max="25" value={groupLimit} onChange={(e) => setGroupLimit(parseInt(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600" /><span className="ml-4 w-10 text-center font-bold text-purple-700">{groupLimit}</span></div>
          <p className="text-sm text-gray-500 mt-1">Discount: {Math.min(50, groupLimit * 2)}% (2% per participant, max 50%)</p>
        </div>
        <div><label className="block text-xl font-extrabold text-purple-600 text-center m-4">Select the deadline</label>
          <div className="flex space-x-2">
            <select value={selectedTime.hours} onChange={(e) => setSelectedTime({ ...selectedTime, hours: parseInt(e.target.value) })} className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{Array.from({ length: 24 }, (_, i) => i).map(h => <option key={h} value={h}>{String(h).padStart(2, '0')} Hours</option>)}</select>
            <span className="self-center">:</span>
            <select value={selectedTime.minites} onChange={(e) => setSelectedTime({ ...selectedTime, minites: parseInt(e.target.value) })} className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">{[0, 15, 30, 45, 59].map(m => <option key={m} value={m}>{String(m).padStart(2, '0')} Minutes</option>)}</select>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <button onClick={() => setShowGroupPopup(false)} className="py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Cancel</button>
          <button onClick={handleCreateGroup} className="py-3 bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-800 transition shadow-md">Create Group</button>
        </div>
      </div>
    </Popupshow>)}
    {showJoinGroupPopup && product && (<Popupshow onClose={() => setShowJoinGroupPopup(false)}>
      <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">👥 Join a Group</h2></div>
      {availableGroups.length > 0 ? (<div className="space-y-4">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3 mb-4"><p className="text-sm text-purple-700 font-medium">💰 Save up to {Math.min(50, availableGroups[0]?.userlimit * 2 || 0)}% by joining a group!</p></div>
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">{availableGroups.sort((a, b) => (a.groupsku || '').localeCompare(b.groupsku || '')).map(g => {
          const count = g.members?.length || 0;
          const disc = Math.min(50, g.userlimit * 2);
          const nameShort = (g.groupname || 'Group').split(' ').slice(0, 2).join(' ') + ((g.groupname || '').split(' ').length > 2 ? '...' : '');
          const timeLeft = joinGroupCountdownTimes[g.groupsku || g.id] || '—';
          return (<div key={g.groupsku} className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-md hover:shadow-lg transition-all hover:border-purple-400">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1"><h3 className="font-bold text-gray-800 mb-1">👥 {nameShort}</h3><div className="flex items-center gap-3 text-sm"><span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">{disc}% OFF</span><span className="text-gray-600">{count}/{g.userlimit} members</span></div></div>
              <div className="text-right"><div className="text-xs text-gray-500 mb-1">Time left</div><div className={`text-sm font-bold ${timeLeft === 'Expired' || timeLeft === '—' ? 'text-red-500' : 'text-purple-600'}`}>{timeLeft}</div></div>
            </div>
            <button onClick={() => handleJoinGroup(g.groupsku)} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">🚀 Join Now & Save {disc}%</button>
          </div>);
        })}</div>
      </div>) : (<div className="text-center py-10">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-gray-600 font-medium">No available groups for this product.</p>
        <p className="text-sm text-gray-500 mt-2">Create your own group to get started!</p>
      </div>)}
      <div className="mt-6"><button onClick={() => setShowJoinGroupPopup(false)} className="w-full py-3 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">Close</button></div>
    </Popupshow>)}
  </div>);
};
export const Elogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [country, setCountry] = useState(null);
  const [phone, setPhone] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState({ lat: 23.588, lng: 58.3829 });
  const [searchQuery, setSearchQuery] = useState("");
  const [mapKey, setMapKey] = useState(0);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [storeProfile, setStoreProfile] = useState(null);
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
  };
  useEffect(() => { const om = countryloginOptions.find(o => o.iso === "OM"); setCountry(om); }, []);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    if (step === "complete") {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setMapKey(prev => prev + 1); },
        () => { },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 20000 }
      );
    }
  }, [step]);
  const sendable = () => {
    if (!country) return false;
    const localLen = country.localLen || 6;
    const only = normalizeDigits(phone);
    return /^\d+$/.test(only) && only.length === localLen;
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const digitsOnly = (country.value + normalizeDigits(phone)).replace("+", "");
      setFullPhone("+" + digitsOnly);
      setIsLoading(true);
      await APIloginPost("/t3wn/auth/request", { phone: "+" + digitsOnly, channel: "sms" });
      setStep("otp");
    } catch { setError("Failed to send code"); }
    finally { setIsLoading(false); }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      const res = await APIloginPost("/t3wn/auth/verify", { phone: fullPhone, code: normalizeDigits(otpInput) });
      localStorage.setItem("authToken", res.token);
      localStorage.setItem("userPhone", res.phone);
      const token = res.token;
      const digits = res.phone.replace(/\D/g, "");
      try {
        const userData = await APIloginGet(`/t3wn/users/${digits}`, token);
        try {
          const profile = await apistoreview.getProfileByPhone(digits);
          if (profile?.store?.storename) {
            navigate(`/en/${encodeURIComponent(profile.store.storename)}`);
            return;
          }
        } catch {}
        try {
          const profiles = await apistoreview.getAllProfiles();
          if (profiles && profiles.length > 0 && profiles[0]?.store?.storename) {
            navigate(`/en/${encodeURIComponent(profiles[0].store.storename)}`);
            return;
          }
        } catch {}
        navigate("/en");
      } catch {
        setStep("complete");
      }
    } catch { setError("Invalid code"); }
    finally { setIsLoading(false); }
  };
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    const result = await geocodeAddress(searchQuery);
    if (result) {
      setLocation({ lat: result.lat, lng: result.lng });
      setMapKey(prev => prev + 1);
      setSearchQuery(result.displayName);
    }
  };
  const handleComplete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const getCountryName = (label) => {
        if (!label) return null;
        const beforePhone = label.split("(")[0].trim();
        const parts = beforePhone.split(" ").filter(p => p.trim());
        return parts.slice(1).join(" ") || null;
      };
      const payload = { name: name || "Guest", country: getCountryName(country?.label) || null, map: `https://www.openstreetmap.org/?mlat=${location?.lat}&mlon=${location?.lng}&zoom=15` };
      const res = await APIloginPost("/t3wn/auth/complete", payload, token);
      if (res.exists || res.created) {
        const userPhone = localStorage.getItem("userPhone");
        const digits = userPhone?.replace(/\D/g, "") || "";
        try {
          const profile = await apistoreview.getProfileByPhone(digits);
          if (profile?.store?.storename) {
            navigate(`/en/${encodeURIComponent(profile.store.storename)}`);
            return;
          }
        } catch {}
        try {
          const profiles = await apistoreview.getAllProfiles();
          if (profiles && profiles.length > 0 && profiles[0]?.store?.storename) {
            navigate(`/en/${encodeURIComponent(profiles[0].store.storename)}`);
            return;
          }
        } catch {}
        navigate("/en");
      } else { throw new Error("failed"); }
    } catch { setError("Save failed"); }
    finally { setIsLoading(false); }
  };
  const localLen = country?.localLen ?? 8;

  return (
    <div className="min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4 md:p-6 lg:p-8 relative flex flex-col h-[100dvh] max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto overflow-hidden">
      <div className="bg-white/90 rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6 w-full">
        <div className="flex justify-between items-center gap-2"><LangSwitch to="/alogin" /><CloseButton /></div>
        <div className="flex"><h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-center mx-auto bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent tracking-wide">LOGIN</h1></div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base">{error}</div>}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="termsAgree" required className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <label htmlFor="termsAgree" className="text-xs md:text-sm lg:text-base text-gray-700">
                I agree to the{' '}
                <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsPopup(true); }} className="underline" style={{ color: theme.btnBg }}>Terms & Conditions</button>
              </label>
            </div>
            <div className="mb-2">
              <Select options={countryloginOptions} value={country} onChange={(opt) => { setCountry(opt); setPhone(""); }} placeholder="Select country code" isSearchable={false} className="text-sm md:text-base" />
            </div>
            <div className="max-w-md lg:max-w-lg mx-auto">
              <DialPad value={phone} onChange={setPhone} maxLen={localLen} isArabic={false} />
            </div>
            <button
              type="submit"
              disabled={isLoading || !sendable()}
              className="w-full max-w-md lg:max-w-lg mx-auto text-white font-semibold py-3 md:py-4 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base lg:text-lg"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "Sending OTP…" : "Send OTP"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="text-center text-xs md:text-sm lg:text-base text-gray-600">We sent a 6-digit code to <span className="font-medium">{country ? country.value : ""} {phone}</span></div>
            <div className="max-w-md lg:max-w-lg mx-auto">
              <DialPad value={otpInput} onChange={setOtpInput} maxLen={6} group={false} isArabic={false} />
            </div>
            <button
              type="submit"
              disabled={isLoading || normalizeDigits(otpInput).length !== 6}
              className="w-full max-w-md lg:max-w-lg mx-auto text-white font-semibold py-3 md:py-4 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base lg:text-lg"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "Verifying…" : "Verify"}
            </button>
          </form>
        )}
        {step === "complete" && (
          <form onSubmit={handleComplete} className="space-y-4 md:space-y-5">
            <div className="text-xs md:text-sm text-gray-700">Complete your profile:</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 outline-none transition shadow-sm text-sm md:text-base"
              onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                    placeholder="Search location"
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 outline-none transition shadow-sm text-sm md:text-base"
                    onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="px-3 md:px-4 py-2 md:py-2.5 text-white rounded-xl md:rounded-2xl transition text-sm md:text-base"
                    style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>
              <div className="w-full h-[200px] md:h-[300px] lg:h-[350px] rounded-lg md:rounded-xl overflow-hidden">
                <MapContainer key={mapKey} center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapCenter center={location} zoom={15} />
                  <MapClickHandler onClick={(loc) => setLocation(loc)} />
                  <Marker position={[location.lat, location.lng]} />
                </MapContainer>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "Saving…" : "Finish & Enter"}
            </button>
          </form>
        )}
      </div>
      {showTermsPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowTermsPopup(false)}>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 max-w-sm md:max-w-2xl lg:max-w-3xl w-full max-h-[80vh] md:max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold">Terms & Conditions</h2>
              <button onClick={() => setShowTermsPopup(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <EtermsContent />
          </div>
        </div>
      )}
    </div>
  );
};
export const Alogin = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [country, setCountry] = useState(null);
  const [phone, setPhone] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState("");
  const [location, setLocation] = useState({ lat: 23.588, lng: 58.3829 });
  const [searchQuery, setSearchQuery] = useState("");
  const [mapKey, setMapKey] = useState(0);
  const [showTermsPopup, setShowTermsPopup] = useState(false);
  const [storeProfile, setStoreProfile] = useState(null);
  const theme = {
    bg: storeProfile?.backgroundColor || '#f8fafc',
    btnBg: storeProfile?.buttons?.backgroundColor || '#2d3748',
    btnText: storeProfile?.buttons?.textColor || '#ffffff',
    btnRadius: storeProfile?.buttons?.borderRadius || '9999px',
  };
  useEffect(() => { const om = countryloginOptionsAr.find(o => o.iso === "OM"); setCountry(om); }, []);
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const lastStore = localStorage.getItem('lastVisitedStore');
        if (lastStore) {
          const profile = await apiCall(`${API_BASE_URL}/t3wn/profile/${lastStore}`, { method: 'GET' });
          if (profile.ok) {
            const data = await profile.json();
            setStoreProfile(data);
          }
        }
      } catch {}
    };
    fetchProfile();
  }, []);
  useEffect(() => {
    if (step === "complete") {
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setMapKey(prev => prev + 1); },
        () => { },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 20000 }
      );
    }
  }, [step]);
  const sendable = () => {
    if (!country) return false;
    const localLen = country.localLen || 6;
    const only = normalizeDigits(phone);
    return /^\d+$/.test(only) && only.length === localLen;
  };
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const digitsOnly = (country.value + normalizeDigits(phone)).replace("+", "");
      setFullPhone("+" + digitsOnly);
      setIsLoading(true);
      await APIloginPost("/t3wn/auth/request", { phone: "+" + digitsOnly, channel: "sms" });
      setStep("otp");
    } catch { setError("فشل في إرسال الرمز"); }
    finally { setIsLoading(false); }
  };
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      setIsLoading(true);
      const res = await APIloginPost("/t3wn/auth/verify", { phone: fullPhone, code: normalizeDigits(otpInput) });
      localStorage.setItem("authToken", res.token);
      localStorage.setItem("userPhone", res.phone);
      const token = res.token;
      const digits = res.phone.replace(/\D/g, "");
      try {
        const userData = await APIloginGet(`/t3wn/users/${digits}`, token);
        try {
          const profile = await apistoreview.getProfileByPhone(digits);
          if (profile?.store?.storename) {
            navigate(`/ar/${encodeURIComponent(profile.store.storename)}`);
            return;
          }
        } catch {}
        try {
          const profiles = await apistoreview.getAllProfiles();
          if (profiles && profiles.length > 0 && profiles[0]?.store?.storename) {
            navigate(`/ar/${encodeURIComponent(profiles[0].store.storename)}`);
            return;
          }
        } catch {}
        navigate("/ar");
      } catch {
        setStep("complete");
      }
    } catch { setError("الرمز غير صحيح"); }
    finally { setIsLoading(false); }
  };
  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    const result = await geocodeAddress(searchQuery);
    if (result) {
      setLocation({ lat: result.lat, lng: result.lng });
      setMapKey(prev => prev + 1);
      setSearchQuery(result.displayName);
    }
  };
  const handleComplete = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const getCountryName = (label) => {
        if (!label) return null;
        const beforePhone = label.split("(")[0].trim();
        const parts = beforePhone.split(" ").filter(p => p.trim());
        return parts.slice(1).join(" ") || null;
      };
      const payload = { name: name || "ضيف", country: getCountryName(country?.label) || null, map: `https://www.openstreetmap.org/?mlat=${location?.lat}&mlon=${location?.lng}&zoom=15` };
      const res = await APIloginPost("/t3wn/auth/complete", payload, token);
      if (res.exists || res.created) {
        const userPhone = localStorage.getItem("userPhone");
        const digits = userPhone?.replace(/\D/g, "") || "";
        try {
          const profile = await apistoreview.getProfileByPhone(digits);
          if (profile?.store?.storename) {
            navigate(`/ar/${encodeURIComponent(profile.store.storename)}`);
            return;
          }
        } catch {}
        try {
          const profiles = await apistoreview.getAllProfiles();
          if (profiles && profiles.length > 0 && profiles[0]?.store?.storename) {
            navigate(`/ar/${encodeURIComponent(profiles[0].store.storename)}`);
            return;
          }
        } catch {}
        navigate("/ar");
      } else { throw new Error("failed"); }
    } catch { setError("فشل الحفظ"); }
    finally { setIsLoading(false); }
  };
  const localLen = country?.localLen ?? 8;

  return (
    <div className="min-h-screen items-center justify-center bg-gradient-to-b from-orange-50 to-white p-4 md:p-6 lg:p-8 relative flex flex-col h-[100dvh] max-w-full sm:max-w-md md:max-w-lg lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl mx-auto overflow-hidden" dir="rtl">
      <div className="bg-white/90 rounded-2xl md:rounded-3xl shadow-xl ring-1 ring-black/5 overflow-hidden p-4 sm:p-6 md:p-8 lg:p-10 space-y-4 md:space-y-6 w-full">
        <div className="flex justify-between items-center gap-2"><LangSwitch to="/elogin" rtl={true} /><CloseButton /></div>
        <div className="flex"><h1 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-center mx-auto bg-gradient-to-r from-gray-800 to-gray-500 bg-clip-text text-transparent tracking-wide">تسجيل الدخول</h1></div>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-sm md:text-base">{error}</div>}
        {step === "phone" && (
          <form onSubmit={handleSendOtp} className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox" id="termsAgreeAr" required className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
              <label htmlFor="termsAgreeAr" className="text-xs md:text-sm lg:text-base text-gray-700">
                أوافق على{' '}
                <button type="button" onClick={(e) => { e.preventDefault(); setShowTermsPopup(true); }} className="underline" style={{ color: theme.btnBg }}>الشروط والأحكام</button>
              </label>
            </div>
            <div className="mb-2">
              <Select options={countryloginOptionsAr} value={country} onChange={(opt) => { setCountry(opt); setPhone(""); }} placeholder="اختر رمز الدولة" isSearchable={false} className="text-sm md:text-base" />
            </div>
            <div className="max-w-md lg:max-w-lg mx-auto">
              <DialPad value={phone} onChange={setPhone} maxLen={localLen} isArabic={true} />
            </div>
            <button
              type="submit"
              disabled={isLoading || !sendable()}
              className="w-full max-w-md lg:max-w-lg mx-auto text-white font-semibold py-3 md:py-4 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base lg:text-lg"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "جاري الإرسال…" : "إرسال الرمز"}
            </button>
          </form>
        )}
        {step === "otp" && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 md:space-y-6 lg:space-y-8">
            <div className="text-center text-xs md:text-sm lg:text-base text-gray-600">تم إرسال رمز مكون من 6 أرقام إلى <span className="font-medium">{country ? country.value : ""} {phone}</span></div>
            <div className="max-w-md lg:max-w-lg mx-auto">
              <DialPad value={otpInput} onChange={setOtpInput} maxLen={6} group={false} isArabic={true} />
            </div>
            <button
              type="submit"
              disabled={isLoading || normalizeDigits(otpInput).length !== 6}
              className="w-full max-w-md lg:max-w-lg mx-auto text-white font-semibold py-3 md:py-4 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base lg:text-lg"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "جاري التحقق…" : "تحقق"}
            </button>
          </form>
        )}
        {step === "complete" && (
          <form onSubmit={handleComplete} className="space-y-4 md:space-y-5">
            <div className="text-xs md:text-sm text-gray-700">أكمل بياناتك:</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="الاسم الكامل"
              className="w-full px-3 md:px-4 py-2.5 md:py-3 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 outline-none transition shadow-sm text-sm md:text-base"
              dir="rtl"
              onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            />
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchLocation()}
                    placeholder="ابحث عن موقع"
                    className="flex-1 px-3 md:px-4 py-2 md:py-2.5 border border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 outline-none transition shadow-sm text-sm md:text-base"
                    dir="rtl"
                    onFocus={(e) => { e.target.style.borderColor = theme.btnBg; e.target.style.setProperty('--tw-ring-color', theme.btnBg); }}
                    onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                  />
                  <button
                    type="button"
                    onClick={handleSearchLocation}
                    className="px-3 md:px-4 py-2 md:py-2.5 text-white rounded-xl md:rounded-2xl transition text-sm md:text-base"
                    style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
                  >
                    <FaSearch />
                  </button>
                </div>
              </div>
              <div className="w-full h-[200px] md:h-[300px] lg:h-[350px] rounded-lg md:rounded-xl overflow-hidden">
                <MapContainer key={mapKey} center={[location.lat, location.lng]} zoom={15} style={{ height: "100%", width: "100%" }}>
                  <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <MapCenter center={location} zoom={15} />
                  <MapClickHandler onClick={(loc) => setLocation(loc)} />
                  <Marker position={[location.lat, location.lng]} />
                </MapContainer>
              </div>
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-semibold py-2.5 md:py-3 px-4 rounded-xl md:rounded-2xl transition-colors disabled:opacity-70 shadow text-sm md:text-base"
              style={{ backgroundColor: theme.btnBg, color: theme.btnText, borderRadius: theme.btnRadius }}
            >
              {isLoading ? "جاري الحفظ…" : "إنهاء والدخول"}
            </button>
          </form>
        )}
      </div>
      {showTermsPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowTermsPopup(false)}>
          <div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 max-w-sm md:max-w-2xl lg:max-w-3xl w-full max-h-[80vh] md:max-h-[85vh] overflow-y-auto shadow-xl" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center mb-3 md:mb-4">
              <h2 className="text-lg md:text-xl font-bold">الشروط والأحكام</h2>
              <button onClick={() => setShowTermsPopup(false)} className="p-2 hover:bg-gray-100 rounded-full"><FaTimes /></button>
            </div>
            <EtermsContent />
          </div>
        </div>
      )}
    </div>
  );
};