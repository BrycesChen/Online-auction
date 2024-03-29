import * as express from "express"
import * as path from "path";
import {Server} from "ws";

const app = express();

export class Product {
    constructor(
        public id:number,
        public title:string,
        public price:number,
        public rating:number,
        public desc:string,
        public categories:Array<string>
    ) {

    }
}
const products: Product[] = [
    new Product(1,"第一个商品",1.99,3.5,"第一个商品的描述",["电子产品","硬件设备"]),
    new Product(2,"第二个商品",2.99,2.5,"第二个商品的描述",["硬件设备"]),
    new Product(3,"第三个商品",3.99,3.5,"第三个商品的描述",["图书","硬件设备"]),
    new Product(4,"第四个商品",4.99,4.5,"第四个商品的描述",["生活用品","硬件设备"]),
    new Product(5,"第五个商品",5.99,1.5,"第五个商品的描述",["娱乐设备","食品"]),
    new Product(6,"第六个商品",6.99,3.5,"第六个商品的描述",["床上用品","日用厨具"])
];
export class Comment {
    constructor(
        public id: number,
        public productId: number,
        public timestamp: string,
        public user: string,
        public rating: number,
        public content: string
    ) {}
}


const comments: Comment[] =[
    new Comment(1, 1, "2019-03-27 11:50:55","Bryce1", 3, "东西很不错"),
    new Comment(2, 1, "2019-03-26 10:51:54","Bryce2", 3.5, "东西不错"),
    new Comment(3, 1, "2019-03-25 09:52:53","Bryce3", 2, "东西还可以"),
    new Comment(4, 2, "2019-03-24 08:53:52","Bryce4", 4, "东西超级不错"),
    new Comment(5, 2, "2019-03-22 07:54:51","Bryce5", 4.5, "东西好好用"),
]

app.use('/', express.static(path.join(__dirname, '..', 'client')))

app.get('/api/products',function(req, res) {
    var result = products;
    var params = req.query;
    console.log(params);
    if (params.title) {
        result = result.filter(function(p) {
            return p.title.indexOf(params.title) != -1;
        })
    }

    if (params.price && result.length > 0) {
        result = result.filter(function(p) {
            return p.price <= params.price;
        })
    }

    if (params.category && params.category != '-1' && result.length > 0) {
        result = result.filter(function(p) {
            console.log(p.categories);
            console.log(params.category);
            return p.categories.indexOf(params.category) != -1;
        })
    }

    res.json(result);
})

app.get('/api/product/:id', (req, res) => {
    res.json(products.find((product) => product.id == req.params.id));
})

app.get('/api/product/:id/comments', (req, res) => {
    res.json(comments.filter((comment: Comment) => comment.productId == req.params.id));
})

const server = app.listen(8000, "localhost", () => {
    console.log("服务器已启动， 地址是：http://localhost:8000")
})

const subscriptions = new Map<any, number[]>()
const wsServer = new Server({port: 8085});
wsServer.on('connection', (websocket) => {
    websocket.on('message', (message) => {
        // 当客户端有信息传递时，即服务器端接收，由于这个客户端传递个是JSON.stringify({productId:id});所以在接到数据时，使用
        // JSON.parse(message);
        let messageObj = JSON.parse(message);
        // key值是连接到服务端的客户端，当subscripitons.get(websocket)的值为undefined，则赋值为空数组;
        let productIds = subscriptions.get(websocket) || [];
        // 将新的商品的Id放到值的数组中;将已有的和新建的id组合在一起;
        subscriptions.set(websocket, [...productIds, messageObj.productId]); // [...productIds]: 扩展运算符
    })
})

const currentBids = new Map<number,number>()

setInterval(function() {
    // 随机生成每个商品的最新的商品的价格
    products.forEach((product) => {
        let currentBid = currentBids.get(product.id) || product.price;
        let newBid = currentBid + Math.random() * 5;
        currentBids.set(product.id, newBid);
    })
    // 循环每一个客户端, 推送每一个客户端关注的商品的价格
    subscriptions.forEach((productIds: number[], ws) => {
        // 返回的数据的格式是：[{productId:xxx,bid: xxx},{},{}],对应是每个被关注的商品的最新的报价
        // *** 防止页面刷新报错;
        if (ws.readyState === 1) {
            //    通过映射将pid组成{productId: pid, bid: currentBid.get(pid)}
            let newBids = productIds.map(pid => ({
                productId: pid,
                bid: currentBids.get(pid)
            }));
            // 发送的数据
            ws.send(JSON.stringify(newBids));
        } else {
            subscriptions.delete(ws); // 删除已经关闭的客户端
        }
        // 这之后，然后在客户端订阅这个流;
    });
}, 2000);






