<template>
  <Fragment>
    <div ref="triggerButton" @click="toggleConfirm">
      <slot></slot>
    </div>
    <div v-if="showConfirm" class="popconfirm"
      :style="{ top: `${popconfirmPosition.top}px`, left: `${popconfirmPosition.left}px` }" @click.stop="handleCancel">
      <div class="popconfirm-content">
        <p>{{ props?.message }}</p>
        <div class="popconfirm-actions">
          <button @click="handleCancel" class="button">取消</button>
          <button @click="handleConfirm" class="button">确认</button>
        </div>
      </div>
    </div>
  </Fragment>
</template>

<script setup lang="ts">
import { ref, defineProps, onMounted, watch, onBeforeUnmount, Fragment } from 'vue'

const emit = defineEmits(['confirm']);
const props = defineProps({
  message: {
    type: String,
    default: '确定要执行此操作吗？'
  }
})

const showConfirm = ref(false)
const popconfirmPosition = ref({ top: 0, left: 0 })
const triggerButton = ref<HTMLDivElement | null>(null)

const toggleConfirm = () => {
  showConfirm.value = !showConfirm.value
  if (showConfirm.value) {
    calculatePosition()
  }
}

const calculatePosition = () => {
  if (triggerButton.value) {
    const buttonRect = triggerButton.value.getBoundingClientRect()
    popconfirmPosition.value = {
      top: buttonRect.bottom + window.scrollY + 10,
      left: buttonRect.left + window.scrollX + buttonRect.width / 2,
    }
  }
}

const handleCancel = () => {
  showConfirm.value = false
}

const handleConfirm = () => {
  showConfirm.value = false;
  emit('confirm');
}

const closeOnOutsideClick = (event: Event) => {
  const popconfirmElement = document.querySelector('.popconfirm');
  const target = event.target as HTMLElement;
  if (target && popconfirmElement && !popconfirmElement.contains(target) && !triggerButton.value?.contains(target)) {
    showConfirm.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', closeOnOutsideClick)
})

watch(showConfirm, (newVal) => {
  if (newVal) {
    calculatePosition()
  }
})


onBeforeUnmount(() => {
  window.removeEventListener('click', closeOnOutsideClick)
})
</script>

<style scoped>
.popconfirm {
  position: absolute;
  background: #fff;
  border: 1px solid #ccc;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 10;
}

.popconfirm-content {
  margin-bottom: 15px;
}

.popconfirm-actions {
  display: flex;
  justify-content: space-between;
}

.popconfirm button {
  padding: 5px 10px;
  cursor: pointer;
  border: none;
  border-radius: 4px;
}

.popconfirm button+button {
  margin-left: 5px;
}
</style>