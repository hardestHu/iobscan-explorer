import Vue from 'vue';
import Router from 'vue-router';
Vue.use(Router);

const router = new Router({
	routes:[

		// { 
		//   path: "/",
		//   redirect: '/tx'
		// },
		{ 
		  path: "/tx",
		  beforeEnter: (to, from) => {
			let url = `https://www.mintscan.io/cosmos/txs/${to.query.txHash || ''}`;
			window.location.href = url;
		  },
		},
		{
			path:'*',
			beforeEnter:(to,from) => {
				let url = 'https://www.mintscan.io/cosmos'
				window.location.href = url;
			}
		}
	]
})
export default router
