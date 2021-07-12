import { API_ERROR_ID, SavedCard } from '@saved-cards-widget/components/SavedCard';
import profileCardsClient from '@saved-cards-widget/services/profileCardsClient';
import store from '@saved-cards-widget/store';
import actions from '@saved-cards-widget/store/actions';
import notifier from 'notifier';
import { mocked } from 'ts-jest/utils';

jest.mock('@saved-cards-widget/services/profileCardsClient');
jest.mock('@saved-cards-widget/store/actions');
jest.mock('notifier');

const SAVED_CARD_DATA = {
  savedCardId: 'usercc10001',
  hasExpired: false,
  isDefault: false,
  nameOnCard: 'card1',
  repositoryId: 'usercc10001',
  expiryMonth: '04',
  cardType: 'visa',
  nickname: 'visa - 1111',
  expiryYear: '2025',
  cardNumber: 'xxxxxxxxxxxx1111',
  iin: '411111'
};

describe('SavedCard - Component', () => {
  let component!: SavedCard;
  let savedCard!: OCC.SavedCard;

  beforeEach(() => {
    savedCard = <OCC.SavedCard>{ ...SAVED_CARD_DATA };
    component = new SavedCard({ savedCard });
  });

  it('should create view model from SavedCard DTO', async () => {
    expect(component.card).toBe(savedCard);
    expect(component.nickname()).toEqual(savedCard.nickname);
    expect(component.isDefault()).toEqual(savedCard.isDefault);
  });

  it('should capitalize card type', async () => {
    expect(component.card.cardType).toEqual('Visa');
  });

  it('should remove card', async () => {
    mocked(profileCardsClient.removeCreditCard).mockResolvedValueOnce(true);

    await component.remove();

    expect(profileCardsClient.removeCreditCard).toBeCalledWith(savedCard.savedCardId);
    expect(actions.remove).toBeCalledWith(savedCard);
    expect(notifier.clearError).toBeCalledWith(API_ERROR_ID);
  });

  it('should report error if remove card API call failed', async () => {
    mocked(profileCardsClient.removeCreditCard).mockRejectedValueOnce({});

    await component.remove();

    expect(notifier.sendError).toBeCalledWith(API_ERROR_ID, 'apiError');
    expect(actions.remove).not.toBeCalled();
  });

  it('should save card and update default', async () => {
    component.editInProgress(true);
    component.nickname('visa');
    component.isDefaultEdit(true);

    mocked(profileCardsClient.updateCreditCard).mockResolvedValueOnce(true);

    await component.save();

    expect(profileCardsClient.updateCreditCard).toBeCalledWith(
      savedCard.savedCardId,
      expect.objectContaining({
        nickname: 'visa',
        setAsDefault: true
      })
    );
    expect(actions.updateDefault).toBeCalledWith(savedCard.savedCardId);
    expect(notifier.clearError).toBeCalledWith(API_ERROR_ID);
    expect(component.editInProgress()).toBeFalsy();

    expect(component.card.nickname).toEqual(component.nickname());
    expect(component.card.isDefault).toEqual(component.isDefault());
  });

  it('should not update default if only nickname has changed', async () => {
    component.editInProgress(true);
    component.nickname('visa');
    component.isDefaultEdit(false);

    mocked(profileCardsClient.updateCreditCard).mockResolvedValueOnce(true);

    await component.save();

    expect(profileCardsClient.updateCreditCard).toBeCalledWith(
      savedCard.savedCardId,
      expect.objectContaining({
        nickname: 'visa'
      })
    );
  });

  it('should not update default card if saving only nickname', async () => {
    component.editInProgress(true);
    component.isDefaultEdit(false);

    mocked(profileCardsClient.updateCreditCard).mockResolvedValueOnce(true);

    await component.save();

    expect(actions.updateDefault).not.toBeCalled();
  });

  it('should report error if save card API call failed', async () => {
    mocked(profileCardsClient.updateCreditCard).mockRejectedValueOnce(true);

    await component.save();

    expect(notifier.sendError).toBeCalledWith(API_ERROR_ID, 'apiError');
    expect(actions.updateDefault).not.toBeCalled();
  });

  it('should start editing process', async () => {
    await component.edit();

    expect(component.editInProgress()).toBeTruthy();
    expect(component.isDefaultEdit()).toBeFalsy();
  });

  it('should cancel editing', async () => {
    component.nickname('visa');
    component.isDefault(true);
    component.editInProgress(true);

    await component.cancelUpdated();

    expect(component.editInProgress()).toBeFalsy();

    // Expect component state resets to original
    expect(component.nickname()).toBe(savedCard.nickname);
    expect(component.isDefault()).toBe(savedCard.isDefault);
  });

  it('should get last 4 digits of credit card', () => {
    expect(component.getLast4digits()).toBe('1111');
  });

  it('should validate', () => {
    component.nickname('nick');
    expect(component.validate()).toBeTruthy();

    component.nickname('');
    expect(component.validate()).toBeFalsy();
  });

  it.each`
    nickname                    | isDefaultEdit | modified
    ${'nick'}                   | ${false}      | ${true}
    ${SAVED_CARD_DATA.nickname} | ${true}       | ${true}
    ${SAVED_CARD_DATA.nickname} | ${false}      | ${false}
  `(
    'should be modified if edit values were actually changed',
    ({ nickname, isDefaultEdit, modified }) => {
      component.nickname(nickname);
      component.isDefaultEdit(isDefaultEdit);

      expect(component.isModified()).toBe(modified);
    }
  );

  it.each`
    valid    | modified | editInProgress | canSave
    ${false} | ${true}  | ${true}        | ${false}
    ${true}  | ${false} | ${true}        | ${false}
    ${false} | ${false} | ${true}        | ${false}
    ${true}  | ${true}  | ${false}       | ${false}
    ${true}  | ${true}  | ${true}        | ${true}
  `(
    'should be be able to save only if values have been modified and is valid',
    ({ valid, modified, editInProgress, canSave }) => {
      component.editInProgress(editInProgress);
      jest.spyOn(component, 'hasChanges').mockImplementation(() => modified);
      jest.spyOn(component, 'validate').mockImplementation(() => valid);

      expect(component.canSave()).toEqual(canSave);
    }
  );

  it.each`
    canEditGlobal | beingEdited | canEditCurrent
    ${false}      | ${true}     | ${true}
    ${true}       | ${false}    | ${true}
    ${true}       | ${true}     | ${true}
    ${false}      | ${false}    | ${false}
  `(
    'should be be able to edit only if another edit is not in progress',
    ({ canEditGlobal, beingEdited, canEditCurrent }) => {
      store.canEdit(canEditGlobal);
      component.editInProgress(beingEdited);

      expect(component.canEdit()).toEqual(canEditCurrent);
    }
  );

  it('should update its default status if another card has been selected as default', () => {
    component.card.isDefault = true;
    component.isDefault(true);

    // Another default card was selected
    store.defaultCardId('new-default-card');

    expect(component.isDefault()).toBeFalsy();
    expect(component.card.isDefault).toBeFalsy();
  });

  it('should unblock other components from editing if current edit is finished', () => {
    component.editInProgress(true);
    expect(store.canEdit()).toBeFalsy();

    component.editInProgress(false);
    expect(store.canEdit()).toBeTruthy();
  });
});
