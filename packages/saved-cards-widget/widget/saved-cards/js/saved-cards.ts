import ko from 'knockout';
import savedCard from './components/SavedCard';
import profileCardsClient from './services/profileCardsClient';
import widgetStore from './store';
import actions from './store/actions';

ko.components.register('saved-card', savedCard);

class SavedCardsWidget {
  store = widgetStore;
  canDisplayCards = ko.observable(false);

  beforeAppear = () => {
    this.canDisplayCards(this.isUserLoggedIn());

    return profileCardsClient.getCreditCardsForProfile().then(actions.updateAllCards);
  };

  onLoad = (widget: OCC.WidgetViewModel) => {
    this.store.init(widget);

    Object.assign(this, widget);
  };

  chunk = (arr: any[], chunkSize: number) => {
    const result = [];
    for (let i = 0, len = arr.length; i < len; i += chunkSize)
      result.push(arr.slice(i, i + chunkSize));
    return result;
  };

  isUserLoggedIn() {
    return this.store.widget.user().loggedIn();
  }
}

export default new SavedCardsWidget();
