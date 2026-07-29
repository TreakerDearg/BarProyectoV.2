"use client";

import Link from "next/link";
import { GlassWater, MapPin, Phone, Mail, Clock, MessageCircle, Share2, AtSign } from "lucide-react";
import { memo } from "react";
import ui from "../../../app/cliente/cliente-ui.module.css";

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={ui.footer} role="contentinfo">
      <div className={ui.footerContainer}>
        {/* Main Content */}
        <div className={ui.footerContent}>
          {/* Brand */}
          <div className={ui.footerBrand}>
            <div className={ui.footerLogo}>
              <GlassWater className={ui.footerLogoIcon} />
              <span className={ui.footerLogoText}>Nebula</span>
            </div>
            <p className={ui.footerDescription}>
              Experiencia gastronómica premium en un ambiente exclusivo.
            </p>
          </div>

          {/* Quick Links */}
          <div className={ui.footerSection}>
            <h4 className={ui.footerSectionTitle}>Navegación</h4>
            <nav className={ui.footerLinks} aria-label="Navegación del footer">
              <Link href="/cliente/carta" className={ui.footerLink}>Carta</Link>
              <Link href="/cliente/pedido" className={ui.footerLink}>Mi Pedido</Link>
              <Link href="/cliente/ruleta" className={ui.footerLink}>Ruleta</Link>
              <Link href="/cliente/reservas" className={ui.footerLink}>Reservas</Link>
              <Link href="/cliente/cuenta" className={ui.footerLink}>Mi Cuenta</Link>
            </nav>
          </div>

          {/* Contact */}
          <div className={ui.footerSection}>
            <h4 className={ui.footerSectionTitle}>Contacto</h4>
            <div className={ui.footerContact}>
              <div className={ui.footerContactItem}>
                <MapPin className={ui.footerContactIcon} />
                <span>Av. Principal 123, Ciudad</span>
              </div>
              <div className={ui.footerContactItem}>
                <Phone className={ui.footerContactIcon} />
                <span>+54 11 1234-5678</span>
              </div>
              <div className={ui.footerContactItem}>
                <Mail className={ui.footerContactIcon} />
                <span>info@nebula.com</span>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div className={ui.footerSection}>
            <h4 className={ui.footerSectionTitle}>Horarios</h4>
            <div className={ui.footerHours}>
              <div className={ui.footerHoursItem}>
                <Clock className={ui.footerHoursIcon} />
                <div>
                  <span className={ui.footerHoursLabel}>Lun - Jue</span>
                  <span className={ui.footerHoursTime}>18:00 - 02:00</span>
                </div>
              </div>
              <div className={ui.footerHoursItem}>
                <Clock className={ui.footerHoursIcon} />
                <div>
                  <span className={ui.footerHoursLabel}>Vie - Sáb</span>
                  <span className={ui.footerHoursTime}>18:00 - 04:00</span>
                </div>
              </div>
              <div className={ui.footerHoursItem}>
                <Clock className={ui.footerHoursIcon} />
                <div>
                  <span className={ui.footerHoursLabel}>Domingo</span>
                  <span className={ui.footerHoursTime}>18:00 - 00:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Social & Bottom */}
        <div className={ui.footerBottom}>
          <div className={ui.footerSocial}>
            <a href="#" className={ui.footerSocialLink} aria-label="Instagram">
              <MessageCircle className={ui.footerSocialIcon} />
            </a>
            <a href="#" className={ui.footerSocialLink} aria-label="Facebook">
              <Share2 className={ui.footerSocialIcon} />
            </a>
            <a href="#" className={ui.footerSocialLink} aria-label="Twitter">
              <AtSign className={ui.footerSocialIcon} />
            </a>
          </div>

          <div className={ui.footerCopyright}>
            <p>© {currentYear} Nebula Food & Beverage. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default memo(Footer);
