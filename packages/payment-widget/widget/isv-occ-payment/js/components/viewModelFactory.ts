export interface PaymentViewModel {
  initialize(): void | Promise<void>;
}

export interface PaymentViewModelConstructor {
  new (params: any): PaymentViewModel;
}

export function viewModelFactory(viewModelType: PaymentViewModelConstructor, template: string) {
  return {
    viewModel: {
      createViewModel: (params: any) => {
        const paymentViewModel = new viewModelType(params);

        // Start component initialization at the time of creation
        // At this point templates are rendered, binding not yet applied
        paymentViewModel.initialize();

        return paymentViewModel;
      }
    },
    template: template
  };
}
