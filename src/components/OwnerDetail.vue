<template>
  <div class="address_container_content">
    <div class="address_content_wrap">
      <div class="address_content_title">
        <div class="address_content_title_first">
          {{ `${$t('ExplorerLang.addressDetail.addressDetail')} |` }}
        </div>
        <div class="address_content_title_address">
          {{ address }}
          <m-clip v-if="address" :text="address" style="margin-left: 0.09rem"></m-clip>
        </div>
      </div>
      <div class="address_tab_container">
        <vue-scroll :ops="opsConfig">
          <div class="address_tab_content">
            <div
              class="address_tab_item"
              :key="index"
              v-for="(item, index) in tabList"
              :class="item.isActive ? 'active_content' : ''"
              @click="selectOptions(index)"
            >
              <span>{{ item.label }}</span>
            </div>
          </div>
        </vue-scroll>
      </div>
	    
      <div v-if="moduleSupport('107', prodConfig.navFuncList)" v-show="isAsset">
	      <!-- 地址详情 -->
	      <assets-tab-options></assets-tab-options>
      </div>
	    
	    
      <div
        class="address_nft_content"
        v-if="moduleSupport('103', prodConfig.navFuncList) && isNftInfo"
      >
	      <nft-tab-options></nft-tab-options>
      </div>

      <div
        class="consumer_transaction_content"
        v-if="moduleSupport('105', prodConfig.navFuncList)"
        v-show="isIservice"
      >
	      <i-service-consumer-options></i-service-consumer-options>
      </div>
	    
      <div
        class="provider_transaction_content"
        v-if="moduleSupport('105', prodConfig.navFuncList)"
        v-show="isIservice"
      >
	      <i-service-provider-options></i-service-provider-options>
      </div>

      <div
        class="address_content"
        v-if="moduleSupport('106', prodConfig.navFuncList)"
        v-show="isIdentity"
      >
	      <identity-options></identity-options>
<!--        <div class="content_title">-->
<!--          {{ $t('ExplorerLang.addressDetail.identities') }}-->
<!--        </div>-->
<!--        <el-table-->
<!--          class="table"-->
<!--          :data="identityList"-->
<!--          :empty-text="$t('ExplorerLang.table.emptyDescription')"-->
<!--        >-->
<!--          <el-table-column-->
<!--            :min-width="ColumnMinWidth.identity"-->
<!--            :label="$t('ExplorerLang.table.identity')"-->
<!--          >-->
<!--            <template slot-scope="scope">-->
<!--              <router-link :to="`/identity/${scope.row.id}`">{{ scope.row.id }}</router-link>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            :min-width="ColumnMinWidth.txHash"-->
<!--            :label="$t('ExplorerLang.table.txHash')"-->
<!--          >-->
<!--            <template slot-scope="scope">-->
<!--              <el-tooltip-->
<!--                :content="scope.row.txHash"-->
<!--                placement="top"-->
<!--                :disabled="!Tools.isValid(scope.row.txHash)"-->
<!--              >-->
<!--                <router-link :to="`/tx?txHash=${scope.row.txHash}`"-->
<!--                  >{{ formatTxHash(scope.row.txHash) }}-->
<!--                </router-link>-->
<!--              </el-tooltip>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--          <el-table-column-->
<!--            :min-width="ColumnMinWidth.time"-->
<!--            :label="$t('ExplorerLang.table.timestamp')"-->
<!--            prop="time"-->
<!--          >-->
<!--            <template slot-scope="scope">-->
<!--              <span>{{ scope.row.time }}</span>-->
<!--            </template>-->
<!--          </el-table-column>-->
<!--        </el-table>-->
<!--        <div class="pagination_content" v-show="identityCount > identityPageSize">-->
<!--          <m-pagination-->
<!--            :page-size="identityPageSize"-->
<!--            :total="identityCount"-->
<!--            :page="identityPageNum"-->
<!--            :page-change="identityPageChange"-->
<!--          >-->
<!--          </m-pagination>-->
<!--        </div>-->
      </div>

      <div v-if="isTx" class="address_transaction_content">
      <txs-options></txs-options>
      </div>
      <!-- bsn ddc -->
      <div
        class="address_transaction_content"
        v-if="moduleSupport('117', prodConfig.navFuncList)"
        v-show="isDDC"
      >
        <div class="content_title">
          {{ $t('ExplorerLang.ddc.mainTitle') }}
        </div>
        <list-component
          :empty-text="$t('ExplorerLang.table.emptyDescription')"
          :list-data="ddcList"
          :column-list="ddcListColumn"
          :pagination="{
            pageSize: Number(ddcPageSize),
            dataCount: ddcCount,
            pageNum: Number(ddcPageNum),
          }"
          @pageChange="ddcPageChange"
        />
      </div>
      <!-- energy asset -->
      <div v-if="moduleSupport('116', prodConfig.navFuncList)" v-show="isEnergyAsset">
        <list-component
          :is-loading="isLoading"
          :list-data="energyAssetData"
          :column-list="energyAssetColumn"
          :pagination="{ pageSize: 5, dataCount: 0, pageNum: 1 }"
        >
        </list-component>
      </div>
    </div>
  </div>
</template>

<script>
import {
  getConfig,
  converCoin,
  getMainToken,
  getTxType,
} from '@/helper/IritaHelper';
import {
  getNfts,
  getCallServiceWithAddress,
  getRespondServiceWithAddress,
  getRespondServiceRecord,
  getServiceBindingByServiceName,
  getServiceContextsByServiceName,
  getIdentityListByAddress,
  getAddressInformationApi,
  getDelegationListApi,
  getIbcTransferByHash,
  getDdcList,
  getEnergyAssetApi,
} from '@/service/api';
import BigNumber from 'bignumber.js';
import AddressSendAndReceiveTx from '@/components/common/AddressSendAndReceiveTx';
import addressDetailNftTabColumnConfig from '@/components/tableListColumnConfig/addressDetailNftTabColumnConfig';
import Tools from '../util/Tools';
import MPagination from './common/MPagination';
import { TxHelper } from '../helper/TxHelper';
import { moduleSupport } from '../helper/ModulesHelper';
import TxListComponent from './common/TxListComponent';
import prodConfig from '../productionConfig';
import Constant, {
  TX_TYPE,
  TX_STATUS,
  ColumnMinWidth,
  monikerNum,
  ibcDenomPrefix,
  decimals,
  UGAS,
} from '../constant';
import AddressInformationComponent from './AddressInformationComponent';
import LargeString from './common/LargeString';
import ListComponent from './common/ListComponent';
import txCommonTable from './tableListColumnConfig/txCommonTable';
import txCommonLatestTable from './tableListColumnConfig/txCommonLatestTable';
import { needAddColumn } from './tableListColumnConfig/allTxTableColumnConfig';
import TabsComponent from './common/TabsComponent';
import { getAmountByTx, getDenomMap, getDenomTheme } from '../helper/txListAmoutHelper';
import TxStatusTabsComponents from './common/TxStatusTabsComponents';
import TxCountComponent from './TxCountComponent';
import MClip from './common/MClip';
import SignerColunmn from './tableListColumnConfig/SignerColunmn';
import TxResetButtonComponent from './common/TxResetButtonComponent';
import ddcListColumnConfig from './tableListColumnConfig/ddcListColumnConfig';
import energyAssetColumn from './tableListColumnConfig/energyAssetColumn';
import { energyAsset, assetInfo, nftCount, ddc, identity, iService, tx } from './ownerDetail/lib';

import AddressInfoComponent from "@/addressPage/AssetsTabOptions";
import AssetsTabOptions from "@/addressPage/AssetsTabOptions";
import NFTTabOptions from "@/addressPage/NftTabOptions";
import NftTabOptions from "@/addressPage/NftTabOptions";
import TxsOptions from "@/addressPage/TxsOptions";
import IServiceConsumerOptions from "@/addressPage/IServiceConsumerOptions";
import IServiceProviderOptions from "@/addressPage/IServiceProviderOptions";
import IdentityOptions from "@/addressPage/IdentityOptions";

export default {
  name: 'OwnerDetail',
  components: {
	  IdentityOptions,
	  IServiceProviderOptions,
	  IServiceConsumerOptions,
	  TxsOptions,
	  NftTabOptions,
	  NFTTabOptions,
	  AssetsTabOptions,
	  AddressInfoComponent,
    AddressSendAndReceiveTx,
    TxResetButtonComponent,
    MClip,
    TxCountComponent,
    TxStatusTabsComponents,
    TabsComponent,
    ListComponent,
    MPagination,
    TxListComponent,
    AddressInformationComponent,
    LargeString,
  },
  data() {
    return {
      assetLoading: false,
      feeDecimals: decimals.fee,
      isShowDenom: prodConfig.fee.isShowDenom,
      isShowFee: prodConfig.fee.isShowFee,
      transactionArray: [],
      isLoading: false,
      txColumnList: [],
      TX_TYPE_DISPLAY: {},
      IBC: 'IBC',
      HashLock: 'Hash Lock',
      TX_TYPE,
      TX_STATUS,
      ColumnMinWidth,
      prodConfig,
      moduleSupport,
      Tools,
      assetArray: [],
      assetPageNum: 1,
      assetPageSize: 5,
      assetCount: 0,
      denomArray: [],
      address: '',
      pageNum: 1,
      pageSize: 5,
      txList: [],
      totalTxNumber: 0,
      providerTxList: [],
      providerTxPageNum: 1,
      providerTxPageSize: 5,
      providerTxCount: 0,
      consumerTxPageNum: 1,
      consumerTxPageSize: 5,
      consumerTxCount: 0,
      consumerTxList: [],
      respondRecordList: [],
      respondRecordPageNum: 1,
      respondRecordPageSize: 5,
      respondRecordCount: 0,
      identityList: [],
      identityPageNum: 1,
      identityPageSize: 5,
      identityCount: 0,
      type: '',
      status: '',
      type_temp: '',
      status_temp: '',
      txTypeArray: [''],
      statusOpt: [
        {
          value: '',
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
      txTypeOption: [
        {
          value: '',
          label: this.$t('ExplorerLang.common.allTxType'),
        },
      ],
      assetList: [],
      totalDelegatorReward: 0,
      totalDelegator: 0,
      allRewardsValue: 0,
      allRewardsAmountValue: 0,
      delegationPageNationArrayData: [],
      unBondingDelegationPageNationArrayData: [],
      rewardsDelegationPageNationArrayData: [],
      mainToken: {},
      tabList: [],
      isAsset: false,
      isNftInfo: false,
      nftKey: 0,
      isIdentity: false,
      isIservice: false,
      isTx: false,
      isDDC: false,
      ddcList: [],
      ddcListColumn: [],
      ddcPageSize: 5,
      ddcCount: 0,
      ddcPageNum: 1,
      LargeStringMinHeight: 69,
      LargeStringLineHeight: 23,
      mainTokenSymbol: '',
      energyAssetData: [],
      energyAssetColumn,
      isEnergyAsset: false,
      isShowSendAndReceiveTxComponent: false,
      opsConfig: {
        rail: {
          opacity: 1,
          background: '#E6E6E6',
          // border: '1px solid #cecece',
          size: '6px',
        },
        bar: {
          keepShow: true,
          size: '6px',
          minSize: 0.1,
          background: '#cdcdcd',
        },
        vuescroll: {
          wheelScrollDuration: 0,
          wheelDirectionReverse: false,
          locking: true,
          checkShifKey: true,
        },
      },
      assetColumnArray: addressDetailNftTabColumnConfig,
    };
  },
  watch: {
    $route() {
      this.address = this.$route.params.param;
      this.getTxByAddress();
      this.getConsumerTxListCount();
      this.getConsumerTxList();
      // this.getRspondRecordListCount();
      // this.getRspondRecordList();
      this.getProviderTxListCount();
      this.getProviderTxList();
    },
  },
  async created() {
    // this.mainToken = await getMainToken();
    await this.getConfigTokenData();
  },
  async mounted() {
    this.isShowSendAndReceiveTxComponent = prodConfig.isShowSendAndReceiveTxCount;
    this.txColumnList = txCommonTable.concat(SignerColunmn, txCommonLatestTable);
    this.ddcListColumn = ddcListColumnConfig;
    await this.getTxTypeData();
    document.documentElement.scrollTop = 0;
    this.address = this.$route.params.param;
    this.getTabList();
  },
  methods: {
    getFilterTxs(param) {
      if (param?.value) {
        this.type = param.value;
      } else if (param?.value === '') {
        // 处理点击all的情况
        this.type = '';
      } else if (Array.isArray(param)) {
        const notAllMsgType = param.filter((item) => {
          return item.label !== 'secondaryAll';
        });
        const currentSelectSecondMsgTypes = notAllMsgType.map((item) => {
          return item.value;
        });

        if (currentSelectSecondMsgTypes?.length) {
          this.type = currentSelectSecondMsgTypes.join(',');
        }
      }
      this.txColumnList = txCommonTable.concat(SignerColunmn, txCommonLatestTable);
      if (this.type && needAddColumn[this.type]) {
        this.txColumnList = txCommonTable.concat(needAddColumn[this.type], txCommonLatestTable);
      }
      this.totalTxNumber = 0;
      this.pageNum = 1;
    },
    changeTxStatus(status) {
      this.status = status;
      if (!status) {
        this.status = '';
      }
    },
    changeTime() {},
    async getTxTypeData() {
      try {
        const res = await getTxType();
        this.TX_TYPE_DISPLAY = res?.TX_TYPE_DISPLAY;
      } catch (error) {
        console.log(error);
      }
    },
    async setMainToken() {
      const mainToken = await getMainToken();
      if (mainToken && mainToken.symbol) {
        this.mainTokenSymbol = mainToken.symbol.toUpperCase();
      }
    },
    getTabList() {
      this.tabList = [];
      if (moduleSupport('116', prodConfig.navFuncList)) {
        this.tabList.push({ ...energyAsset });
        this.getEnergyAssetList();
      }
      if (moduleSupport('107', prodConfig.navFuncList)) {
        this.tabList.push({ ...assetInfo });
      }
      if (moduleSupport('103', prodConfig.navFuncList)) {
        this.tabList.push({ ...nftCount });
      }
      if (moduleSupport('117', prodConfig.navFuncList)) {
        this.tabList.push({ ...ddc });
        this.getDdcListCount();
        this.getDdcList();
      }
      if (moduleSupport('106', prodConfig.navFuncList)) {
        this.tabList.push({ ...identity });
        // this.getIdentityListCount();
        // this.getIdentityList();
      }
      if (moduleSupport('105', prodConfig.navFuncList)) {
        this.tabList.push({ ...iService });
        // this.getRspondRecordListCount();
        // this.getRspondRecordList();
        // this.getProviderTxListCount();
        // this.getProviderTxList();
        // this.getConsumerTxListCount();
        // this.getConsumerTxList();
      }
      this.tabList.push({ ...tx });
      this.tabList[0].isActive = true;
      this.showAndHideByModule();
    },
    showAndHideByModule() {
      this.isNftInfo = false;
      this.isIservice = false;
      this.isIdentity = false;
      this.isAsset = false;
      this.isTx = false;
      this.isDDC = false;
      this.isEnergyAsset = false;
      this.tabList.forEach((item) => {
        if (item.isActive) {
          switch (item.moduleNumber) {
            case '103':
              this.nftKey++;
              this.isNftInfo = true;
              break;
            case '105':
              this.isIservice = true;
              break;
            case '106':
              this.isIdentity = true;
              break;
            case '107':
              this.isAsset = true;
              break;
            case '116':
              this.isEnergyAsset = true;
              break;
            case '117':
              this.isDDC = true;
              break;
            default:
              this.isTx = true;
          }
        }
      });
    },
    selectOptions(index) {
      this.tabList.forEach((item) => {
        item.isActive = false;
      });
      this.tabList[index].isActive = true;
      this.showAndHideByModule();
    },
    assetPageChange(pageNum) {
      this.assetPageNum = pageNum;
    },
    // 身份id列表
    identityPageChange(pageNum) {
      this.identityPageNum = pageNum;
      this.getIdentityList();
    },
    async getIdentityList() {
      try {
        const res = await getIdentityListByAddress(
          this.$route.params.param,
          this.identityPageNum,
          this.identityPageSize,
          false
        );
        if (res?.data?.length > 0) {
          this.identityList = res.data.map((item) => {
            return {
              id: item.identities_id,
              txHash: item.update_tx_hash || '--',
              time: Tools.formatLocalTime(item.update_block_time) || '--',
            };
          });
        }
      } catch (e) {
        console.error(e);
        this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
      }
    },
    async getIdentityListCount() {
      try {
        const res = await getIdentityListByAddress(this.$route.params.param, null, null, true);
        if (res?.count) {
          this.identityCount = res.count;
        } else {
          this.identityCount = 0;
        }
      } catch (e) {
        console.error(e);
        this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
      }
    },


   
    // 服务调用-消费者
    // async getConsumerTxList() {
    //   try {
    //     const res = await getCallServiceWithAddress(
    //       this.consumerTxPageNum,
    //       this.consumerTxPageSize,
    //       false,
    //       this.$route.params.param
    //     );
    //     if (res?.data?.length > 0) {
    //       this.consumerTxList = [];
    //       for (const item of res.data) {
    //         const result = {
    //           serviceName: item.msgs[0].msg.service_name || '--',
    //           txHash: item.tx_hash,
    //           blockHeight: item.height,
    //           txType: this.TX_TYPE_DISPLAY[item.type],
    //           provider: item.msgs[0].msg.providers,
    //           time: Tools.formatLocalTime(item.time),
    //           state: 'Running',
    //           status: item.status,
    //           respond: [],
    //         };
    //         item.events.forEach((item) => {
    //           (item.attributes || []).forEach((attr) => {
    //             if (attr.key == 'request_context_id') {
    //               result.requestContextId = attr.value;
    //             }
    //           });
    //         });
    //         const context = await this.getContext(result.requestContextId || '');
    //         if (context && context.result) {
    //           result.state = context.result.state;
    //         }
    //         this.consumerTxList.push(result);
    //         if (item.respond && item.respond.length) {
    //           item.respond.forEach((r, index) => {
    //             const respondResult = {
    //               index,
    //               isChildren: true,
    //               count: item.respond.length,
    //               serviceName: (r.msgs[0].msg.ex || {}).service_name || '',
    //               txHash: r.tx_hash,
    //               blockHeight: r.height,
    //               txType: this.TX_TYPE_DISPLAY[r.type],
    //               provider: r.msgs[0].msg.provider,
    //               time: Tools.formatLocalTime(r.time),
    //               requestContextId: (r.msgs[0].msg.ex || {}).request_context_id,
    //               requestStatus: '--',
    //               status: r.status,
    //             };
    //             this.consumerTxList.push(respondResult);
    //           });
    //         }
    //       }
    //     } else {
    //       this.consumerTxList = [];
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    // async getContext(requestContextId) {
    //   try {
    //     return await getServiceContextsByServiceName(requestContextId);
    //   } catch (error) {
    //     console.log(error);
    //   }
    // },
    // async getConsumerTxListCount() {
    //   try {
    //     const res = await getCallServiceWithAddress(null, null, true, this.$route.params.param);
    //     if (res?.count) {
    //       this.consumerTxCount = res.count;
    //     } else {
    //       this.consumerTxCount = 0;
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    // consumerTxPageChange(pageNum) {
    //   this.consumerTxPageNum = pageNum;
    //   this.getConsumerTxList();
    // },
    // providerTxPageChange(pageNum) {
    //   this.providerTxPageNum = pageNum;
    //   this.getProviderTxList();
    // },
    // // 响应记录
    // async getRspondRecordList() {
    //   try {
    //     const res = await getRespondServiceRecord(
    //       '',
    //       this.$route.params.param,
    //       this.respondRecordPageNum,
    //       this.respondRecordPageSize,
    //       false
    //     );
    //     if (res?.data?.length > 0) {
    //       this.respondRecordList = (res.data || []).map((tx) => {
    //         tx.type = this.TX_TYPE_DISPLAY[tx.type];
    //         return tx;
    //       });
    //     } else {
    //       this.respondRecordList = [];
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    // async getRspondRecordListCount() {
    //   try {
    //     const res = await getRespondServiceRecord('', this.$route.params.param, null, null, true);
    //     if (res?.count) {
    //       this.respondRecordCount = res.count;
    //     } else {
    //       this.respondRecordCount = 0;
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    // respondRecordPageChange(pageNum) {
    //   this.respondRecordPageNum = pageNum;
    //   this.getRspondRecordList();
    // },
    // 服务调用-提供者
    // async getProviderTxList() {
    //   try {
    //     const res = await getRespondServiceWithAddress(
    //       this.$route.params.param,
    //       this.providerTxPageNum,
    //       this.providerTxPageSize,
    //       false
    //     );
    //     if (res?.data?.length > 0) {
    //       this.providerTxList = [];
    //       for (const item of res.data) {
    //         const result = {
    //           serviceName: (item.msgs[0].msg.ex || {}).service_name,
    //           provider: item.msgs[0].msg.provider,
    //           owner: item.msgs[0].msg.owner,
    //           respond_times: item.respond_times,
    //           pricing: JSON.parse(item.msgs[0].msg.pricing || '{}').price,
    //           qos: item.msgs[0].msg.qos,
    //           time: Tools.formatLocalTime(item.time),
    //           unbindTime: item.unbinding_time ? Tools.formatLocalTime(item.unbinding_time) : '--',
    //           txHash: item.tx_hash,
    //           blockHeight: item.height,
    //           txType: item.type,
    //           status: item.status,
    //         };
    //         if (item.msgs[0].msg.deposit && item.msgs[0].msg.deposit.length) {
    //           result.deposit = `${item.msgs[0].msg.deposit[0].amount} ${item.msgs[0].msg.deposit[0].denom}`;
    //         }
    //         const bindings = await getServiceBindingByServiceName(result.serviceName);
    //         result.isAvailable = this.$t('ExplorerLang.common.false');
    //         (bindings.result || []).forEach((bind) => {
    //           if (result.provider === bind.provider && result.owner == bind.owner) {
    //             result.isAvailable = bind.available
    //               ? this.$t('ExplorerLang.common.true')
    //               : this.$t('ExplorerLang.common.false');
    //             result.pricing = JSON.parse(bind.pricing || '{}').price;
    //             result.qos = bind.qos;
    //             if (bind.disabled_time) {
    //               const time = new Date(bind.disabled_time).getTime();
    //               result.unbindTime = time > 0 ? Tools.formatLocalTime(time / 1000) : '--';
    //             }
    //           }
    //         });
    //         if (result.pricing && result.pricing.length) {
    //           result.pricing = result.pricing.replace('point', ' point');
    //         }
    //         this.providerTxList.push(result);
    //       }
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    // async getProviderTxListCount() {
    //   try {
    //     const res = await getRespondServiceWithAddress(this.$route.params.param, null, null, true);
    //     if (res?.count) {
    //       this.providerTxCount = res.count;
    //     } else {
    //       this.providerTxCount = 0;
    //     }
    //   } catch (e) {
    //     console.error(e);
    //     this.$message.error(this.$t('ExplorerLang.message.requestFailed'));
    //   }
    // },
    formatTxHash(TxHash) {
      if (TxHash) {
        return Tools.formatTxHash(TxHash);
      }
      return '--';
    },
    getCallProviders(providers) {
      if (providers && providers.length > 2) {
        return providers.slice(0, 2);
      }
      return providers;
    },
    getContentWithState(state) {
      let content = '';
      switch (state) {
        case 0:
          content = 'running';
          break;
        case 1:
          content = 'paused';
          break;
        case 2:
          content = 'completed';
          break;
      }
      return content;
    },
    getBgColorWithState(state) {
      let bgColor = '';
      switch (state) {
        case 0:
          bgColor = '#B1E96E';
          break;
        case 1:
          bgColor = '#E96E6E';
          break;
        case 2:
          bgColor = '#FFC456';
          break;
      }
      return bgColor;
    },
    arraySpanMethod(table) {
      if (table.columnIndex === 0) {
        if (table.row.isChildren) {
          if (table.row.index == 0) {
            return {
              rowspan: table.row.count,
              colspan: 1,
            };
          }
          return {
            rowspan: 0,
            colspan: 0,
          };
        }
        return {
          rowspan: 1,
          colspan: 1,
        };
      }
    },
    getRespondCount(count) {
      return this.$t('ExplorerLang.unit.totalRespond').replace(/\$\{\%value\%\}/, count);
    },
    handleSearchClick() {
      this.type = this.type_temp;
      this.status = this.status_temp;
      this.pageNum = 1;
    },
   
    async getAddressInformation() {
      try {
        const res = await getAddressInformationApi(this.$route.params.param);
        if (res) {
          let arrayIndexOneData;
          if (res.amount) {
            res.amount.forEach((item) => {
              if (item.denom === this.mainToken.denom) {
                arrayIndexOneData = item;
              }
            });
            if (arrayIndexOneData) {
              res.amount.unshift(arrayIndexOneData);
            }
            res.amount = Array.from(new Set(res.amount));
            this.assetList = res.amount;
          }
          this.validatorMoniker = res.moniker ? res.moniker : '--';
          this.OperatorAddress = res.operator_address ? res.operator_address : '--';
          this.validatorStatus = res.status;
          this.withdrewToAddress = res.withdrawAddress ? res.withdrawAddress : '--';
          this.isProfiler = res.isProfiler;
          this.getAssetList();
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getAssetList() {
      const assetList = [];
      const balanceAmountsArr = [];
      // console.time('amount')
      for (const key in this.assetList) {
        const item = this.assetList[key];
        balanceAmountsArr.push(item && item.amount ? converCoin(item) : {});
      }
      const balanceAmounts = await Promise.all(balanceAmountsArr);
      for (const key in this.assetList) {
        const item = this.assetList[key];
        // let balanceAmount = item && item.amount ? await converCoin(item) : {};
        const balanceAmount = balanceAmounts[key];
        if (item && item.denom && item.denom === this.mainToken.denom) {
          assetList.unshift({
            token: this.mainToken.symbol.toUpperCase(),
            balance:
              balanceAmount && balanceAmount.amount
                ? `${new BigNumber(
                    Tools.formatStringToFixedNumber(balanceAmount.amount, this.fixedNumber)
                  ).toFormat()} ${balanceAmount.denom.toUpperCase()}`
                : 0,
            balanceNumber: balanceAmount.amount,
            delegatedValue: this.totalDelegator ? this.totalDelegator : 0,
            delegated: this.totalDelegator
              ? `${Tools.formatStringToFixedNumber(
                  new BigNumber(this.totalDelegator).toFormat(),
                  this.fixedNumber
                )} ${this.mainToken.symbol.toUpperCase()}`
              : 0,
            unBondingValue: this.totalUnBondingDelegator ? this.totalUnBondingDelegator : 0,
            unBonding: this.totalUnBondingDelegator
              ? `${Tools.formatStringToFixedNumber(
                  new BigNumber(this.totalUnBondingDelegator).toFormat(),
                  this.fixedNumber
                )} ${this.mainToken.symbol.toUpperCase()}`
              : 0,
            rewards: this.allRewardsValue
              ? `${Tools.formatStringToFixedNumber(
                  new BigNumber(this.allRewardsAmountValue).toFormat(),
                  this.fixedNumber
                )} ${this.mainToken.symbol.toUpperCase()}`
              : 0,
            rewardsValue: this.allRewardsAmountValue ? this.allRewardsAmountValue : 0,
            totalAmount: `${Tools.formatStringToFixedNumber(
              new BigNumber(
                (
                  Number(
                    Tools.formatStringToFixedNumber(
                      balanceAmount.amount.toString(),
                      this.computerNumber
                    )
                  ) +
                  Number(
                    Tools.formatStringToFixedNumber(
                      this.totalDelegator.toString(),
                      this.computerNumber
                    )
                  ) +
                  Number(
                    Tools.formatStringToFixedNumber(
                      this.totalUnBondingDelegator.toString(),
                      this.computerNumber
                    )
                  ) +
                  Number(
                    Tools.formatStringToFixedNumber(
                      this.allRewardsAmountValue.toString(),
                      this.computerNumber
                    )
                  )
                ).toString()
              ).toFormat(),
              this.fixedNumber
            )} ${this.mainToken.symbol.toUpperCase()}`,
          });
        } else if (balanceAmount && balanceAmount.denom) {
          let { denom } = balanceAmount;
          if (denom.startsWith(ibcDenomPrefix)) {
            const hash = denom.replace(ibcDenomPrefix, '');
            const res = await getIbcTransferByHash(hash).catch(error => {
							console.error(error)
            });
            if (res && res.denom_trace && res.denom_trace.base_denom) {
              denom = (ibcDenomPrefix + res.denom_trace.base_denom).toUpperCase();
            }
          }
          assetList.push({
            token: item.denom.toUpperCase(),
            balance: balanceAmount.amount
              ? `${new BigNumber(balanceAmount.amount).toFormat()} ${denom.toUpperCase()}`
              : 0,
            delegated: 0,
            unBonding: 0,
            rewards: 0,
            totalAmount: balanceAmount.amount
              ? `${new BigNumber(
                  balanceAmount.amount
                ).toFormat()} ${balanceAmount.denom.toUpperCase()}`
              : 0,
          });
        }
      }
      this.assetsItems = assetList;
      //  console.timeEnd('amount')
    },
    pageNation(dataArray) {
      let index = 0;
      let newArray = [];
      if (dataArray.length > this.pageSize) {
        while (index < dataArray.length) {
          newArray.push(dataArray.slice(index, (index += this.pageSize)));
        }
      } else {
        newArray = dataArray;
      }
      return newArray;
    },
    async getDelegationList() {
      try {
        const { data: res, count } = await getDelegationListApi(this.$route.params.param, 1, 1000);
        if (res && res.length > 0) {
          this.delegationCountNum = count;
          const copyResult = JSON.parse(JSON.stringify(res));
          this.delegationPageNationArrayData = this.pageNation(copyResult);
          if (res.length > this.pageSize) {
            this.flDelegationNextPage = true;
          } else {
            this.flDelegationNextPage = false;
          }
          this.delegationPageChange(this.delegationCurrentPage);
          if (res.length > 0) {
            // res.forEach(async (item) => {
            // 	if (item.amount && item.amount.amount) {
            // 		const amount = await converCoin(item.amount)
            // 		item.amount.amount = amount.amount
            // 		if (item.amount.amount.toString().indexOf('.') !== -1) {
            // 			let splitNumber = item.amount.amount.toString().split('.')[1].substr(0, 2);
            // 			item.amount.amount = Number(`${item.amount.amount.toString().split('.')[0]}.${splitNumber}`) * 100
            // 		} else {
            // 			item.amount.amount = item.amount.amount * 100
            // 		}
            // 	}
            // });

            let totalAmount = res.reduce((total, item) => {
              return Number(item.amount.amount) + Number(total);
            }, 0);
            totalAmount = await converCoin({
              amount: totalAmount,
              denom: res[0].amount.denom,
            });
            this.totalDelegator = totalAmount.amount;
          }
          this.totalDelegatorValue = `${Tools.formatStringToFixedNumber(
            new BigNumber(this.totalDelegator.toString()).toFormat(),
            this.fixedNumber
          )} ${this.mainToken.symbol.toUpperCase()}`;
        } else {
          this.delegationsItems = [];
          this.delegationCountNum = 0;
        }
      } catch (e) {
        console.error(e);
      }
    },
    formatAddress(address) {
      return Tools.formatValidatorAddress(address) || '--';
    },
    handleChange(value) {
      value ? (this.type_temp = value[1] ? value[1] : '') : '';
    },
    async getConfigTokenData() {
      const res = await getConfig();
      this.tokenData = res.tokenData;
    },
    ddcPageChange(pageNum) {
      this.ddcPageNum = pageNum;
      this.getDdcList();
    },
    async getDdcList() {
      try {
        const ddcData = await getDdcList({
          owner: this.$route.params.param,
          ddc_id: '',
          contract_address: '',
          useCount: false,
          pageNum: this.ddcPageNum,
          pageSize: this.ddcPageSize,
        });
        if (ddcData && ddcData.data) {
          this.ddcList = ddcData.data.map((item) => {
            return {
              ddcId: item.ddc_id,
              ddcName: item.ddc_name,
              contractAddr: item.contract_address,
              owner: item.owner,
              creator: item.creator,
              ddcUri: item.ddc_uri || '--',
              Time: Tools.formatLocalTime(item.lastest_tx_time),
            };
          });
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getDdcListCount() {
      try {
        const res = await getDdcList({
          owner: this.$route.params.param,
          ddc_id: '',
          contract_address: '',
          useCount: true,
        });
        if (res?.count) {
          this.ddcCount = res.count;
        } else {
          this.ddcCount = 0;
        }
      } catch (e) {
        console.error(e);
      }
    },
    async getEnergyAssetList() {
      this.isLoading = true;
      const res = await getEnergyAssetApi(this.address);
      this.isLoading = false;
      if (res && res.result && res.result.length > 0) {
        const energyItem = res.result.find((item) => item.denom === UGAS);
        this.energyAssetData = [
          {
            title: this.$t('ExplorerLang.table.energy'),
            amount: energyItem?.amount || '--',
          },
        ];
      } else {
        this.energyAssetData = [
          {
            title: this.$t('ExplorerLang.table.energy'),
            amount: '--',
          },
        ];
      }
    },
  },
	beforeDestroy(){
		sessionStorage.removeItem('currentTxModelIndex')
		sessionStorage.removeItem('lastChoiceMsgModelIndex')
		sessionStorage.removeItem('currentChoiceMsgType')
	}
};
</script>

<style scoped lang="scss">
a {
  color: $t_link_c !important;
}

::v-deep .el-table__empty-block {
  height: 0.48rem !important;
  min-height: 0.48rem !important;
}

.txCountWrap {
  display: flex;
  flex-wrap: wrap;

  > div + div {
    margin-left: 20px;
  }
}

.address_container_content {
  padding: 0 0.15rem;

  .address_content_wrap {
    max-width: 12rem;
    margin: 0 auto;

    .address_content_title {
      display: flex;
      justify-content: flex-start;
      color: $t_first_c;
      font-size: $s18;
      line-height: 0.21rem;
      margin: 0.3rem 0 0.15rem 0rem;
      text-align: left;
      font-family: PublicSans;
      font-weight: 600;

      .address_content_title_first {
        white-space: nowrap;
        margin-right: 0.05rem;
      }

      .address_content_title_address {
        font-size: $s16;
        font-family: PublicSans;
        font-weight: 400;
        color: $t_first_c;
        line-height: 0.2rem;
        word-break: break-all;
      }
    }

    .address_tab_container {
      margin-bottom: 0.16rem;

      .address_tab_content {
        display: flex;
        // margin-left: 0.28rem;
        padding-bottom: 0.14rem;

        .address_tab_item {
          cursor: pointer;
          width: 1.2rem;
          height: 0.3rem;
          line-height: 0.3rem;
          border: 0.01rem solid $bd_first_c;
          border-right: none;
          font-size: 0.14rem;
          background-color: $bg_white_c;
        }

        .address_tab_item:first-child {
          border-radius: 0.08rem 0 0 0.08rem;
        }

        .address_tab_item:last-child {
          border-right: 0.01rem solid $bd_first_c;
          border-radius: 0 0.08rem 0.08rem 0;
        }
      }

      .active_content {
        background: $theme_c !important;
        color: $t_white_c;
        border: 0.01rem solid transparent !important;
      }
    }

    .address_nft_content {
      background: $bg_white_c;
    }

    .address_content {
      background: $bg_white_c;
      padding: 0.25rem;
      border-radius: 0.05rem;
      // border: 0.01rem solid $bd_first_c;
      margin-bottom: 0.48rem;
    }

    .consumer_transaction_content {
      margin-bottom: 0.48rem;
      background: $bg_white_c;
      padding: 0.25rem;
      border-radius: 0.05rem;
      // border: 0.01rem solid $bd_first_c;
      .address_transaction_content_hash {
        display: flex;

        .status {
          .status_icon {
            width: 0.13rem;
            height: 0.13rem;
            margin-right: 0.05rem;
          }
        }
      }

      .serviceNameText {
        color: $t_second_c;
      }

      .consumer_transaction_content_hash {
        display: flex;
        align-items: center;
      }

      .consumer_transaction_content_available {
        display: flex;
        align-items: center;

        .consumer_transaction_content_available_icon {
          width: 0.1rem;
          height: 0.1rem;
          border-radius: 50%;
          margin-right: 0.1rem;
        }
      }

      .pagination_content {
        margin-top: 0.2rem;
        display: flex;
        justify-content: flex-end;
      }
    }

    .provider_transaction_content {
      margin-bottom: 0.48rem;
      background: $bg_white_c;
      padding: 0.25rem;
      border-radius: 0.05rem;
      // border: 0.01rem solid $bd_first_c;

      .respond_transaction_content_hash {
        display: flex;

        .status {
          .status_icon {
            width: 0.13rem;
            height: 0.13rem;
            margin-right: 0.05rem;
          }
        }
      }

      .address_transaction_content_hash {
        display: flex;

        .status {
          .status_icon {
            width: 0.13rem;
            height: 0.13rem;
            margin-right: 0.05rem;
          }
        }
      }

      .provider_transaction_content_available {
        display: flex;
        align-items: center;

        .provider_transaction_content_available_icon {
          width: 0.1rem;
          height: 0.1rem;
          border-radius: 50%;
          margin-right: 0.1rem;
        }
      }

      .pagination_content {
        margin-top: 0.2rem;
        display: flex;
        justify-content: flex-end;
      }
    }

    .address_transaction_content {
      // margin-top: 0.48rem;
      margin-bottom: 0.2rem;
      background: $bg_white_c;
      //padding: 0.25rem;
      border-radius: 0.05rem;
      // border: 0.01rem solid $bd_first_c;
      .content_title {
        padding-top: 0.25rem;
        padding-left: 0.25rem;
        color: #171d44;
        margin-bottom: 0.4rem;
        text-align: left;
        font-size: 0.16rem;
        font-family: PublicSans;
        font-weight: 600;
        line-height: 22px;
      }

      .list_table_content_container .box-card {
        padding-left: 0.25rem;
        padding-top: 0;
      }

      .address_transaction_content_hash {
        display: flex;
        align-items: center;
      }

      .address_transaction_condition_container {
        width: 100%;
        display: flex;
        justify-content: flex-start;
        margin-bottom: 0.4rem;
        align-items: center;

        .address_transaction_condition_count {
          font-size: $s14;
          margin-right: 0.42rem;
          font-weight: 600;
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
          margin-right: 0.22rem;

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

        .search_btn {
          cursor: pointer;
          background: $bg_button_c;
          color: $t_button_c;
          border-radius: 0.04rem;
          padding: 0.05rem 0.18rem;
          font-size: $s14;
          line-height: 0.2rem;
          white-space: nowrap;
        }

        .address_transaction_condition_action {
          display: flex;

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
        }
      }
    }

    .content_title {
      color: $t_first_c;
      margin-bottom: 0.4rem;
      text-align: left;
      font-size: $s16;
      font-family: PublicSans;
      font-weight: 600;
      line-height: 22px;
    }

    .status_icon {
      width: 0.13rem;
      height: 0.13rem;
      margin-right: 0.05rem;
    }

    /*.delegations_wrap {
      margin: 0 auto;

      .delegations_container {
        display: flex;

        .validator_information_content_title {
          height: 0.2rem;
          line-height: 0.2rem;
          color: $t_first_c;
          font-size: $s18;
          margin-top: 0.3rem;
          // padding-left: 0.2rem;
          margin-bottom: 0.06rem !important;
          text-align: left;

          .address_information_delegation_value,
          .address_information_unbonding_delegation_value {
            font-size: $s14;
            color: $t_second_c;
            line-height: 0.16rem;
            margin-left: 0.15rem;
          }
        }

        .one_table_container {
          width: calc(50% - 0.1rem);
        }

        .second_table_container {
          margin-left: 0.2rem;
          width: calc(50% - 0.1rem);
        }

        .delegations_table_container {
          overflow-x: auto;
          border-radius: 0.05rem;
          // border: 0.01rem solid $bd_first_c;
          //min-height: 2.34rem;
          //background: $bg_white_c;
        }
      }

      .common_pagination_content {
        margin-top: 0.2rem;
        float: right;
      }
    }

    .address_information_redelegation_header_title {
      text-align: left;
      font-size: $s18;
      color: $t_first_c;
      line-height: 0.21rem;
      margin: 0.27rem 0 0 0rem;

      .address_information_redelegation_rewards_value {
        font-size: $s14;
        color: $t_second_c;
        line-height: 0.16rem;
        margin-left: 0.15rem;
      }
    }

    .address_information_redelegation_tx_container {
      text-align: left;
      display: flex;
      margin-bottom: 0.2rem;

      .address_information_delegator_rewards_content {
        width: calc(50% - 0.1rem);
        margin-right: 0.2rem;

        .address_information_detail_option {
          padding: 0 0 0.1rem 0rem;

          .address_information_detail_option_name {
            font-size: $s14;
            color: $t_second_c;
            margin-right: 0.1rem;
          }

          .address_information_detail_option_value {
            font-size: $s14;

            a {
              color: $theme_c !important;
            }
          }
        }

        .address_information_list_content {
          overflow-x: auto;
          box-sizing: border-box;
          border-radius: 0.05rem;
          // border: 0.01rem solid $bd_first_c;
          min-height: 2.34rem;
          background: $bg_white_c;
        }

        .pagination_content {
          margin-top: 0.2rem;
          display: flex;
          justify-content: flex-end;
        }
      }

      .address_information_detail_container {
        width: calc(50% - 0.1rem);

        .address_information_redelegation_title {
          width: 100%;
          font-size: $s18;
          color: $t_first_c;
          padding: 0 0 0.06rem 0rem;

          .address_information_validator_rewards_value {
            font-size: $s14;
            color: $t_second_c;
            line-height: 0.16rem;
            margin-left: 0.15rem;
          }
        }

        .address_information_detail_content {
          // border: 0.01rem solid $bd_first_c;
          border-radius: 0.05rem;
          background: $bg_white_c;
          box-sizing: border-box;
          padding: 0.2rem;
          min-height: 2.34rem;

          .address_information_detail_option {
            display: flex;
            align-items: center;

            .address_information_detail_option_name {
              min-width: 1.3rem;
              font-size: $s14;
              color: $t_second_c;
              line-height: 0.16rem;
              margin-right: 0.3rem;
            }

            .address_information_detail_option_value {
              font-size: $s14;
              color: $t_first_c;
              margin-right: 0.1rem;

              a {
                color: $theme_c !important;
              }
            }

            .address_information_address_status_active {
              background: $theme_c;
              font-size: $s12;
              color: $t_button_c;
              padding: 0.02rem 0.14rem;
              border-radius: 0.22rem;
              margin-right: 0.1rem;
            }

            .address_information_address_status_candidate {
              background: $bg_candidate_c;
              font-size: $s12;
              color: $t_button_c;
              padding: 0.02rem 0.14rem;
              border-radius: 0.22rem;
              margin-right: 0.1rem;
            }

            .address_information_address_status_jailed {
              background: $bg_jailed_c;
              font-size: $s12;
              color: $t_button_c;
              padding: 0.02rem 0.14rem;
              border-radius: 0.22rem;
              margin-right: 0.1rem;
            }
          }
        }
      }
    }
*/
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

@media screen and (max-width: 1280px) {
  .address_container_content {
    .address_content_wrap {
      .delegations_wrap {
        .delegations_container {
          display: block;

          .one_table_container {
            width: 100%;
          }

          .second_table_container {
            width: 100%;
            margin-left: 0rem;
          }
        }
      }

      .address_information_redelegation_header_title {
        margin-left: 0rem;
      }

      .address_information_redelegation_tx_container {
        flex-direction: column;
        // margin: 0 0.1rem;
        .address_information_delegator_rewards_content {
          width: 100%;
          margin-right: 0;

          .address_information_detail_option {
            padding-left: 0;
            display: flex;

            .address_information_detail_option_value {
              padding-right: 0.1rem;
              word-break: break-word;
            }
          }

          .address_information_list_content {
            overflow-x: auto;
          }
        }

        .address_information_detail_container {
          width: 100%;

          .address_information_redelegation_title {
            padding: 0.2rem 0;
          }

          .address_information_detail_content {
            .address_information_detail_option {
              display: flex;
              align-items: center;
              flex-direction: row;

              .address_information_detail_option_name {
                margin-right: 0.05rem;
              }

              .validator_status_content {
                display: flex;
                margin: 0.05rem 0;
              }

              .address_information_detail_option_value {
                word-break: break-word;
              }
            }
          }
        }

        .hide_style {
          display: none;
        }
      }
    }
  }
}

@media screen and (min-width: 768px) {
  .address_container_content {
    .address_content_wrap {
      .pagination_content {
        display: flex;
        justify-content: flex-end;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .address_container_content {
    .address_content_wrap {
      .address_transaction_content {
        .address_transaction_condition_container {
          flex-direction: column;
          align-items: flex-start;

          .address_transaction_condition_count {
            margin-bottom: 0.1rem;
          }

          ::v-deep .el-select {
            width: 100%;
            margin-bottom: 0.1rem;
          }
        }
      }

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
}

@media screen and (max-width: 705px) {
  .address_container_content {
    .address_content_wrap {
      .address_content_title {
        margin-left: 0rem;
      }

      .address_tab_container {
        .address_tab_content {
          margin-left: 0rem;
        }
      }
    }
  }
}

@media screen and (max-width: 551px) {
  .address_container_content {
    .address_content_wrap {
      .address_content_title {
        display: block;
      }

      .address_information_redelegation_tx_container {
        .address_information_delegator_rewards_content {
          .address_information_detail_option {
            display: block;

            .address_information_detail_option_value {
              display: block;
            }
          }
        }

        .address_information_detail_container {
          .address_information_detail_content {
            .address_information_detail_option {
              .address_information_detail_option_name {
                min-width: 1.2rem;
                margin-right: 0.01rem;
              }
            }
          }
        }
      }
    }
  }
}
</style>
