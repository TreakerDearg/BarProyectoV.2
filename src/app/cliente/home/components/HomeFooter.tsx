"use client";

import Link from "next/link";
import { GlassWater, MapPin, Phone, Mail, Clock, Share2, MessageCircle, AtSign } from "lucide-react";
import ui from "../../cliente-ui.module.css";

export default function HomeFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={ui.homeFooter}>
      <div className={ui.homeFooterContainer}>
        {/* Main Content */}
        <div className={ui.homeFooterContent}>
          {/* Brand */}
          <div className={ui.homeFooterBrand}>
            <div className={ui.homeFooterLogo}>
              <GlassWater className={ui.homeFooterLogoIcon} />
              <span className={ui.homeFooterLogoText}>Nebula</span>
            </div>
            <p className={ui.homeFooterDescription}>
              Experiencia gastronómica premium en un ambiente exclusivo.
            </p>
          </div>

          {/* Quick Links */}
          <div className={ui.homeFooterSection}>
            <h4 className={ui.homeFooterSectionTitle}>Navegación</h4>
            <nav className={ui.homeFooterLinks}>
              <Link href="/cliente/carta" className={ui.homeFooterLink}>Carta</Link>
              <Link href="/cliente/pedido" className={ui.homeFooterLink}>Mi Pedido</Link>
              <Link href="/cliente/ruleta" className={ui.homeFooterLink}>Ruleta</Link>
              <Link href="/cliente/reservas" className={ui.homeFooterLink}>Reservas</Link>
              <Link href="/cliente/cuenta" className={ui.homeFooterLink}>Mi Cuenta</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className={ui.homeFooterSection}>
            <h4 className={ui.homeFooterSectionTitle}>Contacto</h4>
            <div className={ui.homeFooterContact}>
              <div className={ui.homeFooterContactItem}>
                <MapPin className={ui.homeFooterContactIcon} />
                <span>Av. Principal 123, Ciudad</span>
              </div>
              <div className={ui.homeFooterContactItem}>
                <Phone className={ui.homeFooterContactIcon} />
                <span>+54 11 1234-5678</span>
              </div>
              <div className={ui.homeFooterContactItem}>
                <Mail className={ui.homeFooterContactIcon} />
                <span>info@nebula.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className={ui.homeFooterSection}>
            <h4 className={ui.homeFooterSectionTitle}>Horarios</h4>
            <div className={ui.homeFooterHours}>
              <div className={ui.homeFooterHoursItem}>
                <Clock className={ui.homeFooterHoursIcon} />
                <div>
                  <span className={ui.homeFooterHoursLabel}>Lun - Jue</span>
                  <span className={ui.homeFooterHoursTime}>18:00 - 02:00</span>
                </div>
              </div>
              <div className={ui.homeFooterHoursItem}>
                <Clock className={ui.homeFooterHoursIcon} />
                <div>
                  <span className={ui.homeFooterHoursLabel}>Vie - Sáb</span>
                  <span className={ui.homeFooterHoursTime}>18:00 - 04:00</span>
                </div>
              </div>
              <div className={ui.homeFooterHoursItem}>
                <Clock className={ui.homeFooterHoursIcon} />
                <div>
                  <span className={ui.homeFooterHoursLabel}>Domingo</span>
                  <span className={ui.homeFooterHoursTime}>18:00 - 00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className={ui.homeFooterBottom}>
          <div className={ui.homeFooterSocial}>
            <a href="#" className={ui.homeFooterSocialLink} aria-label="Instagram">
              <MessageCircle className={ui.homeFooterSocialIcon} />
            </a>
            <a href="#" className={ui.homeFooterSocialLink} aria-label="Facebook">
              <Share2 className={ui.homeFooterSocialIcon} />
            </a>
            <a href="#" className={ui.homeFooterSocialLink} aria-label="Twitter">
              <AtSign className={ui.homeFooterSocialIcon} />
            </a>
          </div>

          <div className={ui.homeFooterCopyright}>
            <p>© {currentYear} Nebula Food & Beverage. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
