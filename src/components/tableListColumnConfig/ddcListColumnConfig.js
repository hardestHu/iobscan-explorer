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
        label: i18n.t('ExplorerLang.table.ddcId'),
        displayValue: 'ddcId',
        nativeValue: 'ddcId',
        isLink: true,
        linkRoute: '/ddc/detail?contractAddr=',
        nftRouterParamsValue: 'contractAddr',
        denomRouter: '&ddcId=',
        isNft: true,
    },
    {
        label: i18n.t('ExplorerLang.table.ddcName'),
        displayValue: 'ddcName',
        nativeValue: 'ddcId',
        isLink: true,
        linkRoute: '/ddc/',
    },

    {
        label: i18n.t('ExplorerLang.table.contractAddress'),
        displayValue: 'contractAddr',
        nativeValue: 'contractAddr',
        isNeedFormat: true,
        isFormatAddress: true
    },
    {
        label: i18n.t('ExplorerLang.table.owner'),
        displayValue: 'owner',
        nativeValue: 'owner',
        linkRoute: '/address/',
        isLink: true,
        isNeedFormat:true,
        isFormatAddress: true

    },

    {
        label: i18n.t('ExplorerLang.table.uri'),
        displayValue: 'ddcUri',
        nativeValue: 'ddcUri',
        isNftHref:true,
    },

    {
        label: i18n.t('ExplorerLang.table.time'),
        displayValue: 'Time',
        nativeValue:'Time',
        isLink:false,
        linkRoute:'',
        isShowMoniker:false,
        width: 150,


    }
]
