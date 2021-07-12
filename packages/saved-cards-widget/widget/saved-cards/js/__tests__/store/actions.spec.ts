import store from '@saved-cards-widget/store';
import actions from '@saved-cards-widget/store/actions';
import { mockDeep } from 'jest-mock-extended';

describe('Store - Actions', () => {
  const savedCard = mockDeep<OCC.SavedCard>();
  const cardList = [savedCard];

  it('should update list of cards', () => {
    actions.updateAllCards(cardList);

    expect(store.allCreditCards()).toBe(cardList);
  });

  it('should update default card id', () => {
    actions.updateDefault('id');

    expect(store.defaultCardId()).toBe('id');
  });

  it('should remove card from the list', () => {
    actions.remove(savedCard);

    expect(store.allCreditCards()).toEqual([]);
  });
});
