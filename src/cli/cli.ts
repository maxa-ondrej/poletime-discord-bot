import { Command } from '@effect/cli';
import * as HelpDoc from '@effect/cli/HelpDoc';
import { command } from './command.js';

export const run = Command.run(command, {
  name: 'Team Manager :: Discord Bot',
  version: '1.0.0',
  footer: HelpDoc.p('Powered by Majksa'),
});
