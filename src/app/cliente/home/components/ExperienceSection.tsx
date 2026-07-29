"use client";

import { motion } from "framer-motion";
import { Music, UtensilsCrossed, GlassWater, Heart, Sparkles } from "lucide-react";
import ui from "../../cliente-ui.module.css";

const experiences = [
  {
    icon: Music,
    title: "Ambiente Exclusivo",
    description: "Música cuidadosamente seleccionada que crea la atmósfera perfecta para cada momento.",
    color: "purple"
  },
  {
    icon: GlassWater,
    title: "Cócteles Artesanales",
    description: "Bebidas preparadas con técnicas de mixología moderna y ingredientes premium.",
    color: "blue"
  },
  {
    icon: UtensilsCrossed,
    title: "Gastronomía Gourmet",
    description: "Platos elaborados con ingredientes frescos y recetas innovadoras.",
    color: "green"
  },
  {
    icon: Heart,
    title: "Atención Personalizada",
    description: "Nuestro equipo está dedicado a hacer de cada visita una experiencia memorable.",
    color: "red"
  }
];

export default function ExperienceSection() {
  return (
    <section className={ui.experienceSection}>
      <div className={ui.experienceContainer}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className={ui.experienceHeader}
        >
          <h2 className={ui.experienceTitle}>
            <Sparkles className={ui.experienceTitleIcon} />
            La Experiencia Nebula
          </h2>
          <p className={ui.experienceSubtitle}>
            Más que un restaurante, un destino donde cada detalle está pensado para tu disfrute
          </p>
        </motion.div>

        <div className={ui.experienceGrid}>
          {experiences.map((exp, index) => {
            const Icon = exp.icon;
            return (
              <motion.div
                key={exp.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={ui.experienceCard}
              >
                <div className={ui.experienceIcon} data-color={exp.color}>
                  <Icon className={ui.experienceIconSvg} />
                </div>
                
                <div className={ui.experienceContent}>
                  <h3 className={ui.experienceCardTitle}>{exp.title}</h3>
                  <p className={ui.experienceCardDescription}>
                    {exp.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
