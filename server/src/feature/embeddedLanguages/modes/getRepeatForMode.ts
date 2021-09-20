import { ViewRegionInfo, ViewRegionType } from '../embeddedSupport';
import { TextDocumentPositionParams } from 'vscode-languageserver';

import { LanguageMode, Position, TextDocument } from '../languageModes';
import { getAureliaVirtualCompletions } from '../../completions/virtualCompletion';
import { getAccessScopeViewModelDefinition } from '../../definition/accessScopeDefinition';
import { DefinitionResult } from '../../definition/getDefinition';
import {
  AureliaProgram,
  aureliaProgram as importedAureliaProgram,
} from '../../../viewModel/AureliaProgram';

export function getRepeatForMode(): LanguageMode {
  return {
    getId() {
      return ViewRegionType.RepeatFor;
    },
    async doComplete(
      document: TextDocument,
      _textDocumentPosition: TextDocumentPositionParams,
      triggerCharacter?: string,
      region?: ViewRegionInfo,
      aureliaProgram: AureliaProgram = importedAureliaProgram
    ) {
      const aureliaVirtualCompletions = await getAureliaVirtualCompletions(
        _textDocumentPosition,
        document,
        region,
        aureliaProgram
      );
      if (aureliaVirtualCompletions.length > 0) {
        return aureliaVirtualCompletions;
      }

      return [];
    },
    async doDefinition(
      document: TextDocument,
      position: Position,
      goToSourceWord: string,
      region?: ViewRegionInfo,
      aureliaProgram: AureliaProgram = importedAureliaProgram
    ): Promise<DefinitionResult | undefined> {
      return getAccessScopeViewModelDefinition(
        document,
        position,
        goToSourceWord,
        aureliaProgram
      );
    },
    onDocumentRemoved(_document: TextDocument) {},
    dispose() {},
  };
}
