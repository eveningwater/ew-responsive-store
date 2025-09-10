import fs from 'fs';
import path from 'path';

const distDir = './dist';
const outputFile = path.join(distDir, 'index.d.ts');

// 读取各个声明文件的内容
const coreContent = fs.readFileSync(path.join(distDir, 'core.d.ts'), 'utf8');
const reactStorageContent = fs.readFileSync(path.join(distDir, 'use-react-storage.d.ts'), 'utf8');
const enumContent = fs.readFileSync(path.join(distDir, 'enum.d.ts'), 'utf8');
const utilsContent = fs.readFileSync(path.join(distDir, 'utils.d.ts'), 'utf8');

// 合并内容，移除重复的导入和导出
const mergedContent = `// 自动生成的合并类型定义文件
// 请勿手动修改此文件

${enumContent}

${utilsContent.replace(/import.*from.*enum.*;?\n?/g, '')}

${coreContent.replace(/import.*from.*enum.*;?\n?/g, '').replace(/import.*from.*utils.*;?\n?/g, '').replace(/export\s*{\s*parseStr,\s*isStorageEnabled,\s*isValidJSON\s*};?\n?/g, '')}

${reactStorageContent.replace(/import.*from.*enum.*;?\n?/g, '')}
`;

// 写入合并后的文件
fs.writeFileSync(outputFile, mergedContent);

// 清理单独的声明文件
fs.unlinkSync(path.join(distDir, 'core.d.ts'));
fs.unlinkSync(path.join(distDir, 'use-react-storage.d.ts'));
fs.unlinkSync(path.join(distDir, 'enum.d.ts'));
fs.unlinkSync(path.join(distDir, 'utils.d.ts'));

console.log('✅ 声明文件合并完成: dist/index.d.ts');
