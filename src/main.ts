import { useStorage } from "./index";

// Vue 3 示例
const TEST_KEY = "test_local";
const data = useStorage(TEST_KEY, { name: 'eveningwater', details: { age: 25 } });

// 原生JavaScript示例
const vanillaData = useStorage('vanilla_test', { count: 0, message: 'Hello' });

const btn = document.createElement('button');
btn.textContent = 'click me (Vue Storage)';
document.querySelector<HTMLElement>('#app')?.appendChild(btn);
btn.addEventListener('click', () => {
    data.value.details.age++;
    console.log('Vue storage value:', data.value);
});

// 原生JavaScript示例按钮
const vanillaBtn = document.createElement('button');
vanillaBtn.textContent = 'click me (Vanilla Storage)';
vanillaBtn.style.marginLeft = '10px';
document.querySelector<HTMLElement>('#app')?.appendChild(vanillaBtn);
vanillaBtn.addEventListener('click', () => {
    vanillaData.updateValue(current => ({ 
        count: current.count + 1,
        message: current.message + '!'
    }));
    console.log('Vanilla storage value:', vanillaData.value);
});

// 订阅原生存储变化
vanillaData.subscribe((newValue) => {
    console.log('Vanilla storage changed:', newValue);
});

// 显示当前值
const display = document.createElement('div');
display.style.marginTop = '10px';
display.style.padding = '10px';
display.style.backgroundColor = '#f0f0f0';
display.style.borderRadius = '4px';
display.innerHTML = `
    <p>Vue Storage: <span id="vue-value">${JSON.stringify(data.value)}</span></p>
    <p>Vanilla Storage: <span id="vanilla-value">${JSON.stringify(vanillaData.value)}</span></p>
`;
document.querySelector<HTMLElement>('#app')?.appendChild(display);

// 更新显示
const updateDisplay = () => {
    const vueValueEl = document.getElementById('vue-value');
    const vanillaValueEl = document.getElementById('vanilla-value');
    if (vueValueEl) vueValueEl.textContent = JSON.stringify(data.value);
    if (vanillaValueEl) vanillaValueEl.textContent = JSON.stringify(vanillaData.value);
};

// 监听Vue存储变化
data.value = data.value; // 触发更新
vanillaData.subscribe(updateDisplay);