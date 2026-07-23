<script setup>
import { ArrowDown, AtSign, Phone } from '@lucide/vue'
import { motion, useReducedMotion } from 'motion-v'
import { contact } from '../data/site'

const prefersReducedMotion = useReducedMotion()
</script>

<template>
  <section id="inicio" class="hero section">
    <div class="container hero-grid">
      <motion.div
        class="hero-copy"
        :initial="prefersReducedMotion ? false : { opacity: 0, y: 24 }"
        :animate="{ opacity: 1, y: 0 }"
        :transition="{ duration: 0.55, ease: 'easeOut' }"
      >
        <p class="eyebrow">O sabor de outro mundo</p>
        <h1>Praticidade e comida caseira no seu dia.</h1>
        <p class="hero-description">
          Receitas feitas sob encomenda, com muito amor, carinho e aquele sabor que
          lembra a comida da família.
        </p>

        <div class="hero-actions">
          <a class="button button-primary" href="#cardapio">
            Ver cardápio
            <ArrowDown :size="18" aria-hidden="true" />
          </a>
        </div>

        <div class="hero-contact" aria-label="Contatos rápidos">
          <a :href="`tel:+${contact.whatsappNumber}`">
            <Phone :size="17" aria-hidden="true" />
            {{ contact.whatsappDisplay }}
          </a>
          <a :href="contact.instagramUrl" target="_blank" rel="noopener noreferrer">
            <AtSign :size="17" aria-hidden="true" />
            {{ contact.instagramHandle }}
          </a>
        </div>
      </motion.div>

      <motion.div
        class="hero-visual"
        aria-label="Seleção de pratos da ShowSu Delícias"
        :initial="prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{ duration: 0.65, delay: 0.12, ease: 'easeOut' }"
      >
        <div class="hero-shape"></div>
        <img
          class="hero-food"
          src="/images/hero-food.png"
          alt="Bolo de chocolate, salada e salgadinhos preparados pela ShowSu"
        />
        <div class="hero-note">
          <span class="note-icon">♥</span>
          <span><strong>Feito com carinho</strong>para você e sua família</span>
        </div>
      </motion.div>
    </div>
  </section>
</template>
