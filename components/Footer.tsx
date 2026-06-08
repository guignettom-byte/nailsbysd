import { MapPin, Mail, Phone } from "lucide-react";

function InstagramIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
    </svg>
  );
}

export default function Footer() {
  return (
    <footer id="contact" className="bg-[#e2e2e4] text-[#5a5a5a] py-16 px-6 border-t border-[#d1d1d4]">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl text-[#2a2018] mb-3">Nailsbysd</h3>
            <p className="text-xs tracking-[0.3em] uppercase text-[#78716c] mb-4">Formatrice &amp; Nail artist certified</p>
            <p className="text-sm leading-relaxed mb-2">
              L'art de sublimer vos mains avec délicatesse et savoir-faire, à Cheseaux-sur-Lausanne.
            </p>
            <p className="text-sm text-[#9ca3af]">
              Founder{" "}
              <a
                href="https://www.instagram.com/onaenailshop"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#78716c] hover:text-[#2a2018] transition-colors"
              >
                @onaenailshop
              </a>
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#2a2018] mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#78716c] mt-0.5 shrink-0" />
                <span>Cheseaux-sur-Lausanne<br />Vaud, Suisse</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-[#78716c] shrink-0" />
                <a href="tel:+41793931033" className="hover:text-[#2a2018] transition-colors">
                  +41 79 393 10 33
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#78716c] shrink-0" />
                <a href="mailto:contact@nailsbysd.ch" className="hover:text-[#2a2018] transition-colors">
                  contact@nailsbysd.ch
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#78716c] shrink-0"><InstagramIcon size={16} /></span>
                <a
                  href="https://www.instagram.com/nailsbyysd?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#2a2018] transition-colors"
                >
                  @nailsbyysd
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-[#2a2018] mb-6">Horaires</h4>
            <ul className="space-y-2 text-sm">
              {[
                { day: "Lundi", hours: "09h00 – 18h00" },
                { day: "Mardi", hours: "09h00 – 18h00" },
                { day: "Mercredi", hours: "09h00 – 18h00" },
                { day: "Jeudi", hours: "09h00 – 18h00" },
                { day: "Vendredi", hours: "09h00 – 18h00" },
                { day: "Samedi", hours: "09h00 – 14h00" },
                { day: "Dimanche", hours: "Fermé" },
              ].map(({ day, hours }) => (
                <li key={day} className="flex justify-between">
                  <span>{day}</span>
                  <span className={hours === "Fermé" ? "text-[#b0b0b3]" : "text-[#2a2018]/80"}>{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#e2e2e4] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#9ca3af]">
            © {new Date().getFullYear()} Nailsbysd. Tous droits réservés.
          </p>
          <a
            href="/admin"
            className="text-xs text-[#b0b0b3] hover:text-[#78716c] transition-colors"
          >
            Espace admin
          </a>
        </div>
      </div>
    </footer>
  );
}
