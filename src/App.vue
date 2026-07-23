<script setup>
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import AboutSection from './components/AboutSection.vue'
import FloatingWhatsApp from './components/FloatingWhatsApp.vue'
import HeroSection from './components/HeroSection.vue'
import MenuSection from './components/MenuSection.vue'
import OrderSteps from './components/OrderSteps.vue'
</script>

<template>
  <a class="skip-link" href="#conteudo">Pular para o conteúdo</a>
  <AppHeader />

  <main id="conteudo">
    <HeroSection />
    <MenuSection />
    <OrderSteps />
    <AboutSection />
  </main>

  <AppFooter />
  <FloatingWhatsApp />
</template>
