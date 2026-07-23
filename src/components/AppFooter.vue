<script setup>
import { AtSign, MessageCircle, Phone, Settings } from '@lucide/vue'
import { contact, navItems, whatsappUrl } from '../data/site'

defineEmits(['open-admin'])
</script>

<template>
  <footer class="site-footer">
    <div class="container footer-grid">
      <div class="footer-brand">
        <a class="brand brand-footer" href="#inicio">
          <span class="brand-logo">
            <img src="/images/showsu-logo.png" alt="" />
          </span>
          <span class="brand-copy">
            <strong>ShowSu</strong>
            <small>Delícias</small>
          </span>
        </a>
        <p>Comida caseira, doces e festas preparados com carinho.</p>
      </div>

      <div class="footer-column">
        <h2>Navegue</h2>
        <a v-for="item in navItems" :key="item.href" :href="item.href">
          {{ item.label }}
        </a>
      </div>

      <div class="footer-column footer-contact">
        <h2>Fale com a gente</h2>
        <a
          :href="whatsappUrl('Olá! Vim pelo site e gostaria de fazer um pedido.')"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageCircle :size="17" aria-hidden="true" />
          {{ contact.whatsappDisplay }}
        </a>
        <a :href="`tel:+${contact.phoneSecondary}`">
          <Phone :size="17" aria-hidden="true" />
          {{ contact.phoneSecondaryDisplay }}
        </a>
        <a :href="contact.instagramUrl" target="_blank" rel="noopener noreferrer">
          <AtSign :size="17" aria-hidden="true" />
          {{ contact.instagramHandle }}
        </a>
      </div>
    </div>

    <div class="container footer-bottom">
      <span>© {{ new Date().getFullYear() }} ShowSu Delícias</span>
      <div class="footer-bottom-actions">
        <span>Site por Murilo Enzo</span>
        <button type="button" class="footer-admin-button" @click="$emit('open-admin')">
          <Settings :size="14" aria-hidden="true" />
          Painel local
        </button>
      </div>
    </div>
  </footer>
</template>
