interface HaxxorBunnyErrorOptions extends ErrorOptions {
  userDisplayable?: boolean;
}

export default class HaxxorBunnyError extends Error {
  private _userDisplayable: boolean;

  constructor(message: string, options?: HaxxorBunnyErrorOptions) {
    super(message, options);
    this._userDisplayable = options?.userDisplayable ?? false;
  }

  public get userDisplayable(): boolean {
    return this._userDisplayable;
  }
}
