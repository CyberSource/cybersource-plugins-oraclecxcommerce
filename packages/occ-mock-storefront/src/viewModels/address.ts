import ko from 'knockout';

export default <OCC.Address>{
  city: ko.observable('New York'),
  selectedCountry: ko.observable('US'),
  country: ko.observable('US'),
  firstName: ko.observable('Test'),
  lastName: ko.observable('Shopper'),
  postalCode: ko.observable('10017'),
  selectedState: ko.observable('NY'),
  address1: ko.observable('292 Madison Avenue'),
  email: ko.observable('test.shopper@example.com'),

  isValid: () => true
};
