import CharactersCommand from './characters';
import InfoCommand from './info';
import ManageCharactersCommand from './manage-characters';
import ManageValkyriesCommand from './manage-valkyries';
import MyValkyriesCommand from './my-valkyries';
import UserValkyriesCommand from './user-valkyries';
import ValkyriesCommand from './valkyries';

const commands = {
  [CharactersCommand.data.name]: CharactersCommand,
  [InfoCommand.data.name]: InfoCommand,
  [ManageCharactersCommand.data.name]: ManageCharactersCommand,
  [ManageValkyriesCommand.data.name]: ManageValkyriesCommand,
  [MyValkyriesCommand.data.name]: MyValkyriesCommand,
  [UserValkyriesCommand.data.name]: UserValkyriesCommand,
  [ValkyriesCommand.data.name]: ValkyriesCommand,
};

export default commands;
