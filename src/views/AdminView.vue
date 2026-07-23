<script setup>
import { useRouter } from 'vue-router'
import AdminPanel from '../components/AdminPanel.vue'

const router = useRouter()
</script>

<template>
  <AdminPanel @close="router.push('/')" />
</template>
