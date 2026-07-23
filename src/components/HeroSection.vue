<script setup>
import { ArrowDown, AtSign, Phone } from '@lucide/vue'
import { contact } from '../data/site'
</script>

<template>
  <section id="inicio" class="hero section">
    <div class="container hero-grid">
      <div class="hero-copy">
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
      </div>

      <div class="hero-visual" aria-label="Seleção de pratos da ShowSu Delícias">
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
      </div>
    </div>
  </section>
</template>
