<template>
    <span :class="`tx_message_content_largeStr ${mode=='cell'?'flex-row':'flex-colum'}`">
       
        <div v-if="isLarge" ref="text" :style="`width:${textWidth || 'auto'}`">
            <div v-for="(item,index) in text" :key="index" class="mb-10">
                <a :href="item" target="_blank" class="address_link">{{item}}</a>
            </div>
        </div>
        <div v-else class="text" :class=" !showDesc ? 'width': ''" :style="`width:${textWidth || 'auto'}`">
            <div v-for="(item,index) in text_f" :key="index" class="mb-10">
                <a :href="item" target="_blank" class="address_link">{{item}}</a>
            </div>
        </div>
     
        <template>
            <span class="tx_message_content_largeStr_btn" v-if="showDescBtn(text)" @click="btnDidClick">
                {{`${showDesc ? $t('ExplorerLang.common.fewer') : $t('ExplorerLang.common.more')}`}}
            </span>
            <span class="tx_message_content_largeStr_btn" v-if="isLarge && mode=='cell'" @click="btnDidClick">
                {{$t('ExplorerLang.common.fewer')}}
            </span>
        </template>
    </span>
</template>

<script>
    export default {
        name : "MultiLink",
        components : {},
        props:{
            text:{
                type:Array,
                required:true,
            },
            maxLength:{
                type:Number,
                required:false,
                default:10,
            },
            mode:{//nomal or cell
                type:String,
                required:false,
                default:'nomal'
            },
            textWidth:{
                type:String,
                required:false,
                default:''
            },
            minHeight:{
                type:Number,
                required:false,
                default: 0
            },
            lineHeight:{
                type:Number,
                default: 0
            },
            expand:{
                type:Boolean,
                required:false
            }
        },
        data(){
            return {
                showDesc:false,
                isLarge:false,//todo  what 
            }
        },
        computed:{
            text_f(){
                return this.showDesc ? this.text : this.formatMultiList(this.text);
            }
        },
        mounted(){
            setTimeout( () => {
                    this.$nextTick(()=>{
                    let height = this.$refs.text.offsetHeight;
                    if(this.expand){
                        this.showDesc = true;
                    }else{
                        this.showDesc = height <= this.minHeight
                    }
                })
            },0)
        },
        methods : {
            btnDidClick(){
                this.showDesc = !this.showDesc;
            },
            formatMultiList(list, length){
                length = length || this.maxLength;
                if (list && list.length >= this.maxLength) {
                    return list.slice(0,1);
                }
                return list || '';
            },
            showDescBtn(list){
                return list && list.length >= this.maxLength;
            }
        }
    }
</script>

<style scoped lang="scss">
    .tx_message_content_largeStr{
        font-size: $s14;
        font-weight: 400;
        color: $t_first_c;
        word-break: break-all;
        min-width: 0;
        .text {
            overflow-y: auto;
            max-height: 2rem;
        }
        .text::-webkit-scrollbar{
            width: 10px;
            height: 10px;
            border-radius: 10px;
        }
        .text::-webkit-scrollbar-thumb{
            background-color: #C4C5C7;
            border-radius: 10px;
        }
        .width {
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
        }
    }
    .flex-row{
        display:flex;
        flex:1;
    }
    .flex-colum{
        display:flex;
        flex:1;
        flex-direction:column;
    }
    .tx_message_content_largeStr_btn{
            cursor:pointer;
            color:$t_link_c;
            align-self:flex-end;
            font-size: $s14;
            font-weight: 400;
            margin-left: 0rem;
            white-space: nowrap;
    }
    .text.width {
        text-indent: 0;
    }
    pre.text {
        // text-indent: -3em
    }
    pre {
        // overflow-x: hidden;
    }
    .mb-10{
        margin-bottom:0.05rem;
    }
</style>
