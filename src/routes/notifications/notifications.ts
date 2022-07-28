import express from 'express';

import checkJwt from '../../middleware/checkJwt';
import checkRole from '../../middleware/checkRole';

const router = express.Router();

import { listNotificationsCtrl, revisedNotificationsCtrl, notificationCheckedCtrl } from '../../controllers/notifications/notifications';
import { idMdwParams, limitNotificationsMdl } from '../../middleware/notifications';

router.get(
  '/notifications',
  [
    checkJwt,
    checkRole( ['student', 'teacher'] ),
    limitNotificationsMdl
  ],
  listNotificationsCtrl
);

router.patch(
  '/notifications/revised',
  [
    checkJwt,
    checkRole( ['student', 'teacher'] )
  ],
  revisedNotificationsCtrl
);

router.patch(
  '/notifications/:id/checked',
  [
    checkJwt,
    checkRole( ['student', 'teacher'] ),
    idMdwParams
  ],
  notificationCheckedCtrl
);

export default router;
