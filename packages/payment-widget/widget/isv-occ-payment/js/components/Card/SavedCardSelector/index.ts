import ko from 'knockout';
import { CardModel, CardPaymentController, SavedCardModelDetails } from '../common';
import template from './index.html';

interface SavedCardSelectorParams {
  cards: KnockoutObservableArray<OCC.SavedCard>;
  paymentController: CardPaymentController;
}

function SavedCardSelector(params: SavedCardSelectorParams) {
  const { cards, paymentController } = params;

  if (!paymentController) {
    throw new Error('SavedCardSelector: `paymentController` parameter is missing');
  }

  const selectedIndex = ko.observable();
  let selectedCard: { savedCardId: string; iin: string };

  const defaultIndex = ko.computed(function () {
    const index = cards().findIndex((savedCard) => savedCard.isDefault === true);
    selectedIndex(index);
    return index;
  });

  const cardModel: CardModel = {
    validate() {
      return true;
    },
    getCardData(): SavedCardModelDetails {
      selectedCard = cards()[selectedIndex()];
      const { savedCardId } = selectedCard;
      return {
        savedCardId
      };
    },
    getBin() {
      return selectedCard.iin;
    },
    reset() {
      // No action required
    }
  };

  paymentController.selectModel(cardModel);

  return {
    cards,
    selectedIndex,
    defaultIndex
  };
}

export default {
  viewModel: {
    createViewModel: SavedCardSelector
  },
  template
};
