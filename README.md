# 一个迷你的响应式会话存储hooks函数

体积非常轻量，不到1kb大小，用法非常简单，就像这样：

```ts
import { useStorage } from 'ew-responsive-store';
import { StoreType } from 'ew-responsive-store/typings/core/enum'

const TEST_KEY = "test_local";
// 默认是localStorage，也可以是sessionStorage,指定第三个配置参数即可
const data = useStorage(TEST_KEY, { name: 'eveningwater', details: { age: 25 } });
data.value.age++; // 26
const data = useStorage(TEST_KEY, { name: 'eveningwater', details: { age: 25 } }, { storage:StoreType.SESSION });
```