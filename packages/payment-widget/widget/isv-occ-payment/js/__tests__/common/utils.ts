export function observablePromise(observable: KnockoutObservable<boolean>, resolvedBy = false) {
  if (observable() == resolvedBy) {
    return Promise.resolve();
  }

  return new Promise((resolve, _reject) => {
    observable.subscribe((newValue) => {
      if (newValue == resolvedBy) {
        resolve();
      }
    });
  });
}

export async function createComponent<T>(viewModelFactory: any, params: any): Promise<T> {
  const component = viewModelFactory.viewModel.createViewModel(params);

  await observablePromise(component.loading);

  return <T>component;
}
