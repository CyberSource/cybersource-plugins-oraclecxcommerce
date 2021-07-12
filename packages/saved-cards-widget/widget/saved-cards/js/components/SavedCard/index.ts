import profileCardsClient from '@saved-cards-widget/services/profileCardsClient';
import store from '@saved-cards-widget/store';
import actions from '@saved-cards-widget/store/actions';
import ko from 'knockout';
import notifier from 'notifier';
import template from './index.html';

interface SavedCardParams {
  savedCard: OCC.SavedCard;
}

export const API_ERROR_ID = 'savedCards';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export class SavedCard {
  card: OCC.SavedCard;
  isDefault: KnockoutObservable<boolean>;
  isDefaultEdit = ko.observable(false);
  nickname: KnockoutObservable<string>;

  editInProgress = ko.observable(false);
  isModified: KnockoutComputed<boolean>;
  canSave: KnockoutComputed<boolean>;
  canEdit: KnockoutComputed<boolean>;

  validationOptions = {
    insertMessages: false
  };

  constructor(params: SavedCardParams) {
    this.card = params.savedCard;
    this.card.cardType = capitalize(this.card.cardType);
    this.nickname = ko.observable(this.card.nickname).extend({
      required: {
        message: store.widget.translate('nickNameInvalidError')
      }
    });
    this.isDefault = ko.observable(this.card.isDefault);

    this.isModified = ko.pureComputed(() => this.hasChanges());
    this.canSave = ko.pureComputed(
      () => this.hasChanges() && this.validate() && this.editInProgress()
    );
    this.canEdit = ko.pureComputed(() => store.canEdit() || this.editInProgress());

    store.defaultCardId.subscribe((value) => this.onDefaultUpdated(value));
    this.editInProgress.subscribe((value) => this.onEditStatusChanged(value));
  }

  hasChanges() {
    return this.nickname() !== this.card.nickname || this.isDefaultEdit();
  }

  onDefaultUpdated(newDefaultCardId: string) {
    const shouldSetAsDefault = this.card.savedCardId == newDefaultCardId;
    this.card.isDefault = shouldSetAsDefault;
    this.isDefault(shouldSetAsDefault);
  }

  onEditStatusChanged(isInProgress: boolean) {
    store.canEdit(!isInProgress);
  }

  remove() {
    return profileCardsClient
      .removeCreditCard(this.card.savedCardId)
      .then(() => actions.remove(this.card))
      .then(() => this.clearError())
      .catch(() => this.reportError());
  }

  save() {
    const setAsDefault = this.isDefaultEdit() || this.card.isDefault;

    return profileCardsClient
      .updateCreditCard(this.card.savedCardId, {
        nickname: this.nickname(),
        ...(setAsDefault && {
          setAsDefault: true
        })
      })
      .then(() => {
        if (this.isDefaultEdit()) {
          actions.updateDefault(this.card.savedCardId);
        }

        this.updateState();
        this.editInProgress(false);
      })
      .then(() => this.clearError())
      .catch(() => this.reportError());
  }

  edit() {
    this.isDefaultEdit(false);
    this.editInProgress(true);
  }

  cancelUpdated() {
    this.editInProgress(false);
    this.reset();
  }

  reset() {
    this.nickname(this.card.nickname);
    this.isDefault(this.card.isDefault);
  }

  updateState() {
    this.card.nickname = this.nickname();
    this.card.isDefault = this.isDefault();
  }

  validate() {
    return this.nickname.isValid();
  }

  clearError() {
    notifier.clearError(API_ERROR_ID);
  }

  reportError() {
    notifier.sendError(API_ERROR_ID, store.widget.translate('apiError'));
  }

  getLast4digits() {
    return this.card.cardNumber?.slice(-4);
  }
}

export default {
  viewModel: SavedCard,
  template: template
};
