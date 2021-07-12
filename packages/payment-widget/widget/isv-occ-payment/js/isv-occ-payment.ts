import components from './components';
import checkout from './services/checkout';
import occClient from './services/occClient';
import paymentStore from './store/paymentStore';

class PaymentWidget {
  store = paymentStore;

  beforeAppear = () => {
    components.beforeAppear();
  };

  onLoad = (widget: OCC.WidgetViewModel) => {
    paymentStore.init(widget);
    occClient.init(widget);
    checkout.init();

    Object.assign(this, widget);
  };
}

export default new PaymentWidget();
