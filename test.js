const cheerio = require('cheerio')
const request = require('superagent'); // 引入SuperAgent
require('superagent-charset')(request)
const fs = require('fs-extra')
const resourceDir = __dirname + '/resources'

let urlArr1 = []
let urlArr = []


let txt = ""


for (let i = 1; i < 42; i++) {
	urlArr1.push('http://www.sdf999.com/huiyuan/minglu/list_46_' + i + '.html')
}


get_req(urlArr1, {
	index: 0
}, (err, data) => {
	if (err) {
		console.log(err)
	} else {
		let body = data.text;
		const $ = cheerio.load(body)
		$(".liebiaoye li > a").each(function(index, el) {
			console.log($(el).attr('href'))
			urlArr.push($(el).attr('href'))
		});
	}
}, () => {
		get_req(urlArr, {index:0}, (err, data) => {
			let body = data.text;
			const $ = cheerio.load(body, {
				decodeEntities: false
			})
			let content = $(".neirong")
			let na = content.find('h3').html()
			content.find('h3').remove()
			content.find('.info').remove()
				// content.find('br').remove()
			let ct = content.text()
			txt += ct

		},()=>{
			console.log("完成!")
			fs.outputFile(resourceDir + '/' + 'list.txt', txt).then(() => {
				console.log("ok")
			}).catch((err) => {
				console.log(err)
			})
		})
})



// 线性递归请求
// urlArr - 请求url数组
// data - 传参
// callback - 完成一次后的回调
// end - 全部完成后的回调
function get_req(urlArr, data, callback, end) {
	console.log(data.index)
	console.log(urlArr.length)
	if (data.index === urlArr.length) {
		console.log("完成")
		end()
		return
	}
	if (!urlArr[data.index]) {
		return
	}
	request // 发起请求
		.get(urlArr[data.index])
		.set('User-Agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36')
		.timeout({
			response: 5000, // Wait 5 seconds for the server to start sending,
			deadline: 20000, // but allow 1 minute for the file to finish loading.
		})
		.charset('gbk')
		.end((err, respons) => {
			if (err) {
				if (!data.count) {
					data.count = 1
				} else {
					data.count++;
				}
				if (data.count < 3) {
					get_req(urlArr, data, callback, end)
				} else {
					console.log(url + '出错3次仍然失败----------------------->')
						// console.log(err)
					data.index++
						callback(err, null)
				}
			} else {
				data.index++
					callback(null, respons)
				get_req(urlArr, data, callback, end)
			}
		})
}