import '@isv-occ-payment/occ-mock-storefront/src/cc-ko-extensions';
import occWidget from '@isv-occ-payment/occ-mock-storefront/src/widget';
import ko from 'knockout';
import 'knockout.validation';
import '../../less/widget.less';
import translations from '../../locales/en/ns.saved-cards.json';
import widgetTemplate from '../../templates/display.template';
import savedCardsWidget from '../saved-cards';
import controls from './controls';

// Adding localization specific to the widget
occWidget.addTranslations(translations);

ko.validation.init({});

// Register 'saved-cards' custom element to be displayed on the test page (see dev/index.html)
ko.components.register('saved-cards', {
  viewModel: {
    instance: savedCardsWidget
  },
  template: widgetTemplate
});

// Simulate onLoad call with OCC Widget context
savedCardsWidget.onLoad(occWidget);

// Simulate beforeAppear call
savedCardsWidget.beforeAppear();

// Apply bindings to the main 'div' on the testing page (see dev/index.html)
ko.applyBindings(
  {
    widget: occWidget,
    controls: controls
  },
  document.getElementById('app')
);
