const fs = require('fs');
const path = require('path');

const templatesDir = path.resolve(__dirname, 'templates');
const modulesDir = path.resolve(__dirname, '../../src/modules');
const appModulePath = path.resolve(__dirname, '../../src/app.module.ts');

function toPascalCase(str) {
  // Converte "product-item" para "ProductItem"
  return str.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
}

function toKebabCase(str) {
  // Converte "UserPost" para "user-post" ou "user" para "user"
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

async function generateFiles(name) {
  const fileName = toKebabCase(name); // Ex: 'user-post'
  const className = toPascalCase(name); // Ex: 'UserPost'
  const pluralName = toKebabCase(name) + 's'; // Ex: 'user-posts' para tabelas/rotas
  const singularCapitalized = className; // Usado para referências a objetos no código

  console.log(`\nIniciando geração para o recurso: ${singularCapitalized} (${fileName})`);

  const replacements = {
    '__name__': fileName, // Ex: user
    '__Name__': className, // Ex: User
    '__names__': pluralName, // Ex: users (para endpoints/tabelas)
  };

  const processTemplateContent = (templateContent) => {
    let content = templateContent;
    for (const key in replacements) {
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, replacements[key]);
    }
    return content;
  };

  // Helper para ler diretórios recursivamente e ignorar arquivos específicos
  const readDirRecursive = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Ignora arquivos/diretórios que não são templates ou de configuração do git
      if (file.startsWith('.') || file.endsWith('.txt')) { // Você pode adicionar mais condições
        return;
      }

      if (stat.isDirectory()) {
        readDirRecursive(filePath, fileList);
      } else {
        fileList.push(filePath);
      }
    });
    return fileList;
  };

  const templateFiles = readDirRecursive(templatesDir);
  const targetModuleDir = path.join(modulesDir, fileName); // src/modules/user ou src/modules/product-item

  // Criar o diretório raiz do novo módulo
  if (!fs.existsSync(targetModuleDir)) {
    fs.mkdirSync(targetModuleDir, { recursive: true });
    console.log(`  Criado diretório: ${path.relative(process.cwd(), targetModuleDir)}`);
  }

  for (const templatePath of templateFiles) {
    let relativePathFromTemplates = path.relative(templatesDir, templatePath);
    let finalTargetPath;

    // A regra para o module principal (que está na raiz dos templates)
    if (relativePathFromTemplates === `__name__.module.ts.hbs`) {
      finalTargetPath = path.join(targetModuleDir, `${fileName}.module.ts`);
    } else {
      // Para os outros arquivos dentro das subpastas, apenas substituímos o __name__/__names__
      let processedPath = relativePathFromTemplates;
      for (const key in replacements) {
        const regex = new RegExp(key, 'g');
        processedPath = processedPath.replace(regex, replacements[key]);
      }
      finalTargetPath = path.join(targetModuleDir, processedPath.replace('.hbs', ''));
    }
    
    // Cria diretórios intermediários se não existirem
    const targetDir = path.dirname(finalTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const fileContent = fs.readFileSync(templatePath, 'utf8');
    const processedContent = processTemplateContent(fileContent);

    fs.writeFileSync(finalTargetPath, processedContent);
    console.log(`  Criado arquivo: ${path.relative(process.cwd(), finalTargetPath)}`);
  }

  console.log(`\nArquivos para '${singularCapitalized}' gerados com sucesso.`);

  // Parte extra: Adicionar o módulo ao app.module.ts
  console.log(`Adicionando ${singularCapitalized}Module a ${path.relative(process.cwd(), appModulePath)}...`);
  try {
    await addModuleToAppModule(singularCapitalized, fileName);
    console.log(`  Módulo ${singularCapitalized}Module adicionado ao app.module.ts.`);
  } catch (error) {
    console.error(`  Erro ao adicionar o módulo ao app.module.ts: ${error.message}`);
    console.log(`  Por favor, adicione "import { ${singularCapitalized}Module } from './modules/${fileName}/${fileName}.module';" e '${singularCapitalized}Module' ao array de imports em seu app.module.ts manualmente.`);
  }

  console.log(`\nGerador finalizado para '${singularCapitalized}'.`);
}


// --- Lógica para adicionar o módulo ao app.module.ts ---
async function addModuleToAppModule(className, kebabCaseName) {
  const moduleName = `${className}Module`;
  const importPath = `./modules/${kebabCaseName}/${kebabCaseName}.module`;

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  // 1. Adicionar Import Statement
  const newImportLine = `import { ${moduleName} } from '${importPath}';`;

  if (!appModuleContent.includes(newImportLine)) {
    // Tenta encontrar a última linha de import ou a linha antes do @Module para inserir
    const lastImportRegex = /(import\s+\{[^{}]+\}\s+from\s+['"].*['"];)(\n|\r\n|$)(?=(?:(\n|\r\n))?@Module)/g;
    const match = Array.from(appModuleContent.matchAll(lastImportRegex));
    
    if (match.length > 0) {
      const lastMatch = match[match.length - 1];
      const insertIndex = lastMatch.index + lastMatch[0].length;
      appModuleContent = appModuleContent.substring(0, insertIndex) + `\n${newImportLine}` + appModuleContent.substring(insertIndex);
    } else {
      // Fallback: se não encontrar um lugar adequado, insere no topo do arquivo.
      appModuleContent = newImportLine + '\n\n' + appModuleContent;
    }
  }

  // 2. Adicionar ao array de 'imports' dentro do @Module()
  // Procura por @Module({ imports: [...]
  const moduleImportsRegex = /(@Module\(\{[\s\S]*?imports:\s*\[)([^\]]*)(\])/;
  const importsMatch = appModuleContent.match(moduleImportsRegex);

  if (importsMatch) {
    const existingImports = importsMatch[2].trim();
    if (!existingImports.includes(moduleName)) {
      let updatedImports;
      if (existingImports === '') {
        // Se não houver imports, adicione com indentação
        updatedImports = `\n    ${moduleName}\n  `;
      } else {
        // Adicione o novo módulo com a mesma indentação dos existentes
        updatedImports = `${existingImports.trim()},\n    ${moduleName}\n  `;
      }
      appModuleContent = appModuleContent.replace(
        importsMatch[0],
        `${importsMatch[1]}${updatedImports}${importsMatch[3]}`
      );
    }
  } else {
    // Se o @Module com imports não for encontrado, tenta injetar um novo bloco de imports
    console.warn(`[WARN] Não foi possível encontrar um bloco de 'imports' em @Module(). Tentando criar um.`);
    const moduleDecoratorRegex = /(@Module\(\{)/;
    if (appModuleContent.match(moduleDecoratorRegex)) {
        appModuleContent = appModuleContent.replace(
            moduleDecoratorRegex,
            `$1\n  imports: [\n    ${moduleName}\n  ],`
        );
    } else {
        throw new Error("Não foi possível encontrar o decorator @Module em app.module.ts. Adição manual necessária.");
    }
  }

  fs.writeFileSync(appModulePath, appModuleContent, 'utf8');
}


// --- Lógica para executar o gerador via CLI ---
const args = process.argv.slice(2);
const resourceNameIndex = args.indexOf('--name');
let resourceName = null;

if (resourceNameIndex > -1 && args[resourceNameIndex + 1]) {
  resourceName = args[resourceNameIndex + 1];
} else {
  console.error('Uso: node tools/generate/generate-file.js --name <nome-do-recurso>');
  process.exit(1);
}

generateFiles(resourceName).catch(console.error);