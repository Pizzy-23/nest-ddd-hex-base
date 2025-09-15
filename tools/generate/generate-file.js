const fs = require('fs');
const path = require('path');

const templatesDir = path.resolve(__dirname, 'templates');
const srcRootDir = path.resolve(__dirname, '../../src'); // Raiz do src/

const appModulePath = path.resolve(__dirname, '../../src/app.module.ts'); // Caminho do app.module.ts

function toPascalCase(str) {
  return str.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
}

function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

async function generateFiles(name) {
  const fileName = toKebabCase(name);
  const className = toPascalCase(name);
  const pluralName = toKebabCase(name) + 's';
  const singularCapitalized = className;

  console.log(
    `\nIniciando geração para o recurso: ${singularCapitalized} (${fileName})`,
  );

  const replacements = {
    __name__: fileName,
    __Name__: className,
    __names__: pluralName,
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
    files.forEach((file) => {
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

  // A pasta raiz do NOVO MÓDULO, ex: src/application/modules/testagain/
  const moduleSpecificRootDestDir = path.join(
    srcRootDir,
    'application',
    'modules',
    fileName,
  );

  // CRIA A PASTA DO MÓDULO (ex: testagain) antes de tentar colocar arquivos nela
  if (!fs.existsSync(moduleSpecificRootDestDir)) {
    fs.mkdirSync(moduleSpecificRootDestDir, { recursive: true });
    console.log(
      `  Criado diretório base do novo módulo: ${path.relative(process.cwd(), moduleSpecificRootDestDir)}`,
    );
  }

  for (const templatePath of templateFiles) {
    let relativePathFromTemplates = path.relative(templatesDir, templatePath);
    relativePathFromTemplates = relativePathFromTemplates.replace(/\\/g, '/'); // Normaliza barras

    let finalDestFolder; // Onde o arquivo será criado no src/
    let fileNameInDest = ''; // O nome do arquivo + sua subpasta no template (ex: 'dtos/create-__name__.dto.ts.hbs')

    // Mapeamento preciso da pasta do template para a pasta de destino em src/
    // ARQUIVOS DENTRO DA PASTA DO MÓDULO ESPECÍFICO (ex: src/application/modules/testagain/dtos/)
    if (relativePathFromTemplates.startsWith('application-dtos-in-module/')) {
      finalDestFolder = path.join(moduleSpecificRootDestDir, 'dtos');
      fileNameInDest = relativePathFromTemplates.replace(
        'application-dtos-in-module/',
        '',
      );
    } else if (
      relativePathFromTemplates.startsWith('application-modules-file/')
    ) {
      finalDestFolder = moduleSpecificRootDestDir; // Direto na raiz da pasta do módulo
      fileNameInDest = relativePathFromTemplates.replace(
        'application-modules-file/',
        '',
      );
    } else if (
      relativePathFromTemplates.startsWith('application-use-cases-in-module/')
    ) {
      finalDestFolder = path.join(moduleSpecificRootDestDir, 'use-cases');
      fileNameInDest = relativePathFromTemplates.replace(
        'application-use-cases-in-module/',
        '',
      );
    }
    //
    // ARQUIVOS GLOBAIS NO SRC/
    //
    else if (relativePathFromTemplates.startsWith('domain-entities/')) {
      finalDestFolder = path.join(srcRootDir, 'domain', 'entities');
      fileNameInDest = relativePathFromTemplates.replace(
        'domain-entities/',
        '',
      );
    } else if (relativePathFromTemplates.startsWith('domain-repositories/')) {
      finalDestFolder = path.join(srcRootDir, 'domain', 'repositories');
      fileNameInDest = relativePathFromTemplates.replace(
        'domain-repositories/',
        '',
      );
    } else if (
      relativePathFromTemplates.startsWith(
        'infrastructure-database-typeorm-entities/',
      )
    ) {
      finalDestFolder = path.join(
        srcRootDir,
        'infrastructure',
        'database',
        'typeorm',
        'entities',
      );
      fileNameInDest = relativePathFromTemplates.replace(
        'infrastructure-database-typeorm-entities/',
        '',
      );
    } else if (
      relativePathFromTemplates.startsWith(
        'infrastructure-database-typeorm-repositories/',
      )
    ) {
      finalDestFolder = path.join(
        srcRootDir,
        'infrastructure',
        'database',
        'typeorm',
        'repositories',
      );
      fileNameInDest = relativePathFromTemplates.replace(
        'infrastructure-database-typeorm-repositories/',
        '',
      );
    } else if (
      relativePathFromTemplates.startsWith('infrastructure-http-controllers/')
    ) {
      finalDestFolder = path.join(
        srcRootDir,
        'infrastructure',
        'http',
        'controllers',
      );
      fileNameInDest = relativePathFromTemplates.replace(
        'infrastructure-http-controllers/',
        '',
      );
    } else {
      console.warn(
        `[WARN] Caminho de template inesperado ou não mapeado: ${relativePathFromTemplates}. Pulando.`,
      );
      continue;
    }

    // Processar placeholders no nome do arquivo final
    let processedFileNameInDest = fileNameInDest;
    for (const key in replacements) {
      const regex = new RegExp(key, 'g');
      processedFileNameInDest = processedFileNameInDest.replace(
        regex,
        replacements[key],
      );
    }

    const finalTargetPath = path.join(
      finalDestFolder,
      processedFileNameInDest.replace('.hbs', ''),
    );

    // Cria diretórios intermediários no destino (ex: src/application/modules/testagain/dtos/)
    const targetDir = path.dirname(finalTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(
        `  Criado sub-diretório de destino: ${path.relative(process.cwd(), targetDir)}`,
      );
    }

    const fileContent = fs.readFileSync(templatePath, 'utf8');
    const processedContent = processTemplateContent(fileContent);

    fs.writeFileSync(finalTargetPath, processedContent);
    console.log(
      `  Criado arquivo: ${path.relative(process.cwd(), finalTargetPath)}`,
    );
  }

  console.log(`\nArquivos para '${singularCapitalized}' gerados com sucesso.`);

  // Parte extra: Adicionar o módulo ao app.module.ts
  console.log(
    `Adicionando ${singularCapitalized}Module a ${path.relative(process.cwd(), appModulePath)}...`,
  );
  try {
    // O importPath aponta para: './application/modules/__name__/__name__.module'
    await addModuleToAppModule(singularCapitalized, fileName);
    console.log(
      `  Módulo ${singularCapitalized}Module adicionado ao app.module.ts.`,
    );
  } catch (error) {
    console.error(
      `  Erro ao adicionar o módulo ao app.module.ts: ${error.message}`,
    );
    // Mensagem de erro para adição manual (caminho correto)
    console.log(
      `  Por favor, adicione "import { ${singularCapitalized}Module } from './application/modules/${fileName}/${fileName}.module';" e '${singularCapitalized}Module' ao array de imports em seu app.module.ts manualmente.`,
    );
  }

  console.log(`\nGerador finalizado para '${singularCapitalized}'.`);
}

// --- Lógica para adicionar o módulo ao app.module.ts ---
async function addModuleToAppModule(className, kebabCaseName) {
  const moduleName = `${className}Module`;
  // Path do app.module para o NOVO *.module.ts: './application/modules/__name__/__name__.module'
  const importPath = `./application/modules/${kebabCaseName}/${kebabCaseName}.module`;

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  // 1. Adicionar Import Statement
  const newImportLine = `import { ${moduleName} } from '${importPath}';`;

  if (!appModuleContent.includes(newImportLine)) {
    const lastImportRegex =
      /(import(?:[\w\s,{}*]+\s+from\s+['"].*['"];?\s*)+)(?=\n?@Module|\n+\w+\s+@Injectable|\n+const\s+\w+\s*=\s*\[|\n+[\s]*class)/;
    const match = appModuleContent.match(lastImportRegex);

    if (match) {
      const insertIndex = match.index + match[1].length;
      appModuleContent =
        appModuleContent.substring(0, insertIndex) +
        `\n${newImportLine}` +
        appModuleContent.substring(insertIndex);
    } else {
      appModuleContent = newImportLine + '\n\n' + appModuleContent;
    }
  }

  // 2. Adicionar ao array de 'imports' dentro do @Module()
  const moduleImportsRegex = /(@Module\(\{[\s\S]*?imports:\s*\[)([^\]]*)(\])/;
  const importsMatch = appModuleContent.match(moduleImportsRegex);

  if (importsMatch) {
    let existingImports = importsMatch[2].trim();
    if (!existingImports.includes(moduleName)) {
      let updatedImports;
      if (existingImports === '') {
        updatedImports = `\n    ${moduleName}\n  `;
      } else {
        updatedImports = `${existingImports.trim()},\n    ${moduleName}\n  `;
      }
      appModuleContent = appModuleContent.replace(
        importsMatch[0],
        `${importsMatch[1]}${updatedImports}${importsMatch[3]}`,
      );
    }
  } else {
    console.warn(
      `[WARN] Não foi possível encontrar um bloco de 'imports' em @Module(). Tentando criar um.`,
    );
    const moduleDecoratorRegex = /(@Module\(\{)/;
    if (appModuleContent.match(moduleDecoratorRegex)) {
      appModuleContent = appModuleContent.replace(
        moduleDecoratorRegex,
        `$1\n  imports: [\n    ${moduleName}\n  ],`,
      );
    } else {
      throw new Error(
        'Não foi possível encontrar o decorator @Module em app.module.ts. Adição manual necessária.',
      );
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
  console.error(
    'Uso: node tools/generate/generate-file.js --name <nome-do-recurso>',
  );
  process.exit(1);
}

generateFiles(resourceName).catch(console.error);
