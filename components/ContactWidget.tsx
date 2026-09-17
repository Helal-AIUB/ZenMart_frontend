"use client";

import { useState, useEffect, useRef } from "react";
import { X, Phone, MessageCircleMore } from "lucide-react";

interface ContactSettings {
  whatsappNumber?: string | null;
  messengerLink?: string | null;
  phoneNumber?: string | null;
}

export default function ContactWidget({ settings }: { settings: ContactSettings }) {
  const [isOpen, setIsOpen] = useState(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  if (!settings?.whatsappNumber && !settings?.messengerLink && !settings?.phoneNumber) {
    return null;
  }

  let whatsappUrl = "#";
  if (settings?.whatsappNumber) {
    let sanitizedNumber = settings.whatsappNumber.replace(/[^0-9]/g, "");
    if (sanitizedNumber.startsWith("01") && sanitizedNumber.length === 11) {
      sanitizedNumber = "88" + sanitizedNumber;
    }
    const preFilledMessage = "Hello Petora BD, I need some help regarding your products.";
    whatsappUrl = `https://wa.me/${sanitizedNumber}?text=${encodeURIComponent(preFilledMessage)}`;
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      ref={widgetRef}
      className="fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3 pointer-events-none"
    >
      <div
        className={`flex flex-col items-end gap-3 transition-all duration-300 origin-bottom ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100 pointer-events-auto"
            : "opacity-0 translate-y-10 scale-50 pointer-events-none absolute bottom-16 right-0"
        }`}
      >
        {settings?.messengerLink && (
          <div className="relative flex items-center justify-end group">
            <span className="absolute right-14 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
              Messenger
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-800 transform -translate-y-1/2 rotate-45"></div>
            </span>
            <a
              href={settings.messengerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0084FF] hover:bg-[#0073e6] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(0,132,255,0.3)] hover:shadow-[0_10px_25px_rgba(0,132,255,0.4)] transition-all hover:scale-110 active:scale-95"
              title="Messenger"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.145 2 11.259c0 2.915 1.493 5.485 3.794 7.152v3.315c0 .356.386.577.69.398l3.351-1.972c.691.192 1.417.295 2.165.295 5.523 0 10-4.145 10-9.259C22 6.145 17.523 2 12 2zm1.093 12.636l-2.61-2.793a.81.81 0 00-1.135-.04l-3.593 2.766c-.461.355-.992-.258-.616-.704l2.973-3.535a1.597 1.597 0 011.168-.537h.005c.42 0 .822.164 1.127.457l2.585 2.502a.812.812 0 001.125.041l3.65-2.81c.46-.355.992.257.616.703l-2.969 3.53a1.603 1.603 0 01-1.173.541h-.005a1.594 1.594 0 01-1.148-.421z" />
              </svg>
            </a>
          </div>
        )}

        {settings?.whatsappNumber && (
          <div className="relative flex items-center justify-end group">
            <span className="absolute right-14 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
              WhatsApp
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-800 transform -translate-y-1/2 rotate-45"></div>
            </span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_10px_25px_rgba(37,211,102,0.4)] transition-all hover:scale-110 active:scale-95"
              title="WhatsApp"
            >
              <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 0C5.383 0 0 5.383 0 12.031c0 2.128.552 4.195 1.603 6.015L.125 24l6.108-1.599A11.967 11.967 0 0012.031 24c6.647 0 12.03-5.383 12.03-12.031C24.062 5.383 18.679 0 12.031 0zm3.844 17.203c-.168.477-.978.932-1.398.983-.42.051-1.023.153-3.212-.751-2.637-1.088-4.321-3.791-4.453-3.968-.132-.178-1.065-1.417-1.065-2.703 0-1.286.666-1.921.899-2.176.233-.255.508-.318.677-.318.169 0 .338 0 .487.008.158.008.371-.059.579.44.22.525.592 1.447.643 1.549.051.102.085.22.017.355-.068.136-.102.22-.203.339-.102.119-.216.258-.305.339-.102.102-.208.212-.093.411.114.199.508.842 1.092 1.363.754.673 1.385.88 1.589.982.203.102.322.085.44-.051.119-.136.508-.593.644-.796.136-.203.271-.169.457-.102.186.068 1.185.559 1.388.66.203.102.305.153.356.237.051.085.051.492-.119.969z" />
              </svg>
            </a>
          </div>
        )}

        {settings?.phoneNumber && (
          <div className="relative flex items-center justify-end group">
            <span className="absolute right-14 bg-slate-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md">
              Call Us
              <div className="absolute top-1/2 -right-1 w-2 h-2 bg-slate-800 transform -translate-y-1/2 rotate-45"></div>
            </span>
            <a
              href={`tel:${settings.phoneNumber}`}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#FF3B30] hover:bg-[#ff2419] text-white rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(255,59,48,0.3)] hover:shadow-[0_10px_25px_rgba(255,59,48,0.4)] transition-all hover:scale-110 active:scale-95"
              title="Call Us"
            >
              <Phone className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </a>
          </div>
        )}
      </div>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-14 h-14 sm:w-[60px] sm:h-[60px] flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 z-50 cursor-pointer text-white ${
          isOpen
            ? "bg-slate-800 hover:bg-slate-700 rotate-90 scale-90"
            : "bg-primary hover:bg-primary-hover hover:scale-110"
        }`}
      >
        {isOpen ? (
          <X className="w-6 h-6 sm:w-7 sm:h-7 -rotate-90 transition-transform duration-300" />
        ) : (
          <MessageCircleMore className="w-7 h-7 sm:w-8 sm:h-8" />
        )}
      </button>
    </div>
  );
}