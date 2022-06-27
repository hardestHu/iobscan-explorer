import axios from 'axios'
import {errorCode,networkStatus} from "@/service/apiCode";

const service = axios.create({
	baseUrl: '',
	timeout: 40000
})
service.interceptors.response.use(
	(response) => {
		if(response.status === networkStatus){
			//根据返回的状态码不同，进行数据处理的设置
			return Promise.resolve(response.data);
		}else {
			// return Promise.resolve([])
		}
	},
	(error) => {
		if(error.response.status === errorCode){
			return Promise.resolve({
				code: errorCode
			})
		}else {
			return Promise.reject(error)
		}
	}
)
export default service
