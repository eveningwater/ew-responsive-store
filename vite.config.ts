import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // 根据环境变量决定入口文件和external配置
  const getConfig = () => {
    const baseConfig = {
      build: {
        emptyOutDir: false, // 不清空输出目录，避免删除之前构建的文件
        lib: {
          name: "ew-responsive-data-store",
          fileName: (format: string) => `index.${format}.min.js`,
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
              fileName: (format: string) => `react.${format}.min.js`,
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
              fileName: (format: string) => `vue.${format}.min.js`,
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
              fileName: (format: string) => `preact.${format}.min.js`,
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
              fileName: (format: string) => `solid.${format}.min.js`,
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
              fileName: (format: string) => `svelte.${format}.min.js`,
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
              fileName: (format: string) => `angular.${format}.min.js`,
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
              fileName: (format: string) => `index.${format}.min.js`,
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
