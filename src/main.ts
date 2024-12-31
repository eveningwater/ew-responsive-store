import { useStorage } from "ew-responsive-store";

const TEST_KEY = "test_local";
const data = useStorage(TEST_KEY, { name: 'eveningwater', details: { age: 25 } });
const btn = document.createElement('button');
btn.textContent = 'click me';
document.querySelector<HTMLElement>('#app')?.appendChild(btn);
btn.addEventListener('click', () => {
    data.value.details.age++;
    console.log('the value:', data.value);
})