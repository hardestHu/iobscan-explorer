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

    },
    {
        label: i18n.t('ExplorerLang.table.ddcName'),
        displayValue: 'ddcName',
        nativeValue: 'ddcName',
    },


    {
        label: i18n.t('ExplorerLang.table.contractAddress'),
        displayValue: 'hash',
        nativeValue: 'hash',
        linkRoute: '/tx?txHash=',
        isLink: true,
        isNeedFormat: true,
        isNeedFormatHash: true,
    },
    {
        label: i18n.t('ExplorerLang.table.owner'),
        displayValue: 'nftCount',
        nativeValue: 'denomId',
        linkRoute: '/nftAsset?denomId=',
        isLink: true,
    },

    {
        label: i18n.t('ExplorerLang.table.uri'),
        displayValue: 'sender',
        nativeValue: 'sender',
        isLink: true,
        isNeedFormat: true,
        isFormatAddress: true,
        linkRoute: '/address/',
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
