import Vue from 'vue';
import { 
    ConfigProvider,
    Select,
    Row,
    Button,
    DatePicker,
    TimePicker,
    Progress,
    Icon,
    InputNumber,
    Modal
 } from 'ant-design-vue';
Vue.use(ConfigProvider);
Vue.use(Select);
Vue.use(Row);
Vue.use(Button);
Vue.use(DatePicker);
Vue.use(TimePicker);
Vue.use(Progress);
Vue.use(Icon);
Vue.use(InputNumber);
Vue.use(Modal);

Vue.prototype.$confirm=Modal.confirm;