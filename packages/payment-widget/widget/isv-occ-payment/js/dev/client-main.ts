import '@isv-occ-payment/occ-mock-storefront/src/cc-ko-extensions';
import occWidget from '@isv-occ-payment/occ-mock-storefront/src/widget';
import ko from 'knockout';
import 'knockout.validation';
import '../../less/widget.less';
import translations from '../../locales/en/ns.isv-occ-payment.json';
import widgetTemplate from '../../templates/display.template';
import paymentWidget from '../isv-occ-payment';
import controls from './controls';

// Adding localization specific to the widget
occWidget.addTranslations(translations);

// Register 'payment-widget' custom element to be displayed on the test page (see dev/index.html)
ko.components.register('payment-widget', {
  viewModel: {
    instance: paymentWidget
  },
  template: widgetTemplate
});

// Simulate onLoad call with OCC Widget context
paymentWidget.onLoad(occWidget);

// Simulate beforeAppear call
paymentWidget.beforeAppear();

// Apply bindings to the main 'div' on the testing page (see dev/index.html)
ko.applyBindings(
  {
    widget: occWidget,
    controls: controls
  },
  document.getElementById('app')
);
