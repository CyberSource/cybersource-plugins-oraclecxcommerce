import ko from 'knockout';
import occWidget from './widget';

ko.bindingHandlers.widgetLocaleText = {
  update: function (element, valueAccessor, _allBindingsAccessor, _viewModel, _bindingContext) {
    const bindingValue = <any>valueAccessor();

    let translatedString = 'NO_TRANSLATION';

    if (typeof bindingValue == 'string') {
      translatedString = occWidget.translate(bindingValue);
    } else if (typeof bindingValue == 'object' && bindingValue.value != undefined) {
      translatedString = occWidget.translate(bindingValue.value, bindingValue.params);
    }

    if (typeof bindingValue == 'object' && bindingValue.attr && bindingValue.attr !== 'innerText') {
      $(element).attr(bindingValue.attr, translatedString);
    } else {
      $(element).text(translatedString);
    }
  }
};
