import HaxxorBunnyCommand from './base';
import InfoCommand from './info';

const commands: Partial<Record<string, HaxxorBunnyCommand>> = {
  [InfoCommand.data.name]: InfoCommand,
};

export default commands;
