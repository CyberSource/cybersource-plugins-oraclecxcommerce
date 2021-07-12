import store from './index';

export default {
  updateAllCards(cards: OCC.SavedCardList) {
    store.allCreditCards(cards);
  },

  updateDefault(cardId: string) {
    store.defaultCardId(cardId);
  },

  remove(card: OCC.SavedCard) {
    store.allCreditCards.remove(card);
  }
};
