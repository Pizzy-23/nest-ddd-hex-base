const fs = require('fs');
const path = require('path');

const templatesDir = path.resolve(__dirname, 'templates');
// O novo módulo raiz será src/application/modules/__name__/
const srcApplicationModulesDir = path.resolve(__dirname, '../../src/application/modules'); 

const appModulePath = path.resolve(__dirname, '../../src/app.module.ts');

function toPascalCase(str) {
  return str.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
}

function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

async function generateFiles(name) {
  const fileName = toKebabCase(name); // Ex: 'user-post'
  const className = toPascalCase(name); // Ex: 'UserPost'
  const pluralName = toKebabCase(name) + 's'; // Ex: 'user-posts' para tabelas/rotas
  const singularCapitalized = className;

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

  const readDirRecursive = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (file.startsWith('.') || file.endsWith('.txt')) {
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
  
  // A pasta raiz do NOVO módulo, ex: src/application/modules/test/
  const currentModuleBaseDestDir = path.join(srcApplicationModulesDir, fileName); 

  // Cria a pasta raiz do novo módulo, ex: src/application/modules/test/
  if (!fs.existsSync(currentModuleBaseDestDir)) {
    fs.mkdirSync(currentModuleBaseDestDir, { recursive: true });
    console.log(`  Criado diretório base do módulo: ${path.relative(process.cwd(), currentModuleBaseDestDir)}`);
  }


  for (const templatePath of templateFiles) {
    let relativePathFromTemplates = path.relative(templatesDir, templatePath);
    // 
    // CORREÇÃO CRUCIAL AQUI: Normaliza barras para usar '/' independente do OS
    // 
    relativePathFromTemplates = relativePathFromTemplates.replace(/\\/g, '/');

    let finalTargetPath;

    // A pasta base para este template é a raiz do novo módulo, currentModuleBaseDestDir
    // A única exceção seriam arquivos que não fazem parte do MÓDULO (o que não é o caso aqui)

    // Processar placeholders no nome do arquivo (e caminhos de subpastas do template, se houver)
    let processedRelativePath = relativePathFromTemplates; // Nome do arquivo de template
    for (const key in replacements) {
        const regex = new RegExp(key, 'g');
        processedRelativePath = processedRelativePath.replace(regex, replacements[key]);
    }

    // O finalTargetPath será sempre dentro da pasta do módulo.
    // Ex: templates/application/dtos/create-__name__.dto.ts.hbs 
    //  -> src/application/modules/test/application/dtos/create-test.dto.ts
    finalTargetPath = path.join(currentModuleBaseDestDir, processedRelativePath.replace('.hbs', ''));
    
    // Cria diretórios intermediários no destino se não existirem
    const targetDir = path.dirname(finalTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(`  Criado sub-diretório de destino: ${path.relative(process.cwd(), targetDir)}`);
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
    console.log(`  Por favor, adicione "import { ${singularCapitalized}Module } from './application/modules/${fileName}/${fileName}.module';" e '${singularCapitalized}Module' ao array de imports em seu app.module.ts manualmente.`);
  }

  console.log(`\nGerador finalizado para '${singularCapitalized}'.`);
}


// --- Lógica para adicionar o módulo ao app.module.ts (corrigindo importPath novamente) ---
async function addModuleToAppModule(className, kebabCaseName) {
  const moduleName = `${className}Module`;
  // Path para o módulo é a partir de src/, então: ./application/modules/__name__/__name__.module
  const importPath = `./application/modules/${kebabCaseName}/${kebabCaseName}.module`; 

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  // 1. Adicionar Import Statement
  const newImportLine = `import { ${moduleName} } from '${importPath}';`;

  if (!appModuleContent.includes(newImportLine)) {
    const lastImportRegex = /(import\s+\{[^{}]+\}\s+from\s+['"].*['"];)(\n|\r\n|$)(?=(?:(\n|\r\n))?@Module)/g;
    const match = Array.from(appModuleContent.matchAll(lastImportRegex));
    
    if (match.length > 0) {
      const lastMatch = match[lastMatch.length - 1]; // Use lastMatch to get the correct match
      const insertIndex = lastMatch.index + lastMatch[0].length;
      appModuleContent = appModuleContent.substring(0, insertIndex) + `\n${newImportLine}` + appModuleContent.substring(insertIndex);
    } else {
      appModuleContent = newImportLine + '\n\n' + appModuleContent;
    }
  }

  // 2. Adicionar ao array de 'imports' dentro do @Module()
  const moduleImportsRegex = /(@Module\(\{[\s\S]*?imports:\s*\[)([^\]]*)(\])/;
  const importsMatch = appModuleContent.match(moduleImportsRegex);

  if (importsMatch) {
    const existingImports = importsMatch[2].trim();
    if (!existingImports.includes(moduleName)) {
      let updatedImports;
      if (existingImports === '') {
        updatedImports = `\n    ${moduleName}\n  `;
      } else {
        updatedImports = `${existingImports.trim()},\n    ${moduleName}\n  `;
      }
      appModuleContent = appModuleContent.replace(
        importsMatch[0],
        `${importsMatch[1]}${updatedImports}${importsMatch[3]}`
      );
    }
  } else {
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