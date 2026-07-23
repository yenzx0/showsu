<script setup>
import { ref, watch } from 'vue'
import AppFooter from './components/AppFooter.vue'
import AppHeader from './components/AppHeader.vue'
import AboutSection from './components/AboutSection.vue'
import AdminPanel from './components/AdminPanel.vue'
import HeroSection from './components/HeroSection.vue'
import MenuSection from './components/MenuSection.vue'
import OrderSteps from './components/OrderSteps.vue'

const adminOpen = ref(false)

watch(adminOpen, (isOpen) => {
  document.body.classList.toggle('admin-is-open', isOpen)
})
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

  <AppFooter @open-admin="adminOpen = true" />
  <AdminPanel v-if="adminOpen" @close="adminOpen = false" />
</template>
