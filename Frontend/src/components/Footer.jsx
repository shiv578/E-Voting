import React from "react";
import { Link } from "react-router-dom";
import { Facebook, Twitter, Instagram, Linkedin, Globe, Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1a1a1a] dark:bg-black text-white mt-auto border-t-4 border-[#FF9933] font-sans">
           <div className="max-w-[1400px] mx-auto px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                 <div className="space-y-4">
            <div className="flex items-center gap-2">
                <div className="flex items-center justify-center w-8 h-8 bg-white rounded-full">
                    <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" 
                        alt="Emblem" 
                        className="w-auto h-5"
                    />
                </div>
                <h3 className="text-lg font-bold text-white">E - Voting Portal</h3>
            </div>
            <p className="text-sm leading-relaxed text-justify text-gray-400">
              An initiative by the Government of India to facilitate secure, transparent, and accessible e-voting for all citizens. promoting digital democracy.
            </p>
            <div className="flex pt-2 space-x-4">
               <a href="#" className="text-gray-400 hover:text-[#FF9933] transition-colors"><Facebook size={18} /></a>
               <a href="#" className="text-gray-400 transition-colors hover:text-white"><Twitter size={18} /></a>
               <a href="#" className="text-gray-400 hover:text-[#d62976] transition-colors"><Instagram size={18} /></a>
               <a href="#" className="text-gray-400 hover:text-[#0077b5] transition-colors"><Linkedin size={18} /></a>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#FF9933] uppercase mb-4 tracking-wider">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="inline-block transition-all hover:text-white hover:translate-x-1">Dashboard</Link></li>
              <li><Link to="/about" className="inline-block transition-all hover:text-white hover:translate-x-1">About Us</Link></li>
              <li><Link to="/contact" className="inline-block transition-all hover:text-white hover:translate-x-1">Contact Us</Link></li>
              <li><Link to="/feedback" className="inline-block transition-all hover:text-white hover:translate-x-1">Feedback</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#138808] uppercase mb-4 tracking-wider">Policies</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="inline-block transition-all hover:text-white hover:translate-x-1">Privacy Policy</a></li>
              <li><a href="#" className="inline-block transition-all hover:text-white hover:translate-x-1">Terms of Service</a></li>
              <li><a href="#" className="inline-block transition-all hover:text-white hover:translate-x-1">Copyright Policy</a></li>
              <li><a href="#" className="inline-block transition-all hover:text-white hover:translate-x-1">Hyperlinking Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-bold tracking-wider text-blue-400 uppercase">Contact Us</h4>
            <address className="space-y-3 text-sm not-italic text-gray-400">
              <div className="flex items-start gap-2">
                 <MapPin size={16} className="mt-0.5 text-gray-500 shrink-0" />
                 <div>
                    <p>Ministry of Electronics & IT</p>
                    <p>Electronics Niketan, 6, CGO Complex</p>
                    <p>Lodhi Road, New Delhi - 110003</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <Mail size={16} className="text-gray-500 shrink-0" />
                 <a href="mailto:support@janseva.gov.in" className="transition-colors hover:text-white">support@evoting.gov.in</a>
              </div>
            </address>
          </div>
        </div>
      </div>
      <div className="bg-[#111] dark:bg-[#0a0a0a] py-4 border-t border-gray-800">
        <div className="max-w-[1400px] mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} E - Voting Portal. All rights reserved.</p>
          <div className="flex items-center gap-2">
             <span>Designed & Developed by</span>
             <span className="font-bold text-gray-300">Abijith </span>
             <Globe size={14} />
          </div>
        </div>
      </div>
    </footer>
  );
}