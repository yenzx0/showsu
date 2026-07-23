<script setup>
import { MessageCircle } from '@lucide/vue'
import { whatsappUrl } from '../data/site'
</script>

<template>
  <a
    class="floating-whatsapp"
    :href="whatsappUrl('Olá! Vim pelo site da ShowSu e gostaria de fazer um pedido.')"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Falar com a ShowSu pelo WhatsApp"
  >
    <MessageCircle :size="26" aria-hidden="true" />
    <span>WhatsApp</span>
  </a>
</template>
