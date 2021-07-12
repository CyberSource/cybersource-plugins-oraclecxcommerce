export default <OCC.OccContextData>{
  page: {
    payment: {
      cards: [
        {
          img:
            'https://ccadmin-z0aa.oracleoutsourcing.com/file/v6060804815930787560/ccimg/visa_straight.png',
          code: '001',
          name: 'Visa',
          length: '13|16',
          startDateRequired: false,
          value: 'visa',
          cvvLength: 3,
          iin: '4'
        },
        {
          img:
            'https://ccadmin-z0aa.oracleoutsourcing.com/file/v486318503902086876/ccimg/mastercard.png',
          code: '002',
          name: 'Mastercard',
          length: '16',
          startDateRequired: false,
          value: 'mastercard',
          cvvLength: 3,
          iin: '5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720'
        },
        {
          img:
            'https://ccadmin-z0aa.oracleoutsourcing.com/file/v1607813687303070648/ccimg/discover.png',
          code: '004',
          name: 'Discover',
          length: '16',
          startDateRequired: false,
          value: 'discover',
          cvvLength: 3,
          iin: '6[0245]'
        },
        {
          img: 'https://ccadmin-z0aa.oracleoutsourcing.com/file/v707445261375014342/ccimg/jcb.png',
          code: '007',
          name: 'JCB',
          length: '16',
          startDateRequired: false,
          value: 'jcb',
          cvvLength: 3,
          iin: '3[0135]'
        }
      ],
      IINPromotionsEnabled: false,
      isCVVRequiredForSavedCards: true,
      enabledTypes: ['generic', 'card'],
      isCardGatewayGeneric: true
    }
  }
};
