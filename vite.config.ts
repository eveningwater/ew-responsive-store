import { defineConfig } from "vite";

// package.json 是 "type": "module"，UMD 产物必须用 .cjs，否则 require() 会抛 ERR_REQUIRE_ESM
const libFileName = (name: string) => (format: string) =>
  `${name}.${format}.min.${format === "es" ? "js" : "cjs"}`;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据环境变量决定入口文件和external配置
  const getConfig = () => {
    const baseConfig = {
      build: {
        emptyOutDir: false, // 不清空输出目录，避免删除之前构建的文件
        lib: {
          name: "ew-responsive-data-store",
          fileName: libFileName("index"),
        },
        rollupOptions: {
          external: ['@vue/reactivity', '@vue/shared', 'react', 'preact', 'solid-js', 'svelte/store', '@angular/core'],
          output: {
            globals: {
              '@vue/reactivity': 'VueReactivity',
              '@vue/shared': 'VueShared',
              'react': 'React',
              'preact': 'Preact',
              'solid-js': 'SolidJS',
              'svelte/store': 'SvelteStore',
              '@angular/core': 'AngularCore'
            }
          }
        }
      }
    };

    // 根据模式选择不同的入口文件和external配置
    switch (mode) {
      case 'react-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/react.ts",
              fileName: libFileName("react"),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'preact', 'solid-js', 'svelte/store', '@angular/core', 'react'],
            }
          }
        };
      
      case 'vue-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/vue.ts",
              fileName: libFileName("vue"),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['react', 'preact', 'solid-js', 'svelte/store', '@angular/core', '@vue/reactivity', '@vue/shared'],
            }
          }
        };
      
      case 'preact-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/preact.ts",
              fileName: libFileName("preact"),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'react', 'solid-js', 'svelte/store', '@angular/core', 'preact'],
            }
          }
        };
      
      case 'solid-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/solid.ts",
              fileName: libFileName('solid'),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'react', 'preact', 'svelte/store', '@angular/core', 'solid-js'],
            }
          }
        };
      
      case 'svelte-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/svelte.ts",
              fileName: libFileName('svelte'),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'react', 'preact', 'solid-js', '@angular/core', 'svelte/store'],
            }
          }
        };
      
      case 'angular-only':
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/angular.ts",
              fileName: libFileName('angular'),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'react', 'preact', 'solid-js', 'svelte/store', '@angular/core'],
            }
          }
        };
      
      
      default:
        // 默认构建主入口文件，排除所有框架依赖
        return {
          ...baseConfig,
          build: {
            ...baseConfig.build,
            lib: {
              ...baseConfig.build.lib,
              entry: "src/export/index.ts",
              fileName: libFileName('index'),
            },
            rollupOptions: {
              ...baseConfig.build.rollupOptions,
              external: ['@vue/reactivity', '@vue/shared', 'react', 'preact', 'solid-js', 'svelte/store', '@angular/core'],
            }
          }
        };
    }
  };

  return getConfig();
});
