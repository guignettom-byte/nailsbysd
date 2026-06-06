import { MapPin, Mail } from "lucide-react";

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
    <footer id="contact" className="bg-[#2a2018] text-white/70 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <h3 className="font-display text-3xl text-white mb-3">Nailsbysd</h3>
            <p className="text-xs tracking-[0.3em] uppercase text-[#78716c] mb-4">Prothésiste Ongulaire</p>
            <p className="text-sm leading-relaxed">
              L'art de sublimer vos mains avec délicatesse et savoir-faire, à Cheseaux-sur-Lausanne.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-6">Contact</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-[#78716c] mt-0.5 shrink-0" />
                <span>Cheseaux-sur-Lausanne<br />Canton de Vaud, Suisse</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-[#78716c] shrink-0" />
                <a href="mailto:contact@nailsbysd.ch" className="hover:text-white transition-colors">
                  contact@nailsbysd.ch
                </a>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-[#78716c] shrink-0"><InstagramIcon size={16} /></span>
                <a
                  href="https://www.instagram.com/nailsbysd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  @nailsbysd
                </a>
              </li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <h4 className="text-xs tracking-widest uppercase text-white mb-6">Horaires</h4>
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
                  <span className={hours === "Fermé" ? "text-white/30" : "text-white/80"}>{hours}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Nailsbysd. Tous droits réservés.
          </p>
          <a
            href="/admin"
            className="text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            Espace admin
          </a>
        </div>
      </div>
    </footer>
  );
}
