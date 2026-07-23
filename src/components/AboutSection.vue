<script setup>
import { AtSign, Heart } from '@lucide/vue'
import { contact } from '../data/site'
</script>

<template>
  <section id="sobre" class="section about-section">
    <div class="container about-grid">
      <div class="about-image-wrap">
        <span class="about-dots" aria-hidden="true"></span>
        <img
          class="about-image"
          src="/images/irmas-su.png"
          alt="As duas irmãs Su, cozinheiras da ShowSu Delícias"
          loading="lazy"
        />
      </div>

      <div class="about-copy">
        <p class="eyebrow">Nossa história</p>
        <h2>Duas irmãs e um amor em comum: cozinhar.</h2>
        <p>
          Somos duas irmãs que amam cozinhar e transformam essa tarefa na arte de
          encantar o paladar de cada cliente.
        </p>
        <blockquote>
          “O segredo é cozinhar para nossos clientes da mesma forma que cozinhamos
          para a nossa família.”
        </blockquote>
        <p>
          Venha experimentar as delícias das irmãs Su.
          <Heart class="inline-heart" :size="17" fill="currentColor" aria-label="Com amor" />
        </p>
        <a
          class="text-link"
          :href="contact.instagramUrl"
          target="_blank"
          rel="noopener noreferrer"
        >
          <AtSign :size="19" aria-hidden="true" />
          Acompanhe {{ contact.instagramHandle }}
        </a>
      </div>
    </div>
  </section>
</template>
