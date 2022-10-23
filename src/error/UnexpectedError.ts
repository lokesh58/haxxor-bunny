import HaxxorBunnyError from './HaxxorBunnyError';

export default class UnexpectedError extends HaxxorBunnyError {
  constructor(err: unknown) {
    super(err instanceof Error ? err.message : `${err}`, { cause: err });
  }
}
