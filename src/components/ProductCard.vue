<script setup>
import { ArrowUpRight } from '@lucide/vue'
import { whatsappUrl } from '../data/site'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const orderMessage = `Olá! Vi o produto “${props.product.name}” no site da ShowSu e gostaria de saber mais para fazer um pedido.`
</script>

<template>
  <article class="product-card">
    <div class="product-image-wrap">
      <img
        class="product-image"
        :src="product.image"
        :alt="product.imageAlt"
        loading="lazy"
        width="640"
        height="520"
      />
      <span v-if="product.featured" class="product-badge">Queridinho</span>
      <span v-else-if="product.seasonal" class="product-badge">Por temporada</span>
    </div>

    <div class="product-content">
      <h3>{{ product.name }}</h3>
      <p>{{ product.description }}</p>
      <a
        class="product-link"
        :href="whatsappUrl(orderMessage)"
        target="_blank"
        rel="noopener noreferrer"
        :aria-label="`Pedir ${product.name} pelo WhatsApp`"
      >
        Quero pedir
        <ArrowUpRight :size="18" aria-hidden="true" />
      </a>
    </div>
  </article>
</template>
