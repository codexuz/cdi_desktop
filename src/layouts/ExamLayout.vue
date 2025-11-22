<template>
  <div class="flex h-screen w-full flex-col">
    <ExamHeader :title="title" :timer="timer" />
    <slot />
  </div>
</template>

<script setup>
import ExamHeader from '@/components/ExamHeader.vue'
defineProps({
  title: String,
  timer: {
    type: Boolean,
    default: true,
  },
})
</script>
