import widget from '@saved-cards-widget/saved-cards';
import profileCardsClient from '@saved-cards-widget/services/profileCardsClient';
import store from '@saved-cards-widget/store';
import actions from '@saved-cards-widget/store/actions';
import ko from 'knockout';
import { mocked } from 'ts-jest/utils';

jest.mock('@saved-cards-widget/services/profileCardsClient');
jest.mock('@saved-cards-widget/components/SavedCard');
jest.mock('@saved-cards-widget/store/actions');

describe('SavedCards - Widget', () => {
  const loggedIn = jest.fn();
  const occWidget = <any>{
    user: ko.observable({
      loggedIn
    })
  };

  beforeEach(() => {
    widget.onLoad(occWidget);
  });

  it('should assign store to the view model', () => {
    expect(widget.store).toBe(store);
  });

  it('should fetch all cards from profile before appear', async () => {
    const savedCards: OCC.SavedCardList = [];

    loggedIn.mockReturnValueOnce(true);
    mocked(profileCardsClient.getCreditCardsForProfile).mockResolvedValue(savedCards);

    await widget.beforeAppear();

    expect(actions.updateAllCards).toBeCalledWith(savedCards);
    expect(widget.canDisplayCards()).toBeTruthy();
  });

  it('should split a given array into chunks of a given size', () => {
    expect(widget.chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(widget.chunk([], 2)).toEqual([]);
  });
});
