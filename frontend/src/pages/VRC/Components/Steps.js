// steps.js
import BasicInfo from '../Steps/01BasicInfo';
import Payment from '../Steps/02Payment';
import ManagementAndCommunication from '../Steps/03ManagementAndCommunication';
import SafetyandAccessibility from '../Steps/04SafetyAndAccessibility';
import Sound from '../Steps/05Sound';
import Hospitality from '../Steps/06Hospitality';
import Overall from '../Steps/07Overall';

const steps = [
  { label: 'Basic Info', short: 'Basic', component: BasicInfo },
  { label: 'Payment', short: 'Pay', component: Payment },
  { label: 'Management + Communication', short: 'Comms', component: ManagementAndCommunication },
  { label: 'Safety + Accessibility', short: 'Access', component: SafetyandAccessibility },
  { label: 'Sound', short: 'Sound', component: Sound },
  { label: 'Hospitality', short: 'Hosp', component: Hospitality },
  { label: 'Overall', short: 'Overall', component: Overall },
];

export default steps;