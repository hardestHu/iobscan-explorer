<template>
  <div class="tx_content_container">
    <div class="tx_content_wrap">
      <div class="tx_content_header_title">
        <p class="tc_content_header">{{ $t('ExplorerLang.transactions.title') }}</p>
      </div>
      <list-component
        :is-show-token-type="true"
        :is-loading="isLoading"
        :token-symbol="mainTokenSymbol"
        :list-data="transactionArray"
        :column-list="txColumnList"
        :pagination="{ pageSize: Number(pageSize), dataCount: txCount, pageNum: Number(pageNum) }"
        @pageChange="pageChange"
        :empty-text="$t('ExplorerLang.table.emptyDescription')"
      >
        <template v-slot:msgType>
          <tabs-component :tab-list="txTypeOption" @onSelectMagType="getFilterTxs"></tabs-component>
        </template>
        <template v-slot:resetButton>
          <tx-reset-button-component
            @resetParams="resetFilterCondition"
          ></tx-reset-button-component>
        </template>

        <template v-slot:datePicket>
          <tx-status-tabs-components
            @onChangTxStatus="changeTxStatus"
            @onChangeDate="changeTime"
            ref="statusDatePicker"
          ></tx-status-tabs-components>
        </template>
        <template v-slot:txCount>
          <tx-count-component
            :title="$t('ExplorerLang.transactions.txs')"
            :icon="'iconTrainsaction'"
            :tx-count="txCount"
          ></tx-count-component>
        </template>
      </list-component>
    </div>
  </div>
</template>

<script>
import {
  addressRoute,
  formatMoniker,
  converCoin,
  getMainToken,
  getTxType,
  getConfig,
} from '@/helper/IritaHelper';
import TxTypes from '@/helper/TxTypes';
import Tools from '../util/Tools';
import MPagination from './common/MPagination';
import TxListComponent from './common/TxListComponent';
import { TxHelper } from '../helper/TxHelper';
import { getTxList, getAllTxTypes, getIbcTransferByHash } from '../service/api';
import {
  TX_TYPE,
  TX_STATUS,
  ColumnMinWidth,
  monikerNum,
  decimals,
  IRIS_ADDRESS_PREFIX,
  COSMOS_ADDRESS_PREFIX,
} from '../constant';
import ListComponent from './common/ListComponent';
import { getAmountByTx, getDenomMap, getDenomTheme } from '../helper/txListAmoutHelper';
import parseTimeMixin from '../mixins/parseTime';
import prodConfig from '../productionConfig';
import TabsComponent from './common/TabsComponent';
import TxStatusTabsComponents from './common/TxStatusTabsComponents';
import TxCountComponent from './TxCountComponent';
import TxResetButtonComponent from './common/TxResetButtonComponent';
import { getColumnByTxTyp } from './tableListColumnConfig/common';
import {
  isMultisend,
  isRespondService,
  isDenomAndId,
  isFeedNameAndCreator,
  isConsumer,
  isClientId,
  isConsumerReqIdServiceName,
  isIdSenderName,
  isChannelIdPortId,
  isClientIdConnectionId,
  isDigestDigestAlgo,
  isSymbolMinUnitOwner,
  isReceiver,
  isSymbolOwner,
  isSymbolDstOwnerSrcOwner,
  isSymbolOwner2,
  isSymbolSender,
  isProposalIdOptionVoter,
  isProposalIdDepositor,
  isTitle,
  isConsumerRequestContextId,
  isAuthorServiceName,
  isOwnerProviderServiceName,
  isServiceName,
  isNftIdSenderDestChain,
  isNftIdReceiverSourceChain,
  isNftIdSenderDestChain2,
  isSequenceSourceChainSigner,
  isSigner,
  isChainNameSigner,
  isSenderReceiverDenomId,
} from './txList/lib';
import { getValueFromArr, arrHandle } from './txList/common';

export default {
  name: 'TxList',
  components: {
    TxResetButtonComponent,
    TxCountComponent,
    TxStatusTabsComponents,
    TabsComponent,
    ListComponent,
    MPagination,
    TxListComponent,
  },
  mixins: [parseTimeMixin],
  data() {
    const { txType, status, beginTime, endTime, pageNum, pageSize } = Tools.urlParser();
    return {
      isLoading: false,
      // TX_TYPE_DISPLAY: {}, // 无用代码待删除
      IBC: 'IBC',
      HashLock: 'Hash Lock',
      PickerOptions: {
        disabledDate: (time) => {
          return (
            time.getTime() < new Date(this.pickerStartTime).getTime() || time.getTime() > Date.now()
          );
        },
      },
      TX_TYPE,
      TX_STATUS,
      transactionArray: [],
      txCount: 0,
      txTypeOption: [],
      statusOpt: [
        {
          value: 0,
          label: this.$t('ExplorerLang.common.allTxStatus'),
        },
        {
          value: 1,
          label: this.$t('ExplorerLang.common.success'),
        },
        {
          value: 2,
          label: this.$t('ExplorerLang.common.failed'),
        },
      ],
      statusValue: status || '',
      txType: txType || '',
      beginTime: beginTime || '',
      endTime: endTime || '',
      /* filterStartTime : '',
			filterEndTime : '',
			urlParamsShowStartTime : this.getParamsByUrlHash().urlParamShowStartTime ? this.getParamsByUrlHash().urlParamShowStartTime : '',
			urlParamsShowEndTime : this.getParamsByUrlHash().urlParamShowEndTime ? this.getParamsByUrlHash().urlParamShowEndTime : '', */
      txStatus: '',
      pageNum: pageNum || 1,
      pageSize: pageSize || 15,
      txTypeArray: [''],
      txColumnList: [],
      tyepWidth: ColumnMinWidth.txType,
      TxHelper,
      isShowFee: prodConfig.fee.isShowFee,
      isShowDenom: prodConfig.fee.isShowDenom,
      ColumnMinWidth,
      Tools,
      addressRoute,
      formatMoniker,
      monikerNum,
      feeDecimals: decimals.fee,
      txDataList: [],
      colWidthList: [],
      loading: false,
      mainTokenSymbol: '',
      IRIS_ADDRESS_PREFIX,
      COSMOS_ADDRESS_PREFIX,
      denomMap: {},
      isShowIbc: false,
      isShowHashLock: false,
    };
  },
  async created() {
    // 无用代码
    // await this.getTxTypeData();
    // 获取列表数据才会执行，所以这里可以删除
    // const { txType, status, beginTime, endTime } = Tools.urlParser();
    // this.formatTxData(txType);
    await this.getConfigTokenData();
  },
  mounted() {
    this.getFilterTxs('init');
    // 初始化了两次，没必要，待删除
    // const { txType } = Tools.urlParser();
    // this.txColumnList = txCommonTable.concat(SignerColunmn, txCommonLatestTable);
    // if (txType && needAddColumn[txType]) {
    //   this.txColumnList = txCommonTable.concat(needAddColumn[txType], txCommonLatestTable);
    // }
    // this.getTxListData(this.pageNum,this.pageSize,true)
    this.getAllTxType();
    this.setMainToken();
    /** 在listComponent.vue 内部判断了，没用了 start * */
    // this.setIsShowIbc();
    // this.setIsShowHashLock();
    /** 在listComponent.vue 内部判断了，没用了 end * */
  },
  methods: {
    /** 在listComponent.vue 内部判断了，没用了 start * */
    // async setIsShowIbc() {
    //   const msgTypeIbcList = await getTxType();
    //   const IbcList = [
    //     TX_TYPE.recv_packet,
    //     TX_TYPE.create_client,
    //     TX_TYPE.update_client,
    //     TX_TYPE.transfer,
    //     TX_TYPE.timeout_packet,
    //     TX_TYPE.upgrade_client,
    //     TX_TYPE.submit_misbehaviour,
    //     TX_TYPE.connection_open_init,
    //     TX_TYPE.connection_open_try,
    //     TX_TYPE.connection_open_ack,
    //     TX_TYPE.connection_open_confirm,
    //     TX_TYPE.channel_open_init,
    //     TX_TYPE.channel_open_try,
    //     TX_TYPE.channel_open_ack,
    //     TX_TYPE.channel_open_confirm,
    //     TX_TYPE.channel_close_init,
    //     TX_TYPE.channel_close_confirm,
    //     TX_TYPE.timeout_on_close_packet,
    //     TX_TYPE.acknowledge_packet,
    //   ];
    //
    //   if (msgTypeIbcList?.txTypeData?.length) {
    //     let ibcArr = [];
    //     ibcArr = msgTypeIbcList.txTypeData.filter((item) => {
    //       if (item?.typeName && IbcList.includes(item.typeName)) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     this.isShowIbc = !!ibcArr?.length;
    //   }
    // },
    // async setIsShowHashLock() {
    //   const msgTypeHashLockList = await getTxType();
    //   const HashLockList = [TX_TYPE.create_htlc, TX_TYPE.claim_htlc];
    //
    //   if (msgTypeHashLockList?.txTypeData?.length) {
    //     let HashLockArr = [];
    //     HashLockArr = msgTypeHashLockList.txTypeData.filter((item) => {
    //       if (item?.typeName && HashLockList.includes(item.typeName)) {
    //         return true;
    //       }
    //       return false;
    //     });
    //     this.isShowHashLock = !!HashLockArr?.length;
    //   }
    // },
    /** 在listComponent.vue 内部判断了，没用了 end * */

    changeTxStatus(txStatus) {
      this.statusValue = Number(txStatus);
      this.getFilterTxs();
    },
    changeTime(selectTime) {
      this.beginTime = '';
      this.endTime = '';
      if (selectTime?.length === 2) {
        this.beginTime = selectTime[0];
        this.endTime = selectTime[1];
        sessionStorage.setItem('txTimeRange', JSON.stringify(selectTime));
      }

      this.getFilterTxs();
    },
    getFilterTxs(param) {
      this.updateTxtype(param);
      this.txColumnList = getColumnByTxTyp(this.txType);

      this.statusValue = Number(this.statusValue || 0);
      this.pageNum = 1;

      const url = this.stringifyUrl(
        '/#/txs',
        {
          pageNum: this.pageNum,
          pageSize: this.pageSize,
          txType: this.txType,
          status: this.statusValue,
          beginTime: this.beginTime,
          endTime: this.endTime,
        },
        [undefined, null, 0, '']
      );

      param === 'init' ? history.replaceState(null, null, url) : history.pushState(null, null, url);
      this.getTxListData(null, null, true);
      this.getTxListData(this.pageNum, this.pageSize);
    },
    /* filterTxByTxType(e){
			if(e === 'allTxType' || e === undefined){
				this.TxType = ''
			} else {
				this.TxType = e
			}
		}, */
    resetUrl() {
      this.beginTime = '';
      this.endTime = '';
      this.txType = '';
      this.statusValue = 0;
      this.txStatus = '';
      this.beginTime = '';
      this.endTime = '';
      sessionStorage.setItem('currentChoiceMsgType', JSON.stringify(this.txType));
      history.pushState(
        null,
        null,
        `/#/txs?pageNum=${this.pageNum}&pageSize=${this.pageSize}&useCount=true`
      );
    },
    async getTxListData(pageNum, pageSize, useCount = false) {
      this.isLoading = true;
      const { txType, status, beginTime, endTime } = Tools.urlParser();
      let params = { txType, status, beginTime, endTime };
      if (pageNum && pageSize) {
        params = { ...params, pageNum, pageSize };
      }
      if (useCount) {
        params = { ...params, useCount };
      }
      try {
        const res = await getTxList(params);
        if (Number(this.pageNum) === Number(res.pageNum)) {
          this.txData = res.data;
          this.formatTxData(txType);
          this.isLoading = false;
        }
        if (useCount) {
          this.txCount = res.count;
        }
        if (pageNum) {
          this.pageNum = res.pageNum;
        }
        if (pageSize) {
          this.pageSize = res.pageSize;
        }
      } catch (e) {
        this.isLoading = false;
        console.error(e);
        // this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
      }
    },
    async getAllTxType() {
      try {
        const res = await TxTypes.getData();
        const typeList = TxHelper.formatTxType(res.data);
        typeList.unshift({
          value: '',
          label: this.$t('ExplorerLang.common.allTxType'),
          slot: 'allTxType',
        });
        this.txTypeOption = typeList;
        sessionStorage.setItem('typeList', JSON.stringify(typeList));
        this.txTypeArray = TxHelper.getTxTypeArray(this.txTypeOption, this.txType);
      } catch (e) {
        console.error(e);
        // this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
      }
    },
    /* filterTxByStatus(e){
			if(e === '' || e === undefined){
				this.txStatus = ''
			} else {
				this.txStatus = e
			}
		}, */
    getStartTime(time) {
      this.beginTime = time;
    },
    getEndTime(time) {
      this.endTime = time;
    },
    /* formatEndTime(time){

			// let utcTime = Tools.conversionTimeToUTCByValidatorsLine(new Date(time).toISOString());
			let oneDaySeconds = 24 * 60 * 60;
			return Number(new Date(time).getTime() / 1000) + Number(oneDaySeconds)
		},
		formatStartTime(time){
			// let utcTime = Tools.conversionTimeToUTCByValidatorsLine(new Date(time).toISOString());
			return Number(new Date(time).getTime() / 1000)
		}, */
    resetFilterCondition() {
      this.txType = '';
      this.statusValue = '';
      this.beginTime = '';
      this.endTime = '';
      this.pageNum = 1;
      this.pageSize = 15;
      this.$refs.statusDatePicker.resetParams();
      this.resetUrl();
      this.getTxListData(null, null, true);
      this.getTxListData(this.pageNum, this.pageSize);
      this.$store.commit('currentTxModelIndex', 0);
      sessionStorage.setItem('lastChoiceMsgModelIndex', 0);
      sessionStorage.setItem('txTimeRange', []);
      this.txTypeArray = [''];
      this.txColumnList = getColumnByTxTyp();
    },
    // 无用代码，待删除
    // async getTxTypeData() {
    //   try {
    //     const res = await getTxType();
    //     this.TX_TYPE_DISPLAY = res?.TX_TYPE_DISPLAY;
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    isValid(value) {
      return !(!value || !value.length || value == '--');
    },
    async setMainToken() {
      const mainToken = await getMainToken();
      if (mainToken && mainToken.symbol) {
        this.mainTokenSymbol = mainToken.symbol.toUpperCase();
      }
    },
    getAmount(amount) {
      if (!amount) {
        return '';
      }
      const denomRule = /[0-9.]+/;
      const amountRule = /^[0-9]+.?[0-9]*$/;
      if (amountRule.test(amount)) {
        return amount;
      }
      const result = amount.match(denomRule);
      return result ? amount.match(denomRule)[0] : ' ';
    },
    getAmountUnit(amount) {
      if (!amount) {
        return '';
      }
      const amountRule = /^[0-9]+.?[0-9]*$/;
      if (amountRule.test(amount)) {
        return ' ';
      }
      const denomRule = /[A-Za-z\/]+/;
      const result = amount.match(denomRule);
      return result ? result[0] : ' ';
    },
    /* getParamsByUrlHash(){
			let txType,
				txStatus,
				filterStartTime,
				urlParamShowStartTime,
				urlParamShowEndTime,
				filterEndTime;
			let path = window.location.hash;
			if(path.includes("?")){
				let urlHash = path.split('?')[1];
				let params = urlHash.split("&");
				params.forEach(item =>{
					if(item.includes('txType')){
						txType = item.split("=")[1]
					} else if(item.includes('status')){
						txStatus = item.split("=")[1]
					} else if(item.includes('beginTime')){
						urlParamShowStartTime = item.split("=")[1]
						filterStartTime = this.formatStartTime(item.split("=")[1])
					} else if(item.includes('endTime')){
						urlParamShowEndTime = item.split("=")[1]
						filterEndTime = this.formatEndTime(item.split("=")[1])
					}
				})
			}
			return {txType, txStatus, filterStartTime, filterEndTime, urlParamShowStartTime, urlParamShowEndTime}
		}, */
    pageChange(pageNum) {
      if (this.pageNum === pageNum) return;
      this.pageNum = pageNum;
      /* let urlParams = this.getParamsByUrlHash();
			this.statusValue = urlParams.txStatus ? urlParams.txStatus : '';
			this.txType = urlParams.txType ? urlParams.txType : 'allTxType';
			this.beginTime = urlParams.urlParamShowStartTime ? urlParams.urlParamShowStartTime : '';
			this.endTime = urlParams.urlParamShowEndTime ? urlParams.urlParamShowEndTime : ''; */

      const { txType, status, beginTime, endTime, pageSize } = Tools.urlParser();
      let url = `/#/txs?pageNum=${pageNum}&pageSize=${pageSize}&useCount=false`;
      if (txType) {
        url += `&txType=${txType}`;
        this.txTypeArray = TxHelper.getTxTypeArray(this.txTypeOption, txType);
        this.txType = txType;
      } else {
        this.txTypeArray = [''];
        this.txType = '';
      }
      if (status) {
        url += `&status=${status}`;
        this.statusValue = Number(status);
      } else {
        this.statusValue = 0;
      }
      if (beginTime) {
        url += `&beginTime=${beginTime}`;
        this.beginTime = beginTime;
      } else {
        this.beginTime = '';
      }
      if (endTime) {
        url += `&endTime=${endTime}`;
        this.endTime = endTime;
      } else {
        this.endTime = '';
      }
      history.pushState(null, null, url);
      this.getTxListData(this.pageNum, this.pageSize);
    },
    formatTxHash(TxHash) {
      if (TxHash) {
        return Tools.formatTxHash(TxHash);
      }
    },
    formatAddress(address) {
      return Tools.formatValidatorAddress(address);
    },
    handleChange(value) {
      this.txType = value[1] ? value[1] : '';
    },
    async formatTxData(msgType) {
      this.transactionArray = [];
      try {
        // 这里处理方式需要优化
        if (this.txData && this.txData.length) {
          const fees = [];
          const amounts = [];
          for (const tx of this.txData) {
            let numberOfToArr = [];
            let requestIdArr = [];
            let denomIdArr = [];
            let denomNameArr = [];
            let nftIdArr = [];
            let feedNameArr = [];
            let oracleCreatorArr = [];
            let consumerArr = [];
            let digestArr = [];
            let digest_algoArr = [];
            let symbolArr = [];
            let minUnitArr = [];
            let ownerArr = [];
            let dstOwnerArr = [];
            let srcOwnerArr = [];
            let sender = '--';
            let senderArr = [];
            let proposalIdArr = [];
            let optionArr = [];
            let voterArr = [];
            let depositorArr = [];
            let title = '--';
            let authorArr = [];
            let providerArr = [];
            let requestContextIdArr = [];
            let serviceNameArr = [];
            let clientIdArr = [];
            let portIdArr = [];
            let channelIdArr = [];
            let connectionIdArr = [];
            let receiverArr = [];
            const sameMsg = [];
            let sameMsgFromAddrArr = [];
            let sameMsgToAddrArr = [];
            let dest_chainArr = [];
            let source_chainArr = [];
            let sequenceArr = [];
            let chain_nameArr = [];
            const signers = [];
            let msg;
            // farm => stake unstake
            let poolId = '--';
            const poolIdArr = [];
            let farmAmount = '--';
            let farmAmountDenom = '';
            let farmAmountNativeDenom = '';
            const farmAmountArr = [];
            // farm => create pool
            let totalReward1 = '--';
            let totalReward1Denom = '';
            let totalReward1NativeDenom = '';
            let totalReward2 = '--';
            let totalReward2Denom = '';
            let totalReward2NativeDenom = '';
            let poolCreator = '--';
            // farm => Create Pool With Community Pool
            let proposer = '--';
            let initialDeposit = '--';
            // farm => destory pool/ adjust pool : poolId poolCreator

            if (tx.msgs.length > 0) {
              tx.msgs.forEach((item) => {
                if (item.type === msgType) {
                  sameMsg.push(item);
                  msg = item;
                }
              });
            }

            /*
             * 处理msg获取相关值
             * */
            if (sameMsg?.length > 0) {
              // 处理from 跟 to 的情况
              sameMsg.forEach((item) => {
                const addrObj = TxHelper.getFromAndToAddressFromMsg(item);
                if (addrObj?.from) {
                  sameMsgFromAddrArr.push(addrObj.from);
                }
                if (addrObj?.to) {
                  sameMsgToAddrArr.push(addrObj.to);
                }

                if (isMultisend(item)) {
                  numberOfToArr.push(item?.msg?.outputs?.length);
                }
                if (isRespondService(item)) {
                  requestIdArr.push(item?.msg?.request_id);
                }
                if (isDenomAndId(item)) {
                  denomIdArr.push(item?.msg?.denom);
                  nftIdArr.push(item?.msg?.id);
                }

                if (isFeedNameAndCreator(item)) {
                  feedNameArr.push(item?.msg?.feed_name);
                  oracleCreatorArr.push(item?.msg?.creator);
                }

                if (isConsumer(item)) {
                  consumerArr.push(item?.msg?.consumer);
                }
                if (isClientId(item)) {
                  clientIdArr.push(item?.msg?.client_id);
                }
                if (isConsumerReqIdServiceName(item)) {
                  consumerArr.push(item?.msg?.consumer);
                  requestContextIdArr.push(item?.msg?.request_context_id);
                  serviceNameArr.push(item?.msg?.service_name);
                }
                if (isIdSenderName(item)) {
                  senderArr.push(item?.msg?.sender);
                  denomIdArr.push(item?.msg?.id);
                  denomNameArr.push(item?.msg?.name);
                }
                if (isChannelIdPortId(item)) {
                  portIdArr.push(item?.msg?.port_id);
                  channelIdArr.push(item?.msg?.channel_id);
                }
                if (isClientIdConnectionId(item)) {
                  clientIdArr.push(item?.msg?.client_id);
                  connectionIdArr.push(item?.msg?.connection_id);
                }

                if (isDigestDigestAlgo(item)) {
                  digestArr.push(item?.msg?.contents[0]?.digest);
                  digest_algoArr.push(item?.msg?.contents[0]?.digest_algo);
                }
                if (isSymbolMinUnitOwner(item)) {
                  symbolArr.push(item?.msg?.symbol);
                  minUnitArr.push(item?.msg?.min_unit);
                  ownerArr.push(item?.msg?.owner);
                }
                if (isReceiver(item)) {
                  receiverArr.push(item?.msg?.packet?.data?.receiver);
                }
                if (isSymbolOwner(item)) {
                  symbolArr.push(item?.msg?.symbol);
                  ownerArr.push(item?.msg?.owner);
                }
                if (isSymbolDstOwnerSrcOwner(item)) {
                  symbolArr.push(item?.msg?.symbol);
                  dstOwnerArr.push(item?.msg?.dst_owner);
                  srcOwnerArr.push(item?.msg?.src_owner);
                }
                if (isSymbolOwner2(item)) {
                  symbolArr.push(item?.msg?.symbol);
                  ownerArr.push(item?.msg?.owner);
                }
                if (isSymbolSender(item)) {
                  symbolArr.push(item?.msg?.symbol);
                  senderArr.push(item?.msg?.sender);
                }
                if (isProposalIdOptionVoter(item)) {
                  proposalIdArr.push(item?.msg?.proposal_id);
                  optionArr.push(item?.msg?.option);
                  voterArr.push(item?.msg?.voter);
                }
                if (isProposalIdDepositor(item)) {
                  proposalIdArr.push(item?.msg?.proposal_id);
                  depositorArr.push(item?.msg?.depositor);
                }
                if (isTitle(item)) {
                  title = item?.msg?.content?.title;
                }
                if (isConsumerRequestContextId(item)) {
                  consumerArr.push(item?.msg?.consumer);
                  requestContextIdArr.push(item?.msg?.request_context_id);
                }
                if (isAuthorServiceName(item)) {
                  authorArr.push(item?.msg?.author);
                  serviceNameArr.push(item?.msg?.service_name);
                }
                if (isOwnerProviderServiceName(item)) {
                  ownerArr.push(item?.msg?.owner);
                  providerArr.push(item?.msg?.provider);
                  serviceNameArr.push(item?.msg?.service_name);
                }
                if (isServiceName(item)) {
                  serviceNameArr.push(item?.msg?.service_name);
                }
                // 新增
                if (isNftIdSenderDestChain(item)) {
                  nftIdArr.push(item?.msg?.id);
                  senderArr.push(item?.msg?.sender);
                  dest_chainArr.push(item?.msg?.dest_chain);
                }
                if (isNftIdReceiverSourceChain(item)) {
                  nftIdArr.push(item?.msg?.packet?.data?.id);
                  receiverArr.push(item?.msg?.packet?.data?.receiver);
                  source_chainArr.push(item?.msg?.packet?.source_chain);
                }
                if (isNftIdSenderDestChain2(item)) {
                  nftIdArr.push(item?.msg?.packet?.id);
                  senderArr.push(item?.msg?.packet?.data?.sender);
                  dest_chainArr.push(item?.msg?.packet?.destination_chain);
                }
                if (isSequenceSourceChainSigner(item)) {
                  sequenceArr.push(item?.msg?.clean_packet?.sequence);
                  source_chainArr.push(item?.msg?.clean_packet?.source_chain);
                  signers.push(item?.msg?.signer);
                }
                if (isSigner(item)) {
                  signers.push(item?.msg?.signer);
                }
                if (isChainNameSigner(item)) {
                  chain_nameArr.push(item?.msg?.chain_name);
                  signers.push(item?.msg?.signer);
                }
                if (isSenderReceiverDenomId(item)) {
                  denomIdArr.push(item?.msg?.id);
                  senderArr.push(item?.msg?.sender);
                  receiverArr.push(item?.msg?.recipient);
                }
              });
              /*
               * 同一类型多msg 去重
               * */
              sameMsgFromAddrArr = arrHandle(sameMsgFromAddrArr);
              sameMsgToAddrArr = arrHandle(sameMsgToAddrArr);
              portIdArr = arrHandle(portIdArr);
              channelIdArr = arrHandle(channelIdArr);
              connectionIdArr = arrHandle(connectionIdArr);
              receiverArr = arrHandle(receiverArr);
              numberOfToArr = arrHandle(numberOfToArr);
              requestIdArr = arrHandle(requestIdArr);
              denomIdArr = arrHandle(denomIdArr);
              nftIdArr = arrHandle(nftIdArr);
              feedNameArr = arrHandle(feedNameArr);
              clientIdArr = arrHandle(clientIdArr);
              denomNameArr = arrHandle(denomNameArr);
              oracleCreatorArr = arrHandle(oracleCreatorArr);
              consumerArr = arrHandle(consumerArr);
              digestArr = arrHandle(digestArr);
              digest_algoArr = arrHandle(digest_algoArr);
              symbolArr = arrHandle(symbolArr);
              minUnitArr = arrHandle(minUnitArr);
              ownerArr = arrHandle(ownerArr);
              dstOwnerArr = arrHandle(dstOwnerArr);
              srcOwnerArr = arrHandle(srcOwnerArr);
              senderArr = arrHandle(senderArr);
              proposalIdArr = arrHandle(proposalIdArr);
              optionArr = arrHandle(optionArr);
              voterArr = arrHandle(voterArr);
              depositorArr = arrHandle(depositorArr);
              authorArr = arrHandle(authorArr);
              providerArr = arrHandle(providerArr);
              requestContextIdArr = arrHandle(requestContextIdArr);
              serviceNameArr = arrHandle(serviceNameArr);
              dest_chainArr = arrHandle(dest_chainArr);
              source_chainArr = arrHandle(source_chainArr);
              sequenceArr = arrHandle(sequenceArr);
              chain_nameArr = arrHandle(chain_nameArr);
            }

            // farm -> stake unstake
            if (msg?.type === TX_TYPE.stake || msg?.type === TX_TYPE.unstake) {
              poolId = Tools.formatPoolId(msg?.msg?.pool_id);
              if (sameMsg?.length > 1) {
                // 判断是多msg, amount显示为空
                farmAmount = ' ';
              } else {
                const res = await converCoin(msg?.msg?.amount);
                farmAmount = res?.amount;
                farmAmountDenom = res?.denom.startsWith('lpt')
                  ? res?.denom.toLocaleUpperCase()
                  : this.getAmountUnit(res?.denom.toLocaleUpperCase());
                farmAmountNativeDenom = msg?.msg?.amount.denom.toLocaleUpperCase();
              }
              sender = msg?.msg?.sender;
            }
            // farm -> harvest
            if (msg?.type === TX_TYPE.harvest) {
              poolId = Tools.formatPoolId(msg?.msg?.pool_id);
              sender = msg.msg?.sender;
            }
            // farm -> create pool
            if (msg?.type === TX_TYPE.create_pool) {
              const len =
                msg?.msg?.total_reward && Array.isArray(msg?.msg?.total_reward)
                  ? msg?.msg?.total_reward.length
                  : 0;
              if (len > 0) {
                const res = await converCoin(msg?.msg?.total_reward?.[0]);
                totalReward1 = Tools.toDecimal(res.amount, 2);
                totalReward1Denom = res?.denom.startsWith('lpt')
                  ? res?.denom.toLocaleUpperCase()
                  : this.getAmountUnit(res?.denom.toLocaleUpperCase());
                totalReward1NativeDenom = msg?.msg?.total_reward?.[0].denom.toLocaleUpperCase();
              }
              if (len === 2) {
                const res = await converCoin(msg?.msg?.total_reward?.[1]);
                totalReward2 = Tools.toDecimal(res.amount, 2);
                totalReward2Denom = res?.denom.startsWith('lpt')
                  ? res?.denom.toLocaleUpperCase()
                  : this.getAmountUnit(res?.denom.toLocaleUpperCase());
                totalReward2NativeDenom = msg?.msg?.total_reward?.[1].denom.toLocaleUpperCase();
              }
              poolCreator = msg.msg.creator;
            }
            // farm -> create_pool_with_community_pool
            if (msg?.type === TX_TYPE.create_pool_with_community_pool) {
              proposer = msg.msg.proposer;
              title = msg.msg.content.title;
              if (msg?.msg?.initial_deposit && msg?.msg?.initial_deposit.length > 0) {
                const res = await converCoin(msg?.msg?.initial_deposit?.[0]);
                initialDeposit = Tools.toDecimal(res?.amount, 2);
                farmAmountDenom = res?.denom.startsWith('lpt')
                  ? res?.denom.toLocaleUpperCase()
                  : this.getAmountUnit(res?.denom.toLocaleUpperCase());
                farmAmountNativeDenom = msg?.msg?.initial_deposit?.[0].denom.toLocaleUpperCase();
              }
            }
            // farm => destroy_pool
            if (msg?.type === TX_TYPE.destroy_pool || msg?.type === TX_TYPE.adjust_pool) {
              poolId = Tools.formatPoolId(msg?.msg?.pool_id);
              poolCreator = msg.msg.creator;
            }

            amounts.push(msg ? (sameMsg?.length > 1 ? ' ' : await getAmountByTx(msg, true)) : '--');
            const from = getValueFromArr(sameMsgFromAddrArr);
            const to = getValueFromArr(sameMsgToAddrArr);
            let fromMonikers = ' ';
            let toMonikers = ' ';
            let validatorMoniker;
            let validatorAddress;
            if ((tx.monikers || {}).length) {
              const monikersMap = new Map();
              tx.monikers.forEach((item) => {
                validatorMoniker = Object.values(item)[0] || ' ';
                validatorAddress = Object.keys(item)[0] || ' ';
                monikersMap.set(Object.keys(item)[0], Object.values(item)[0]);
              });
              if (monikersMap.has(from)) {
                fromMonikers = monikersMap.get(from);
              }
              if (monikersMap.has(to)) {
                toMonikers = monikersMap.get(to);
              }
            }
            if (this.isShowFee) {
              fees.push(
                tx.fee && tx.fee.amount && tx.fee.amount.length > 0
                  ? await converCoin(tx.fee.amount[0])
                  : '--'
              );
            }
            let isShowMore = false;
            const type = tx.msgs && tx.msgs[0] && tx.msgs[0].type;
            if (type && (type === TX_TYPE.add_liquidity || type === TX_TYPE.remove_liquidity)) {
              isShowMore = true;
            }
            if (tx.type === TX_TYPE.send) {
              tx &&
              tx.msgs &&
              tx.msgs[0] &&
              tx.msgs[0].msg &&
              tx.msgs[0].msg.amount &&
              tx.msgs[0].msg.amount.length > 1
                ? (isShowMore = true)
                : '';
              const denom = tx?.msgs?.[0]?.msg?.amount?.[0]?.denom;
              if (denom !== undefined && /(ltp|LPT|lpt-|LPT-)/g.test(denom)) {
                isShowMore = true;
              }
            }
            const _contractMethod =
              (this?.$i18n?.messages &&
                this?.$i18n?.messages[prodConfig.lang]?.ExplorerLang?.smartContract &&
                this?.$i18n?.messages &&
                this?.$i18n?.messages[prodConfig.lang]?.ExplorerLang?.smartContract[
                  tx?.msgs[0]?.msg?.ex?.ddc_method
                ]) ||
              tx?.msgs[0]?.msg?.ex?.ddc_method;
            this.transactionArray.push({
              txHash: tx.tx_hash,
              blockHeight: tx.height,
              txType: (tx.msgs || []).map((item) => item.type),
              from,
              author: getValueFromArr(authorArr),
              provider: getValueFromArr(providerArr),
              requestContextId: getValueFromArr(requestContextIdArr),
              fromMonikers,
              toMonikers,
              receiver: getValueFromArr(receiverArr),
              to,
              portId: getValueFromArr(portIdArr),
              channelId: getValueFromArr(channelIdArr),
              connectionId: getValueFromArr(connectionIdArr),
              validatorMoniker,
              validatorAddress,
              numberOfTo: getValueFromArr(numberOfToArr),
              requestId: getValueFromArr(requestIdArr),
              denomId: getValueFromArr(denomIdArr),
              denomName: getValueFromArr(denomNameArr),
              nftId: getValueFromArr(nftIdArr),
              clientId: getValueFromArr(clientIdArr),
              feedName: getValueFromArr(feedNameArr),
              oracleCreator: getValueFromArr(oracleCreatorArr),
              consumer: getValueFromArr(consumerArr),
              serviceName: getValueFromArr(serviceNameArr),
              digest: getValueFromArr(digestArr),
              digest_algo: getValueFromArr(digest_algoArr),
              symbol: getValueFromArr(symbolArr),
              minUnit: getValueFromArr(minUnitArr),
              owner: getValueFromArr(ownerArr),
              dstOwner: getValueFromArr(dstOwnerArr),
              srcOwner: getValueFromArr(srcOwnerArr),
              sender: senderArr?.length > 1 ? ' ' : senderArr?.length === 1 ? senderArr[0] : sender,
              proposalId: getValueFromArr(proposalIdArr),
              option: getValueFromArr(optionArr),
              voter: getValueFromArr(voterArr),
              depositor: getValueFromArr(depositorArr),
              title,
              signer: getValueFromArr(tx.signers),
              status: tx.status,
              msgCount: tx.msgs.length,
              // time :Tools.getDisplayDate(tx.time),
              Tx_Fee: '',
              Time: Tools.formatLocalTime(tx.time),
              amount: '',
              swapAmount1: '',
              swapDenomTheme1: '',
              swapAmount2: '',
              swapDenomTheme2: '',
              ageTime: Tools.formatAge(
                Tools.getTimestamp(),
                tx.time * 1000,
                this.$t('ExplorerLang.table.suffix')
              ),
              isShowMore,
              denomTheme: {
                denomColor: '',
                tooltipContent: '',
              },
              dest_chain: getValueFromArr(dest_chainArr),
              source_chain: getValueFromArr(source_chainArr),
              sequence: getValueFromArr(sequenceArr),
              chain_name: getValueFromArr(chain_nameArr),
              // farm stake/unstake/harvest
              poolId,
              farmAmount,
              farmAmountDenom,
              farmAmountNativeDenom,
              // farm create_pool
              totalReward1,
              totalReward1Denom,
              totalReward1NativeDenom,
              totalReward2,
              totalReward2Denom,
              totalReward2NativeDenom,
              poolCreator,
              // farm create_pool_with_community_pool
              proposer,
              initialDeposit,
              // EVM智能合约
              contractAddr:
                tx?.contract_addrs && tx?.contract_addrs.length > 0 ? tx?.contract_addrs[0] : '--',
              contractMethod: _contractMethod || '--',
            });
            /**
             * @description: from parseTimeMixin
             */
            this.parseTime('transactionArray', 'Time', 'ageTime');
          }
          if (fees && fees.length > 0 && this.isShowFee) {
            const fee = await Promise.all(fees);
            this.transactionArray.forEach((item, index) => {
              // this.transactionArray[index].Tx_Fee = fee[index] && fee[index].amount ?  this.isShowDenom ? `${Tools.toDecimal(fee[index].amount,this.feeDecimals)} ${fee[index].denom.toLocaleUpperCase()}` : `${Tools.toDecimal(fee[index].amount,this.feeDecimals)}` : '--';
              // remove denom
              this.transactionArray[index].Tx_Fee =
                fee[index] && fee[index].amount
                  ? this.isShowDenom
                    ? `${Tools.toDecimal(fee[index].amount, this.feeDecimals)}`
                    : `${Tools.toDecimal(fee[index].amount, this.feeDecimals)}`
                  : '--';
            });
          }
          if (amounts && amounts.length > 0) {
            const amount = await Promise.all(amounts);
            this.denomMap = await getDenomMap();
            this.transactionArray.forEach((item, index) => {
              if (amount[index]?.length === 2) {
                /**
                 * 取 % 后面拼接的原始denom, 用来匹配theme
                 */
                const result1 = amount[index][0].split('%');
                const result2 = amount[index][1].split('%');
                this.transactionArray[index].swapDenomTheme1 = getDenomTheme(
                  result1[1],
                  this.denomMap
                );
                this.transactionArray[index].swapDenomTheme2 = getDenomTheme(
                  result2[1],
                  this.denomMap
                );
                this.transactionArray[index].swapAmount1 = this.getAmount(result1[0]);
                this.transactionArray[index].swapAmount1Denom = this.getAmountUnit(result1[0]);
                this.transactionArray[index].swapAmount2 = this.getAmount(result2[0]);
                this.transactionArray[index].swapAmount2Denom = this.getAmountUnit(result2[0]);
              } else {
                const result = amount[index].split('%');
                this.transactionArray[index].denomTheme = getDenomTheme(result[1], this.denomMap);
                this.transactionArray[index].amount = this.getAmount(result[0]);
                this.transactionArray[index].denom = this.getAmountUnit(result[0]);
                const denom = /[A-Za-z\-]{2,15}/.exec(amount[index])?.length
                  ? /[A-Za-z\-]{2,15}/.exec(amount[index])[0]
                  : ' ';
                if (denom !== undefined && /(lpt|LPT|lpt-|LPT-)/g.test(denom)) {
                  this.transactionArray[index].amount = '';
                } else if (/(IBC | ibc)/g.test(denom)) {
                  this.transactionArray[index].amount = ' ';
                  this.transactionArray[index].denom = ' ';
                }
              }
              /**
               * 目标：给farm下的farmAmount totalReward1 totalReward2 initialDeposit上色
               * 方法：借助了farmAmountNativeDenom 用于保存原始denom,不使用转换后的symbol, totalReward同理
               * farmAmount initalDeposit 都是用dnomeTheme
               */
              if (this.transactionArray[index].farmAmountDenom) {
                this.transactionArray[index].denomTheme = getDenomTheme(
                  this.transactionArray[index].farmAmountNativeDenom,
                  this.denomMap
                );
              } else if (this.transactionArray[index].totalReward1Denom) {
                this.transactionArray[index].swapDenomTheme1 = getDenomTheme(
                  this.transactionArray[index].totalReward1NativeDenom,
                  this.denomMap
                );
                this.transactionArray[index].swapDenomTheme2 = getDenomTheme(
                  this.transactionArray[index].totalReward2NativeDenom,
                  this.denomMap
                );
              }
            });
          }
        }
      } catch (error) {
        console.log(error);
      }
    },
    async getConfigTokenData() {
      const res = await getConfig();
      this.tokenData = res.tokenData;
    },
    beforeDestroy() {
      this.$store.commit('currentTxModelIndex', 0);
    },

    updateTxtype(param) {
      if (param?.value) {
        this.txType = param.value;
      } else if (param?.value === '') {
        // 处理点击all的情况
        this.txType = '';
      } else if (Array.isArray(param)) {
        const notAllMsgType = param.filter((item) => {
          return item.label !== 'secondaryAll';
        });
        const currentSelectSecondMsgTypes = notAllMsgType.map((item) => {
          return item.value;
        });

        if (currentSelectSecondMsgTypes?.length) {
          this.txType = currentSelectSecondMsgTypes.join(',');
        }
      }
    },

    stringifyUrl(url, param, filters) {
      return `${url}${Tools.formatParams(param, filters)}`;
    },
  },
  beforeDestroy() {
    this.$store.commit('currentTxModelIndex', 0);
  },
};
</script>

<style scoped lang="scss">
a {
  color: $t_link_c !important;
}

.tx_content_container {
  width: 100%;

  .tx_content_wrap {
    max-width: 12.3rem;

    .tx_content_header_title {
      text-align: left;
      margin-top: 0.4rem;
      padding-bottom: 0.1rem;

      .tc_content_header {
        font-size: 0.22rem;
        font-weight: 600;
        color: #171d44;
        line-height: 0.26rem;
      }
    }

    .tx_content_header_wrap {
      display: flex;
      justify-content: flex-start;
    }
  }

  @media screen and (max-width: 910px) {
    .tx_content_wrap {
      width: 100%;

      .tx_content_header_wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .tx_type_mobile_content {
          margin-bottom: 0.1rem;

          &:last-child {
            width: 100%;
            justify-content: flex-end;

            .search_btn {
              margin-left: 0;
            }
          }

          .tx_type_transactions {
            margin-right: 0.26rem !important;
          }
        }
      }
    }
  }
  @media screen and (max-width: 768px) {
    .tx_content_wrap {
      .pagination_content {
        .tooltip_box {
          text-align: end;
        }

        .common_pagination_content {
          border: 0;
          text-align: end;
        }
      }
    }
  }
  @media screen and (min-width: 768px) {
    .tx_content_wrap {
      .pagination_content {
        display: flex;
        justify-content: space-between;
      }
    }
  }

  .tx_content_wrap {
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 0.15rem;

    .service_tx_to_container {
      .service_tx_muti_to_container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;

        .service_tx_muti_to_ellipsis {
          color: $t_link_c;
        }
      }
    }

    .service_tx_status {
      position: relative;
      top: 0.02rem;
      left: -0.04rem;
      width: 0.13rem;
      height: 0.13rem;
    }

    .tx_content_header_wrap {
      padding: 0.3rem 0 0.13rem 0;

      .tx_transaction_content_hash {
        display: flex;
        align-items: center;
      }

      .total_tx_content {
        // height: 0.64rem;
        line-height: 0.4rem;
        color: $t_first_c;
        font-size: $s18;
        font-weight: bold;
        margin: 0rem 0.2rem 0rem 0rem;
        //text-indent: 0.2rem;
      }

      /*.filer_content {
					display: flex;
					align-items: center;*/
      .tx_type_mobile_content {
        display: flex;
        align-items: center;

        .tooltip_content {
          padding: 0 0 0 0.1rem;
        }

        ::v-deep.el-cascader {
          width: 1.3rem;
          margin-right: 0.1rem;

          .el-input {
            input::-webkit-input-placeholder {
              /* 使用webkit内核的浏览器 */
              color: $t_first_c;
            }

            input:-moz-placeholder {
              /* Firefox版本4-18 */
              color: $t_first_c;
            }

            input::-moz-placeholder {
              /* Firefox版本19+ */
              color: $t_first_c;
            }

            input:-ms-input-placeholder {
              /* IE浏览器 */
              color: $t_first_c;
            }

            .el-input__inner {
              padding-left: 0.07rem;
              height: 0.32rem;
              font-size: $s14 !important;
              line-height: 0.32rem;

              &::-webkit-input-placeholder {
                font-size: $s14 !important;
              }
            }

            .el-input__inner:focus {
              border-color: $theme_c !important;
            }

            .el-input__suffix {
              .el-input__suffix-inner {
                .el-input__icon {
                  line-height: 0.32rem;
                }
              }
            }
          }

          .is-focus {
            .el-input__inner {
              border-color: $theme_c !important;
            }
          }
        }

        ::v-deep .el-select {
          width: 1.3rem;
          margin-right: 0.1rem;

          .el-input {
            .el-input__inner {
              padding-left: 0.07rem;
              height: 0.32rem;
              font-size: $s14 !important;
              line-height: 0.32rem;

              &::-webkit-input-placeholder {
                font-size: $s14 !important;
              }
            }

            .el-input__inner:focus {
              border-color: $theme_c !important;
            }

            .el-input__suffix {
              .el-input__suffix-inner {
                .el-input__icon {
                  line-height: 0.32rem;
                }
              }
            }
          }

          .is-focus {
            .el-input__inner {
              border-color: $theme_c !important;
            }
          }
        }

        ::v-deep .el-date-editor {
          width: 1.3rem;

          .el-icon-circle-close {
            display: none !important;
          }

          .el-input__inner {
            height: 0.32rem;
            padding-left: 0.07rem;
            padding-right: 0;
            line-height: 0.32rem;

            &::-webkit-input-placeholder {
              font-size: $s14 !important;
            }

            &:focus {
              border-color: $theme_c;
            }
          }

          .el-input__prefix {
            right: 5px;
            left: 1rem;

            .el-input__icon {
              line-height: 0.32rem;
            }
          }
        }

        .joint_mark {
          margin: 0 0.08rem;
        }

        .reset_btn {
          background: $bg_button_c;
          color: $t_button_c;
          border-radius: 0.04rem;
          margin-left: 0.1rem;
          cursor: pointer;

          i {
            padding: 0.08rem;
            font-size: $s14;
            line-height: 1;
            display: inline-block;
          }
        }

        .search_btn {
          cursor: pointer;
          background: $bg_button_c;
          margin-left: 0.1rem;
          color: $t_button_c;
          border-radius: 0.04rem;
          padding: 0.05rem 0.18rem;
          font-size: $s14;
          line-height: 0.2rem;
          white-space: nowrap;
        }
      }

      //}
    }

    .status_icon {
      width: 0.13rem;
      height: 0.13rem;
      margin-right: 0.05rem;
    }

    .pagination_content {
      margin: 0.1rem 0 0.2rem 0;

      .tooltip_box {
        display: flex;
        align-items: center;
        background-color: white;
        padding: 0.05rem 0.2rem;
        font-size: $s12;
        color: #8d8b8b;

        .tooltip_title {
          margin-right: 0.24rem;
        }

        .tooltip_title_box {
          display: flex;
        }

        .tooltip_title_IBC {
          margin-right: 0.24rem;
          display: flex;
          align-items: center;
          position: relative;

          &::before {
            left: -0.12rem;
            content: ' ';
            position: absolute;
            height: 0.08rem;
            width: 0.08rem;
            border-radius: 0.04rem;
            background-color: #d47d78;
          }
        }

        .tooltip_title_HTLT {
          display: flex;
          align-items: center;
          position: relative;

          &::before {
            left: -0.12rem;
            content: ' ';
            position: absolute;
            height: 0.08rem;
            width: 0.08rem;
            border-radius: 0.04rem;
            background-color: #51a3a3;
          }
        }
      }
    }
  }
}
</style>
