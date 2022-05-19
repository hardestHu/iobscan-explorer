/*模块功能映射id{
    "100":"区块浏览",
    "101":"交易浏览",
    "102":"共识节点",
    "103":"数据对象",
    "104":"数据类别",
    "105":"服务浏览",
    "106":"身份ID",
    "107":"Validators",
    "108":"Delegation Txs",
    "109":"Validation Txs",
    "110":"Native Asset",
    "111":"Native Asset Txs",
    "112":"Proposals",
    "113":"Gov Txs",
    "114":"IRIS Rich List",
    "115":"IRIS Stats",
    "1000":"搜索"(排在末尾)
    "1001":"网络切换"(排在末尾)}*/

/*首页指标映射id{
    "200":"最新区块"(排在首位),
    "201":"交易数量",
    "202":"共识节点数",
    "203":"平均出块时间",
    "204":"数据对象数量",
    "205":"数据类别数量",
    "206":"服务数量",
    "207":"身份ID数量",
    "208":"验证人数量",
    "209":"质押率"
  }
*/

/*产品
  Bifrost,STARGATE,Cosmos Hub,NYANCAT,IRISHUB
*/

let config = {
  //国际化 CN / EN 默认CN
  lang:'CN',
  //浏览器标签标题 必填
  title:'SpiritsChain 酒链浏览器',
  //主题色 作用于非直接干预的文字、背景、边框颜色(如输入框边框高亮、首页卡片图标等) 优先级较低
  themeColor:'#DBB44F',
  //通用背景色
  background: '#F8F8F8',
   //日期组件开始时间：设置可选择最早开始时间
  firstBlockTimestamp:1612072898000,
  //列表斑马纹的颜色
  tableTrColor: '#FEFDF9',
  tableTrHoverColor: '#FCF9F1',
  logo:{
      //logo标题 必填
      title:'酒链浏览器',
      //logo副标题
      subTitle:'',
  },
  product:'spiritschain',
  nav:{
      //nav导航文字颜色
      color:'',
      //nav导航文字高亮颜色
      activeTextColor:'',
      //nav背景颜色 上半部分
      bgColor:'#332A12'
  },
  footer:{
      //页脚文字背景颜色
      color:'',
      //页脚背景颜色 上半部分
      bgColor_top:'',
      //页脚背景颜色 下半部分  
      bgColor_bottom:'',
      //页脚版权信息   必填
      copyright:'Copyright © 2022 北京酒域灵境科技有限公司. All Rights Reserved.',
      chainIdShow: true,
      versionShow: true,
      //页脚右侧是否显示跳转链接
      linkShow: false
  },
  //导航栏功能列表 详见 导航栏功能映射 注：title为配置文案暂不支持国际化
  navFuncList:[
    {title:'区块浏览',id:'100'},
    {title:'交易浏览',id:'101'},
    {
     title: '数字藏品',
     children: [
      { title: '数字藏品', id: '103' },
      { title: '藏品类别', id: '104' }
     ]
    },
    {title:'共识节点',id:'102'},
    "1000",
  ],
  //首页卡片配置
  homeCard:[200,201,203,204,205] ,
  text:{
      //预设字体颜色
      color:{
          //一级文字色
          first: '',
          //二级文字色
          second: '',
          //三级文字色
          third: '',
          //四级文字色
          fourth: '',
          //链接文字色
          link: '#DBB44F',
      }
  },
  button:{
      //预设按钮字体颜色
      color:{
          common:'#fff',
      },
      //预设按钮背景颜色
      bgColor:{
          common:'#5953FF',
      }
  },
  // el-tag 背景色
  tagBackground:'#FCF3DC',
  // 区块列表页面是否显示 Proposer
  blockList: {
      proposer: false,
  },
  // 切换交易
  txDetail: {
      ibc: true // 交易是否切换成联盟链IBC交易
  },
  // 控制表格中列的显示和隐藏
  table: {
      votingPower: true // Validator List中Voting_Power是否显示 
  },
  utcOffset: '+8', // 页面转换时区,默认值为 +0
  isShowUTC: false, // 是否显示时区,默认值为true
  fee: {
    isShowFee: false, // 是否展示fee
    isShowDenom: false, //列表中fee是否展示单位
    decimals: 0// 列表中fee展示的数值精度
  },
  token:{
    // main token
    symbol:'iris',
    decimal: 6,
  },
   umeng: {
        umengId: 1279754478,
        umengWebId: 1279754478
    }
  
}
  
  module.exports = config;
  