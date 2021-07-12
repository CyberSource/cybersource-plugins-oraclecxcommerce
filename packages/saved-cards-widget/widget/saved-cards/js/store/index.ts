import ko from 'knockout';
class Store {
  widget!: OCC.WidgetViewModel;
  allCreditCards = ko.observableArray(<OCC.SavedCardList>[]);
  defaultCardId = ko.observable('');
  canEdit = ko.observable(true);

  init(widget: OCC.WidgetViewModel) {
    this.widget = widget;
  }
}

export default new Store();
