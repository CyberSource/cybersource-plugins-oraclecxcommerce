import { CardPaymentController } from '@payment-widget/components/Card/common';
import SavedCardSelectorComponent from '@payment-widget/components/Card/SavedCardSelector';
import { getQueriesForElement } from '@testing-library/dom';
import { mockDeep } from 'jest-mock-extended';
import ko from 'knockout';

const createCard = (defaultIndex: number) => (i: number) => ({
  savedCardId: `id${1}`,
  isDefault: defaultIndex === i,
  nameOnCard: 'name' + i,
  expiryMonth: '0' + i,
  cardType: 'visa',
  nickname: 'visa' + i,
  expiryYear: '202' + i,
  cardNumber: 'xxxxxxxxxxxx111' + i,
  iin: '41111' + i
});

function generateCards(count: number, defaultIndex = 0) {
  return Array.from(Array(count).keys()).map(createCard(defaultIndex));
}

const mockPaymentController = mockDeep<CardPaymentController>();

describe('Saved Cards List Component', function () {
  const testComponentName = 'saved-card-list';
  let testNode: any;
  let testComponentParams: any;
  let testComponentBindingValue: any, outerViewModel: any;
  let domQueries: any;
  let cardsCount: any;
  let defaultCardIndex: number;

  beforeEach(() => {
    jest.useFakeTimers();
    testNode = document.createElement('div');
    testNode.innerHTML = `<div data-bind="component: testComponentBindingValue"></div>`;
    domQueries = getQueriesForElement(testNode);
    cardsCount = 2;
    defaultCardIndex = 1;
    testComponentParams = {
      cards: ko.observableArray(generateCards(cardsCount, defaultCardIndex)),
      paymentController: mockPaymentController
    };
    testComponentBindingValue = { name: testComponentName, params: testComponentParams };
    outerViewModel = {
      testComponentBindingValue: testComponentBindingValue,
      isOuterViewModel: true
    };

    ko.components.register(testComponentName, SavedCardSelectorComponent);
  });

  afterEach(() => {
    ko.components.unregister(testComponentName);
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('requires `paymentController` parameter', () => {
    testComponentParams.paymentController = null;
    jest.runAllTimers();

    expect(() => {
      ko.applyBindings(outerViewModel, testNode);
      jest.advanceTimersByTime(1);
    }).toThrow(/parameter is missing/);
  });

  it('It renders a card list container when at least one card is available', () => {
    ko.applyBindings(outerViewModel, testNode);

    jest.advanceTimersByTime(1);
    const savedCardsContainer = domQueries.getByTestId('savedCardsForm');
    expect(testNode).toContainElement(savedCardsContainer);
    expect(savedCardsContainer).toHaveTextContent('Your saved cards');
  });

  it('displays nothing when `cards` is empty array', () => {
    testComponentParams.cards([]);
    ko.applyBindings(outerViewModel, testNode);

    jest.advanceTimersByTime(1);
    expect(testNode).toHaveTextContent('');
  });

  it('displays one record for each card', () => {
    ko.applyBindings(outerViewModel, testNode);
    jest.advanceTimersByTime(1);
    const cardRecords = domQueries.getByTestId('savedCardsRecords');

    expect(cardRecords.children).toHaveLength(cardsCount);
  });

  it('uses a radio input group for card selection', () => {
    ko.applyBindings(outerViewModel, testNode);
    jest.advanceTimersByTime(1);
    const selectedRadio = domQueries.queryByRole('radio', { checked: true });

    expect(testNode).toContainElement(selectedRadio);
  });

  it('marks the selected record with `saved-card--selected` class', () => {
    ko.applyBindings(outerViewModel, testNode);
    jest.advanceTimersByTime(1);
    const selectedRecord = testNode.querySelector('.saved-card--selected');

    expect(selectedRecord).toHaveTextContent('visa' + defaultCardIndex);
  });

  it('preselects the default card on initial render', () => {
    ko.applyBindings(outerViewModel, testNode);
    jest.advanceTimersByTime(1);

    const selectedRadio = domQueries.getByRole('radio', { checked: true });
    const selectedRecord = testNode.querySelector('.saved-card--selected');
    expect(testNode).toContainElement(selectedRecord);
    expect(selectedRecord).toContainElement(selectedRadio);
    expect(selectedRadio).toHaveAttribute('value', `${defaultCardIndex}`);
  });

  it.todo('allows changing the card selection with a mouse click');
});
