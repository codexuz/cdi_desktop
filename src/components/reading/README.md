# IELTS Question Components

This directory contains Vue components for rendering different types of IELTS questions based on the JSON structure provided.

## Components

### Question Types

1. **CompletionQuestion.vue** - Handles fill-in-the-blank style questions with `@@` placeholders
2. **MultipleChoiceQuestion.vue** - Renders single-answer multiple choice questions
3. **MultiSelectQuestion.vue** - Handles multiple-answer selection questions with limit validation
4. **SelectionQuestion.vue** - Specialized component for YES/NO/NOT GIVEN questions
5. **DraggableSelectionQuestion.vue** - Implements drag-and-drop question type
6. **AudioPlayer.vue** - Audio player component for listening tests
7. **QuestionRenderer.vue** - Main component that dynamically renders the appropriate question type

### Usage

```vue
<template>
  <QuestionRenderer 
    :question-content="questionData.content"
    :audio="questionData.audio"
    :passage="questionData.passage"
    v-model="answers"
  />
</template>

<script setup>
import { QuestionRenderer } from '~/components/question-types'
import { ref } from 'vue'

const answers = ref([])
</script>
```

## Features

- **Reactive Answers**: All components support v-model binding for answer tracking
- **Answer Visualization**: Toggle to show/hide answers for review
- **Drag & Drop**: Full implementation for draggable selection questions
- **Audio Playback**: Complete audio player with controls for listening tests
- **Responsive Design**: Works on all device sizes
- **Accessibility**: Proper labeling and keyboard navigation support

## Data Structure

The components are designed to work with the JSON structure that contains:

- Question content with different types
- Audio data for listening sections
- Reading passages for reading sections
- Various question formats (completion, multiple choice, etc.)

## Test Page

A test page is available at `/test-questions` to demonstrate all components with real data.