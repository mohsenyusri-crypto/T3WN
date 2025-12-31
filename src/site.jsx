import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { FaFacebook, FaInstagram, FaYoutube, FaTwitter, FaDownload, FaSearch, FaHandshake, FaHeadset, FaStore, FaArrowLeft, FaFileDownload } from 'react-icons/fa';
import { FaTiktok } from 'react-icons/fa6';
import html2canvas from 'html2canvas';
import qrlogo from '/qrcodelogo.png'
import logo from '/logo.png'
import apple from '/apple.jpg'
import android from '/android.png'
import ensample from '/ensample.jpeg'
import arsample from '/ensample.jpeg'
import envedpartnter from '/envedpartnter.mp4'
import envedsearch from '/envedsearch.mp4'
import arvedpartnter from '/arvedpartnter.mp4'
import arvedsearch from '/arvedsearch.mp4'

const API_OPEN_BASE_URL = import.meta.env.VITE_API_OPEN_BASE_URL;
const endetails = { requireddocs: { firstpoint: "doc_first_point", secondpoint: "doc_second_point", thirdpoint: "doc_third_point", fourthpoint: "doc_fourth_point", fifthpoint: "doc_fifth_point", sixthpoint: "doc_sixth_point" }, requiredfees: { firstpoint: "fee_first_point", secondpoint: "fee_second_point", thirdpoint: "fee_third_point", fourthpoint: "fee_fourth_point", fifthpoint: "fee_fifth_point", sixthpoint: "fee_sixth_point" }, requiredpolicy: { firstpoint: "policy_first_point", secondpoint: "policy_second_point", thirdpoint: "policy_third_point", fourthpoint: "policy_fourth_point", fifthpoint: "policy_fifth_point", sixthpoint: "policy_sixth_point" }, }
const ardetails = { requireddocs: { firstpoint: "doc_first_point", secondpoint: "doc_second_point", thirdpoint: "doc_third_point", fourthpoint: "doc_fourth_point", fifthpoint: "doc_fifth_point", sixthpoint: "doc_sixth_point" }, requiredfees: { firstpoint: "fee_first_point", secondpoint: "fee_second_point", thirdpoint: "fee_third_point", fourthpoint: "fee_fourth_point", fifthpoint: "fee_fifth_point", sixthpoint: "fee_sixth_point" }, requiredpolicy: { firstpoint: "policy_first_point", secondpoint: "policy_second_point", thirdpoint: "policy_third_point", fourthpoint: "policy_fourth_point", fifthpoint: "policy_fifth_point", sixthpoint: "policy_sixth_point" }, }
const channels = { facebook: "facebook.com/t3wn", instgram: "instagram.com/t3wn", tiktok: "tiktok.com/t3wn", x: "x.com/t3wn", youtube: "youtube.com/t3wn" }
const scrollToSection = (sectionId) => { const element = document.getElementById(sectionId); if (element) { element.scrollIntoView({ behavior: 'smooth', block: 'start' }); } };
export const En = () => {
  const [stores, setStores] = useState([]); const [searchTerm, setSearchTerm] = useState(''); const [filteredStores, setFilteredStores] = useState([]); const [selectedStore, setSelectedStore] = useState(null); const [showDownloadPopup, setShowDownloadPopup] = useState(false); const [showSocialPopup, setShowSocialPopup] = useState(null); const [partnerVideoMuted, setPartnerVideoMuted] = useState(true); const [searchVideoMuted, setSearchVideoMuted] = useState(true); const [applyForm, setApplyForm] = useState({ name: '', phone: '', email: '' }); const [supportForm, setSupportForm] = useState({ name: '', phone: '', email: '', description: '' }); const downloadPopupRef = useRef(null);
  useEffect(() => { const fetchStores = async () => { try { const response = await fetch(`${API_OPEN_BASE_URL}/t3wn/profile`); if (response.ok) { const data = await response.json(); const storeList = Array.isArray(data) ? data.map(item => item.store || item).filter(Boolean) : []; setStores(storeList); setFilteredStores(storeList.slice(0, 5)); } else { console.error('Failed to fetch stores:', response.status); } } catch (error) { console.error('Error fetching stores:', error); } }; fetchStores(); }, []);
  useEffect(() => { if (searchTerm.trim() === '') { const randomStores = [...stores].sort(() => 0.5 - Math.random()).slice(0, 5); setFilteredStores(randomStores); } else { const filtered = stores.filter(store => store.storename?.toLowerCase().includes(searchTerm.toLowerCase()) || store.astorename?.toLowerCase().includes(searchTerm.toLowerCase())); setFilteredStores(filtered.slice(0, 10)); } }, [searchTerm, stores]);
  const handleDownloadPDF = async () => { if (!downloadPopupRef.current || !selectedStore) { alert('Error: Missing store information'); return; } try { const popupElement = downloadPopupRef.current; if (!popupElement) { throw new Error('Popup element not found'); } const actionButtons = popupElement.querySelector('#action-buttons'); const originalDisplay = actionButtons?.style.display || ''; if (actionButtons) { actionButtons.style.display = 'none'; } await new Promise(resolve => setTimeout(resolve, 300)); console.log('Capturing element for PNG...'); await new Promise(resolve => setTimeout(resolve, 1500)); const images = popupElement.querySelectorAll('img'); 
                                                await Promise.all(Array.from(images).map(img => { if (img.complete) return Promise.resolve(); return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 3000); }); })); const svgs = popupElement.querySelectorAll('svg'); if (svgs.length > 0) { await new Promise(resolve => setTimeout(resolve, 500)); } const rect = popupElement.getBoundingClientRect(); console.log('Original element dimensions:', rect.width, 'x', rect.height); console.log('Original element position:', rect.top, rect.left); if (rect.width === 0 || rect.height === 0) { throw new Error('Element has no dimensions'); } 
                                                if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) { popupElement.scrollIntoView({ behavior: 'instant', block: 'center' }); await new Promise(resolve => setTimeout(resolve, 300)); } const canvas = await html2canvas(popupElement, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, allowTaint: true, removeContainer: false, imageTimeout: 30000, foreignObjectRendering: true, scrollX: 0, scrollY: 0, width: rect.width, height: rect.height, onclone: (clonedDoc, element) => { const buttonsInClone = clonedDoc.querySelector('#action-buttons'); 
                                                if (buttonsInClone) { buttonsInClone.remove(); } const clonedImages = clonedDoc.querySelectorAll('img'); clonedImages.forEach(img => { if (img.src && !img.complete) { img.src = img.src; } }); const svgs = clonedDoc.querySelectorAll('svg'); console.log('Found SVGs in clone:', svgs.length); svgs.forEach((svg, index) => { svg.style.display = 'block'; svg.style.visibility = 'visible'; const originalSvgs = popupElement.querySelectorAll('svg'); if (originalSvgs[index]) { const originalSvg = originalSvgs[index]; const computedStyle = window.getComputedStyle(originalSvg); 
                                                const rect = originalSvg.getBoundingClientRect(); svg.style.width = (rect.width || computedStyle.width || '300') + 'px'; svg.style.height = (rect.height || computedStyle.height || '300') + 'px'; if (originalSvg.getAttribute('viewBox')) { svg.setAttribute('viewBox', originalSvg.getAttribute('viewBox')); } } }); const allElements = clonedDoc.querySelectorAll('*'); allElements.forEach(el => { const computed = window.getComputedStyle(el); if (computed.display === 'none') { el.style.display = 'block'; } if (computed.visibility === 'hidden') { el.style.visibility = 'visible'; } 
                                                if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'SPAN') { if (!computed.color || computed.color === 'rgba(0, 0, 0, 0)') { el.style.color = computed.color || '#000000'; } } }); const contentDiv = clonedDoc.querySelector('#pdf-content'); if (contentDiv) { const originalContent = popupElement; const originalComputed = window.getComputedStyle(originalContent); contentDiv.style.backgroundColor = originalComputed.backgroundColor || '#ffffff'; } } }); if (actionButtons) { actionButtons.style.display = originalDisplay; } 
                                                if (!canvas || canvas.width === 0 || canvas.height === 0) { throw new Error('Failed to capture element'); } console.log('Canvas created:', canvas.width, 'x', canvas.height); const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height); const data = imageData.data; let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0; let found = false; for (let y = 0; y < canvas.height; y++) { for (let x = 0; x < canvas.width; x++) { const alpha = data[(y * canvas.width + x) * 4 + 3]; 
                                                if (alpha > 0) { found = true; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } } } if (!found) { minX = 0; minY = 0; maxX = canvas.width; maxY = canvas.height; } const contentWidth = maxX - minX + 1; const contentHeight = maxY - minY + 1; console.log('Content bounds:', minX, minY, maxX, maxY); console.log('Content size:', contentWidth, 'x', contentHeight); const croppedCanvas = document.createElement('canvas'); croppedCanvas.width = contentWidth; croppedCanvas.height = contentHeight; const croppedCtx = croppedCanvas.getContext('2d'); 
                                                croppedCtx.drawImage(canvas, minX, minY, contentWidth, contentHeight, 0, 0, contentWidth, contentHeight); const padding = 40; const targetWidth = Math.max(contentWidth + 200, 1200); const targetHeight = contentHeight + (padding * 2); const centerX = (targetWidth - contentWidth) / 2; const centerY = padding; const centeredCanvas = document.createElement('canvas'); centeredCanvas.width = targetWidth; centeredCanvas.height = targetHeight; const ctx = centeredCanvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, centeredCanvas.width, centeredCanvas.height); ctx.drawImage(croppedCanvas, centerX, centerY); 
                                                console.log('Canvas created:', centeredCanvas.width, 'x', centeredCanvas.height); console.log('Content drawn at:', centerX, centerY); console.log('Content width:', contentWidth, 'Canvas width:', targetWidth); const imgData = centeredCanvas.toDataURL('image/png', 1.0); if (!imgData || imgData.length < 100) { throw new Error('Failed to convert canvas to image'); } console.log('Creating PNG image...'); const fileName = `t3wn-store-${selectedStore.storename?.replace(/[^a-z0-9]/gi, '-') || 'store'}.png`; console.log('Saving PNG:', fileName); const link = document.createElement('a'); link.download = fileName; link.href = imgData; 
                                                document.body.appendChild(link); link.click(); document.body.removeChild(link); console.log('PNG download completed successfully'); } catch (error) { console.error('PNG generation error:', error); alert(`Failed to generate PNG. Error: ${error.message}\n\nPlease check the browser console for more details.`); } };
  const handleApplySubmit = async (e) => { e.preventDefault(); try { const response = await fetch(`${API_OPEN_BASE_URL}/support/t3wn/store`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(applyForm) }); if (response.ok) { alert('Application submitted successfully!'); setApplyForm({ name: '', phone: '', email: '' }); } else { alert('Failed to submit application'); } } catch (error) { console.error('Error submitting application:', error); alert('Error submitting application'); } };
  const handleSupportSubmit = async (e) => { e.preventDefault(); try { const response = await fetch(`${API_OPEN_BASE_URL}/support/t3wn/help`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supportForm) }); if (response.ok) { alert('Support request submitted successfully!'); setSupportForm({ name: '', phone: '', email: '', description: '' }); } else { alert('Failed to submit support request'); } } catch (error) { console.error('Error submitting support request:', error); alert('Error submitting support request'); } };
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 text-gray-900 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      <nav className="sticky top-0 z-50 glass-effect shadow-xl border-b border-orange-200/50 px-4 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <a href="/ar" className="group flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm font-semibold relative overflow-hidden flex-shrink-0">
            <span className="relative z-10">عربي</span>
            <span className="text-base md:text-lg relative z-10">🌐</span>
            <div className="absolute inset-0 animate-shimmer"></div>
          </a>
          <div className="relative flex-shrink-0 max-w-[60px] md:max-w-[80px] lg:max-w-[100px]">
            <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-xl"></div>
            <img src={logo} alt="Logo" className="relative h-10 md:h-12 lg:h-14 w-full max-w-full object-contain animate-spin-slow drop-shadow-2xl" />
          </div>
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-wrap justify-end flex-1 min-w-0">
            <button onClick={() => scrollToSection('support-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaHeadset className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">Support</span>
            </button>
            <button onClick={() => scrollToSection('download-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaDownload className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">Download</span>
            </button>
            <button onClick={() => scrollToSection('search-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaSearch className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">Search</span>
            </button>
            <button onClick={() => scrollToSection('partner-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaHandshake className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">Partner</span>
            </button>
          </div>
        </div>
      </nav>
      <section id="download-section" className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-start gap-8 animate-fade-in">
            <div className="text-center md:text-left mb-6">
              <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🚀 Get Started</div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gradient mb-4 leading-tight">Welcome to T3WN</h1>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">Download our app and start shopping with ease</p>
              <p className="text-base md:text-lg text-gray-500 mt-2">Experience the future of online shopping</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href="https://android.com/t3wn" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-gradient-to-r from--500 bg-black text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-bold text-base relative overflow-hidden">
                <img src={android} alt="Android" className="w-9 h-9 relative z-10" />
                <span className="relative z-10">Download Android</span>
                <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </a>
              <a href="https://ios.com/t3wn" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-bold text-base relative overflow-hidden">
                <img src={apple} alt="iOS" className="w-9 h-9 relative z-10" />
                <span className="relative z-10">Download iOS</span>
                <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </a>
            </div>
            <div className="w-full max-w-lg mt-6 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img src={ensample} alt="Sample" className="relative w-full rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500 border-4 border-white" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center relative">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 border-4 border-orange-100">
                <QRCodeSVG value="https://t3wn.com" size={320} level="H" includeMargin={true} imageSettings={{ src: qrlogo, height: 80, width: 80, excavate: true, }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="videos-section" className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-4 md:px-8 py-16 md:py-24 relative">
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🤝 Partnership</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-3">Become a Partner</h2>
            <p className="text-xl text-gray-600 font-medium">Join our growing network of successful businesses</p>
          </div>
          <button onClick={() => scrollToSection('partner-section')} className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-10 py-5 rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 hover:-translate-y-1 font-bold text-lg relative overflow-hidden">
            <span className="relative z-10">Click here to view details</span>
            <FaHandshake className="text-xl relative z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
          <div className="relative w-full max-w-xl group">
            <div className="absolute -inset-3 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video src={envedpartnter} autoPlay loop muted={partnerVideoMuted} playsInline className="w-full" />
            </div>
            <button onClick={() => setPartnerVideoMuted(!partnerVideoMuted)} className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-md text-white px-6 py-3.5 rounded-full hover:bg-black/90 transition-all duration-300 shadow-xl font-semibold border-2 border-white/20 hover:border-white/40">
              {partnerVideoMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">🔍 Discovery</div>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">Search Stores</h2>
            <p className="text-xl text-gray-600 font-medium">Discover amazing stores and unique products</p>
          </div>
          <button onClick={() => scrollToSection('search-section')} className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-10 py-5 rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 hover:-translate-y-1 font-bold text-lg relative overflow-hidden">
            <span className="relative z-10">Click here to search stores</span>
            <FaSearch className="text-xl relative z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
          <div className="relative w-full max-w-xl group">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video src={envedsearch} autoPlay loop muted={searchVideoMuted} playsInline className="w-full" />
            </div>
            <button onClick={() => setSearchVideoMuted(!searchVideoMuted)} className="absolute bottom-8 right-8 bg-black/80 backdrop-blur-md text-white px-6 py-3.5 rounded-full hover:bg-black/90 transition-all duration-300 shadow-xl font-semibold border-2 border-white/20 hover:border-white/40">
              {searchVideoMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
          </div>
        </div>
      </section>
      <section id="search-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-16 md:py-24 relative">
        <div className="w-full max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🛍️ Explore</div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gradient mb-4">Discover Stores</h2>
            <p className="text-2xl text-gray-600 font-medium">Find amazing stores and shop with ease</p>
          </div>
          <div className="mb-12 relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-orange-500/30 to-orange-600/30 rounded-3xl blur-2xl"></div>
            <div className="relative">
              <div className="absolute left-6 top-1/2 transform -translate-y-1/2 text-orange-400">
                <FaSearch className="text-2xl" />
              </div>
              <input type="text" placeholder="Search for stores..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-16 pr-6 py-5 text-lg border-3 border-orange-200 rounded-3xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200/50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-2xl focus:shadow-orange-500/30 font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                  <FaStore className="text-6xl text-gray-400" />
                </div>
                <p className="text-2xl text-gray-500 font-semibold">No stores found</p>
                <p className="text-gray-400 mt-2">Try a different search term</p>
              </div>
            ) : (
              filteredStores.map((store, index) => (
                <div key={index} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-2 border-orange-100 hover:border-orange-300 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      {store.storelogo ? (
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          <img src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${store.storelogo}`} alt={store.storename} className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-lg">
                          <FaStore className="text-orange-700 text-3xl" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-extrabold text-xl text-gray-800 mb-1">{store.storename}</h3>
                        {store.astorename && (
                          <p className="text-sm text-gray-500 font-medium">{store.astorename}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => window.open(`https://t3wn.com/en/${store.storename}`, '_blank')} className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base relative overflow-hidden group/btn">
                        <span className="relative z-10">Visit</span>
                        <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                      </button>
                      <button onClick={() => { setSelectedStore(store); setShowDownloadPopup(true); }} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300">
                        <FaDownload className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      {showDownloadPopup && selectedStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-0 max-w-2xl w-full shadow-2xl border-4 border-orange-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 opacity-10"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-20"></div>
            <button onClick={() => setShowDownloadPopup(false)} className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-2xl font-bold border-2 border-gray-200 hover:border-gray-300">
              ×
            </button>
            <div className="relative bg-white rounded-3xl" ref={downloadPopupRef} id="pdf-content">
              <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-12 pb-8 px-8 md:px-12 border-b-2 border-orange-100">
                <div className="text-center">
                  {selectedStore.storelogo ? (
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-30"></div>
                        <img src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${selectedStore.storelogo}`} alt={selectedStore.storename} className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-30"></div>
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                          <FaStore className="text-white text-4xl" />
                        </div>
                      </div>
                    </div>
                  )}
                  <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-3">Welcome to {selectedStore.storename}</h2>
                  <p className="text-lg text-gray-600 font-medium">Scan the QR code below to visit our store</p>
                </div>
              </div>
              <div className="flex justify-center py-12 px-8 md:px-12 bg-white">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-20"></div>
                  <div className="relative p-6 bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl border-4 border-orange-200 shadow-xl">
                    <QRCodeSVG value={`https://t3wn.com/en/${selectedStore.storename}`} size={280} level="H" includeMargin={true} imageSettings={{ src: qrlogo, height: 70, width: 70, excavate: true, }} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white py-6 px-8 md:px-12 border-t-2 border-orange-100">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">Store URL</p>
                  <div className="inline-block px-6 py-3 bg-white rounded-xl border-2 border-orange-200 shadow-md">
                    <p className="text-base font-bold text-orange-600 break-all">https://t3wn.com/en/{selectedStore.storename}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-8 text-center">
                <p className="text-white text-sm font-semibold">Powered by T3WN</p>
              </div>
              <div className="flex gap-3 p-6 bg-gray-50 border-t-2 border-gray-200" id="action-buttons">
                <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-base">
                  <FaFileDownload className="text-xl" />
                  <span>Download PNG</span>
                </button>
                <button onClick={() => window.open(`https://t3wn.com/en/${selectedStore.storename}`, '_blank')} className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-base">
                  Visit Store
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section id="partner-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 bg-gradient-to-br from-slate-100 via-white to-orange-50/50">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">Become a Partner</h2>
            <p className="text-xl text-gray-600">Join our platform and grow your business</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 ml-auto">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Required Documents</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(endetails.requireddocs).map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-left">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Fees</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(endetails.requiredfees).map((fee, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{fee}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 ml-auto">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Policy</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(endetails.requiredpolicy).map((policy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">Apply Now</h2>
              <form onSubmit={handleApplySubmit} className="space-y-5 max-w-2xl mx-auto">
                <input type="text" placeholder="Name" value={applyForm.name} onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <input type="tel" placeholder="Phone" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <input type="email" placeholder="Email" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section id="support-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 bg-gradient-to-br from-white via-orange-50/30 to-white">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-xl mb-6">
              <FaHeadset className="text-6xl text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">Describe your issue</h2>
            <p className="text-xl text-gray-600">We're here to help you</p>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
            <form onSubmit={handleSupportSubmit} className="relative space-y-5">
              <input type="text" placeholder="Name" value={supportForm.name} onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <input type="tel" placeholder="Phone" value={supportForm.phone} onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <input type="email" placeholder="Email" value={supportForm.email} onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <textarea placeholder="Description" value={supportForm.description} onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })} required rows={6} className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 resize-none bg-gray-50 focus:bg-white" />
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h3 className="text-center text-3xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">Follow us</h3>
          <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
            <button onClick={() => setShowSocialPopup('facebook')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaFacebook className="text-2xl" />
              <span className="hidden md:inline font-semibold">Facebook</span>
            </button>
            <button onClick={() => setShowSocialPopup('instgram')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaInstagram className="text-2xl" />
              <span className="hidden md:inline font-semibold">Instagram</span>
            </button>
            <button onClick={() => setShowSocialPopup('tiktok')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaTiktok className="text-2xl" />
              <span className="hidden md:inline font-semibold">TikTok</span>
            </button>
            <button onClick={() => setShowSocialPopup('x')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaTwitter className="text-2xl" />
              <span className="hidden md:inline font-semibold">X</span>
            </button>
            <button onClick={() => setShowSocialPopup('youtube')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaYoutube className="text-2xl" />
              <span className="hidden md:inline font-semibold">YouTube</span>
            </button>
          </div>
        </div>
      </footer>
      {showSocialPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur opacity-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setShowSocialPopup(null)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 hover:text-gray-800 transition-all duration-300 font-semibold">
                  <FaArrowLeft />
                  <span>Back</span>
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 capitalize bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">{showSocialPopup}</h2>
                <p className="text-gray-600 mb-8 text-lg">{channels[showSocialPopup]}</p>
                <a href={`https://${channels[showSocialPopup]}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                  Visit {showSocialPopup}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export const Ar = () => {
  const [stores, setStores] = useState([]); const [searchTerm, setSearchTerm] = useState(''); const [filteredStores, setFilteredStores] = useState([]); const [selectedStore, setSelectedStore] = useState(null); const [showDownloadPopup, setShowDownloadPopup] = useState(false); const [showSocialPopup, setShowSocialPopup] = useState(null); const [partnerVideoMuted, setPartnerVideoMuted] = useState(true); const [searchVideoMuted, setSearchVideoMuted] = useState(true); const [applyForm, setApplyForm] = useState({ name: '', phone: '', email: '' }); const [supportForm, setSupportForm] = useState({ name: '', phone: '', email: '', description: '' }); const downloadPopupRef = useRef(null);
  useEffect(() => { const fetchStores = async () => { try { const response = await fetch(`${API_OPEN_BASE_URL}/t3wn/profile`); if (response.ok) { const data = await response.json(); const storeList = Array.isArray(data) ? data.map(item => item.store || item).filter(Boolean) : []; setStores(storeList); setFilteredStores(storeList.slice(0, 5)); } else { console.error('Failed to fetch stores:', response.status); } } catch (error) { console.error('Error fetching stores:', error); } }; fetchStores(); }, []);
  useEffect(() => { if (searchTerm.trim() === '') { const randomStores = [...stores].sort(() => 0.5 - Math.random()).slice(0, 5); setFilteredStores(randomStores); } else { const filtered = stores.filter(store => store.storename?.toLowerCase().includes(searchTerm.toLowerCase()) || store.astorename?.toLowerCase().includes(searchTerm.toLowerCase())); setFilteredStores(filtered.slice(0, 10)); } }, [searchTerm, stores]);
  const handleDownloadPDF = async () => { if (!downloadPopupRef.current || !selectedStore) { alert('Error: Missing store information'); return; } try { const popupElement = downloadPopupRef.current; if (!popupElement) { throw new Error('Popup element not found'); } const actionButtons = popupElement.querySelector('#action-buttons'); const originalDisplay = actionButtons?.style.display || ''; if (actionButtons) { actionButtons.style.display = 'none'; } await new Promise(resolve => setTimeout(resolve, 300)); console.log('Capturing element for PNG...'); await new Promise(resolve => setTimeout(resolve, 1500)); const images = popupElement.querySelectorAll('img'); await Promise.all(Array.from(images).map(img => { 
                            if (img.complete) return Promise.resolve(); return new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; setTimeout(resolve, 3000); }); })); const svgs = popupElement.querySelectorAll('svg'); if (svgs.length > 0) { await new Promise(resolve => setTimeout(resolve, 500)); } const rect = popupElement.getBoundingClientRect(); console.log('Original element dimensions:', rect.width, 'x', rect.height); console.log('Original element position:', rect.top, rect.left); if (rect.width === 0 || rect.height === 0) { throw new Error('Element has no dimensions'); } if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) 
                            { popupElement.scrollIntoView({ behavior: 'instant', block: 'center' }); await new Promise(resolve => setTimeout(resolve, 300)); } const canvas = await html2canvas(popupElement, { scale: 2, backgroundColor: '#ffffff', logging: false, useCORS: true, allowTaint: true, removeContainer: false, imageTimeout: 30000, foreignObjectRendering: true, scrollX: 0, scrollY: 0, width: rect.width, height: rect.height, onclone: (clonedDoc, element) => { const buttonsInClone = clonedDoc.querySelector('#action-buttons'); if (buttonsInClone) { buttonsInClone.remove(); } const clonedImages = clonedDoc.querySelectorAll('img'); clonedImages.forEach(img => { if (img.src && !img.complete) { img.src = img.src; } }); 
                            const svgs = clonedDoc.querySelectorAll('svg'); console.log('Found SVGs in clone:', svgs.length); svgs.forEach((svg, index) => { svg.style.display = 'block'; svg.style.visibility = 'visible'; const originalSvgs = popupElement.querySelectorAll('svg'); if (originalSvgs[index]) { const originalSvg = originalSvgs[index]; const computedStyle = window.getComputedStyle(originalSvg); const rect = originalSvg.getBoundingClientRect(); svg.style.width = (rect.width || computedStyle.width || '300') + 'px'; svg.style.height = (rect.height || computedStyle.height || '300') + 'px'; if (originalSvg.getAttribute('viewBox')) { svg.setAttribute('viewBox', originalSvg.getAttribute('viewBox')); } } }); 
                            const allElements = clonedDoc.querySelectorAll('*'); allElements.forEach(el => { const computed = window.getComputedStyle(el); if (computed.display === 'none') { el.style.display = 'block'; } if (computed.visibility === 'hidden') { el.style.visibility = 'visible'; } if (el.tagName === 'P' || el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.tagName === 'SPAN') { if (!computed.color || computed.color === 'rgba(0, 0, 0, 0)') { el.style.color = computed.color || '#000000'; } } }); const contentDiv = clonedDoc.querySelector('#pdf-content'); if (contentDiv) { const originalContent = popupElement; 
                            const originalComputed = window.getComputedStyle(originalContent); contentDiv.style.backgroundColor = originalComputed.backgroundColor || '#ffffff'; } } }); if (actionButtons) { actionButtons.style.display = originalDisplay; } if (!canvas || canvas.width === 0 || canvas.height === 0) { throw new Error('Failed to capture element'); } console.log('Canvas created:', canvas.width, 'x', canvas.height); const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height); const data = imageData.data; let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0; let found = false; for (let y = 0; y < canvas.height; y++) { for (let x = 0; x < canvas.width; x++) 
                            { const alpha = data[(y * canvas.width + x) * 4 + 3]; if (alpha > 0) { found = true; minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } } } if (!found) { minX = 0; minY = 0; maxX = canvas.width; maxY = canvas.height; } const contentWidth = maxX - minX + 1; const contentHeight = maxY - minY + 1; console.log('Content bounds:', minX, minY, maxX, maxY); console.log('Content size:', contentWidth, 'x', contentHeight); const croppedCanvas = document.createElement('canvas'); croppedCanvas.width = contentWidth; croppedCanvas.height = contentHeight; const croppedCtx = croppedCanvas.getContext('2d'); croppedCtx.drawImage(canvas, minX, minY, contentWidth, contentHeight, 0, 0, contentWidth, contentHeight); 
                            const padding = 40; const targetWidth = Math.max(contentWidth + 200, 1200); const targetHeight = contentHeight + (padding * 2); const centerX = (targetWidth - contentWidth) / 2; const centerY = padding; const centeredCanvas = document.createElement('canvas'); centeredCanvas.width = targetWidth; centeredCanvas.height = targetHeight; const ctx = centeredCanvas.getContext('2d'); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, centeredCanvas.width, centeredCanvas.height); ctx.drawImage(croppedCanvas, centerX, centerY); console.log('Canvas created:', centeredCanvas.width, 'x', centeredCanvas.height); console.log('Content drawn at:', centerX, centerY); console.log('Content width:', contentWidth, 'Canvas width:', targetWidth); 
                            const imgData = centeredCanvas.toDataURL('image/png', 1.0); if (!imgData || imgData.length < 100) { throw new Error('Failed to convert canvas to image'); } console.log('Creating PNG image...'); const fileName = `t3wn-store-${selectedStore.storename?.replace(/[^a-z0-9]/gi, '-') || 'store'}.png`; console.log('Saving PNG:', fileName); const link = document.createElement('a'); link.download = fileName; link.href = imgData; document.body.appendChild(link); link.click(); document.body.removeChild(link); console.log('PNG download completed successfully'); } catch (error) { console.error('PNG generation error:', error); alert(`Failed to generate PNG. Error: ${error.message}\n\nPlease check the browser console for more details.`); } };
  const handleApplySubmit = async (e) => { e.preventDefault(); try { const response = await fetch(`${API_OPEN_BASE_URL}/support/t3wn/store`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(applyForm) }); if (response.ok) { alert('تم إرسال الطلب بنجاح!'); setApplyForm({ name: '', phone: '', email: '' }); } else { alert('فشل إرسال الطلب'); } } catch (error) { console.error('Error submitting application:', error); alert('خطأ في إرسال الطلب'); } };
  const handleSupportSubmit = async (e) => { e.preventDefault(); try { const response = await fetch(`${API_OPEN_BASE_URL}/support/t3wn/help`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(supportForm) }); if (response.ok) { alert('تم إرسال طلب الدعم بنجاح!'); setSupportForm({ name: '', phone: '', email: '', description: '' }); } else { alert('فشل إرسال طلب الدعم'); } } catch (error) { console.error('Error submitting support request:', error); alert('خطأ في إرسال طلب الدعم'); } };
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50/30 text-gray-900 relative overflow-x-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-orange-200/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/2 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
      </div>
      <nav className="sticky top-0 z-50 glass-effect shadow-xl border-b border-orange-200/50 px-4 md:px-8 py-3 md:py-4 bg-white/80 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center gap-1.5 md:gap-2 lg:gap-3 flex-wrap flex-1 min-w-0">
            <button onClick={() => scrollToSection('support-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaHeadset className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">الدعم</span>
            </button>
            <button onClick={() => scrollToSection('download-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaDownload className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">تحميل</span>
            </button>
            <button onClick={() => scrollToSection('search-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaSearch className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">بحث</span>
            </button>
            <button onClick={() => scrollToSection('partner-section')} className="group flex items-center gap-1.5 md:gap-2 px-3 md:px-4 lg:px-5 py-2 md:py-2.5 rounded-full bg-white/90 hover:bg-gradient-to-r hover:from-orange-500 hover:to-orange-600 hover:text-white text-gray-700 transition-all duration-300 text-xs md:text-sm font-semibold shadow-md hover:shadow-xl transform hover:scale-105 border border-gray-200/50 hover:border-transparent whitespace-nowrap">
              <FaHandshake className="text-xs md:text-sm lg:text-base transition-transform group-hover:scale-110 flex-shrink-0" />
              <span className="hidden sm:inline">شريك</span>
            </button>
          </div>
          <div className="relative flex-shrink-0 max-w-[60px] md:max-w-[80px] lg:max-w-[100px]">
            <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-xl"></div>
            <img src={logo} alt="Logo" className="relative h-10 md:h-12 lg:h-14 w-full max-w-full object-contain animate-spin-slow drop-shadow-2xl" />
          </div>
          <a href="/en" className="group flex items-center gap-2 px-3 md:px-5 py-2 md:py-2.5 rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 text-xs md:text-sm font-semibold relative overflow-hidden flex-shrink-0">
            <span className="relative z-10">English</span>
            <span className="text-base md:text-lg relative z-10">🌐</span>
            <div className="absolute inset-0 animate-shimmer"></div>
          </a>
        </div>
      </nav>
      <section id="download-section" className="min-h-screen flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
        <div className="w-full max-w-7xl flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
          <div className="w-full md:w-1/2 flex flex-col items-center md:items-end gap-8 animate-fade-in">
            <div className="text-center md:text-right mb-6">
              <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🚀 ابدأ الآن</div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gradient mb-4 leading-tight">مرحباً بك في T3WN</h1>
              <p className="text-xl md:text-2xl text-gray-600 font-medium">حمّل تطبيقنا وابدأ التسوق بسهولة</p>
              <p className="text-base md:text-lg text-gray-500 mt-2">اختبر مستقبل التسوق الإلكتروني</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <a href="https://android.com/t3wn" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-gradient-to-r from--500 bg-black text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-bold text-base relative overflow-hidden">
                <img src={android} alt="Android" className="w-9 h-9 relative z-10" />
                <span className="relative z-10">تحميل أندرويد</span>
                <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </a>
              <a href="https://ios.com/t3wn" target="_blank" rel="noopener noreferrer" className="group flex items-center justify-center gap-3 bg-black text-white px-8 py-5 rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 hover:-translate-y-1 font-bold text-base relative overflow-hidden">
                <img src={apple} alt="iOS" className="w-9 h-9 relative z-10" />
                <span className="relative z-10">تحميل iOS</span>
                <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              </a>
            </div>
            <div className="w-full max-w-lg mt-6 relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 to-orange-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <img src={arsample} alt="Sample" className="relative w-full rounded-3xl shadow-2xl transform hover:scale-[1.02] transition-all duration-500 border-4 border-white" />
            </div>
          </div>
          <div className="w-full md:w-1/2 flex justify-center items-center relative">
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity animate-pulse"></div>
              <div className="relative p-10 bg-white rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-500 border-4 border-orange-100">
                <QRCodeSVG value="https://t3wn.com/ar" size={320} level="H" includeMargin={true} imageSettings={{ src: qrlogo, height: 80, width: 80, excavate: true, }} />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="videos-section" className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 px-4 md:px-8 py-16 md:py-24 relative">
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🤝 الشراكة</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gradient mb-3">كن شريكاً</h2>
            <p className="text-xl text-gray-600 font-medium">انضم إلى شبكتنا المتنامية من الشركات الناجحة</p>
          </div>
          <button onClick={() => scrollToSection('partner-section')} className="group flex items-center gap-3 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-10 py-5 rounded-2xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-2xl hover:shadow-orange-500/50 transform hover:scale-105 hover:-translate-y-1 font-bold text-lg relative overflow-hidden">
            <span className="relative z-10">انقر هنا لعرض التفاصيل</span>
            <FaHandshake className="text-xl relative z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
          <div className="relative w-full max-w-xl group">
            <div className="absolute -inset-3 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video src={arvedpartnter} autoPlay loop muted={partnerVideoMuted} playsInline className="w-full" />
            </div>
            <button onClick={() => setPartnerVideoMuted(!partnerVideoMuted)} className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md text-white px-6 py-3.5 rounded-full hover:bg-black/90 transition-all duration-300 shadow-xl font-semibold border-2 border-white/20 hover:border-white/40">
              {partnerVideoMuted ? '🔇 إلغاء كتم الصوت' : '🔊 كتم الصوت'}
            </button>
          </div>
        </div>
        <div className="w-full md:w-1/2 flex flex-col items-center gap-8 relative z-10">
          <div className="text-center mb-6">
            <div className="inline-block px-4 py-2 bg-blue-100 rounded-full text-blue-600 text-sm font-semibold mb-4">🔍 الاستكشاف</div>
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">البحث عن المتاجر</h2>
            <p className="text-xl text-gray-600 font-medium">اكتشف متاجر رائعة ومنتجات فريدة</p>
          </div>
          <button onClick={() => scrollToSection('search-section')} className="group flex items-center gap-3 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white px-10 py-5 rounded-2xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 hover:-translate-y-1 font-bold text-lg relative overflow-hidden">
            <span className="relative z-10">انقر هنا للبحث عن المتاجر</span>
            <FaSearch className="text-xl relative z-10 transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
          </button>
          <div className="relative w-full max-w-xl group">
            <div className="absolute -inset-3 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video src={arvedsearch} autoPlay loop muted={searchVideoMuted} playsInline className="w-full" />
            </div>
            <button onClick={() => setSearchVideoMuted(!searchVideoMuted)} className="absolute bottom-8 left-8 bg-black/80 backdrop-blur-md text-white px-6 py-3.5 rounded-full hover:bg-black/90 transition-all duration-300 shadow-xl font-semibold border-2 border-white/20 hover:border-white/40">
              {searchVideoMuted ? '🔇 إلغاء كتم الصوت' : '🔊 كتم الصوت'}
            </button>
          </div>
        </div>
      </section>
      <section id="search-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-16 md:py-24 relative">
        <div className="w-full max-w-7xl relative z-10">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-orange-100 rounded-full text-orange-600 text-sm font-semibold mb-4">🛍️ استكشف</div>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gradient mb-4">اكتشف المتاجر</h2>
            <p className="text-2xl text-gray-600 font-medium">ابحث عن متاجر رائعة وتسوق بسهولة</p>
          </div>
          <div className="mb-12 relative max-w-3xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-400/30 via-orange-500/30 to-orange-600/30 rounded-3xl blur-2xl"></div>
            <div className="relative">
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 text-orange-400">
                <FaSearch className="text-2xl" />
              </div>
              <input type="text" placeholder="ابحث عن المتاجر..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-6 pr-16 py-5 text-lg border-3 border-orange-200 rounded-3xl focus:border-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-200/50 transition-all duration-300 bg-white/95 backdrop-blur-sm shadow-2xl focus:shadow-orange-500/30 font-medium" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStores.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="inline-block p-6 bg-gray-100 rounded-full mb-6">
                  <FaStore className="text-6xl text-gray-400" />
                </div>
                <p className="text-2xl text-gray-500 font-semibold">لم يتم العثور على متاجر</p>
                <p className="text-gray-400 mt-2">جرب مصطلح بحث مختلف</p>
              </div>
            ) : (
              filteredStores.map((store, index) => (
                <div key={index} className="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 border-2 border-orange-100 hover:border-orange-300 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-transparent rounded-br-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-5 mb-6">
                      {store.storelogo ? (
                        <div className="relative">
                          <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                          <img src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${store.storelogo}`} alt={store.astorename || store.storename} className="relative w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg" onError={(e) => e.target.style.display = 'none'} />
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-lg">
                          <FaStore className="text-orange-700 text-3xl" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="font-extrabold text-xl text-gray-800 mb-1">{store.astorename || store.storename}</h3>
                        {store.storename && store.astorename && (
                          <p className="text-sm text-gray-500 font-medium">{store.storename}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => window.open(`https://t3wn.com/ar/${store.storename}`, '_blank')} className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-xl font-bold text-base relative overflow-hidden group/btn">
                        <span className="relative z-10">زيارة</span>
                        <div className="absolute inset-0 bg-white/20 transform translate-x-full group-hover/btn:translate-x-0 transition-transform duration-500"></div>
                      </button>
                      <button onClick={() => { setSelectedStore(store); setShowDownloadPopup(true); }} className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-6 py-4 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-gray-200 hover:border-gray-300">
                        <FaDownload className="text-lg" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
      {showDownloadPopup && selectedStore && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-0 max-w-2xl w-full shadow-2xl border-4 border-orange-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 opacity-10"></div>
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-20"></div>
            <button onClick={() => setShowDownloadPopup(false)} className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center bg-white/90 hover:bg-white rounded-full text-gray-600 hover:text-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-2xl font-bold border-2 border-gray-200 hover:border-gray-300">
              ×
            </button>
            <div className="relative bg-white rounded-3xl" ref={downloadPopupRef} id="pdf-content">
              <div className="bg-gradient-to-br from-orange-50 via-white to-orange-50 pt-12 pb-8 px-8 md:px-12 border-b-2 border-orange-100">
                <div className="text-center">
                  {selectedStore.storelogo ? (
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-30"></div>
                        <img src={`${API_OPEN_BASE_URL}/t3wn/profile/storelogo/${selectedStore.storelogo}`} alt={selectedStore.astorename || selectedStore.storename} className="relative w-24 h-24 rounded-full object-cover border-4 border-white shadow-xl" onError={(e) => e.target.style.display = 'none'} />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex justify-center">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full blur-xl opacity-30"></div>
                        <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-orange-300 via-orange-400 to-orange-500 flex items-center justify-center border-4 border-white shadow-xl">
                          <FaStore className="text-white text-4xl" />
                        </div>
                      </div>
                    </div>
                  )}
                  <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent mb-3">مرحباً بك في {selectedStore.astorename || selectedStore.storename}</h2>
                  <p className="text-lg text-gray-600 font-medium">امسح رمز QR أدناه لزيارة متجرنا</p>
                </div>
              </div>
              <div className="flex justify-center py-12 px-8 md:px-12 bg-white">
                <div className="relative">
                  <div className="absolute -inset-6 bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-3xl blur-2xl opacity-20"></div>
                  <div className="relative p-6 bg-gradient-to-br from-orange-50 via-white to-orange-50 rounded-3xl border-4 border-orange-200 shadow-xl">
                    <QRCodeSVG value={`https://t3wn.com/ar/${selectedStore.storename}`} size={280} level="H" includeMargin={true} imageSettings={{ src: qrlogo, height: 70, width: 70, excavate: true, }} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-white py-6 px-8 md:px-12 border-t-2 border-orange-100">
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">رابط المتجر</p>
                  <div className="inline-block px-6 py-3 bg-white rounded-xl border-2 border-orange-200 shadow-md">
                    <p className="text-base font-bold text-orange-600 break-all">https://t3wn.com/ar/{selectedStore.storename}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 py-4 px-8 text-center">
                <p className="text-white text-sm font-semibold">مدعوم من T3WN</p>
              </div>
              <div className="flex gap-3 p-6 bg-gray-50 border-t-2 border-gray-200" id="action-buttons">
                <button onClick={handleDownloadPDF} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-600 hover:via-blue-700 hover:to-blue-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-base">
                  <FaFileDownload className="text-xl" />
                  <span>تحميل PNG</span>
                </button>
                <button onClick={() => window.open(`https://t3wn.com/ar/${selectedStore.storename}`, '_blank')} className="flex-1 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105 font-bold text-base">
                  زيارة المتجر
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      <section id="partner-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 bg-gradient-to-br from-slate-100 via-white to-orange-50/50">
        <div className="w-full max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">كن شريكاً</h2>
            <p className="text-xl text-gray-600">انضم إلى منصتنا ونمّي عملك</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center mb-4 ml-auto">
                <span className="text-2xl">📄</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">المستندات المطلوبة</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(ardetails.requireddocs).map((doc, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-orange-500 mt-1">•</span>
                    <span>{doc}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mb-4 ml-auto">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">الرسوم</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(ardetails.requiredfees).map((fee, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">•</span>
                    <span>{fee}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100 text-right">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mb-4 ml-auto">
                <span className="text-2xl">📋</span>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">السياسة</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                {Object.values(ardetails.requiredpolicy).map((policy, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
            <div className="relative">
              <h2 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">تقديم الآن</h2>
              <form onSubmit={handleApplySubmit} className="space-y-5 max-w-2xl mx-auto">
                <input type="text" placeholder="الاسم" value={applyForm.name} onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <input type="tel" placeholder="الهاتف" value={applyForm.phone} onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <input type="email" placeholder="البريد الإلكتروني" value={applyForm.email} onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
                <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                  تقديم
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
      <section id="support-section" className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12 md:py-20 bg-gradient-to-br from-white via-orange-50/30 to-white">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-12">
            <div className="inline-block p-6 bg-gradient-to-br from-orange-400 to-orange-600 rounded-3xl shadow-xl mb-6">
              <FaHeadset className="text-6xl text-white" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent mb-4">اشرح مشكلتك</h2>
            <p className="text-xl text-gray-600">نحن هنا لمساعدتك</p>
          </div>
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-orange-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-orange-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
            <form onSubmit={handleSupportSubmit} className="relative space-y-5">
              <input type="text" placeholder="الاسم" value={supportForm.name} onChange={(e) => setSupportForm({ ...supportForm, name: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <input type="tel" placeholder="الهاتف" value={supportForm.phone} onChange={(e) => setSupportForm({ ...supportForm, phone: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <input type="email" placeholder="البريد الإلكتروني" value={supportForm.email} onChange={(e) => setSupportForm({ ...supportForm, email: e.target.value })} required className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 bg-gray-50 focus:bg-white" />
              <textarea placeholder="الوصف" value={supportForm.description} onChange={(e) => setSupportForm({ ...supportForm, description: e.target.value })} required rows={6} className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all duration-300 resize-none bg-gray-50 focus:bg-white" />
              <button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                إرسال
              </button>
            </form>
          </div>
        </div>
      </section>
      <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 px-4 md:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <h3 className="text-center text-3xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">تابعنا</h3>
          <div className="flex justify-center gap-4 md:gap-6 flex-wrap">
            <button onClick={() => setShowSocialPopup('facebook')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaFacebook className="text-2xl" />
              <span className="hidden md:inline font-semibold">فيسبوك</span>
            </button>
            <button onClick={() => setShowSocialPopup('instgram')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl hover:from-pink-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaInstagram className="text-2xl" />
              <span className="hidden md:inline font-semibold">إنستغرام</span>
            </button>
            <button onClick={() => setShowSocialPopup('tiktok')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl hover:from-gray-900 hover:to-black transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaTiktok className="text-2xl" />
              <span className="hidden md:inline font-semibold">تيك توك</span>
            </button>
            <button onClick={() => setShowSocialPopup('x')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 rounded-xl hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaTwitter className="text-2xl" />
              <span className="hidden md:inline font-semibold">إكس</span>
            </button>
            <button onClick={() => setShowSocialPopup('youtube')} className="group flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105">
              <FaYoutube className="text-2xl" />
              <span className="hidden md:inline font-semibold">يوتيوب</span>
            </button>
          </div>
        </div>
      </footer>
      {showSocialPopup && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-orange-100 relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-3xl blur opacity-20"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-6">
                <button onClick={() => setShowSocialPopup(null)} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-600 hover:text-gray-800 transition-all duration-300 font-semibold">
                  <FaArrowLeft />
                  <span>رجوع</span>
                </button>
              </div>
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4 capitalize bg-gradient-to-r from-orange-500 to-orange-700 bg-clip-text text-transparent">{showSocialPopup}</h2>
                <p className="text-gray-600 mb-8 text-lg">{channels[showSocialPopup]}</p>
                <a href={`https://${channels[showSocialPopup]}`} target="_blank" rel="noopener noreferrer" className="inline-block bg-gradient-to-r from-orange-500 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-lg">
                  زيارة {showSocialPopup}
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
