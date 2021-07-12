export type Next = () => void | Promise<void>;

export type Middleware<T> = (context: T, next: Next) => Promise<void> | void;
export type Handler<T> = (context: T) => Promise<void> | void;
export type DispatchErrorHandler<T> = (err: any, context: T) => void;

export function middleware<T>(handler: Handler<T>): Middleware<T> {
  return async (context: T, next: Next) => {
    await handler(context);

    return next();
  };
}

export class GenericDispatcher<T> {
  middlewares: Middleware<T>[];
  errorHandler: DispatchErrorHandler<T>;

  constructor() {
    this.middlewares = [];

    // By default propagate error in case no specific errorHandler available
    this.errorHandler = (err, _context: T) => {
      throw err;
    };
  }

  use(...mw: Middleware<T>[]): void {
    this.middlewares.push(...mw);
  }

  catch(errorHandler: DispatchErrorHandler<T>) {
    this.errorHandler = errorHandler;
  }

  dispatch(context: T): Promise<void> {
    return invokeMiddlewares(context, this.middlewares).catch((err) =>
      this.errorHandler(err, context)
    );
  }
}

async function invokeMiddlewares<T>(context: T, middlewares: Middleware<T>[]): Promise<void> {
  if (!middlewares.length) return;

  const mw = middlewares[0];

  return mw(context, async () => {
    await invokeMiddlewares(context, middlewares.slice(1));
  });
}
