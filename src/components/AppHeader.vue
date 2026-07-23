<script setup>
import { ref } from 'vue'
import { Menu, MessageCircle, X } from '@lucide/vue'
import { navItems, whatsappUrl } from '../data/site'

const isOpen = ref(false)

const closeMenu = () => {
  isOpen.value = false
}
</script>

<template>
  <header class="site-header">
    <nav class="container nav" aria-label="Navegação principal">
      <a class="brand" href="#inicio" aria-label="ShowSu Delícias - página inicial" @click="closeMenu">
        <span class="brand-logo">
          <img src="/images/showsu-logo.png" alt="" />
        </span>
        <span class="brand-copy">
          <strong>ShowSu</strong>
          <small>Delícias</small>
        </span>
      </a>

      <div class="desktop-nav">
        <a v-for="item in navItems" :key="item.href" :href="item.href">
          {{ item.label }}
        </a>
      </div>

      <a
        class="button button-primary header-order"
        :href="whatsappUrl('Olá! Gostaria de fazer um pedido na ShowSu Delícias.')"
        target="_blank"
        rel="noopener noreferrer"
      >
        <MessageCircle :size="18" aria-hidden="true" />
        Peça aqui
      </a>

      <button
        class="menu-toggle"
        type="button"
        :aria-expanded="isOpen"
        aria-controls="mobile-menu"
        :aria-label="isOpen ? 'Fechar menu' : 'Abrir menu'"
        @click="isOpen = !isOpen"
      >
        <X v-if="isOpen" :size="24" aria-hidden="true" />
        <Menu v-else :size="24" aria-hidden="true" />
      </button>
    </nav>

    <div v-if="isOpen" id="mobile-menu" class="mobile-nav">
      <div class="container mobile-nav-inner">
        <a v-for="item in navItems" :key="item.href" :href="item.href" @click="closeMenu">
          {{ item.label }}
        </a>
        <a
          class="button button-primary"
          :href="whatsappUrl('Olá! Gostaria de fazer um pedido na ShowSu Delícias.')"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeMenu"
        >
          <MessageCircle :size="18" aria-hidden="true" />
          Fazer pedido
        </a>
      </div>
    </div>
  </header>
</template>
