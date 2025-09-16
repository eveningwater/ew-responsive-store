import { useStorage } from "ew-responsive-store";

const vanillaData = useStorage("vanilla_test", { count: 0, message: "Hello" });

const vanillaBtn = document.createElement("button");
vanillaBtn.textContent = "click me (Vanilla Storage)";
vanillaBtn.style.marginLeft = "10px";
document.querySelector<HTMLElement>("#app")?.appendChild(vanillaBtn);
vanillaBtn.addEventListener("click", () => {
  vanillaData.updateValue((current) => ({
    count: current.count + 1,
    message: current.message + "!",
  }));
  console.log("Vanilla storage value:", vanillaData.value);
});

vanillaData.subscribe((newValue) => {
  console.log("Vanilla storage changed:", newValue);
});

// 显示当前值
const display = document.createElement("div");
display.style.marginTop = "10px";
display.style.padding = "10px";
display.style.backgroundColor = "#f0f0f0";
display.style.borderRadius = "4px";
display.innerHTML = `
    <p>Vanilla Storage: <span id="vanilla-value">${JSON.stringify(
      vanillaData.value
    )}</span></p>
`;
document.querySelector<HTMLElement>("#app")?.appendChild(display);

// 更新显示
const updateDisplay = () => {
  const vanillaValueEl = document.getElementById("vanilla-value");
  if (vanillaValueEl)
    vanillaValueEl.textContent = JSON.stringify(vanillaData.value);
};
vanillaData.subscribe(updateDisplay);
