import { Request, Response, Router } from 'express';
import gatewaySettings from '../data/gatewaySettings';
import profileCreditCards from '../data/listCreditCards.json';
import occAccessToken from '../data/occAccessToken.json';
import createOrder from './createOrder';
import profileDetails from '../data/profileDetails';

const router = Router();

const renderData = (data: any) =>
  async function (_req: Request, res: Response) {
    res.json(data);
  };

const SUCCESS = {
  success: true
};

router.get('/ccadmin/v1/sitesettings/isv-occ-gateway', renderData(gatewaySettings));
router.post('/ccadmin/v1/login', renderData(occAccessToken));
router.get('/ccapp/v1/profiles/:profileId',renderData(profileDetails))
router.post('/ccstore/v1/orders', createOrder);

router.get('/ccstore/v1/profiles/current/creditCards', renderData(profileCreditCards));
router.put('/ccstore/v1/profiles/current/creditCards/:id', renderData(SUCCESS));
router.delete('/ccstore/v1/profiles/current/creditCards/:id', renderData(SUCCESS));

export default router;
