import { BrowserRouter, Routes, Route } from 'react-router-dom';
import {Ar, En} from './site';
import {Elogin, Alogin, EProduct, AProduct, EStoreView, AStoreView, Ecart, Acart, ChatStore, AChatStore} from './storesite'
import { useState, useEffect, useRef, createContext} from 'react';



const ToastContext = createContext(null);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef(new Map());
  useEffect(() => () => { timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId)); timeoutRefs.current.clear(); }, []);
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    const timeoutId = setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); timeoutRefs.current.delete(id); }, 3000);
    timeoutRefs.current.set(id, timeoutId);
  };
  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[9999] flex flex-col gap-2 max-w-sm md:max-w-md lg:max-w-lg w-full px-4">
        {toasts.map(toast => (
          <div key={toast.id} className={`bg-white rounded-lg shadow-2xl border-2 px-4 py-3 flex items-center gap-3 animate-slide-down ${toast.type === 'success' ? 'border-green-500' : 'border-red-500'}`} style={{ animation: 'slideDown 0.3s ease-out, fadeOut 0.3s ease-out 2.7s forwards' }}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${toast.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
              {toast.type === 'success' ? <FaCheckCircle className="text-green-600" size={16} /> : <FaTimes className="text-red-600" size={16} />}
            </div>
            <p className={`flex-1 text-sm font-semibold ${toast.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>{toast.message}</p>
          </div>
        ))}
      </div>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @keyframes fadeOut {
          to { opacity: 0; transform: translate(-50%, -20px); }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
const App = () => (
    <ToastProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                <Route path="/elogin" element={<Elogin />} />
                <Route path="/alogin" element={<Alogin />} />
                <Route path="/en/product/:sku" element={<EProduct />} />
                <Route path="/ar/product/:sku" element={<AProduct />} />
                <Route path="/en/:storename" element={<EStoreView />} />
                <Route path="/ar/:storename" element={<AStoreView />} />
                <Route path="/en/cart" element={<Ecart />} />
                <Route path="/ar/cart" element={<Acart />} />
                <Route path="/en/chatstore/:storename" element={<ChatStore />} />
                <Route path="/ar/achatstore/:storename" element={<AChatStore />} />
                <Route path="/ar" element={<Ar />} />
                <Route path="/en" element={<En />} />
                <Route path="/" element={<En />} />
            </Routes>
        </BrowserRouter>
    </ToastProvider>
);


export default App;