/*
* 地址详情页数据对象列表配置项
* */
import {cfg} from "../../config";
import VueI18n from 'vue-i18n';
import prodConfig from "../../productionConfig";

const i18n = new VueI18n({
	locale: prodConfig.lang == 'EN' ? 'EN' : 'CN',
	messages: {
		"CN": require('../../../lang/CN-Cindy'),
		"EN": require('../../../lang/EN-Cindy')
	}
})

export default [
	{
		label:i18n.t('ExplorerLang.table.denom'),
		displayValue:'denomName',
	},
	{
		label:i18n.t('ExplorerLang.table.tokenName'),
		displayValue: 'nftName',
		nativeValue: 'id',
		nftRouterParamsValue: 'denomId',
		isLink: true,
		isNft: true,
		linkRoute: '/nft/token?denom=',
		denomRouter: '&tokenId=',
		isNeedFormat: true,
		isFormatNftIdAndDenomId: true,
	},
	{
		label: i18n.t('ExplorerLang.table.denomId'),
		displayValue: 'denomId',
		nativeValue: 'id',
		nftRouterParamsValue: 'denomId',
		isLink: true,
		isNft: true,
		linkRoute: '/nft/token?denom=',
		denomRouter: '&tokenId=',
		isNeedFormat: true,
		isFormatNftIdAndDenomId: true,
	},
	{
		label:i18n.t('ExplorerLang.table.data'),
		displayValue:'tokenData',
	},
	{
		label: i18n.t('ExplorerLang.table.uri'),
		displayValue: 'tokenUri',
		nativeValue: 'tokenUri',
		isNftHref: true,
		isNeedFormat: true
	},
]