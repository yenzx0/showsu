<script setup>
import { CalendarCheck, MessageCircle, PartyPopper } from '@lucide/vue'
import { whatsappUrl } from '../data/site'

const steps = [
  {
    number: '01',
    title: 'Escolha suas delícias',
    description: 'Navegue pelo cardápio e encontre os itens perfeitos para o seu momento.',
    icon: PartyPopper,
  },
  {
    number: '02',
    title: 'Converse com a gente',
    description: 'Envie sua seleção pelo WhatsApp e tire dúvidas sobre sabores e quantidades.',
    icon: MessageCircle,
  },
  {
    number: '03',
    title: 'Combine os detalhes',
    description: 'Confirme disponibilidade, valores, data e todos os detalhes da encomenda.',
    icon: CalendarCheck,
  },
]
</script>

<template>
  <section id="como-pedir" class="section order-section">
    <div class="container">
      <div class="section-heading order-heading">
        <div>
          <p class="eyebrow eyebrow-light">Simples e pertinho</p>
          <h2>Seu pedido em três passos</h2>
        </div>
        <a
          class="button button-on-dark"
          :href="whatsappUrl('Olá! Gostaria de fazer uma encomenda na ShowSu Delícias.')"
          target="_blank"
          rel="noopener noreferrer"
        >
          Começar pedido
        </a>
      </div>

      <div class="steps-grid">
        <article v-for="step in steps" :key="step.number" class="step-card">
          <div class="step-top">
            <component :is="step.icon" :size="25" :stroke-width="1.8" aria-hidden="true" />
            <span>{{ step.number }}</span>
          </div>
          <h3>{{ step.title }}</h3>
          <p>{{ step.description }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
