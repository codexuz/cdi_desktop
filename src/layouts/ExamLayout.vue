<template>
  <div class="flex h-screen w-full flex-col">
    <ExamHeader :title="title" />
    <slot />
  </div>
</template>

<script setup>
import ExamHeader from '@/components/ExamHeader.vue'
defineProps({
  title: String,
})
</script>
