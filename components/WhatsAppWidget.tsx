"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";

interface WhatsAppWidgetProps {
  whatsappNumber?: string | null;
}

export default function WhatsAppWidget({ whatsappNumber }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  if (!whatsappNumber) {
    return null;
  }

  const preFilledMessage = "Hello Petora BD, I need some help regarding your products.";
  
  let sanitizedNumber = whatsappNumber.replace(/[^0-9]/g, "");
  
  if (sanitizedNumber.startsWith("01") && sanitizedNumber.length === 11) {
    sanitizedNumber = "88" + sanitizedNumber;
  }
  
  const whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(preFilledMessage)}`;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        widgetRef.current &&
        !widgetRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      // 🟢 ADDED: pointer-events-none to prevent invisible wrapper from blocking clicks
      className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end pointer-events-none"
      ref={widgetRef}
    >
      <div
        // 🟢 ADDED: pointer-events-auto when open so inside contents are clickable
        className={`mb-4 w-[calc(100vw-2.5rem)] sm:w-[340px] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right border border-slate-100 ${
          isOpen
            ? "scale-100 opacity-100 visible pointer-events-auto"
            : "scale-50 opacity-0 invisible pointer-events-none"
        }`}
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-white rounded-full flex items-center justify-center font-black text-emerald-600 shadow-sm">
              P
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#25D366] border-2 border-white rounded-full"></span>
            </div>
            <div>
              <h3 className="text-white font-bold text-sm leading-tight tracking-wide">
                Petora BD Support
              </h3>
              <p className="text-emerald-50 text-[10px] sm:text-xs font-medium opacity-90 mt-0.5">
                Typically replies in minutes
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white/80 hover:text-white hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 bg-slate-50 min-h-[120px]">
          <div className="bg-white p-3.5 rounded-2xl rounded-tl-none shadow-sm text-xs sm:text-sm text-slate-700 w-[85%] border border-slate-100 leading-relaxed">
            Hi there! 👋 <br />
            Welcome to Petora BD. How can we help you today?
          </div>
          <p className="text-[10px] font-medium text-slate-400 mt-2 ml-1">
            Just now
          </p>
        </div>

        <div className="p-4 bg-white border-t border-slate-100">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 group"
          >
            <svg
              className="w-5 h-5 sm:w-5 sm:h-5 fill-current group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.128.552 4.195 1.603 6.015L.125 24l6.108-1.599A11.967 11.967 0 0012.031 24c6.647 0 12.03-5.383 12.03-12.031C24.062 5.383 18.679 0 12.031 0zm3.844 17.203c-.168.477-.978.932-1.398.983-.42.051-1.023.153-3.212-.751-2.637-1.088-4.321-3.791-4.453-3.968-.132-.178-1.065-1.417-1.065-2.703 0-1.286.666-1.921.899-2.176.233-.255.508-.318.677-.318.169 0 .338 0 .487.008.158.008.371-.059.579.44.22.525.592 1.447.643 1.549.051.102.085.22.017.355-.068.136-.102.22-.203.339-.102.119-.216.258-.305.339-.102.102-.208.212-.093.411.114.199.508.842 1.092 1.363.754.673 1.385.88 1.589.982.203.102.322.085.44-.051.119-.136.508-.593.644-.796.136-.203.271-.169.457-.102.186.068 1.185.559 1.388.66.203.102.305.153.356.237.051.085.051.492-.119.969z" />
            </svg>
            Start Chat
          </a>
        </div>
      </div>

      {/* 🟢 ADDED: pointer-events-auto for the toggle button so it can be clicked */}
      <div className="relative group pointer-events-auto">
        <div
          className={`absolute -top-12 right-0 bg-slate-800 text-white text-xs font-bold py-2 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none shadow-lg ${
            isOpen ? "hidden" : "hidden sm:block"
          }`}
        >
          Chat with us
          <div className="absolute -bottom-1 right-5 w-2.5 h-2.5 bg-slate-800 transform rotate-45"></div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`w-14 h-14 sm:w-[60px] sm:h-[60px] flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 z-50 cursor-pointer ${
            isOpen
              ? "bg-slate-800 hover:bg-slate-700 rotate-90 scale-90"
              : "bg-[#25D366] hover:bg-[#20bd5a] hover:scale-110"
          }`}
        >
          {isOpen ? (
            <X className="text-white w-6 h-6 sm:w-7 sm:h-7 -rotate-90 transition-transform duration-300" />
          ) : (
            <>
              <svg
                className="w-7 h-7 sm:w-8 sm:h-8 text-white fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.128.552 4.195 1.603 6.015L.125 24l6.108-1.599A11.967 11.967 0 0012.031 24c6.647 0 12.03-5.383 12.03-12.031C24.062 5.383 18.679 0 12.031 0zm3.844 17.203c-.168.477-.978.932-1.398.983-.42.051-1.023.153-3.212-.751-2.637-1.088-4.321-3.791-4.453-3.968-.132-.178-1.065-1.417-1.065-2.703 0-1.286.666-1.921.899-2.176.233-.255.508-.318.677-.318.169 0 .338 0 .487.008.158.008.371-.059.579.44.22.525.592 1.447.643 1.549.051.102.085.22.017.355-.068.136-.102.22-.203.339-.102.119-.216.258-.305.339-.102.102-.208.212-.093.411.114.199.508.842 1.092 1.363.754.673 1.385.88 1.589.982.203.102.322.085.44-.051.119-.136.508-.593.644-.796.136-.203.271-.169.457-.102.186.068 1.185.559 1.388.66.203.102.305.153.356.237.051.085.051.492-.119.969z" />
              </svg>
              <span className="absolute w-full h-full rounded-full bg-[#25D366] opacity-50 animate-ping z-[-1]"></span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}