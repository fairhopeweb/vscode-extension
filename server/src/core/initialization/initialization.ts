import { Container } from 'aurelia-dependency-injection';
import { Logger } from 'culog';
import * as path from 'path';
import * as fastGlob from 'fast-glob';
import { fileURLToPath } from 'url';
import { TextDocument } from 'vscode-languageserver-textdocument';
import {
  AureliaProjects,
  IAureliaProject,
} from '../../common/aurelia-projects';
import { ExtensionSettings } from '../../configuration/DocumentSettings';

const logger = new Logger({ scope: 'aureliaServer' });

/**
 * 1. Init DI
 * 2. Detect Aurelia project
 * 3. Hydrate Project map
 */
export async function onConnectionInitialized(
  container: Container,
  extensionSettings: ExtensionSettings,
  activeDocuments: TextDocument[] = []
) {
  // initDependencyInjection(container, extensionSettings);
  const aureliaProjects = container.get(AureliaProjects);
  setAndVerifyProjectFiles(extensionSettings, aureliaProjects);
  await hydrateProjectWithActiveDocuments(activeDocuments, aureliaProjects);
}

async function setAndVerifyProjectFiles(
  extensionSettings: ExtensionSettings,
  aureliaProjects: AureliaProjects
) {
  const packageJsonPaths = getPackageJsonPaths(extensionSettings);
  await aureliaProjects.setAureliaProjects(packageJsonPaths);
  const projects = aureliaProjects.getProjects();
  const hasAureliaProject = projects.length > 0;

  if (!hasAureliaProject) {
    logHasNoAureliaProject();
    return;
  }
  logFoundAureliaProjects(projects);
}

async function hydrateProjectWithActiveDocuments(
  activeDocuments: TextDocument[],
  aureliaProjects: AureliaProjects
) {
  logger.debug(['Parsing Aurelia related data...'], { logLevel: 'INFO' });
  const activeDocumentPaths = activeDocuments.map((activeDocument) => {
    const documentPath = fileURLToPath(path.normalize(activeDocument.uri));
    return documentPath;
  });
  await aureliaProjects.hydrateAureliaProjectList(activeDocumentPaths);
  logger.debug(['Parsing done. Aurelia Extension is ready.'], {
    logLevel: 'INFO',
  });
}

function getPackageJsonPaths(extensionSettings: ExtensionSettings) {
  const workspaceRootUri =
    extensionSettings.aureliaProject?.rootDirectory ?? '';
  const cwd = fileURLToPath(path.normalize(workspaceRootUri));
  const packageJsonPaths = fastGlob.sync('**/package.json', {
    absolute: true,
    ignore: ['node_modules'],
    cwd,
  });
  return packageJsonPaths;
}

function logFoundAureliaProjects(aureliaProjects: IAureliaProject[]) {
  logger.debug([`Found ${aureliaProjects.length} Aurelia projects in: `], {
    logLevel: 'INFO',
  });
  aureliaProjects.forEach(({ tsConfigPath }) => {
    logger.debug([tsConfigPath], {
      logLevel: 'INFO',
    });
  });
}

function logHasNoAureliaProject() {
  logger.debug(['No active Aurelia project found.'], {
    logLevel: 'INFO',
  });
  logger.debug(
    [
      'Extension will activate, as soon as a file inside an Aurelia project is opened.',
    ],
    { logLevel: 'INFO' }
  );
}
