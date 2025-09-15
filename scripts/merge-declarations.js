import fs from 'fs';
import path from 'path';

const distDir = './dist';
const outputFile = path.join(distDir, 'index.d.ts');

// 读取各个声明文件的内容
const coreStorageContent = fs.readFileSync(path.join(distDir, 'core/storage.d.ts'), 'utf8');
const coreTypesContent = fs.readFileSync(path.join(distDir, 'core/types.d.ts'), 'utf8');
const coreUtilsContent = fs.readFileSync(path.join(distDir, 'core/utils.d.ts'), 'utf8');

// 读取适配器文件
const adaptersDir = path.join(distDir, 'adapters');
const adapterFiles = fs.readdirSync(adaptersDir).filter(file => file.endsWith('.d.ts'));
const adaptersContent = adapterFiles.map(file => {
  const content = fs.readFileSync(path.join(adaptersDir, file), 'utf8');
  return `// ${file.replace('.d.ts', '')} adapter
${content}`;
}).join('\n\n');

// 合并内容，移除重复的导入和导出
const mergedContent = `// 自动生成的合并类型定义文件
// 请勿手动修改此文件

${coreTypesContent}

${coreUtilsContent.replace(/import.*from.*types.*;?\n?/g, '')}

${coreStorageContent.replace(/import.*from.*types.*;?\n?/g, '').replace(/import.*from.*utils.*;?\n?/g, '')}

${adaptersContent.replace(/import.*from.*\.\.\/core\/types.*;?\n?/g, '').replace(/import.*from.*\.\.\/core\/storage.*;?\n?/g, '')}
`;

// 写入合并后的文件
fs.writeFileSync(outputFile, mergedContent);

// 清理单独的声明文件
fs.rmSync(path.join(distDir, 'core'), { recursive: true, force: true });
fs.rmSync(path.join(distDir, 'adapters'), { recursive: true, force: true });

console.log('✅ 声明文件合并完成: dist/index.d.ts');
