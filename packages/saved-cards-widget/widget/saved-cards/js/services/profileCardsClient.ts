import ccRestClient from 'ccRestClient';

const request = <T>(url: string, inputData: any, param?: string) => {
  return new Promise<T>((resolve, reject) => {
    ccRestClient.request(
      url,
      inputData,
      (data) => resolve(data),
      (errorData) => reject(errorData),
      param
    );
  });
};

interface UpdateDefault {
  setAsDefault: boolean;
}

interface UpdateNickname {
  nickname: string;
}

type SavedCardUpdate = UpdateDefault | UpdateNickname;

export default {
  removeCreditCard(savedCardId: string) {
    return request('removeCreditCard', {}, savedCardId);
  },

  updateCreditCard(savedCardId: string, data: SavedCardUpdate) {
    return request('updateCreditCard', data, savedCardId);
  },

  getCreditCardsForProfile() {
    return request('listCreditCards', {
      allCards: true,
      allGateways: true,
      allSites: true
    }).then((response: any) => <OCC.SavedCardList>response.items);
  }
};
