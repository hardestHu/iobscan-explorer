<template>
    <!-- 
      用法：
        detailInfo: {object[]} 配置项
        格式要求：[
          {
            label:'名称',  // 必传
            value:'名称对应的值', // 必传
            // 注意：以下可选项，只能任选一个，不可都配置
            isService: true, // 可选 可跳转到 /servcie
            isAddress: true, // 可选 可跳转到 /address
            isSchema: true // 可选 使用 LargeString 渲染内容
            isMulti: true // 可选 配合isAddress 使用，对用具有多个值的情况
            isAsset: true // 可选 跳转到 /asset
        }]
     -->
  	<div>
			<p v-for="(info, key) in detailInfo" :key="key">
				<span>{{ info.label }}：</span>
        
        <!-- isService 为 true 跳转到/service -->
        <template v-if="info.isService">
				  <span v-if="!info.value || info.value === '--'"> -- </span>
          <router-link v-else :to="`/service?serviceName=${ info.value }`">
					  {{ info.value }}
				  </router-link>
        </template>
        
        <!-- isAddress 为 true 跳转到/address -->
        <template v-else-if="info.isAddress">
          <span v-if="!info.value || info.value === '--'"> -- </span>
          <span v-else-if="judgeCosmos(info.value)">{{ info.value }}</span>
          <template v-else>
            <span v-if="info.isMulti" class="verticalShow">
					    <router-link v-for="(item, index) in info.value" :key="index" class="address_link" :to="`/address/${item}`">{{ item }}</router-link>
            </span> 
            <span v-else>
					    <router-link  class="address_link" :to="`/address/${info.value}`">{{ info.value }}</router-link>
            </span>
          </template>
        </template>  

        <!-- isSchema 为 true  显示长字符串 -->
        <template v-else-if="info.isSchema">
          <LargeString :isShowPre="Tools.isJSON(info.value)" v-if="info.value" :text="info.value" :minHeight="LargeStringMinHeight" :lineHeight="LargeStringLineHeight"/>
        </template>

        <!-- isUri 为true 处理uri -->
        <template v-else-if="info.isUri">
          <div class="wrap" v-if="info.value && info.value !== '[do-not-modify]'">
								<a class="text" v-if="Tools.testUrl(info.value)" :href="info.value" target="_blank">{{info.value}}</a>
								<a class="text" v-else-if="startStr(info.value)" :href="'http://' + info.value" target="_blank">{{info.value}}</a>
								<span class="text" v-else>{{info.value}}</span>
					</div>
					<span v-else-if=" info.value === '[do-not-modify]'">{{info.value}}</span>
					<span v-else>--</span>
        </template>
        
        <!-- isAsset 为true 可跳转 /asset -->
        <template v-else-if="info.isAsset">
          <span v-if="!info.value || info.value === '--'"> -- </span>
          <router-link v-else :to="`/assets/${ info.value }`">
            {{ info.value }}
          </router-link>
        </template>
        
        <template v-else>
          <span>{{ formatValue(info.value) }}</span>
        </template>
			</p>
		</div>
</template>
<script>
import { COSMOS_ADDRESS_PREFIX } from '@/constant';
import Tools from '@/util/Tools'
import LargeString from './LargeString';
export default {
  name: "TxDetailComponent",
  components:{LargeString, },
  props: {
    detailInfo:{
      type: Array,
      required:true,
    },
    isShowFee:{
      type: Boolean,
      default: false
    }
  },
  data(){
    return {
      LargeStringMinHeight: 100,
      LargeStringLineHeight: 20,
      Tools,

    }
  },
  methods:{
    judgeCosmos(addr){
      if(typeof addr !== 'string'){
        return false
      }
			return addr.startsWith(COSMOS_ADDRESS_PREFIX)
		},
    formatValue(val){
      if(val || val === 0 || typeof val ==='boolean'){
        return val
      }else if(!val){
        return '--'
      }
    },
    startStr(url){
			return url.startsWith('www.')
		},

  }
}
</script>
<style scoped lang="scss">
	p {
			display: flex;
			margin-bottom: 0.26rem;

			span:nth-of-type(1) {
				margin-right: 0.15rem;
				color: $t_second_c;
				// min-width: 1.52rem;
				min-width: 1.64rem;
				text-align: left;
				font-size: $s14;
				font-weight: 600;
			}

			span:nth-of-type(2) {
				text-align: left;
				font-size: $s14;
				color: $t_first_c;
				word-break: break-all;
				line-height: 0.20rem;
			}
			.wrap {
				.text {
					flex: 1;
					text-align: left;
					font-size: $s14;
					color: $t_first_c;
					word-break: break-all;
					line-height: 0.20rem;
					font-weight: normal;
				}
        a.text{
          color: $t_link_c;
        }
			}
			a{
				word-break: break-all;
	  	  color: $t_link_c;
			}
		}

  p:last-child {
    margin-bottom: 0;
  }
  .verticalShow{
    display: flex;
    flex-direction: column;
  }
</style>