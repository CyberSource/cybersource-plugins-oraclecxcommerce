import cardList from '../../data/listCreditCards.json';

const mapSavedCardDetails = (payment: any) => {
  const savedCard = cardList.items.find(
    (savedCard) => savedCard.savedCardId === payment.savedCardId
  );

  return (
    savedCard && {
      type: savedCard.cardType,
      expirationYear: savedCard.expiryYear,
      number: savedCard.cardNumber,
      holderName: savedCard.nameOnCard,
      expirationMonth: savedCard.expiryMonth,
      maskedCardNumber: savedCard.cardNumber,
      token: savedCard.token
    }
  );
};

const mapTokenizedCardDetails = (payment: any) => {
  return {
    type: payment.type,
    expirationYear: payment.expiryYear,
    number: payment.cardNumber,
    holderName: payment.nameOnCard,
    expirationMonth: payment.expiryMonth,
    maskedCardNumber: payment.cardNumber,
    saveCard: payment.saveCard
  };
};

export default (payment: any) => {
  return payment.savedCardId ? mapSavedCardDetails(payment) : mapTokenizedCardDetails(payment);
};
