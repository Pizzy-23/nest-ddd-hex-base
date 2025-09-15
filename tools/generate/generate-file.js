const fs = require('fs');
const path = require('path');

// Caminho para o diretório onde os templates .hbs estão
const templatesDir = path.resolve(__dirname, 'templates');
// Caminho raiz do projeto, para que os arquivos gerados comecem a partir de 'src'
const srcRootDir = path.resolve(__dirname, '../../src');

// Caminho para o arquivo app.module.ts (para adicionar o novo módulo)
const appModulePath = path.resolve(srcRootDir, 'app.module.ts');

/**
 * Converte uma string para PascalCase. Ex: 'my-string' -> 'MyString'
 * @param {string} str - A string de entrada.
 * @returns {string} A string em PascalCase.
 */
function toPascalCase(str) {
  return str.replace(/(?:^|-)(\w)/g, (_, c) => c.toUpperCase());
}

/**
 * Converte uma string para KebabCase. Ex: 'MyString' -> 'my-string'
 * @param {string} str - A string de entrada.
 * @returns {string} A string em KebabCase.
 */
function toKebabCase(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Função principal para gerar arquivos com base nos templates.
 * @param {string} name - O nome do recurso (singular, em kebab-case, ex: 'user', 'product').
 */
async function generateFiles(name) {
  // Converte o nome de entrada para os diversos formatos necessários
  const fileName = toKebabCase(name); // Ex: 'workflow'
  const className = toPascalCase(name); // Ex: 'Workflow'
  const pluralName = toKebabCase(name) + 's'; // Ex: 'workflows'

  // Para o token de repositório em maiúsculas (WORFLOW_REPOSITORY_TOKEN)
  const moduleNameUppercase = className.toUpperCase(); // Ex: 'Workflow' -> 'WORKFLOW'

  console.log(`\nIniciando geração para o recurso: ${className} (${fileName})`);

  // Objeto com todas as substituições de placeholders
  const replacements = {
    __name__: fileName, // Ex: worflow
    __Name__: className, // Ex: Worflow
    __names__: pluralName, // Ex: worflows
    __MODULE_NAME_UPPERCASE___: moduleNameUppercase, // Ex: WORFLOW (para tokens de repositório)
  };

  /**
   * Processa o conteúdo do template, substituindo todos os placeholders.
   * @param {string} templateContent - O conteúdo do template.
   * @returns {string} O conteúdo com os placeholders substituídos.
   */
  const processTemplateContent = (templateContent) => {
    let content = templateContent;
    for (const key in replacements) {
      // Usar 'g' para substituir todas as ocorrências
      // Para o token uppercase, garantir que o underscore extra seja tratado no regex ou no placeholder.
      const regex = new RegExp(key, 'g');
      content = content.replace(regex, replacements[key]);
    }
    return content;
  };

  /**
   * Lê recursivamente os arquivos de um diretório.
   * @param {string} dir - O diretório a ser lido.
   * @param {string[]} [fileList=[]] - Lista de arquivos encontrados.
   * @returns {string[]} Lista de caminhos completos dos arquivos.
   */
  const readDirRecursive = (dir, fileList = []) => {
    const files = fs.readdirSync(dir);
    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      // Ignora arquivos/diretórios que começam com '.' ou terminam com '.txt' (para fins de readme/ignore)
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

  // Obtém todos os caminhos dos templates
  const templateFiles = readDirRecursive(templatesDir);

  // A pasta raiz do NOVO MÓDULO, ex: src/application/modules/workflow/
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
      `  Criado diretório base do novo módulo: ${path.relative(
        process.cwd(),
        moduleSpecificRootDestDir,
      )}`,
    );
  }

  // Itera sobre cada template encontrado
  for (const templatePath of templateFiles) {
    let relativePathFromTemplates = path.relative(templatesDir, templatePath);
    relativePathFromTemplates = relativePathFromTemplates.replace(/\\/g, '/'); // Normaliza barras (Windows/Linux)

    let finalDestFolder; // Onde o arquivo será criado no src/
    let fileNameInDest = ''; // O nome do arquivo no template (ex: 'dtos/create-__name__.dto.ts.hbs')

    // Mapeamento preciso da pasta do template para a pasta de destino em src/
    // A LÓGICA DEVE ESPELHAR SUA ESTRUTURA DE DIRETÓRIOS DO `src`
    //
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
    // Estes arquivos vão para um lugar único e não repetem em cada módulo gerado
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

    // Processar placeholders no nome do arquivo final (ex: '__name__.module.ts.hbs' -> 'workflow.module.ts')
    let processedFileNameInDest = fileNameInDest;
    for (const key in replacements) {
      const regex = new RegExp(key, 'g');
      processedFileNameInDest = processedFileNameInDest.replace(
        regex,
        replacements[key],
      );
    }

    // Remove a extensão .hbs
    const finalTargetPath = path.join(
      finalDestFolder,
      processedFileNameInDest.replace('.hbs', ''),
    );

    // Cria diretórios intermediários no destino (ex: src/application/modules/testagain/dtos/)
    const targetDir = path.dirname(finalTargetPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
      console.log(
        `  Criado sub-diretório de destino: ${path.relative(
          process.cwd(),
          targetDir,
        )}`,
      );
    }

    const fileContent = fs.readFileSync(templatePath, 'utf8');
    const processedContent = processTemplateContent(fileContent); // Processa o conteúdo do arquivo

    fs.writeFileSync(finalTargetPath, processedContent); // Escreve o arquivo final
    console.log(
      `  Criado arquivo: ${path.relative(process.cwd(), finalTargetPath)}`,
    );
  }

  console.log(`\nArquivos para '${className}' gerados com sucesso.`);

  // --- Parte extra: Adicionar o módulo ao app.module.ts ---
  console.log(
    `Adicionando ${className}Module a ${path.relative(process.cwd(), appModulePath)}...`,
  );
  try {
    await addModuleToAppModule(className, fileName);
    console.log(`  Módulo ${className}Module adicionado ao app.module.ts.`);
  } catch (error) {
    console.error(
      `  Erro ao adicionar o módulo ao app.module.ts: ${error.message}`,
    );
    // Mensagem de erro para adição manual (caminho correto)
    console.log(
      `  Por favor, adicione "import { ${className}Module } from './application/modules/${fileName}/${fileName}.module';" e '${className}Module' ao array de imports em seu app.module.ts manualmente.`,
    );
  }

  console.log(`\nGerador finalizado para '${className}'.`);
}

/**
 * Adiciona uma declaração de import e o módulo ao array 'imports' no app.module.ts.
 * @param {string} className - O nome da classe do módulo (Ex: 'User').
 * @param {string} kebabCaseName - O nome do arquivo do módulo (Ex: 'user').
 */
async function addModuleToAppModule(className, kebabCaseName) {
  const moduleName = `${className}Module`; // Ex: 'UserModule'
  // O caminho de import relativo do app.module.ts para o novo *.module.ts
  const importPath = `./application/modules/${kebabCaseName}/${kebabCaseName}.module`;

  let appModuleContent = fs.readFileSync(appModulePath, 'utf8');

  // 1. Adicionar Import Statement
  const newImportLine = `import { ${moduleName} } from '${importPath}';`;

  // Evita adicionar o import duplicado
  if (!appModuleContent.includes(newImportLine)) {
    // Tenta encontrar a última declaração de import para adicionar o novo import logo abaixo
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
      // Se não encontrar nenhum import, adiciona no topo do arquivo
      appModuleContent = newImportLine + '\n\n' + appModuleContent;
    }
  }

  // 2. Adicionar ao array de 'imports' dentro do @Module()
  const moduleImportsRegex = /(@Module\(\{[\s\S]*?imports:\s*\[)([^\]]*)(\])/;
  const importsMatch = appModuleContent.match(moduleImportsRegex);

  if (importsMatch) {
    let existingImports = importsMatch[2].trim();
    // Evita adicionar o módulo duplicado
    if (!existingImports.includes(moduleName)) {
      let updatedImports;
      if (existingImports === '') {
        // Se o array de imports estiver vazio
        updatedImports = `\n    ${moduleName}\n  `;
      } else {
        // Se já houver imports, adiciona uma vírgula e o novo módulo
        updatedImports = `${existingImports.trim()},\n    ${moduleName}\n  `;
      }
      appModuleContent = appModuleContent.replace(
        importsMatch[0],
        `${importsMatch[1]}${updatedImports}${importsMatch[3]}`,
      );
    }
  } else {
    // Caso o @Module com imports não seja encontrado, tenta adicionar um
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
      // Se nem o @Module for encontrado, lança erro para adição manual
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
    'Uso: node tools/generate/generate-file.js --name <nome-do-recurso-singular>',
  );
  process.exit(1);
}

// Executa a função principal do gerador
generateFiles(resourceName).catch(console.error);
