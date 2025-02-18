<template>
    <label class="checkbox" @click="model = !model">
        <span :class="{ 'checkmark': true, checked: model }"></span>
        <slot></slot>
    </label>
</template>

<script setup lang="ts">
const model = defineModel<boolean>();
</script>

<style scoped>
.checkbox {
    display: inline-block;
    position: relative;
    margin-right: 8px;
}

.checkbox .checkmark {
    border: 2px solid #2396ef;
    width: 25px;
    height: 25px;
    display: inline-block;
    border-radius: 4px;
}

.checkmark.checked::after {
    position: absolute;
    top: 0;
    left: 7px;
    width: 8px;
    height: 15px;
    border: solid #2396ef;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
    display: block;
}
</style>