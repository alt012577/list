axios.defaults.baseURL = "http://testhangzhouapi.yiganzi.cn/"
const appId = "mBetaAPPAndroid01"
var vm = new Vue({
	el: "#app",
	data: {
		list: [],
		num: 1,
		bignum: 0,
		showlebal: true,
		nomoremsg: false,
		getmore: false,
		// 删除提示的显示与否
		delseccess: false,
		// 删除提示框 的 定时器
		delsecctime: 0,
		// 删除信息
		delobj: {},
		// 详情
		deteldom: false,
		// 编辑标题
		edittitle: '公元名家',
		// 编辑页面
		editeldom: false,
		// 删除提示框
		deleldom: false,
		// 删除index
		delindex: -1,
		// 保修类型
		retype: "",
		// 故障描述
		upmsg: "",
		// 用户手机号码
		phonenum: "",
		// 用户名
		username: "",
		// 提交成功信息
		sunlebal: "",
		//判断是否为修改
		changing: 0,
		// 报修申请ID
		repairApplyID: ''
	},
	created() {
		this.getlist(this.num)
		this.gettype()
	},
	methods:{
		getlist(num) {
			let _this = this
			let thedata = {
				appid: appId,
				memberGUID: "4E680931-9A25-468D-8141-708FFC342CE7",
				houseDetailID: 83,
				pageSize: 10, 
				goPage: num,
				issuc: true
			}
			
			axios.post(
				"estate.ashx?action=GetOwnerRepairApplyList",
				datastr(thedata)
			).then(res=>{
				console.log("list",res)
				let data = typeof(res) == "string" ? JSON.parse(res) : res
				_this.list = _this.list.concat(res.data.result.retTable)
				_this.issuc = true
				_this.showlebal = false
				_this.getmore = false
				if( _this.num == 1 ){
					_this.bignum = Math.ceil((res.data.result.rowCount)/(res.data.result.pageSize))
				}
				if( _this.num == _this.bignum ){
					_this.nomoremsg = true
				}
				_this.num++
			})
		},
		getmorelist() {
			let el = document.getElementsByClassName("thelist")
			let elbody = document.getElementsByClassName("listbody")
			if( el[0].offsetHeight - elbody[0].scrollTop - 5 < elbody[0].offsetHeight ){
				if( this.num > this.bignum ){
					this.getmore = false
				}else{
					this.getmore = true
					elbody[0].scrollTop = el[0].offsetHeight - elbody[0].offsetHeight + 40
				}
			}
			if( el[0].offsetHeight - elbody[0].scrollTop - 100 < elbody[0].offsetHeight ){
				if( this.issuc == true ){
					this.issuc = false
					if( this.num <= this.bignum ){
						let _this = this
							_this.getlist(_this.num)
					}
				}
			}
		},
		
		// 删除列表
		delitem(id,index){
			this.deleldom = true
			this.delobj = {}
			this.delindex = index
			let data = {
				appid: appId,
				repairApplyID: id,
				memberGUID: "4E680931-9A25-468D-8141-708FFC342CE7"
			}
			Object.assign(this.delobj,data)
		},
		// 确定删除
		delsure(){
			let _this = this
			axios.post(
				"estate.ashx?action=DelRepairApply",
				datastr(_this.delobj)
			).then(data=>{
				console.log("删除成功返回数据",data)
				// 先清理定时器
				clearTimeout(_this.delsecctime)
				// 删除列表中的 index 项
				_this.list.splice(_this.delindex,1)
				// 显示提示框
				_this.delseccess = true
				// 将返回信息填写到提示框
				document.getElementsByClassName("delseccess")[0].innerText = data.data.errmsg
				// 1500s 删除提示框消失
				_this.delsecctime = setTimeout(()=>{
					_this.delseccess = false
				},1500)
			})
			_this.deleldom = false
		},
		// 详情页
		detailitem(item){
			this.deteldom = true
			let data = {
				appid: appId,
				repairApplyID: item.repairApplyID
			}
			axios.post(
				"estate.ashx?action=GetRepairApplyModel",
				datastr(data)
			).then(data=>{
				console.log(data)
				let l = data.data.result
				let str = `
							<p><span>故障描述：</span>${l.faultDes}</p>
							<p><span>创建时间：</span>${l.createTime}</p>
							<p><span>完成时间：</span>${l.finishTime}</p>
							<p><span>楼盘明细ID：</span>${l.houseDetailID}</p>
							<p><span>楼盘明细名称：</span>${l.houseDetailName}</p>
							<p><span>联系姓名：</span>${l.linkName}</p>
							<p><span>接单时间：</span>${l.orderTime}</p>
							<p><span>联系电话：</span>${l.linkPhone}</p>
							<p><span>报修状态描述：</span>${l.repairStateDes}</p>
							<p><span>报修类型名称：</span>${l.repairTypeName}</p>
						  `
				document.getElementsByClassName("delellist")[0].innerHTML = str
			})
		},
		
		// 编辑页面
		submsg(){
			this.checkmsg()
		},
		// 获取 typeid
		gettype(){
			let _this = this
			let data = {
				appid: appId,
				memberGUID: '4E680931-9A25-468D-8141-708FFC342CE7',
				houseDetailID: 83
			}
			axios.post(
				"estate.ashx?action=GetRepairTypeList",
				datastr(data)
			).then(data=>{
				// console.log(data)
				// console.log("789",data.data.result[0].repairTypeID)
				_this.retype = data.data.result[0].repairTypeID
			})
		},
		// 清除填写的信息
		clearmsg(){
			let _this = this
			this.retype = ""
			this.upmsg = ""
			this.phonenum = ""
			this.username = ""
			setTimeout(()=>{
				_this.sunlebal = ""
			},789)
		},
		// 添加保修申请
		addsub(){
			let _this = this
			let data = {
				appid: appId,
				memberGUID: "4E680931-9A25-468D-8141-708FFC342CE7",
				houseDetailID: 83,
				faultPic: "",
				repairTypeID: _this.retype,
				faultDes: _this.upmsg,
				linkPhone: _this.phonenum,
				linkName: _this.username
			}
			axios.post(
				"estate.ashx?action=AddRepairApply",
				datastr(data)
			).then(data=>{
				console.log("添加申请",data)
				let num = data.data.result.repairState
				if ( num == 10370 ){
					_this.sunlebal = "派单中"
				}else if( num == 10371 ){
					_this.sunlebal = "已接单"
				}else if( num == 10372 ){
					_this.sunlebal = "待评价"
				}else if( num == 10373 ){
					_this.sunlebal = "已完成"
				}else if( num == 10374 ){
					_this.sunlebal = "待付款"
				}
				_this.clearmsg()
			})
		},
		// 修改信息
		changemsg(item){
			console.log(item)
			this.editeldom= true
			this.retype = item.repairTypeID
			this.upmsg = item.faultDes
			this.phonenum = item.repairmanPhone
			this.username = item.repairmanName
			this.changing = 1
			this.repairApplyID = item.repairApplyID
		},
		changesub(){
			let _this = this
			let data = {
				appid: appId,
				memberGUID: "4E680931-9A25-468D-8141-708FFC342CE7",
				repairApplyID: this.repairApplyID,
				houseDetailID: 83,
				faultPic: "",
				repairTypeID: _this.retype,
				faultDes: _this.upmsg,
				linkPhone: _this.phonenum,
				linkName: _this.username
			}
			axios.post(
				"estate.ashx?action=UpdateRepairApply",
				datastr(data)
			).then(data=>{
				console.log("修改信息",data)
				let num = data.data.result.repairState
				if ( num == 10370 ){
					_this.sunlebal = "派单中"
				}else if( num == 10371 ){
					_this.sunlebal = "已接单"
				}else if( num == 10372 ){
					_this.sunlebal = "待评价"
				}else if( num == 10373 ){
					_this.sunlebal = "已完成"
				}else if( num == 10374 ){
					_this.sunlebal = "待付款"
				}
				_this.clearmsg()
			})
		},
		// 检查数据填写
		checkmsg(){
			let _this = this
			this.phonenum = this.phonenum.replace(/[^\d]/g,'')
			if( _this.upmsg == "" ){
					_this.sunlebal = "请填写故障描述"
			}else if( _this.phonenum == "" ){
					_this.sunlebal = "请填写手机号码"
			}else if( _this.phonenum != 11 ){
					_this.sunlebal = "请填写正确的手机号码"
			}else if( _this.username == "" ){
					_this.sunlebal = "请填写姓名"
			}else{
				if( _this.changing == 0 ){
					this.addsub()
				}else{
					this.changesub()
				}
			}
		}
	}
})
		