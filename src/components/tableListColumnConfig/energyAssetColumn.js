import prodConfig from "../../productionConfig";
import VueI18n from 'vue-i18n';
const i18n = new VueI18n({
    locale:prodConfig.lang == 'EN' ? 'EN' : 'CN',
    messages: {
        "CN" : require('../../../lang/CN-Cindy'),
        "EN" : require('../../../lang/EN-Cindy')
    }
})
export default [
    {
        label: i18n.t('ExplorerLang.energyAsset.name'),
        displayValue:'title',       
    },
   
    {
        label: i18n.t('ExplorerLang.energyAsset.amount'),
        displayValue: 'amount',
    },
    
]